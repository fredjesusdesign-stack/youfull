import { createClient } from '@/lib/supabase/server'
import { createRecipe } from '../actions'
import RecipeForm from '@/components/admin/RecipeForm'

export default async function NovaReceitaPage() {
  const supabase = await createClient()
  const { data: instructors } = await supabase.from('instructors').select('id, name').order('name')
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-text mb-6">Nova receita</h1>
      <RecipeForm action={createRecipe} instructors={instructors ?? []} />
    </div>
  )
}
