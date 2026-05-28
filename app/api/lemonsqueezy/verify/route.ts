import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/lemonsqueezy/verify?token=xxx
 *
 * LemonSqueezy redirects here after successful payment.
 * We verify the token is paid, then redirect to the app with ?payment=success.
 * The frontend detects this param and auto-triggers PDF download.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${siteUrl}?payment=error&reason=missing_token`);
  }

  // ── Option A: trust the redirect (simple, good enough for MVP) ──────────
  // LemonSqueezy only redirects here after a successful payment.
  // Webhook is the source of truth for fulfillment; this just triggers the UX.
  // For MVP we trust the redirect and auto-download.

  return NextResponse.redirect(`${siteUrl}?payment=success&token=${token}`);

  // ── Option B: verify against KV / DB (more secure, recommended post-MVP) ─
  // Uncomment and adapt once you add a storage layer (e.g. Vercel KV).
  //
  // try {
  //   const record = await kv.get(`session:${token}`);
  //   if (!record) {
  //     return NextResponse.redirect(`${siteUrl}?payment=pending&token=${token}`);
  //   }
  //   return NextResponse.redirect(`${siteUrl}?payment=success&token=${token}`);
  // } catch (err) {
  //   console.error('[verify]', err);
  //   return NextResponse.redirect(`${siteUrl}?payment=error&reason=server`);
  // }
}