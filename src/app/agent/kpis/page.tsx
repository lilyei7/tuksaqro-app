"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { AgentKPIDashboard } from "@/components/agent/AgentKPIDashboard"

export default function AgentKPIsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    redirect("/auth/login")
  }

  const userRole = (session.user as any)?.role

  // Solo agentes pueden acceder a esta página
  if (userRole !== "AGENT") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <AgentKPIDashboard
          agentId={session.user.id}
          agentName={session.user.name || "Agente"}
        />
      </div>
    </div>
  )
}