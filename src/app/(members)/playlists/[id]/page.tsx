'use client'
import { useEffect, useState } from 'react'
import { ArrowLeft, Trash2, Play } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { use } from 'react'

interface Video {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  duration_minutes: number | null
  is_premium: boolean
}

interface PlaylistItem {
  video_id: string
  order: number
  videos: Video
}

interface Playlist {
  id: string
  title: string
  description: string | null
  is_public: boolean
  playlist_items: PlaylistItem[]
}

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch(`/api/playlists/${id}`)
    if (res.ok) {
      const data = await res.json()
      setPlaylist(data)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function removeVideo(videoId: string) {
    await fetch(`/api/playlists/${id}/items`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId }),
    })
    load()
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-text-muted">Playlist not found.</p>
        <Link href="/members/playlists" className="text-primary underline mt-4 block">Back to playlists</Link>
      </div>
    )
  }

  const items = playlist.playlist_items ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/members/playlists" className="inline-flex items-center gap-2 text-text-muted hover:text-text text-sm mb-8 transition-colors">
        <ArrowLeft size={16} />
        Playlists

      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text">{playlist.title}</h1>
        {playlist.description && <p className="text-text-muted mt-1">{playlist.description}</p>}
        <p className="text-sm text-text-muted mt-2">{items.length} video{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p>This playlist is empty.</p>
          <Link href="/videos" className="text-primary underline mt-2 block">Explore videos</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items
            .sort((a, b) => a.order - b.order)
            .map((item, index) => {
              const video = item.videos
              return (
                <div key={item.video_id} className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border group">
                  <span className="text-sm text-text-muted w-6 text-right flex-shrink-0">{index + 1}</span>
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-border">
                    {video.thumbnail_url ? (
                      <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={20} className="text-text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/videos/${video.slug}`} className="font-medium text-text hover:text-primary transition-colors line-clamp-1">
                      {video.title}
                    </Link>
                    {video.duration_minutes && (
                      <p className="text-xs text-text-muted mt-0.5">{video.duration_minutes} min</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeVideo(item.video_id)}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
