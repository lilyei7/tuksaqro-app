import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const heroImages = await prisma.heroImage.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({ heroImages });
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

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

    const heroImage = await prisma.heroImage.create({
      data: {
        title,
        description,
        imageUrl,
        order: order || 0,
        isActive: true,
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
    console.error('Error creating hero image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}