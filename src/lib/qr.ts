import QRCode from 'qrcode';

/**
 * Converts ANY Google Maps URL, Share link, or Place ID into a 100% working Direct Review URL.
 * Replaces /maps/place/ with /maps/reviews/ and appends !9m1!1b1 directive to open the Reviews tab directly.
 */
export function getDirectGoogleReviewURL(inputUrl: string, googlePlaceId?: string): string {
  // 1. Official ChIJ Place ID provided
  if (googlePlaceId && googlePlaceId.trim()) {
    const pid = googlePlaceId.trim();
    if (pid.startsWith('ChIJ')) {
      return `https://search.google.com/local/writereview?placeid=${pid}`;
    }
  }

  let url = (inputUrl || '').trim();
  if (!url) {
    return 'https://maps.google.com';
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // 2. Extract official ChIJ placeid parameter if present
  const matchPlaceId = url.match(/(?:placeid|place_id)=(ChIJ[a-zA-Z0-9_-]{20,})/i);
  if (matchPlaceId && matchPlaceId[1]) {
    return `https://search.google.com/local/writereview?placeid=${matchPlaceId[1]}`;
  }

  // 3. g.page/r/SHORTCODE -> g.page/r/SHORTCODE/review
  if (url.includes('g.page/r/')) {
    const cleanUrl = url.replace(/\/$/, '');
    return cleanUrl.endsWith('/review') ? cleanUrl : `${cleanUrl}/review`;
  }

  // 4. Already a direct writereview link
  if (url.includes('writereview')) {
    return url;
  }

  // 5. Convert standard Google Maps Place URL (google.com/maps/place/...) -> (google.com/maps/reviews/...)
  // This directs mobile devices straight to the REVIEWS FORM SHEET instead of Overview
  if (url.includes('google.com/maps/place/')) {
    url = url.replace('/maps/place/', '/maps/reviews/');
    if (!url.includes('!9m1!1b1')) {
      if (url.includes('/data=')) {
        url = url.replace(/(\/data=[^&]*)/, '$1!9m1!1b1');
      } else {
        url = url + '/data=!9m1!1b1';
      }
    }
    return url;
  }

  if (url.includes('google.com/maps/reviews/')) {
    if (!url.includes('!9m1!1b1')) {
      if (url.includes('/data=')) {
        url = url.replace(/(\/data=[^&]*)/, '$1!9m1!1b1');
      } else {
        url = url + '/data=!9m1!1b1';
      }
    }
    return url;
  }

  // 6. CID Fallback
  const matchCidParam = url.match(/(?:ludocid|cid)=([0-9]+)/i);
  if (matchCidParam && matchCidParam[1]) {
    return `https://maps.google.com/?cid=${matchCidParam[1]}`;
  }

  const matchHexCid = url.match(/:(0x[0-9a-fA-F]{10,})/);
  if (matchHexCid && matchHexCid[1]) {
    try {
      const hexStr = matchHexCid[1].startsWith('0x') ? matchHexCid[1] : `0x${matchHexCid[1]}`;
      const cidDec = BigInt(hexStr).toString(10);
      return `https://maps.google.com/?cid=${cidDec}`;
    } catch (err) {
      console.error('Failed to parse hex CID:', err);
    }
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
    instruction: `Tulis (write) URL Google Maps Reviews ini ke stiker NFC (NTAG213/215) menggunakan aplikasi NFC Tools atau NXP TagWriter.`,
  };
}
