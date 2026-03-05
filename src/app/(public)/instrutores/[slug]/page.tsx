import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ContentCard from '@/components/ui/ContentCard'
import { Instagram } from 'lucide-react'
import Image from 'next/image'
import { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('instructors').select('name, bio').eq('slug', slug).single()
  return { title: data?.name, description: data?.bio ?? undefined }
}

export default async function InstrutorPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: instructor } = await supabase
    .from('instructors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!instructor) notFound()

  const [{ data: videos }, { data: recipes }] = await Promise.all([
    supabase.from('videos').select('id, title, slug, thumbnail_url, category, duration_minutes, is_premium')
      .eq('instructor_id', instructor.id).not('published_at', 'is', null).order('published_at', { ascending: false }).limit(8),
    supabase.from('recipes').select('id, title, slug, thumbnail_url, category, prep_time, is_premium')
      .eq('instructor_id', instructor.id).not('published_at', 'is', null).order('published_at', { ascending: false }).limit(8),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
        {instructor.avatar_url && (
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0">
            <Image src={instructor.avatar_url} alt={instructor.name} fill className="object-cover" sizes="128px" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-text mb-2">{instructor.name}</h1>
          {instructor.bio && <p className="text-text-muted leading-relaxed max-w-xl">{instructor.bio}</p>}
          {instructor.instagram_url && (
            <a href={instructor.instagram_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary text-sm mt-3 hover:underline">
              <Instagram size={14} /> Instagram
            </a>
          )}
        </div>
      </div>

      {/* Videos */}
      {videos && videos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text mb-6">Videos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {videos.map(v => (
              <ContentCard key={v.id} title={v.title} href={`/videos/${v.slug}`}
                thumbnailUrl={v.thumbnail_url} category={v.category} isPremium={v.is_premium}
                meta={v.duration_minutes ? `${v.duration_minutes} min` : null} />
            ))}
          </div>
        </section>
      )}

      {/* Recipes */}
      {recipes && recipes.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-text mb-6">Recipes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recipes.map(r => (
              <ContentCard key={r.id} title={r.title} href={`/receitas/${r.slug}`}
                thumbnailUrl={r.thumbnail_url} category={r.category} isPremium={r.is_premium}
                meta={r.prep_time ? `${r.prep_time} min` : null} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
