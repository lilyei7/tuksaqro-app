import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener documentos de tipo ID (INE)
    const documents = await prisma.document.findMany({
      where: { type: 'ID' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    })

    // Mapear documentos para incluir datos del INE parseados
    const formattedDocuments = documents.map(doc => {
      let ineData = { frontSideUrl: '', backSideUrl: '', submittedAt: '', status: 'pending' }
      
      try {
        ineData = JSON.parse(doc.url)
      } catch (e) {
        console.error('Error parsing INE data:', e)
      }

      return {
        id: doc.id,
        userId: doc.userId,
        userName: doc.user?.name || 'Sin nombre',
        userEmail: doc.user?.email || 'Sin email',
        type: doc.type,
        status: doc.status,
        uploadedAt: doc.uploadedAt.toISOString(),
        reviewedAt: doc.reviewedAt?.toISOString() || null,
        reviewedBy: doc.reviewedBy,
        notes: doc.notes,
        ineData
      }
    })

    return NextResponse.json({ documents: formattedDocuments })
  } catch (error) {
    console.error('Error obteniendo documentos:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    )
  }
}
