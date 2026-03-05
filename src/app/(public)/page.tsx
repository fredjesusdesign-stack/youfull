import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ContentCard from '@/components/ui/ContentCard'
import NewsletterForm from '@/components/NewsletterForm'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: videos }, { data: recipes }, { data: posts }] = await Promise.all([
    supabase
      .from('videos')
      .select('id, title, slug, thumbnail_url, category, duration_minutes, is_premium')
      .eq('is_premium', false)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(4),
    supabase
      .from('recipes')
      .select('id, title, slug, thumbnail_url, category, prep_time, is_premium')
      .eq('is_premium', false)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(4),
    supabase
      .from('posts')
      .select('id, title, slug, thumbnail_url, category')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(3),
  ])

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center bg-surface overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-primary/5 pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-primary text-xs md:text-sm tracking-[0.2em] uppercase mb-4 md:mb-6 font-medium">
            Bem-vindo à Youfull
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-light text-text leading-[1.1] mb-4 md:mb-6 tracking-tight">
            Viver melhor,
            <br />
            <span className="text-primary">com mais leveza</span>
          </h1>
          <p className="text-text-muted text-base md:text-xl mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed">
            Yoga, receitas saudáveis e inspiração para o teu estilo de vida.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/precos"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-full text-sm md:text-base font-medium transition-colors"
            >
              Começar agora
            </Link>
            <Link
              href="/videos"
              className="w-full sm:w-auto px-8 py-4 border border-border hover:bg-surface text-text rounded-full text-sm md:text-base transition-colors"
            >
              Explorar vídeos
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-muted">
          <div className="w-px h-8 bg-border animate-pulse" />
        </div>
      </section>

      {/* Values strip */}
      <section className="bg-background border-y border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '🧘', title: 'Yoga & Movimento', desc: 'Aulas para todos os níveis' },
              { icon: '🥗', title: 'Receitas Saudáveis', desc: 'Simples, nutritivas e saborosas' },
              { icon: '✨', title: 'Estilo de Vida', desc: 'Dicas e inspiração diária' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{item.icon}</span>
                <p className="font-medium text-text text-sm">{item.title}</p>
                <p className="text-text-muted text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      {videos && videos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Movimento</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-text">Vídeos em destaque</h2>
            </div>
            <Link
              href="/videos"
              className="hidden sm:flex items-center gap-1 text-primary hover:gap-2 transition-all text-sm font-medium"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {videos.map((v) => (
              <ContentCard
                key={v.id}
                title={v.title}
                href={`/videos/${v.slug}`}
                thumbnailUrl={v.thumbnail_url}
                category={v.category}
                isPremium={v.is_premium}
                meta={v.duration_minutes ? `${v.duration_minutes} min` : null}
              />
            ))}
          </div>
          <div className="mt-6 sm:hidden text-center">
            <Link href="/videos" className="text-primary text-sm font-medium">
              Ver todos os vídeos →
            </Link>
          </div>
        </section>
      )}

      {/* Featured Recipes */}
      {recipes && recipes.length > 0 && (
        <section className="bg-surface py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Nutrição</p>
                <h2 className="text-2xl md:text-3xl font-semibold text-text">Receitas da semana</h2>
              </div>
              <Link
                href="/receitas"
                className="hidden sm:flex items-center gap-1 text-primary hover:gap-2 transition-all text-sm font-medium"
              >
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recipes.map((r) => (
                <ContentCard
                  key={r.id}
                  title={r.title}
                  href={`/receitas/${r.slug}`}
                  thumbnailUrl={r.thumbnail_url}
                  category={r.category}
                  isPremium={r.is_premium}
                  meta={r.prep_time ? `${r.prep_time} min` : null}
                />
              ))}
            </div>
            <div className="mt-6 sm:hidden text-center">
              <Link href="/receitas" className="text-primary text-sm font-medium">
                Ver todas as receitas →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blog section */}
      {posts && posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Inspiração</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-text">Do nosso blog</h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-1 text-primary hover:gap-2 transition-all text-sm font-medium"
            >
              Ver tudo <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {posts.map((p) => (
              <ContentCard
                key={p.id}
                title={p.title}
                href={`/blog/${p.slug}`}
                thumbnailUrl={p.thumbnail_url}
                category={p.category}
              />
            ))}
          </div>
        </section>
      )}

      {/* Premium CTA */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
          <p className="text-primary text-xs tracking-widest uppercase mb-3">Membership</p>
          <h2 className="text-3xl md:text-4xl font-light text-text mb-4 leading-tight">
            Acesso ilimitado a todo o conteúdo
          </h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto leading-relaxed">
            Vídeos premium, receitas exclusivas e novas aulas todas as semanas. Cancela quando quiseres.
          </p>
          <Link
            href="/precos"
            className="inline-flex px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-colors"
          >
            Ver planos
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-xl mx-auto px-4 py-16 md:py-24 text-center">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Newsletter</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-text mb-2">
          Fica inspirado todas as semanas
        </h2>
        <p className="text-text-muted mb-8 text-sm leading-relaxed">
          Receitas, vídeos e dicas de bem-estar diretamente no teu email.
        </p>
        <NewsletterForm />
      </section>
    </>
  )
}
