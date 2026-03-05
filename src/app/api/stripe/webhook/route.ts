import { stripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Use service role for webhook — bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.user_id
        if (!userId) break

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const periodEnd = subscription.items.data[0]?.current_period_end

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan: subscription.items.data[0]?.price.id,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        await supabase
          .from('profiles')
          .update({ role: 'premium' })
          .eq('id', userId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id
        const periodEnd = subscription.items.data[0]?.current_period_end

        if (!userId) {
          // Try to find user by subscription ID
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
          if (!sub) break

          await supabase.from('subscriptions').update({
            status: subscription.status,
            plan: subscription.items.data[0]?.price.id,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subscription.id)

          if (subscription.status !== 'active') {
            await supabase.from('profiles').update({ role: 'free' }).eq('id', sub.user_id)
          } else {
            await supabase.from('profiles').update({ role: 'premium' }).eq('id', sub.user_id)
          }
          break
        }

        await supabase.from('subscriptions').update({
          status: subscription.status,
          plan: subscription.items.data[0]?.price.id,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)

        if (subscription.status !== 'active') {
          await supabase.from('profiles').update({ role: 'free' }).eq('id', userId)
        } else {
          await supabase.from('profiles').update({ role: 'premium' }).eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (!sub) break

        await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)

        await supabase.from('profiles').update({ role: 'free' }).eq('id', sub.user_id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subId = (invoice as any).subscription as string
        if (!subId) break

        await supabase.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subId)
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
