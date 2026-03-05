import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const [{ data: videos }, { data: recipes }, { data: posts }, { data: collections }] = await Promise.all([
    supabase.from('videos').select('slug, published_at').not('published_at', 'is', null),
    supabase.from('recipes').select('slug, published_at').not('published_at', 'is', null),
    supabase.from('posts').select('slug, published_at').not('published_at', 'is', null),
    supabase.from('collections').select('slug').not('slug', 'is', null),
  ])

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://youfull.co'

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/videos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/receitas`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/precos`, changeFrequency: 'monthly', priority: 0.7 },
    ...(videos?.map(v => ({
      url: `${base}/videos/${v.slug}`,
      lastModified: v.published_at ? new Date(v.published_at) : undefined,
      priority: 0.7,
    })) ?? []),
    ...(recipes?.map(r => ({
      url: `${base}/receitas/${r.slug}`,
      lastModified: r.published_at ? new Date(r.published_at) : undefined,
      priority: 0.7,
    })) ?? []),
    ...(posts?.map(p => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : undefined,
      priority: 0.6,
    })) ?? []),
    ...(collections?.map(c => ({
      url: `${base}/colecoes/${c.slug}`,
      priority: 0.6,
    })) ?? []),
  ]
}
