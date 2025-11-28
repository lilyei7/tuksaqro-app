"use client"

import { useState, useCallback } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"

const adminLoginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = useCallback(async (data: AdminLoginFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales incorrectas. Solo administradores pueden acceder.")
        toast.error("Acceso denegado")
      } else if (result?.ok) {
        toast.success("Bienvenido al panel de administración")
        // Small delay to ensure session is set
        setTimeout(() => {
          router.push("/sistema-control")
          router.refresh()
        }, 100)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Panel de Administración</CardTitle>
          <CardDescription className="text-slate-300">
            Acceso exclusivo para administradores del sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">Usuario Administrador</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-red-500"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-400">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
            >
              {isLoading ? "Verificando..." : "Acceder al Panel Admin"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <div className="text-sm text-slate-400">
              ¿Eres un usuario normal?
            </div>
            <Link
              href="/auth/login"
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Ir al login de usuarios
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-slate-300 inline-flex items-center gap-1"
            >
              ← Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}