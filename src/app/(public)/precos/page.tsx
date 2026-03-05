import { Metadata } from 'next'
import { Check } from 'lucide-react'
import { createCheckoutSession } from '@/lib/stripe/actions'

export const metadata: Metadata = {
  title: 'Plans',
  description: 'Choose the right plan for your lifestyle.',
}

export default function PrecosPage() {
  const features = [
    'Access to all premium videos',
    'Exclusive recipes every week',
    'Curated themed collections',
    'New yoga and meditation classes',
    'Cancel anytime',
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-20">
      <div className="text-center mb-12 md:mb-16">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Membership</p>
        <h1 className="text-3xl md:text-5xl font-light text-text mb-4 leading-tight">
          Invest in your wellness
        </h1>
        <p className="text-text-muted max-w-md mx-auto leading-relaxed">
          Unlimited access to yoga, healthy recipes and inspiration. Cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
        {/* Monthly */}
        <div className="border border-border rounded-2xl p-8 bg-background">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Monthly</p>
          <div className="mb-6">
            <span className="text-4xl font-light text-text">€15</span>
            <span className="text-text-muted">/month</span>
          </div>
          <form action={createCheckoutSession}>
            <input type="hidden" name="priceId" value={process.env.STRIPE_MONTHLY_PRICE_ID} />
            <button
              type="submit"
              className="block w-full py-3 text-center border border-primary text-primary hover:bg-primary hover:text-white rounded-full font-medium transition-colors text-sm mb-6"
            >
              Get started
            </button>
          </form>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Annual */}
        <div className="border-2 border-primary rounded-2xl p-8 bg-primary/5 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
              Best value
            </span>
          </div>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Annual</p>
          <div className="mb-1">
            <span className="text-4xl font-light text-text">€150</span>
            <span className="text-text-muted">/year</span>
          </div>
          <p className="text-primary text-xs font-medium mb-6">Save ~17% · equivalent to €12.50/month</p>
          <form action={createCheckoutSession}>
            <input type="hidden" name="priceId" value={process.env.STRIPE_ANNUAL_PRICE_ID} />
            <button
              type="submit"
              className="block w-full py-3 text-center bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-colors text-sm mb-6"
            >
              Get started
            </button>
          </form>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-text-muted text-sm">
        Secure payment via Stripe · Apple Pay · MB Way · Card
      </p>
    </div>
  )
}
