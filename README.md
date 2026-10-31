# 🧭 PANDU — Guardians of the Digital Space
### *Navigating Digital Deception with Cognitive Profiling, Adversarial Sandbox & Incident Defense*

[![Live Deployment](https://img.shields.io/badge/Live_Deployment-pandu.web.id-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://pandu.web.id)
[![Go Backend](https://img.shields.io/badge/Go_Fiber-v2.52-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org)
[![Next.js Frontend](https://img.shields.io/badge/Next.js-16_Turbopack-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Engine-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Kompetisi:** Web Development Competition MIT-WEEK 2026 (Universitas Mulawarman)  
**Tema Besar:** *“Guardians of the Digital Space – Empowering Today’s Generation Toward a Safer Cyber Ecosystem”*  
**Studi Kasus:** The Trust Trap: Navigating Digital Deception  
**Tim Peserta:** 404Forbidden (Kode Tim: `MIT-002`)  
**Ketua Tim:** Rio Ardian Pratama — Informatika, Telkom University  

---

## 📌 1. Latar Belakang & Masalah (*The Trust Trap*)

Di era digital saat ini, generasi muda Indonesia setiap hari berhadapan dengan jebakan manipulasi psikologis (*Social Engineering*) yang kian terorganisir dan mengeksploitasi kepolosan manusia:

1. **Malware Berkedok Resi / Surat Tilang (.APK)**: File berbahaya yang menyamar sebagai foto paket kurir ekspedisi atau dokumen konfirmasi ETLE untuk menyadap izin akses SMS dan membajak kode OTP perbankan.
2. **Kenaikan Tarif Perbankan Palsu**: Modus pengumuman perubahan biaya administrasi bank (misal Rp 150.000/bulan) yang memanfaatkan kepanikan nasabah agar mengklik tautan phishing untuk konfirmasi pembatalan.
3. **Loker Freelance Like Video / E-Commerce**: Umpan tugas mudah (like video YouTube/TikTok dengan komisi Rp 30.000) yang berujung jebakan deposit tugas VIP bertingkat hingga tabungan korban terkuras habis.
4. **Pembajakan Akun Kerabat & Pinjaman Darurat**: Penyamaran identitas kontak teman dekat yang mendadak mengaku berganti nomor telepon dan meminjam dana darurat dengan narasi mendesak.
5. **Domain Phishing Tiruan Brand**: Pemanfaatan domain tiruan murah (.xyz, .site, domain bertanda hubung berulang) yang mencatut institusi resmi dan e-wallet.

**Akar Masalah:**  
Korban kerap bertindak impulsif karena panik (*urgency*), tergiur uang kilat (*greed*), atau sungkan (*guilt*). Ketika menyadari adanya kejanggalan, mereka tidak memiliki alat verifikasi yang objektif serta bingung langkah mitigasi darurat apa yang harus segera diambil.

---

## 💡 2. Solusi: Arsitektur 3 Pilar PANDU

PANDU dibangun dengan arsitektur terpisah (*Decoupled Architecture*) berperforma tinggi, memadukan backend native **Go Fiber** dengan antarmuka modern **Next.js 16 (Turbopack)**:

```text
[ Pengguna Web / Mobile Browser ]
                │
                ▼  (HTTPS / TLS 1.3)
      [ Nginx Reverse Proxy ] (pandu.web.id)
       ├── /api/v1/ ──> [ Go Fiber Backend Engine ] (Port 8082)
       │                 ├── Threat Registry & Blacklist (PostgreSQL 16)
       │                 ├── Heuristic & Cognitive Bias Analyzer
       │                 ├── APK Dex/Manifest Parser & YARA Engine
       │                 └── Isolated Evidence Store (SHA-256 Hashed)
       └── /        ──> [ Next.js Frontend Client ] (Port 3002)
                         ├── Investigasi Ancaman Digital (/investigasi)
                         ├── Simulasi Modus Penipuan (/simulasi)
                         ├── Formulir Pelaporan & Darurat (/lapor)
                         └── Backoffice Verifikasi Forensik (/ops-intel-7f89b)
```

---

### 🔍 Pilar 1: Recognize — Investigasi Ancaman Digital (`/investigasi`)
Mesin audit ancaman cerdas multi-vektor dengan penjelasan transparan (*Explainable Heuristics*):
- **Pesan Chat**: *Cognitive Bias Profiler* yang membedah narasi manipulasi (desakan waktu, iming-iming hadiah, penyamaran instansi) dan menerbitkan skor risiko 0–100%.
- **Tautan Web**: Merayapi konten HTML secara pasif, memeriksa umur domain via RDAP, mendeteksi typosquatting 13 brand perbankan/fintech nasional, mendeteksi konten judi online ilegal, serta mencocokkan feed phishing eksternal (CIRCL & urlscan.io).
- **Nomor Telepon & Rekening Bank**: Penelusuran jejak digital terbuka (*Live Web Footprint OSINT*) dipadukan dengan pencocokan basis data registri aduan publik PANDU.
- **Alamat Email**: Validasi sintaks, keberadaan server MX aktif, dan reputasi anti-spam.
- **Berkas / APK / Foto**: Inspeksi struktur file ZIP/APK Android (permissions `READ_SMS`/`RECEIVE_SMS`, deteksi *smali hook*, pencocokan YARA rule perbankan) serta analisis visual AI Multimodal untuk mendeteksi rekayasa struk transfer atau poster loker fiktif.

---

### 🎮 Pilar 2: Learn — Simulasi Modus Penipuan (`/simulasi`)
Arena simulasi interaktif (*Adversarial Chat Sandbox*) berbasis kasus kejahatan digital nyata di Indonesia:
- **5 Skenario Interaktif**:
  1. *Kurir Paket Ekspedisi (Sniffer APK)*
  2. *Surat Konfirmasi Tilang ETLE (.APK)*
  3. *Phishing Kenaikan Tarif Bank BCA Rp 150.000*
  4. *Loker Freelance Komisi Bertahap VIP*
  5. *Pinjaman Dana Darurat Teman Hijack*
- **Sistem Dialog 4 Babak**: Pengguna berhadapan langsung dengan bot penipu dan berlatih mengambil keputusan pertahanan.
- **Fisher-Yates Shuffle**: Urutan pilihan respon diacak secara adil baik di backend Go (`rand.Shuffle`) maupun frontend React untuk menghilangkan bias posisi tombol.
- **Indeks Proteksi Diri (0–100)**: Umpan balik taktis langsung (*Tactical Feedback*) yang mengedukasi batas bahaya setiap tindakan tanpa nada menggurui.

---

### 🛡️ Pilar 3: Act — Formulir Pelaporan & Tanggap Darurat (`/lapor`)
Pemberdayaan korban dan masyarakat untuk menjadi *Guardian* aktif:
- **Pelaporan Terverifikasi Bukti Otentik**: Formulir aduan masyarakat berstandar hukum UU ITE yang mewajibkan lampiran bukti fisik (tangkapan layar chat/mutasi transfer bank maks 10 MB) dengan pencatatan hash kriptografi SHA-256.
- **Checklist Isolasi Darurat 5 Menit**: Panduan praktis pertolongan pertama saat terlanjur menjadi korban (langkah putus internet, blokir m-banking, pencabutan izin SMS, dan hotline resmi perbankan/e-wallet nasional).
- **Modul Edukasi Keluarga**: Kartu edukasi interaktif untuk membentengi kerabat dan orang tua dari rekayasa sosial siber.

---

### 🔐 Pilar 4: Backoffice Forensik Rahasia (`/ops-intel-7f89b`)
Panel administratif terisolasi untuk verifikasi aduan masyarakat sebelum dipublikasikan:
- **Zero Reconnaissance Footprint**: Rute umum (`/admin`, `/panel`, `/dashboard`) dikunci menghasilkan status HTTP `404 Not Found`. Akses hanya melalui kunci rahasia `/ops-intel-7f89b`.
- **Autentikasi Berlapis**: Enkripsi kata sandi kuat via *bcrypt* (cost 12), proteksi *brute-force rate limiter* (5 kali gagal mengunci IP selama 15 menit), token sesi HMAC SHA-256 (24 jam), dan mitigasi timing attack via `subtle.ConstantTimeCompare`.
- **Verifikasi & Auto-Sync**: Peninjauan bukti fisik terisolasi (izin direktori `0700` dan file `0600`), pratinjau dokumen, dan sinkronisasi instan entitas terbukti ke basis data `threat_blacklist` publik.

---

## 🛡️ 3. Rekayasa Keamanan & Pengujian (*Security Hardening*)

Sistem PANDU telah melalui pengujian keamanan menyeluruh (*Attack & Defense Suite*) dengan hasil **26/26 Pemeriksaan Lolos (100% Passed)**:

| Aspek Keamanan | Implementasi & Mekanisme Pertahanan | Status Audit |
| :--- | :--- | :---: |
| **Autentikasi & Brute Force** | bcrypt cost 12, rate limit 5x lockout 15 menit, HMAC SHA-256, constant-time compare | **PASSED** |
| **Proteksi SSRF** | Pemblokiran otomatis IP loopback 127.0.0.1, metadata cloud 169.254.169.254, subnet privat (10/8, 192.168/16, 172.16/12), dan non-HTTP scheme | **PASSED** |
| **Keamanan Unggah Berkas** | Allowlist ekstensi ketat (.png, .jpg, .webp, .pdf), verifikasi magic bytes header, hak akses 0700/0600, anti-path traversal | **PASSED** |
| **Ketahanan DoS & Input Cap** | Batas panjang input ketat (teks 10.000 chr, URL 2.048 chr, nomor/rekening 64 chr), body limit Fiber 15 MB | **PASSED** |
| **Proteksi SQL Injection** | Seluruh kueri basis data PostgreSQL menggunakan parameterized placeholders (`$1`, `$2`, dll.) | **PASSED** |
| **Nginx Reverse Proxy** | Blokir akses file tersembunyi (`.env`, `.git`), drop probe otomatis (`wp-admin`), HSTS preload, nosniff, DENY frame | **PASSED** |

---

## 💻 4. Panduan Menjalankan Secara Lokal (*Local Setup*)

### Prasyarat
- **Go**: Versi 1.22 atau lebih baru
- **Node.js**: Versi 20.x atau lebih baru & npm
- **PostgreSQL**: Versi 15 atau 16
- **Git**

### 1. Kloning Repositori
```bash
git clone https://github.com/riiardian/pandu.git
cd pandu
```

### 2. Konfigurasi Basis Data PostgreSQL
Buat basis data baru di PostgreSQL:
```sql
CREATE DATABASE pandu_db;
CREATE USER pandu_user WITH ENCRYPTED PASSWORD 'pandu_secure_pass_2026';
GRANT ALL PRIVILEGES ON DATABASE pandu_db TO pandu_user;
```

### 3. Menjalankan Backend (Go Fiber)
```bash
cd backend
export DATABASE_URL="postgres://pandu_user:pandu_secure_pass_2026@localhost:5432/pandu_db?sslmode=disable"
go run cmd/server/main.go
# Backend aktif pada http://127.0.0.1:8082
```

Menjalankan Unit Test Backend:
```bash
go test -v ./...
# 100% PASS (Scanner, Threat Intel, Sandbox, Dossier)
```

### 4. Menjalankan Frontend (Next.js)
```bash
cd ../frontend
npm install
npm run dev
# Frontend aktif pada http://localhost:3000
```

---

## 👥 5. Tim Pengembang (404Forbidden)

- **Ketua Tim & Lead Developer**: Rio Ardian Pratama (`@riiardian`) — S1 Informatika, Telkom University
- **Kode Peserta**: `MIT-002`
- **Tautan Live Deployment**: [https://pandu.web.id](https://pandu.web.id)
- **Repositori Resmi**: [https://github.com/riiardian/pandu](https://github.com/riiardian/pandu)

---

<sub>© 2026 Tim 404Forbidden. Dikembangkan untuk Web Development Competition MIT-WEEK 2026.</sub>
