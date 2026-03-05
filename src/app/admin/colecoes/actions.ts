'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'

export async function createCollection(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const slug = slugify(title, { lower: true, strict: true })

  const { data: collection, error } = await supabase.from('collections').insert({
    title,
    slug,
    description: formData.get('description') || null,
    thumbnail_url: formData.get('thumbnail_url') || null,
    is_premium: formData.getAll('is_premium').includes('true'),
    sort_order: 0,
  }).select().single()

  if (error || !collection) throw new Error(error?.message)

  revalidatePath('/admin/colecoes')
  revalidatePath('/colecoes')
  redirect('/admin/colecoes')
}

export async function updateCollection(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('collections').update({
    title: formData.get('title') as string,
    description: formData.get('description') || null,
    thumbnail_url: formData.get('thumbnail_url') || null,
    is_premium: formData.getAll('is_premium').includes('true'),
  }).eq('id', id)

  revalidatePath('/admin/colecoes')
  revalidatePath('/colecoes')
  redirect('/admin/colecoes')
}

export async function deleteCollection(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('collections').delete().eq('id', formData.get('id') as string)
  revalidatePath('/admin/colecoes')
  revalidatePath('/colecoes')
}

export async function reorderCollections(orderedIds: string[]) {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('collections').update({ sort_order: index }).eq('id', id)
    )
  )
  revalidatePath('/admin/colecoes')
  revalidatePath('/colecoes')
}

export async function addItemToCollection(formData: FormData) {
  const supabase = await createClient()
  const collectionId = formData.get('collection_id') as string
  const contentType = formData.get('content_type') as string
  const contentId = formData.get('content_id') as string

  // Get current max sort_order
  const { data: items } = await supabase
    .from('collection_items')
    .select('sort_order')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (items?.[0]?.sort_order ?? -1) + 1

  await supabase.from('collection_items').insert({
    collection_id: collectionId,
    content_type: contentType,
    content_id: contentId,
    sort_order: nextOrder,
  })

  revalidatePath(`/admin/colecoes/${collectionId}`)
}

export async function removeItemFromCollection(formData: FormData) {
  const supabase = await createClient()
  const itemId = formData.get('item_id') as string
  const collectionId = formData.get('collection_id') as string
  await supabase.from('collection_items').delete().eq('id', itemId)
  revalidatePath(`/admin/colecoes/${collectionId}`)
}
