import { createClient } from '@/lib/supabase/server'
import ContentCard from '@/components/ui/ContentCard'
import VideoFilterBar from '@/components/VideoFilterBar'
import AISearchBar from '@/components/AISearchBar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vídeos',
  description: 'Aulas de yoga, meditação e movimento para todos os níveis.',
}

interface Props {
  searchParams: Promise<{
    category?: string
    difficulty?: string
    type?: string
    q?: string
  }>
}

const CATEGORIES = ['Yoga', 'Meditação', 'Pilates', 'Respiração', 'Dança', 'Força']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermédio',
  advanced: 'Avançado',
}

export default async function VideosPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('videos')
    .select('id, title, slug, thumbnail_url, category, duration_minutes, difficulty, is_premium')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (params.category) query = query.eq('category', params.category)
  if (params.difficulty) query = query.eq('difficulty', params.difficulty)
  if (params.type === 'free') query = query.eq('is_premium', false)
  if (params.type === 'premium') query = query.eq('is_premium', true)
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: videos } = await query

  const hasFilters = params.category || params.difficulty || params.type || params.q

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Movimento</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text mb-4">Vídeos</h1>
        {/* AI Search */}
        <div className="max-w-xl">
          <AISearchBar />
        </div>
      </div>

      {/* Filter bar */}
      <VideoFilterBar
        categories={CATEGORIES}
        difficulties={DIFFICULTIES}
        difficultyLabels={DIFFICULTY_LABELS}
        activeCategory={params.category}
        activeDifficulty={params.difficulty}
        activeType={params.type}
      />

      {/* Results */}
      <div className="mt-8">
        {videos && videos.length > 0 ? (
          <>
            <p className="text-text-muted text-sm mb-6">
              {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
              {hasFilters ? ' encontrados' : ''}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {videos.map((v) => (
                <ContentCard
                  key={v.id}
                  title={v.title}
                  href={`/videos/${v.slug}`}
                  thumbnailUrl={v.thumbnail_url}
                  category={v.category}
                  isPremium={v.is_premium}
                  meta={[
                    v.duration_minutes ? `${v.duration_minutes} min` : null,
                    v.difficulty ? DIFFICULTY_LABELS[v.difficulty] : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted">Nenhum vídeo encontrado.</p>
            {hasFilters && (
              <a href="/videos" className="text-primary text-sm mt-2 block hover:underline">
                Limpar filtros
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
