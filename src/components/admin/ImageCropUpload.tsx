'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
  value: string
  onChange: (url: string) => void
  bucket: string
  pathPrefix?: string
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D canvas context')

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas is empty'))
    }, 'image/jpeg', 0.92)
  })
}

export default function ImageCropUpload({ value, onChange, bucket, pathPrefix = '' }: Props) {
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.overflow = cropSrc ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cropSrc])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const img = new window.Image()
      img.onload = () => setDimensions({ w: img.naturalWidth, h: img.naturalHeight })
      img.src = src
      setCropSrc(src)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  async function handleApply() {
    if (!cropSrc || !croppedAreaPixels) return
    setUploading(true)
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const prefix = pathPrefix ? `${pathPrefix}/` : ''
      const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error } = await supabase.storage.from(bucket).upload(path, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      })
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(data.publicUrl)
      setCropSrc(null)
      setDimensions(null)
    } catch (err) {
      console.error(err)
      alert('Erro ao fazer upload da imagem.')
    } finally {
      setUploading(false)
    }
  }

  function handleCancel() {
    setCropSrc(null)
    setDimensions(null)
  }

  return (
    <>
      <div
        className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors text-center"
        onClick={() => fileInputRef.current?.click()}
      >
        {value ? (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image src={value} alt="Thumbnail" fill className="object-cover" sizes="400px" />
          </div>
        ) : (
          <div className="py-6">
            <Upload size={20} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">Clica para fazer upload</p>
            <p className="text-text-muted text-xs mt-0.5">JPG, PNG, WebP</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {value && (
        <button type="button" onClick={() => onChange('')} className="text-xs text-red-500 mt-1 hover:underline">
          Remover imagem
        </button>
      )}

      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-background rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Ajustar imagem</h3>
              {dimensions && (
                <span className="text-xs text-text-muted">{dimensions.w} × {dimensions.h} px</span>
              )}
            </div>
            <div className="relative w-full" style={{ height: 300 }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-3 flex items-center justify-between border-t border-border">
              <p className="text-xs text-text-muted">Scroll para zoom · Arrasta para ajustar</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-border text-text-muted hover:text-text rounded-full text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {uploading && <Loader2 size={14} className="animate-spin" />}
                  {uploading ? 'A enviar...' : 'Aplicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
