'use client'
import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'

interface BookmarkButtonProps {
  contentType: 'video' | 'recipe' | 'post'
  contentId: string
  initialBookmarked?: boolean
}

export default function BookmarkButton({ contentType, contentId, initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const method = bookmarked ? 'DELETE' : 'POST'
    const res = await fetch('/api/bookmarks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_type: contentType, content_id: contentId }),
    })
    if (res.status !== 401) {
      setBookmarked(!bookmarked)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      className={`p-2 rounded-full transition-colors ${
        bookmarked
          ? 'text-primary bg-primary/10 hover:bg-primary/20'
          : 'text-text-muted hover:text-primary hover:bg-primary/10'
      }`}
    >
      <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
    </button>
  )
}
