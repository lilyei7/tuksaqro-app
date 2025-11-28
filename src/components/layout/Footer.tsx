import Link from "next/link"
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">TUKSAQRO</span>
            </Link>
            <p className="text-gray-300 text-sm">
              La plataforma inmobiliaria más completa de México. 
              Conectamos propietarios, clientes y asesores.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors">
                  Buscar Propiedades
                </Link>
              </li>
              <li>
                <Link href="/vender" className="text-gray-300 hover:text-white transition-colors">
                  Vender Propiedad
                </Link>
              </li>
              <li>
                <Link href="/rentar" className="text-gray-300 hover:text-white transition-colors">
                  Rentar Propiedad
                </Link>
              </li>
              <li>
                <Link href="/asesores" className="text-gray-300 hover:text-white transition-colors">
                  Nuestros Asesores
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/evaluacion" className="text-gray-300 hover:text-white transition-colors">
                  Evaluación Gratuita
                </Link>
              </li>
              <li>
                <Link href="/creditos" className="text-gray-300 hover:text-white transition-colors">
                  Asesoría en Créditos
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-gray-300 hover:text-white transition-colors">
                  Asesoría Legal
                </Link>
              </li>
              <li>
                <Link href="/seguros" className="text-gray-300 hover:text-white transition-colors">
                  Seguros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-brand-blue" />
                <span className="text-gray-300 text-sm">
                  Av. Reforma 123, CDMX, México
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-brand-blue" />
                <span className="text-gray-300 text-sm">
                  +52 55 1234 5678
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-brand-blue" />
                <span className="text-gray-300 text-sm">
                  contacto@tuksaqro.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TUKSAQRO. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacidad" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de Uso
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}