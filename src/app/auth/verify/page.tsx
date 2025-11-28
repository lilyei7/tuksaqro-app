"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"

const verifySchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
})

type VerifyFormData = z.infer<typeof verifySchema>

function VerifyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else {
      router.push("/auth/register")
    }
  }, [searchParams, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  })

  const onSubmit = async (data: VerifyFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: data.code }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al verificar el código")
      }

      toast.success("¡Cuenta verificada exitosamente!")
      router.push("/auth/login?message=email-verified")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al verificar el código")
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al reenviar el código")
      }

      toast.success("Código reenviado a tu email")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al reenviar el código")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-16 w-16 items-center justify-center">
              <img src="/tksa.png" alt="TUKSAQRO" className="h-14 w-14 object-contain" />
            </div>
            <span className="text-2xl font-bold text-gray-900">TUKSAQRO</span>
          </Link>
          <p className="mt-2 text-gray-600">Verifica tu cuenta</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Verificación de Email</span>
            </CardTitle>
            <CardDescription>
              Hemos enviado un código de 6 dígitos a <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  {...register("code")}
                  className="text-center text-lg tracking-widest"
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Verificar cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No recibiste el código?
              </p>
              <Button
                variant="outline"
                onClick={resendCode}
                disabled={isLoading}
                className="w-full"
              >
                Reenviar código
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al registro</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <VerifyForm />
    </Suspense>
  )
}