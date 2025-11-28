"use client"

import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DocumentRequirementProps {
  userHasVerifiedINE?: boolean
  onUploadDocuments: () => void
}

export default function DocumentRequirement({
  userHasVerifiedINE = false,
  onUploadDocuments,
}: DocumentRequirementProps) {
  if (userHasVerifiedINE) {
    return null // No mostrar si ya tiene INE verificado
  }

  return (
    <Card className="border-yellow-300 bg-yellow-50 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 mb-2">
              🔒 Verificación de Identidad Requerida
            </h3>
            <p className="text-sm text-yellow-700 mb-2">
              Para poder crear y publicar propiedades en la plataforma, necesitas verificar tu identidad. 
            </p>
            <p className="text-sm text-yellow-700 mb-4">
              <strong>¿Qué necesitas?</strong> Una foto clara del frente y dorso de tu INE (Documento Nacional de Identidad)
            </p>
            <div className="bg-white border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
              <strong>Información importante:</strong>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>Tus documentos se protegen con encriptación de máximo nivel</li>
                <li>Solo nuestro equipo de verificación tiene acceso</li>
                <li>Aceptar el proceso significa que aceptas nuestros términos y política de privacidad</li>
              </ul>
            </div>
            <Button 
              onClick={onUploadDocuments}
              className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
            >
              🔐 Comenzar Verificación de Identidad
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
