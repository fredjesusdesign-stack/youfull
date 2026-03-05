'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/videos', label: 'Videos' },
  { href: '/receitas', label: 'Recipes' },
  { href: '/blog', label: 'Blog' },
  { href: '/colecoes', label: 'Collections' },
]

export default function MobileMenu({ user }: { user: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-text-muted hover:text-text transition-colors"
        aria-label="Menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-text-muted hover:text-text transition-colors text-sm border-b border-border last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm text-text-muted hover:text-text"
                >
                  My account
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="py-3 text-center text-sm border border-border rounded-full text-text hover:bg-surface transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/precos"
                    onClick={() => setOpen(false)}
                    className="py-3 text-center text-sm bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-colors"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
