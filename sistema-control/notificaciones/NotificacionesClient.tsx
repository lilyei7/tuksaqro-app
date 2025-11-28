'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  writing?: {
    id: string
    status: string
    property: {
      id: string
      title: string
    }
  }
}

interface NotificationsResponse {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function NotificacionesClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<NotificationsResponse['pagination'] | null>(null)

  const fetchNotifications = useCallback(async (page = 1, unreadOnly = false) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/notifications?page=${page}&limit=20&unreadOnly=${unreadOnly}`
      )

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones')
      }

      const data: NotificationsResponse = await response.json()
      setNotifications(data.notifications)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Error al cargar las notificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications(1, filter === 'unread')
  }, [fetchNotifications, filter])

  const handlePageChange = (page: number) => {
    fetchNotifications(page, filter === 'unread')
  }

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId])
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notifications.map(n => n.id))
    } else {
      setSelectedNotifications([])
    }
  }

  const handleBulkAction = async (action: 'markAsRead' | 'markAsUnread' | 'delete') => {
    if (selectedNotifications.length === 0) {
      toast.error('Selecciona al menos una notificación')
      return
    }

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: selectedNotifications,
          action,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar notificaciones')
      }

      toast.success('Notificaciones actualizadas correctamente')

      // Refresh the list
      fetchNotifications(currentPage, filter === 'unread')

      // Clear selection
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast.error('Error al actualizar las notificaciones')
    }
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'CONTRACT_SIGNED':
        return 'bg-green-100 text-green-800'
      case 'WRITING_STATUS':
        return 'bg-blue-100 text-blue-800'
      case 'KPI_ALERT':
        return 'bg-yellow-100 text-yellow-800'
      case 'USER_REGISTERED':
        return 'bg-purple-100 text-purple-800'
      case 'PROPERTY_UPDATED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando notificaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones del Sistema
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={(value: 'all' | 'unread') => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">No leídas</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications(currentPage, filter === 'unread')}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedNotifications.length} notificación(es) seleccionada(s)
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('markAsRead')}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar como leídas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('markAsUnread')}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Marcar como no leídas
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? 'No tienes notificaciones sin leer.'
                  : 'No hay notificaciones en el sistema.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-700">
                Seleccionar todas las notificaciones
              </span>
            </div>

            {/* Notifications */}
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelectNotification(notification.id, checked)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getNotificationTypeColor(notification.type)}>
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            No leída
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Usuario: {notification.user.name || notification.user.email}
                        </span>
                        {notification.writing && (
                          <span>
                            Propiedad: {notification.writing.property.title}
                          </span>
                        )}
                        <span>
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBulkAction('markAsRead')}
                          className="p-1"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}