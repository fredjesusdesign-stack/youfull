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
      <section className="pt-16 overflow-hidden">
        {/* Large youfull wordmark */}
        <div className="px-8 pt-16 md:pt-24">
          <Image
            src="/logo-hero.svg"
            alt="youfull"
            width={1376}
            height={282}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Hero photo */}
        <div className="px-8 mt-4 md:mt-6">
          <div className="relative w-full h-[400px] md:h-[640px] overflow-hidden">
            <Image
              src="/hero.jpg"
              alt="Yoga"
              fill
              className="object-cover object-top"
              priority
              sizes="(max-width: 768px) 100vw, 95vw"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="px-8 mt-12 md:mt-16 pb-20 md:pb-28">
          <p className="text-[#030201] text-3xl md:text-5xl font-medium leading-tight max-w-2xl">
            Youfull é uma plataforma de bem-estar holístico para te ajudar a alcançar equilíbrio, vitalidade e mindfulness.
          </p>
        </div>
      </section>

      {/* Featured Videos */}
      {videos && videos.length > 0 && (
        <section className="px-4 md:px-8 max-w-[1440px] mx-auto py-16 md:py-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Movimento</p>
              <h2 className="text-2xl md:text-3xl font-medium text-text">Vídeos em destaque</h2>
            </div>
            <Link
              href="/videos"
              className="hidden sm:flex items-center gap-1 text-text hover:gap-2 transition-all text-sm"
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
            <Link href="/videos" className="text-text text-sm">
              Ver todos os vídeos →
            </Link>
          </div>
        </section>
      )}

      {/* Featured Recipes */}
      {recipes && recipes.length > 0 && (
        <section className="bg-surface py-16 md:py-24">
          <div className="px-4 md:px-8 max-w-[1440px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Nutrição</p>
                <h2 className="text-2xl md:text-3xl font-medium text-text">Receitas da semana</h2>
              </div>
              <Link
                href="/receitas"
                className="hidden sm:flex items-center gap-1 text-text hover:gap-2 transition-all text-sm"
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
              <Link href="/receitas" className="text-text text-sm">
                Ver todas as receitas →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blog section */}
      {posts && posts.length > 0 && (
        <section className="px-4 md:px-8 max-w-[1440px] mx-auto py-16 md:py-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Inspiração</p>
              <h2 className="text-2xl md:text-3xl font-medium text-text">Do nosso blog</h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-1 text-text hover:gap-2 transition-all text-sm"
            >
              Ver todos <ArrowRight size={14} />
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
      <section className="bg-[#222523] text-[#F6F4EE]">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <p className="text-[#c9c1bc] text-xs tracking-widest uppercase mb-3">Membership</p>
          <h2 className="text-3xl md:text-4xl font-medium mb-4 leading-tight">
            Acesso ilimitado a todo o conteúdo
          </h2>
          <p className="text-[#c9c1bc] mb-8 max-w-md mx-auto leading-relaxed">
            Vídeos premium, receitas exclusivas e novas aulas todas as semanas. Cancela quando quiseres.
          </p>
          <Link
            href="/precos"
            className="inline-flex px-8 py-4 bg-[#F6F4EE] hover:bg-white text-[#222523] rounded-full font-medium transition-colors"
          >
            Ver planos
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-xl mx-auto px-4 py-16 md:py-24 text-center">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Newsletter</p>
        <h2 className="text-2xl md:text-3xl font-medium text-text mb-2">
          Inspira-te todas as semanas
        </h2>
        <p className="text-text-muted mb-8 text-sm leading-relaxed">
          Receitas, vídeos e dicas de bem-estar na tua caixa de entrada.
        </p>
        <NewsletterForm />
      </section>
    </>
  )
}
