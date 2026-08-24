import QRCode from 'qrcode';

export function getDirectGoogleReviewURL(inputUrl: string, googlePlaceId?: string): string {
  // 1. If Google Place ID is provided explicitly, construct official writereview deep-link
  if (googlePlaceId && googlePlaceId.trim()) {
    const pid = googlePlaceId.trim();
    return `https://search.google.com/local/writereview?placeid=${pid}`;
  }

  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // 2. If URL contains a placeid parameter, ensure it uses search.google.com/local/writereview
  try {
    const parsed = new URL(url);
    const placeIdParam = parsed.searchParams.get('placeid') || parsed.searchParams.get('place_id');
    if (placeIdParam) {
      return `https://search.google.com/local/writereview?placeid=${placeIdParam}`;
    }

    // 3. If URL is a g.page shortlink, append /review if not present
    if (parsed.hostname.includes('g.page') && !parsed.pathname.endsWith('/review')) {
      return `${url.replace(/\/$/, '')}/review`;
    }
  } catch (err) {
    console.error('URL parse helper warning:', err);
  }

  return url;
}

export async function generateQRCodeDataURL(googleReviewUrl: string, googlePlaceId?: string): Promise<string> {
  try {
    const targetUrl = getDirectGoogleReviewURL(googleReviewUrl, googlePlaceId);

    return await QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Failed to generate Direct Google Maps Form Review QR Code:', err);
    throw err;
  }
}

export function getAppBaseURL(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getNFCPayloadDirect(googleReviewUrl: string, googlePlaceId?: string) {
  const url = getDirectGoogleReviewURL(googleReviewUrl, googlePlaceId);
  return {
    type: 'NDEF_URI',
    url: url,
    instruction: `Tulis (write) URL Direct Form Review ini ke stiker NFC (NTAG213/215) menggunakan aplikasi NFC Tools atau NXP TagWriter.`,
  };
}
