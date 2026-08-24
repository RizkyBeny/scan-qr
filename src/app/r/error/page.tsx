'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Home, Search } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold mb-2 tracking-tight text-slate-100">
          {reason === 'not_found' ? 'QR / NFC Tidak Ditemukan' : 'Terdapat Kendala Sistem'}
        </h1>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {reason === 'not_found'
            ? 'Kode QR atau NFC Tag ini belum terdaftar atau telah dinonaktifkan oleh pemilik usaha.'
            : 'Maaf, sistem tidak dapat memproses redirect ulasan saat ini. Silakan coba lagi.'}
        </p>

        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-6 text-left">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Alternatif Ulasan Manual:
          </h2>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
            <li>Buka aplikasi Google Maps di ponsel Anda.</li>
            <li>Cari nama lokasi atau toko yang sedang Anda kunjungi.</li>
            <li>Pilih tab <strong>Ulasan</strong> lalu berikan rating & ulasan Anda.</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700"
          >
            <Home className="w-4 h-4" />
            Halaman Utama
          </Link>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Search className="w-4 h-4" />
            Cari di Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
