import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  await supabase
    .from('newsletter_subs')
    .upsert({ email, confirmed: true }, { onConflict: 'email', ignoreDuplicates: true })

  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Welcome to Youfull!',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1C1C1A; font-size: 24px; font-weight: 600; margin-bottom: 16px;">
            Welcome to Youfull!
          </h1>
          <p style="color: #8C8C87; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for joining our community. You will receive the best yoga tips, healthy recipes and inspiration for a lighter lifestyle.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://youfull.co'}/videos"
            style="display: inline-block; background: #7C9A6E; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Explore videos
          </a>
        </div>
      `,
    })
  }

  return NextResponse.json({ success: true })
}
