import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updatePost } from '../actions'
import PostForm from '@/components/admin/PostForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()
  if (!post) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-text mb-6">Editar post</h1>
      <PostForm action={updatePost} post={{
        id: post.id,
        title: post.title,
        content: post.content as Record<string, unknown> | null,
        thumbnail_url: post.thumbnail_url,
        video_url: post.video_url,
        category: post.category,
        tags: post.tags,
        published_at: post.published_at,
      }} />
    </div>
  )
}
