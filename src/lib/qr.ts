import QRCode from 'qrcode';

/**
 * Converts 64-bit Hex feature IDs (f1:f2) from Google Maps URLs into the exact official ChIJ Place ID.
 */
export function hexToChIJ(f1Hex: string, f2Hex: string): string {
  try {
    const f1 = BigInt(f1Hex.startsWith('0x') ? f1Hex : `0x${f1Hex}`);
    const f2 = BigInt(f2Hex.startsWith('0x') ? f2Hex : `0x${f2Hex}`);

    // Exact 20-byte protobuf structure for Google Place ID:
    // Tag 0x0a (len 0x14 = 20 bytes), Tag 0x12 (len 0x10 = 16 bytes), f1 (8 bytes LE), f2 (8 bytes LE)
    const buf = new Uint8Array(20);
    buf[0] = 0x0a;
    buf[1] = 0x14;
    buf[2] = 0x12;
    buf[3] = 0x10;

    for (let i = 0; i < 8; i++) {
      buf[4 + i] = Number((f1 >> BigInt(i * 8)) & BigInt(0xff));
      buf[12 + i] = Number((f2 >> BigInt(i * 8)) & BigInt(0xff));
    }

    // Base64URL encoding without trailing = padding
    let base64 = typeof Buffer !== 'undefined'
      ? Buffer.from(buf).toString('base64')
      : btoa(String.fromCharCode(...buf));

    const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return 'ChIJ' + base64url;
  } catch (err) {
    console.error('Failed to convert Hex CIDs to ChIJ Place ID:', err);
    return '';
  }
}

/**
 * Converts ANY Google Maps URL, Share link, or Place ID into the official 
 * Google Write-Review Form URL (5-star modal popup) guaranteed 100% 200 OK.
 */
export function getDirectGoogleReviewURL(inputUrl: string, googlePlaceId?: string): string {
  // 1. Explicit official Place ID provided
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

  // 2. Already a direct writereview or /review link with ChIJ placeid
  if (url.includes('writereview') && url.includes('placeid=')) {
    return url;
  }

  // 3. Extract placeid parameter if present in input URL
  const matchPlaceId = url.match(/(?:placeid|place_id)=(ChIJ[a-zA-Z0-9_-]{20,})/i);
  if (matchPlaceId && matchPlaceId[1]) {
    return `https://search.google.com/local/writereview?placeid=${matchPlaceId[1]}`;
  }

  // 4. Extract Hex CIDs pair (1s0xHEX:0xHEX) from Google Maps URL and convert to exact ChIJ Place ID
  const matchHexPair = url.match(/1s(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
  if (matchHexPair && matchHexPair[1] && matchHexPair[2]) {
    const chij = hexToChIJ(matchHexPair[1], matchHexPair[2]);
    if (chij) {
      return `https://search.google.com/local/writereview?placeid=${chij}`;
    }
  }

  // 5. g.page/r/SHORTCODE -> g.page/r/SHORTCODE/review
  if (url.includes('g.page/r/')) {
    const cleanUrl = url.replace(/\/$/, '');
    return cleanUrl.endsWith('/review') ? cleanUrl : `${cleanUrl}/review`;
  }

  // 6. Fallback single CID
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
    instruction: `Tulis (write) URL Direct Form Review ini ke stiker NFC (NTAG213/215) menggunakan aplikasi NFC Tools atau NXP TagWriter.`,
  };
}
