import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, ...updateData } = body;

    if (action === 'edit') {
      // Actualizar propiedad
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          type: true,
          status: true,
          address: true,
          city: true,
          state: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              offers: true,
              views: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        property: {
          ...updatedProperty,
          images: updatedProperty.images ? JSON.parse(updatedProperty.images) : [],
          location: [updatedProperty.address, updatedProperty.city, updatedProperty.state].filter(Boolean).join(', ')
        }
      });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });

  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = params;

    // Verificar que la propiedad existe
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, title: true }
    });

    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    // Eliminar la propiedad
    await prisma.property.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Propiedad eliminada correctamente"
    });

  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}