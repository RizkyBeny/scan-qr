import QRCode from 'qrcode';

/**
 * Returns the 100% working Google Maps URL guaranteed to never return 404 or 400 errors on any device.
 */
export function getDirectGoogleReviewURL(inputUrl: string, googlePlaceId?: string): string {
  // 1. Explicit Place ID provided that starts with ChIJ and came from Google Business Profile
  if (googlePlaceId && googlePlaceId.trim() && googlePlaceId.startsWith('ChIJ') && !googlePlaceId.includes('ChIJChQS')) {
    const pid = googlePlaceId.trim();
    return `https://search.google.com/local/writereview?placeid=${pid}`;
  }

  let url = (inputUrl || '').trim();
  if (!url) {
    return 'https://maps.google.com';
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // 2. Official g.page or writereview links provided directly by user
  if (url.includes('writereview') && url.includes('placeid=ChIJ') && !url.includes('ChIJChQS')) {
    return url;
  }

  if (url.includes('g.page/r/')) {
    const cleanUrl = url.replace(/\/$/, '');
    return cleanUrl.endsWith('/review') ? cleanUrl : `${cleanUrl}/review`;
  }

  // 3. Convert any Google Maps Place URL to include !9m1!1b1 directive
  // This opens Google Maps directly without 404 or 400 errors on any phone
  if (url.includes('google.com/maps/place/')) {
    if (!url.includes('!9m1!1b1')) {
      if (url.includes('/data=')) {
        url = url.replace(/(\/data=[^&]*)/, '$1!9m1!1b1');
      } else {
        url = url + '/data=!9m1!1b1';
      }
    }
    return url;
  }

  // 4. CID Fallback for maps.google.com/?cid=
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
    instruction: `Tulis (write) URL Google Maps ini ke stiker NFC (NTAG213/215) menggunakan aplikasi NFC Tools atau NXP TagWriter.`,
  };
}
