"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Home,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Award,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface KPIMetrics {
  activeProperties: number
  appointmentsTotal: number
  appointmentsCompleted: number
  offersCreated: number
  offersAccepted: number
  contractsSigned: number
  contractsClosed: number
  totalSalesValue: number
  commissionEarned: number
  conversionRate: number
  closureRate: number
  avgSalePrice: number
  avgDaysToClose: number
}

interface AgentKPIDashboardProps {
  agentId: string
  agentName: string
}

export function AgentKPIDashboard({ agentId, agentName }: AgentKPIDashboardProps) {
  const [kpis, setKpis] = useState<KPIMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    fetchKPIs()
  }, [agentId])

  const fetchKPIs = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/kpis/agent/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setKpis(data.kpis)
        setLastUpdated(data.lastUpdated)
      }
    } catch (error) {
      console.error("Error cargando KPIs:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(value)
  }

  const kpiCards = [
    {
      title: "Propiedades Activas",
      value: kpis?.activeProperties || 0,
      icon: Home,
      description: "Bajo tu gestión",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Citas Totales",
      value: kpis?.appointmentsTotal || 0,
      icon: Calendar,
      description: "Programadas este mes",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Ofertas Creadas",
      value: kpis?.offersCreated || 0,
      icon: FileText,
      description: "Propuestas enviadas",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Contratos Firmados",
      value: kpis?.contractsSigned || 0,
      icon: Award,
      description: "Acuerdos cerrados",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Valor Total de Ventas",
      value: formatCurrency(kpis?.totalSalesValue || 0),
      icon: DollarSign,
      description: "Ingresos generados",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Comisión Ganada",
      value: formatCurrency(kpis?.commissionEarned || 0),
      icon: TrendingUp,
      description: "Tu ganancia este mes",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Tasa de Conversión",
      value: formatPercentage(kpis?.conversionRate || 0),
      icon: Target,
      description: "Citas → Contratos",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Tasa de Cierre",
      value: formatPercentage(kpis?.closureRate || 0),
      icon: BarChart3,
      description: "Contratos → Cerrados",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            KPIs de {agentName}
          </h2>
          <p className="text-gray-600">
            Rendimiento y métricas de ventas
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {new Date(lastUpdated).toLocaleString('es-ES')}
            </p>
          )}
        </div>
        <Button
          onClick={fetchKPIs}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                </div>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas Adicionales</CardTitle>
            <CardDescription>
              Información detallada de rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(kpis?.appointmentsCompleted || 0)}
                </div>
                <p className="text-sm text-gray-600">Citas Completadas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(kpis?.offersAccepted || 0)}
                </div>
                <p className="text-sm text-gray-600">Ofertas Aceptadas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(kpis?.contractsClosed || 0)}
                </div>
                <p className="text-sm text-gray-600">Contratos Cerrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}