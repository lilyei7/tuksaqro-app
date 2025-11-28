import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface PropertyData {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  status: string
  createdAt: string
  images: string[]
}

interface UserData {
  name?: string
  email?: string
  phone?: string
  role?: string
}

export const generatePropertyTechnicalSheet = async (
  property: PropertyData,
  includePersonalData: boolean = false,
  userData?: UserData
) => {
  const doc = new jsPDF()

  // Configuración de colores corporativos
  const primaryColor: [number, number, number] = [30, 64, 175] // Azul TUKSAQRO
  const secondaryColor: [number, number, number] = [5, 150, 105] // Verde
  const accentColor: [number, number, number] = [234, 88, 12] // Naranja
  const watermarkColor: [number, number, number] = [200, 200, 200] // Gris claro para watermark

  let yPosition = 20

  // Función auxiliar para convertir URLs relativas a absolutas
  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith('http')) return url
    return `${window.location.origin}${url}`
  }

  // Función para agregar watermark de protección
  const addWatermark = () => {
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }))

    // Watermark diagonal
    doc.setTextColor(watermarkColor[0], watermarkColor[1], watermarkColor[2])
    doc.setFontSize(60)
    doc.setFont('helvetica', 'bold')

    // Rotar y posicionar watermark
    doc.text('TUKSAQRO', 105, 150, {
      align: 'center',
      angle: 45
    })

    doc.restoreGraphicsState()
  }

  // Agregar watermark a todas las páginas
  addWatermark()

  // Header con logo y título
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 45, 'F')

  try {
    // Intentar cargar el logo
    const logoUrl = getAbsoluteUrl('/tksa.png')
    const logoResponse = await fetch(logoUrl)
    if (logoResponse.ok) {
      const logoBlob = await logoResponse.blob()
      const logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(logoBlob)
      })

      // Agregar logo
      doc.addImage(logoDataUrl, 'PNG', 15, 8, 30, 30)
    }
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error)
    // Fallback: texto del logo
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('TUKSAQRO', 50, 25)
  }

  // Título principal
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('TUKSAQRO', 50, 20)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Plataforma Inmobiliaria Profesional', 50, 30)

  // Fecha de generación
  doc.setFontSize(8)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 150, 40)

  yPosition = 60

  // Título de la ficha técnica
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('FICHA TÉCNICA DE PROPIEDAD', 105, yPosition, { align: 'center' })

  yPosition += 20

  // Información básica de la propiedad
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN GENERAL', 20, yPosition)

  // Línea separadora
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(0.5)
  doc.line(20, yPosition + 5, 190, yPosition + 5)

  yPosition += 15

  // Detalles de la propiedad
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const propertyDetails = [
    ['Título:', property.title],
    ['Tipo:', getPropertyTypeLabel(property.type)],
    ['Estado:', getPropertyStatusLabel(property.status)],
    ['Ubicación:', property.location],
    ['Precio:', formatPrice(property.price)],
    ['Área Total:', `${property.area} m²`],
    ['Habitaciones:', property.bedrooms.toString()],
    ['Baños:', property.bathrooms.toString()],
    ['Fecha de Registro:', new Date(property.createdAt).toLocaleDateString('es-ES')]
  ]

  propertyDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 20, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 80, yPosition)
    yPosition += 7
  })

  yPosition += 10

  // Descripción
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('DESCRIPCIÓN DETALLADA', 20, yPosition)

  yPosition += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Dividir la descripción en líneas
  const descriptionLines = doc.splitTextToSize(property.description, 160)
  doc.text(descriptionLines, 20, yPosition)

  yPosition += descriptionLines.length * 5 + 15

  // Verificar si necesitamos una nueva página para las imágenes
  if (yPosition > 200) {
    doc.addPage()
    addWatermark()
    yPosition = 30
  }

  // Galería de imágenes
  if (property.images && property.images.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('GALERÍA DE IMÁGENES', 20, yPosition)

    yPosition += 10

    // Mostrar hasta 4 imágenes
    const imagesToShow = property.images.slice(0, 4)
    const imageWidth = 45
    const imageHeight = 35
    const margin = 5

    for (let i = 0; i < imagesToShow.length; i++) {
      const x = 20 + (i % 2) * (imageWidth + margin)
      const y = yPosition + Math.floor(i / 2) * (imageHeight + margin)

      try {
        // Intentar cargar cada imagen
        const absoluteUrl = getAbsoluteUrl(imagesToShow[i])
        const imageResponse = await fetch(absoluteUrl)
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob()
          const imageDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(imageBlob)
          })

          // Agregar imagen
          doc.addImage(imageDataUrl, 'JPEG', x, y, imageWidth, imageHeight)
        }
      } catch (error) {
        console.warn(`No se pudo cargar la imagen ${i + 1}:`, error)
        // Placeholder para imagen faltante
        doc.setFillColor(240, 240, 240)
        doc.rect(x, y, imageWidth, imageHeight, 'F')
        doc.setTextColor(150, 150, 150)
        doc.setFontSize(8)
        doc.text('Imagen no disponible', x + imageWidth/2, y + imageHeight/2, { align: 'center' })
      }
    }

    yPosition += Math.ceil(imagesToShow.length / 2) * (imageHeight + margin) + 20
  }

  // Características principales
  if (yPosition > 220) {
    doc.addPage()
    addWatermark()
    yPosition = 30
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('CARACTERÍSTICAS PRINCIPALES', 20, yPosition)

  yPosition += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const features = [
    `🏠 ${property.bedrooms} Habitaciones`,
    `🚿 ${property.bathrooms} Baños`,
    `📐 ${property.area} m² de construcción`,
    `📍 Ubicación: ${property.location}`,
    `💰 Precio: ${formatPrice(property.price)}`,
    `🏷️ Tipo: ${getPropertyTypeLabel(property.type)}`
  ]

  features.forEach(feature => {
    doc.text(feature, 20, yPosition)
    yPosition += 8
  })

  // Información del agente/administrador (opcional)
  if (includePersonalData && userData) {
    yPosition += 10

    // Verificar si necesitamos una nueva página
    if (yPosition > 220) {
      doc.addPage()
      addWatermark()
      yPosition = 30
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('INFORMACIÓN DE CONTACTO', 20, yPosition)

    // Línea separadora
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(20, yPosition + 5, 190, yPosition + 5)

    yPosition += 15
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const contactInfo = [
      ['Agente:', userData.name || 'No especificado'],
      ['Correo:', userData.email || 'No especificado'],
      ['Teléfono:', userData.phone || 'No especificado'],
      ['Rol:', userData.role || 'Agente']
    ]

    contactInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 80, yPosition)
      yPosition += 7
    })

    yPosition += 10
  }

  // Footer con información legal y protección
  const pageHeight = doc.internal.pageSize.height
  doc.setFillColor(245, 245, 245)
  doc.rect(0, pageHeight - 35, 210, 35, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('TUKSAQRO - Plataforma Inmobiliaria Profesional', 105, pageHeight - 25, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text('Esta ficha técnica es generada automáticamente por el sistema TUKSAQRO', 105, pageHeight - 18, { align: 'center' })

  const footerText = includePersonalData
    ? 'Documento con información de contacto - Para distribución profesional'
    : 'Documento protegido - Uso exclusivo para fines informativos'

  doc.text(footerText, 105, pageHeight - 13, { align: 'center' })
  doc.text('www.tuksaqro.com', 105, pageHeight - 8, { align: 'center' })

  // Generar nombre del archivo
  const fileName = `Ficha_Tecnica_${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_${property.id.slice(-8)}.pdf`

  // Descargar el PDF
  doc.save(fileName)
}

// Funciones auxiliares
const getPropertyTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'HOUSE': 'Casa',
    'APARTMENT': 'Apartamento',
    'LAND': 'Terreno',
    'COMMERCIAL': 'Comercial'
  }
  return types[type] || type
}

const getPropertyStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    'AVAILABLE': 'Disponible',
    'SOLD': 'Vendido',
    'RENTED': 'Alquilado',
    'PENDING': 'Pendiente'
  }
  return statuses[status] || status
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price)
}