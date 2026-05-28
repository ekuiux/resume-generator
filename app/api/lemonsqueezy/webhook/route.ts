import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify LS signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') ?? '';
  const secret = process.env.LS_WEBHOOK_SECRET ?? '';

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn('[webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const eventName = event.meta && (event.meta as Record<string, unknown>).event_name;
  console.log('[webhook] event:', eventName);

  switch (eventName) {
    case 'order_created': {
      await handleOrderCreated(event);
      break;
    }
    case 'subscription_created': {
      await handleSubscriptionCreated(event);
      break;
    }
    case 'subscription_cancelled':
    case 'subscription_expired': {
      await handleSubscriptionEnded(event);
      break;
    }
    default:
      // Acknowledge unhandled events
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleOrderCreated(event: Record<string, unknown>) {
  const data = (event.data as Record<string, unknown>) ?? {};
  const attrs = (data.attributes as Record<string, unknown>) ?? {};
  const customData = (attrs.custom_data as Record<string, unknown>) ?? {};
  const sessionToken = customData.session_token as string | undefined;

  if (!sessionToken) {
    console.warn('[webhook] order_created: no session_token in custom_data');
    return;
  }

  // Mark token as paid in your DB / KV store
  // Example with Vercel KV:
  //   await kv.set(`session:${sessionToken}`, 'paid', { ex: 3600 });
  //
  // For now we log — replace with your storage layer
  console.log(`[webhook] order_created: token=${sessionToken} status=paid`);
}

async function handleSubscriptionCreated(event: Record<string, unknown>) {
  const data = (event.data as Record<string, unknown>) ?? {};
  const attrs = (data.attributes as Record<string, unknown>) ?? {};
  const customData = (attrs.custom_data as Record<string, unknown>) ?? {};
  const sessionToken = customData.session_token as string | undefined;

  console.log(`[webhook] subscription_created: token=${sessionToken}`);
  // Same as order — mark as paid + store subscription_id for future cancellation
  // const subId = (data.id as string);
  // await kv.set(`session:${sessionToken}`, JSON.stringify({ status: 'active', subId }), { ex: 3600 });
}

async function handleSubscriptionEnded(event: Record<string, unknown>) {
  const data = (event.data as Record<string, unknown>) ?? {};
  const id = data.id as string;
  console.log(`[webhook] subscription ended: id=${id}`);
  // Revoke access if you gate ongoing features behind the subscription
}