import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/db"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/perfil",
  "/citas",
  "/documentos",
  "/propiedades/crear",
  "/propiedades/editar",
  "/sistema-control",
]

// Rutas que requieren roles específicos
const roleBasedRoutes = {
  ADMIN: ["/admin", "/sistema-control"],
  AGENT: ["/agent", "/propiedades/moderar"],
  OWNER: ["/propiedades/mis-propiedades"],
  CLIENT: ["/mis-citas", "/mis-ofertas"],
}

export default auth(async (req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role
  const userId = req.auth?.user?.id

  // VERIFICAR SI EL USUARIO ESTÁ BANEADO
  if (isLoggedIn && userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isBanned: true, bannedReason: true }
      })

      if (user?.isBanned) {
        console.log('MIDDLEWARE: Banned user detected, redirecting to banned page:', userId)

        // Redirigir a una página de usuario baneado
        return NextResponse.redirect(
          new URL(`/banned?reason=${encodeURIComponent(user.bannedReason || 'Cuenta suspendida')}`, nextUrl)
        )
      }
    } catch (error) {
      console.error('MIDDLEWARE: Error checking ban status:', error)
      // En caso de error, permitir continuar pero loggear
    }
  }

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  // Verificar si la ruta requiere un rol específico
  const requiredRole = Object.keys(roleBasedRoutes).find(role =>
    roleBasedRoutes[role as keyof typeof roleBasedRoutes].some(route =>
      nextUrl.pathname.startsWith(route)
    )
  )

  // Redirigir a login si no está autenticado y la ruta está protegida
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)

    // RUTA ESPECÍFICA PARA SISTEMA CONTROL - SIEMPRE REDIRIGIR A ADMIN LOGIN
    if (nextUrl.pathname === "/sistema-control") {
      console.log('MIDDLEWARE: Redirecting /sistema-control to admin login (not logged in)')
      return NextResponse.redirect(
        new URL(`/admin/login?callbackUrl=${callbackUrl}`, nextUrl)
      )
    }

    // Para otras rutas protegidas, usar el login normal
    console.log('MIDDLEWARE: Redirecting other protected route to user login')
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
    )
  }

  // Verificar permisos específicos para rutas que requieren roles
  if (requiredRole && (!isLoggedIn || userRole !== requiredRole)) {
    console.log('MIDDLEWARE: Access denied to role-protected route')
    console.log('Required role:', requiredRole, 'User role:', userRole)

    // Si es una ruta de admin y no tiene permisos, redirigir al login de admin
    if (requiredRole === 'ADMIN') {
      console.log('MIDDLEWARE: Redirecting to admin login (insufficient permissions)')
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
      return NextResponse.redirect(
        new URL(`/admin/login?callbackUrl=${callbackUrl}`, nextUrl)
      )
    }

    return NextResponse.redirect(new URL("/unauthorized", nextUrl))
  }

  // Redirigir usuarios autenticados lejos de páginas de auth
  if (isLoggedIn && (
    nextUrl.pathname.startsWith("/auth/login") ||
    nextUrl.pathname.startsWith("/auth/register")
  )) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}