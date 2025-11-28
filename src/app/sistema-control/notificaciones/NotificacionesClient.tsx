"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bell,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  contractId?: string
  writingId?: string
  isRead: boolean
  readAt?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function NotificacionesClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchNotifications()
  }, [pagination.page, filter, typeFilter])

  // 🔴 NUEVO: Escuchar notificaciones en tiempo real via SSE
  useEffect(() => {
    if (typeof window === 'undefined') return

    const eventSource = new EventSource('/api/events/notifications')

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        // Ignorar heartbeat y connected
        if (data.type === 'connected' || data.type === 'heartbeat') {
          return
        }

        // Cuando llega una nueva notificación
        console.log('📢 Nueva notificación recibida:', data)
        
        // Actualizar lista sin necesidad de refrescar
        if (pagination.page === 1) {
          // Si estamos en la primera página, agregar la nueva notificación
          setNotifications(prev => [
            {
              id: data.id || 'temp-' + Date.now(),
              userId: data.userId,
              type: data.type,
              title: data.title,
              message: data.message,
              isRead: false,
              createdAt: new Date().toISOString(),
              user: {
                id: data.userId,
                name: 'Usuario',
                email: 'usuario@email.com',
                role: 'USER'
              }
            },
            ...prev
          ])
          
          // Actualizar contador total
          setPagination(prev => ({
            ...prev,
            total: prev.total + 1,
            pages: Math.ceil((prev.total + 1) / prev.limit)
          }))
        } else {
          // Si no estamos en la primera página, refrescar para sincronizar
          fetchNotifications()
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
  }, [pagination.page, pagination.limit])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter === 'unread' && { unreadOnly: 'true' }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      })

      const response = await fetch(`/api/admin/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setPagination(data.pagination)
      } else {
        toast.error('Error al cargar las notificaciones')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Error al cargar las notificaciones')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, id])
    } else {
      setSelectedNotifications(prev => prev.filter(nId => nId !== id))
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selectedNotifications,
          action
        })
      })

      if (response.ok) {
        // Actualizar notificaciones localmente primero
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            selectedNotifications.includes(notif.id)
              ? {
                  ...notif,
                  isRead: action === 'markAsRead' ? true : action === 'markAsUnread' ? false : notif.isRead,
                  readAt: action === 'markAsRead' ? new Date().toISOString() : action === 'markAsUnread' ? undefined : notif.readAt
                }
              : notif
          )
        )

        // Si es delete, eliminar del estado
        if (action === 'delete') {
          setNotifications(prevNotifications =>
            prevNotifications.filter(notif => !selectedNotifications.includes(notif.id))
          )
        }

        const messages = {
          'markAsRead': 'Notificaciones marcadas como leídas',
          'markAsUnread': 'Notificaciones marcadas como no leídas',
          'delete': 'Notificaciones eliminadas'
        }
        
        toast.success(messages[action] + ' exitosamente')
        setSelectedNotifications([])
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al realizar la acción')
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Error al realizar la acción')
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
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <Bell className="w-8 h-8 text-blue-600" />
                  <span>Notificaciones del Sistema</span>
                </h1>
                <p className="text-gray-600 mt-2">
                  Gestiona todas las notificaciones del sistema inmobiliario
                </p>
              </div>
              <Button
                onClick={fetchNotifications}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Acciones */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
                </div>

                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">No leídas</SelectItem>
                    <SelectItem value="read">Leídas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="CONTRACT_SIGNED">Contrato firmado</SelectItem>
                    <SelectItem value="WRITING_STATUS">Estado de escritura</SelectItem>
                    <SelectItem value="KPI_ALERT">Alerta KPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Acciones en lote */}
              {selectedNotifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleBulkAction('markAsRead')}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Marcar como leídas</span>
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('markAsUnread')}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Marcar como no leídas</span>
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('delete')}
                    variant="destructive"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Notificaciones</span>
                  <Badge variant="secondary">
                    {pagination.total} total
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Página {pagination.page} de {pagination.pages}
                </CardDescription>
              </div>

              {/* Checkbox para seleccionar todas */}
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Seleccionar todas</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay notificaciones para mostrar</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
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
                            <Badge variant="destructive" className="text-xs">
                              No leído
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>

                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>
                              Usuario: <span className="font-medium">{notification.user.name}</span>
                            </span>
                            <span>
                              Rol: <span className="font-medium">{notification.user.role}</span>
                            </span>
                          </div>
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>

                        {notification.contractId && (
                          <div className="mt-2 text-sm text-blue-600">
                            Contrato ID: {notification.contractId}
                          </div>
                        )}

                        {notification.writingId && (
                          <div className="mt-1 text-sm text-blue-600">
                            Escritura ID: {notification.writingId}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {!notification.isRead ? (
                          <Button
                            onClick={() => {
                              setSelectedNotifications([notification.id])
                              // Usar setTimeout para que se actualice el estado primero
                              setTimeout(() => handleBulkAction('markAsRead'), 0)
                            }}
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1 whitespace-nowrap"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Marcar como leído</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedNotifications([notification.id])
                              setTimeout(() => handleBulkAction('markAsUnread'), 0)
                            }}
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1 whitespace-nowrap"
                          >
                            <EyeOff className="w-4 h-4" />
                            <span>Marcar como no leído</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} notificaciones
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                variant="outline"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                variant="outline"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}