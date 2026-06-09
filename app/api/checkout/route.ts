import { NextRequest, NextResponse } from 'next/server'

const CREEM_API_KEY = process.env.CREEM_API_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const { productId, plan } = await req.json()

    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${SITE_URL}/?payment_success=1&plan=${plan}`,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Creem API error:', error)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ checkoutUrl: data.checkout_url })
  } catch (err) {
    console.error('Checkout route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
