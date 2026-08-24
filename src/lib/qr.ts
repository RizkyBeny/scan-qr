import QRCode from 'qrcode';

/**
 * Converts ANY Google Maps URL (including hex CIDs, place IDs, share links)
 * into the exact official Google Review Form URL (5-star modal popup) with 64-bit BigInt precision.
 */
export function getDirectGoogleReviewURL(inputUrl: string, googlePlaceId?: string): string {
  // 1. Explicit Place ID provided
  if (googlePlaceId && googlePlaceId.trim()) {
    const pid = googlePlaceId.trim();
    if (pid.startsWith('ChIJ') || pid.length > 5) {
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

  // 2. Already a direct writereview or /review link
  if (url.includes('writereview') || url.endsWith('/review')) {
    return url;
  }

  // 3. Check for placeid parameter
  const matchPlaceId = url.match(/(?:placeid|place_id)=([a-zA-Z0-9_-]+)/i);
  if (matchPlaceId && matchPlaceId[1]) {
    return `https://search.google.com/local/writereview?placeid=${matchPlaceId[1]}`;
  }

  // 4. Check for ludocid or cid parameter
  const matchCid = url.match(/(?:ludocid|cid)=([0-9]+)/i);
  if (matchCid && matchCid[1]) {
    return `https://search.google.com/local/writereview?ludocid=${matchCid[1]}`;
  }

  // 5. Extract Hex CID from standard Google Maps URL (format: 1s0x...:0xHEX!...)
  // Uses BigInt to avoid 64-bit JS float precision truncation
  const matchHex = url.match(/1s0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)/) || url.match(/:(0x[0-9a-fA-F]{10,})/);
  if (matchHex && matchHex[1]) {
    try {
      const hexStr = matchHex[1].startsWith('0x') ? matchHex[1] : `0x${matchHex[1]}`;
      const cidDec = BigInt(hexStr).toString(10);
      return `https://search.google.com/local/writereview?ludocid=${cidDec}`;
    } catch (err) {
      console.error('Failed to parse hex CID with BigInt:', err);
    }
  }

  // 6. g.page/r/SHORTCODE -> g.page/r/SHORTCODE/review
  if (url.includes('g.page/r/')) {
    const cleanUrl = url.replace(/\/$/, '');
    return `${cleanUrl}/review`;
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
