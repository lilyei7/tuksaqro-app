import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma/db'

export async function POST(request: NextRequest) {
  console.log('🖼️  UPLOAD ENDPOINT CALLED')
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    console.log('📁 File received:', file?.name, 'Size:', file?.size)

    if (!file) {
      console.log('❌ No file received')
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validar tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}.webp`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'hero-images', filename)

    // Crear directorio si no existe
    await mkdir(path.dirname(filepath), { recursive: true })

    // Optimizar y convertir la imagen usando Sharp
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 85 }) // Convertir a WebP con calidad 85%
      .resize(1920, 1080, { // Redimensionar manteniendo aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer()

    // Guardar la imagen optimizada
    await writeFile(filepath, optimizedBuffer)

    // Crear URL pública de la imagen
    const imageUrl = `/uploads/hero-images/${filename}`
    console.log('🖼️  Image processed successfully, URL:', imageUrl)

    // NO guardamos automáticamente en la base de datos
    // El guardado se hará desde el frontend cuando el usuario complete el formulario
    console.log('🚫 NOT saving to database automatically')
    // const title = data.get('title') as string
    // const description = data.get('description') as string
    // const order = parseInt(data.get('order') as string) || 0

    // if (title || description) {
    //   await prisma.heroImage.create({
    //     data: {
    //       title: title || null,
    //       description: description || null,
    //       imageUrl,
    //       order,
    //       isActive: true
    //     }
    //   })
    // }

    console.log('✅ Returning success response')
    return NextResponse.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}