# PANDU — Guardians of the Digital Space
## Navigation & Incident Defense Against Digital Deception

Project: Pandu (https://pandu.web.id)
Competition: Web Development Competition MIT-WEEK 2026 (Universitas Mulawarman)
Team: 404Forbidden (Kode Tim: MIT-002)
Author / Team Lead: Rio Ardian Pratama (Telkom University)

---

## 1. Zero-Trash Policy & Protocol
- **Zero-Trash Policy**: Dilarang mengotori repository dengan file coba-coba, binary test, atau dump log.
- **Git Commit & Push**: Setiap selesai merubah kode, wajib test build lokal di server, git commit dengan pesan yang deskriptif, dan git push origin main.
- **Progress Tracking**: Wajib membaca dan memperbarui `PROJECT_PROGRESS.md` di root folder setiap kali menyelesaikan task atau fitur baru.
- **Supervisor & PM2**: Backend dikelola via Supervisor (`pandu-backend` on port 8082), Frontend dikelola via PM2 (`pandu-frontend` on port 3002).

## 2. Tech Stack Standard (Decoupled Architecture)
- **Backend**: Go 1.24+ (Fiber v2 framework) di folder `backend/`
  - High performance, memory footprint < 25 MB, zero-garbage-collector latency.
  - Explainable heuristic engine, domain analyzer, cognitive bias profiler, chat simulation backend, and forensic report generator.
- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide React) di folder `frontend/`
  - Clean & Flat design, mobile-first, no AI-slop, no excessive drop shadows, no glassmorphism.
- **Reverse Proxy**: Nginx dengan SSL (TLS 1.2 / 1.3) mengarah ke `pandu.web.id`.

## 3. Core Functional Pillars
1. **Recognize (Pembedah Pesan & Link / X-Ray Scanner)**:
   - Heuristic & Explainable Rule Engine untuk membedah red flags pesan penipuan dan link phishing.
   - Deteksi typosquatting, redirect unmasker, dan cognitive bias classification (Authority, Urgency, Greed, Fear, Scarcity).
2. **Learn (Arena Simulasi Interaktif / Adversarial Sandbox)**:
   - Simulasi chat interaktif (gaya WhatsApp/DM) menghadapi 3+ skenario lokal Indonesia (Loker Freelance Like Video, Kurir Paket Surat Tilang APK, Impersonasi Kerabat Pinjam Uang).
   - Pengguna berlatih mengambil keputusan dan counter-manipulation di lingkungan sandbox aman.
3. **Act (Digital First-Aid & 1-Click Forensic Dossier)**:
   - Checklist tanggap darurat saat terlanjur menjadi target/korban.
   - Generator draf laporan aduan resmi terstandarisasi untuk Komdigi (AduanKonten), OJK/Bank (CekRekening), Patroli Siber, dan Hosting Abuse.
   - Family Alert Card generator untuk memperingatkan orang tua dan kerabat.
