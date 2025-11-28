import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';

export async function GET(request: NextRequest) {
  try {
    const heroImages = await prisma.heroImage.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({ heroImages }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}