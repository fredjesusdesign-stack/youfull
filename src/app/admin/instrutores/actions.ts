'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'

export async function createInstructor(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  await supabase.from('instructors').insert({
    name,
    slug: slugify(name, { lower: true, strict: true }),
    bio: formData.get('bio') || null,
    avatar_url: formData.get('avatar_url') || null,
    instagram_url: formData.get('instagram_url') || null,
  })
  revalidatePath('/admin/instrutores')
  redirect('/admin/instrutores')
}

export async function updateInstructor(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('instructors').update({
    name: formData.get('name') as string,
    bio: formData.get('bio') || null,
    avatar_url: formData.get('avatar_url') || null,
    instagram_url: formData.get('instagram_url') || null,
  }).eq('id', formData.get('id') as string)
  revalidatePath('/admin/instrutores')
  redirect('/admin/instrutores')
}

export async function deleteInstructor(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('instructors').delete().eq('id', formData.get('id') as string)
  revalidatePath('/admin/instrutores')
}
