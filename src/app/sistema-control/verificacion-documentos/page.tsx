import { Metadata } from "next"
import DocumentVerificationClient from "./DocumentVerificationClient"

export const metadata: Metadata = {
  title: "Verificación de Documentos",
  description: "Panel para verificar documentos de identidad de usuarios",
}

export default function DocumentVerificationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Verificación de Documentos
        </h1>
        <p className="text-gray-600 mt-2">
          Revisa y verifica los documentos de identidad enviados por los usuarios
        </p>
      </div>

      <DocumentVerificationClient />
    </div>
  )
}
