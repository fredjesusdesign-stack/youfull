'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Instructor {
  id: string
  name: string
}

interface Video {
  id: string
  title: string
  description?: string | null
  youtube_url?: string | null
  vimeo_url?: string | null
  thumbnail_url?: string | null
  duration_minutes?: number | null
  difficulty?: string | null
  category?: string | null
  tags?: string[] | null
  is_premium?: boolean
  instructor_id?: string | null
  published_at?: string | null
}

interface Props {
  action: (formData: FormData) => Promise<void>
  video?: Video
  instructors: Instructor[]
}

const CATEGORIES = ['Yoga', 'Meditação', 'Pilates', 'Respiração', 'Dança', 'Força', 'Outro']

export default function VideoForm({ action, video, instructors }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail_url ?? '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('thumbnails').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('thumbnails').getPublicUrl(path)
      setThumbnailUrl(data.publicUrl)
    } catch (err) {
      alert('Error uploading image.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors'
  const labelClass = 'block text-sm font-medium text-text mb-1.5'

  return (
    <form action={action} className="space-y-5">
      {video && <input type="hidden" name="id" value={video.id} />}

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input name="title" type="text" required defaultValue={video?.title} className={inputClass} placeholder="Video title" />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} defaultValue={video?.description ?? ''} className={inputClass} placeholder="Brief description..." />
      </div>

      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Cover image</label>
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
        <div
          className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          {thumbnailUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={thumbnailUrl} alt="Thumbnail" fill className="object-cover" sizes="400px" />
            </div>
          ) : (
            <div className="py-6">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-text-muted mx-auto mb-2" />
              ) : (
                <Upload size={20} className="text-text-muted mx-auto mb-2" />
              )}
              <p className="text-text-muted text-sm">Click to upload</p>
              <p className="text-text-muted text-xs mt-0.5">JPG, PNG, WebP</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {thumbnailUrl && (
          <button type="button" onClick={() => setThumbnailUrl('')} className="text-xs text-red-500 mt-1 hover:underline">
            Remove image
          </button>
        )}
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>YouTube URL (free)</label>
          <input name="youtube_url" type="url" defaultValue={video?.youtube_url ?? ''} className={inputClass} placeholder="https://youtube.com/watch?v=..." />
        </div>
        <div>
          <label className={labelClass}>Vimeo URL (premium)</label>
          <input name="vimeo_url" type="url" defaultValue={video?.vimeo_url ?? ''} className={inputClass} placeholder="https://vimeo.com/..." />
        </div>
      </div>

      {/* Category + Difficulty + Duration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={video?.category ?? ''} className={inputClass}>
            <option value="">Select...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Difficulty</label>
          <select name="difficulty" defaultValue={video?.difficulty ?? ''} className={inputClass}>
            <option value="">Select...</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Duration (min)</label>
          <input name="duration_minutes" type="number" min="1" defaultValue={video?.duration_minutes ?? ''} className={inputClass} placeholder="30" />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input name="tags" type="text" defaultValue={video?.tags?.join(', ') ?? ''} className={inputClass} placeholder="yoga, relaxation, beginner" />
      </div>

      {/* Instructor */}
      {instructors.length > 0 && (
        <div>
          <label className={labelClass}>Instructor</label>
          <select name="instructor_id" defaultValue={video?.instructor_id ?? ''} className={inputClass}>
            <option value="">None</option>
            {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      )}

      {/* Premium + Publish toggles */}
      {/* Hidden inputs send 'false'; checkboxes send 'true' when checked.
          Server actions use formData.getAll('field').includes('true') */}
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="hidden" name="is_premium" value="false" />
          <input
            type="checkbox"
            name="is_premium"
            value="true"
            defaultChecked={video?.is_premium ?? false}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-text">Premium content</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="hidden" name="publish" value="false" />
          <input
            type="checkbox"
            name="publish"
            value="true"
            defaultChecked={!!video?.published_at}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-text">Publish now</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors"
        >
          {video ? 'Save changes' : 'Create video'}
        </button>
        <a href="/admin/videos" className="px-6 py-2.5 border border-border text-text-muted hover:text-text rounded-full text-sm transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
