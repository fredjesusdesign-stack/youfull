import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateVideo } from '../actions'
import VideoForm from '@/components/admin/VideoForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: video }, { data: instructors }] = await Promise.all([
    supabase.from('videos').select('*').eq('id', id).single(),
    supabase.from('instructors').select('id, name').order('name'),
  ])

  if (!video) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-text mb-6">Editar vídeo</h1>
      <VideoForm action={updateVideo} video={video} instructors={instructors ?? []} />
    </div>
  )
}
