import { createClient } from '@/lib/supabase/server'
import ContentCard from '@/components/ui/ContentCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Inspiration, tips and articles on wellness, yoga and healthy eating.',
}

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

const CATEGORIES = ['Yoga', 'Nutrition', 'Wellness', 'Meditation', 'Recipes', 'Lifestyle']

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('id, title, slug, thumbnail_url, category, published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (params.category) query = query.eq('category', params.category)
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: posts } = await query

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Inspiration</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text">Blog</h1>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/blog"
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !params.category
              ? 'bg-primary text-white border-primary'
              : 'bg-background text-text-muted border-border hover:border-primary hover:text-primary'
          }`}
        >
          All
        </a>
        {CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={`/blog?category=${encodeURIComponent(cat)}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              params.category === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-background text-text-muted border-border hover:border-primary hover:text-primary'
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <ContentCard
              key={post.id}
              title={post.title}
              href={`/blog/${post.slug}`}
              thumbnailUrl={post.thumbnail_url}
              category={post.category}
              meta={
                post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : null
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-muted">No articles found.</p>
          {params.category && (
            <a href="/blog" className="text-primary text-sm mt-2 block hover:underline">
              See all
            </a>
          )}
        </div>
      )}
    </div>
  )
}
