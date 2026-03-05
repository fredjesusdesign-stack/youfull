'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  categories: string[]
  difficulties: string[]
  difficultyLabels: Record<string, string>
  activeCategory?: string
  activeDifficulty?: string
  activeType?: string
}

export default function RecipeFilterBar({
  categories,
  difficulties,
  difficultyLabels,
  activeCategory,
  activeDifficulty,
  activeType,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
      active
        ? 'bg-primary text-white border-primary'
        : 'bg-background text-text-muted border-border hover:border-primary hover:text-primary'
    }`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => updateParam('type', null)} className={chipClass(!activeType)}>
          All
        </button>
        <button
          onClick={() => updateParam('type', activeType === 'free' ? null : 'free')}
          className={chipClass(activeType === 'free')}
        >
          Free
        </button>
        <button
          onClick={() => updateParam('type', activeType === 'premium' ? null : 'premium')}
          className={chipClass(activeType === 'premium')}
        >
          Premium
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => updateParam('category', activeCategory === cat ? null : cat)}
            className={chipClass(activeCategory === cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => updateParam('difficulty', activeDifficulty === diff ? null : diff)}
            className={chipClass(activeDifficulty === diff)}
          >
            {difficultyLabels[diff]}
          </button>
        ))}
      </div>
    </div>
  )
}
