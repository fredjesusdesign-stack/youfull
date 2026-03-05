import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { deleteVideo } from './actions'
import { Pencil, Plus } from 'lucide-react'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminVideosPage() {
  const supabase = await createClient()
  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, thumbnail_url, category, is_premium, published_at, duration_minutes, created_at, instructors(name)')
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
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Instructor</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Duration</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {videos?.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {v.thumbnail_url ? (
                        <div className="relative w-14 h-9 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={v.thumbnail_url} alt={v.title} fill className="object-cover" sizes="56px" />
                        </div>
                      ) : (
                        <div className="w-14 h-9 rounded-lg bg-border flex-shrink-0" />
                      )}
                      <span className="text-text font-medium line-clamp-2">{v.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">
                    {(v.instructors as unknown as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{v.category ?? '—'}</td>
                  <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">
                    {v.duration_minutes ? `${v.duration_minutes} min` : '—'}
                  </td>
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
                      <DeleteButton action={deleteVideo} id={v.id} confirmMessage="Delete this video?" />
                    </div>
                  </td>
                </tr>
              ))}
              {(!videos || videos.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
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
