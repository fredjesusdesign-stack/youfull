import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateInstructor } from '../actions'
import InstructorForm from '@/components/admin/InstructorForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditInstrutorPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: instructor } = await supabase.from('instructors').select('*').eq('id', id).single()
  if (!instructor) notFound()
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-text mb-6">Editar instrutor</h1>
      <InstructorForm action={updateInstructor} instructor={instructor} />
    </div>
  )
}
