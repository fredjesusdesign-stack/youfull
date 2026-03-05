'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { generateEmbedding } from '@/lib/ai/embeddings'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const slug = slugify(title, { lower: true, strict: true })
  const contentStr = formData.get('content') as string
  const content = contentStr ? JSON.parse(contentStr) : null

  const { data: post } = await supabase.from('posts').insert({
    title,
    slug,
    content,
    thumbnail_url: formData.get('thumbnail_url') || null,
    video_url: formData.get('video_url') || null,
    category: formData.get('category') || null,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean) : [],
    published_at: formData.getAll('publish').includes('true') ? new Date().toISOString() : null,
  }).select().single()

  // Generate embedding for AI search (fire-and-forget)
  if (post) generateEmbedding('post', post.id, `${title}`).catch(console.error)

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
}

export async function updatePost(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const contentStr = formData.get('content') as string
  const content = contentStr ? JSON.parse(contentStr) : null

  await supabase.from('posts').update({
    title: formData.get('title') as string,
    content,
    thumbnail_url: formData.get('thumbnail_url') || null,
    video_url: formData.get('video_url') || null,
    category: formData.get('category') || null,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean) : [],
    published_at: formData.getAll('publish').includes('true') ? new Date().toISOString() : null,
  }).eq('id', id)

  // Generate embedding for AI search (fire-and-forget)
  generateEmbedding('post', id, `${formData.get('title') as string}`).catch(console.error)

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('posts').delete().eq('id', formData.get('id') as string)
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
}
