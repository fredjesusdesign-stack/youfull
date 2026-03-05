'use client'

export default function WaveAnimation() {
  return (
    <div className="w-full overflow-hidden mb-8">
      <style>{`
        @keyframes wave-flow {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          width: '200%',
          animation: 'wave-flow 8s linear infinite',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/wave.svg" alt="" style={{ width: '50%' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/wave.svg" alt="" style={{ width: '50%' }} />
      </div>
    </div>
  )
}
