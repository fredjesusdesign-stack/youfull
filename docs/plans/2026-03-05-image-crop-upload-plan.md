# Image Crop Upload — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a crop modal + dimension display when uploading thumbnail images in VideoForm, PostForm and RecipeForm.

**Architecture:** Create a shared `ImageCropUpload` client component using `react-easy-crop`. When a file is selected, a modal opens where the user adjusts a 16:9 crop. The cropped image is converted to a JPEG blob via canvas, uploaded to Supabase, and the URL returned via `onChange`. The 3 forms are updated to use this component, removing their inline upload logic.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase Storage, `react-easy-crop`

---

### Task 1: Install react-easy-crop

**Files:**
- Modify: `package.json` (npm install)

**Step 1: Install the package**

```bash
npm install react-easy-crop
```

Expected output: added 1 package, no peer dependency warnings.

**Step 2: Verify types are included**

```bash
ls node_modules/react-easy-crop/dist
```

Expected: `index.js`, `index.d.ts` (types are bundled — no @types needed).

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install react-easy-crop"
```

---

### Task 2: Create ImageCropUpload component

**Files:**
- Create: `src/components/admin/ImageCropUpload.tsx`

**Step 1: Create the file with the following content**

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
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
  const ctx = canvas.getContext('2d')!

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
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to the new file.

**Step 3: Commit**

```bash
git add src/components/admin/ImageCropUpload.tsx
git commit -m "feat: add ImageCropUpload component with crop modal"
```

---

### Task 3: Update VideoForm

**Files:**
- Modify: `src/components/admin/VideoForm.tsx`

**Context:** `VideoForm.tsx` currently has inline upload logic (lines 37-60 state/handler, lines 81-111 UI block). We replace all of this with `<ImageCropUpload>`.

**Step 1: Replace the file content**

Remove: `uploading` state, `fileInputRef` ref, `handleImageUpload` function, the upload UI block, and the hidden file input.
Add: import of `ImageCropUpload`, replace the upload section with the component.

The new top of the file (imports + state):

```tsx
'use client'

import { useState } from 'react'
import ImageCropUpload from './ImageCropUpload'

// ... (keep all interfaces and CATEGORIES unchanged) ...

export default function VideoForm({ action, video, instructors }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail_url ?? '')

  // remove: uploading state, fileInputRef, handleImageUpload
```

The thumbnail section (replace lines 81-111):

```tsx
      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Cover image</label>
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
        <ImageCropUpload
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          bucket="thumbnails"
        />
      </div>
```

Also remove unused imports: `Upload`, `Loader2`, `useRef`, `Image` (if no longer used elsewhere in the file — check first).

**Step 2: Check for build errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Manual test**

Start dev server (`npm run dev`), go to `/admin/videos/new` or edit an existing video, upload an image, verify crop modal appears.

**Step 4: Commit**

```bash
git add src/components/admin/VideoForm.tsx
git commit -m "feat: use ImageCropUpload in VideoForm"
```

---

### Task 4: Update PostForm

**Files:**
- Modify: `src/components/admin/PostForm.tsx`

**Context:** Same pattern as Task 3. PostForm has inline upload logic to remove and replace.

**Step 1: Update imports and remove inline upload logic**

Remove: `uploading` state, `fileInputRef`, `handleImageUpload` function.
Keep: `thumbnailUrl` state, `content` state, `TiptapEditor` import.

Add import:
```tsx
import ImageCropUpload from './ImageCropUpload'
```

**Step 2: Replace the thumbnail section (around lines 79-96)**

```tsx
      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Cover image</label>
        <ImageCropUpload
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          bucket="thumbnails"
        />
      </div>
```

Note: `PostForm` puts the hidden `thumbnail_url` input at the top of the form (line 58). Keep that. The `ImageCropUpload` component does NOT render a hidden input — it only calls `onChange`. So the existing hidden input at the top must remain.

**Step 3: Check for build errors**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/components/admin/PostForm.tsx
git commit -m "feat: use ImageCropUpload in PostForm"
```

---

### Task 5: Update RecipeForm

**Files:**
- Modify: `src/components/admin/RecipeForm.tsx`

**Context:** Same pattern. RecipeForm also has inline upload logic.

**Step 1: Update imports and remove inline upload logic**

Remove: `uploading` state, `fileInputRef`, `handleImageUpload` function.
Keep: `thumbnailUrl` state and all other state (ingredients, steps).

Add import:
```tsx
import ImageCropUpload from './ImageCropUpload'
```

**Step 2: Replace the thumbnail section (around lines 87-105)**

```tsx
      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Cover image</label>
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
        <ImageCropUpload
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          bucket="thumbnails"
        />
      </div>
```

**Step 3: Check for build errors**

```bash
npx tsc --noEmit
```

**Step 4: Final manual verification**

Test all 3 forms (videos, blog, recipes):
1. Click upload area → file picker opens
2. Select an image → modal opens showing dimensions (e.g. `1920 × 1080 px`)
3. Drag to reposition, scroll to zoom
4. Click "Aplicar" → upload spinner shows → modal closes → preview updates
5. Submit the form → image URL is saved correctly
6. Click "Remover imagem" → preview clears

**Step 5: Commit**

```bash
git add src/components/admin/RecipeForm.tsx
git commit -m "feat: use ImageCropUpload in RecipeForm"
```
