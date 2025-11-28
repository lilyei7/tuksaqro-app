"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Building
} from "lucide-react"
import { toast } from "react-hot-toast"

interface Offer {
  id: string
  amount: number
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED"
  message: string
  createdAt: string
  updatedAt: string
  client: {
    id: string
    name: string
    email: string
  }
  property: {
    id: string
    title: string
    price: number
    location: string
    owner: {
      id: string
      name: string
      email: string
    }
  }
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/offers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOffers(data.offers || [])
      } else {
        toast.error("Error al cargar ofertas")
      }
    } catch (error) {
      console.error("Error fetching offers:", error)
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [searchTerm, statusFilter])

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (offer.property.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleOfferAction = async (action: string, offerId: string) => {
    try {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(`Oferta ${action === 'accept' ? 'aceptada' : 'rechazada'} correctamente`)
        fetchOffers()
      } else {
        toast.error("Error al procesar la acción")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando...</h2>
          <p className="text-gray-600">Cargando ofertas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de la Página */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <span>Gestión de Ofertas</span>
        </h2>
        <p className="text-gray-600 mt-2">Administra todas las ofertas realizadas en el sistema inmobiliario</p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ofertas</p>
                <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">P</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aceptadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'ACCEPTED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar ofertas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Propiedad, comprador, vendedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="ACCEPTED">Aceptada</SelectItem>
                  <SelectItem value="REJECTED">Rechazada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Ofertas */}
      <Card>
        <CardHeader>
          <CardTitle>Ofertas ({filteredOffers.length})</CardTitle>
          <CardDescription>
            Lista completa de ofertas realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOffers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ofertas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron ofertas que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comprador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{offer.property.title}</div>
                            <div className="text-sm text-gray-500">{offer.property.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{offer.client.name}</div>
                            <div className="text-sm text-gray-500">{offer.client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{offer.property.owner?.name || 'Usuario desconocido'}</div>
                            <div className="text-sm text-gray-500">{offer.property.owner?.email || 'Email no disponible'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            ${offer.amount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            offer.status === 'PENDING' ? 'default' :
                            offer.status === 'ACCEPTED' ? 'default' :
                            offer.status === 'REJECTED' ? 'destructive' : 'secondary'
                          }
                        >
                          {offer.status === 'PENDING' ? 'Pendiente' :
                           offer.status === 'ACCEPTED' ? 'Aceptada' :
                           offer.status === 'REJECTED' ? 'Rechazada' : 'Cancelada'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(offer.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOffer(offer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {offer.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleOfferAction('accept', offer.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleOfferAction('reject', offer.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles de Oferta */}
      {selectedOffer && (
        <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Detalles de la Oferta</span>
              </DialogTitle>
              <DialogDescription>
                Información completa de la oferta seleccionada
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Propiedad</Label>
                  <p className="text-sm font-medium mt-1">{selectedOffer.property.title}</p>
                  <p className="text-sm text-gray-600">{selectedOffer.property.location}</p>
                </div>
                <div>
                  <Label>Comprador</Label>
                  <p className="text-sm font-medium mt-1">{selectedOffer.client?.name || 'Usuario desconocido'}</p>
                  <p className="text-sm text-gray-600">{selectedOffer.client?.email || 'Email no disponible'}</p>
                </div>
                <div>
                  <Label>Vendedor</Label>
                  <p className="text-sm font-medium mt-1">{selectedOffer.property.owner?.name || 'Usuario desconocido'}</p>
                  <p className="text-sm text-gray-600">{selectedOffer.property.owner?.email || 'Email no disponible'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Monto de la Oferta</Label>
                  <p className="text-sm font-medium mt-1">${selectedOffer.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge
                    variant={
                      selectedOffer.status === 'PENDING' ? 'default' :
                      selectedOffer.status === 'ACCEPTED' ? 'default' :
                      selectedOffer.status === 'REJECTED' ? 'destructive' : 'secondary'
                    }
                    className="mt-1"
                  >
                    {selectedOffer.status === 'PENDING' ? 'Pendiente' :
                     selectedOffer.status === 'ACCEPTED' ? 'Aceptada' :
                     selectedOffer.status === 'REJECTED' ? 'Rechazada' : 'Cancelada'}
                  </Badge>
                </div>
                <div>
                  <Label>Fecha de Creación</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedOffer.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <Label>Mensaje</Label>
                  <p className="text-sm mt-1">{selectedOffer.message || 'Sin mensaje'}</p>
                </div>
              </div>
            </div>
            {selectedOffer.status === 'PENDING' && (
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleOfferAction('reject', selectedOffer.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar Oferta
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleOfferAction('accept', selectedOffer.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceptar Oferta
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}