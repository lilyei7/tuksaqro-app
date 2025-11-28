"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Check, X, MessageSquare, Loader, FileText } from "lucide-react"
import { toast } from "react-hot-toast"
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

interface ManageOffersModalProps {
  propertyId?: string
  trigger?: React.ReactNode
}

export function ManageOffersModal({ propertyId, trigger }: ManageOffersModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [counterAmount, setCounterAmount] = useState("")
  const [counterConditions, setCounterConditions] = useState("")

  const fetchOffers = async () => {
    setIsLoading(true)
    try {
      const url = propertyId ? `/api/offers?propertyId=${propertyId}` : "/api/offers"
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Error al cargar ofertas")
      }
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error("Error fetching offers:", error)
      toast.error("Error al cargar las ofertas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchOffers()
    }
  }, [isOpen, propertyId])

  const handleOfferAction = async (offerId: string, action: "ACCEPTED" | "REJECTED" | "COUNTER_OFFER") => {
    try {
      const body: any = { status: action }

      if (action === "COUNTER_OFFER") {
        if (!counterAmount || parseFloat(counterAmount) <= 0) {
          toast.error("Ingresa un monto válido para la contraoferta")
          return
        }
        body.counterAmount = parseFloat(counterAmount)
        body.conditions = counterConditions.trim() || undefined
      }

      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la oferta")
      }

      toast.success(
        action === "ACCEPTED" ? "¡Oferta aceptada!" :
        action === "REJECTED" ? "Oferta rechazada" :
        "Contraoferta enviada"
      )

      // Actualizar la oferta en el estado local
      setOffers(prev => prev.map(offer =>
        offer.id === offerId ? data : offer
      ))

      // Limpiar el formulario de contraoferta
      setSelectedOffer(null)
      setCounterAmount("")
      setCounterConditions("")

    } catch (error) {
      console.error("Error updating offer:", error)
      toast.error(error instanceof Error ? error.message : "Error al procesar la oferta")
    }
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Gestionar Ofertas
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Gestionar Ofertas
          </DialogTitle>
          <DialogDescription>
            Revisa y administra todas las ofertas para esta propiedad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="h-8 w-8 animate-spin text-brand-blue" />
              <span className="ml-2 text-gray-600">Cargando ofertas...</span>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay ofertas para mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <Card key={offer.id} className="border-l-4 border-l-brand-blue">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {offer.client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{offer.client.name}</CardTitle>
                          <p className="text-sm text-gray-600">{offer.client.email}</p>
                          {offer.client.phone && (
                            <p className="text-sm text-gray-600">{offer.client.phone}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(offer.status)}>
                        {getStatusLabel(offer.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Información de la oferta */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Monto ofrecido</p>
                          <p className="text-xl font-bold text-brand-blue">
                            {formatCurrency(offer.amount, offer.currency)}
                          </p>
                        </div>
                        {offer.counterAmount && (
                          <div>
                            <p className="text-sm text-gray-600">Contraoferta</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(offer.counterAmount, offer.currency)}
                            </p>
                          </div>
                        )}
                      </div>

                      {offer.conditions && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-1">Condiciones</p>
                          <p className="text-sm bg-white p-2 rounded border">{offer.conditions}</p>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-gray-500">
                        Enviada el {formatDate(offer.createdAt)}
                      </div>
                    </div>

                    {/* Propiedad */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <SafeImage
                          src={offer.property.images?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23e5e7eb' width='64' height='64'/%3E%3C/svg%3E"}
                          alt={offer.property.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {offer.property.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Precio de lista: {formatCurrency(offer.property.price)}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    {offer.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOfferAction(offer.id, "ACCEPTED")}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aceptar
                        </Button>
                        <Button
                          onClick={() => setSelectedOffer(offer)}
                          variant="outline"
                          className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contraoferta
                        </Button>
                        <Button
                          onClick={() => handleOfferAction(offer.id, "REJECTED")}
                          variant="outline"
                          className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    )}

                    {/* Formulario de contraoferta */}
                    {selectedOffer?.id === offer.id && (
                      <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium text-gray-900">Hacer Contraoferta</h4>

                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="counterAmount">Nuevo monto *</Label>
                            <Input
                              id="counterAmount"
                              type="number"
                              placeholder="0.00"
                              value={counterAmount}
                              onChange={(e) => setCounterAmount(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="counterConditions">Condiciones (opcional)</Label>
                            <Textarea
                              id="counterConditions"
                              placeholder="Especifica las nuevas condiciones..."
                              value={counterConditions}
                              onChange={(e) => setCounterConditions(e.target.value)}
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOfferAction(offer.id, "COUNTER_OFFER")}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Enviar Contraoferta
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedOffer(null)
                              setCounterAmount("")
                              setCounterConditions("")
                            }}
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}