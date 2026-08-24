'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Store, Link as LinkIcon, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { mockStore } from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [customShortcode, setCustomShortcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !googleReviewUrl.trim()) {
      setError('Nama UMKM dan Link Google Review wajib diisi!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate or construct URL
      let reviewUrl = googleReviewUrl.trim();
      if (!reviewUrl.startsWith('http://') && !reviewUrl.startsWith('https://')) {
        reviewUrl = `https://${reviewUrl}`;
      }

      const umkm = await mockStore.createUMKM(
        name.trim(),
        reviewUrl,
        googlePlaceId.trim() || undefined,
        customShortcode.trim() || undefined
      );

      // Redirect to QR export page for this UMKM
      router.push(`/admin/qr-export?id=${umkm.id}`);
    } catch (err: unknown) {
      console.error(err);
      setError('Gagal menyimpan data UMKM. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Nav */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 mb-6">
        <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" /> Onboarding UMKM Baru
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-xl w-full mx-auto my-auto">
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Registrasi UMKM & Generate Kode</h1>
              <p className="text-xs text-slate-400">Buat link redirect QR Code & NFC Tag siap pakai untuk kasir</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nama Tempat / Usaha (UMKM) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Contoh: Kafe Kopi Kenangan Kasir 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Link Google Business Review <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Tip: Dapatkan link ini dari menu <em>Ask for reviews</em> di profil Google Bisnis Ku.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Custom Shortcode (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="misal: kopikenangan"
                  value={customShortcode}
                  onChange={(e) => setCustomShortcode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Google Place ID (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="ChIJ..."
                  value={googlePlaceId}
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Memproses...
                  </span>
                ) : (
                  <>
                    Generate QR Code & Link NFC <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 py-4">
        Instant Scan QR & NFC Auto-Review MVP System
      </footer>
    </div>
  );
}
