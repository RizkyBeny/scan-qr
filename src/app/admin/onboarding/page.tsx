'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Store, Link as LinkIcon, Sparkles, ArrowRight, ArrowLeft, Info, ExternalLink, Search, MapPin, Check } from 'lucide-react';
import { mockStore } from '@/lib/supabase';
import { getDirectGoogleReviewURL } from '@/lib/qr';

interface PlaceSuggestion {
  name: string;
  full_address: string;
  lat: string;
  lon: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [customShortcode, setCustomShortcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);

  // Auto-search place suggestions as user types name
  useEffect(() => {
    if (!name.trim() || name.length < 3 || selectedPlace) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingPlaces(true);
      try {
        const res = await fetch(`/api/place-search?q=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.success && data.places) {
          setSuggestions(data.places);
        }
      } catch (err) {
        console.error('Failed to search places:', err);
      } finally {
        setSearchingPlaces(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, selectedPlace]);

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setSelectedPlace(place);
    setName(place.name);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!googleReviewUrl.trim() && !googlePlaceId.trim())) {
      setError('Nama UMKM dan (Link Review atau Google Place ID) wajib diisi!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const finalReviewUrl = getDirectGoogleReviewURL(googleReviewUrl.trim(), googlePlaceId.trim());

      const umkm = await mockStore.createUMKM(
        name.trim(),
        finalReviewUrl,
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
          <Sparkles className="w-3.5 h-3.5" /> Auto-Search & Direct Form Review
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
              <h1 className="text-xl font-bold text-slate-100">Registrasi UMKM Baru</h1>
              <p className="text-xs text-slate-400">Cari nama usaha atau masukkan Place ID untuk membuat QR Form 5-Bintang</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input with Autocomplete Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Cari / Ketik Nama Usaha (UMKM) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ketik nama usaha kamu, misal: Trikopii Diponegoro..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSelectedPlace(null);
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                  required
                />
                {searchingPlaces && (
                  <Search className="w-4 h-4 text-indigo-400 absolute right-3.5 top-3.5 animate-spin" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && !selectedPlace && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-800">
                  {suggestions.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPlace(p)}
                      className="w-full text-left p-3 hover:bg-slate-800 transition-colors flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-100 block">{p.name}</span>
                        <span className="text-slate-400 text-[11px] line-clamp-1">{p.full_address}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedPlace && (
                <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" /> Lokasi terpilih: {selectedPlace.full_address}
                </p>
              )}
            </div>

            {/* Instruction Box for Direct 5-Star Review Form */}
            <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                Pop-up Form 5-Bintang Langsung Terbuka di HP:
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                Masukkan <strong>Google Place ID</strong> (berawalan <code>ChIJ...</code>) agar QR Code langsung memicu <strong>Pop-up Form Rating 5-Bintang</strong> di HP pelanggan.
              </p>
              <a
                href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] underline pt-1"
              >
                Cari Google Place ID otomatis via Google Finder <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Google Place ID (Format: ChIJ...)
              </label>
              <input
                type="text"
                placeholder="Contoh: ChIJN1t_tDeuEmsRUsoyG83frY4"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Atau Link Google Maps / Share Link
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="https://maps.app.goo.gl/... atau https://www.google.com/maps/place/..."
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

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
                    Generate Direct Form Review QR Code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 py-4">
        Direct Form Review QR & NFC Generator System
      </footer>
    </div>
  );
}
