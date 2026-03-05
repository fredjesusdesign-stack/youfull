'use client'

import { useState } from 'react'
import TiptapEditor from './TiptapEditor'
import ImageCropUpload from './ImageCropUpload'

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
  const [content, setContent] = useState<Record<string, unknown>>(
    (post?.content as Record<string, unknown>) ?? { type: 'doc', content: [{ type: 'paragraph' }] }
  )

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
        <ImageCropUpload
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          bucket="thumbnails"
        />
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
