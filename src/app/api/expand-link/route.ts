import { NextRequest, NextResponse } from 'next/server';
import { getDirectGoogleReviewURL } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL parameter required' }, { status: 400 });
    }

    let inputUrl = url.trim();
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      inputUrl = `https://${inputUrl}`;
    }

    let expandedUrl = inputUrl;

    // Expand shortlinks if it's a maps.app.goo.gl, goo.gl, or g.co shortlink
    if (inputUrl.includes('maps.app.goo.gl') || inputUrl.includes('goo.gl') || inputUrl.includes('g.co')) {
      try {
        const response = await fetch(inputUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          },
        });
        expandedUrl = response.url || inputUrl;
      } catch (err) {
        console.error('Failed to resolve shortlink redirect:', err);
      }
    }

    // Convert expanded URL to direct writereview form URL
    const reviewFormUrl = getDirectGoogleReviewURL(expandedUrl);

    return NextResponse.json({
      success: true,
      original_url: inputUrl,
      expanded_url: expandedUrl,
      review_form_url: reviewFormUrl,
    });
  } catch (err) {
    console.error('Error expanding link:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
