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
- **Penelusuran Jejak Digital Terbuka (Live Web OSINT Footprint Crawler)**:
  - Mengintegrasikan mesin pencari jejak siber publik secara real-time (`QueryWebFootprint`) untuk nomor telepon, rekening bank, email, dan URL.
  - Menarik kutipan langsung (snippets), judul laporan, dan URL dari indeks forum publik, media, dan portal aduan jika entitas pernah dilaporkan.
  - Entitas bersih (seperti nomor pribadi yang tidak pernah dilaporkan) secara akurat menampilkan 0% risiko dan status bersih.
- **Basis Data Ancaman Komunitas (PANDU Threat Registry)**:
  - Mengaktifkan registri ancaman terverifikasi di PostgreSQL dengan indeks unik berbasis tipe (`type, clean_key`) untuk skenario lokal (Loker Like Video, Kurir APK, Rekening Penampung BCA/BRI, Phishing Perbankan).
- **Intelijen Terbuka Global & Berkas Nyata**:
  - StopForumSpam (Global Email Spam Network) via hash MD5 & DNS MX query.
  - RDAP registry domain & urlscan.io public search untuk investigasi URL/domain.
  - Upload berkas nyata (multipart hingga 5 MB) dengan hashing SHA-256/MD5 asli dari byte berkas, korelasi CIRCL hashlookup, dan inspeksi permission AndroidManifest.xml pada paket .APK.
