import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  if (!query?.trim()) {
    return NextResponse.json({ results: [] })
  }

  // Fallback: if AI keys not configured, do simple text search
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
    return await fallbackTextSearch(query)
  }

  try {
    // Step 1: Enrich query with Claude (wellness context)
    let enrichedQuery = query
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'sk-ant-placeholder') {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `You are a wellness content search assistant for a platform with yoga videos, healthy recipes, and lifestyle blog posts. Expand this search query into rich wellness keywords. Return ONLY the expanded keywords, no explanation, max 100 words.\n\nQuery: ${query}`,
          }],
        })
        const text = msg.content[0].type === 'text' ? msg.content[0].text : query
        enrichedQuery = text
      } catch {
        // Claude failed, use original query
      }
    }

    // Step 2: Generate embedding for enriched query
    const { OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: enrichedQuery.slice(0, 8000),
    })
    const queryEmbedding = embeddingRes.data[0].embedding

    // Step 3: Vector similarity search
    const { data: matches, error } = await supabase.rpc('search_content', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 8,
    })

    if (error) throw error

    if (!matches || matches.length === 0) {
      return await fallbackTextSearch(query)
    }

    // Step 4: Fetch content details for each match
    const results = await enrichMatches(matches)
    return NextResponse.json({ results })

  } catch (err) {
    console.error('[search] Error:', err)
    return await fallbackTextSearch(query)
  }
}

async function enrichMatches(matches: Array<{ content_type: string; content_id: string; similarity: number }>) {
  const videoIds = matches.filter(m => m.content_type === 'video').map(m => m.content_id)
  const recipeIds = matches.filter(m => m.content_type === 'recipe').map(m => m.content_id)
  const postIds = matches.filter(m => m.content_type === 'post').map(m => m.content_id)

  const [videos, recipes, posts] = await Promise.all([
    videoIds.length > 0
      ? supabase.from('videos').select('id, title, slug, thumbnail_url').in('id', videoIds)
      : { data: [] },
    recipeIds.length > 0
      ? supabase.from('recipes').select('id, title, slug, thumbnail_url').in('id', recipeIds)
      : { data: [] },
    postIds.length > 0
      ? supabase.from('posts').select('id, title, slug, thumbnail_url').in('id', postIds)
      : { data: [] },
  ])

  const contentMap = new Map<string, { title: string; slug: string; thumbnail_url?: string | null }>()
  videos.data?.forEach(v => contentMap.set(v.id, v))
  recipes.data?.forEach(r => contentMap.set(r.id, r))
  posts.data?.forEach(p => contentMap.set(p.id, p))

  return matches
    .map(m => {
      const content = contentMap.get(m.content_id)
      if (!content) return null
      return {
        content_type: m.content_type,
        content_id: m.content_id,
        similarity: m.similarity,
        title: content.title,
        slug: content.slug,
        thumbnail_url: content.thumbnail_url,
      }
    })
    .filter(Boolean)
}

async function fallbackTextSearch(query: string) {
  const q = query.trim()
  const [videos, recipes, posts] = await Promise.all([
    supabase.from('videos').select('id, title, slug, thumbnail_url').ilike('title', `%${q}%`).not('published_at', 'is', null).limit(3),
    supabase.from('recipes').select('id, title, slug, thumbnail_url').ilike('title', `%${q}%`).not('published_at', 'is', null).limit(3),
    supabase.from('posts').select('id, title, slug, thumbnail_url').ilike('title', `%${q}%`).not('published_at', 'is', null).limit(2),
  ])

  const results = [
    ...(videos.data?.map(v => ({ content_type: 'video', content_id: v.id, similarity: 0.5, title: v.title, slug: v.slug, thumbnail_url: v.thumbnail_url })) ?? []),
    ...(recipes.data?.map(r => ({ content_type: 'recipe', content_id: r.id, similarity: 0.5, title: r.title, slug: r.slug, thumbnail_url: r.thumbnail_url })) ?? []),
    ...(posts.data?.map(p => ({ content_type: 'post', content_id: p.id, similarity: 0.5, title: p.title, slug: p.slug, thumbnail_url: p.thumbnail_url })) ?? []),
  ]

  return NextResponse.json({ results })
}
