'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-primary font-medium text-sm">
        Welcome! Check your email to confirm your subscription.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        className="flex-1 px-4 py-3 border border-border rounded-full bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-muted"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white rounded-full text-sm font-medium transition-colors whitespace-nowrap"
      >
        {status === 'loading' ? 'Sending...' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="text-red-500 text-xs mt-1 w-full text-center">Error. Please try again.</p>
      )}
    </form>
  )
}
