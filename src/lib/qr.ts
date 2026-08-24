import QRCode from 'qrcode';

export async function generateQRCodeDataURL(googleReviewUrl: string): Promise<string> {
  try {
    let targetUrl = googleReviewUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

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
    console.error('Failed to generate Direct Google Maps QR Code:', err);
    throw err;
  }
}

export function getAppBaseURL(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getDirectGoogleReviewURL(googleReviewUrl: string): string {
  let targetUrl = googleReviewUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }
  return targetUrl;
}

export function getNFCPayloadDirect(googleReviewUrl: string) {
  const url = getDirectGoogleReviewURL(googleReviewUrl);
  return {
    type: 'NDEF_URI',
    url: url,
    instruction: `Tulis (write) URL Google Maps ini ke stiker NFC (NTAG213/215) menggunakan aplikasi NFC Tools atau NXP TagWriter.`,
  };
}
