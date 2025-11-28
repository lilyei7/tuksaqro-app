import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      order,
      overlayTitle,
      overlaySubtitle,
      overlayTitleColor,
      overlaySubtitleColor,
      overlayPosition,
      overlayBackgroundColor,
      overlayBackgroundOpacity
    } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "URL de imagen requerida" }, { status: 400 });
    }

    const heroImage = await prisma.heroImage.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        order: order || 0,
        overlayTitle,
        overlaySubtitle,
        overlayTitleColor,
        overlaySubtitleColor,
        overlayPosition,
        overlayBackgroundColor,
        overlayBackgroundOpacity
      }
    });

    return NextResponse.json({ heroImage });
  } catch (error) {
    console.error('Error updating hero image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const heroImage = await prisma.heroImage.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ heroImage });
  } catch (error) {
    console.error('Error updating hero image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = params;

    // Verificar que el ID existe antes de intentar eliminar
    const existingImage = await prisma.heroImage.findUnique({
      where: { id }
    });

    if (!existingImage) {
      console.error(`Hero image with ID ${id} not found`);
      return NextResponse.json(
        { error: `Imagen con ID ${id} no encontrada` },
        { status: 404 }
      );
    }

    await prisma.heroImage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hero image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}