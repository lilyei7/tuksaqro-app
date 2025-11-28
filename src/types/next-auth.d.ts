import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      phone?: string
      avatar?: string
      role: "CLIENT" | "OWNER" | "AGENT" | "ADMIN" | "PARTNER"
      isBanned?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    phone?: string
    avatar?: string
    role: "CLIENT" | "OWNER" | "AGENT" | "ADMIN" | "PARTNER"
    isBanned?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "CLIENT" | "OWNER" | "AGENT" | "ADMIN"
  }
}