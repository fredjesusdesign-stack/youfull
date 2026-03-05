import Link from 'next/link'
import { register } from '../actions'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export const metadata = { title: 'Create account' }

export default async function RegisterPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="bg-surface rounded-2xl p-8 border border-border">
      <h1 className="text-2xl font-semibold text-text mb-2">Create your account</h1>
      <p className="text-text-muted text-sm mb-6">Start your wellness journey</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={register} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-text mb-1">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="Your name"
          />
        </div>
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
            autoComplete="new-password"
            minLength={8}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="Minimum 8 characters"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-colors"
        >
          Create free account
        </button>
      </form>

      <p className="mt-6 text-center text-text-muted text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in here
        </Link>
      </p>
    </div>
  )
}
