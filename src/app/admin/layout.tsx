import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import AdminMobileNav from '@/components/admin/AdminMobileNav'

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/videos', label: 'Videos' },
  { href: '/admin/receitas', label: 'Recipes' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/colecoes', label: 'Collections' },
  { href: '/admin/instrutores', label: 'Instructors' },
  { href: '/admin/utilizadores', label: 'Users' },
  { href: '/admin/newsletter', label: 'Newsletter' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-surface border-r border-border z-40">
        <div className="p-6 border-b border-border">
          <Link href="/" className="text-lg font-semibold text-text">
            Youfull
          </Link>
          <p className="text-xs text-text-muted mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-background transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-muted truncate mb-2">{profile?.full_name || user.email}</p>
          <form action={logout}>
            <button className="text-xs text-text-muted hover:text-text transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-border fixed top-0 left-0 right-0 z-40">
        <Link href="/" className="font-semibold text-text">Youfull Admin</Link>
        <AdminMobileNav navItems={navItems} />
      </div>

      {/* Main content */}
      <main className="md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
