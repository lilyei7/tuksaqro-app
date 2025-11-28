"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Plus } from "lucide-react"
import { toast } from "react-hot-toast"
import SafeImage from "@/components/common/SafeImage"

const propertySchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres").optional().default(""),
  price: z.number().positive("El precio debe ser mayor a 0"),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL", "OFFICE"]),
  operation: z.enum(["SALE", "RENT"]),
  status: z.enum(["AVAILABLE", "SOLD", "RENTED", "PENDING"]),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  landArea: z.number().positive().optional(),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  state: z.string().min(2, "El estado debe tener al menos 2 caracteres"),
  zipCode: z.string().optional().default(""),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData & { id?: string; images?: string[]; features?: string[] }>
  onSubmit: (data: PropertyFormData & { images: string[]; features: string[] }) => Promise<void>
  isLoading?: boolean
}

export default function PropertyForm({ initialData, onSubmit, isLoading }: PropertyFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [imageUrl, setImageUrl] = useState("")
  const [features, setFeatures] = useState<string[]>(initialData?.features || [])
  const [featureInput, setFeatureInput] = useState("")
  const [uploading, setUploading] = useState(false)

  const defaultFormValues: PropertyFormData = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    type: initialData?.type || ("HOUSE" as const),
    operation: initialData?.operation || ("SALE" as const),
    status: (initialData?.status || "AVAILABLE") as "AVAILABLE" | "SOLD" | "RENTED" | "PENDING",
    bedrooms: initialData?.bedrooms,
    bathrooms: initialData?.bathrooms,
    area: initialData?.area,
    landArea: initialData?.landArea,
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema as any),
    defaultValues: defaultFormValues
  })

  const type = watch("type")
  const operation = watch("operation")
  const status = watch("status")

  const handleFormSubmit = async (data: PropertyFormData) => {
    // Ya no requerimos imágenes mínimas para publicar
    // Los documentos legales se pedirán después de publicar
    await onSubmit({ ...data, images, features })
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()])
      setFeatureInput("")
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const file = files[0]
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 5MB')
        return
      }

      // Convertir a base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setImages([...images, result])
          toast.success('Imagen subida correctamente')
        }
      }
      reader.onerror = () => {
        toast.error('Error al procesar la imagen')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
      // Limpiar el input
      event.target.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título de la propiedad *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ej: Casa moderna en residencial privado"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe la propiedad en detalle..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Tipo de propiedad *</Label>
              <Select
                value={type || ""}
                onValueChange={(value) => setValue("type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUSE">Casa</SelectItem>
                  <SelectItem value="APARTMENT">Departamento</SelectItem>
                  <SelectItem value="LAND">Terreno</SelectItem>
                  <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                  <SelectItem value="OFFICE">Oficina</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="operation">Operación *</Label>
              <Select
                value={operation || "SALE"}
                onValueChange={(value) => setValue("operation", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">Venta</SelectItem>
                  <SelectItem value="RENT">Renta</SelectItem>
                </SelectContent>
              </Select>
              {errors.operation && (
                <p className="text-sm text-red-600 mt-1">{errors.operation.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status || "AVAILABLE"}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="SOLD">Vendida</SelectItem>
                  <SelectItem value="RENTED">Rentada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="5000000"
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Características */}
      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedrooms">Recámaras</Label>
              <Input
                id="bedrooms"
                type="number"
                {...register("bedrooms", { valueAsNumber: true })}
                placeholder="3"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Baños</Label>
              <Input
                id="bathrooms"
                type="number"
                {...register("bathrooms", { valueAsNumber: true })}
                placeholder="2"
              />
            </div>

            <div>
              <Label htmlFor="area">Área de construcción (m²)</Label>
              <Input
                id="area"
                type="number"
                {...register("area", { valueAsNumber: true })}
                placeholder="150"
              />
            </div>

            <div>
              <Label htmlFor="landArea">Área de terreno (m²)</Label>
              <Input
                id="landArea"
                type="number"
                {...register("landArea", { valueAsNumber: true })}
                placeholder="200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Calle, número, colonia"
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Ciudad"
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="Estado"
              />
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode">Código Postal</Label>
              <Input
                id="zipCode"
                {...register("zipCode")}
                placeholder="12345"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes (Opcional - se pueden agregar después)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subir archivo */}
          <div>
            <Label htmlFor="image-upload">Subir imagen desde tu dispositivo</Label>
            <div className="mt-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
            </p>
          </div>

          {/* O agregar por URL */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="URL de la imagen"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            />
            <Button type="button" onClick={addImage}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={`image-${index}-${img.substring(0, 10)}`} className="relative group">
                  <SafeImage
                    src={img}
                    alt={`Imagen ${index + 1}`}
                    width={200}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2 bg-green-600">
                      Principal
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
          {images.length === 0 && (
            <p className="text-sm text-gray-500">
              Las imágenes se pueden agregar después de publicar la propiedad
            </p>
          )}
        </CardContent>
      </Card>

      {/* Amenidades */}
      <Card>
        <CardHeader>
          <CardTitle>Amenidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ej: Alberca, Jardín, Estacionamiento"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>

          {features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <Badge key={`feature-${index}-${feature}`} variant="secondary" className="pl-3 pr-1 py-1">
                  {feature}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-2"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData?.id ? "Actualizar propiedad" : "Publicar propiedad"}
        </Button>
      </div>
    </form>
  )
}