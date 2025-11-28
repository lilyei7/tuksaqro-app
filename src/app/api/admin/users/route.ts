import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';
import bcrypt from 'bcryptjs';

// Deshabilitar cache para este endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('API /admin/users called')
    const session = await auth()
    console.log('Session result:', JSON.stringify(session, null, 2))

    if (!session || !session.user || session.user.role !== "ADMIN") {
      console.log('Access denied. Session exists:', !!session)
      if (session) {
        console.log('Session user:', session.user)
        console.log('Session user role:', session.user.role)
      }
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (role && role !== "all") where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          isBanned: true,
          bannedAt: true,
          bannedReason: true,
          bannedBy: true,
          _count: {
            select: {
              properties: true,
              offers: true,
              clientAppointments: true,
              agentAppointments: true,
              clientContracts: true,
              agentContracts: true,
              assignedLeads: true,
              sentMessages: true,
              digitalSignatures: true,
              buyerWritings: true,
              sellerWritings: true,
              agentWritings: true,
              notifications: true,
              contractTemplates: true,
              propertyViews: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/admin/users called ===')
    console.log('Request method:', request.method)
    console.log('Request URL:', request.url)
    console.log('Request headers keys:', Array.from(request.headers.keys()))

    const session = await auth();
    console.log('Session result:', session ? 'Session found' : 'No session')
    console.log('Session user:', session?.user)
    console.log('Session user role:', session?.user?.role)

    if (!session || !session.user || session.user.role !== "ADMIN") {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body:', body)
    const { name, email, phone, role, password } = body;

    // Validaciones
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json({ error: "Nombre, email y contraseña son obligatorios" }, { status: 400 });
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short')
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    // Verificar que el email no esté en uso
    console.log('Checking if email exists:', email)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Email already exists:', email)
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    // Hashear la contraseña
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el usuario
    console.log('Creating user with data:', { name, email, phone, role })
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: role || "CLIENT",
        password: hashedPassword,
        emailVerified: new Date() // Los usuarios creados por admin están verificados automáticamente
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        isBanned: true
      }
    });

    console.log('User created successfully:', newUser.id)
    return NextResponse.json({
      success: true,
      user: newUser,
      message: "Usuario creado exitosamente"
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}