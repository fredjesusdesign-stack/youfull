import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deletePost } from './actions'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, category, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text">Blog</h1>
        <Link href="/admin/blog/novo" className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
          <Plus size={14} /> New post
        </Link>
      </div>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Title</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts?.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3 text-text font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{p.category ?? '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs ${p.published_at ? 'text-green-600' : 'text-text-muted'}`}>
                      {p.published_at ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/blog/${p.id}`} className="p-1.5 text-text-muted hover:text-text transition-colors"><Pencil size={14} /></Link>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="p-1.5 text-text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!posts || posts.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No posts yet. <Link href="/admin/blog/novo" className="text-primary hover:underline">Create the first post</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
