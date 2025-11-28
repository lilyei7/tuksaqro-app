"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, Home, FileText } from "lucide-react"
import PropertyForm from "@/components/properties/PropertyForm"
import LegalDocumentsForm from "@/components/properties/LegalDocumentsForm"
import DocumentRequirement from "@/components/properties/DocumentRequirement"
import INEUploadForm from "@/components/properties/INEUploadForm"
import { toast } from "react-hot-toast"

interface Property {
  id: string
  title: string
  price: number
  currency: string
  type: "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL" | "OFFICE"
  status: "AVAILABLE" | "SOLD" | "RENTED" | "PENDING"
  city: string
  state: string
  images: string[]
  createdAt: string
  features: string[]
  // Documentos legales
  predialUploaded: boolean
  predialVerified: boolean
  ineUploaded: boolean
  ineVerified: boolean
  comprobanteDomicilioUploaded: boolean
  comprobanteDomicilioVerified: boolean
}

interface MisPropiedadesClientProps {
  initialProperties: Property[]
  userRole: string
  userId: string
}

export default function MisPropiedadesClient({
  initialProperties,
  userRole,
  userId
}: MisPropiedadesClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [ineVerificationDialogOpen, setIneVerificationDialogOpen] = useState(false)
  const [selectedPropertyForDocuments, setSelectedPropertyForDocuments] = useState<Property | null>(null)

  const handleCreateProperty = async (data: any) => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          ownerId: userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Manejo específico para documentos requeridos
        if (error.requiresDocuments) {
          toast.error(error.error)
          setIsDialogOpen(false)
          setDocumentsDialogOpen(true)
          return
        }
        
        throw new Error(error.error || "Error al crear la propiedad")
      }

      const newProperty = await response.json()
      setProperties(prev => [newProperty, ...prev])
      toast.success("Propiedad creada exitosamente")
      setIsDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la propiedad")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateProperty = async (data: any) => {
    if (!editingProperty) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/properties/${editingProperty.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar la propiedad")
      }

      const updatedProperty = await response.json()
      setProperties(prev =>
        prev.map(prop => prop.id === editingProperty.id ? updatedProperty : prop)
      )
      toast.success("Propiedad actualizada exitosamente")
      setIsDialogOpen(false)
      setEditingProperty(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar la propiedad")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta propiedad?")) return

    try {
      const response = await fetch(`/api/properties/${id}?userId=${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la propiedad")
      }

      setProperties(prev => prev.filter(prop => prop.id !== id))
      toast.success("Propiedad eliminada exitosamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar la propiedad")
    }
  }

  const openCreateDialog = () => {
    // Bloquear si no tiene INE verificado
    if (!userHasVerifiedINE) {
      toast.error("Necesitas subir tu INE para publicar propiedades")
      setDocumentsDialogOpen(true)
      return
    }
    
    setEditingProperty(null)
    setIsDialogOpen(true)
  }

  const openDocumentsDialog = (property: Property) => {
    setSelectedPropertyForDocuments(property)
    setDocumentsDialogOpen(true)
  }

  // Verificar si el usuario ya tiene INE verificado en alguna propiedad
  const userHasVerifiedINE = properties.some(property => property.ineVerified)

  const openEditDialog = (property: Property) => {
    setEditingProperty(property)
    setIsDialogOpen(true)
  }

  const handleDocumentsComplete = () => {
    // Aquí se podría actualizar el estado de la propiedad
    toast.success("Documentos subidos correctamente. La propiedad será revisada para activación.")
    setDocumentsDialogOpen(false)
    setSelectedPropertyForDocuments(null)
  }

  const propertyTypeLabels = {
    HOUSE: "Casa",
    APARTMENT: "Departamento",
    OFFICE: "Oficina",
    LAND: "Terreno",
    COMMERCIAL: "Local Comercial",
  }

  const statusLabels = {
    AVAILABLE: "Disponible",
    SOLD: "Vendido",
    RENTED: "Rentado",
    PENDING: "Pendiente",
  }

  const statusColors = {
    AVAILABLE: "bg-green-100 text-green-800",
    SOLD: "bg-red-100 text-red-800",
    RENTED: "bg-brand-blue/10 text-brand-blue",
    PENDING: "bg-yellow-100 text-yellow-800",
  }

  const formattedPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency || "MXN",
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Mis Propiedades</h1>
              <p className="text-lg opacity-90">Administra tus listados</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100"
                  onClick={openCreateDialog}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Propiedad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="property-form-description">
                <DialogHeader>
                  <DialogTitle id="property-form-description">
                    {editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}
                  </DialogTitle>
                </DialogHeader>
                <PropertyForm
                  initialData={editingProperty || undefined}
                  onSubmit={editingProperty ? handleUpdateProperty : handleCreateProperty}
                  isLoading={submitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Modal de Documentos Legales */}
      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="documents-form-description">
          <DialogHeader>
            <DialogTitle id="documents-form-description">
              Documentos Legales - {selectedPropertyForDocuments?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedPropertyForDocuments && (
            <LegalDocumentsForm
              propertyId={selectedPropertyForDocuments.id}
              initialDocuments={{
                predialUploaded: selectedPropertyForDocuments.predialUploaded,
                predialVerified: selectedPropertyForDocuments.predialVerified,
                predialUrl: undefined, // No necesitamos la URL para mostrar
                ineUploaded: selectedPropertyForDocuments.ineUploaded,
                ineVerified: selectedPropertyForDocuments.ineVerified,
                ineUrl: undefined,
                comprobanteDomicilioUploaded: selectedPropertyForDocuments.comprobanteDomicilioUploaded,
                comprobanteDomicilioVerified: selectedPropertyForDocuments.comprobanteDomicilioVerified,
                comprobanteDomicilioUrl: undefined
              }}
              onDocumentsComplete={handleDocumentsComplete}
              userHasVerifiedINE={userHasVerifiedINE}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Verificación de INE */}
      <Dialog open={ineVerificationDialogOpen} onOpenChange={setIneVerificationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="ine-verification-description">
          <DialogHeader>
            <DialogTitle id="ine-verification-description">
              Verificación de Identidad - INE
            </DialogTitle>
          </DialogHeader>
          <INEUploadForm
            onComplete={() => {
              setIneVerificationDialogOpen(false)
              toast.success('INE enviado para verificación correctamente')
              // Recargar propiedades para actualizar el estado de verificación
              window.location.reload()
            }}
            onCancel={() => setIneVerificationDialogOpen(false)}
            mode="verification"
          />
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        {/* Alerta de Documentación Requerida */}
        <DocumentRequirement
          userHasVerifiedINE={userHasVerifiedINE}
          onUploadDocuments={() => setIneVerificationDialogOpen(true)}
        />

        {properties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes propiedades registradas
              </h3>
              <p className="text-gray-500 mb-6">
                Comienza agregando tu primera propiedad para empezar a recibir ofertas.
              </p>
              {!userHasVerifiedINE && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
                  <p className="text-yellow-900">
                    <strong>⚠️ Nota:</strong> Primero necesitas verificar tu identidad subiendo tu INE.
                  </p>
                </div>
              )}
              <Button 
                onClick={openCreateDialog}
                disabled={!userHasVerifiedINE}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Propiedad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {properties.map((property) => (
              <Card key={`property-${property.id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{property.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{propertyTypeLabels[property.type as keyof typeof propertyTypeLabels] || property.type}</span>
                        <span>•</span>
                        <span>{property.city}, {property.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[property.status as keyof typeof statusColors]}>
                          {statusLabels[property.status as keyof typeof statusLabels] || property.status}
                        </Badge>
                        {/* Estado de documentos legales */}
                        {(() => {
                          // Determinar qué documentos son requeridos para esta propiedad
                          const requiredDocs = ['predial', 'comprobante_domicilio']
                          if (!userHasVerifiedINE) {
                            requiredDocs.push('ine')
                          }

                          const uploadedCount = requiredDocs
                            .map(docType => {
                              switch (docType) {
                                case 'predial': return property.predialUploaded
                                case 'ine': return property.ineUploaded
                                case 'comprobante_domicilio': return property.comprobanteDomicilioUploaded
                                default: return false
                              }
                            })
                            .filter(Boolean).length

                          const verifiedCount = requiredDocs
                            .map(docType => {
                              switch (docType) {
                                case 'predial': return property.predialVerified
                                case 'ine': return property.ineVerified
                                case 'comprobante_domicilio': return property.comprobanteDomicilioVerified
                                default: return false
                              }
                            })
                            .filter(Boolean).length

                          const totalRequired = requiredDocs.length

                          if (verifiedCount === totalRequired) {
                            return (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                Documentos verificados
                              </Badge>
                            )
                          } else if (uploadedCount === totalRequired) {
                            return (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Pendiente verificación
                              </Badge>
                            )
                          } else {
                            return (
                              <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                                {uploadedCount}/{totalRequired} documentos
                              </Badge>
                            )
                          }
                        })()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formattedPrice(property.price, property.currency)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {property.currency}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`/propiedades/${property.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(property)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDocumentsDialog(property)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Documentos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Documentos Legales */}
      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Documentos Legales - {selectedPropertyForDocuments?.title}</DialogTitle>
          </DialogHeader>
          {selectedPropertyForDocuments && (
            <LegalDocumentsForm
              propertyId={selectedPropertyForDocuments.id}
              initialDocuments={{
                predialUploaded: selectedPropertyForDocuments.predialUploaded,
                predialVerified: selectedPropertyForDocuments.predialVerified,
                ineUploaded: selectedPropertyForDocuments.ineUploaded,
                ineVerified: selectedPropertyForDocuments.ineVerified,
                comprobanteDomicilioUploaded: selectedPropertyForDocuments.comprobanteDomicilioUploaded,
                comprobanteDomicilioVerified: selectedPropertyForDocuments.comprobanteDomicilioVerified,
              }}
              onDocumentsComplete={handleDocumentsComplete}
              userHasVerifiedINE={userHasVerifiedINE}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}