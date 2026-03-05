'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, ListVideo } from 'lucide-react'
import Link from 'next/link'

interface PlaylistItem {
  video_id: string
  videos: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    duration_minutes: number | null
    is_premium: boolean
  }
}

interface Playlist {
  id: string
  title: string
  description: string | null
  is_public: boolean
  created_at: string
  playlist_items?: PlaylistItem[]
  playlist_items_count?: number
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  async function load() {
    const res = await fetch('/api/playlists')
    const data = await res.json()
    setPlaylists(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createPlaylist(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() || null, is_public: isPublic }),
    })
    setNewTitle('')
    setNewDesc('')
    setIsPublic(false)
    setCreating(false)
    load()
  }

  async function deletePlaylist(id: string) {
    if (!confirm('Delete this playlist?')) return
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-surface rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-text">My playlists</h1>
        <button
          onClick={() => setCreating(!creating)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors"
        >
          <Plus size={16} />
          New playlist
        </button>
      </div>

      {creating && (
        <form onSubmit={createPlaylist} className="mb-8 p-6 bg-surface rounded-2xl border border-border space-y-4">
          <h2 className="font-medium text-text">New playlist</h2>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Playlist name"
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded" />
            Public playlist
          </label>
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
              Create
            </button>
            <button type="button" onClick={() => setCreating(false)} className="px-5 py-2 border border-border rounded-full text-sm text-text-muted hover:text-text transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <ListVideo size={48} className="mx-auto text-border mb-4" />
          <p className="text-text-muted">You don&apos;t have any playlists yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {playlists.map(playlist => (
            <div key={playlist.id} className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-colors">
              <div>
                <p className="font-medium text-text">{playlist.title}</p>
                {playlist.description && <p className="text-sm text-text-muted mt-0.5">{playlist.description}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">
                    {(playlist.playlist_items as unknown as { count: number }[] | undefined)?.[0]?.count ?? 0} videos
                  </span>
                  {playlist.is_public && (
                    <span className="text-xs text-primary">Public</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/members/playlists/${playlist.id}`}
                  className="px-4 py-2 text-sm border border-border rounded-full text-text-muted hover:text-text hover:border-primary/50 transition-colors"
                >
                  View
                </Link>
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="p-2 text-text-muted hover:text-red-500 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
