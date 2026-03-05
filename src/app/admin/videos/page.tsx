import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteVideo } from './actions'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default async function AdminVideosPage() {
  const supabase = await createClient()
  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, category, is_premium, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text">Videos</h1>
        <Link
          href="/admin/videos/novo"
          className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors"
        >
          <Plus size={14} />
          New video
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Title</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {videos?.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3 text-text font-medium">{v.title}</td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{v.category ?? '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.is_premium ? 'bg-primary/10 text-primary' : 'bg-green-50 text-green-700'}`}>
                      {v.is_premium ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs ${v.published_at ? 'text-green-600' : 'text-text-muted'}`}>
                      {v.published_at ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/videos/${v.id}`} className="p-1.5 text-text-muted hover:text-text transition-colors">
                        <Pencil size={14} />
                      </Link>
                      <form action={deleteVideo}>
                        <input type="hidden" name="id" value={v.id} />
                        <button
                          type="submit"
                          className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            if (!confirm('Delete this video?')) e.preventDefault()
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!videos || videos.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No videos yet.{' '}
                    <Link href="/admin/videos/novo" className="text-primary hover:underline">
                      Add the first video
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
