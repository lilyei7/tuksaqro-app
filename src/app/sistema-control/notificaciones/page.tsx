"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Trash2, CheckCircle, Clock, AlertCircle, FileText, Calendar, Home, DollarSign, Users, Lock, FileCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getApiBaseUrl } from "@/lib/api-config"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  readAt?: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  PASSWORD_CHANGED: <Lock className="w-5 h-5 text-yellow-500" />,
  NEW_PROPERTY: <Home className="w-5 h-5 text-blue-500" />,
  NEW_OFFER: <DollarSign className="w-5 h-5 text-green-500" />,
  OFFER_ACCEPTED: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  OFFER_REJECTED: <AlertCircle className="w-5 h-5 text-red-500" />,
  NEW_APPOINTMENT: <Calendar className="w-5 h-5 text-purple-500" />,
  APPOINTMENT_CONFIRMED: <CheckCircle className="w-5 h-5 text-green-500" />,
  APPOINTMENT_CANCELLED: <AlertCircle className="w-5 h-5 text-orange-500" />,
  CONTRACT_READY: <FileText className="w-5 h-5 text-indigo-500" />,
  DOCUMENT_UPLOADED: <FileText className="w-5 h-5 text-cyan-500" />,
  SYSTEM_ALERT: <AlertCircle className="w-5 h-5 text-red-500" />,
  PROPERTY_UPDATED: <Home className="w-5 h-5 text-blue-400" />,
  PROPERTY_REMOVED: <AlertCircle className="w-5 h-5 text-red-600" />,
  USER_REGISTERED: <Users className="w-5 h-5 text-slate-500" />,
  USER_VERIFIED: <CheckCircle className="w-5 h-5 text-teal-500" />,
  VERIFICATION_APPROVED: <CheckCircle className="w-5 h-5 text-green-500" />,
  VERIFICATION_REJECTED: <AlertCircle className="w-5 h-5 text-red-500" />,
  INE_SUBMITTED: <FileCheck className="w-5 h-5 text-blue-600" />,
}

const notificationColors: Record<string, string> = {
  PASSWORD_CHANGED: "bg-yellow-50 border-yellow-200",
  NEW_PROPERTY: "bg-blue-50 border-blue-200",
  NEW_OFFER: "bg-green-50 border-green-200",
  OFFER_ACCEPTED: "bg-emerald-50 border-emerald-200",
  OFFER_REJECTED: "bg-red-50 border-red-200",
  NEW_APPOINTMENT: "bg-purple-50 border-purple-200",
  APPOINTMENT_CONFIRMED: "bg-green-50 border-green-200",
  APPOINTMENT_CANCELLED: "bg-orange-50 border-orange-200",
  CONTRACT_READY: "bg-indigo-50 border-indigo-200",
  DOCUMENT_UPLOADED: "bg-cyan-50 border-cyan-200",
  SYSTEM_ALERT: "bg-red-50 border-red-200",
  PROPERTY_UPDATED: "bg-blue-50 border-blue-200",
  PROPERTY_REMOVED: "bg-red-50 border-red-200",
  USER_REGISTERED: "bg-slate-50 border-slate-200",
  USER_VERIFIED: "bg-teal-50 border-teal-200",
  VERIFICATION_APPROVED: "bg-green-50 border-green-200",
  VERIFICATION_REJECTED: "bg-red-50 border-red-200",
  INE_SUBMITTED: "bg-blue-50 border-blue-200",
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/admin/notifications`)
      if (!response.ok) throw new Error("Failed to fetch notifications")
      const data = await response.json()
      // El endpoint retorna { notifications: [...], pagination: {...} }
      const notificationsArray = Array.isArray(data) ? data : data.notifications || []
      setNotifications(notificationsArray)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return // Evitar clicks múltiples
    
    try {
      setProcessingIds((prev) => new Set(prev).add(notificationId))
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/admin/notifications/${notificationId}`, {
        method: "PUT",
      })
      
      // Si es 404, la notificación no existe
      if (response.status === 404) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        return
      }
      
      if (!response.ok) throw new Error("Failed to mark as read")
      
      const updatedNotification = await response.json()
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: updatedNotification.isRead, readAt: updatedNotification.readAt }
            : n
        )
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Refetch on error to ensure consistency
      await fetchNotifications()
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(notificationId)
        return next
      })
    }
  }

  const handleDelete = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return // Evitar clicks múltiples
    
    try {
      setProcessingIds((prev) => new Set(prev).add(notificationId))
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/admin/notifications/${notificationId}`, {
        method: "DELETE",
      })
      
      // Siempre remover del estado local si la respuesta es éxito
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        return
      }
      
      // Si es 404, también remover (no existe)
      if (response.status === 404) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        return
      }
      
      throw new Error("Failed to delete notification")
    } catch (error) {
      console.error("Error deleting notification:", error)
      // Refetch on error to ensure consistency
      await fetchNotifications()
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(notificationId)
        return next
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/admin/notifications/read-all`, {
        method: "PUT",
      })
      if (!response.ok) throw new Error("Failed to mark all as read")
      
      // After successful update, refetch all notifications to ensure consistency
      await fetchNotifications()
    } catch (error) {
      console.error("Error marking all as read:", error)
      // Refetch on error to ensure consistency
      await fetchNotifications()
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead
    if (filter === "read") return n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Hace unos minutos"
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`
    } else if (diffInHours < 48) {
      return "Ayer"
    } else {
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notificaciones</h1>
          <p className="text-slate-600 mt-1">
            Tienes{" "}
            <span className="font-semibold text-blue-600">{unreadCount}</span>{" "}
            notificación{unreadCount !== 1 ? "es" : ""} sin leer
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todas ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
          className={filter === "unread" ? "bg-blue-600" : ""}
        >
          Sin leer ({unreadCount})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          onClick={() => setFilter("read")}
        >
          Leídas ({notifications.filter((n) => n.isRead).length})
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Sin notificaciones
          </h3>
          <p className="text-slate-500">
            {filter === "unread"
              ? "No tienes notificaciones sin leer"
              : filter === "read"
              ? "No tienes notificaciones leídas"
              : "No tienes notificaciones"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${
                notificationColors[notification.type] || "bg-slate-50 border-slate-200"
              } ${!notification.isRead ? "border-l-blue-600 shadow-sm" : "border-l-slate-300"}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-1 flex-shrink-0">
                  {notificationIcons[notification.type] || (
                    <AlertCircle className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {notification.title}
                      </h3>
                      <p className="text-slate-700 mt-1 text-sm leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Badge className="bg-blue-600 whitespace-nowrap ml-2">
                        Nuevo
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-current border-opacity-10">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(notification.createdAt)}
                    </span>

                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          handleMarkAsRead(notification.id)
                        }
                        disabled={processingIds.has(notification.id)}
                        className="text-xs h-7 px-2 gap-1"
                      >
                          <CheckCircle className="w-3 h-3" />
                          Marcar como leída
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notification.id)}
                        disabled={processingIds.has(notification.id)}
                        className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}