"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MapPin, Calculator, DollarSign } from "lucide-react"

// Datos de apreciación por zona en Querétaro (tasas anuales aproximadas basadas en tendencias del mercado)
const zonasQueretaro = {
  "Centro Histórico": { tasa: 0.08, descripcion: "Zona tradicional con alto valor cultural" },
  "El Refugio": { tasa: 0.07, descripcion: "Desarrollo moderno con crecimiento constante" },
  "Juriquilla": { tasa: 0.10, descripcion: "Zona premium con alto potencial de plusvalía" },
  "Santa María": { tasa: 0.06, descripcion: "Zona residencial consolidada" },
  "La Estancia": { tasa: 0.09, descripcion: "Desarrollo exclusivo con amenidades" },
  "Bernardo Quintana": { tasa: 0.08, descripcion: "Zona comercial en crecimiento" },
  "Carretas": { tasa: 0.07, descripcion: "Zona residencial familiar" },
  "Cerrito Colorado": { tasa: 0.06, descripcion: "Zona tradicional con estabilidad" }
}

interface SimuladorInversionModalProps {
  children: React.ReactNode
}

export default function SimuladorInversionModal({ children }: SimuladorInversionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [precioInicial, setPrecioInicial] = useState('')
  const [anos, setAnos] = useState('5')
  const [zona, setZona] = useState('')
  const [resultado, setResultado] = useState<{
    valorFinal: number
    plusvalia: number
    rendimientoAnual: number
    rendimientoTotal: number
  } | null>(null)

  const calcularPlusvalia = () => {
    const precio = parseFloat(precioInicial.replace(/,/g, ''))
    const anosNum = parseInt(anos)
    const zonaSeleccionada = zonasQueretaro[zona as keyof typeof zonasQueretaro]

    if (!precio || !anosNum || !zonaSeleccionada) return

    const tasaAnual = zonaSeleccionada.tasa
    const valorFinal = precio * Math.pow(1 + tasaAnual, anosNum)
    const plusvalia = valorFinal - precio
    const rendimientoTotal = (plusvalia / precio) * 100
    const rendimientoAnual = (Math.pow(1 + tasaAnual, 1 / anosNum) - 1) * 100

    setResultado({
      valorFinal: Math.round(valorFinal),
      plusvalia: Math.round(plusvalia),
      rendimientoAnual: Math.round(rendimientoAnual * 100) / 100,
      rendimientoTotal: Math.round(rendimientoTotal * 100) / 100
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const resetForm = () => {
    setPrecioInicial('')
    setAnos('5')
    setZona('')
    setResultado(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Simulador de Plusvalía - Querétaro
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Formulario de entrada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Parámetros de Inversión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio Inicial (MXN)</Label>
                  <Input
                    id="precio"
                    type="text"
                    placeholder="Ej: 2,500,000"
                    value={precioInicial}
                    onChange={(e) => setPrecioInicial(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anos">Período de Inversión (años)</Label>
                  <Select value={anos} onValueChange={setAnos}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar años" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 año</SelectItem>
                      <SelectItem value="2">2 años</SelectItem>
                      <SelectItem value="3">3 años</SelectItem>
                      <SelectItem value="5">5 años</SelectItem>
                      <SelectItem value="10">10 años</SelectItem>
                      <SelectItem value="15">15 años</SelectItem>
                      <SelectItem value="20">20 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zona">Zona en Querétaro</Label>
                <Select value={zona} onValueChange={setZona}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(zonasQueretaro).map(([nombre, datos]) => (
                      <SelectItem key={nombre} value={nombre}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{nombre}</div>
                            <div className="text-xs text-gray-500">{datos.descripcion}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={calcularPlusvalia}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!precioInicial || !zona}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Calcular Plusvalía
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {resultado && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="w-5 h-5" />
                  Resultados de la Simulación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Valor Final</Label>
                    <div className="text-2xl font-bold text-green-800">
                      {formatCurrency(resultado.valorFinal)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Plusvalía Generada</Label>
                    <div className="text-2xl font-bold text-green-800">
                      {formatCurrency(resultado.plusvalia)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Rendimiento Anual Promedio</Label>
                    <div className="text-xl font-semibold text-green-700">
                      {resultado.rendimientoAnual.toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Rendimiento Total</Label>
                    <div className="text-xl font-semibold text-green-700">
                      {resultado.rendimientoTotal.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Resumen:</strong> Una inversión inicial de {formatCurrency(parseFloat(precioInicial.replace(/,/g, '')))} 
                    en {zona} durante {anos} años generaría una plusvalía de {formatCurrency(resultado.plusvalia)}, 
                    resultando en un valor final de {formatCurrency(resultado.valorFinal)}.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}