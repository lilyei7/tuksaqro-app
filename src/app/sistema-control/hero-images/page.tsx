"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Palette } from "lucide-react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { useDropzone } from "react-dropzone"

interface HeroImage {
  id: string
  title?: string
  description?: string
  imageUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Nuevos campos para overlay de texto
  overlayTitle?: string
  overlaySubtitle?: string
  overlayTitleColor?: string
  overlaySubtitleColor?: string
  overlayPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  overlayBackgroundColor?: string
  overlayBackgroundOpacity?: number
}

export default function AdminHeroImagesPage() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    imageUrl: string
    order: number
    isActive: boolean
    overlayTitle: string
    overlaySubtitle: string
    overlayTitleColor: string
    overlaySubtitleColor: string
    overlayPosition: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right"
    overlayBackgroundColor: string
    overlayBackgroundOpacity: number
  }>({
    title: "",
    description: "",
    imageUrl: "",
    order: 0,
    isActive: true,
    overlayTitle: "",
    overlaySubtitle: "",
    overlayTitleColor: "#ffffff",
    overlaySubtitleColor: "#ffffff",
    overlayPosition: "center",
    overlayBackgroundColor: "#000000",
    overlayBackgroundOpacity: 0.5
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchHeroImages()
  }, [])

  // Función para subir imagen con optimización
  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      // NO enviamos los campos de metadata aquí, solo el archivo

      const response = await fetch('/api/upload/hero-image', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }))
        toast.success('Imagen subida correctamente. Completa los campos y guarda.')
        return result.imageUrl
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al subir la imagen')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen')
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Configuración de dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log("onDrop called with files:", acceptedFiles)
    const file = acceptedFiles[0]
    if (file) {
      console.log("Uploading file:", file.name)
      const imageUrl = await uploadImage(file)
      console.log("Upload result:", imageUrl)
      if (imageUrl) {
        // Solo actualizamos el formData con la URL, pero NO guardamos automáticamente
        console.log("Setting formData.imageUrl to:", imageUrl)
        setFormData(prev => ({ ...prev, imageUrl }))
        toast.success("Imagen subida correctamente. Completa los campos y guarda.")
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  })

  const fetchHeroImages = async () => {
    try {
      const response = await fetch("/api/admin/hero-images")
      if (response.ok) {
        const data = await response.json()
        setHeroImages(data.heroImages || [])
      } else {
        toast.error("Error al cargar imágenes")
      }
    } catch (error) {
      console.error("Error fetching hero images:", error)
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit called", e)
    e.preventDefault()
    e.stopPropagation()

    // Verificar que el evento viene de un clic de usuario, no de una ejecución automática
    if (!e || e.type !== 'submit') {
      console.log("handleSubmit called without proper event, ignoring")
      return
    }

    if (isSubmitting) {
      console.log("Already submitting, ignoring")
      return
    }

    // Si no hay URL de imagen y no estamos editando, mostrar error
    if (!formData.imageUrl.trim() && !editingImage) {
      toast.error("Debes subir una imagen")
      return
    }

    setIsSubmitting(true)
    console.log("Submitting form with data:", formData)

    try {
      const url = editingImage
        ? `/api/admin/hero-images/${editingImage.id}`
        : "/api/admin/hero-images"

      const method = editingImage ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(editingImage ? "Imagen actualizada" : "Imagen creada")
        setIsDialogOpen(false)
        setEditingImage(null)
        resetForm()
        fetchHeroImages()
      } else {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        toast.error(errorData.error || "Error al guardar la imagen")
      }
    } catch (error) {
      console.error("Error saving hero image:", error)
      toast.error("Error de conexión")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (image: HeroImage) => {
    setEditingImage(image)
    setFormData({
      title: image.title || "",
      description: image.description || "",
      imageUrl: image.imageUrl,
      order: image.order,
      isActive: image.isActive,
      overlayTitle: image.overlayTitle || "",
      overlaySubtitle: image.overlaySubtitle || "",
      overlayTitleColor: image.overlayTitleColor || "#ffffff",
      overlaySubtitleColor: image.overlaySubtitleColor || "#ffffff",
    overlayPosition: (image.overlayPosition as "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right") || "center",
      overlayBackgroundColor: image.overlayBackgroundColor || "#000000",
      overlayBackgroundOpacity: image.overlayBackgroundOpacity || 0.5
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/hero-images/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Imagen eliminada")
        // Refrescar los datos inmediatamente después de eliminar
        await fetchHeroImages()
      } else {
        const errorData = await response.json()
        toast.error(`Error al eliminar la imagen: ${errorData.error || 'Error desconocido'}`)
        // También refrescar en caso de error para asegurar sincronización
        await fetchHeroImages()
      }
    } catch (error) {
      console.error("Error deleting hero image:", error)
      toast.error("Error de conexión al eliminar la imagen")
      // Refrescar incluso en caso de error de red
      await fetchHeroImages()
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id) // Mostrar que está procesando
    
    try {
      const response = await fetch(`/api/admin/hero-images/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        // Actualizar estado local inmediatamente para mejor UX
        setHeroImages(heroImages.map(img => 
          img.id === id ? { ...img, isActive: !currentStatus } : img
        ))
        
        // Toast con mejor mensaje
        toast.success(`✅ Imagen ${!currentStatus ? "activada" : "desactivada"} correctamente`, {
          duration: 2000,
          position: 'top-right'
        })
      } else {
        toast.error("❌ Error al cambiar el estado", {
          duration: 2000,
          position: 'top-right'
        })
      }
    } catch (error) {
      console.error("Error toggling hero image:", error)
      toast.error("❌ Error de conexión", {
        duration: 2000,
        position: 'top-right'
      })
    } finally {
      setTogglingId(null) // Dejar de mostrar que está procesando
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      order: 0,
      isActive: true,
      overlayTitle: "",
      overlaySubtitle: "",
      overlayTitleColor: "#ffffff",
      overlaySubtitleColor: "#ffffff",
      overlayPosition: "center",
      overlayBackgroundColor: "#000000",
      overlayBackgroundOpacity: 0.5
    })
  }

  const openCreateDialog = () => {
    setEditingImage(null)
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imágenes del Hero</h1>
          <p className="text-muted-foreground">
            Gestiona las imágenes que se muestran en el carrusel de la página principal
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Imagen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes del Carrusel</CardTitle>
          <CardDescription>
            Las imágenes se muestran en orden ascendente. Solo las imágenes activas aparecen en el sitio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando imágenes...</span>
            </div>
          ) : heroImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay imágenes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Agrega imágenes para mostrar en el carrusel de la página principal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={image.imageUrl}
                      alt={image.title || "Imagen del hero"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 transition-all duration-300">
                      <Badge variant={image.isActive ? "default" : "secondary"} className="flex items-center gap-1">
                        {togglingId === image.id ? (
                          <>
                            <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
                            <span className="text-xs">Procesando...</span>
                          </>
                        ) : (
                          <>
                            {image.isActive ? "✓ Activa" : "○ Inactiva"}
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{image.title || "Sin título"}</h3>
                    {image.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Orden: {image.order}</span>
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(image.id, image.isActive)}
                        disabled={togglingId === image.id}
                        className="transition-all"
                      >
                        {togglingId === image.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600 mr-1"></div>
                            <span className="text-xs">Procesando...</span>
                          </>
                        ) : image.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span className="ml-1 text-xs hidden sm:inline">Desactivar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="ml-1 text-xs hidden sm:inline">Activar</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(image)}
                        disabled={togglingId === image.id}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="ml-1 text-xs hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        disabled={togglingId === image.id}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="ml-1 text-xs hidden sm:inline">Eliminar</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar imagen */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) {
          setIsDialogOpen(open)
          if (!open) {
            setEditingImage(null)
            resetForm()
          }
        }
      }}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {editingImage ? "Editar Imagen" : "Agregar Nueva Imagen"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingImage
                ? "Modifica los detalles de la imagen del hero."
                : "Agrega una nueva imagen al carrusel del hero."
              }
            </DialogDescription>
          </DialogHeader>
          <form
            key={editingImage?.id || 'new'}
            onSubmit={handleSubmit}
            className="space-y-4 md:space-y-6"
            noValidate
          >
            {/* Área de subida de imagen con drag & drop */}
            <div className="space-y-3 md:space-y-4">
              <Label className="text-sm font-medium">Imagen</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs md:text-sm text-gray-600">Optimizando imagen...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : formData.imageUrl ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="relative h-24 md:h-32 mx-auto max-w-xs">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFormData(prev => ({ ...prev, imageUrl: '' }))
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">Imagen subida correctamente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto" />
                    <p className="text-xs md:text-sm text-gray-600">
                      {isDragActive
                        ? 'Suelta la imagen aquí'
                        : 'Arrastra y suelta una imagen aquí, o haz clic para seleccionar'
                      }
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP hasta 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Título</Label>
                <Input
                  id="title"
                  placeholder="Título de la imagen"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isSubmitting}
                  className="h-9 md:h-10"
                />
              </div>
              <div>
                <Label htmlFor="order" className="text-sm font-medium">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  disabled={isSubmitting}
                  className="h-9 md:h-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción de la imagen"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                disabled={isSubmitting}
                className="min-h-[50px] md:min-h-[60px] resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <Label htmlFor="isActive" className="text-sm font-medium">
                Imagen activa (visible en el sitio)
              </Label>
            </div>

            {/* Configuración de Overlay de Texto */}
            <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <Label className="text-base md:text-lg font-semibold">Overlay de Texto</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="overlayTitle" className="text-sm font-medium">Título del Overlay</Label>
                  <Input
                    id="overlayTitle"
                    placeholder="Texto principal"
                    value={formData.overlayTitle}
                    onChange={(e) => setFormData({ ...formData, overlayTitle: e.target.value })}
                    disabled={isSubmitting}
                    className="h-9 md:h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="overlaySubtitle" className="text-sm font-medium">Subtítulo del Overlay</Label>
                  <Input
                    id="overlaySubtitle"
                    placeholder="Texto secundario"
                    value={formData.overlaySubtitle}
                    onChange={(e) => setFormData({ ...formData, overlaySubtitle: e.target.value })}
                    disabled={isSubmitting}
                    className="h-9 md:h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="overlayTitleColor" className="text-sm font-medium">Color del Título</Label>
                  <div className="flex gap-2">
                    <Input
                      id="overlayTitleColor"
                      type="color"
                      value={formData.overlayTitleColor}
                      onChange={(e) => setFormData({ ...formData, overlayTitleColor: e.target.value })}
                      className="w-12 h-8 md:w-16 md:h-10 p-1 border rounded"
                      disabled={isSubmitting}
                    />
                    <Input
                      type="text"
                      value={formData.overlayTitleColor}
                      onChange={(e) => setFormData({ ...formData, overlayTitleColor: e.target.value })}
                      className="flex-1 h-8 md:h-10"
                      placeholder="#ffffff"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="overlaySubtitleColor" className="text-sm font-medium">Color del Subtítulo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="overlaySubtitleColor"
                      type="color"
                      value={formData.overlaySubtitleColor}
                      onChange={(e) => setFormData({ ...formData, overlaySubtitleColor: e.target.value })}
                      className="w-12 h-8 md:w-16 md:h-10 p-1 border rounded"
                      disabled={isSubmitting}
                    />
                    <Input
                      type="text"
                      value={formData.overlaySubtitleColor}
                      onChange={(e) => setFormData({ ...formData, overlaySubtitleColor: e.target.value })}
                      className="flex-1 h-8 md:h-10"
                      placeholder="#ffffff"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="overlayPosition" className="text-sm font-medium">Posición del Overlay</Label>
                  <Select
                    value={formData.overlayPosition}
                    onValueChange={(value: any) => setFormData({ ...formData, overlayPosition: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9 md:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Arriba Izquierda</SelectItem>
                      <SelectItem value="top-center">Arriba Centro</SelectItem>
                      <SelectItem value="top-right">Arriba Derecha</SelectItem>
                      <SelectItem value="center-left">Centro Izquierda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="center-right">Centro Derecha</SelectItem>
                      <SelectItem value="bottom-left">Abajo Izquierda</SelectItem>
                      <SelectItem value="bottom-center">Abajo Centro</SelectItem>
                      <SelectItem value="bottom-right">Abajo Derecha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="overlayBackgroundColor" className="text-sm font-medium">Color de Fondo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="overlayBackgroundColor"
                      type="color"
                      value={formData.overlayBackgroundColor}
                      onChange={(e) => setFormData({ ...formData, overlayBackgroundColor: e.target.value })}
                      className="w-12 h-8 md:w-16 md:h-10 p-1 border rounded"
                      disabled={isSubmitting}
                    />
                    <Input
                      type="text"
                      value={formData.overlayBackgroundColor}
                      onChange={(e) => setFormData({ ...formData, overlayBackgroundColor: e.target.value })}
                      className="flex-1 h-8 md:h-10"
                      placeholder="#000000"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="overlayBackgroundOpacity" className="text-sm font-medium">Opacidad del Fondo: {Math.round(formData.overlayBackgroundOpacity * 100)}%</Label>
                <Input
                  id="overlayBackgroundOpacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.overlayBackgroundOpacity}
                  onChange={(e) => setFormData({ ...formData, overlayBackgroundOpacity: parseFloat(e.target.value) })}
                  className="w-full h-2"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 md:pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!isSubmitting) {
                    setIsDialogOpen(false)
                    setEditingImage(null)
                    resetForm()
                  }
                }}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-9 md:h-10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formData.imageUrl.trim() || isSubmitting}
                className="w-full sm:w-auto h-9 md:h-10"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingImage ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  editingImage ? "Actualizar" : "Crear"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}