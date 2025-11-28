"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import { useState, ReactNode } from "react"

interface AuthGateModalProps {
  trigger: ReactNode
  title?: string
  description?: string
  children?: (closeModal: () => void) => ReactNode
}

/**
 * Componente que requiere autenticación para mostrar contenido
 * Si no hay sesión, muestra un modal pidiendo login/registro
 * Si hay sesión, muestra el contenido normalmente
 */
export function AuthGateModal({
  trigger,
  title = "Autenticación Requerida",
  description = "Debes iniciar sesión o registrarte para continuar",
  children
}: AuthGateModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogin = () => {
    router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
  }

  const handleRegister = () => {
    router.push("/auth/register?callbackUrl=" + encodeURIComponent(window.location.pathname))
  }

  const closeModal = () => setIsOpen(false)

  // Si hay sesión, mostrar el contenido normalmente
  if (session?.user) {
    return (
      <div onClick={() => setIsOpen(true)}>
        {trigger}
        {isOpen && children?.(closeModal)}
      </div>
    )
  }

  // Si no hay sesión, mostrar modal pidiendo autenticación

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <LogIn className="w-5 h-5" />
            Iniciar Sesión
          </Button>

          <Button
            onClick={handleRegister}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <UserPlus className="w-5 h-5" />
            Crear Cuenta
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o continúa explorando</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            size="lg"
          >
            Volver a propiedades
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Al registrarte, podrás agendar visitas, hacer ofertas y gestionar tu cartera de propiedades.
        </p>
      </DialogContent>
    </Dialog>
  )
}
