import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> }
) {
  const { shortcode } = await params;

  if (!shortcode) {
    return NextResponse.redirect(new URL('/r/error', request.url));
  }

  const umkm = await mockStore.getUMKMByShortcode(shortcode);

  if (!umkm || !umkm.google_review_url) {
    return NextResponse.redirect(new URL('/r/error?reason=not_found', request.url));
  }

  // Record scan asynchronously without blocking the user redirect response
  const userAgent = request.headers.get('user-agent') || undefined;
  const referer = request.headers.get('referer') || undefined;
  
  // Non-blocking async execution
  mockStore.recordScan(umkm.id, userAgent, referer).catch((err) => {
    console.error('Failed to log scan event:', err);
  });

  // Ensure redirect URL has a protocol
  let targetUrl = umkm.google_review_url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  // Instant 302 Found redirect to Google Review Page
  return NextResponse.redirect(targetUrl, { status: 302 });
}
