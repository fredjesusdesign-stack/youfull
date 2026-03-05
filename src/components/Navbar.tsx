import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/actions'
import MobileMenu from './MobileMenu'
import NavLinks from './NavLinks'

export default async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm">
      <div className="px-8 h-[68px] relative flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative block" style={{ width: 126, height: 20 }}>
          <Image src="/logo.svg" alt="Youfull" width={126} height={20} priority className="transition-opacity duration-300 group-hover:opacity-0" />
          <Image src="/logo-hover.svg" alt="" width={126} height={20} aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Desktop nav links — absolutely centered in viewport */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <NavLinks />
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
                className="px-5 py-2 bg-[#222523] hover:bg-[#2e3228] text-[#F6F4EE] text-sm rounded-xl transition-colors font-medium"
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
