"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings,
  Shield,
  Save,
  Database,
  Mail,
  ShieldCheck,
  Users,
  Building,
  FileText
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    siteName: 'Inmobiliaria App',
    siteDescription: 'Plataforma inmobiliaria completa',
    adminEmail: 'admin@inmobiliaria.com',
    smtpEnabled: false,
    maintenanceMode: false,
    allowRegistrations: true,
    maxPropertiesPerUser: 10,
    maxOffersPerProperty: 5,
  })

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleSaveSettings = async () => {
    try {
      // Aquí iría la lógica para guardar en la base de datos
      toast.success('Configuración guardada exitosamente')
    } catch (error) {
      toast.error('Error al guardar configuración')
    }
  }

  const handleExportData = async () => {
    try {
      // Aquí iría la lógica para exportar datos
      toast.success('Datos exportados exitosamente')
    } catch (error) {
      toast.error('Error al exportar datos')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando...</h2>
          <p className="text-gray-600">Cargando configuración</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de la Página */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <span>Configuración del Sistema</span>
        </h2>
        <p className="text-gray-600 mt-2">Configura los parámetros generales del sistema inmobiliario</p>
      </div>

      <div className="space-y-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configuración General</span>
            </CardTitle>
            <CardDescription>
              Configuración básica del sitio web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Nombre del Sitio</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Email del Administrador</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="siteDescription">Descripción del Sitio</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Correo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Configuración de Correo</span>
            </CardTitle>
            <CardDescription>
              Configuración del sistema de envío de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smtpEnabled">SMTP Habilitado</Label>
                <p className="text-sm text-gray-600">Activar envío de emails automáticos</p>
              </div>
              <input
                type="checkbox"
                id="smtpEnabled"
                checked={settings.smtpEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpEnabled: e.target.checked }))}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Configuración de Usuarios</span>
            </CardTitle>
            <CardDescription>
              Configuración relacionada con usuarios y registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowRegistrations">Permitir Registros</Label>
                <p className="text-sm text-gray-600">Permitir que nuevos usuarios se registren</p>
              </div>
              <input
                type="checkbox"
                id="allowRegistrations"
                checked={settings.allowRegistrations}
                onChange={(e) => setSettings(prev => ({ ...prev, allowRegistrations: e.target.checked }))}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Modo Mantenimiento</Label>
                <p className="text-sm text-gray-600">Activar modo mantenimiento (solo admins)</p>
              </div>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Propiedades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Configuración de Propiedades</span>
            </CardTitle>
            <CardDescription>
              Límites y configuraciones para propiedades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxPropertiesPerUser">Máximo de Propiedades por Usuario</Label>
                <Input
                  id="maxPropertiesPerUser"
                  type="number"
                  value={settings.maxPropertiesPerUser}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxPropertiesPerUser: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="maxOffersPerProperty">Máximo de Ofertas por Propiedad</Label>
                <Input
                  id="maxOffersPerProperty"
                  type="number"
                  value={settings.maxOffersPerProperty}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxOffersPerProperty: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Acciones del Sistema</span>
            </CardTitle>
            <CardDescription>
              Operaciones administrativas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleSaveSettings} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </Button>
              <Button variant="outline" onClick={handleExportData} className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Exportar Datos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}