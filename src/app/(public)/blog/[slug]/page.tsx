import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('title, thumbnail_url')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Article not found' }

  return {
    title: data.title,
    openGraph: {
      title: data.title,
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single()

  if (!post) notFound()

  // Render Tiptap JSON to HTML, or fallback to empty
  let contentHtml = ''
  if (post.content) {
    try {
      contentHtml = generateHTML(post.content, [StarterKit])
    } catch {
      contentHtml = '<p>Content not available.</p>'
    }
  }

  // Video embed
  let embedSrc: string | null = null
  if (post.video_url) {
    if (post.video_url.includes('youtube') || post.video_url.includes('youtu.be')) {
      const match = post.video_url.match(/(?:v=|youtu\.be\/|embed\/)([^&?\s]+)/)
      if (match?.[1]) embedSrc = `https://www.youtube.com/embed/${match[1]}?rel=0`
    } else if (post.video_url.includes('vimeo')) {
      const match = post.video_url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
      if (match?.[1]) embedSrc = `https://player.vimeo.com/video/${match[1]}?byline=0`
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-text-muted hover:text-text text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Blog
      </Link>

      {/* Category */}
      {post.category && (
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">{post.category}</p>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-semibold text-text mb-4 leading-tight">
        {post.title}
      </h1>

      {/* Date */}
      {post.published_at && (
        <p className="text-text-muted text-sm mb-8">
          {new Date(post.published_at).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}

      {/* Cover image */}
      {post.thumbnail_url && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* Video */}
      {embedSrc && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8">
          <iframe
            src={embedSrc}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
          />
        </div>
      )}

      {/* Content */}
      {contentHtml && (
        <div
          className="prose prose-sm md:prose-base max-w-none prose-headings:text-text prose-p:text-text-muted prose-a:text-primary prose-strong:text-text"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}
    </div>
  )
}
