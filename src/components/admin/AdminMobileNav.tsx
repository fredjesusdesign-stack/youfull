'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  exact?: boolean
}

export default function AdminMobileNav({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 text-text-muted">
        <Menu size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex items-center justify-between px-4 h-14 border-b border-border">
            <span className="font-semibold text-text">Menu</span>
            <button onClick={() => setOpen(false)} className="p-2 text-text-muted">
              <X size={20} />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
