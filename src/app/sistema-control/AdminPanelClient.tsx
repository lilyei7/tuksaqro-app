"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building,
  FileText,
  TrendingUp,
  Eye,
  Shield,
  Settings,
  ArrowRight,
  Activity,
  AlertTriangle,
  CheckCircle,
  Bell,
  Image,
  BadgeCheck
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

interface AdminStats {
  stats: {
    totalUsers: number
    totalProperties: number
    totalOffers: number
    pendingOffers: number
    newUsersLast30Days: number
    newPropertiesLast30Days: number
    newOffersLast30Days: number
  }
  recent: {
    users: Array<{
      id: string
      name: string
      email: string
      role: string
      createdAt: string
      emailVerified: boolean
    }>
    properties: Array<{
      id: string
      title: string
      price: number
      status: string
      createdAt: string
      owner: {
        name: string
        email: string
      }
    }>
    offers: Array<{
      id: string
      amount: number
      status: string
      createdAt: string
      user: {
        name: string
        email: string
      }
      property: {
        title: string
        price: number
      }
    }>
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  emailVerified: boolean
}

interface Property {
  id: string
  title: string
  price: number
  status: string
  createdAt: string
  owner: {
    name: string
    email: string
  }
}

interface Offer {
  id: string
  amount: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  property: {
    title: string
    price: number
  }
}

export default function AdminPanelClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notificationCounts, setNotificationCounts] = useState({ unread: 0, total: 0, read: 0, pendingINECount: 0 })
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  useEffect(() => {
    // Verificación de sesión en el cliente como respaldo
    if (status === "loading") return

    if (!session || (session.user as any)?.role !== "ADMIN") {
      console.log('CLIENT: No admin session, redirecting to admin login')
      router.push("/admin/login?callbackUrl=/sistema-control")
      return
    }

    console.log('CLIENT: Admin access granted')
    fetchStats()
    fetchNotificationCounts()
  }, [session, status, router])

  // 🔴 NUEVO: Escuchar eventos de admins en tiempo real via SSE
  useEffect(() => {
    if (typeof window === 'undefined' || !session) return

    const eventSource = new EventSource('/api/events/admin-notifications')

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        // Ignorar heartbeat y connected
        if (data.type === 'admin-connected' || data.type === 'heartbeat') {
          return
        }

        // Cuando hay un nuevo INE o cambios en documentos
        console.log('📢 Evento de admin recibido:', data)

        // Refrescar conteos
        if (data.type === 'INE_SUBMITTED') {
          setNotificationCounts(prev => ({
            ...prev,
            pendingINECount: (prev.pendingINECount || 0) + 1,
            unread: (prev.unread || 0) + 1
          }))
          toast.success('Nuevo INE para verificar!')
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
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotificationCounts = async () => {
    try {
      const response = await fetch('/api/admin/notifications/count')
      if (response.ok) {
        const data = await response.json()
        console.log('Notification counts fetched:', data)
        setNotificationCounts(data)
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error)
      setNotificationCounts({ unread: 0, total: 0, read: 0, pendingINECount: 0 })
    } finally {
      setNotificationsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando permisos...</h2>
          <p className="text-gray-600">Acceso exclusivo para administradores</p>
        </div>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return null // El useEffect se encargará de la redirección
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard Admin */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Admin: {session.user?.name}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar de Navegación */}
      <div className="flex">
        <div className="w-64 bg-gradient-to-b from-white to-blue-50/30 shadow-lg min-h-screen border-r border-blue-100">
          <nav className="mt-8 px-4">
            <div className="space-y-1">
              <Link href="/sistema-control" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md scale-105 border border-blue-400">
                <TrendingUp className="w-5 h-5 transition-colors text-white" />
                <span>Dashboard</span>
              </Link>
              <Link href="/sistema-control/usuarios" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <Users className="w-5 h-5 transition-colors text-blue-500" />
                <span>Usuarios</span>
              </Link>
              <Link href="/sistema-control/propiedades" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <Building className="w-5 h-5 transition-colors text-blue-500" />
                <span>Propiedades</span>
              </Link>
              <Link href="/sistema-control/hero-images" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <Image className="w-5 h-5 transition-colors text-blue-500" />
                <span>Imágenes Hero</span>
              </Link>
              <Link href="/sistema-control/ofertas" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <FileText className="w-5 h-5 transition-colors text-blue-500" />
                <span>Ofertas</span>
              </Link>
              <Link href="/sistema-control/calendario" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <Activity className="w-5 h-5 transition-colors text-blue-500" />
                <span>Calendario de Citas</span>
              </Link>
              <Link href="/sistema-control/verificacion-documentos" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <BadgeCheck className="w-5 h-5 transition-colors text-blue-500" />
                <span>Verificación de INE</span>
                {notificationCounts.pendingINECount > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse min-w-[24px] text-center">
                    {notificationCounts.pendingINECount > 99 ? '99+' : notificationCounts.pendingINECount}
                  </span>
                )}
              </Link>
              <Link href="/sistema-control/notificaciones" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <Bell className="w-5 h-5 transition-colors text-blue-500" />
                <span>Notificaciones</span>
                {notificationCounts.unread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse min-w-[24px] text-center">
                    {notificationCounts.unread > 99 ? '99+' : notificationCounts.unread}
                  </span>
                )}
              </Link>
              <Link href="/sistema-control/configuracion" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm">
                <Settings className="w-5 h-5 transition-colors text-blue-500" />
                <span>Configuración</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header de la Página */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <span>Dashboard Administrativo</span>
              </h2>
              <p className="text-gray-600 mt-2">Vista general del sistema inmobiliario y acceso a todas las funciones de administración</p>
            </div>

            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.stats.totalUsers || 0}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{stats?.stats.newUsersLast30Days || 0} este mes
                      </p>
                    </div>
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.stats.totalProperties || 0}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{stats?.stats.newPropertiesLast30Days || 0} este mes
                      </p>
                    </div>
                    <Building className="w-12 h-12 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Ofertas</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.stats.totalOffers || 0}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{stats?.stats.newOffersLast30Days || 0} este mes
                      </p>
                    </div>
                    <FileText className="w-12 h-12 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ofertas Pendientes</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.stats.pendingOffers || 0}</p>
                      <p className="text-sm text-orange-600 flex items-center mt-1">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Requieren atención
                      </p>
                    </div>
                    <Activity className="w-12 h-12 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secciones de Gestión */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Gestión de Usuarios</span>
                  </CardTitle>
                  <CardDescription>
                    Administrar usuarios, roles y permisos del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Usuarios activos:</span>
                      <Badge variant="secondary">{stats?.stats.totalUsers || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Nuevos este mes:</span>
                      <Badge variant="outline">{stats?.stats.newUsersLast30Days || 0}</Badge>
                    </div>
                    <Link href="/sistema-control/usuarios">
                      <Button className="w-full flex items-center justify-center space-x-2">
                        <span>Gestionar Usuarios</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-green-600" />
                    <span>Gestión de Propiedades</span>
                  </CardTitle>
                  <CardDescription>
                    Administrar propiedades, precios y estados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Propiedades activas:</span>
                      <Badge variant="secondary">{stats?.stats.totalProperties || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Nuevas este mes:</span>
                      <Badge variant="outline">{stats?.stats.newPropertiesLast30Days || 0}</Badge>
                    </div>
                    <Link href="/sistema-control/propiedades">
                      <Button className="w-full flex items-center justify-center space-x-2">
                        <span>Gestionar Propiedades</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span>Gestión de Ofertas</span>
                  </CardTitle>
                  <CardDescription>
                    Revisar y aprobar ofertas de compra
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Ofertas totales:</span>
                      <Badge variant="secondary">{stats?.stats.totalOffers || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Pendientes:</span>
                      <Badge variant="destructive">{stats?.stats.pendingOffers || 0}</Badge>
                    </div>
                    <Link href="/sistema-control/ofertas">
                      <Button className="w-full flex items-center justify-center space-x-2">
                        <span>Gestionar Ofertas</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Configuración del Sistema</span>
                  </CardTitle>
                  <CardDescription>
                    Configurar parámetros generales y seguridad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Estado del sistema:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Operativo
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Última actualización:</span>
                      <span className="text-gray-500">Ahora</span>
                    </div>
                    <Link href="/sistema-control/configuracion">
                      <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                        <span>Configurar Sistema</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Actividad Reciente</span>
                </CardTitle>
                <CardDescription>
                  Últimas acciones realizadas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recent.users.slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">Nuevo usuario</Badge>
                    </div>
                  ))}
                  {stats?.recent.properties.slice(0, 2).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">{property.title}</p>
                          <p className="text-xs text-gray-500">${property.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">Nueva propiedad</Badge>
                    </div>
                  ))}
                  {(!stats?.recent.users.length && !stats?.recent.properties.length) && (
                    <p className="text-center text-gray-500 py-4">No hay actividad reciente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}