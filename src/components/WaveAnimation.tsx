'use client'

import { useEffect, useRef } from 'react'

export default function WaveAnimation() {
  const path1Ref = useRef<SVGPathElement>(null)
  const path2Ref = useRef<SVGPathElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const p1 = path1Ref.current
    const p2 = path2Ref.current
    if (!p1 || !p2) return

    // Both paths reveal left→right: dashoffset starts at full length, animates to 0
    const len1 = p1.getTotalLength()
    const len2 = p2.getTotalLength()

    p1.style.strokeDasharray = `${len1}`
    p1.style.strokeDashoffset = `${len1}`
    p2.style.strokeDasharray = `${len2}`
    p2.style.strokeDashoffset = `${len2}`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        // Path 1 — immediate
        p1.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)'
        p1.style.strokeDashoffset = '0'

        // Path 2 (lighter) — delayed 600ms
        setTimeout(() => {
          p2.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)'
          p2.style.strokeDashoffset = '0'
        }, 600)

        observer.disconnect()
      },
      { threshold: 0.4 }
    )

    if (wrapperRef.current) observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className="w-full mb-10">
      <svg
        width="100%"
        viewBox="0 0 705 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ height: 62 }}
      >
        {/* Path 1 — solid, left→right */}
        <path
          ref={path1Ref}
          d="M2.71011e-06 31L64.6183 31C80.1944 31 95.6753 28.5734 110.504 23.8075L136.973 15.3005C166.822 5.70731 199.471 11.2325 224.502 30.1127C250.101 49.4221 283.627 54.7357 313.942 44.2882L318.509 42.7143C340.481 35.1421 364.404 35.4606 386.167 43.6151C415.402 54.5694 448.075 51.2391 474.499 34.6118L481.571 30.1611C511.841 11.1133 549.168 6.97727 582.873 18.9361L593.975 22.8751C609.13 28.2522 625.093 31 641.173 31L705 31"
          stroke="#222523"
          strokeWidth="3"
        />
        {/* Path 2 — 20% opacity, delayed */}
        <path
          ref={path2Ref}
          opacity="0.2"
          d="M705 31L640.21 31C624.748 31 609.38 33.4088 594.66 38.1399L568.168 46.6541C538.263 56.2653 505.546 50.5967 480.618 31.4851C454.991 11.8381 421.187 6.4321 390.712 17.1071L386.507 18.5799C364.546 26.2723 340.572 25.9491 318.826 17.6674C289.645 6.55378 256.924 9.92167 230.618 26.7464L223.269 31.4464C193.128 50.7238 155.774 55.002 122.056 43.0386L110.867 39.0689C95.8164 33.7289 79.9638 31 63.9938 31L2.71781e-06 31"
          stroke="#222523"
          strokeWidth="3"
        />
      </svg>
    </div>
  )
}
