import { createClient } from '@/lib/supabase/server'
import ContentCard from '@/components/ui/ContentCard'
import AISearchBar from '@/components/AISearchBar'
import RecipeFilterBar from '@/components/RecipeFilterBar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Healthy, delicious and easy recipes for your lifestyle.',
}

interface Props {
  searchParams: Promise<{
    category?: string
    difficulty?: string
    type?: string
    q?: string
  }>
}

const CATEGORIES = ['Pequeno-almoço', 'Almoço', 'Jantar', 'Snack', 'Sobremesa', 'Smoothie']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'Hard',
}

export default async function ReceitasPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('recipes')
    .select('id, title, slug, thumbnail_url, category, prep_time, cook_time, difficulty, is_premium')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (params.category) query = query.eq('category', params.category)
  if (params.difficulty) query = query.eq('difficulty', params.difficulty)
  if (params.type === 'free') query = query.eq('is_premium', false)
  if (params.type === 'premium') query = query.eq('is_premium', true)
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: recipes } = await query

  const hasFilters = params.category || params.difficulty || params.type || params.q

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Nutrition</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text mb-4">Recipes</h1>
        <div className="max-w-xl">
          <AISearchBar />
        </div>
      </div>

      {/* Filters */}
      <RecipeFilterBar
        categories={CATEGORIES}
        difficulties={DIFFICULTIES}
        difficultyLabels={DIFFICULTY_LABELS}
        activeCategory={params.category}
        activeDifficulty={params.difficulty}
        activeType={params.type}
      />

      {/* Results */}
      <div className="mt-8">
        {recipes && recipes.length > 0 ? (
          <>
            <p className="text-text-muted text-sm mb-6">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
              {hasFilters ? ' found' : ''}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recipes.map((r) => {
                const totalTime = (r.prep_time ?? 0) + (r.cook_time ?? 0)
                return (
                  <ContentCard
                    key={r.id}
                    title={r.title}
                    href={`/receitas/${r.slug}`}
                    thumbnailUrl={r.thumbnail_url}
                    category={r.category}
                    isPremium={r.is_premium}
                    meta={[
                      totalTime ? `${totalTime} min` : null,
                      r.difficulty ? DIFFICULTY_LABELS[r.difficulty] : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted">No recipes found.</p>
            {hasFilters && (
              <a href="/receitas" className="text-primary text-sm mt-2 block hover:underline">
                Clear filters
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
