import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';

// POST /api/properties/[id]/view - Track property view
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;

    // For now, we'll track anonymous views
    // In the future, we could get userId from session if authenticated
    const userId = null; // TODO: Get from session if authenticated

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    // Create view record
    const view = await prisma.propertyView.create({
      data: {
        propertyId: id,
        userId,
        ipAddress,
        userAgent,
        referrer,
      },
    });

    return NextResponse.json({ success: true, viewId: view.id });
  } catch (error) {
    console.error('Error tracking property view:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}