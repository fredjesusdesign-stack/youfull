'use client'

import { useEffect, useRef } from 'react'

export default function ParallaxGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = ref.current?.closest('section')
    const handleScroll = () => {
      if (!ref.current || !section) return
      const rect = section.getBoundingClientRect()
      const progress = -rect.top / window.innerHeight
      ref.current.style.transform = `translateY(${progress * 80}px)`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#c8e88c] opacity-50 blur-3xl pointer-events-none will-change-transform"
    />
  )
}
