"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Eye, EyeOff, Home, Mail, Lock, User, Phone, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

// Lazy load Framer Motion
const motion = dynamic(() => import("framer-motion").then(mod => ({ default: mod.motion.div })), {
  loading: () => <div />,
})

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "OWNER", "AGENT"]),
})

type RegisterFormData = z.infer<typeof registerSchema>

const roleOptions = [
  { value: "CLIENT", label: "Cliente", description: "Busco propiedades para rentar o comprar", icon: User },
  { value: "OWNER", label: "Propietario", description: "Quiero publicar mis propiedades", icon: Home },
  { value: "AGENT", label: "Asesor", description: "Soy agente inmobiliario profesional", icon: UserCheck },
]

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const intent = searchParams.get('intent')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: intent === 'sell' ? 'OWNER' : intent === 'buy' ? 'CLIENT' : 'CLIENT'
    }
  })

  // Efecto para manejar el intent desde la URL
  useEffect(() => {
    if (intent === 'sell') {
      setValue('role', 'OWNER')
    } else if (intent === 'buy') {
      setValue('role', 'CLIENT')
    }
  }, [intent, setValue])

  const getIntentMessage = () => {
    if (intent === 'sell') {
      return {
        title: "¡Perfecto! Vamos a publicar tu propiedad",
        description: "Regístrate como propietario para comenzar a vender tu propiedad en TUKSAQRO",
        badge: "Quiero Vender"
      }
    } else if (intent === 'buy') {
      return {
        title: "¡Excelente! Vamos a encontrar tu hogar ideal",
        description: "Regístrate como cliente para acceder a miles de propiedades disponibles",
        badge: "Quiero Comprar"
      }
    }
    return null
  }

  const intentMessage = getIntentMessage()
  const selectedRole = watch("role")

  const onSubmit = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear la cuenta")
      }

      toast.success("¡Cuenta creada exitosamente! Revisa tu email para verificar tu cuenta.")
      router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-16 w-16 items-center justify-center">
              <img src="/tksa.png" alt="TUKSAQRO" className="h-14 w-14 object-contain" />
            </div>
            <span className="text-2xl font-bold text-gray-900">TUKSAQRO</span>
          </Link>
          <p className="mt-2 text-gray-600">Únete a nuestra comunidad inmobiliaria</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            {intentMessage ? (
              <>
                <div className="text-center mb-4">
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                    {intentMessage.badge}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-center">{intentMessage.title}</CardTitle>
                <CardDescription className="text-center">
                  {intentMessage.description}
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
                <CardDescription className="text-center">
                  Completa los datos para crear tu cuenta
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Tipo de usuario */}
              <div className="space-y-3">
                <Label>Tipo de Usuario</Label>
                <div className="grid grid-cols-1 gap-3">
                  {roleOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <div
                        key={option.value}
                        onClick={() => setValue("role", option.value as any)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRole === option.value
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{option.label}</span>
                              {selectedRole === option.value && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Seleccionado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Datos personales */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...register("name")}
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

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
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...register("phone")}
                      id="phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
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
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿Ya tienes cuenta? </span>
              <Link href="/auth/login" className="text-green-600 hover:text-green-800 font-medium">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500">
          Al crear una cuenta, aceptas nuestros{" "}
          <Link href="/terminos" className="hover:text-green-600">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="hover:text-green-600">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  )
}