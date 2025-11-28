"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Building,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  Bell,
  Image,
  Calendar,
  LogOut,
  BadgeCheck,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface NotificationCounts {
  unread: number
  total: number
  read: number
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    unread: 0,
    total: 0,
    read: 0,
  })

  useEffect(() => {
    fetchNotificationCounts()
  }, [])

  const fetchNotificationCounts = async () => {
    try {
      const response = await fetch("/api/admin/notifications/count")
      if (response.ok) {
        const data = await response.json()
        setNotificationCounts(data)
      }
    } catch (error) {
      console.error("Error fetching notification counts:", error)
    }
  }

  const isActive = (href: string) => pathname === href

  const menuItems = [
    { href: "/sistema-control", label: "Dashboard", icon: TrendingUp },
    { href: "/sistema-control/usuarios", label: "Usuarios", icon: Users },
    { href: "/sistema-control/propiedades", label: "Propiedades", icon: Building },
    { href: "/sistema-control/verificacion-documentos", label: "Verificación de INE", icon: BadgeCheck },
    { href: "/sistema-control/hero-images", label: "Imágenes Hero", icon: Image },
    { href: "/sistema-control/ofertas", label: "Ofertas", icon: FileText },
    { href: "/sistema-control/calendario", label: "Calendario de Citas", icon: Calendar },
    { href: "/sistema-control/notificaciones", label: "Notificaciones", icon: Bell, badge: notificationCounts.unread },
    { href: "/sistema-control/configuracion", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-white to-blue-50/30 shadow-lg min-h-screen border-r border-blue-100 flex flex-col">
      <nav className="mt-8 px-4 flex-1">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform ${
                  active
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md scale-105 border border-blue-400"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 hover:shadow-sm"
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-blue-500"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse min-w-[24px] text-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-100">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform text-gray-600 hover:bg-red-50 hover:text-red-700 hover:scale-102 hover:shadow-sm"
        >
          <LogOut className="w-5 h-5 transition-colors text-red-500" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
