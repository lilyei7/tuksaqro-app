"use client"

import { useState, useCallback, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Eye, EyeOff, Home, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"

// Lazy load Framer Motion to improve initial load
const motion = dynamic(() => import("framer-motion").then(mod => ({ default: mod.motion.div })), {
  loading: () => <div />,
})

const loginSchema = z.object({
  email: z.string().min(1, "El email es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Primero verificar si el usuario está baneado
      const checkResponse = await fetch('/api/auth/check-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      const checkResult = await checkResponse.json()

      if (!checkResponse.ok) {
        if (checkResult.error === 'Usuario baneado') {
          toast.error(checkResult.message || 'Tu cuenta ha sido suspendida')
          return
        }
        // Para otros errores, continuar con el login normal
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Credenciales incorrectas")
      } else {
        toast.success("¡Bienvenido de vuelta!")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }, [router, callbackUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-16 w-16 items-center justify-center">
              <img src="/tksa.png" alt="TUKSAQRO" className="h-14 w-14 object-contain" />
            </div>
            <span className="text-2xl font-bold text-gray-900">TUKSAQRO</span>
          </Link>
          <p className="mt-2 text-gray-600">Tu plataforma inmobiliaria de confianza</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿No tienes cuenta? </span>
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Regístrate aquí
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-blue-600">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500">
          Al iniciar sesión, aceptas nuestros{" "}
          <Link href="/terminos" className="hover:text-blue-600">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="hover:text-blue-600">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}