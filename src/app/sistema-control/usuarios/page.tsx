"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  ArrowLeft,
  MoreHorizontal,
  Ban,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Building,
  Calendar,
  FileText
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { getApiUrl } from "@/lib/utils/api"
import { useSession } from "next-auth/react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "CLIENT" | "OWNER" | "AGENT" | "ADMIN" | "PARTNER"
  emailVerified: boolean
  createdAt: string
  _count?: {
    properties: number
    offers: number
    clientAppointments: number
    agentAppointments: number
    clientContracts: number
    agentContracts: number
    assignedLeads: number
    sentMessages: number
    digitalSignatures: number
    buyerWritings: number
    sellerWritings: number
    agentWritings: number
    notifications: number
    contractTemplates: number
    propertyViews: number
  }
  // Campos de baneo
  isBanned: boolean
  bannedAt?: string
  bannedReason?: string
  bannedBy?: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [userToBan, setUserToBan] = useState<User | null>(null)
  const [banReason, setBanReason] = useState("")
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CLIENT" as "CLIENT" | "OWNER" | "AGENT" | "ADMIN" | "PARTNER",
    password: "",
    confirmPassword: ""
  })
  
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CLIENT" as "CLIENT" | "OWNER" | "AGENT" | "ADMIN" | "PARTNER"
  })
  
  // Usar useRef para evitar llamadas múltiples a fetchUsers
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (showLoading = false, customSearch = "", customRole = "") => {
    if (showLoading) {
      setIsRefreshingUsers(true)
    }
    try {
      // Usar los parámetros personalizados si se proporcionan, de lo contrario usar el estado actual
      const search = customSearch || searchTerm
      const role = customRole || roleFilter
      
      const params = new URLSearchParams({
        search,
        role,
      })

      console.log('[FETCH USERS] Parámetros de búsqueda:', { search, role })
      const response = await fetch(getApiUrl(`/api/admin/users?${params}`), {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      console.log('[FETCH USERS] Respuesta del servidor:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[FETCH USERS] Datos recibidos:', data)
        console.log('[FETCH USERS] Cantidad de usuarios:', data.users?.length)
        setUsers(data.users || [])
        console.log('[FETCH USERS] setUsers llamado, estado actualizado')
        if (showLoading) {
          toast.success("Lista de usuarios actualizada")
          console.log('[FETCH USERS] Toast mostrado')
        }
      } else {
        console.log('[FETCH USERS] Error en respuesta:', response.statusText)
        toast.error("Error al cargar usuarios")
      }
    } catch (error) {
      console.error("[FETCH USERS] Error fetching users:", error)
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
      if (showLoading) {
        setIsRefreshingUsers(false)
      }
    }
  }

  // Usar debounce para los cambios de filtro
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current)
    }
    
    filterTimeoutRef.current = setTimeout(() => {
      console.log('[FILTER CHANGE] Búsqueda o rol cambió, refrescando usuarios')
      fetchUsers()
    }, 300)

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
    }
  }, [searchTerm, roleFilter])

  // Verificar que el usuario esté autenticado como admin
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes estar autenticado como administrador para acceder a esta página.</p>
          <Link href="/admin/login">
            <Button>Iniciar Sesión como Admin</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleUserAction = async (action: string, userId: string, reason?: string) => {
    console.log('[USER ACTION] Ejecutando acción:', action, 'para usuario:', userId)
    try {
      const body: any = { action }
      if (reason) body.reason = reason

      const response = await fetch(getApiUrl(`/api/admin/users/${userId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[USER ACTION] Resultado exitoso:', result)
        
        // ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
        console.log('[USER ACTION] Actualizando estado local del usuario')
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.id === userId) {
              return { ...user, ...result.user }
            }
            return user
          })
        })
        
        toast.success(result.message || 'Usuario actualizado exitosamente')
        
        // NO refrescar inmediatamente - confiar en el estado local
      } else {
        const error = await response.json()
        console.log('[USER ACTION] Error:', error)
        toast.error(error.error || 'Error al actualizar usuario')
      }
    } catch (error) {
      console.error('[USER ACTION] Error de conexión:', error)
      toast.error('Error de conexión')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      console.log('No hay usuario para eliminar')
      return
    }

    // Verificar que no se esté eliminando ya
    if (isDeletingUser) {
      console.log('Ya se está eliminando un usuario, ignorando petición duplicada')
      return
    }

    // Verificar que el usuario esté autenticado como admin
    if (!session || session.user?.role !== 'ADMIN') {
      console.log('Usuario no autenticado como admin:', session)
      toast.error('Debes estar autenticado como administrador')
      return
    }

    console.log('[DELETE USER] Intentando eliminar usuario:', userToDelete.id, 'por admin:', session.user.email)
    setIsDeletingUser(true)
    
    const userIdToDelete = userToDelete.id
    
    try {
      const apiUrl = getApiUrl(`/api/admin/users/${userIdToDelete}`)
      console.log('[DELETE USER] URL de la API:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        credentials: 'include'
      })

      console.log('[DELETE USER] Respuesta de la API:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log('[DELETE USER] Resultado exitoso:', result)
        
        // ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
        console.log('[DELETE USER] Actualizando estado local, eliminando usuario del array')
        setUsers(prevUsers => {
          const newUsers = prevUsers.filter(u => u.id !== userIdToDelete)
          console.log('[DELETE USER] Usuarios antes:', prevUsers.length, 'después:', newUsers.length)
          return newUsers
        })
        
        toast.success(result.message || 'Usuario eliminado exitosamente')
        setShowDeleteModal(false)
        setUserToDelete(null)
        
        // NO refrescar inmediatamente - confiar en el estado local
        // El refresco automático de filtros lo manejará si es necesario
      } else {
        const error = await response.json()
        console.log('[DELETE USER] Error de la API:', error)
        toast.error(error.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.log('[DELETE USER] Error de conexión:', error)
      toast.error('Error de conexión')
    } finally {
      setIsDeletingUser(false)
    }
  }

  const handleBanUser = (user: User) => {
    setUserToBan(user)
    setBanReason("")
    setShowBanModal(true)
  }

  const handleUnbanUser = async (user: User) => {
    if (confirm(`¿Estás seguro de que quieres desbanear a ${user.name}?`)) {
      await handleUserAction('unban', user.id)
    }
  }

  const confirmBanUser = async () => {
    if (userToBan && banReason.trim()) {
      await handleUserAction('ban', userToBan.id, banReason)
      setShowBanModal(false)
      setUserToBan(null)
      setBanReason("")
    } else {
      toast.error("Debes especificar una razón para el baneo")
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password) {
      toast.error("Nombre, email y contraseña son obligatorios")
      return
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (newUserData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    console.log('Intentando crear usuario:', newUserData)
    setIsCreatingUser(true)

    try {
      const apiUrl = getApiUrl('/api/admin/users')
      console.log('URL de la API para crear usuario:', apiUrl)

      const requestData = {
        name: newUserData.name,
        email: newUserData.email,
        phone: newUserData.phone,
        role: newUserData.role,
        password: newUserData.password
      }
      console.log('Datos a enviar:', requestData)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        credentials: 'include'
      })

      console.log('Respuesta de creación:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log('[CREATE USER] Resultado exitoso de creación:', result)
        
        // ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
        console.log('[CREATE USER] Actualizando estado local, agregando nuevo usuario')
        setUsers(prevUsers => {
          const newUsers = [result.user, ...prevUsers]
          console.log('[CREATE USER] Usuarios antes:', prevUsers.length, 'después:', newUsers.length)
          return newUsers
        })
        
        toast.success("Usuario creado exitosamente")
        setShowCreateUserModal(false)
        resetNewUserForm()
        
        // NO refrescar inmediatamente - confiar en el estado local
      } else {
        const error = await response.json()
        console.log('Error en creación:', error)
        toast.error(error.error || "Error al crear usuario")
      }
    } catch (error) {
      console.log('Error de conexión en creación:', error)
      toast.error("Error de conexión")
    } finally {
      setIsCreatingUser(false)
    }
  }

  const resetNewUserForm = () => {
    setNewUserData({
      name: "",
      email: "",
      phone: "",
      role: "CLIENT",
      password: "",
      confirmPassword: ""
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userToEdit) {
      console.log('No hay usuario para editar')
      return
    }

    // Validaciones
    if (!editUserData.name.trim() || !editUserData.email.trim()) {
      toast.error("Nombre y email son obligatorios")
      return
    }

    console.log('[EDIT USER] Intentando editar usuario:', userToEdit.id, editUserData)
    setIsEditingUser(true)

    try {
      const apiUrl = getApiUrl(`/api/admin/users/${userToEdit.id}`)
      console.log('[EDIT USER] URL de la API:', apiUrl)

      const requestData = {
        name: editUserData.name,
        email: editUserData.email,
        phone: editUserData.phone,
        role: editUserData.role
      }
      console.log('[EDIT USER] Datos a enviar:', requestData)

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        credentials: 'include'
      })

      console.log('[EDIT USER] Respuesta:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log('[EDIT USER] Resultado exitoso:', result)
        
        // ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
        console.log('[EDIT USER] Actualizando estado local del usuario')
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.id === userToEdit.id) {
              return { ...user, ...result.user }
            }
            return user
          })
        })
        
        toast.success("Usuario actualizado exitosamente")
        setShowEditModal(false)
        setUserToEdit(null)
        
        // NO refrescar inmediatamente - confiar en el estado local
      } else {
        const error = await response.json()
        console.log('[EDIT USER] Error:', error)
        toast.error(error.error || "Error al actualizar usuario")
      }
    } catch (error) {
      console.error('[EDIT USER] Error de conexión:', error)
      toast.error("Error de conexión")
    } finally {
      setIsEditingUser(false)
    }
  }

  const initializeEditData = (user: User) => {
    setEditUserData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de la Página */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <span>Gestión de Usuarios</span>
          </h2>
          <p className="text-gray-600 mt-2">Administra todos los usuarios del sistema inmobiliario</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuarios</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="role-filter">Filtrar por rol</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="CLIENT">Cliente</SelectItem>
                  <SelectItem value="OWNER">Propietario</SelectItem>
                  <SelectItem value="AGENT">Asesor</SelectItem>
                  <SelectItem value="PARTNER">Alianza</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Usuarios ({filteredUsers.length})</span>
                {isRefreshingUsers && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </CardTitle>
              <CardDescription>
                Lista completa de usuarios registrados en el sistema
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(true)}
              disabled={isRefreshingUsers}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingUsers ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
            <Button 
              className="flex items-center space-x-2"
              onClick={() => setShowCreateUserModal(true)}
            >
              <UserPlus className="w-4 h-4" />
              <span>Agregar Usuario</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Usuario</th>
                  <th className="text-left p-3 font-medium text-gray-900">Email</th>
                  <th className="text-left p-3 font-medium text-gray-900">Rol</th>
                  <th className="text-left p-3 font-medium text-gray-900">Estado</th>
                  <th className="text-left p-3 font-medium text-gray-900">Métricas</th>
                  <th className="text-left p-3 font-medium text-gray-900">Registro</th>
                  <th className="text-left p-3 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{user.name}</div>
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          user.role === 'ADMIN' ? 'destructive' :
                          user.role === 'AGENT' ? 'default' :
                          user.role === 'PARTNER' ? 'secondary' : 'outline'
                        }
                      >
                        {user.role === 'CLIENT' ? 'Cliente' :
                         user.role === 'OWNER' ? 'Propietario' :
                         user.role === 'AGENT' ? 'Asesor' :
                         user.role === 'PARTNER' ? 'Alianza' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col space-y-1">
                        <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                          {user.emailVerified ? 'Verificado' : 'Pendiente'}
                        </Badge>
                        {user.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            Baneado
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {user.role === 'ADMIN' ? (
                        <span className="text-xs text-gray-500 italic">Sin métricas</span>
                      ) : (
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>{user._count?.properties || 0}</span>
                          </div>
                          {(user.role === 'AGENT' || user.role === 'PARTNER') && (
                            <>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{(user._count?.clientAppointments || 0) + (user._count?.agentAppointments || 0)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="w-3 h-3" />
                                <span>{(user._count?.clientContracts || 0) + (user._count?.agentContracts || 0)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.isBanned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnbanUser(user)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Desbanear usuario"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        ) : (
                          user.role !== 'ADMIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBanUser(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Banear usuario"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Editar usuario"
                          onClick={() => {
                            setUserToEdit(user)
                            initializeEditData(user)
                            setShowEditModal(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Ver métricas"
                          onClick={() => router.push(`/sistema-control/usuarios/${user.id}/metricas`)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        {user.role !== 'ADMIN' && user.role !== 'CLIENT' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (isDeletingUser) return // Evitar abrir modal si ya se está eliminando
                              setUserToDelete(user)
                              setShowDeleteModal(true)
                            }}
                            disabled={isDeletingUser}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles del Usuario */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Usuario</DialogTitle>
              <DialogDescription>
                Información completa del usuario seleccionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Rol</Label>
                  <Badge variant={selectedUser.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label>Estado</Label>
                  <div className="flex flex-col space-y-1">
                    <Badge variant={selectedUser.emailVerified ? 'default' : 'secondary'}>
                      {selectedUser.emailVerified ? 'Verificado' : 'Pendiente'}
                    </Badge>
                    {selectedUser.isBanned && (
                      <Badge variant="destructive">
                        Baneado
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Fecha de Registro</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <Label>ID de Usuario</Label>
                  <p className="text-sm font-medium font-mono">{selectedUser.id}</p>
                </div>
                {selectedUser.isBanned && (
                  <>
                    <div>
                      <Label>Fecha de Baneo</Label>
                      <p className="text-sm font-medium">
                        {selectedUser.bannedAt ? new Date(selectedUser.bannedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label>Razón del Baneo</Label>
                      <p className="text-sm font-medium">{selectedUser.bannedReason || 'No especificada'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Baneo */}
      {showBanModal && userToBan && (
        <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Banear Usuario</span>
              </DialogTitle>
              <DialogDescription>
                Estás a punto de banear a <strong>{userToBan.name}</strong> ({userToBan.email}).
                Esta acción restringirá su acceso al sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ban-reason">Razón del baneo *</Label>
                <Textarea
                  id="ban-reason"
                  placeholder="Especifica la razón del baneo (ej: violación de términos y condiciones, comportamiento inapropiado, etc.)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Advertencia:</strong> El usuario baneado no podrá acceder al sistema hasta que sea desbaneado.
                    Asegúrate de que la razón sea válida y justificada.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBanModal(false)
                  setUserToBan(null)
                  setBanReason("")
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBanUser}
                disabled={!banReason.trim()}
              >
                Banear Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Eliminar Usuario */}
      {showDeleteModal && userToDelete && (
        <Dialog open={showDeleteModal} onOpenChange={(open) => {
          if (!isDeletingUser) {
            setShowDeleteModal(open)
            if (!open) setUserToDelete(null)
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Eliminar Usuario</span>
              </DialogTitle>
              <DialogDescription>
                Estás a punto de eliminar permanentemente a <strong>{userToDelete.name}</strong> ({userToDelete.email}).
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <strong>Advertencia:</strong> Esta acción eliminará permanentemente al usuario y todos sus datos asociados
                    (propiedades, ofertas, citas, etc.). Asegúrate de que realmente deseas eliminar este usuario.
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-sm text-gray-700">
                  <strong>Usuario a eliminar:</strong><br />
                  <strong>Nombre:</strong> {userToDelete.name}<br />
                  <strong>Email:</strong> {userToDelete.email}<br />
                  <strong>Rol:</strong> {userToDelete.role === 'CLIENT' ? 'Cliente' :
                                         userToDelete.role === 'OWNER' ? 'Propietario' :
                                         userToDelete.role === 'AGENT' ? 'Asesor' :
                                         userToDelete.role === 'PARTNER' ? 'Alianza' : 'Admin'}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                disabled={isDeletingUser}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDeleteUser()
                }}
                disabled={isDeletingUser || !userToDelete}
              >
                {isDeletingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Usuario
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Editar Usuario */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        if (!isEditingUser) {
          setShowEditModal(open)
          if (!open) setUserToEdit(null)
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>Editar Usuario</span>
            </DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-user-name">Nombre Completo *</Label>
                <Input
                  id="edit-user-name"
                  placeholder="Ingresa el nombre completo"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  required
                  disabled={isEditingUser}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-user-email">Email *</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  required
                  disabled={isEditingUser}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-phone">Teléfono</Label>
                <Input
                  id="edit-user-phone"
                  placeholder="+52 55 1234 5678"
                  value={editUserData.phone}
                  onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                  disabled={isEditingUser}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-role">Rol</Label>
                <Select
                  value={editUserData.role}
                  onValueChange={(value: any) => setEditUserData({ ...editUserData, role: value })}
                  disabled={isEditingUser}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Cliente</SelectItem>
                    <SelectItem value="OWNER">Propietario</SelectItem>
                    <SelectItem value="AGENT">Asesor</SelectItem>
                    <SelectItem value="PARTNER">Alianza</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Nota:</strong> Solo se pueden editar nombre, email, teléfono y rol. La contraseña debe cambiarse desde el perfil del usuario.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setUserToEdit(null)
                }}
                disabled={isEditingUser}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isEditingUser || !editUserData.name.trim() || !editUserData.email.trim()}
              >
                {isEditingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Crear Usuario */}
      <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Crear Nuevo Usuario</span>
            </DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta de usuario en el sistema inmobiliario
            </DialogDescription>
          </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="user-name">Nombre Completo *</Label>
                  <Input
                    id="user-name"
                    placeholder="Ingresa el nombre completo"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    required
                    disabled={isCreatingUser}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="user-email">Email *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    required
                    disabled={isCreatingUser}
                  />
                </div>
                <div>
                  <Label htmlFor="user-phone">Teléfono</Label>
                  <Input
                    id="user-phone"
                    placeholder="+52 55 1234 5678"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    disabled={isCreatingUser}
                  />
                </div>
                <div>
                  <Label htmlFor="user-role">Rol</Label>
                  <Select
                    value={newUserData.role}
                    onValueChange={(value: any) => setNewUserData({ ...newUserData, role: value })}
                    disabled={isCreatingUser}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Cliente</SelectItem>
                      <SelectItem value="OWNER">Propietario</SelectItem>
                      <SelectItem value="AGENT">Asesor</SelectItem>
                      <SelectItem value="PARTNER">Alianza</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user-password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      required
                      disabled={isCreatingUser}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isCreatingUser}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="user-confirm-password">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="user-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite la contraseña"
                      value={newUserData.confirmPassword}
                      onChange={(e) => setNewUserData({ ...newUserData, confirmPassword: e.target.value })}
                      required
                      disabled={isCreatingUser}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isCreatingUser}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los usuarios creados por administradores tienen su email verificado automáticamente y pueden acceder inmediatamente al sistema.
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateUserModal(false)
                    resetNewUserForm()
                  }}
                  disabled={isCreatingUser}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingUser || !newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password}
                >
                  {isCreatingUser ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  )
}