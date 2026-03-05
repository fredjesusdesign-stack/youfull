'use server'

import { stripe } from './client'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function getBaseUrl() {
  const h = await headers()
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

export async function createCheckoutSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const priceId = formData.get('priceId') as string

  // Check if user already has a Stripe customer ID
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    customer: existingSub?.stripe_customer_id ?? undefined,
    customer_email: existingSub?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${await getBaseUrl()}/dashboard?success=true`,
    cancel_url: `${await getBaseUrl()}/precos`,
    metadata: { user_id: user.id },
    payment_method_types: ['card'],
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { user_id: user.id },
    },
  })

  if (!session.url) throw new Error('Failed to create checkout session')
  redirect(session.url)
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.stripe_customer_id) redirect('/precos')

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${await getBaseUrl()}/dashboard`,
  })

  redirect(session.url)
}
