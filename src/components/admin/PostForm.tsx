'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'
import TiptapEditor from './TiptapEditor'

interface Post {
  id: string
  title: string
  content?: Record<string, unknown> | null
  thumbnail_url?: string | null
  video_url?: string | null
  category?: string | null
  tags?: string[] | null
  published_at?: string | null
}

interface Props {
  action: (formData: FormData) => Promise<void>
  post?: Post
}

const CATEGORIES = ['Yoga', 'Nutrition', 'Wellness', 'Meditation', 'Recipes', 'Lifestyle']

export default function PostForm({ action, post }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnail_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [content, setContent] = useState<Record<string, unknown>>(
    (post?.content as Record<string, unknown>) ?? { type: 'doc', content: [{ type: 'paragraph' }] }
  )
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
    } catch { alert('Error uploading.') }
    finally { setUploading(false) }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors'
  const labelClass = 'block text-sm font-medium text-text mb-1.5'

  return (
    <form action={action} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="content" value={JSON.stringify(content)} />
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

      <div>
        <label className={labelClass}>Title *</label>
        <input name="title" type="text" required defaultValue={post?.title} className={inputClass} placeholder="Article title" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={post?.category ?? ''} className={inputClass}>
            <option value="">Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tags</label>
          <input name="tags" type="text" defaultValue={post?.tags?.join(', ') ?? ''} className={inputClass} placeholder="yoga, wellness" />
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Cover image</label>
        <div className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors text-center" onClick={() => fileInputRef.current?.click()}>
          {thumbnailUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={thumbnailUrl} alt="Thumbnail" fill className="object-cover" sizes="400px" />
            </div>
          ) : (
            <div className="py-6">
              {uploading ? <Loader2 size={20} className="animate-spin text-text-muted mx-auto mb-2" /> : <Upload size={20} className="text-text-muted mx-auto mb-2" />}
              <p className="text-text-muted text-sm">Click to upload</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {thumbnailUrl && <button type="button" onClick={() => setThumbnailUrl('')} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>}
      </div>

      {/* Video URL */}
      <div>
        <label className={labelClass}>Video URL (optional)</label>
        <input name="video_url" type="url" defaultValue={post?.video_url ?? ''} className={inputClass} placeholder="https://youtube.com/..." />
      </div>

      {/* Rich text editor */}
      <div>
        <label className={labelClass}>Content</label>
        <TiptapEditor initialContent={post?.content as Record<string, unknown> | null} onChange={setContent} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="hidden" name="publish" value="false" />
        <input type="checkbox" name="publish" value="true" defaultChecked={!!post?.published_at} className="w-4 h-4 accent-primary" />
        <span className="text-sm text-text">Publish now</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors">
          {post ? 'Save changes' : 'Create post'}
        </button>
        <a href="/admin/blog" className="px-6 py-2.5 border border-border text-text-muted hover:text-text rounded-full text-sm transition-colors">Cancel</a>
      </div>
    </form>
  )
}
