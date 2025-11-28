import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/db"
import MisPropiedadesClient from "./MisPropiedadesClient"

export default async function MisPropiedadesPage() {
  // Server-side authentication check
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const userRole = (session.user as any)?.role

  // Check permissions server-side
  if (userRole !== "OWNER" && userRole !== "AGENT" && userRole !== "ADMIN") {
    redirect("/dashboard")
  }

  // Server-side data fetching - optimized query
  const properties = await prisma.property.findMany({
    where: {
      ownerId: (session.user as any)?.id,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
  })

  // Format properties data (Prisma automatically parses JSON fields)
  const formattedProperties = properties.map((property: any) => ({
    ...property,
    images: property.images || [],
    features: property.features || [],
  }))

  return (
    <MisPropiedadesClient
      initialProperties={formattedProperties}
      userRole={userRole}
      userId={(session.user as any)?.id}
    />
  )
}