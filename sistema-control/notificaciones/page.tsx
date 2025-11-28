import { Suspense } from 'react'
import { Metadata } from 'next'
import NotificacionesClient from './NotificacionesClient'

export const metadata: Metadata = {
  title: 'Notificaciones | Panel de Administración',
  description: 'Sistema de notificaciones del panel administrativo',
}

export default function NotificacionesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
        <p className="text-gray-600 mt-2">
          Gestiona todas las notificaciones y actividades del sistema
        </p>
      </div>

      <Suspense fallback={<div>Cargando notificaciones...</div>}>
        <NotificacionesClient />
      </Suspense>
    </div>
  )
}