"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, CheckCircle, AlertCircle, X, Eye, EyeOff, Clock } from "lucide-react"
import { toast } from "react-hot-toast"
import SafeImage from "@/components/common/SafeImage"

interface INEUploadFormProps {
  propertyId?: string
  onComplete?: () => void
  onCancel?: () => void
  mode?: 'verification' | 'property'
}

export default function INEUploadForm({ propertyId, onComplete, onCancel, mode = 'verification' }: INEUploadFormProps) {
  const [frontSideUploaded, setFrontSideUploaded] = useState(false)
  const [backSideUploaded, setBackSideUploaded] = useState(false)
  const [frontSideUrl, setFrontSideUrl] = useState<string>()
  const [backSideUrl, setBackSideUrl] = useState<string>()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [dataAccepted, setDataAccepted] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [showTerms, setShowTerms] = useState(false)
  const [showDataPolicy, setShowDataPolicy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasExistingINE, setHasExistingINE] = useState(false)
  const [ineStatus, setIneStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Verificar si ya existe un INE al cargar el componente
  useEffect(() => {
    const checkExistingINE = async () => {
      try {
        const response = await fetch('/api/user/verify-ine')
        if (response.ok) {
          const data = await response.json()
          
          // Si tiene INE (PENDING o APPROVED), mostrar estado
          if (data.hasSubmittedINE) {
            setHasExistingINE(true)
            setIneStatus(data.document?.status || 'PENDING')
          } else {
            // No hay INE, pero verificar si fue RECHAZADO antes
            // Intentar buscar rechazados (aunque GET no lo retorna, lo detectamos)
            setHasExistingINE(false)
            setIneStatus(null)
          }
        }
      } catch (error) {
        console.error('Error checking INE status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkExistingINE()
  }, [])

  // 🔴 NUEVO: Escuchar cambios de estado del INE en tiempo real via SSE
  useEffect(() => {
    if (typeof window === 'undefined') return

    const eventSource = new EventSource('/api/events/ine-status')

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        // Ignorar heartbeat
        if (data.type === 'connected') {
          console.log('✅ Conectado a eventos de estado INE')
          return
        }

        // Cuando el estado cambié (aprobado/rechazado)
        if (data.type === 'ineStatusUpdate') {
          console.log('📢 Estado del INE actualizado:', data.status)
          setIneStatus(data.status)
          
          // Si fue aprobado, mostrar estado
          if (data.status === 'APPROVED') {
            setHasExistingINE(true)
            toast.success('¡Tu INE ha sido aprobado! 🎉')
          }
          // Si fue rechazado, mostrar para re-envío
          if (data.status === 'REJECTED') {
            setHasExistingINE(true)
            toast.error('Tu INE fue rechazado. Por favor, intenta nuevamente.')
          }
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.addEventListener('message', handleMessage)
    eventSource.addEventListener('error', () => {
      console.error('SSE connection error')
      eventSource.close()
    })

    return () => {
      eventSource.close()
    }
  }, [])

  const isComplete = frontSideUploaded && backSideUploaded && termsAccepted && dataAccepted

  const handleFileUpload = async (side: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(side)
    try {
      const file = files[0]

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPG, PNG, GIF)')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 5MB')
        return
      }

      // Convertir a base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        if (result) {
          if (side === 'front') {
            setFrontSideUrl(result)
            setFrontSideUploaded(true)
            toast.success('Frente del INE cargado correctamente')
          } else {
            setBackSideUrl(result)
            setBackSideUploaded(true)
            toast.success('Dorso del INE cargado correctamente')
          }

          // Si tiene propertyId, guardar en la BD
          if (propertyId) {
            try {
              const response = await fetch(`/api/properties/${propertyId}/documents`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  documentType: 'ine',
                  documentUrl: result,
                  side: side,
                  uploaded: true
                }),
              })

              if (!response.ok) {
                throw new Error('Error al guardar el documento')
              }
            } catch (error) {
              toast.error('Error al guardar el documento en la base de datos')
            }
          }
        }
      }
      reader.onerror = () => {
        toast.error('Error al procesar la imagen')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(null)
      event.target.value = ''
    }
  }

  const removeSide = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontSideUrl(undefined)
      setFrontSideUploaded(false)
    } else {
      setBackSideUrl(undefined)
      setBackSideUploaded(false)
    }
  }

  const handleComplete = async () => {
    if (!isComplete) {
      toast.error('Por favor completa todos los pasos')
      return
    }

    // Si no tiene propertyId, hacer llamada a API para verificar INE
    if (!propertyId) {
      setSubmitting(true)
      try {
        const response = await fetch('/api/user/verify-ine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            frontSideUrl: frontSideUrl,
            backSideUrl: backSideUrl,
            termsAccepted,
            dataAccepted
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || error.message || 'Error al verificar INE')
          return
        }

        toast.success('INE enviado para verificación. Recibirás una notificación cuando se complete.')
        
        // Actualizar el estado para mostrar que ya existe
        setHasExistingINE(true)
        setIneStatus('PENDING')
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al enviar INE para verificación')
        return
      } finally {
        setSubmitting(false)
      }
    }

    if (onComplete) {
      onComplete()
    }
  }

  // Si está cargando, mostrar estado de carga
  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin mb-4">
              <CheckCircle className="w-8 h-8 mx-auto text-blue-500" />
            </div>
            <p className="text-gray-600">Verificando estado de tu INE...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si ya existe un INE, mostrar su estado
  if (hasExistingINE) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {ineStatus === 'APPROVED' && (
          <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-green-800 text-2xl">
                <div className="flex items-center justify-center w-12 h-12 bg-green-200 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <span>¡Identidad Verificada!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-green-800 font-semibold mb-2">✓ Estado: APROBADO</p>
                <p className="text-green-700">
                  Tu documento de identidad ha sido verificado exitosamente por nuestro equipo. Ahora tienes acceso completo a todas las funcionalidades de la plataforma.
                </p>
              </div>
              
              <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
                <p className="text-green-800 text-sm"><strong>✓ Puedes:</strong></p>
                <ul className="text-green-700 text-sm space-y-1 mt-2">
                  <li>• Crear y publicar propiedades</li>
                  <li>• Recibir ofertas de compradores</li>
                  <li>• Programar citas de visitas</li>
                  <li>• Negociar precios</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {ineStatus === 'PENDING' && (
          <Card className="border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-yellow-800 text-2xl">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-200 rounded-full animate-pulse">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <span>INE En Revisión</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <p className="text-yellow-800 font-semibold mb-2">⏳ Estado: PENDIENTE DE VERIFICACIÓN</p>
                <p className="text-yellow-700">
                  Tu documento ha sido recibido correctamente. Nuestro equipo de verificación está revisando tu INE en este momento.
                </p>
              </div>
              
              <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded space-y-2">
                <p className="text-yellow-800 text-sm font-semibold">📋 Detalles del proceso:</p>
                <div className="space-y-2 text-sm text-yellow-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span><strong>Tiempo estimado:</strong> 24 horas máximo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span><strong>Notificación:</strong> Recibirás un email cuando se complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span><strong>Revisión:</strong> Personal calificado verifica la autenticidad</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Consejo:</strong> Mientras esperas, puedes completar tu perfil y ver propiedades, pero no podrás publicar propiedades hasta que se complete la verificación.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {ineStatus === 'REJECTED' && (
          <Card className="border-4 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-red-800 text-2xl">
                <div className="flex items-center justify-center w-12 h-12 bg-red-200 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <span>Documento Rechazado</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-red-800 font-semibold mb-2">❌ Estado: RECHAZADO</p>
                <p className="text-red-700">
                  Desafortunadamente, tu documento no pudo ser verificado en esta ocasión. Esto puede suceder por varias razones.
                </p>
              </div>

              <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded space-y-2">
                <p className="text-red-800 text-sm font-semibold">🔍 Razones comunes de rechazo:</p>
                <ul className="text-red-700 text-sm space-y-1 mt-2">
                  <li>• Imágenes borrosas o de baja calidad</li>
                  <li>• Documento no completamente visible</li>
                  <li>• Reflejos o brillos que oculten información</li>
                  <li>• Datos ilegibles o cortados</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-3">
                <p className="text-blue-800 text-sm font-semibold">💡 Recomendaciones:</p>
                <ul className="text-blue-700 text-sm space-y-2">
                  <li>✓ Usa buena iluminación natural (sin flash)</li>
                  <li>✓ Mantén el documento paralelo a la cámara</li>
                  <li>✓ Asegúrate de que TODO sea visible y nítido</li>
                  <li>✓ Limpia la lente de tu cámara</li>
                  <li>✓ Toma varias fotos y elige la mejor</li>
                </ul>
              </div>

              <Button 
                onClick={() => {
                  setHasExistingINE(false)
                  setIneStatus(null)
                  setFrontSideUploaded(false)
                  setBackSideUploaded(false)
                  setFrontSideUrl(undefined)
                  setBackSideUrl(undefined)
                }} 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-base gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                Enviar Nuevamente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Instrucciones iniciales */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            Carga tu INE para {mode === 'verification' ? 'verificar tu identidad' : 'activar esta propiedad'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-blue-700">
              <strong>Se requieren ambos lados del documento:</strong> frente y dorso
            </p>

            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                📸 Consejos para tomar buenas fotos
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Iluminación natural o buena luz - sin sombras ni reflejos</li>
                <li>• Evita usar flash - puede causar brillos en el documento</li>
                <li>• Mantén la cámara paralela al documento (sin ángulos)</li>
                <li>• Asegúrate de que TODO el documento sea visible y nítido</li>
                <li>• La foto debe ser legible - el texto debe verse claro</li>
                <li>• Si usas celular, limpia la lente antes de fotografiar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frente del INE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Frente del INE</span>
            {frontSideUploaded && <CheckCircle className="w-5 h-5 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {frontSideUrl ? (
            <div className="space-y-4">
              <div className="relative border-2 border-blue-200 rounded-lg overflow-hidden">
                <SafeImage
                  src={frontSideUrl}
                  alt="Frente del INE"
                  className="w-full h-auto max-h-80 object-cover"
                />
              </div>
              <Button
                onClick={() => removeSide('front')}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Cambiar foto
              </Button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Sube la foto del frente del INE
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG o GIF - Máximo 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => handleFileUpload('front', e)}
                disabled={uploading === 'front'}
                className="hidden"
              />
            </label>
          )}
          {uploading === 'front' && (
            <div className="text-center text-sm text-gray-600">
              Subiendo imagen...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dorso del INE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Dorso del INE</span>
            {backSideUploaded && <CheckCircle className="w-5 h-5 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {backSideUrl ? (
            <div className="space-y-4">
              <div className="relative border-2 border-blue-200 rounded-lg overflow-hidden">
                <SafeImage
                  src={backSideUrl}
                  alt="Dorso del INE"
                  className="w-full h-auto max-h-80 object-cover"
                />
              </div>
              <Button
                onClick={() => removeSide('back')}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Cambiar foto
              </Button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Sube la foto del dorso del INE
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG o GIF - Máximo 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => handleFileUpload('back', e)}
                disabled={uploading === 'back'}
                className="hidden"
              />
            </label>
          )}
          {uploading === 'back' && (
            <div className="text-center text-sm text-gray-600">
              Subiendo imagen...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Términos y condiciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confirmación Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Términos y Condiciones */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Acepto los Términos y Condiciones
                </label>
                <Button
                  onClick={() => setShowTerms(!showTerms)}
                  variant="link"
                  className="text-xs p-0 h-auto mt-1"
                >
                  {showTerms ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {showTerms ? 'Ocultar' : 'Ver términos completos'}
                </Button>
              </div>
            </div>

            {showTerms && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 max-h-48 overflow-y-auto">
                <h5 className="font-semibold mb-2">TÉRMINOS Y CONDICIONES</h5>
                <div className="space-y-2">
                  <p>
                    <strong>1. Verificación de Identidad</strong>
                    <br />
                    Confirmo que la información y documentos proporcionados son válidos y auténticos. Entiendo que proporcionar información falsa puede resultar en la suspensión o cancelación de mi cuenta.
                  </p>
                  <p>
                    <strong>2. Uso Autorizado</strong>
                    <br />
                    Utilizo este servicio solo para propósitos legales y legítimos. No usaré mi cuenta para actividades ilegales o fraudulentas.
                  </p>
                  <p>
                    <strong>3. Responsabilidad</strong>
                    <br />
                    Soy responsable de todas las acciones realizadas con mi cuenta. Me comprometo a mantener mi contraseña segura y confidencial.
                  </p>
                  <p>
                    <strong>4. Modificaciones</strong>
                    <br />
                    La plataforma se reserva el derecho de modificar estos términos en cualquier momento. El uso continuado implica aceptación de cambios.
                  </p>
                  <p>
                    <strong>5. Resolución de Disputas</strong>
                    <br />
                    Cualquier disputa será resuelta de acuerdo con las leyes aplicables de la jurisdicción correspondiente.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Política de Datos */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="data"
                checked={dataAccepted}
                onCheckedChange={(checked) => setDataAccepted(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="data" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Acepto la Política de Privacidad y Protección de Datos
                </label>
                <Button
                  onClick={() => setShowDataPolicy(!showDataPolicy)}
                  variant="link"
                  className="text-xs p-0 h-auto mt-1"
                >
                  {showDataPolicy ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {showDataPolicy ? 'Ocultar' : 'Ver política completa'}
                </Button>
              </div>
            </div>

            {showDataPolicy && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 max-h-48 overflow-y-auto">
                <h5 className="font-semibold mb-2">POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h5>
                <div className="space-y-2">
                  <p>
                    <strong>1. Información Recopilada</strong>
                    <br />
                    Recopilamos información personal incluyendo nombre, documento de identidad e imágenes de documentos para verificación de identidad y cumplimiento normativo.
                  </p>
                  <p>
                    <strong>2. Uso de Información</strong>
                    <br />
                    Tu información se utiliza únicamente para: verificación de identidad, prevención de fraude, cumplimiento legal y mejora de servicios.
                  </p>
                  <p>
                    <strong>3. Almacenamiento Seguro</strong>
                    <br />
                    Tus documentos se almacenan de manera segura y encriptada. Solo personal autorizado puede acceder a esta información.
                  </p>
                  <p>
                    <strong>4. Derechos del Usuario</strong>
                    <br />
                    Tienes derecho a acceder, corregir o solicitar la eliminación de tus datos personales en cualquier momento.
                  </p>
                  <p>
                    <strong>5. Compartición de Datos</strong>
                    <br />
                    No compartiremos tus datos personales con terceros sin tu consentimiento, excepto cuando lo requiera la ley.
                  </p>
                  <p>
                    <strong>6. Contacto</strong>
                    <br />
                    Para preguntas sobre privacidad, contáctanos en: privacidad@tuksaqro.com
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-3">
        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleComplete}
          disabled={!isComplete || submitting}
          className="flex-1"
          size="lg"
        >
          {submitting ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            mode === 'verification' ? 'Enviar INE para Verificación' : 'Guardar y Continuar'
          )}
        </Button>
      </div>

      {/* Resumen de progreso */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-sm text-gray-700">Progreso:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            {frontSideUploaded ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
            <span className={frontSideUploaded ? 'text-green-700' : 'text-gray-600'}>Frente del INE</span>
          </div>
          <div className="flex items-center gap-2">
            {backSideUploaded ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
            <span className={backSideUploaded ? 'text-green-700' : 'text-gray-600'}>Dorso del INE</span>
          </div>
          <div className="flex items-center gap-2">
            {termsAccepted ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
            <span className={termsAccepted ? 'text-green-700' : 'text-gray-600'}>Términos aceptados</span>
          </div>
          <div className="flex items-center gap-2">
            {dataAccepted ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
            <span className={dataAccepted ? 'text-green-700' : 'text-gray-600'}>Privacidad aceptada</span>
          </div>
        </div>
      </div>
    </div>
  )
}
