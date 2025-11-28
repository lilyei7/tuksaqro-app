import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { userId } = params;
    const body = await request.json();
    const { action, reason } = body;

    if (!action) {
      return NextResponse.json({ error: "Acción requerida" }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isBanned: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir banear a otros administradores
    if (user.role === "ADMIN" && action === "ban") {
      return NextResponse.json({ error: "No se puede banear a administradores" }, { status: 403 });
    }

    let updateData: any = {};

    switch (action) {
      case "ban":
        if (user.isBanned) {
          return NextResponse.json({ error: "El usuario ya está baneado" }, { status: 400 });
        }
        updateData = {
          isBanned: true,
          bannedAt: new Date(),
          bannedReason: reason || "Violación de términos y condiciones",
          bannedBy: session.user.id
        };
        break;

      case "unban":
        if (!user.isBanned) {
          return NextResponse.json({ error: "El usuario no está baneado" }, { status: 400 });
        }
        updateData = {
          isBanned: false,
          bannedAt: null,
          bannedReason: null,
          bannedBy: null
        };
        break;

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
        bannedBy: true,
        emailVerified: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: action === "ban" ? "Usuario baneado exitosamente" : "Usuario desbaneado exitosamente"
    })

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  console.log('=== DELETE REQUEST RECEIVED ===')
  console.log('UserId param:', params.userId)
  console.log('Request method:', request.method)
  console.log('Request URL:', request.url)
  console.log('Request headers keys:', Array.from(request.headers.keys()))

  try {
    console.log('Calling auth()...')
    const session = await auth();
    console.log('Session result:', session ? 'Session found' : 'No session')
    console.log('Session user:', session?.user)
    console.log('Session user role:', session?.user?.role)

    if (!session || !session.user || session.user.role !== "ADMIN") {
      console.log('Unauthorized access attempt - no valid admin session')
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { userId } = params;
    console.log('Attempting to delete user:', userId)

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir eliminar administradores
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "No se puede eliminar administradores" }, { status: 403 });
    }

    // Eliminar el usuario (esto también eliminará las relaciones por cascada)
    await prisma.user.delete({
      where: { id: userId }
    });

    console.log('User deleted successfully:', userId)

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    console.log('=== PUT REQUEST RECEIVED ===')
    console.log('UserId param:', params.userId)
    console.log('Request method:', request.method)

    const session = await auth();
    console.log('Session result:', session ? 'Session found' : 'No session')

    if (!session || !session.user || session.user.role !== "ADMIN") {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { userId } = params;
    console.log('Attempting to update user:', userId)

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, phone, role } = body;
    console.log('Update data:', { name, email, phone, role })

    // Validaciones
    if (!name || !email) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        console.log('Email already exists:', email)
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
      }
    }

    // No permitir cambiar el rol de administradores
    if (existingUser.role === "ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "No se puede cambiar el rol de administradores" }, { status: 403 });
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        role: role || "CLIENT"
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

    console.log('User updated successfully:', updatedUser.id)
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Usuario actualizado exitosamente"
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}