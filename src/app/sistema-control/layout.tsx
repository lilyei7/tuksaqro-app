"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificación de sesión en el cliente
    if (status === "loading") return

    if (!session || (session.user as any)?.role !== "ADMIN") {
      console.log('LAYOUT: No admin session, redirecting to admin login')
      router.push("/admin/login?callbackUrl=" + pathname)
      return
    }

    console.log('LAYOUT: Admin access granted')
  }, [session, status, router, pathname])

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    )
  }

  // Si no hay sesión o no es admin, no renderizar nada (el useEffect se encargará de la redirección)
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header del Dashboard Admin */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 shadow-xl border-b border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                Admin: {session.user?.name}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar de Navegación y Contenido */}
      <div className="flex">
        <AdminSidebar />

        {/* Contenido Principal */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}