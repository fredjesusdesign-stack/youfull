import type { Config } from 'tailwindcss'
// eslint-disable-next-line @typescript-eslint/no-require-imports
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        surface: '#F4F4F0',
        primary: {
          DEFAULT: '#7C9A6E',
          dark: '#5A7A52',
        },
        text: {
          DEFAULT: '#1C1C1A',
          muted: '#8C8C87',
        },
        border: '#E8E8E4',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
}

export default config
