import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: videoCount }, { count: recipeCount }, { count: postCount }, { count: userCount }] =
    await Promise.all([
      supabase.from('videos').select('*', { count: 'exact', head: true }),
      supabase.from('recipes').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

  const stats = [
    { label: 'Videos', count: videoCount ?? 0, href: '/admin/videos' },
    { label: 'Recipes', count: recipeCount ?? 0, href: '/admin/receitas' },
    { label: 'Posts', count: postCount ?? 0, href: '/admin/blog' },
    { label: 'Users', count: userCount ?? 0, href: '/admin/utilizadores' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-surface border border-border rounded-2xl p-5 hover:border-primary transition-colors"
          >
            <p className="text-3xl font-light text-text mb-1">{s.count}</p>
            <p className="text-sm text-text-muted">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/videos/novo" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
          + Video
        </Link>
        <Link href="/admin/receitas/novo" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
          + Recipe
        </Link>
        <Link href="/admin/blog/novo" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
          + Post
        </Link>
      </div>
    </div>
  )
}
