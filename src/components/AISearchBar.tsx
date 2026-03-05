'use client'

import { useState, useRef } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  content_type: string
  content_id: string
  similarity: number
  title?: string
  slug?: string
  thumbnail_url?: string
}

export default function AISearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function clear() {
    setQuery('')
    setResults([])
    setSearched(false)
    inputRef.current?.focus()
  }

  const hrefFor = (r: SearchResult) => {
    const prefix =
      r.content_type === 'video' ? 'videos' : r.content_type === 'recipe' ? 'receitas' : 'blog'
    return `/${prefix}/${r.slug}`
  }

  const labelFor = (type: string) =>
    type === 'video' ? 'Vídeo' : type === 'recipe' ? 'Receita' : 'Blog'

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary transition-shadow">
        <Search size={16} className="text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ex: yoga para relaxar, receita rápida, respiração..."
          className="flex-1 bg-transparent text-text placeholder-text-muted focus:outline-none text-sm"
        />
        {query && (
          <button onClick={clear} className="text-text-muted hover:text-text transition-colors">
            <X size={14} />
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="flex-shrink-0 px-3 py-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs rounded-full transition-colors font-medium"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : 'Pesquisar'}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="mt-3">
          {loading ? (
            <div className="flex items-center gap-2 text-text-muted text-sm p-2">
              <Loader2 size={14} className="animate-spin" />
              A pesquisar...
            </div>
          ) : results.length > 0 ? (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <p className="text-xs text-text-muted px-4 pt-3 pb-2 border-b border-border">
                {results.length} resultados para &quot;{query}&quot;
              </p>
              {results.map((r) => (
                <Link
                  key={r.content_id}
                  href={hrefFor(r)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors border-b border-border last:border-0"
                >
                  <span className="text-xs text-text-muted bg-border px-2 py-0.5 rounded-full flex-shrink-0">
                    {labelFor(r.content_type)}
                  </span>
                  <span className="text-sm text-text truncate">{r.title || r.content_id}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm p-2">
              Nenhum resultado para &quot;{query}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  )
}
