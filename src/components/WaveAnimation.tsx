'use client'

export default function WaveAnimation() {
  return (
    <div className="w-full overflow-hidden mb-8">
      <svg
        viewBox="0 0 800 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '200%', animation: 'wave-flow 8s linear infinite' }}
      >
        <style>{`
          @keyframes wave-flow {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <path
          d="M0 12 C66 4, 133 20, 200 12 C266 4, 333 20, 400 12 C466 4, 533 20, 600 12 C666 4, 733 20, 800 12"
          stroke="#c9c1bc"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
