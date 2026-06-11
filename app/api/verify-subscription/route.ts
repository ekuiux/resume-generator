import { NextRequest, NextResponse } from 'next/server'
import { Creem } from 'creem'

const creem = new Creem({ apiKey: process.env.CREEM_API_KEY! })

const PRO_PRODUCT_ID = 'prod_64GMyqt8VGNgiaQkRbPpmE'
const ACTIVE_STATUSES = new Set(['active', 'trialing', 'scheduled_cancel'])

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Look up customer by email
    let customer
    try {
      customer = await creem.customers.retrieve(undefined, email.trim().toLowerCase())
    } catch {
      return NextResponse.json({ active: false })
    }

    if (!customer?.id) return NextResponse.json({ active: false })

    // Check their subscriptions
    const result = await creem.customers.listSubscriptions(customer.id, 1, 50)
    const subs = (result as any)?.subscriptions ?? (result as any)?.data ?? []

    const hasActivePro = subs.some(
      (s: any) => s.productId === PRO_PRODUCT_ID && ACTIVE_STATUSES.has(s.status)
    )

    return NextResponse.json({ active: hasActivePro })
  } catch (err) {
    console.error('verify-subscription error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
