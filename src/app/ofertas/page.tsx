"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, MessageSquare, Loader } from "lucide-react"
import { ManageOffersModal } from "@/components/offers/ManageOffersModal"
import SafeImage from "@/components/common/SafeImage"

interface Offer {
  id: string
  amount: number
  currency: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTER_OFFER"
  conditions?: string
  counterAmount?: number
  createdAt: string
  updatedAt: string
  client: {
    id: string
    name: string
    email: string
    phone?: string
  }
  property: {
    id: string
    title: string
    price: number
    images?: string[]
  }
}

// Funciones helper
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-yellow-100 text-yellow-800"
    case "ACCEPTED": return "bg-green-100 text-green-800"
    case "REJECTED": return "bg-red-100 text-red-800"
    case "COUNTER_OFFER": return "bg-blue-100 text-blue-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING": return "Pendiente"
    case "ACCEPTED": return "Aceptada"
    case "REJECTED": return "Rechazada"
    case "COUNTER_OFFER": return "Contraoferta"
    default: return status
  }
}

const formatCurrency = (amount: number, currency: string = "MXN") => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function OffersPage() {
  const { data: session, status } = useSession()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchOffers()
    }
  }, [status])

  const fetchOffers = async () => {
    try {
      const response = await fetch("/api/offers")
      if (!response.ok) {
        throw new Error("Error al cargar ofertas")
      }
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error("Error fetching offers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Estadísticas
  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.status === "PENDING").length,
    accepted: offers.filter(o => o.status === "ACCEPTED").length,
    rejected: offers.filter(o => o.status === "REJECTED").length,
    counterOffers: offers.filter(o => o.status === "COUNTER_OFFER").length,
  }

  // Filtrar ofertas por estado
  const pendingOffers = offers.filter(o => o.status === "PENDING")
  const acceptedOffers = offers.filter(o => o.status === "ACCEPTED")
  const rejectedOffers = offers.filter(o => o.status === "REJECTED")
  const counterOffers = offers.filter(o => o.status === "COUNTER_OFFER")

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver tus ofertas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Ofertas</h1>
        <p className="text-gray-600">Gestiona todas las ofertas de tus propiedades</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-brand-blue" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
                <p className="text-sm text-gray-600">Aceptadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Rechazadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.counterOffers}</p>
                <p className="text-sm text-gray-600">Contraofertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de ofertas por estado */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendientes ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="counter" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Contraofertas ({stats.counterOffers})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aceptadas ({stats.accepted})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rechazadas ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <OffersList offers={pendingOffers} onUpdate={fetchOffers} />
        </TabsContent>

        <TabsContent value="counter" className="mt-6">
          <OffersList offers={counterOffers} onUpdate={fetchOffers} />
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          <OffersList offers={acceptedOffers} onUpdate={fetchOffers} showActions={false} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <OffersList offers={rejectedOffers} onUpdate={fetchOffers} showActions={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface OffersListProps {
  offers: Offer[]
  onUpdate: () => void
  showActions?: boolean
}

function OffersList({ offers, onUpdate, showActions = true }: OffersListProps) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ofertas</h3>
        <p className="text-gray-600">No tienes ofertas en esta categoría.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="border-l-4 border-l-brand-blue">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Imagen de la propiedad */}
              <div className="w-full lg:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <SafeImage
                  src={offer.property.images?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='96'%3E%3Crect fill='%23e5e7eb' width='128' height='96'/%3E%3C/svg%3E"}
                  alt={offer.property.title}
                  width={128}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Información de la oferta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {offer.property.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Precio de lista: {formatCurrency(offer.property.price)}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {formatCurrency(offer.amount, offer.currency)}
                        </span>
                      </div>

                      {offer.counterAmount && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-600">
                            Contraoferta: {formatCurrency(offer.counterAmount, offer.currency)}
                          </span>
                        </div>
                      )}

                      <Badge className={getStatusColor(offer.status)}>
                        {getStatusLabel(offer.status)}
                      </Badge>
                    </div>

                    {offer.conditions && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {offer.conditions}
                      </p>
                    )}
                  </div>

                  {/* Información del cliente */}
                  <div className="sm:text-right">
                    <p className="font-medium text-gray-900">{offer.client.name}</p>
                    <p className="text-sm text-gray-600">{offer.client.email}</p>
                    {offer.client.phone && (
                      <p className="text-sm text-gray-600">{offer.client.phone}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(offer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {showActions && (
                <div className="flex flex-col gap-2">
                  <ManageOffersModal
                    propertyId={offer.property.id}
                    trigger={
                      <Button variant="outline" size="sm">
                        Gestionar
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}