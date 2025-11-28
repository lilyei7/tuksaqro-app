"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building,
  FileText,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { PropertyViewsStats } from "@/components/admin/PropertyViewsStats"

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch stats')
        toast.error('Error al cargar estadísticas')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Error al cargar estadísticas')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h2>
          <p className="text-gray-600 mt-1">Bienvenido al panel de control del sistema</p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 transition-colors">
          <Activity className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Usuarios</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats?.stats.totalUsers || 0}</div>
            <p className="text-xs text-blue-600 font-medium">
              +{stats?.stats.newUsersLast30Days || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Propiedades</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <Building className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats?.stats.totalProperties || 0}</div>
            <p className="text-xs text-green-600 font-medium">
              +{stats?.stats.newPropertiesLast30Days || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Ofertas</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats?.stats.totalOffers || 0}</div>
            <p className="text-xs text-purple-600 font-medium">
              +{stats?.stats.newOffersLast30Days || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Ofertas Pendientes</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats?.stats.pendingOffers || 0}</div>
            <p className="text-xs text-orange-600 font-medium">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card className="hover:shadow-lg transition-all duration-300 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
            <CardTitle className="text-lg text-blue-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Usuarios Recientes
            </CardTitle>
            <CardDescription>Últimos usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recent.users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Badge variant={user.emailVerified ? "default" : "secondary"} className="text-xs">
                  {user.emailVerified ? "Verificado" : "Pendiente"}
                </Badge>
              </div>
            ))}
            {(!stats?.recent.users || stats.recent.users.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No hay usuarios recientes</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Properties */}
        <Card className="hover:shadow-lg transition-all duration-300 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-100">
            <CardTitle className="text-lg text-green-800 flex items-center">
              <Building className="w-5 h-5 mr-2 text-green-600" />
              Propiedades Recientes
            </CardTitle>
            <CardDescription>Últimas propiedades agregadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recent.properties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Building className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{property.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    ${property.price.toLocaleString()} • {property.owner.name}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {property.status}
                </Badge>
              </div>
            ))}
            {(!stats?.recent.properties || stats.recent.properties.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No hay propiedades recientes</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Offers */}
        <Card className="hover:shadow-lg transition-all duration-300 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-100">
            <CardTitle className="text-lg text-purple-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Ofertas Recientes
            </CardTitle>
            <CardDescription>Últimas ofertas realizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recent.offers.slice(0, 5).map((offer) => (
              <div key={offer.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    ${offer.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {offer.user.name} • {offer.property.title}
                  </p>
                </div>
                <Badge
                  variant={offer.status === 'ACCEPTED' ? 'default' : offer.status === 'REJECTED' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {offer.status}
                </Badge>
              </div>
            ))}
            {(!stats?.recent.offers || stats.recent.offers.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No hay ofertas recientes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Views Statistics */}
      <PropertyViewsStats />

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-200">
          <CardTitle className="text-xl text-slate-800 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-slate-600" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription className="text-slate-600">Accede rápidamente a las secciones más importantes</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/sistema-control/usuarios">
              <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Button>
            </Link>
            <Link href="/sistema-control/propiedades">
              <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" variant="outline">
                <Building className="w-4 h-4 mr-2" />
                Gestionar Propiedades
              </Button>
            </Link>
            <Link href="/sistema-control/hero-images">
              <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Imágenes del Hero
              </Button>
            </Link>
            <Link href="/sistema-control/ofertas">
              <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Gestionar Ofertas
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}