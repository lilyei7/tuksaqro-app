"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Bell,
  Download,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Building,
  Users,
  FileSignature,
  Camera,
  Upload,
  Settings
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface DashboardStats {
  properties: number
  activeOffers: number
  upcomingAppointments: number
  contracts: number
  totalValue: number
}

export default function PanelPropietarioPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    if (session?.user) {
      fetchOwnerStats()
    }
  }, [session])

  const fetchOwnerStats = async () => {
    try {
      const response = await fetch("/api/dashboard/owner-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    redirect("/auth/login")
  }

  const userRole = (session.user as any)?.role
  if (userRole !== "OWNER") {
    redirect("/dashboard")
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "properties", label: "Mis Propiedades", icon: Building },
    { id: "offers", label: "Ofertas Recibidas", icon: DollarSign },
    { id: "appointments", label: "Citas Programadas", icon: Calendar },
    { id: "contracts", label: "Contratos", icon: FileSignature },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "reports", label: "Reportes", icon: TrendingUp },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "settings", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Propietario</h1>
              <p className="text-gray-600">Gestiona tus propiedades y transacciones</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Propietario
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="dashboard" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mis Propiedades</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats?.properties || 0}</div>
                        <p className="text-xs text-muted-foreground">Propiedades activas</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeOffers || 0}</div>
                        <p className="text-xs text-muted-foreground">Pendientes de respuesta</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Citas Próximas</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</div>
                        <p className="text-xs text-muted-foreground">Esta semana</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalValue?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">En propiedades</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                    <CardDescription>Funcionalidades más utilizadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/mis-propiedades">
                        <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                          <Building className="h-6 w-6" />
                          <span className="text-xs">Nueva Propiedad</span>
                        </Button>
                      </Link>

                      <Link href="/ofertas">
                        <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                          <DollarSign className="h-6 w-6" />
                          <span className="text-xs">Ver Ofertas</span>
                        </Button>
                      </Link>

                      <Link href="/citas">
                        <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                          <Calendar className="h-6 w-6" />
                          <span className="text-xs">Agendar Cita</span>
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center space-y-2"
                        onClick={() => setActiveTab("reports")}
                      >
                        <Download className="h-6 w-6" />
                        <span className="text-xs">Descargar Reporte</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Últimas actualizaciones en tus propiedades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nueva oferta recibida</p>
                          <p className="text-xs text-gray-500">Casa en Las Condes - $450.000.000</p>
                        </div>
                        <Badge variant="secondary">Hace 2 horas</Badge>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Cita confirmada</p>
                          <p className="text-xs text-gray-500">Visita a departamento en Providencia</p>
                        </div>
                        <Badge variant="secondary">Hace 1 día</Badge>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Documento pendiente</p>
                          <p className="text-xs text-gray-500">Firma de contrato de intermediación</p>
                        </div>
                        <Badge variant="secondary">Hace 3 días</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Propiedades</CardTitle>
                    <CardDescription>Gestiona tus propiedades inmobiliarias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Accede a la gestión completa de tus propiedades</p>
                      <Link href="/mis-propiedades">
                        <Button>Ir a Mis Propiedades</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="offers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ofertas Recibidas</CardTitle>
                    <CardDescription>Revisa y gestiona las ofertas en tus propiedades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Gestiona ofertas, contraofertas y aceptaciones</p>
                      <Link href="/ofertas">
                        <Button>Ver Ofertas</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Citas Programadas</CardTitle>
                    <CardDescription>Gestiona las visitas a tus propiedades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Programa y administra citas con potenciales compradores</p>
                      <Link href="/citas">
                        <Button>Ver Citas</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contracts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contratos y Documentos</CardTitle>
                    <CardDescription>Firma contratos y administra documentos legales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <FileSignature className="h-8 w-8 text-blue-500 mb-2" />
                          <h3 className="font-medium">Contrato de Intermediación</h3>
                          <p className="text-sm text-gray-500 mb-3">Documento base para la venta</p>
                          <Button size="sm" variant="outline">Firmar Digitalmente</Button>
                        </div>

                        <div className="border rounded-lg p-4">
                          <FileText className="h-8 w-8 text-green-500 mb-2" />
                          <h3 className="font-medium">Promesa de Compraventa</h3>
                          <p className="text-sm text-gray-500 mb-3">Acuerdo preliminar de venta</p>
                          <Button size="sm" variant="outline">Revisar Documento</Button>
                        </div>

                        <div className="border rounded-lg p-4">
                          <Upload className="h-8 w-8 text-purple-500 mb-2" />
                          <h3 className="font-medium">Cargar Documentos</h3>
                          <p className="text-sm text-gray-500 mb-3">Sube certificados y documentos</p>
                          <Button size="sm" variant="outline">Subir Archivos</Button>
                        </div>

                        <div className="border rounded-lg p-4">
                          <CheckCircle className="h-8 w-8 text-orange-500 mb-2" />
                          <h3 className="font-medium">Seguimiento de Proceso</h3>
                          <p className="text-sm text-gray-500 mb-3">Estado actual de la transacción</p>
                          <Button size="sm" variant="outline">Ver Progreso</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Documentos</CardTitle>
                    <CardDescription>Administra todos los documentos relacionados con tus propiedades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="font-medium">Certificado de Dominio</p>
                              <p className="text-sm text-gray-500">Casa en Las Condes</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Completado</Badge>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Camera className="h-6 w-6 text-green-500" />
                            <div>
                              <p className="font-medium">Fotos de la Propiedad</p>
                              <p className="text-sm text-gray-500">12 fotos subidas</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Completado</Badge>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-6 w-6 text-yellow-500" />
                            <div>
                              <p className="font-medium">Certificado de Avalúo</p>
                              <p className="text-sm text-gray-500">Pendiente de carga</p>
                            </div>
                          </div>
                          <Badge variant="destructive">Pendiente</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reportes y Estadísticas</CardTitle>
                    <CardDescription>Descarga reportes semanales y analiza el rendimiento de tus propiedades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Download className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="font-medium">Reporte Semanal</p>
                              <p className="text-sm text-gray-500">Resumen de actividad de la semana</p>
                            </div>
                          </div>
                          <Button size="sm">Descargar PDF</Button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                            <div>
                              <p className="font-medium">Análisis de Mercado</p>
                              <p className="text-sm text-gray-500">Tendencias y precios en tu zona</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Descargar Excel</Button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="h-6 w-6 text-purple-500" />
                            <div>
                              <p className="font-medium">Estadísticas de Visitas</p>
                              <p className="text-sm text-gray-500">Interés generado en tus propiedades</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Ver Detalles</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>Mantente al día con todas las actualizaciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start space-x-3">
                          <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-blue-900">Nueva oferta recibida</p>
                            <p className="text-sm text-blue-700">Has recibido una oferta de $420.000.000 por tu casa en Las Condes</p>
                            <p className="text-xs text-blue-600 mt-1">Hace 2 horas</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-green-900">Cita confirmada</p>
                            <p className="text-sm text-green-700">La cita para visitar tu departamento ha sido confirmada para mañana a las 15:00</p>
                            <p className="text-xs text-green-600 mt-1">Hace 1 día</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-yellow-900">Documento pendiente</p>
                            <p className="text-sm text-yellow-700">Necesitas firmar el contrato de intermediación para continuar con la venta</p>
                            <p className="text-xs text-yellow-600 mt-1">Hace 3 días</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración del Perfil</CardTitle>
                    <CardDescription>Personaliza tu experiencia como propietario</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Preferencias de Notificaciones</h3>
                        <p className="text-sm text-gray-500 mb-3">Configura cómo quieres recibir las actualizaciones</p>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Notificaciones de nuevas ofertas</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Recordatorios de citas</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Actualizaciones de contratos</span>
                          </label>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Preferencias de Propiedades</h3>
                        <p className="text-sm text-gray-500 mb-3">Configura cómo manejar las visitas y ofertas</p>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Dejar llaves para visitas</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Aceptar visitas sin cita previa</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}