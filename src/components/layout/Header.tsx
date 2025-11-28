"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Menu, X, User, Search, Calendar, FileText, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Optimizar navegación con router.prefetch
  const handleNavigation = useCallback((href: string) => {
    router.prefetch(href)
    router.push(href)
  }, [router])

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false })
    router.push("/")
  }, [router])
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "CLIENT": return "Cliente"
      case "OWNER": return "Propietario"
      case "AGENT": return "Asesor"
      case "ADMIN": return "Administrador"
      default: return "Usuario"
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-16 w-16 items-center justify-center">
            <img src="/tksa.png" alt="TUKSAQRO" className="h-14 w-14 object-contain" />
          </div>
          <span className="text-xl font-bold text-gray-900">TUKSAQRO</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex ml-8 space-x-6">
          <Link 
            href="/propiedades"
            onMouseEnter={() => router.prefetch("/propiedades")}
            className="flex items-center space-x-1 text-gray-600 hover:text-brand-blue transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Propiedades</span>
          </Link>
          {session && (
            <>
              {((session.user as any)?.role === "OWNER" || (session.user as any)?.role === "AGENT" || (session.user as any)?.role === "ADMIN") && (
                <Link 
                  href="/mis-propiedades"
                  onMouseEnter={() => router.prefetch("/mis-propiedades")}
                  className="flex items-center space-x-1 text-gray-600 hover:text-brand-blue transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Mis Propiedades</span>
                </Link>
              )}
              {(session.user as any)?.role === "OWNER" && (
                <Link 
                  href="/panel-propietario"
                  onMouseEnter={() => router.prefetch("/panel-propietario")}
                  className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Mi Panel</span>
                </Link>
              )}
              <Link 
                href="/citas"
                onMouseEnter={() => router.prefetch("/citas")}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Citas</span>
              </Link>
              <Link 
                href="/documentos"
                onMouseEnter={() => router.prefetch("/documentos")}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Documentos</span>
              </Link>
              {((session.user as any)?.role === "OWNER" || (session.user as any)?.role === "AGENT") && (
                <Link 
                  href="/ofertas"
                  onMouseEnter={() => router.prefetch("/ofertas")}
                  className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ofertas</span>
                </Link>
              )}
              {(session.user as any)?.role === "ADMIN" && (
                <Link 
                  href="/sistema-control"
                  onMouseEnter={() => router.prefetch("/sistema-control")}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Panel Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-4">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:inline-block">{session.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {getRoleLabel((session.user as any).role)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild onMouseEnter={() => router.prefetch("/perfil")}>
                  <Link href="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onMouseEnter={() => router.prefetch("/dashboard")}>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {(session.user as any)?.role === "OWNER" && (
                  <DropdownMenuItem asChild onMouseEnter={() => router.prefetch("/panel-propietario")}>
                    <Link href="/panel-propietario">
                      <Shield className="mr-2 h-4 w-4" />
                      Panel Propietario
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="hidden md:inline-flex" asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="outline" className="hidden md:inline-flex border-green-600 text-green-600 hover:bg-green-50" asChild>
                <Link href="/auth/register?intent=sell">Quiero Vender</Link>
              </Button>
              <Button className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/auth/register?intent=buy">Quiero Comprar</Link>
              </Button>
            </>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-white border-b md:hidden"
          >
            <nav className="flex flex-col p-4 space-y-2">
              <Link 
                href="/propiedades" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                <span>Propiedades</span>
              </Link>
              {session && (
                <>
                  {((session.user as any)?.role === "OWNER" || (session.user as any)?.role === "AGENT" || (session.user as any)?.role === "ADMIN") && (
                    <Link 
                      href="/mis-propiedades" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      <span>Mis Propiedades</span>
                    </Link>
                  )}
                  <Link 
                    href="/citas" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Citas</span>
                  </Link>
                  <Link 
                    href="/documentos" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Documentos</span>
                  </Link>
                </>
              )}
              {!session && (
                <>
                  <Link 
                    href="/auth/login"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link 
                    href="/auth/register?intent=sell"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md border border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Quiero Vender</span>
                  </Link>
                  <Link 
                    href="/auth/register?intent=buy"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Quiero Comprar</span>
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}