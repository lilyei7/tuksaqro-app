"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ShieldX, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "next-auth/react"

export default function BannedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <BannedContent />
    </Suspense>
  )
}

function BannedContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'Tu cuenta ha sido suspendida'

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Cuenta Suspendida
          </CardTitle>
          <CardDescription className="text-gray-600">
            Tu acceso ha sido restringido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <strong>Motivo:</strong><br />
                {reason}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            Si crees que esto es un error, por favor contacta al administrador del sistema.
          </div>

          <Button
            onClick={handleSignOut}
            className="w-full"
            variant="outline"
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}