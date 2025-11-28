"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Phone, Mail, TrendingUp, Users, Target, Activity } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  assignedAt: string
  createdAt: string
  clientAppointments: Array<{
    id: string
    date: string
    status: string
    property: {
      id: string
      title: string
      price: number
    }
  }>
  offers: Array<{
    id: string
    amount: number
    status: string
    property: {
      title: string
    }
  }>
  clientContracts: Array<{
    id: string
    status: string
    createdAt: string
  }>
}

interface LeadStats {
  totalLeads: number
  activeLeads: number
  convertedLeads: number
  recentActivity: number
  conversionRate: number
}

export default function AgentLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/leads/agent")

      if (!response.ok) {
        throw new Error("Error al cargar los leads")
      }

      const data = await response.json()
      setLeads(data.data.leads)
      setStats(data.data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pendiente" },
      CONFIRMED: { variant: "default" as const, label: "Confirmada" },
      COMPLETED: { variant: "outline" as const, label: "Completada" },
      CANCELLED: { variant: "destructive" as const, label: "Cancelada" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando leads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchLeads}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Leads</h1>
          <p className="text-muted-foreground">
            Gestiona tus clientes potenciales y oportunidades de venta
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.convertedLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>
            Clientes asignados a ti para seguimiento y conversión
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes leads asignados aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge variant="outline">
                            Asignado {format(new Date(lead.assignedAt), "dd/MM/yyyy", { locale: es })}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Actividad reciente */}
                        <div className="space-y-2">
                          {lead.clientAppointments.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">Próximas citas:</p>
                              <div className="space-y-1">
                                {lead.clientAppointments.slice(0, 2).map((appointment) => (
                                  <div key={appointment.id} className="flex items-center space-x-2 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    <span>{appointment.property.title}</span>
                                    <span className="text-muted-foreground">
                                      {format(new Date(appointment.date), "dd/MM/yyyy HH:mm", { locale: es })}
                                    </span>
                                    {getStatusBadge(appointment.status)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {lead.offers.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">Últimas ofertas:</p>
                              <div className="space-y-1">
                                {lead.offers.slice(0, 2).map((offer) => (
                                  <div key={offer.id} className="flex items-center space-x-2 text-sm">
                                    <span>{offer.property.title}</span>
                                    <span className="font-medium">${offer.amount.toLocaleString()}</span>
                                    {getStatusBadge(offer.status)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {lead.clientContracts.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="font-medium">Contrato:</span>
                              {getStatusBadge(lead.clientContracts[0].status)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Contactar
                      </Button>
                      <Button variant="outline" size="sm">
                        Ver perfil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}