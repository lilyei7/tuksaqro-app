import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/db"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const userRole = user.role
    let stats = {}

    // Estadísticas basadas en el rol del usuario
    switch (userRole) {
      case "CLIENT":
        // Estadísticas para clientes
        const clientAppointments = await prisma.appointment.count({
          where: {
            clientId: user.id,
            status: { in: ["PENDING", "CONFIRMED"] }
          }
        })

        const clientCompletedAppointments = await prisma.appointment.count({
          where: {
            clientId: user.id,
            status: "COMPLETED"
          }
        })

        // Propiedades vistas recientemente (últimas 10 citas)
        const recentProperties = await prisma.appointment.count({
          where: {
            clientId: user.id
          }
        })

        stats = {
          favoriteProperties: recentProperties, // Usamos como propiedades vistas
          scheduledAppointments: clientAppointments,
          completedOffers: clientCompletedAppointments
        }
        break

      case "OWNER":
        // Estadísticas para propietarios
        const ownerProperties = await prisma.property.count({
          where: { ownerId: user.id }
        })

        const ownerActiveProperties = await prisma.property.count({
          where: {
            ownerId: user.id,
            status: "AVAILABLE"
          }
        })

        // Visitas de esta semana
        const weekNow = new Date()
        const startOfWeek = new Date(weekNow)
        startOfWeek.setDate(weekNow.getDate() - weekNow.getDay()) // Inicio de semana (domingo)
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // Fin de semana (sábado)
        endOfWeek.setHours(23, 59, 59, 999)

        const ownerAppointments = await prisma.appointment.count({
          where: {
            property: { ownerId: user.id },
            status: { in: ["PENDING", "CONFIRMED"] },
            date: {
              gte: startOfWeek,
              lte: endOfWeek
            }
          }
        })

        // Ofertas recibidas (citas completadas)
        const ownerOffers = await prisma.appointment.count({
          where: {
            property: { ownerId: user.id },
            status: "COMPLETED"
          }
        })

        stats = {
          myProperties: ownerProperties,
          activeProperties: ownerActiveProperties,
          scheduledVisits: ownerAppointments,
          receivedOffers: ownerOffers
        }
        break

      case "AGENT":
        // Estadísticas para agentes
        const agentProperties = await prisma.property.count({
          where: { ownerId: user.id } // Propiedades que gestiona
        })

        // Citas de hoy
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayAppointments = await prisma.appointment.count({
          where: {
            agentId: user.id,
            date: {
              gte: today,
              lt: tomorrow
            },
            status: { in: ["PENDING", "CONFIRMED"] }
          }
        })

        // Clientes activos (usuarios que han tenido citas con este agente)
        const activeClients = await prisma.user.count({
          where: {
            clientAppointments: {
              some: {
                agentId: user.id,
                status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] }
              }
            }
          }
        })

        stats = {
          activeClients: activeClients,
          managedProperties: agentProperties,
          todayAppointments: todayAppointments
        }
        break

      case "ADMIN":
        // Estadísticas para administradores
        const totalUsers = await prisma.user.count()
        const totalProperties = await prisma.property.count()

        // Transacciones del mes actual
        const monthNow = new Date()
        const startOfMonth = new Date(monthNow.getFullYear(), monthNow.getMonth(), 1)
        const endOfMonth = new Date(monthNow.getFullYear(), monthNow.getMonth() + 1, 0, 23, 59, 59)

        const monthlyTransactions = await prisma.appointment.count({
          where: {
            status: "COMPLETED",
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        })

        stats = {
          totalUsers: totalUsers,
          totalProperties: totalProperties,
          monthlyTransactions: monthlyTransactions
        }
        break

      default:
        stats = {}
    }

    return NextResponse.json({
      role: userRole,
      stats: stats
    })

  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error)

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}