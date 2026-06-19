import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Creem webhook. Creem signs every event with HMAC-SHA256 of the raw request
// body using your webhook signing secret, sent in the `creem-signature` header.
// We verify that signature before trusting anything — this is the server-side
// source of truth for payments (the client `onComplete` callback can be missed
// or spoofed).
//
// SETUP:
//   1. Creem dashboard → Developers → Webhooks → add endpoint
//      URL:  https://resumetion.com/api/webhook/creem
//   2. Copy the signing secret into env as CREEM_WEBHOOK_SECRET
//
// This handler currently *records* verified payments (console + PostHog) so you
// have a trustworthy payment funnel. To actually gate downloads on it you'll
// need a store (KV/DB) — see the TODO in handleEvent().

export const runtime = 'nodejs'

const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET
const PRO_PRODUCT_ID = 'prod_64GMyqt8VGNgiaQkRbPpmE'
const SINGLE_PRODUCT_ID = 'prod_4uHUOnjg0iut37LzFdoMfs'

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')
  // Constant-time compare; bail if lengths differ (timingSafeEqual throws).
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// Fire-and-forget server-side PostHog capture so verified payments land in the
// same project as the client funnel. No new dependency — raw capture endpoint.
async function capture(event: string, distinctId: string, props: Record<string, unknown>) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  try {
    await fetch('https://eu.i.posthog.com/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId || 'creem-webhook',
        properties: { ...props, $lib: 'creem-webhook' },
      }),
    })
  } catch (err) {
    console.error('[creem-webhook] posthog capture failed:', err)
  }
}

function productLabel(id?: string): string {
  if (id === PRO_PRODUCT_ID) return 'pro'
  if (id === SINGLE_PRODUCT_ID) return 'single'
  return id || 'unknown'
}

async function handleEvent(eventType: string, object: any) {
  // Email + product live in slightly different places across event types; dig
  // them out defensively.
  const email: string =
    object?.customer?.email || object?.customer_email || object?.email || ''
  const productId: string =
    object?.product?.id || object?.product_id || object?.order?.product || object?.productId || ''
  const plan = productLabel(productId)

  switch (eventType) {
    case 'checkout.completed':
    case 'subscription.active':
    case 'subscription.paid': {
      console.log(`[creem-webhook] PAID ${eventType} plan=${plan} email=${email}`)
      await capture('payment_verified', email, { plan, eventType, productId })
      // TODO (gating): persist { email, plan, active:true, ts } to a KV/DB here,
      // then have the download route check it instead of localStorage.pro_unlocked.
      break
    }
    case 'subscription.canceled':
    case 'subscription.expired': {
      console.log(`[creem-webhook] ENDED ${eventType} email=${email}`)
      await capture('subscription_ended', email, { plan, eventType })
      // TODO (gating): mark { email, active:false } in the store.
      break
    }
    case 'refund.created':
    case 'dispute.created': {
      console.log(`[creem-webhook] ${eventType.toUpperCase()} email=${email}`)
      await capture('payment_reversed', email, { plan, eventType })
      break
    }
    default:
      console.log(`[creem-webhook] unhandled event: ${eventType}`)
  }
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error('[creem-webhook] CREEM_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('creem-signature')

  if (!verifySignature(rawBody, signature)) {
    console.warn('[creem-webhook] invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Creem payload shape: { id, eventType, object: {...} }
  const eventType: string = payload?.eventType || payload?.type || 'unknown'
  try {
    await handleEvent(eventType, payload?.object ?? payload?.data ?? {})
  } catch (err) {
    console.error('[creem-webhook] handler error:', err)
    // Still 200 so Creem doesn't hammer retries on a logging hiccup; the
    // signature already proved authenticity.
  }

  return NextResponse.json({ received: true })
}
