'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Copy, Check, QrCode, Wifi, ArrowLeft, Printer, ExternalLink, Sparkles } from 'lucide-react';
import { mockStore } from '@/lib/supabase';
import { generateQRCodeDataURL, getRedirectURL, getNFCPayload } from '@/lib/qr';
import { UMKM } from '@/types';

function QRExportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [umkm, setUmkm] = useState<UMKM | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const printCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const allUmkms = await mockStore.getAllUMKM();
      const target = allUmkms.find((u) => u.id === id) || allUmkms[0];

      if (target) {
        setUmkm(target);
        const redirectUrl = getRedirectURL(target.shortcode);
        const qrUrl = await generateQRCodeDataURL(redirectUrl);
        setQrDataUrl(qrUrl);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !umkm) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const redirectUrl = getRedirectURL(umkm.shortcode);
  const nfcPayload = getNFCPayload(umkm.shortcode);

  const handleCopyNFC = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const link = document.createElement('a');
    link.download = `QR-${umkm.shortcode}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Printable Area styling when printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            border: 2px solid #0f172a !important;
          }
        }
      `}</style>

      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 mb-4">
        <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> Registrasi Berhasil
        </span>
      </header>

      {/* Main Grid */}
      <main className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
        {/* Left Column: Printable Card Preview */}
        <div className="flex flex-col items-center">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 w-full text-left">
            Preview Standee Meja Kasir
          </h2>

          {/* Standee Card */}
          <div
            id="print-area"
            ref={printCardRef}
            className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/60 border-2 border-slate-700/80 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center justify-between relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="w-full py-2 bg-indigo-600/30 border border-indigo-500/30 rounded-xl mb-4 text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> BANTU KAMI BERKEMBANG
            </div>

            <h3 className="text-lg font-extrabold text-slate-100 mb-1 tracking-tight">
              {umkm.name}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Punya pengalaman menyenangkan? Berikan ulasan singkat Anda!
            </p>

            {/* QR Image Container */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 mb-6">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${umkm.name}`}
                  className="w-48 h-48 object-contain mx-auto"
                />
              )}
            </div>

            {/* Instruction Icons */}
            <div className="w-full flex items-center justify-center gap-6 text-slate-300 text-xs font-medium bg-slate-950/60 py-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-400" /> Scan QR
              </div>
              <div className="text-slate-600">•</div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-400" /> Tap NFC
              </div>
            </div>

            <div className="text-[10px] text-slate-500 mt-4 font-mono">
              Link: {redirectUrl}
            </div>
          </div>
        </div>

        {/* Right Column: Downloads & NFC Payload */}
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">{umkm.name}</h1>
            <p className="text-xs text-slate-400 font-mono">Shortcode: {umkm.shortcode}</p>
          </div>

          {/* Action Buttons for QR */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-400" /> Opsi Cetak & Download QR
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all"
              >
                <Download className="w-4 h-4 text-indigo-400" /> Download PNG
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Printer className="w-4 h-4" /> Cetak Standee
              </button>
            </div>
          </div>

          {/* NFC Tag Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" /> Setup Stiker NFC Tag
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tulis URL berikut ke stiker NFC (NTAG213 / NTAG215) menggunakan aplikasi gratis <strong>NFC Tools</strong> di HP Anda:
            </p>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-emerald-400 break-all">
              <span className="truncate flex-1">{redirectUrl}</span>
              <button
                onClick={handleCopyNFC}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex-shrink-0"
                title="Copy URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {copied && (
              <p className="text-[11px] text-emerald-400 font-medium animate-pulse">
                ✓ URL Redirect tersalin ke clipboard!
              </p>
            )}
          </div>

          {/* Target Link Verification */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-xs">
            <span className="text-slate-400 block mb-1">Target Google Review Link:</span>
            <a
              href={umkm.google_review_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px] break-all"
            >
              {umkm.google_review_url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 py-4">
        Instant Scan QR & NFC Auto-Review MVP System
      </footer>
    </div>
  );
}

export default function QRExportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    }>
      <QRExportContent />
    </Suspense>
  );
}
