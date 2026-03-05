import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Lock } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coleções',
  description: 'Coleções de conteúdo curado para o teu bem-estar.',
}

export default async function ColecoesPage() {
  const supabase = await createClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('id, title, slug, description, thumbnail_url, is_premium')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-8 md:mb-12">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Curado</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text">Coleções</h1>
      </div>

      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link key={col.id} href={`/colecoes/${col.slug}`} className="group block">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface mb-3">
                {col.thumbnail_url ? (
                  <Image
                    src={col.thumbnail_url}
                    alt={col.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                {col.is_premium && (
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 bg-text/80 backdrop-blur-sm text-background text-xs px-2 py-1 rounded-full">
                      <Lock size={9} /> Premium
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-text group-hover:text-primary transition-colors mb-1">
                {col.title}
              </h3>
              {col.description && (
                <p className="text-text-muted text-sm line-clamp-2">{col.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-muted">Nenhuma coleção disponível ainda.</p>
        </div>
      )}
    </div>
  )
}
