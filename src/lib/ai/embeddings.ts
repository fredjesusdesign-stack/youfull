import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateEmbedding(
  contentType: 'video' | 'recipe' | 'post',
  contentId: string,
  text: string
): Promise<void> {
  // Skip if OpenAI key not configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
    console.log(`[embeddings] Skipping embedding for ${contentType}:${contentId} — OPENAI_API_KEY not set`)
    return
  }

  try {
    const { OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    })

    const embedding = response.data[0].embedding

    await supabase.from('content_embeddings').upsert({
      content_type: contentType,
      content_id: contentId,
      embedding,
    }, { onConflict: 'content_type,content_id' })

    console.log(`[embeddings] Generated embedding for ${contentType}:${contentId}`)
  } catch (err) {
    console.error(`[embeddings] Failed for ${contentType}:${contentId}:`, err)
  }
}
