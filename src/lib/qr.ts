import QRCode from 'qrcode';

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    throw err;
  }
}

export function getAppBaseURL(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getRedirectURL(shortcode: string): string {
  const baseUrl = getAppBaseURL();
  return `${baseUrl}/r/${shortcode}`;
}

export function getNFCPayload(shortcode: string) {
  const url = getRedirectURL(shortcode);
  return {
    type: 'NDEF_URI',
    url: url,
    instruction: `Tulis (write) URL ini ke stiker NFC (NTAG213/215) menggunakan aplikasi NFC Tools atau NXP TagWriter.`,
  };
}
