import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateRecipe } from '../actions'
import RecipeForm from '@/components/admin/RecipeForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditReceitaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: recipe }, { data: instructors }, { data: ingredients }, { data: steps }, { data: nutrition }] =
    await Promise.all([
      supabase.from('recipes').select('*').eq('id', id).single(),
      supabase.from('instructors').select('id, name').order('name'),
      supabase.from('ingredients').select('name, quantity, unit').eq('recipe_id', id).order('sort_order'),
      supabase.from('recipe_steps').select('description').eq('recipe_id', id).order('step_number'),
      supabase.from('nutrition').select('*').eq('recipe_id', id).single(),
    ])

  if (!recipe) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-text mb-6">Editar receita</h1>
      <RecipeForm
        action={updateRecipe}
        recipe={recipe}
        instructors={instructors ?? []}
        initialIngredients={ingredients?.map(i => ({ name: i.name, quantity: i.quantity ?? '', unit: i.unit ?? '' })) ?? []}
        initialSteps={steps?.map(s => ({ description: s.description })) ?? []}
        initialNutrition={nutrition}
      />
    </div>
  )
}
