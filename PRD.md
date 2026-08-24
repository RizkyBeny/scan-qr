# PRD: Scan QR/NFC Auto-Review (MVP)

## 1. Overview

| Field | Value |
|---|---|
| **Document status** | Draft |
| **PRD type** | Feature PRD (MVP) |
| **Author** | [NEEDS INPUT] |
| **Last updated** | 24 Agustus 2026 |
| **Target release** | [NEEDS INPUT — misal Q4 2026] |
| **Primary stakeholders** | Engineering, Design/UX, Legal (compliance Google), BD/Sales (onboarding UMKM) |

---

## 2. Problem Statement

UMKM tidak perform di Google Review/Maps karena volume ulasan yang masuk sedikit. Pelanggan yang puas jarang mau memberi ulasan karena prosesnya merepotkan: harus buka aplikasi Google Maps, mencari nama usaha, lalu mengetik ulasan secara manual. Friction ini menyebabkan hilangnya banyak potensi ulasan positif yang sebenarnya bisa didapat begitu saja dari pelanggan yang sudah puas di titik transaksi (meja kasir).

⚠️ *Needs validation: data kuantitatif pendukung (rata-rata jumlah review UMKM saat ini, estimasi drop-off pada proses manual) belum tersedia — disarankan dilengkapi dari riset lapangan.*

---

## 3. Goals

**Business goal:**
Meningkatkan jumlah ulasan Google Review/Maps UMKM mitra melalui titik interaksi fisik (meja kasir) tanpa friction. Target MVP: [NEEDS INPUT — mis. "conversion rate scan-to-review submitted ≥30% dalam masa pilot"].

**User goal:**
- Pelanggan (end customer): bisa memberi ulasan dalam hitungan detik, cukup scan/tap, tanpa buka aplikasi dan mengetik dari nol.
- UMKM: mendapat lebih banyak ulasan baru secara pasif tanpa harus meminta secara manual ke tiap pelanggan.

**Non-goals (di luar scope MVP):**
- Tidak membangun modul analisis performa sosmed/Google (itu Fitur 2 — PRD terpisah).
- Tidak mencakup dashboard tren historis atau notifikasi ulasan negatif — masuk fase berikutnya (post-MVP).
- Tidak mencakup dukungan multi-cabang/multi-lokasi kompleks di MVP awal — fokus 1 QR/NFC per titik kasir.
- Tidak mencakup personalisasi draf ulasan berbasis AI generatif di MVP — mulai dari template sederhana dulu (lihat OQ-03).

---

## 4. User Personas

**Primary persona 1: Pelanggan Akhir UMKM ("Sari")**
- Context: Baru saja menyelesaikan transaksi di kasir UMKM (F&B/retail/jasa).
- Motivation: Bersedia memberi ulasan positif jika prosesnya cepat dan mudah.
- Pain point: Proses review manual di Google Maps dianggap merepotkan — banyak langkah, harus login, cari nama tempat, mengetik teks dari nol.

**Primary persona 2: Pemilik/Pengelola UMKM ("Pak Budi")**
- Context: Mengelola usaha kecil-menengah dengan sumber daya digital marketing terbatas.
- Motivation: Ingin lebih banyak ulasan positif tanpa harus meminta secara manual ke pelanggan satu-satu.
- Pain point: Tidak ada cara mudah/murah untuk mendorong pelanggan puas memberi ulasan di titik transaksi.

---

## 5. User Stories

| ID | User Story | Priority |
|---|---|---|
| US-01 | Sebagai pelanggan UMKM, saya ingin memindai QR code di meja kasir agar saya langsung diarahkan ke halaman pemberian ulasan Google usaha tersebut. | P0 |
| US-02 | Sebagai pelanggan UMKM, saya ingin dibantu draf teks ulasan sederhana yang bisa saya edit atau hapus sebelum submit, agar saya tidak perlu mengetik dari nol. | P0 |
| US-03 | Sebagai pemilik UMKM, saya ingin memiliki QR code unik untuk usaha saya yang sudah ter-link ke Google Business Profile saya sendiri. | P0 |
| US-04 | Sebagai pemilik UMKM, saya ingin tahu berapa kali QR saya discan dan berapa yang berhasil submit review, agar saya tahu efektivitasnya. | P1 |
| US-05 | Sebagai pelanggan UMKM, saya ingin opsi tap NFC sebagai alternatif scan QR (jika tersedia di meja kasir). | P2 |

⚠️ *US-05 (NFC) ditandai P2 — disarankan MVP fokus ke QR code dulu karena lebih murah & cepat diproduksi (cetak stiker) dibanding rollout hardware NFC ke banyak UMKM. Lihat OQ-01.*

---

## 6. Acceptance Criteria

**US-01 — Scan QR untuk redirect ke halaman review**
- [ ] Given pelanggan memindai QR code di meja kasir, when scan berhasil, then pelanggan diarahkan langsung ke halaman ulasan Google Business Profile usaha tersebut dalam ≤3 detik.
- [ ] Given QR code rusak/tidak valid, when discan, then sistem menampilkan pesan error yang jelas beserta kontak/alternatif fallback.
- [ ] Given pelanggan belum login akun Google di device, when diarahkan ke halaman review, then sistem menampilkan prompt login Google standar (bukan flow custom).

**US-02 — Bantuan draf ulasan**
- [ ] Given pelanggan berada di halaman review, when sistem menawarkan draf teks, then draf dapat diedit bebas atau dihapus sepenuhnya sebelum submit.
- [ ] Given ulasan akan dikirim, when pelanggan menekan submit, then submit hanya terjadi atas aksi eksplisit pelanggan — sistem tidak pernah mengirim ulasan otomatis tanpa konfirmasi.
- ⚠️ *Needs validation: draf teks tidak boleh berupa template kaku yang berulang identik antar pelanggan — berisiko dianggap ulasan tidak organik oleh Google.*

**US-03 — Provisioning QR per UMKM**
- [ ] Given UMKM baru onboarding, when admin generate QR code, then kode tersebut ter-link secara unik dan benar ke Google Business Profile ID usaha yang dimaksud.
- [ ] Given QR sudah aktif, when dicetak, then tersedia versi file siap cetak (PDF/PNG) dengan ukuran standar untuk ditaruh di meja kasir.

**US-04 — Tracking dasar**
- [ ] Given QR discan, when event tercatat, then sistem menyimpan timestamp dan status (scan-only vs scan-to-submit) tanpa menyimpan PII pelanggan yang tidak perlu.
- [ ] Given UMKM membuka ringkasan, when melihat data, then ditampilkan total scan dan total submit dalam periode terpilih (mis. 7/30 hari terakhir).

---

## 7. Functional Requirements

| ID | Requirement | Story ref |
|---|---|---|
| FR-01 | Sistem harus dapat generate QR code unik per lokasi/kasir UMKM yang ter-link ke Google Business Profile review link resmi. | US-01, US-03 |
| FR-02 | Sistem harus melakukan redirect otomatis ke deep-link ulasan Google (native app jika terinstall, web fallback jika tidak). | US-01 |
| FR-03 | Sistem dapat menampilkan draf teks ulasan sederhana (template, bukan AI generatif di MVP) yang wajib melalui konfirmasi/edit eksplisit pelanggan sebelum submit. | US-02 |
| FR-04 | Sistem harus mencatat setiap event scan (timestamp, lokasi/QR ID, status submit) untuk keperluan tracking dasar, tanpa menyimpan data pribadi pelanggan yang tidak perlu. | US-04 |
| FR-05 | Sistem harus menyediakan file QR code siap cetak (format & resolusi untuk cetak fisik) saat provisioning UMKM baru. | US-03 |
| FR-06 | Sistem harus menampilkan ringkasan sederhana (total scan, total submit) ke UMKM melalui halaman/dashboard minimal. | US-04 |

---

## 8. Non-Functional Requirements

| Category | Requirement | Threshold |
|---|---|---|
| Performance | Waktu redirect dari scan QR ke halaman review | < 3 detik pada koneksi 4G |
| Reliability | Uptime layanan redirect QR (kritikal, revenue-generating) | 99.9% |
| Privacy | Data pelanggan yang scan QR | Tidak menyimpan PII kecuali diperlukan; sesuai UU PDP (Indonesia) |
| Compliance | Kepatuhan terhadap kebijakan Google Business Profile terkait review gating & insentif ulasan | Wajib — pelanggaran berisiko suspend akun Google Business UMKM mitra |
| Accessibility | Halaman redirect/landing (diakses publik luas, berbagai device) | WCAG AA minimum |
| Localization | Bahasa antarmuka | Bahasa Indonesia (default) |

---

## 9. Success Metrics

| Metric | Type | Baseline | Target | Measurement method |
|---|---|---|---|---|
| Conversion rate scan → review submitted | Leading | 0 (produk baru) | ⚠️ Needs validation — disarankan ≥30% di masa pilot | Event tracking scan vs submit |
| Total scan QR per UMKM/minggu | Leading | 0 | [NEEDS INPUT] | Analytics event |
| Rata-rata jumlah review baru per UMKM/bulan (setelah pakai fitur) | Lagging | [NEEDS INPUT] | [NEEDS INPUT] | Google Business Profile API |
| Waktu rata-rata dari scan sampai submit | Leading | — | < 30 detik | Event timestamp tracking |

---

## 10. Dependencies and Risks

**Dependencies:**

| Dependency | Owner | Status | Notes |
|---|---|---|---|
| Akses Google Business Profile review link per UMKM mitra | [NEEDS INPUT] | Pending | Perlu link/Place ID resmi tiap UMKM saat onboarding |
| Percetakan QR code fisik (stiker/standee meja kasir) | [NEEDS INPUT — vendor] | Pending | Perlu proses cetak & distribusi ke lokasi UMKM |
| Review legal terhadap kebijakan Google terkait review gating/insentif | Legal | Pending | Wajib sebelum development draf-teks-ulasan berjalan |

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pelanggaran kebijakan Google terkait "review gating" (menawarkan review hanya ke pelanggan puas) atau insentif berbayar | Medium | High (risiko suspend akun Google Business) | Tawarkan opsi review ke semua pelanggan tanpa filter kepuasan; tidak ada insentif berbayar untuk review positif |
| Draf teks otomatis dianggap ulasan tidak organik oleh Google | Medium | High | Draf harus mudah diedit/dihapus, variasikan template, audit rutin pola teks |
| Rendahnya adopsi karena pelanggan tidak familiar scan QR di meja kasir | Medium | Medium | Sertakan instruksi visual sederhana di dekat QR fisik |
| QR fisik rusak/hilang/pudar di lokasi | Low | Medium | Material stiker tahan lama, proses re-cetak mudah lewat dashboard admin |

---

## 11. Open Questions

| # | Question | Owner | Due date | Status |
|---|---|---|---|---|
| OQ-01 | Apakah MVP fokus QR code saja, atau tetap menyediakan opsi NFC dari awal? | [NEEDS INPUT] | [NEEDS INPUT] | Open |
| OQ-02 | Model bisnis MVP: gratis untuk pilot, atau langsung berbayar (subscription)? | [NEEDS INPUT] | [NEEDS INPUT] | Open |
| OQ-03 | Draf teks ulasan: pakai template statis sederhana dulu, atau langsung AI generatif di MVP? | [NEEDS INPUT] | [NEEDS INPUT] | Open |
| OQ-04 | Apakah sudah ada review legal terhadap kebijakan Google Reviews terkait flow ini? | Legal | [NEEDS INPUT] | Open |
| OQ-05 | Berapa jumlah UMKM pilot yang ditargetkan untuk MVP awal? | [NEEDS INPUT] | [NEEDS INPUT] | Open |

---

## 12. Rollout Plan

- **Rollout strategy**: Beta terbatas — pilot ke sejumlah kecil UMKM (mis. 5–10 usaha, segmen F&B) sebelum perluasan. ⚠️ Needs validation.
- **Target audience for initial release**: UMKM F&B (kafe/restoran) — volume transaksi kasir tinggi, siklus interaksi pelanggan cepat.
- **Rollback criteria**: Tingkat komplain/pelanggaran kebijakan Google Business Profile melebihi ambang tertentu; conversion rate scan-to-review jauh di bawah target minimum setelah periode evaluasi.
- **Launch checklist items**: Review legal kebijakan Google Reviews, uji beban sistem redirect QR, cetak & distribusi QR fisik ke lokasi pilot, materi instruksi singkat untuk pelanggan & UMKM.

---

## Confidence Note

PRD ini adalah versi MVP dari Fitur 1, dipisahkan dari modul analisis performa (Fitur 2) agar bisa dikembangkan dan dirilis secara independen. Fokus MVP dipersempit ke: generate QR, redirect ke review Google, bantuan draf teks sederhana, dan tracking dasar scan/submit. Beberapa keputusan (NFC, model bisnis, jenis draf teks) masih `[NEEDS INPUT]` dan perlu dijawab sebelum masuk ke desain teknis di Google Antigravity. Status dokumen: **Draft — Incomplete**, item legal (OQ-04) disarankan jadi prioritas karena berdampak langsung ke risiko suspend akun Google Business UMKM mitra.