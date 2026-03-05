import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'

interface ContentCardProps {
  title: string
  href: string
  thumbnailUrl?: string | null
  category?: string | null
  isPremium?: boolean
  meta?: string | null
}

export default function ContentCard({
  title,
  href,
  thumbnailUrl,
  category,
  isPremium,
  meta,
}: ContentCardProps) {
  return (
    <Link href={href} className="group block">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface mb-3">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-border" />
          </div>
        )}
        {isPremium && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 bg-text/80 backdrop-blur-sm text-background text-xs px-2 py-1 rounded-full">
              <Lock size={9} />
              Premium
            </span>
          </div>
        )}
      </div>

      {/* Category */}
      {category && (
        <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{category}</p>
      )}

      {/* Title */}
      <h3 className="font-medium text-text group-hover:text-primary transition-colors line-clamp-2 text-sm md:text-base">
        {title}
      </h3>

      {/* Meta */}
      {meta && <p className="text-xs text-text-muted mt-1">{meta}</p>}
    </Link>
  )
}
