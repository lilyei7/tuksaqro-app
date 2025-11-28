"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader } from "lucide-react"
import { toast } from "react-hot-toast"

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    email: string
    image?: string
  }
  createdAt: string
}

interface AppointmentMessagesProps {
  appointmentId: string
  appointmentStatus: string
}

export function AppointmentMessages({ appointmentId, appointmentStatus }: AppointmentMessagesProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Refrescar mensajes cada 3 segundos
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [appointmentId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?appointmentId=${appointmentId}`)
      
      if (!response.ok) throw new Error("Error al cargar mensajes")
      
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      toast.error("El mensaje no puede estar vacío")
      return
    }

    setSending(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al enviar mensaje")
      }

      setNewMessage("")
      await fetchMessages()
      toast.success("Mensaje enviado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar mensaje")
    } finally {
      setSending(false)
    }
  }

  const isAuthor = (senderId: string) => senderId === (session?.user as any)?.id

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-brand-blue" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="text-lg">Mensajes</CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-96">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isAuthor(message.sender.id) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  isAuthor(message.sender.id)
                    ? "bg-brand-blue text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                {!isAuthor(message.sender.id) && (
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {message.sender.name}
                  </p>
                )}
                <p className="break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isAuthor(message.sender.id) ? "opacity-70" : "opacity-60"
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending || appointmentStatus === "CANCELLED"}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={sending || !newMessage.trim() || appointmentStatus === "CANCELLED"}
            size="icon"
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            {sending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        {appointmentStatus === "CANCELLED" && (
          <p className="text-xs text-gray-500 mt-2">
            ℹ️ No puedes enviar mensajes en una cita cancelada
          </p>
        )}
      </div>
    </Card>
  )
}
