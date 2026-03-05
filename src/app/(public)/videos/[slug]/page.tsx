import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PremiumLock from '@/components/ui/PremiumLock'
import Link from 'next/link'
import { Clock, BarChart2, ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?\s]+)/)
  return match?.[1] ?? null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('videos')
    .select('title, description, thumbnail_url')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Vídeo não encontrado' }

  return {
    title: data.title,
    description: data.description ?? undefined,
    openGraph: {
      title: data.title,
      description: data.description ?? undefined,
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
  }
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermédio',
  advanced: 'Avançado',
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: video } = await supabase
    .from('videos')
    .select('*, instructors(id, name, slug, avatar_url)')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single()

  if (!video) notFound()

  // Check access
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasAccess = !video.is_premium
  if (video.is_premium && user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()
    hasAccess = sub?.status === 'active'
  }

  // Determine embed URL
  const videoUrl = hasAccess
    ? video.vimeo_url || video.youtube_url
    : video.youtube_url // free preview from YouTube

  const isYouTube = videoUrl?.includes('youtube') || videoUrl?.includes('youtu.be')
  const isVimeo = videoUrl?.includes('vimeo')

  let embedSrc: string | null = null
  if (videoUrl) {
    if (isYouTube) {
      const id = extractYouTubeId(videoUrl)
      if (id) embedSrc = `https://www.youtube.com/embed/${id}?rel=0`
    } else if (isVimeo) {
      const id = extractVimeoId(videoUrl)
      if (id) embedSrc = `https://player.vimeo.com/video/${id}?byline=0&portrait=0`
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instructor = Array.isArray(video.instructors) ? (video.instructors as any[])[0] : video.instructors

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      {/* Back */}
      <Link
        href="/videos"
        className="inline-flex items-center gap-1 text-text-muted hover:text-text text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Todos os vídeos
      </Link>

      {/* Category + Title */}
      {video.category && (
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">{video.category}</p>
      )}
      <h1 className="text-2xl md:text-4xl font-semibold text-text mb-4 leading-tight">
        {video.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-6">
        {video.duration_minutes && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {video.duration_minutes} min
          </span>
        )}
        {video.difficulty && (
          <span className="flex items-center gap-1">
            <BarChart2 size={14} />
            {DIFFICULTY_LABELS[video.difficulty] ?? video.difficulty}
          </span>
        )}
        {video.is_premium && (
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
            Premium
          </span>
        )}
      </div>

      {/* Video player or premium lock */}
      {embedSrc ? (
        <div className="aspect-video rounded-2xl overflow-hidden bg-text mb-8 shadow-sm">
          <iframe
            src={embedSrc}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
      ) : video.is_premium && !hasAccess ? (
        <div className="mb-8">
          <PremiumLock message="Este vídeo é exclusivo para membros premium. Subscreve para ter acesso ilimitado." />
        </div>
      ) : null}

      {/* Description */}
      {video.description && (
        <p className="text-text-muted leading-relaxed mb-8">{video.description}</p>
      )}

      {/* Instructor */}
      {instructor && (
        <div className="border-t border-border pt-6">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Instrutor</p>
          <Link
            href={`/instrutores/${instructor.slug}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit"
          >
            {instructor.avatar_url && (
              <img
                src={instructor.avatar_url}
                alt={instructor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <span className="font-medium text-text text-sm">{instructor.name}</span>
          </Link>
        </div>
      )}
    </div>
  )
}
