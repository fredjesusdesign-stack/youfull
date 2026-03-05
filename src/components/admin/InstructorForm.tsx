'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'

interface Instructor { id: string; name: string; bio?: string | null; avatar_url?: string | null; instagram_url?: string | null }
interface Props { action: (formData: FormData) => Promise<void>; instructor?: Instructor }

export default function InstructorForm({ action, instructor }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(instructor?.avatar_url ?? '')
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
      const path = `avatars/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } catch { alert('Error uploading.') }
    finally { setUploading(false) }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors'

  return (
    <form action={action} className="space-y-4">
      {instructor && <input type="hidden" name="id" value={instructor.id} />}
      <input type="hidden" name="avatar_url" value={avatarUrl} />

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Name *</label>
        <input name="name" type="text" required defaultValue={instructor?.name} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Bio</label>
        <textarea name="bio" rows={3} defaultValue={instructor?.bio ?? ''} className={inputClass} placeholder="Brief description..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Profile photo</label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center">
              {uploading ? <Loader2 size={16} className="animate-spin text-text-muted" /> : <Upload size={16} className="text-text-muted" />}
            </div>
          )}
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary hover:underline">
            {avatarUrl ? 'Change photo' : 'Upload'}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Instagram URL</label>
        <input name="instagram_url" type="url" defaultValue={instructor?.instagram_url ?? ''} className={inputClass} placeholder="https://instagram.com/..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors">
          {instructor ? 'Save' : 'Create instructor'}
        </button>
        <a href="/admin/instrutores" className="px-6 py-2.5 border border-border text-text-muted hover:text-text rounded-full text-sm transition-colors">Cancel</a>
      </div>
    </form>
  )
}
