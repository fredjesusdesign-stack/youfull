'use client'

import { useState } from 'react'
import ImageCropUpload from './ImageCropUpload'

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

const CATEGORIES = ['Yoga', 'Meditation', 'Pilates', 'Barre', 'Other']

export default function VideoForm({ action, video, instructors }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail_url ?? '')

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
        <ImageCropUpload
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          bucket="thumbnails"
        />
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
