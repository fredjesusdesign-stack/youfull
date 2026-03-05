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
      className="absolute -right-32 top-1/4 w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full bg-[#c8e88c] opacity-60 blur-3xl pointer-events-none will-change-transform"
    />
  )
}
