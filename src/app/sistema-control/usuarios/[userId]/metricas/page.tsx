"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Building,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Eye,
  MessageSquare,
  FileCheck,
  UserCheck,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  Star
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { getApiUrl } from "@/lib/utils/api"

interface UserMetrics {
  user: {
    id: string
    name: string
    email: string
    phone?: string
    role: string
    roleLabel: string
    createdAt: string
    isBanned: boolean
    _count: {
      properties: number
      clientAppointments: number
      agentAppointments: number
      documents: number
      offers: number
      clientContracts: number
      agentContracts: number
      sentMessages: number
      propertyViews: number
      assignedLeads: number
      digitalSignatures: number
      buyerWritings: number
      sellerWritings: number
      agentWritings: number
      writingActivities: number
      notifications: number
      contractTemplates: number
    }
  }
  summary: {
    totalProperties: number
    totalAppointments: number
    totalDocuments: number
    totalOffers: number
    totalContracts: number
    totalMessages: number
    totalPropertyViews: number
    totalAssignedLeads: number
    totalSignatures: number
    totalWritings: number
    totalNotifications: number
    totalContractTemplates: number
  }
  recentActivity: {
    properties: any[]
    appointments: any[]
    offers: any[]
    contracts: any[]
    leadsAssigned: any[]
    propertyViews: any[]
  }
  performance: {
    monthlyStats: any[]
    kpis: any
    revenue: any
  }
  calculatedMetrics: {
    conversionRate: string
    appointmentCompletionRate: string
    avgResponseTime: string
    customerSatisfaction: string
  }
}

export default function UserMetricsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchMetrics = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const response = await fetch(getApiUrl(`/api/admin/users/${userId}/metrics`))
      if (!response.ok) throw new Error('Error al cargar métricas')

      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      toast.error('Error al cargar las métricas del usuario')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchMetrics()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  const { user, summary, recentActivity, performance, calculatedMetrics } = metrics

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Métricas de Usuario</h1>
                <p className="text-gray-600">Análisis detallado del rendimiento y actividad</p>
              </div>
            </div>
            <Button
              onClick={() => fetchMetrics(false)}
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* User Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{user.name || 'Sin nombre'}</h2>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                      {user.roleLabel}
                    </Badge>
                    {user.isBanned && (
                      <Badge variant="destructive">BANEADO</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {user.phone || 'No especificado'}
                    </div>
                    <div>
                      <strong>Miembro desde:</strong> {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Propiedades</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contratos</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalContracts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(performance.revenue?.offers_revenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Estadísticas Generales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{summary.totalOffers}</div>
                      <div className="text-sm text-gray-600">Ofertas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{summary.totalDocuments}</div>
                      <div className="text-sm text-gray-600">Documentos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{summary.totalMessages}</div>
                      <div className="text-sm text-gray-600">Mensajes</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{summary.totalPropertyViews}</div>
                      <div className="text-sm text-gray-600">Vistas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Métricas de Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tasa de Conversión</span>
                      <span className="font-semibold">{calculatedMetrics.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Citas Completadas</span>
                      <span className="font-semibold">{calculatedMetrics.appointmentCompletionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tiempo de Respuesta</span>
                      <span className="font-semibold">{calculatedMetrics.avgResponseTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Satisfacción</span>
                      <span className="font-semibold">{calculatedMetrics.customerSatisfaction}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Propiedades Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.properties.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.properties.map((property) => (
                        <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{property.title}</p>
                            <p className="text-sm text-gray-600">
                              ${property.price.toLocaleString()} • {property.type}
                            </p>
                          </div>
                          <Badge variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay propiedades recientes</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Citas Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.appointments.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.appointments.map((appointment) => (
                        <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{appointment.property.title}</p>
                            <Badge variant={appointment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay citas recientes</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KPIs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    KPIs del Usuario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{performance.kpis.total_leads || 0}</div>
                      <div className="text-sm text-gray-600">Total Leads</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{performance.kpis.total_offers || 0}</div>
                      <div className="text-sm text-gray-600">Total Ofertas</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{performance.kpis.total_contracts || 0}</div>
                      <div className="text-sm text-gray-600">Total Contratos</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        ${performance.kpis.avg_property_price ? Math.round(performance.kpis.avg_property_price).toLocaleString() : 0}
                      </div>
                      <div className="text-sm text-gray-600">Precio Promedio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Estadísticas Mensuales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performance.monthlyStats.length > 0 ? (
                    <div className="space-y-3">
                      {performance.monthlyStats.map((stat: any) => (
                        <div key={stat.month} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{stat.month}</p>
                            <p className="text-sm text-gray-600">{stat.appointments} citas totales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{stat.completed_appointments}</p>
                            <p className="text-xs text-gray-600">completadas</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay estadísticas mensuales</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab (for agents) */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Clientes Asignados
                </CardTitle>
                <CardDescription>
                  Lista de leads/clientes asignados a este {user.roleLabel.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.leadsAssigned.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.leadsAssigned.map((lead) => (
                      <div key={lead.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{lead.name || 'Sin nombre'}</h4>
                            <p className="text-sm text-gray-600">{lead.email}</p>
                            <p className="text-sm text-gray-600">{lead.phone || 'Sin teléfono'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Asignado: {lead.assignedAt ? new Date(lead.assignedAt).toLocaleDateString('es-ES') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">{lead._count.offers}</div>
                            <div className="text-xs text-gray-600">Ofertas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{lead._count.clientAppointments}</div>
                            <div className="text-xs text-gray-600">Citas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">{lead._count.clientContracts}</div>
                            <div className="text-xs text-gray-600">Contratos</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {user.role === 'AGENT' ? 'No hay leads asignados' : 'Esta funcionalidad es solo para agentes'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Views */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Vistas de Propiedades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.propertyViews.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.propertyViews.map((view) => (
                        <div key={view.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{view.property.title}</p>
                            <p className="text-sm text-gray-600">
                              ${view.property.price.toLocaleString()} • {view.property.type}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(view.viewedAt).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay vistas de propiedades</p>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Desglose de Ingresos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Ingresos por Ofertas</span>
                      <span className="font-semibold text-green-600">
                        ${(performance.revenue?.offers_revenue || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Comisiones</span>
                      <span className="font-semibold text-blue-600">
                        ${(performance.revenue?.commission_revenue || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-t pt-3">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-purple-600">
                        ${((performance.revenue?.offers_revenue || 0) + (performance.revenue?.commission_revenue || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}