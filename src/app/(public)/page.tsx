import Image from 'next/image'
import Link from 'next/link'
import ParallaxGlow from '@/components/ParallaxGlow'

export default async function HomePage() {
  return (
    <div className="max-w-[1408px] mx-auto">

      {/* ── 1. HERO — full bleed image + wordmark overlay ── */}
      <section className="relative pt-[68px] overflow-hidden">
        <div className="relative w-full h-[480px] md:h-[680px]">
          <Image
            src="/hero.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            style={{ objectPosition: '50% 35%' }}
            sizes="1408px"
          />
          {/* youfull wordmark overlaid at the bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <Image
              src="/logo-hero.svg"
              alt="youfull"
              width={1408}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* ── 2. TAGLINE ── */}
      <section className="px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <p className="text-[#030201] text-3xl md:text-5xl font-medium leading-tight max-w-3xl">
          Youfull is a holistic wellness platform designed to help users achieve balance, vitality, and mindfulness.
        </p>
      </section>

      {/* ── 3. ABOUT — text left + image right ── */}
      <section className="relative pb-20 md:pb-32 overflow-hidden grid md:grid-cols-2 items-center">
        {/* Left: text with padding */}
        <div className="px-8 space-y-6 py-8 md:py-0">
          <p className="text-text text-base md:text-lg leading-relaxed max-w-sm">
            It brings together intentional movement, simple rituals, and sustainable habits to support balance, vitality, and a deeper connection with yourself.
          </p>
          <p className="text-text font-medium text-base md:text-lg">
            It is not about doing more.<br />
            It&apos;s about choosing YOU.
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-text border border-border rounded-full px-4 py-2 hover:bg-surface transition-colors">
            More about us
          </Link>
        </div>

        {/* Right: image fills the column + parallax glow behind */}
        <div className="relative flex justify-end items-end h-[480px] md:h-[600px]">
          <ParallaxGlow />
          <Image
            src="/hero-about.png"
            alt="Yoga meditation"
            fill
            className="object-contain object-bottom relative z-10"
            sizes="(max-width: 768px) 100vw, 704px"
          />
        </div>
      </section>

      {/* ── 4. VALUES — dark section ── */}
      <section className="bg-[#1e1e1c] px-8 py-16 md:py-24">
        <p className="text-[#6b6b60] text-xs uppercase tracking-widest mb-6">Core values</p>
        <h2 className="text-[#f6f4ee] text-3xl md:text-4xl font-medium leading-tight mb-16 md:mb-24 max-w-lg">
          A gentle way to take<br />
          <span className="text-[#a8d070]">care of yourself</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              title: 'Intention',
              desc: "It's about doing less, with more meaning. Choosing depth over speed, presence over performance. Intention means choosing practices, rhythms, and habits with care. Not because you should, but because they support how you want to feel.",
            },
            {
              title: 'Connection',
              desc: "It's about doing less, with more meaning. Choosing depth over speed, presence over performance. Intention means choosing practices, rhythms, and habits with care. Not because you should, but because they support how you want to feel.",
            },
            {
              title: 'Simplicity',
              desc: "Removing the unnecessary, all the noise, the pressure, the overload, so what remains feels supportive, doable, and real. Choosing practices and habits that fit into real life, and allowing perfection to fall away.",
            },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="text-[#f6f4ee] font-medium mb-3">{v.title}</h3>
              <p className="text-[#6b6b60] text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. QUOTE — two panels ── */}
      <section className="grid md:grid-cols-2">
        {/* Left: b&w photo */}
        <div className="relative h-[400px] md:h-[560px] overflow-hidden">
          <Image
            src="/hero-quote.png"
            alt=""
            fill
            className="object-cover object-top"
            sizes="704px"
          />
        </div>

        {/* Right: cream + wave SVG + quote */}
        <div className="bg-[#EFEDE6] flex flex-col justify-end px-8 md:px-12 pb-12 pt-8">
          {/* Wave SVG */}
          <svg viewBox="0 0 400 60" className="w-full mb-10 opacity-40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30 C50 10, 100 50, 150 30 S250 10, 300 30 S380 50, 400 30" stroke="#030201" strokeWidth="1.5" fill="none"/>
          </svg>
          <p className="text-[#030201] text-2xl md:text-3xl font-medium leading-snug">
            Your body is not something to fix. It&apos;s something to listen to.
          </p>
        </div>
      </section>

    </div>
  )
}
