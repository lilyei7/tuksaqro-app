import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"

const loginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(6),
}).refine(data => data.email || data.username, {
  message: "Email or username is required",
})

// Tipos locales hasta que Prisma genere los tipos
type UserRole = "CLIENT" | "OWNER" | "AGENT" | "ADMIN" | "PARTNER"

export const authConfig = {
  session: { strategy: "jwt" } as const,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, username, password } = loginSchema.parse(credentials)

          // Determinar el identificador de login
          const loginIdentifier = username || email || ""

          // Determinar si es login de admin (por username "admin" o email específico)
          const isAdminLogin = loginIdentifier === "admin" || loginIdentifier === "admin@inmobiliaria.com"

          console.log('Auth attempt for:', loginIdentifier, isAdminLogin ? '(admin)' : '(user)')

          const user = await prisma.user.findUnique({
            where: isAdminLogin ? { email: loginIdentifier } : { email: loginIdentifier! }
          })

          if (!user || !user.password) {
            console.log('User not found or no password for:', loginIdentifier)
            return null
          }

          // VERIFICAR QUE EL USUARIO NO ESTÉ BANEADO
          if (user.isBanned) {
            console.log('Banned user trying to login:', loginIdentifier)
            return null
          }

          // Para login de admin, verificar que sea rol ADMIN
          if (isAdminLogin && user.role !== 'ADMIN') {
            console.log('Non-admin user trying to login as admin:', loginIdentifier)
            return null
          }

          const isValidPassword = await bcrypt.compare(password, user.password)

          if (!isValidPassword) {
            console.log('Invalid password for:', loginIdentifier)
            return null
          }

          // Para usuarios normales, verificar que el email esté verificado
          if (!isAdminLogin && !user.emailVerified) {
            console.log('Email not verified for:', loginIdentifier)
            return null
          }

          console.log('Auth successful for:', loginIdentifier)
          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role
        token.isBanned = false
      }

      // VERIFICAR SI EL USUARIO ESTÁ BANEADO EN CADA REQUEST
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { isBanned: true, role: true }
          })

          if (dbUser?.isBanned) {
            console.log('Banned user detected in JWT callback:', token.sub)
            // Marcar el token como baneado pero mantenerlo válido
            token.isBanned = true
          } else {
            token.isBanned = false
          }

          // Actualizar el rol en caso de que haya cambiado
          if (dbUser?.role) {
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error checking user ban status in JWT callback:', error)
          // En caso de error, permitir continuar pero loggear
          token.isBanned = false
        }
      }

      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        // Pasar el estado de ban a la sesión para que el cliente pueda validar
        (session.user as any).isBanned = token.isBanned || false
      }
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
