'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'

export async function createRecipe(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const slug = slugify(title, { lower: true, strict: true })

  const { data: recipe, error } = await supabase.from('recipes').insert({
    title,
    slug,
    description: formData.get('description') || null,
    thumbnail_url: formData.get('thumbnail_url') || null,
    video_url: formData.get('video_url') || null,
    prep_time: formData.get('prep_time') ? Number(formData.get('prep_time')) : null,
    cook_time: formData.get('cook_time') ? Number(formData.get('cook_time')) : null,
    servings: formData.get('servings') ? Number(formData.get('servings')) : null,
    difficulty: formData.get('difficulty') || null,
    category: formData.get('category') || null,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean) : [],
    is_premium: formData.getAll('is_premium').includes('true'),
    instructor_id: formData.get('instructor_id') || null,
    published_at: formData.getAll('publish').includes('true') ? new Date().toISOString() : null,
  }).select().single()

  if (error || !recipe) throw new Error(error?.message || 'Failed to create recipe')

  // Insert ingredients
  const ingredientNames = formData.getAll('ingredient_name') as string[]
  const ingredientQtys = formData.getAll('ingredient_qty') as string[]
  const ingredientUnits = formData.getAll('ingredient_unit') as string[]

  const ingredients = ingredientNames
    .map((name, i) => ({ name: name.trim(), quantity: ingredientQtys[i]?.trim() || null, unit: ingredientUnits[i]?.trim() || null, sort_order: i, recipe_id: recipe.id }))
    .filter(ing => ing.name)

  if (ingredients.length > 0) {
    await supabase.from('ingredients').insert(ingredients)
  }

  // Insert steps
  const stepDescs = formData.getAll('step_description') as string[]
  const steps = stepDescs
    .map((desc, i) => ({ description: desc.trim(), step_number: i + 1, recipe_id: recipe.id }))
    .filter(s => s.description)

  if (steps.length > 0) {
    await supabase.from('recipe_steps').insert(steps)
  }

  // Insert nutrition
  const calories = formData.get('calories')
  if (calories) {
    await supabase.from('nutrition').insert({
      recipe_id: recipe.id,
      calories: Number(calories) || null,
      protein_g: formData.get('protein_g') ? Number(formData.get('protein_g')) : null,
      carbs_g: formData.get('carbs_g') ? Number(formData.get('carbs_g')) : null,
      fat_g: formData.get('fat_g') ? Number(formData.get('fat_g')) : null,
      fiber_g: formData.get('fiber_g') ? Number(formData.get('fiber_g')) : null,
    })
  }

  revalidatePath('/admin/receitas')
  revalidatePath('/receitas')
  redirect('/admin/receitas')
}

export async function updateRecipe(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('recipes').update({
    title: formData.get('title') as string,
    description: formData.get('description') || null,
    thumbnail_url: formData.get('thumbnail_url') || null,
    video_url: formData.get('video_url') || null,
    prep_time: formData.get('prep_time') ? Number(formData.get('prep_time')) : null,
    cook_time: formData.get('cook_time') ? Number(formData.get('cook_time')) : null,
    servings: formData.get('servings') ? Number(formData.get('servings')) : null,
    difficulty: formData.get('difficulty') || null,
    category: formData.get('category') || null,
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean) : [],
    is_premium: formData.getAll('is_premium').includes('true'),
    instructor_id: formData.get('instructor_id') || null,
    published_at: formData.getAll('publish').includes('true') ? new Date().toISOString() : null,
  }).eq('id', id)

  // Replace ingredients (delete + reinsert)
  await supabase.from('ingredients').delete().eq('recipe_id', id)
  const ingredientNames = formData.getAll('ingredient_name') as string[]
  const ingredientQtys = formData.getAll('ingredient_qty') as string[]
  const ingredientUnits = formData.getAll('ingredient_unit') as string[]
  const ingredients = ingredientNames
    .map((name, i) => ({ name: name.trim(), quantity: ingredientQtys[i]?.trim() || null, unit: ingredientUnits[i]?.trim() || null, sort_order: i, recipe_id: id }))
    .filter(ing => ing.name)
  if (ingredients.length > 0) await supabase.from('ingredients').insert(ingredients)

  // Replace steps
  await supabase.from('recipe_steps').delete().eq('recipe_id', id)
  const stepDescs = formData.getAll('step_description') as string[]
  const steps = stepDescs
    .map((desc, i) => ({ description: desc.trim(), step_number: i + 1, recipe_id: id }))
    .filter(s => s.description)
  if (steps.length > 0) await supabase.from('recipe_steps').insert(steps)

  // Upsert nutrition
  const calories = formData.get('calories')
  if (calories) {
    await supabase.from('nutrition').upsert({
      recipe_id: id,
      calories: Number(calories) || null,
      protein_g: formData.get('protein_g') ? Number(formData.get('protein_g')) : null,
      carbs_g: formData.get('carbs_g') ? Number(formData.get('carbs_g')) : null,
      fat_g: formData.get('fat_g') ? Number(formData.get('fat_g')) : null,
      fiber_g: formData.get('fiber_g') ? Number(formData.get('fiber_g')) : null,
    }, { onConflict: 'recipe_id' })
  }

  revalidatePath('/admin/receitas')
  revalidatePath('/receitas')
  redirect('/admin/receitas')
}

export async function deleteRecipe(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('recipes').delete().eq('id', id)
  revalidatePath('/admin/receitas')
  revalidatePath('/receitas')
}
