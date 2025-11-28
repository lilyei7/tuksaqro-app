import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';
import { z } from 'zod';

// Schema para crear oferta
const createOfferSchema = z.object({
  propertyId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('MXN'),
  conditions: z.string().optional(),
});

// Schema para actualizar oferta (contraoferta)
const updateOfferSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER']),
  counterAmount: z.number().positive().optional(),
  conditions: z.string().optional(),
});

// GET /api/offers - Obtener ofertas del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    const where: any = {};

    // Si es cliente, solo ve sus ofertas
    if ((session.user as any).role === 'CLIENT') {
      where.clientId = session.user.id;
    }

    // Si es owner/agent, ve ofertas en sus propiedades
    if ((session.user as any).role === 'OWNER' || (session.user as any).role === 'AGENT') {
      where.property = {
        ownerId: session.user.id
      };
    }

    // Filtros opcionales
    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      where.status = status;
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            address: true,
            city: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error obteniendo ofertas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/offers - Crear nueva oferta
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Para testing/debugging, permitir que cualquier usuario autenticado haga ofertas
    // En producción, esto debería ser solo para CLIENT role
    // if ((session.user as any).role !== 'CLIENT') {
    //   return NextResponse.json(
    //     { error: `Solo clientes pueden hacer ofertas. Tu rol actual: ${(session.user as any).role}` },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const validatedData = createOfferSchema.parse(body);

    // Verificar que la propiedad existe y está disponible
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    if (property.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'La propiedad no está disponible para ofertas' },
        { status: 400 }
      );
    }

    // Verificar que el cliente no tenga ya una oferta pendiente en esta propiedad
    const existingOffer = await prisma.offer.findFirst({
      where: {
        clientId: session.user.id,
        propertyId: validatedData.propertyId,
        status: 'PENDING',
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: 'Ya tienes una oferta pendiente para esta propiedad' },
        { status: 400 }
      );
    }

    // Crear la oferta
    const offer = await prisma.offer.create({
      data: {
        clientId: session.user.id,
        propertyId: validatedData.propertyId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        conditions: validatedData.conditions,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creando oferta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/offers/[id] - Actualizar oferta (aceptar, rechazar, contraofertar)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const offerId = url.pathname.split('/').pop();

    if (!offerId) {
      return NextResponse.json({ error: 'ID de oferta requerido' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateOfferSchema.parse(body);

    // Obtener la oferta con la propiedad
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        property: true,
        client: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
    }

    // Verificar permisos: solo el propietario o agente asignado puede gestionar
    if ((session.user as any).role !== 'ADMIN' &&
        offer.property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar esta oferta' },
        { status: 403 }
      );
    }

    // Si es contraoferta, validar que se proporcione counterAmount
    if (validatedData.status === 'COUNTER_OFFER' && !validatedData.counterAmount) {
      return NextResponse.json(
        { error: 'Se requiere monto de contraoferta' },
        { status: 400 }
      );
    }

    // Actualizar la oferta
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: validatedData.status,
        counterAmount: validatedData.counterAmount,
        conditions: validatedData.conditions,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Si se acepta la oferta, actualizar el estado de la propiedad
    if (validatedData.status === 'ACCEPTED') {
      await prisma.property.update({
        where: { id: offer.propertyId },
        data: { status: 'PENDING' },
      });
    }

    return NextResponse.json(updatedOffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error actualizando oferta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/offers/[id] - Eliminar oferta (solo por el cliente que la creó)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const offerId = url.pathname.split('/').pop();

    if (!offerId) {
      return NextResponse.json({ error: 'ID de oferta requerido' }, { status: 400 });
    }

    // Obtener la oferta
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
    }

    // Solo el cliente que creó la oferta puede eliminarla, y solo si está pendiente
    if (offer.clientId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta oferta' },
        { status: 403 }
      );
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar ofertas pendientes' },
        { status: 400 }
      );
    }

    // Eliminar la oferta
    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json({ message: 'Oferta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando oferta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}