import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyPaddleSignature(body: string, signature: string, secret: string): boolean {
  const parts = signature.split(';')
  const tsPart = parts.find(p => p.startsWith('ts='))
  const h1Part = parts.find(p => p.startsWith('h1='))
  if (!tsPart || !h1Part) return false
  const ts = tsPart.split('=')[1]
  const h1 = h1Part.split('=')[1]
  const signed = `${ts}:${body}`
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1))
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('paddle-signature') ?? ''
  const secret = process.env.PADDLE_WEBHOOK_SECRET ?? ''

  if (!verifyPaddleSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  console.log('[paddle webhook]', event.event_type)

  // transaction.completed = one-time purchase paid
  // subscription.created  = weekly subscription started
  // Handle fulfillment here if needed (e.g. store in DB)

  return NextResponse.json({ received: true })
}
