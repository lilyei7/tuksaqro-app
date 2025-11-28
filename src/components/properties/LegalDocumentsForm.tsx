"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { toast } from "react-hot-toast"
import SafeImage from "@/components/common/SafeImage"

interface LegalDocument {
  type: 'predial' | 'ine' | 'comprobante_domicilio'
  name: string
  required: boolean
  uploaded: boolean
  url?: string
  verified?: boolean
}

interface LegalDocumentsFormProps {
  propertyId: string
  initialDocuments?: {
    predialUploaded: boolean
    predialVerified: boolean
    predialUrl?: string
    ineUploaded: boolean
    ineVerified: boolean
    ineUrl?: string
    comprobanteDomicilioUploaded: boolean
    comprobanteDomicilioVerified: boolean
    comprobanteDomicilioUrl?: string
  }
  onDocumentsComplete?: () => void
  userHasVerifiedINE?: boolean // Nuevo parámetro para saber si el usuario ya tiene INE verificado
}

export default function LegalDocumentsForm({ propertyId, initialDocuments, onDocumentsComplete, userHasVerifiedINE = false }: LegalDocumentsFormProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>([
    {
      type: 'predial',
      name: 'Predial',
      required: true,
      uploaded: initialDocuments?.predialUploaded || false,
      verified: initialDocuments?.predialVerified || false,
      url: initialDocuments?.predialUrl
    },
    {
      type: 'ine',
      name: 'INE del Propietario',
      required: !userHasVerifiedINE, // Solo requerido si no tiene INE verificado
      uploaded: initialDocuments?.ineUploaded || false,
      verified: initialDocuments?.ineVerified || false,
      url: initialDocuments?.ineUrl
    },
    {
      type: 'comprobante_domicilio',
      name: 'Comprobante de Domicilio',
      required: true,
      uploaded: initialDocuments?.comprobanteDomicilioUploaded || false,
      verified: initialDocuments?.comprobanteDomicilioVerified || false,
      url: initialDocuments?.comprobanteDomicilioUrl
    }
  ])

  const [uploading, setUploading] = useState<string | null>(null)

  const handleFileUpload = async (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(documentType)
    try {
      const file = files[0]

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF o imágenes (JPG, PNG, GIF)')
        return
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 10MB')
        return
      }

      // Convertir a base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        if (result) {
      // Aquí iría la lógica para subir a un servidor/storage
      // Por ahora simulamos la subida y actualizamos la BD
      const response = await fetch(`/api/properties/${propertyId}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          documentUrl: result,
          uploaded: true
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar el documento')
      }

      setDocuments(prev => prev.map(doc =>
        doc.type === documentType
          ? { ...doc, uploaded: true, url: result, verified: false }
          : doc
      ))

      toast.success(`${documents.find(d => d.type === documentType)?.name} subido correctamente`)          // Verificar si todos los documentos requeridos están subidos
          const updatedDocs = documents.map(doc =>
            doc.type === documentType
              ? { ...doc, uploaded: true, url: result, verified: false }
              : doc
          )

          const allRequiredUploaded = updatedDocs
            .filter(doc => doc.required)
            .every(doc => doc.uploaded)

          if (allRequiredUploaded && onDocumentsComplete) {
            onDocumentsComplete()
          }
        }
      }
      reader.onerror = () => {
        toast.error('Error al procesar el archivo')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Error al subir el documento')
    } finally {
      setUploading(null)
      // Limpiar el input
      event.target.value = ''
    }
  }

  const removeDocument = (documentType: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.type === documentType
        ? { ...doc, uploaded: false, url: undefined, verified: false }
        : doc
    ))
  }

  const getDocumentStatus = (doc: LegalDocument) => {
    if (doc.verified) return { status: 'verified', label: 'Verificado', color: 'bg-green-100 text-green-800' }
    if (doc.uploaded) return { status: 'pending', label: 'Pendiente de verificación', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'missing', label: 'Falta subir', color: 'bg-red-100 text-red-800' }
  }

  const allRequiredUploaded = documents
    .filter(doc => doc.required)
    .every(doc => doc.uploaded)

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            Documentos Legales Requeridos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-orange-700">
              <strong>Importante:</strong> Para activar esta propiedad en el inventario público y poder firmar el contrato de intermediación,
              necesitas subir los siguientes documentos legales:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                💡 Consejos para tomar buenas fotos de tus documentos
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Toma las fotos en un lugar bien iluminado, sin sombras ni reflejos</li>
                <li>• Evita usar flash - puede causar brillos y hacer ilegible el texto</li>
                <li>• Mantén la cámara paralela al documento para evitar distorsiones</li>
                <li>• Asegúrate de que todo el documento quepa en la foto y sea nítido</li>
                <li>• Si usas tu celular, limpia la lente antes de fotografiar</li>
                <li>• Los documentos deben estar limpios y sin dobleces</li>
              </ul>
            </div>

            <div className="grid gap-4">
              {documents.map((doc) => {
                const status = getDocumentStatus(doc)
                return (
                  <div key={doc.type} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {doc.name}
                          {doc.type === 'ine' && !doc.required && (
                            <span className="text-xs text-green-600 ml-2">(Ya verificado en otra propiedad)</span>
                          )}
                        </p>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.uploaded && doc.url && (
                        <div className="flex items-center gap-2">
                          {doc.url.startsWith('data:image') ? (
                            <SafeImage
                              src={doc.url}
                              alt={doc.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(doc.type)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {!doc.uploaded && (
                        <>
                          <Input
                            id={`upload-${doc.type}`}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(doc.type, e)}
                            disabled={uploading === doc.type}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`upload-${doc.type}`)?.click()}
                            disabled={uploading === doc.type}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading === doc.type ? 'Subiendo...' : 'Subir'}
                          </Button>
                        </>
                      )}

                      {doc.verified && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {allRequiredUploaded && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">¡Documentos completos!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Todos los documentos requeridos han sido subidos. La propiedad será revisada y activada en el inventario público.
                </p>
              </div>
            )}

            {!allRequiredUploaded && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Documentos pendientes</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  La propiedad no se puede activar en el inventario público hasta que subas todos los documentos requeridos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}