import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

// GET /api/admin/property-views - Get property view statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d
    const limit = parseInt(searchParams.get('limit') || '10');

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get top viewed properties
    const topViewedProperties = await prisma.propertyView.groupBy({
      by: ['propertyId'],
      where: {
        viewedAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    // Get property details for the top viewed ones
    const propertyIds = topViewedProperties.map(p => p.propertyId);
    const properties = await prisma.property.findMany({
      where: {
        id: {
          in: propertyIds,
        },
      },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        status: true,
        city: true,
        state: true,
        images: true,
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    // Combine view counts with property data
    const topProperties = topViewedProperties.map(viewData => {
      const property = properties.find(p => p.id === viewData.propertyId);
      return {
        ...property,
        viewCount: viewData._count.id,
      };
    });

    // Get total views in the period
    const totalViews = await prisma.propertyView.count({
      where: {
        viewedAt: {
          gte: startDate,
        },
      },
    });

    // Get unique properties viewed
    const uniquePropertiesViewed = await prisma.propertyView.groupBy({
      by: ['propertyId'],
      where: {
        viewedAt: {
          gte: startDate,
        },
      },
      _count: {
        propertyId: true,
      },
    });

    // Get daily view stats for the last 30 days
    const dailyViews = await prisma.$queryRaw`
      SELECT
        DATE(viewedAt) as date,
        COUNT(*) as views
      FROM property_views
      WHERE viewedAt >= ${startDate}
      GROUP BY DATE(viewedAt)
      ORDER BY DATE(viewedAt) DESC
    ` as Array<{ date: string; views: bigint }>;

    // Convert BigInt to number for JSON serialization
    const formattedDailyViews = dailyViews.map(view => ({
      date: view.date,
      views: Number(view.views)
    }));

    return NextResponse.json({
      period,
      totalViews,
      uniquePropertiesViewed: uniquePropertiesViewed.length,
      topProperties,
      dailyViews: formattedDailyViews,
    });
  } catch (error) {
    console.error('Error getting property view stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}