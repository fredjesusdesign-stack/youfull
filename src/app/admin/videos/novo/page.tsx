import { createClient } from '@/lib/supabase/server'
import { createVideo } from '../actions'
import VideoForm from '@/components/admin/VideoForm'

export default async function NovoVideoPage() {
  const supabase = await createClient()
  const { data: instructors } = await supabase
    .from('instructors')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-text mb-6">New video</h1>
      <VideoForm action={createVideo} instructors={instructors ?? []} />
    </div>
  )
}
