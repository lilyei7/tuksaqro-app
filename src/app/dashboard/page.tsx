"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Home, Calendar, FileText, Users, BarChart3, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchDashboardStats()
    }
  }, [session])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
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

  const userRole = (session.user as any)?.role || "CLIENT"

  // Redirigir automáticamente a propietarios a su panel completo
  if (userRole === "OWNER") {
    redirect("/panel-propietario")
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "CLIENT": return "Cliente"
      case "OWNER": return "Propietario"
      case "AGENT": return "Asesor"
      case "ADMIN": return "Administrador"
      default: return "Usuario"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "CLIENT": return "bg-brand-blue/10 text-brand-blue"
      case "OWNER": return "bg-green-100 text-green-800"
      case "AGENT": return "bg-purple-100 text-purple-800"
      case "ADMIN": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDashboardCards = (role: string) => {
    if (!stats) {
      // Datos de carga mientras se obtienen las estadísticas reales
      return [
        { title: "Cargando...", count: "...", icon: BarChart3, description: "Obteniendo datos" }
      ]
    }

    switch (role) {
      case "CLIENT":
        return [
          { title: "Propiedades Favoritas", count: stats.favoriteProperties?.toString() || "0", icon: Home, description: "Propiedades guardadas" },
          { title: "Citas Programadas", count: stats.scheduledAppointments?.toString() || "0", icon: Calendar, description: "Próximas visitas" },
          { title: "Ofertas Realizadas", count: stats.completedOffers?.toString() || "0", icon: FileText, description: "En proceso" },
        ]
      case "OWNER":
        return [
          { title: "Propiedades Totales", count: stats.myProperties?.toString() || "0", icon: Home, description: "Publicadas" },
          { title: "Propiedades Activas", count: stats.activeProperties?.toString() || "0", icon: Home, description: "Disponibles" },
          { title: "Visitas Programadas", count: stats.scheduledVisits?.toString() || "0", icon: Calendar, description: "Esta semana" },
          { title: "Ofertas Recibidas", count: stats.receivedOffers?.toString() || "0", icon: FileText, description: "Pendientes de revisión" },
        ]
      case "AGENT":
        return [
          { title: "Clientes Activos", count: stats.activeClients?.toString() || "0", icon: Users, description: "En seguimiento" },
          { title: "Propiedades", count: stats.managedProperties?.toString() || "0", icon: Home, description: "Bajo gestión" },
          { title: "Citas Hoy", count: stats.todayAppointments?.toString() || "0", icon: Calendar, description: "Programadas" },
        ]
      case "ADMIN":
        return [
          { title: "Usuarios Totales", count: stats.totalUsers?.toString() || "0", icon: Users, description: "Registrados" },
          { title: "Propiedades", count: stats.totalProperties?.toString() || "0", icon: Home, description: "En plataforma" },
          { title: "Transacciones", count: stats.monthlyTransactions?.toString() || "0", icon: BarChart3, description: "Este mes" },
        ]
      default:
        return []
    }
  }

  const cards = getDashboardCards(userRole)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Bienvenido, {session.user?.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Aquí tienes un resumen de tu actividad reciente
              </p>
            </div>
            <Badge className={getRoleColor(userRole)}>
              {getRoleLabel(userRole)}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userRole === "CLIENT" && (
                  <>
                    <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                      <Home className="h-6 w-6 mx-auto mb-2 text-brand-blue" />
                      <span className="text-sm">Buscar Propiedades</span>
                    </button>
                    <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-brand-blue" />
                      <span className="text-sm">Agendar Cita</span>
                    </button>
                  </>
                )}
                {userRole === "OWNER" && (
                  <>
                    <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                      <Home className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <span className="text-sm">Publicar Propiedad</span>
                    </button>
                    <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <span className="text-sm">Ver Ofertas</span>
                    </button>
                  </>
                )}
                {userRole === "AGENT" && (
                  <>
                    <Link href="/dashboard/calendario">
                      <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <span className="text-sm">Mi Calendario</span>
                      </button>
                    </Link>
                    <Link href="/dashboard/disponibilidad">
                      <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <span className="text-sm">Mi Disponibilidad</span>
                      </button>
                    </Link>
                    <Link href="/agent/kpis">
                      <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <span className="text-sm">Ver KPIs</span>
                      </button>
                    </Link>
                    <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <span className="text-sm">Gestionar Clientes</span>
                    </button>
                  </>
                )}
                <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
                  <User className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm">Mi Perfil</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}