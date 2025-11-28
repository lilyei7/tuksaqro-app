import { prisma } from '@/lib/prisma/db'

// Declarar como global para persistencia en el módulo
declare global {
  var userConnections: Map<string, Set<ReadableStreamDefaultController>>
  var ineConnections: Map<string, Set<ReadableStreamDefaultController>>
  var adminConnections: Map<string, Set<ReadableStreamDefaultController>>
}

// Inicializar mapas globales si no existen
if (!global.userConnections) {
  global.userConnections = new Map<string, Set<ReadableStreamDefaultController>>()
}
if (!global.ineConnections) {
  global.ineConnections = new Map<string, Set<ReadableStreamDefaultController>>()
}
if (!global.adminConnections) {
  global.adminConnections = new Map<string, Set<ReadableStreamDefaultController>>()
}

// Referencias a los mapas globales
const userConnections = global.userConnections
const ineConnections = global.ineConnections
const adminConnections = global.adminConnections

// Función helper para enviar notificaciones a usuarios específicos
export function broadcastNotification(
  userId: string,
  data: {
    type: string
    title: string
    message: string
    [key: string]: any
  }
) {
  console.log(`📤 Broadcasting notification to user ${userId}:`, data.type)
  const connections = userConnections.get(userId)
  
  if (!connections || connections.size === 0) {
    console.warn(`⚠️  No notification connections for user ${userId}. Connected users: ${userConnections.size}`)
    return
  }

  console.log(`✅ Found ${connections.size} notification connection(s) for user ${userId}`)
  const message = `data: ${JSON.stringify(data)}\n\n`
  connections.forEach((controller) => {
    try {
      controller.enqueue(message)
      console.log(`✓ Notification sent successfully`)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  })
}

export function registerNotificationConnection(userId: string, controller: ReadableStreamDefaultController) {
  console.log(`📱 Registering notification connection for user: ${userId}`)
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set())
  }
  userConnections.get(userId)?.add(controller)
  console.log(`✓ Notification connection registered. Total connections: ${userConnections.size}`)
  
  return () => {
    console.log(`🔌 Closing notification connection for user: ${userId}`)
    userConnections.get(userId)?.delete(controller)
    if (userConnections.get(userId)?.size === 0) {
      userConnections.delete(userId)
    }
  }
}

// Función helper para notificar cambios de estado de INE
export function broadcastINEStatusUpdate(
  userId: string,
  data: {
    status: 'APPROVED' | 'REJECTED' | 'PENDING'
    message: string
    [key: string]: any
  }
) {
  console.log(`📡 Broadcasting INE status update to user ${userId}:`, data.status)
  const connections = ineConnections.get(userId)
  
  if (!connections || connections.size === 0) {
    console.warn(`⚠️  No INE connections for user ${userId}. Connected users: ${ineConnections.size}`)
    return
  }

  console.log(`✅ Found ${connections.size} INE connection(s) for user ${userId}`)
  const message = `data: ${JSON.stringify({
    type: 'ineStatusUpdate',
    ...data
  })}\n\n`
  
  connections.forEach((controller) => {
    try {
      controller.enqueue(message)
      console.log(`✓ INE update sent successfully`)
    } catch (error) {
      console.error('Error sending INE update:', error)
    }
  })
}

export function registerINEConnection(userId: string, controller: ReadableStreamDefaultController) {
  console.log(`📱 Registering INE connection for user: ${userId}`)
  if (!ineConnections.has(userId)) {
    ineConnections.set(userId, new Set())
  }
  ineConnections.get(userId)?.add(controller)
  console.log(`✓ INE connection registered. Total connections: ${ineConnections.size}`)
  
  return () => {
    console.log(`🔌 Closing INE connection for user: ${userId}`)
    ineConnections.get(userId)?.delete(controller)
    if (ineConnections.get(userId)?.size === 0) {
      ineConnections.delete(userId)
    }
  }
}

// Función para notificar a todos los admins
export async function broadcastToAllAdmins(data: {
  type: string
  title: string
  message: string
  [key: string]: any
}) {
  console.log(`📢 Broadcasting to all admins:`, data.type)
  
  // Obtener todos los admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  })

  console.log(`Found ${admins.length} admin(s), ${adminConnections.size} connected`)

  const message = `data: ${JSON.stringify(data)}\n\n`

  // Enviar a cada admin conectado
  admins.forEach(admin => {
    const connections = adminConnections.get(admin.id)
    if (connections && connections.size > 0) {
      console.log(`✅ Found ${connections.size} admin connection(s) for admin ${admin.id}`)
      connections.forEach((controller) => {
        try {
          controller.enqueue(message)
          console.log(`✓ Admin notification sent successfully`)
        } catch (error) {
          console.error('Error sending admin notification:', error)
        }
      })
    }
  })
}

export function registerAdminConnection(adminId: string, controller: ReadableStreamDefaultController) {
  console.log(`📱 Registering admin connection for admin: ${adminId}`)
  if (!adminConnections.has(adminId)) {
    adminConnections.set(adminId, new Set())
  }
  adminConnections.get(adminId)?.add(controller)
  console.log(`✓ Admin connection registered. Total admin connections: ${adminConnections.size}`)
  
  return () => {
    console.log(`🔌 Closing admin connection for admin: ${adminId}`)
    adminConnections.get(adminId)?.delete(controller)
    if (adminConnections.get(adminId)?.size === 0) {
      adminConnections.delete(adminId)
    }
  }
}
