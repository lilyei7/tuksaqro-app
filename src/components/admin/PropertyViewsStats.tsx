"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Eye,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { toast } from "react-hot-toast"
import SafeImage from "@/components/common/SafeImage"

interface PropertyViewStats {
  period: string
  totalViews: number
  uniquePropertiesViewed: number
  topProperties: Array<{
    id: string
    title: string
    price: number
    currency: string
    status: string
    city: string
    state: string
    images: string
    owner: {
      name: string
    }
    viewCount: number
  }>
  dailyViews: Array<{
    date: string
    views: number
  }>
}

interface PropertyViewsStatsProps {
  className?: string
}

export function PropertyViewsStats({ className }: PropertyViewsStatsProps) {
  const [stats, setStats] = useState<PropertyViewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/property-views?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch property view stats')
        toast.error('Error al cargar estadísticas de visitas')
      }
    } catch (error) {
      console.error('Error fetching property view stats:', error)
      toast.error('Error al cargar estadísticas de visitas')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'SOLD': return 'bg-red-100 text-red-800'
      case 'RENTED': return 'bg-blue-100 text-blue-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible'
      case 'SOLD': return 'Vendida'
      case 'RENTED': return 'Rentada'
      case 'PENDING': return 'Pendiente'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Estadísticas de Visitas
          </CardTitle>
          <CardDescription>
            Cargando estadísticas de visitas a propiedades...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Estadísticas de Visitas
            </CardTitle>
            <CardDescription>
              Propiedades más vistas y estadísticas de engagement
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total de Visitas</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {stats?.totalViews?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Propiedades Vistas</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {stats?.uniquePropertiesViewed?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Promedio por Propiedad</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {stats?.uniquePropertiesViewed ?
                Math.round((stats.totalViews || 0) / stats.uniquePropertiesViewed) : 0
              }
            </p>
          </div>
        </div>

        {/* Top Viewed Properties */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Propiedades Más Vistas
          </h3>

          {stats?.topProperties && stats.topProperties.length > 0 ? (
            <div className="space-y-4">
              {stats.topProperties.map((property, index) => {
                const images = property.images ? JSON.parse(property.images) : []
                const mainImage = images[0] || "/placeholder-property.jpg"

                return (
                  <div
                    key={property.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                      #{index + 1}
                    </div>

                    <div className="w-16 h-16 flex-shrink-0">
                      <SafeImage
                        src={mainImage}
                        alt={property.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {property.city}, {property.state}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(property.price, property.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(property.status)}>
                        {getStatusLabel(property.status)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Visitas</p>
                        <p className="text-lg font-bold text-blue-600">
                          {property.viewCount}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de visitas disponibles</p>
              <p className="text-sm">Las visitas se registrarán automáticamente cuando los usuarios vean las propiedades</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}