import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/actions'
import MobileMenu from './MobileMenu'

const navLinks = [
  { href: '/videos', label: 'Videos' },
  { href: '/receitas', label: 'Recipes' },
  { href: '/blog', label: 'Blog' },
  { href: '/colecoes', label: 'Collections' },
]

export default async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="block">
          <Image src="/logo-mark.svg" alt="Youfull" width={24} height={24} priority />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                My account
              </Link>
              <form action={logout}>
                <button className="text-sm text-text-muted hover:text-text transition-colors">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/precos"
                className="px-5 py-2 bg-[#222523] hover:bg-[#2e3228] text-[#F6F4EE] text-sm rounded-full transition-colors font-medium"
              >
                Tornar-me membro
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <MobileMenu user={!!user} />
      </div>
    </nav>
  )
}
