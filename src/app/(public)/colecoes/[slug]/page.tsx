import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ContentCard from '@/components/ui/ContentCard'
import PremiumLock from '@/components/ui/PremiumLock'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('collections')
    .select('title, description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Coleção não encontrada' }
  return { title: data.title, description: data.description ?? undefined }
}

export default async function ColecaoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*, collection_items(id, content_type, content_id, sort_order)')
    .eq('slug', slug)
    .single()

  if (!collection) notFound()

  // Check premium access
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let hasAccess = !collection.is_premium
  if (collection.is_premium && user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()
    hasAccess = sub?.status === 'active'
  }

  // Fetch each item's content
  const items =
    collection.collection_items?.sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ) ?? []

  const contentItems = await Promise.all(
    items.map(
      async (item: { id: string; content_type: string; content_id: string; sort_order: number }) => {
        if (item.content_type === 'video') {
          const { data } = await supabase
            .from('videos')
            .select('id, title, slug, thumbnail_url, category, duration_minutes, is_premium')
            .eq('id', item.content_id)
            .single()
          return data ? { ...data, type: 'video', href: `/videos/${data.slug}` } : null
        } else if (item.content_type === 'recipe') {
          const { data } = await supabase
            .from('recipes')
            .select('id, title, slug, thumbnail_url, category, prep_time, is_premium')
            .eq('id', item.content_id)
            .single()
          return data ? { ...data, type: 'recipe', href: `/receitas/${data.slug}` } : null
        } else if (item.content_type === 'post') {
          const { data } = await supabase
            .from('posts')
            .select('id, title, slug, thumbnail_url, category')
            .eq('id', item.content_id)
            .single()
          return data
            ? { ...data, type: 'post', href: `/blog/${data.slug}`, is_premium: false }
            : null
        }
        return null
      }
    )
  )

  const validItems = contentItems.filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
      <Link
        href="/colecoes"
        className="inline-flex items-center gap-1 text-text-muted hover:text-text text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Coleções
      </Link>

      <div className="mb-8">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Coleção</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text mb-3">{collection.title}</h1>
        {collection.description && (
          <p className="text-text-muted max-w-2xl leading-relaxed">{collection.description}</p>
        )}
      </div>

      {collection.is_premium && !hasAccess ? (
        <PremiumLock message="Esta coleção é exclusiva para membros premium." />
      ) : validItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {validItems.map((item) => {
            if (!item) return null
            const typedItem = item as {
              id: string
              title: string
              href: string
              thumbnail_url?: string | null
              category?: string | null
              is_premium?: boolean
              duration_minutes?: number | null
              prep_time?: number | null
            }
            return (
              <ContentCard
                key={typedItem.id}
                title={typedItem.title}
                href={typedItem.href}
                thumbnailUrl={typedItem.thumbnail_url}
                category={typedItem.category}
                isPremium={typedItem.is_premium}
                meta={
                  typedItem.duration_minutes
                    ? `${typedItem.duration_minutes} min`
                    : typedItem.prep_time
                      ? `${typedItem.prep_time} min prep`
                      : null
                }
              />
            )
          })}
        </div>
      ) : (
        <p className="text-text-muted">Esta coleção está vazia.</p>
      )}
    </div>
  )
}
