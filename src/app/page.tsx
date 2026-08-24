import React from 'react';
import Link from 'next/link';
import { QrCode, Wifi, Zap, ArrowRight, ShieldCheck, BarChart3, Store } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-tight">Auto-Review QR & NFC</span>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all"
        >
          <Store className="w-4 h-4 text-indigo-400" /> Admin Dashboard
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto my-auto text-center py-12 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> Instant Zero-Friction Google Review
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Tingkatkan Ulasan Google Bisnis <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Tanpa Friction di Kasir
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pelanggan cukup <strong>Scan QR Code</strong> atau <strong>Tap NFC Tag</strong> di meja kasir untuk langsung membuka halaman ulasan Google Maps dalam 1 detik.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/admin/onboarding"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all"
          >
            Register UMKM & Buat QR <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all"
          >
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Lihat Analytics Dashboard
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Direct Deep-Link Redirect</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Redirect instan &lt;300ms langsung membuka aplikasi Google Maps native di smartphone pelanggan.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">QR Code & NFC Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Format URL universal NDEF siap cetak sebagai QR standee maupun di-write ke stiker NFC kasir.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">100% Google Compliant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tanpa gating atau insentif terlarang. Aman dari risiko suspend akun Google Business Profile.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-4">
        Scan QR & NFC Auto-Review MVP System • Powered by Next.js & Supabase
      </footer>
    </div>
  );
}
