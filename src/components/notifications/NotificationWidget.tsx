"use client"

import { useEffect, useState } from "react"
import { Lock, Home, DollarSign, CheckCircle, AlertCircle, Calendar, FileText, Users, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getApiBaseUrl } from "@/lib/api-config"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  PASSWORD_CHANGED: <Lock className="w-4 h-4 text-yellow-500" />,
  NEW_PROPERTY: <Home className="w-4 h-4 text-blue-500" />,
  NEW_OFFER: <DollarSign className="w-4 h-4 text-green-500" />,
  OFFER_ACCEPTED: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  OFFER_REJECTED: <AlertCircle className="w-4 h-4 text-red-500" />,
  NEW_APPOINTMENT: <Calendar className="w-4 h-4 text-purple-500" />,
  APPOINTMENT_CONFIRMED: <CheckCircle className="w-4 h-4 text-green-500" />,
  APPOINTMENT_CANCELLED: <AlertCircle className="w-4 h-4 text-orange-500" />,
  CONTRACT_READY: <FileText className="w-4 h-4 text-indigo-500" />,
  DOCUMENT_UPLOADED: <FileText className="w-4 h-4 text-cyan-500" />,
  SYSTEM_ALERT: <AlertCircle className="w-4 h-4 text-red-500" />,
  PROPERTY_UPDATED: <Home className="w-4 h-4 text-blue-400" />,
  PROPERTY_REMOVED: <AlertCircle className="w-4 h-4 text-red-600" />,
  USER_REGISTERED: <Users className="w-4 h-4 text-slate-500" />,
  USER_VERIFIED: <CheckCircle className="w-4 h-4 text-teal-500" />,
}

interface NotificationWidgetProps {
  limit?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

export function NotificationWidget({ 
  limit = 5, 
  showViewAll = true, 
  onViewAll 
}: NotificationWidgetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/admin/notifications`)
      if (response.ok) {
        const data = await response.json()
        // El endpoint retorna { notifications: [...], pagination: {...} }
        const notificationsArray = Array.isArray(data) ? data : data.notifications || []
        // Filter unread and take only limit
        const filtered = notificationsArray
          .filter((n: Notification) => !n.isRead)
          .slice(0, limit)
        setNotifications(filtered)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Ahora"
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)}h`
    } else {
      return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" })
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">Notificaciones Recientes</h3>
        <p className="text-xs text-slate-500 mt-1">
          {notifications.length === 0 ? "Sin notificaciones nuevas" : `${notifications.length} sin leer`}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No hay notificaciones nuevas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {notificationIcons[notification.type] || (
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {showViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="w-full mt-3 text-blue-600 hover:bg-blue-50"
            >
              Ver todas las notificaciones →
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
