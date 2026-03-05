import Link from 'next/link'
import { login } from '../actions'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export const metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="bg-surface rounded-2xl p-8 border border-border">
      <h1 className="text-2xl font-semibold text-text mb-2">Welcome back</h1>
      <p className="text-text-muted text-sm mb-6">Sign in to your Youfull account</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={login} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-colors"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-text-muted text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/registo" className="text-primary hover:underline font-medium">
          Sign up for free
        </Link>
      </p>
    </div>
  )
}
