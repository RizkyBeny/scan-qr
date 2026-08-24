'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Store, 
  QrCode, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  RefreshCw,
  Zap,
  Sparkles
} from 'lucide-react';
import { getAppBaseURL } from '@/lib/qr';

interface StatsSummary {
  total_umkms: number;
  total_scans_all: number;
  total_scans_7_days: number;
}

interface UMKMStatItem {
  umkm: {
    id: string;
    name: string;
    shortcode: string;
    google_review_url: string;
    created_at: string;
  };
  total_scans: number;
  scans_7_days: number;
  scans_30_days: number;
  daily_trends: { date: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [umkmStats, setUmkmStats] = useState<UMKMStatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setUmkmStats(data.stats_by_umkm);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBaseUrl(getAppBaseURL());
    fetchStats();
  }, []);

  const handleCopyLink = (shortcode: string, id: string) => {
    const link = `${baseUrl}/r/${shortcode}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto space-y-8 relative">
        {/* Navbar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Scan QR/NFC Auto-Review Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Dashboard Admin & Analytics
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/admin/onboarding"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Register UMKM Baru
            </Link>
          </div>
        </header>

        {/* Overview Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Total UMKM Mitra</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100">{summary?.total_umkms ?? 0}</div>
            <p className="text-xs text-slate-500 mt-2">Titik QR/NFC aktif terdaftar</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Total Scan & Tap</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100">{summary?.total_scans_all ?? 0}</div>
            <p className="text-xs text-slate-500 mt-2">Akumulasi akumulatif event scan</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Scan 7 Hari Terakhir</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100">{summary?.total_scans_7_days ?? 0}</div>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> Zero Friction Redirect Active
            </p>
          </div>
        </section>

        {/* UMKM List & Stats Table */}
        <section className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Daftar UMKM & Performa Scan</h2>
              <p className="text-xs text-slate-400">Monitor traffic ulasan dan kelola QR Code per lokasi kasir</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Memuat data analitik...</div>
          ) : umkmStats.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Belum ada UMKM terdaftar.{' '}
              <Link href="/admin/onboarding" className="text-indigo-400 hover:underline">
                Register sekarang.
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Nama UMKM</th>
                    <th className="py-3.5 px-4">Shortcode Link</th>
                    <th className="py-3.5 px-4 text-center">Total Scan</th>
                    <th className="py-3.5 px-4 text-center">7 Hari</th>
                    <th className="py-3.5 px-4 text-center">Trend (7d)</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {umkmStats.map(({ umkm, total_scans, scans_7_days, daily_trends }) => (
                    <tr key={umkm.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-100">
                        {umkm.name}
                        <span className="block text-[11px] text-slate-500 font-mono font-normal">
                          ID: {umkm.id}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-indigo-400">
                        <div className="flex items-center gap-1.5">
                          <span>/r/{umkm.shortcode}</span>
                          <button
                            onClick={() => handleCopyLink(umkm.shortcode, umkm.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Copy Full Link Redirect"
                          >
                            {copiedId === umkm.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-slate-100 text-base">
                        {total_scans}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-emerald-400 text-base">
                        {scans_7_days}
                      </td>

                      {/* Mini Bar Visualizer for Daily Trend */}
                      <td className="py-4 px-4">
                        <div className="flex items-end justify-center gap-1 h-8">
                          {daily_trends.map((t, idx) => {
                            const maxVal = Math.max(...daily_trends.map((d) => d.count), 1);
                            const heightPercent = Math.max((t.count / maxVal) * 100, 15);
                            return (
                              <div
                                key={idx}
                                style={{ height: `${heightPercent}%` }}
                                className="w-2 rounded-t bg-indigo-500/60 hover:bg-indigo-400 transition-all"
                                title={`${t.date}: ${t.count} scan`}
                              />
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/qr-export?id=${umkm.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5 text-indigo-400" /> Cetak QR / NFC
                          </Link>

                          <a
                            href={`/r/${umkm.shortcode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-indigo-300 text-xs font-medium transition-all"
                          >
                            Test Scan <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
