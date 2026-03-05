import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createPortalSession } from '@/lib/stripe/actions'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
  ])

  const isPremium = sub?.status === 'active'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl font-semibold text-text mb-2">
        Olá, {profile?.full_name?.split(' ')[0] || 'bem-vindo'}
      </h1>
      <p className="text-text-muted mb-8">A tua área pessoal Youfull.</p>

      {/* Subscription card */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Plano atual</p>
            <div className="flex items-center gap-2">
              {isPremium && <CheckCircle2 size={16} className="text-primary" />}
              <p className="font-semibold text-text">{isPremium ? 'Premium' : 'Gratuito'}</p>
            </div>
          </div>
          {!isPremium && (
            <Link href="/precos" className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
              Subscrever
            </Link>
          )}
        </div>

        {sub?.current_period_end && isPremium && (
          <p className="text-text-muted text-sm">
            Renova a{' '}
            {new Date(sub.current_period_end).toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {sub?.stripe_customer_id && (
          <div className="mt-4 pt-4 border-t border-border">
            <form action={createPortalSession}>
              <button className="text-sm text-primary hover:underline">
                Gerir subscrição →
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { href: '/videos', label: 'Vídeos' },
          { href: '/receitas', label: 'Receitas' },
          { href: '/members/playlists', label: 'As minhas playlists' },
          { href: '/blog', label: 'Blog' },
        ].map(link => (
          <Link key={link.href} href={link.href}
            className="p-4 bg-surface border border-border rounded-xl hover:border-primary transition-colors text-sm font-medium text-text">
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}
