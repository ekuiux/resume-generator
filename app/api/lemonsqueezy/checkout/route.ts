import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// LemonSqueezy Variant IDs — replace with your actual IDs from LS dashboard
const VARIANT_IDS: Record<string, string | undefined> = {
  one_time: process.env.LS_VARIANT_ONE_TIME,   // $2.75 one-time
  recurring: process.env.LS_VARIANT_RECURRING,  // $3.45/week
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planType, resumeData, selectedTemplate } = body as {
      planType: string;
      resumeData: unknown;
      selectedTemplate: string;
    };

    if (!planType || !VARIANT_IDS[planType]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Generate a short token to track this checkout session
    // We'll use it to verify the purchase on return
    const sessionToken = crypto.randomBytes(16).toString('hex');

    // Store session metadata in KV / DB in production
    // For simplicity we embed it in custom_data and verify via webhook
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const checkoutPayload = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_options: {
            embed: true,
            media: false,
            logo: true,
          },
          checkout_data: {
            custom: {
              session_token: sessionToken,
              template: selectedTemplate || 'minimal',
            },
          },
          product_options: {
            redirect_url: `${siteUrl}/api/lemonsqueezy/verify?token=${sessionToken}`,
            receipt_button_text: 'Back to Resume Builder',
            receipt_link_url: siteUrl,
            enabled_variants: [VARIANT_IDS[planType]],
          },
          expires_at: null,
        },
        relationships: {
          store: {
            data: { type: 'stores', id: process.env.LS_STORE_ID },
          },
          variant: {
            data: { type: 'variants', id: VARIANT_IDS[planType] },
          },
        },
      },
    };

    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.LS_API_KEY}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[LS checkout]', err);
      return NextResponse.json({ error: 'LemonSqueezy checkout failed' }, { status: 502 });
    }

    const data = await res.json();
    const checkoutUrl = data?.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl, sessionToken });
  } catch (err) {
    console.error('[checkout route]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}