import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  return (
    <>
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
            sizes="100vw"
          />
          {/* youfull wordmark overlaid at the bottom of the image */}
          <div className="absolute bottom-0 left-0 right-0">
            <Image
              src="/logo-hero.svg"
              alt="youfull"
              width={1440}
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

      {/* ── 3. ABOUT — texto + foto com glow verde ── */}
      <section className="px-8 pb-20 md:pb-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left: text */}
        <div className="space-y-6">
          <p className="text-text text-base md:text-lg leading-relaxed max-w-md">
            It brings together intentional movement, simple rituals, and sustainable habits to support balance, vitality, and a deeper connection with yourself.
          </p>
          <p className="text-text font-medium text-base md:text-lg">
            It is not about doing more.<br />
            It&apos;s about choosing YOU.
          </p>
          <Link href="/blog" className="inline-flex text-sm text-text border-b border-text pb-0.5 hover:opacity-60 transition-opacity">
            More about us
          </Link>
        </div>

        {/* Right: image with green glow */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center justify-end pr-8">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#c8e88c] opacity-60 blur-3xl" />
          </div>
          <div className="relative z-10 w-64 md:w-80">
            <Image
              src="/hero-about.png"
              alt="Yoga meditation"
              width={480}
              height={640}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── 4. VALUES — dark section ── */}
      <section className="bg-[#1e1e1c] px-8 py-16 md:py-24">
        <p className="text-[#6b6b60] text-xs uppercase tracking-widest mb-4">Our approach</p>
        <h2 className="text-[#f6f4ee] text-3xl md:text-4xl font-medium leading-tight mb-12 md:mb-16 max-w-lg">
          A gentle way to take{' '}
          <span className="text-[#a8d070]">care of yourself</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              title: 'Intention',
              desc: 'Choosing each step with more meaning. Choosing depth over speed, presence over performance, and what truly fits you because they support from you to feel.',
            },
            {
              title: 'Connection',
              desc: 'Choosing depth over speed, presence over performance, and what truly fits you because they support you to feel.',
            },
            {
              title: 'Simplicity',
              desc: "Noticing the extraordinary. Of the now. All that surrounds you. So what remains is a purpose, small, and truly that fits the truest.",
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
        <div className="relative h-[400px] md:h-[520px] overflow-hidden">
          <Image
            src="/hero-quote.png"
            alt=""
            fill
            className="object-cover object-top"
            sizes="50vw"
          />
        </div>

        {/* Right: cream + quote */}
        <div className="bg-[#EFEDE6] flex items-center px-8 md:px-16 py-16">
          <p className="text-[#c9c1bc] text-3xl md:text-4xl font-medium leading-snug">
            Your body is not something to fix. It&apos;s something to listen to.
          </p>
        </div>
      </section>
    </>
  )
}
