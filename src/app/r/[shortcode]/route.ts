import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> }
) {
  const { shortcode } = await params;

  if (shortcode) {
    const umkm = await mockStore.getUMKMByShortcode(shortcode);
    if (umkm && umkm.google_review_url) {
      let targetUrl = umkm.google_review_url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }

      // Record scan asynchronously if configured
      const userAgent = request.headers.get('user-agent') || undefined;
      const referer = request.headers.get('referer') || undefined;
      mockStore.recordScan(umkm.id, userAgent, referer).catch(() => {});

      return NextResponse.redirect(targetUrl, { status: 302 });
    }
  }

  // Fallback: Always redirect to Google Maps homepage if shortcode not found (Zero error pages)
  return NextResponse.redirect('https://maps.google.com', { status: 302 });
}
