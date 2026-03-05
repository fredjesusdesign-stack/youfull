'use client'

export default function WaveAnimation() {
  return (
    <div className="w-full overflow-hidden mb-10 opacity-30">
      <svg
        viewBox="0 0 800 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '200%', animation: 'wave-flow 6s linear infinite' }}
      >
        <style>{`
          @keyframes wave-flow {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        {/* path doubled so the loop is seamless */}
        <path
          d="M0 25 C40 8, 80 42, 120 25 C160 8, 200 42, 240 25 C280 8, 320 42, 360 25 C400 8, 440 42, 480 25 C520 8, 560 42, 600 25 C640 8, 680 42, 720 25 C760 8, 800 42, 800 25"
          stroke="#030201"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
