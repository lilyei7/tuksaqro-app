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
  Building,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Shield,
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  AlertTriangle,
  Image,
  FileText,
  Users,
  Download,
  Share2
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { generatePropertyTechnicalSheet } from "@/lib/pdfGenerator"
import { useSession } from "next-auth/react"

interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  status: "AVAILABLE" | "SOLD" | "RENTED" | "PENDING"
  createdAt: string
  updatedAt: string
  images?: string[]
  owner: {
    id: string
    name: string
    email: string
  }
  _count?: {
    offers: number
    views: number
  }
}

export default function AdminPropertiesPage() {
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null)
  const [editFormData, setEditFormData] = useState<{
    title: string
    description: string
    price: number
    status: 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING'
    type: 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL'
  }>({
    title: '',
    description: '',
    price: 0,
    status: 'AVAILABLE',
    type: 'HOUSE'
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      })

      const response = await fetch(`/api/admin/properties?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      } else {
        toast.error("Error al cargar propiedades")
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [searchTerm, statusFilter, typeFilter])

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    const matchesType = typeFilter === "all" || property.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handlePropertyAction = async (action: string, propertyId: string) => {
    if (action === 'edit') {
      // Abrir modal de edición
      const property = properties.find(p => p.id === propertyId)
      if (property) {
        setEditingProperty(property)
        setEditFormData({
          title: property.title,
          description: property.description,
          price: property.price,
          status: property.status as 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING',
          type: property.type as 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL'
        })
        setIsEditModalOpen(true)
      }
    } else if (action === 'delete') {
      // Abrir modal de confirmación de eliminación
      const property = properties.find(p => p.id === propertyId)
      if (property) {
        setPropertyToDelete(property)
        setIsDeleteModalOpen(true)
      }
    }
  }

  const handleDownloadPDF = async (property: Property) => {
    setPropertyToShare(property)
    setIsShareModalOpen(true)
  }

  const handleSharePDF = async (includePersonalData: boolean) => {
    if (!propertyToShare || !session?.user) return

    try {
      // Preparar los datos de la propiedad
      const propertyData = {
        id: propertyToShare.id,
        title: propertyToShare.title,
        description: propertyToShare.description,
        price: propertyToShare.price,
        location: propertyToShare.location,
        bedrooms: propertyToShare.bedrooms,
        bathrooms: propertyToShare.bathrooms,
        area: propertyToShare.area,
        type: propertyToShare.type,
        status: propertyToShare.status,
        createdAt: propertyToShare.createdAt,
        images: propertyToShare.images || []
      }

      // Preparar datos del usuario si se incluyen
      const userData = includePersonalData ? {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        phone: (session.user as any).phone || undefined,
        role: (session.user as any).role || 'Agente'
      } : undefined

      await generatePropertyTechnicalSheet(propertyData, includePersonalData, userData)

      const message = includePersonalData
        ? 'Ficha técnica compartible generada correctamente'
        : 'Ficha técnica privada descargada correctamente'

      toast.success(message)
      setIsShareModalOpen(false)
      setPropertyToShare(null)
    } catch (error) {
      console.error('Error generando PDF:', error)
      toast.error('Error al generar la ficha técnica')
    }
  }

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return

    try {
      const response = await fetch(`/api/admin/properties/${propertyToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        toast.success('Propiedad eliminada correctamente')
        setIsDeleteModalOpen(false)
        setPropertyToDelete(null)
        fetchProperties()
      } else {
        toast.error("Error al eliminar la propiedad")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  const handleUpdateProperty = async () => {
    if (!editingProperty) return

    try {
      const response = await fetch(`/api/admin/properties/${editingProperty.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (response.ok) {
        toast.success('Propiedad actualizada correctamente')
        setIsEditModalOpen(false)
        setEditingProperty(null)
        fetchProperties()
      } else {
        toast.error("Error al actualizar la propiedad")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header de la Página */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Building className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <span>Gestión de Propiedades</span>
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-lg">Administra todas las propiedades del sistema inmobiliario</p>
          </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{properties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm sm:text-lg">✓</span>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'AVAILABLE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm sm:text-lg">V</span>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600">Vendidas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'SOLD').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm sm:text-lg">P</span>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-6 sm:mb-8 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-lg sm:text-xl">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span>Filtros y Búsqueda</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Utiliza los filtros para encontrar propiedades específicas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-semibold text-gray-700">Buscar propiedades</Label>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Título, ubicación, propietario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-semibold text-gray-700">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="AVAILABLE">Disponible</SelectItem>
                    <SelectItem value="SOLD">Vendido</SelectItem>
                    <SelectItem value="RENTED">Alquilado</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="type-filter" className="text-sm font-semibold text-gray-700">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="HOUSE">Casa</SelectItem>
                    <SelectItem value="APARTMENT">Apartamento</SelectItem>
                    <SelectItem value="LAND">Terreno</SelectItem>
                    <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Tabla de Propiedades */}
      <Card>
        <CardHeader>
          <CardTitle>Propiedades ({filteredProperties.length})</CardTitle>
          <CardDescription>
            Lista completa de todas las propiedades registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando propiedades...</span>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay propiedades</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron propiedades que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg -mx-2 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                      Ubicación
                    </th>
                    <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                      Vistas
                    </th>
                    <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Propietario
                    </th>
                    <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex flex-col space-y-2">
                          <Link
                            href={`/propiedades/${property.id}`}
                            className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors leading-tight"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {property.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {property.bedrooms} hab
                            </span>
                            <span className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {property.bathrooms} baños
                            </span>
                            <span className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              {property.area}m²
                            </span>
                          </div>
                          <div className="sm:hidden flex items-center text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {property.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 hidden sm:table-cell">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-900 font-medium">{property.location}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <span className="text-sm sm:text-lg font-bold text-gray-900">
                            ${property.price.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 hidden md:table-cell">
                        <Badge
                          variant={
                            property.status === 'AVAILABLE' ? 'default' :
                            property.status === 'SOLD' ? 'destructive' :
                            property.status === 'RENTED' ? 'secondary' : 'outline'
                          }
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium"
                        >
                          {property.status === 'AVAILABLE' ? 'Disponible' :
                           property.status === 'SOLD' ? 'Vendido' :
                           property.status === 'RENTED' ? 'Alquilado' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 hidden lg:table-cell">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-semibold text-gray-900">
                            {property._count?.views || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 hidden md:table-cell">
                        <div className="flex items-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <span className="text-xs sm:text-sm font-semibold text-blue-600">
                              {(property.owner?.name || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-900">
                            {property.owner?.name || 'Usuario desconocido'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProperty(property)}
                            className="px-2 sm:px-3 py-1 sm:py-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="ml-1 sm:ml-2 hidden sm:inline text-xs sm:text-sm">Ver</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePropertyAction('edit', property.id)}
                            className="px-2 sm:px-3 py-1 sm:py-2 hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                            title="Editar propiedad"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="ml-1 sm:ml-2 hidden sm:inline text-xs sm:text-sm">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePropertyAction('delete', property.id)}
                            className="px-2 sm:px-3 py-1 sm:py-2 hover:bg-red-50 hover:border-red-300 transition-colors"
                            title="Eliminar propiedad"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="ml-1 sm:ml-2 hidden sm:inline text-xs sm:text-sm">Eliminar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(property)}
                            className="px-2 sm:px-3 py-1 sm:py-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                            title="Compartir ficha técnica PDF"
                          >
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="ml-1 sm:ml-2 hidden sm:inline text-xs sm:text-sm">Compartir</span>
                          </Button>
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

      {/* Modal de Detalles de Propiedad */}
      {selectedProperty && (
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-y-auto p-0">
            <div className="p-4 sm:p-6 lg:p-8">
              <DialogHeader className="mb-4 sm:mb-6">
                <DialogTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span className="leading-tight text-sm sm:text-base">{selectedProperty.title}</span>
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base mt-2">
                  Detalles completos de la propiedad
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Columna Izquierda */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Información General
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Descripción</Label>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selectedProperty.description}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Ubicación</Label>
                        <p className="text-sm flex items-center mt-2">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-red-500 flex-shrink-0" />
                          <span className="text-gray-900 font-medium">{selectedProperty.location}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Características
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 sm:p-4 border">
                        <Label className="text-sm font-medium text-gray-700">Habitaciones</Label>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{selectedProperty.bedrooms}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 border">
                        <Label className="text-sm font-medium text-gray-700">Baños</Label>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{selectedProperty.bathrooms}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 border col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Área Total</Label>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{selectedProperty.area}m²</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                      Información Económica
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-white rounded-lg p-3 sm:p-4 border">
                        <Label className="text-sm font-medium text-gray-700">Precio</Label>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
                          ${selectedProperty.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{selectedProperty.type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Estado</Label>
                        <div className="mt-2">
                          <Badge
                            variant={
                              selectedProperty.status === 'AVAILABLE' ? 'default' :
                              selectedProperty.status === 'SOLD' ? 'destructive' :
                              selectedProperty.status === 'RENTED' ? 'secondary' : 'outline'
                            }
                            className="px-3 sm:px-4 py-1 sm:py-2 text-sm font-medium"
                          >
                            {selectedProperty.status === 'AVAILABLE' ? 'Disponible' :
                             selectedProperty.status === 'SOLD' ? 'Vendido' :
                             selectedProperty.status === 'RENTED' ? 'Alquilado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Propietario
                    </h3>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-base sm:text-lg font-semibold text-blue-600">
                            {(selectedProperty.owner?.name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {selectedProperty.owner?.name || 'Usuario desconocido'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {selectedProperty.owner?.email || 'Email no disponible'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                      Estadísticas
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 sm:p-4 border text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Vistas</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{selectedProperty._count?.views || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 border text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Creada</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {new Date(selectedProperty.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 sm:px-6 py-2 sm:py-2 order-2 sm:order-1"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    window.open(`/propiedades/${selectedProperty.id}`, '_blank');
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                >
                  Ver Propiedad
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Edición de Propiedad */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <span>Editar Propiedad</span>
            </DialogTitle>
            <DialogDescription>
              Modifica los datos de la propiedad seleccionada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título de la propiedad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la propiedad"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="Precio en MXN"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select value={editFormData.type} onValueChange={(value) => setEditFormData(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOUSE">Casa</SelectItem>
                    <SelectItem value="APARTMENT">Apartamento</SelectItem>
                    <SelectItem value="LAND">Terreno</SelectItem>
                    <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="SOLD">Vendido</SelectItem>
                  <SelectItem value="RENTED">Alquilado</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateProperty}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-xl text-red-600">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span>¿Eliminar Propiedad?</span>
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Esta acción no se puede deshacer. Se eliminará permanentemente:
            </DialogDescription>
          </DialogHeader>

          {propertyToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{propertyToDelete.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{propertyToDelete.location}</p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <Image className="w-4 h-4 text-red-500" />
                    <span>Todas las imágenes de la propiedad</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>Información y descripción completa</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-red-500" />
                    <span>Datos del propietario asociados</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>Historial de visitas y estadísticas</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <DollarSign className="w-4 h-4 text-red-500" />
                    <span>Ofertas y negociaciones relacionadas</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Advertencia Importante</p>
                    <p className="text-sm text-red-700 mt-1">
                      Una vez eliminada, no podrás recuperar esta propiedad ni ninguno de sus datos asociados.
                      Asegúrate de que realmente deseas continuar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setPropertyToDelete(null)
              }}
              className="px-4 py-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Definitivamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Opciones de Compartir PDF */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-xl text-blue-600">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <span>Compartir Ficha Técnica</span>
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Selecciona cómo deseas compartir la ficha técnica de la propiedad:
            </DialogDescription>
          </DialogHeader>

          {propertyToShare && (
            <div className="py-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{propertyToShare.title}</h3>
                <p className="text-sm text-gray-600">{propertyToShare.location}</p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-2">📄 Versión Privada</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Ficha técnica sin información de contacto. Ideal para compartir de forma anónima.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Sin datos personales del agente</li>
                    <li>• Solo información de la propiedad</li>
                    <li>• Marca de agua de protección</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-2">📋 Versión Profesional</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Ficha técnica completa con tus datos de contacto para distribución profesional.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Incluye nombre, email y teléfono</li>
                    <li>• Información completa del agente</li>
                    <li>• Indicador de documento oficial</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsShareModalOpen(false)
                setPropertyToShare(null)
              }}
              className="px-4 py-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleSharePDF(false)}
              variant="outline"
              className="px-4 py-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Versión Privada
            </Button>
            <Button
              onClick={() => handleSharePDF(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Versión Profesional
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        </div>
      </div>
    </div>
  )
}