# 🧭 PANDU — PROJECT PROGRESS & MASTER ROADMAP

**Sistem:** PANDU — Navigation & Incident Defense Against Digital Deception
**Kompetisi:** Web Development Competition MIT-WEEK 2026 (Universitas Mulawarman)
**Tim:** 404Forbidden (Kode Tim: `MIT-002`)
**Domain:** `https://pandu.web.id`
**Tech Stack:** Go Fiber v2 (Backend Port 8082) + Next.js App Router (Frontend Port 3002) + Nginx SSL (HTTP/2)

---

## 📋 DAFTAR FITUR & RIWAYAT PROGRES

### 1. Inisialisasi Fondasi & Arsitektur Sistem [28 Oktober 2026]
- **Arsitektur Decoupled**:
  - Backend: Go 1.24+ (Fiber v2) beroperasi mandiri pada port `8082` dikelola via Supervisor (`pandu-backend`).
  - Frontend: Next.js 16 (App Router, TypeScript, Tailwind CSS v4, Lucide React) beroperasi pada port `3002` dikelola via PM2 (`pandu-frontend`).
  - Reverse Proxy & SSL: Nginx melayani `pandu.web.id` dengan HTTP/2, HSTS preload, dan sertifikat SSL aktif hingga 7 Januari 2027.
- **Halaman Beranda & Sistem Multi-Page Routing Dedicated**:
  - Halaman Index Beranda terisolasi pada root domain `https://pandu.web.id` sebagai pintu masuk produk.
  - Halaman terpisah (dedicated URL routing):
    - `https://pandu.web.id/xray`: Deception X-Ray Scanner.
    - `https://pandu.web.id/simulasi`: The Deception Arena Sandbox.
    - `https://pandu.web.id/aksi` (dan alias `/laporan`): Incident First-Aid Dossier Generator.
  - Integrasi state via browser `sessionStorage`: Hasil deteksi di `/xray` dapat langsung diteruskan ke form aduan di `/aksi` tanpa refresh/kehilangan data.
  - Header navigasi otomatis sinkron dengan `usePathname()` sehingga tab aktif langsung menyala sesuai URL.
- **Pilar 1 (Recognize) — Deception X-Ray Scanner**:
  - Engine Heuristik Transparan (`internal/scanner/text_scanner.go` & `url_scanner.go`).
  - Pemetaan Cognitive Bias (Kepanikan Waktu, Iming-Iming Keuntungan, Pencatutan Otoritas, Kelangkaan Semu).
  - Deteksi Typosquatting untuk 13 brand perbankan/fintech besar Indonesia.
  - Safe Redirect Unmasker untuk membongkar shortlink (`bit.ly`, `s.id`, dll) tanpa celah SSRF.
- **Pilar 2 (Learn) — Arena Simulasi & Pengambilan Keputusan**:
  - Engine Dialog Interaktif (`internal/sandbox/scenarios.go` & `simulator.go`).
  - 3 Skenario Percakapan Realistis Lokal (Loker Freelance Like Video, Kurir Paket .APK, Impersonasi Teman Pinjam Uang).
  - Mockup chat realistis (banner taktik terdeteksi, tactical feedback instan, dan Skor Imunitas Kognitif Digital 0-100%).
- **Pilar 3 (Act) — Pusat Aksi & Draf Laporan Forensik**:
  - Engine Berkas Insiden (`internal/dossier/generator.go`).
  - Checklist Tindakan Darurat Mandiri (5 Menit Pertama, Hari Ini, Lanjutan).
  - Draf Laporan Resmi 1-Click Copy untuk AduanKonten Komdigi, CekRekening OJK, dan Patroli Siber Polri.
  - Kartu Peringatan Grup WhatsApp Keluarga siap sebar.
- **Status Pengujian & Keamanan**:
  - Seluruh unit tests backend Go (`scanner`, `sandbox`, `dossier`) lulus 100% (PASS).
  - Next.js Turbopack build sukses 0 error.
  - Status working tree bersih (`working tree clean`).

### 2. Hybrid Threat Correlation & Analisis Berkas Nyata [29 Oktober 2026]
- **Kontrak Bukti Multi-Sumber**:
  - Setiap sumber kini memiliki status `queried`, `unavailable`, atau `skipped`, serta hasil `match`, `no_match`, `context`, atau `unknown`.
  - Hasil tidak lagi menyamakan provider gagal/tidak tersedia dengan target bersih.
  - Label aman/bersih berdasarkan ketiadaan laporan dihapus; hasil tanpa kecocokan menyatakan keterbatasan sumber.
- **Intelijen Terbuka Live**:
  - Email menggunakan StopForumSpam melalui hash MD5 alamat untuk meminimalkan pengiriman data mentah, ditambah pemeriksaan DNS MX.
  - URL/domain dikorelasikan dengan RDAP registry dan pencarian pemindaian publik urlscan.io, serta DNS/TLS yang dibatasi ke alamat IP publik.
  - Hash file dikorelasikan dengan CIRCL hashlookup dan selalu menyertakan batasan bahwa kecocokan bukan vonis malware.
  - AduanNomor.id dan CekRekening.id ditampilkan sebagai sumber resmi yang belum tersedia untuk otomasi karena tidak memiliki API publik; tidak ada bypass CAPTCHA/Cloudflare.
- **Unggah Berkas & Gambar Nyata**:
  - Endpoint `/api/v1/scan/file` sekarang menerima `multipart/form-data`, membaca byte asli maksimal 5 MB, dan menghitung SHA-256/MD5 dari muatan asli.
  - APK diperiksa sebagai arsip secara bounded dan hanya menampilkan permission yang benar-benar ditemukan dalam manifest; berkas tidak pernah dieksekusi.
  - Gambar didekode untuk metadata tipe/dimensi dengan disclaimer bahwa metadata tidak membuktikan keaslian.
- **Integritas Registri & Keamanan**:
  - Pencocokan registri dibuat exact dan type-scoped untuk mencegah benturan nomor rekening/telepon.
  - Laporan publik baru berstatus pending (`verified=false`) dan nama pemilik rekening dari input publik tidak dipublikasikan.
  - Seed/demo tanpa provenance dihapus dari database produksi dan seeding otomatis dinonaktifkan.
  - Resolusi URL/TLS menolak alamat non-publik untuk mengurangi SSRF; setiap redirect hop divalidasi.
- **UI Radar Forensik**:
  - Berkas dikirim sebagai byte asli melalui FormData.
  - Hasil menampilkan cakupan pemeriksaan, status setiap sumber, bukti, waktu pemeriksaan, atribusi, dan keterbatasan sumber.
  - Istilah `Tanda Bahaya Terverifikasi` diganti menjadi `Indikator & Temuan yang Dapat Dijelaskan` agar heuristik tidak disalahartikan sebagai bukti final.
