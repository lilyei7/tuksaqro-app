"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, FileText, Eye } from "lucide-react"
import { toast } from "react-hot-toast"
import SafeImage from "@/components/common/SafeImage"

interface DocumentVerification {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string | null
  ineData: {
    frontSideUrl: string
    backSideUrl: string
    submittedAt: string
    status: string
  }
}

export default function DocumentVerificationClient() {
  const [documents, setDocuments] = useState<DocumentVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<DocumentVerification | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  // 🔴 NUEVO: Escuchar cambios en documentos en tiempo real via SSE
  useEffect(() => {
    if (typeof window === 'undefined') return

    const eventSource = new EventSource('/api/events/admin-notifications')

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        // Ignorar heartbeat y connected
        if (data.type === 'admin-connected' || data.type === 'heartbeat') {
          return
        }

        // Cuando hay cambios en documentos
        console.log('📢 Cambio en documentos:', data)

        // Refrescar lista de documentos
        if (data.type === 'INE_SUBMITTED' || data.type === 'DOCUMENT_VERIFIED') {
          fetchDocuments()
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

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/document-verification')
      if (!response.ok) throw new Error('Error cargando documentos')
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      toast.error('Error al cargar documentos pendientes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (docId: string) => {
    try {
      setVerifyingId(docId)
      const response = await fetch(`/api/admin/document-verification/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          notes: ''
        })
      })

      if (!response.ok) throw new Error('Error aprobando documento')
      
      toast.success('Documento aprobado correctamente')
      setDocuments(prev => prev.filter(d => d.id !== docId))
      setSelectedDoc(null)
    } catch (error) {
      toast.error('Error al aprobar documento')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleReject = async (docId: string) => {
    if (!rejectionNotes.trim()) {
      toast.error('Por favor ingresa una razón para rechazar')
      return
    }

    try {
      setVerifyingId(docId)
      const response = await fetch(`/api/admin/document-verification/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          notes: rejectionNotes
        })
      })

      if (!response.ok) throw new Error('Error rechazando documento')
      
      toast.success('Documento rechazado. El usuario recibirá una notificación.')
      setDocuments(prev => prev.filter(d => d.id !== docId))
      setSelectedDoc(null)
      setRejectionNotes("")
      setActionType(null)
    } catch (error) {
      toast.error('Error al rechazar documento')
    } finally {
      setVerifyingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  const pendingDocs = documents.filter(d => d.status === 'PENDING')
  const approvedDocs = documents.filter(d => d.status === 'APPROVED')
  const rejectedDocs = documents.filter(d => d.status === 'REJECTED')

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes de Verificar</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingDocs.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobados</p>
                <p className="text-3xl font-bold text-green-600">{approvedDocs.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rechazados</p>
                <p className="text-3xl font-bold text-red-600">{rejectedDocs.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentos Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Documentos Pendientes de Verificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDocs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay documentos pendientes de verificar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDocs.map(doc => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-blue-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{doc.userName}</h4>
                      <p className="text-sm text-gray-600">{doc.userEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Enviado: {new Date(doc.uploadedAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDoc(doc)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentos Aprobados */}
      {approvedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Documentos Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedDocs.map(doc => (
                <div key={doc.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{doc.userName}</h4>
                      <p className="text-sm text-gray-600">{doc.userEmail}</p>
                      <p className="text-xs text-green-700 mt-1">
                        Aprobado: {doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString('es-MX') : 'N/A'}
                      </p>
                    </div>
                    <Badge className="bg-green-600">Aprobado</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos Rechazados */}
      {rejectedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Documentos Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rejectedDocs.map(doc => (
                <div key={doc.id} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{doc.userName}</h4>
                      <p className="text-sm text-gray-600">{doc.userEmail}</p>
                      {doc.notes && (
                        <p className="text-sm text-red-700 mt-2">
                          <strong>Razón:</strong> {doc.notes}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-red-600">Rechazado</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Verificación */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Verificar INE - {selectedDoc?.userName}
            </DialogTitle>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-6">
              {/* Estado del Documento - Banner Grande */}
              {selectedDoc.status === 'PENDING' && (
                <div className="bg-gradient-to-r from-yellow-400 to-amber-400 border-2 border-yellow-600 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-7 h-7 text-yellow-800" />
                    <h3 className="text-xl font-bold text-yellow-900">PENDIENTE DE VERIFICACIÓN</h3>
                  </div>
                  <p className="text-yellow-800 font-semibold">Este documento está esperando tu revisión y aprobación/rechazo.</p>
                </div>
              )}
              
              {selectedDoc.status === 'APPROVED' && (
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 border-2 border-green-600 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-7 h-7 text-green-800" />
                    <h3 className="text-xl font-bold text-green-900">APROBADO ✓</h3>
                  </div>
                  <p className="text-green-800 font-semibold">Este documento ha sido verificado y aprobado. El usuario tiene acceso completo.</p>
                </div>
              )}
              
              {selectedDoc.status === 'REJECTED' && (
                <div className="bg-gradient-to-r from-red-400 to-rose-400 border-2 border-red-600 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="w-7 h-7 text-red-800" />
                    <h3 className="text-xl font-bold text-red-900">RECHAZADO ✗</h3>
                  </div>
                  <p className="text-red-800 font-semibold">Este documento fue rechazado. El usuario puede reenviar uno nuevo.</p>
                  {selectedDoc.notes && (
                    <p className="text-red-800 mt-3 p-3 bg-red-50 rounded border border-red-300">
                      <strong>Razón del rechazo:</strong> {selectedDoc.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Información del Usuario */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-lg text-blue-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información del Usuario
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs uppercase font-semibold">Nombre</p>
                    <p className="font-semibold text-gray-900">{selectedDoc.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase font-semibold">Email</p>
                    <p className="font-semibold text-gray-900 truncate">{selectedDoc.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase font-semibold">Fecha de Envío</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedDoc.uploadedAt).toLocaleDateString('es-MX', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase font-semibold">Tipo de Documento</p>
                    <p className="font-semibold text-gray-900">Documento de Identidad (INE)</p>
                  </div>
                </div>
              </div>

              {/* Fotos del INE */}
              <div className="space-y-4">
                <h4 className="font-semibold">Fotos del Documento</h4>
                
                <div>
                  <p className="text-sm font-semibold mb-2 text-gray-700">Frente del INE</p>
                  <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                    <SafeImage
                      src={selectedDoc.ineData.frontSideUrl}
                      alt="Frente del INE"
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-gray-700">Dorso del INE</p>
                  <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                    <SafeImage
                      src={selectedDoc.ineData.backSideUrl}
                      alt="Dorso del INE"
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {actionType === null && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setActionType('approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    disabled={verifyingId !== null}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar Documento
                  </Button>
                  <Button
                    onClick={() => setActionType('reject')}
                    variant="destructive"
                    className="flex-1 gap-2"
                    disabled={verifyingId !== null}
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar Documento
                  </Button>
                </div>
              )}

              {actionType === 'approve' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-green-800">
                    ¿Estás seguro de que deseas aprobar este documento? El usuario podrá publicar propiedades inmediatamente.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(selectedDoc.id)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={verifyingId !== null}
                    >
                      {verifyingId === selectedDoc.id ? 'Aprobando...' : 'Confirmar Aprobación'}
                    </Button>
                    <Button
                      onClick={() => setActionType(null)}
                      variant="outline"
                      disabled={verifyingId !== null}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {actionType === 'reject' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-red-800">
                    Ingresa una razón para rechazar el documento. El usuario recibirá una notificación y podrá reenviar uno nuevo.
                  </p>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Ejemplo: Imagen borrosa, datos ilegibles, documentos no coinciden, etc."
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReject(selectedDoc.id)}
                      variant="destructive"
                      disabled={!rejectionNotes.trim() || verifyingId !== null}
                    >
                      {verifyingId === selectedDoc.id ? 'Rechazando...' : 'Confirmar Rechazo'}
                    </Button>
                    <Button
                      onClick={() => {
                        setActionType(null)
                        setRejectionNotes("")
                      }}
                      variant="outline"
                      disabled={verifyingId !== null}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
