import Link from 'next/link'
import { Lock } from 'lucide-react'

interface PremiumLockProps {
  message?: string
}

export default function PremiumLock({
  message = 'This content is available for premium members.',
}: PremiumLockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
        <Lock className="text-primary" size={24} />
      </div>
      <h2 className="text-xl font-semibold text-text mb-2">Premium Content</h2>
      <p className="text-text-muted mb-6 max-w-sm text-sm leading-relaxed">{message}</p>
      <Link
        href="/precos"
        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-colors text-sm"
      >
        View plans
      </Link>
    </div>
  )
}
