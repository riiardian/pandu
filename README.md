# 🧭 PANDU — Guardians of the Digital Space
### *Navigating Digital Deception with Cognitive Profiling, Adversarial Sandbox & Incident Defense*

[![Live Demo](https://img.shields.io/badge/Live_Deployment-pandu.web.id-orange?style=for-the-badge&logo=vercel)](https://pandu.web.id)
[![Go Backend](https://img.shields.io/badge/Go_Fiber-v2.52-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org)
[![Next.js Frontend](https://img.shields.io/badge/Next.js-16_Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Kompetisi:** Web Development Competition MIT-WEEK 2026 (Universitas Mulawarman)  
**Studi Kasus:** The Trust Trap: Navigating Digital Deception  
**Tim Peserta:** 404Forbidden (Kode Tim: `MIT-002`)  
**Ketua Tim:** Rio Ardian Pratama — Informatika, Telkom University  

---

## 📌 1. Latar Belakang & Masalah
Setiap hari, jutaan generasi muda Indonesia terpapar jebakan digital (*the trust trap*) yang mengeksploitasi celah psikologis manusia (*Social Engineering*), bukan sekadar celah teknis:
1. **Loker Freelance Like Video**: Umpan tugas ringan (like YouTube/TikTok komisi 30rb) yang berujung pemerasan deposit tugas VIP hingga puluhan juta rupiah.
2. **Malware Sniffer Berkedok Resi / Surat Tilang (.APK)**: File aplikasi berbahaya yang menyamar sebagai foto paket kurir ekspedisi atau surat konfirmasi ETLE untuk menyadap SMS OTP m-banking.
3. **Impersonasi Akun Kerabat & Teman**: Pembajakan identitas teman dekat yang mendadak mengaku berganti nomor HP dan meminjam uang darurat di pom bensin.
4. **Phishing Bantuan Sosial & Giveaway**: Domain murah/gratisan (*.xyz, *.site*) yang mencatut instansi perbankan dan BUMN.

Masalah utamanya: Korban bertindak impulsif karena panik (*urgency*), tergiur uang instan (*greed*), atau sungkan (*guilt*). Ketika sadar menjadi target, mereka bingung langkah pertolongan pertama apa yang harus diambil.

---

## 💡 2. Solusi: Arsitektur 3 Pilar PANDU

PANDU dibangun dengan arsitektur terpisah (*Decoupled Architecture*) menggabungkan performa tinggi backend **Go Fiber** dengan antarmuka interaktif **Next.js**:

### 🔍 Pilar 1: Recognize — Deception X-Ray Scanner
Pembedah pesan dan tautan digital berbasis aturan heuristik transparan (*explainable rules*):
- **Cognitive Bias Profiler**: Mengurai kalimat ke dalam vektor eksploitasi psikologis (*Urgency*, *Authority*, *Greed*, *Scarcity*, *Guilt/Fear*).
- **Domain Birth & Typosquatting Analyzer**: Memeriksa umur domain dan mendeteksi pencatutan 13 brand perbankan/fintech besar Indonesia (BCA, BRI, Mandiri, BNI, DANA, GoPay, Shopee, PLN, Telkomsel) pada domain palsu.
- **Cross-Domain Redirect Unmasker**: Melacak ke mana tautan pendek (*bit.ly, s.id*) sebenarnya mengarahkan korban tanpa memicu celah SSRF.

### 🎮 Pilar 2: Learn — Arena Simulasi & Pengambilan Keputusan
Simulator percakapan interaktif (*Chat Mockup Sandbox*) yang menempatkan pengguna berhadapan langsung dengan bot penipu:
- Pengguna berlatih mengambil keputusan dan *counter-manipulation* pada 3 skenario lokal Indonesia paling marak.
- Setiap pilihan pengguna langsung memicu umpan balik taktis (*Tactical Feedback*) dan mempengaruhi skor **Imunitas Kognitif Digital (0-100%)**.

### 🛡️ Pilar 3: Act — Pusat Aksi & Draf Laporan Forensik
Pemberdayaan korban menjadi *Guardian* aktif:
- **Emergency First-Aid Checklist**: Panduan isolasi akun (mode pesawat, blokir m-banking, cabut SIM, revoke sessions).
- **1-Click Official Complaint Generator**: Menghasilkan draf laporan resmi berstandar hukum yang siap disalin ke:
  - Portal AduanKonten.id (Kementerian Komunikasi dan Digital).
  - Portal CekRekening.id & AduanNomor.id (Pemblokiran Rekening Bank & Nomor Telepon Penipu).
  - Patroli Siber Polri (Dittipidsiber Bareskrim).
- **Family WhatsApp Warning Card**: Format pesan peringatan ringkas yang siap dibagikan ke grup WhatsApp keluarga.

---

## 🏗️ 3. Arsitektur Teknis & Spesifikasi Sistem

```text
[ Client Web Browser ]
         │
         ▼  (HTTPS / TLS 1.3)
   [ Nginx Reverse Proxy ] (pandu.web.id)
    ├── /          ──> [ Next.js Frontend ] (Port 3002) - React 19, Tailwind CSS v4, Lucide
    └── /api/v1/   ──> [ Go Fiber API ]     (Port 8082) - Heuristic Scanner, Sandbox, Dossier
```

### Keamanan & Privasi (Zero-Knowledge Invariant)
Sesuai batasan petunjuk teknis juknis kompetisi:
- **Zero Sensitive Data Collection**: Aplikasi tidak mewajibkan atau menyimpan nomor KTP, kata sandi asli, atau data rahasia riil.
- **Safe Sandboxing**: Seluruh skenario latihan menggunakan entitas dan nomor kontak fiktif yang aman tanpa menyebarkan malware nyata.
- **Explainable Metrics**: Sistem jujur menyatakan batasannya dan tidak pernah mengklaim deteksi 100% sempurna.

---

## 🚀 4. Cara Menjalankan Secara Lokal (Local Development)

### Prasyarat
- Go 1.24+
- Node.js 20+ & npm

### Menjalankan Backend (Go Fiber)
```bash
cd backend
go run cmd/server/main.go
# Backend berjalan di http://127.0.0.1:8082
```

### Menjalankan Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Frontend berjalan di http://localhost:3000
```

### Menjalankan Pengujian Unit Test
```bash
cd backend
go test -v ./...
# 100% PASS (Scanner, Sandbox, Dossier)
```
