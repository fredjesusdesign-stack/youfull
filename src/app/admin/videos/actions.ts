'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { generateEmbedding } from '@/lib/ai/embeddings'

export async function createVideo(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const slug = slugify(title, { lower: true, strict: true })

  const { data: video, error } = await supabase.from('videos').insert({
    title,
    slug,
    description: formData.get('description') || null,
    youtube_url: formData.get('youtube_url') || null,
    vimeo_url: formData.get('vimeo_url') || null,
    thumbnail_url: formData.get('thumbnail_url') || null,
    duration_minutes: formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null,
    difficulty: formData.get('difficulty') || null,
    category: formData.get('category') || null,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean) : [],
    is_premium: formData.getAll('is_premium').includes('true'),
    instructor_id: formData.get('instructor_id') || null,
    published_at: formData.getAll('publish').includes('true') ? new Date().toISOString() : null,
  }).select().single()

  if (error || !video) throw new Error(error?.message || 'Failed to create video')

  // Generate embedding for AI search (fire-and-forget)
  generateEmbedding('video', video.id, `${title} ${formData.get('description') ?? ''}`).catch(console.error)

  revalidatePath('/admin/videos')
  revalidatePath('/videos')
  redirect('/admin/videos')
}

export async function updateVideo(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('videos').update({
    title: formData.get('title') as string,
    description: formData.get('description') || null,
    youtube_url: formData.get('youtube_url') || null,
    vimeo_url: formData.get('vimeo_url') || null,
    thumbnail_url: formData.get('thumbnail_url') || null,
    duration_minutes: formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null,
    difficulty: formData.get('difficulty') || null,
    category: formData.get('category') || null,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean) : [],
    is_premium: formData.getAll('is_premium').includes('true'),
    instructor_id: formData.get('instructor_id') || null,
    published_at: formData.getAll('publish').includes('true') ? new Date().toISOString() : null,
  }).eq('id', id)

  if (error) throw new Error(error.message)

  // Generate embedding for AI search (fire-and-forget)
  generateEmbedding('video', id, `${formData.get('title') as string} ${formData.get('description') ?? ''}`).catch(console.error)

  revalidatePath('/admin/videos')
  revalidatePath('/videos')
  redirect('/admin/videos')
}

export async function deleteVideo(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('videos').delete().eq('id', id)
  revalidatePath('/admin/videos')
  revalidatePath('/videos')
}
