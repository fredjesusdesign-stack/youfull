import { createPost } from '../actions'
import PostForm from '@/components/admin/PostForm'

export default function NovoBlogPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-text mb-6">Novo post</h1>
      <PostForm action={createPost} />
    </div>
  )
}
