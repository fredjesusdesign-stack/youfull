'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Collection {
  id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  is_premium?: boolean
}

interface Props {
  action: (formData: FormData) => Promise<void>
  collection?: Collection
}

export default function CollectionForm({ action, collection }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(collection?.thumbnail_url ?? '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `collections/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('thumbnails').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('thumbnails').getPublicUrl(path)
      setThumbnailUrl(data.publicUrl)
    } catch { alert('Error uploading.') }
    finally { setUploading(false) }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors'

  return (
    <form action={action} className="space-y-4">
      {collection && <input type="hidden" name="id" value={collection.id} />}
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Title *</label>
        <input name="title" type="text" required defaultValue={collection?.title} className={inputClass} placeholder="Collection name" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Description</label>
        <textarea name="description" rows={2} defaultValue={collection?.description ?? ''} className={inputClass} placeholder="Brief description..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Cover image</label>
        <div className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors text-center" onClick={() => fileInputRef.current?.click()}>
          {thumbnailUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={thumbnailUrl} alt="Cover" fill className="object-cover" sizes="400px" />
            </div>
          ) : (
            <div className="py-4">
              {uploading ? <Loader2 size={18} className="animate-spin text-text-muted mx-auto mb-1" /> : <Upload size={18} className="text-text-muted mx-auto mb-1" />}
              <p className="text-text-muted text-xs">Click to upload</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="hidden" name="is_premium" value="false" />
        <input type="checkbox" name="is_premium" value="true" defaultChecked={collection?.is_premium ?? false} className="w-4 h-4 accent-primary" />
        <span className="text-sm text-text">Premium collection</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors">
          {collection ? 'Save' : 'Create collection'}
        </button>
        <a href="/admin/colecoes" className="px-6 py-2.5 border border-border text-text-muted hover:text-text rounded-full text-sm transition-colors">Cancel</a>
      </div>
    </form>
  )
}
