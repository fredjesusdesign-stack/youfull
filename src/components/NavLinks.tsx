'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/videos', label: 'Videos' },
  { href: '/receitas', label: 'Recipes' },
  { href: '/blog', label: 'Blog' },
  { href: '/colecoes', label: 'Collections' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex items-center gap-1">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative px-3 py-2"
          >
            <span className={`text-[15px] font-medium transition-colors ${isActive ? 'text-[#2e3238]' : 'text-[#6b706a] hover:text-[#2e3238]'}`}>
              {link.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#5d7f42]" />
            )}
          </Link>
        )
      })}
    </div>
  )
}
