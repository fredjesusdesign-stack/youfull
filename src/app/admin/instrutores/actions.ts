'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'

const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createInstructor(formData: FormData) {
  const name = formData.get('name') as string
  const { error } = await supabase.from('instructors').insert({
    name,
    slug: slugify(name, { lower: true, strict: true }),
    bio: formData.get('bio') || null,
    avatar_url: formData.get('avatar_url') || null,
    instagram_url: formData.get('instagram_url') || null,
  })
  if (error) { console.error('[createInstructor]', error); throw new Error(error.message) }
  revalidatePath('/admin/instrutores')
  redirect('/admin/instrutores')
}

export async function updateInstructor(formData: FormData) {
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
  await supabase.from('instructors').delete().eq('id', formData.get('id') as string)
  revalidatePath('/admin/instrutores')
}
