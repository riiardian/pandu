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
- **Pembersihan Total Data Dummy & Prinsip Anti-Overclaim**:
  - Seluruh data dummy, akun rekaan, dan chip sampel palsu di Pusat Laporan & Daftar Hitam dihapus total; registri hanya memuat aduan riil masyarakat.
  - Audit menyeluruh di 6 menu Radar Forensik untuk mengeliminasi kesimpulan sepihak:
    - Pesan wajar mendapatkan skor 0% (TIDAK DITEMUKAN POLA MANIPULASI).
    - Tautan bersih seperti `paysaku.site` diaudit postur keamanannya (Grade A, HSTS, proteksi clickjacking) dan diverifikasi 0% risiko tanpa vonis TLD sepihak.
    - Nomor telepon dan rekening bersih mendapatkan skor 0% (BERSIH) tanpa penalti buatan.
    - Berkas/gambar valid didekode secara teknis tanpa klaim malware sepihak.
- **Rebranding Presisi: Investigasi Ancaman Digital**:
  - Menyelaraskan seluruh penyebutan fitur lama `Radar Forensik Siber` menjadi **Investigasi Ancaman Digital** di seluruh antarmuka:
    - Header modul `/xray`: `Investigasi Ancaman Digital` dengan subjudul praktisi: *"Verifikasi nomor kontak, rekening bank, tautan web, email, dan berkas mencurigakan berbasis data intelijen terbuka dan analisis rekayasa sosial."*
    - Menu Navigasi Global (`Header.tsx`): `Investigasi Ancaman`.
    - Kartu Modul Beranda (`HomeTab.tsx`): `Investigasi Ancaman Digital`.
    - Metadata Dokumen & Tab Browser (`page.tsx`): `Investigasi Ancaman Digital — PANDU`.
- **Penyempurnaan Label Tombol Aksi Taktis (Zero AI-Fluff)**:
  - Mengganti teks tombol yang kaku dan panjang (`Mulai Analisis Forensik`) menjadi label aksi langsung yang dinamis (*target-aware*) dan punchy:
    - Tab No. Telepon: `Periksa Nomor`
    - Tab Rekening Bank: `Periksa Rekening`
    - Tab Tautan Web: `Periksa Tautan`
    - Tab Pesan Chat: `Periksa Pesan`
    - Tab Alamat Email: `Periksa Email`
    - Tab Berkas: `Periksa Berkas`
    - Status loading: `Memeriksa...` (menggantikan `Membedah Indikator Bahaya...`).
- **Mesin Rekayasa Sosial & Taksonomi Modus Penipuan Digital Komprehensif**:
  - Membedah pola manipulasi emosi (Cognitive Bias) multi-vektor:
    - *Fear / Panic Exploit* (+25): Eksploitasi rasa takut dan kepanikan nyawa (kecelakaan, kritis di RS, ancaman penjara/polisi).
    - *Financial Coercion* (+20): Desakan transaksi finansial kilat (biaya administrasi darurat, uang muka, transfer ke rekening).
    - *Credential Harvesting* (+25): Pancingan OTP, PIN ATM, CVV, password, dan foto selfie KTP.
    - *Urgency Exploit* (+15): Ketergesa-gesaan semu membatasi waktu berpikir logis.
    - *Authority Bias* (+15): Pencatutan instansi RS/UGD, kepolisian, kejaksaan, dan perbankan.
  - Implementasi detektor taksonomi kejahatan rekayasa sosial Indonesia:
    - Modus Darurat Medis / Kecelakaan Keluarga Palsu (Medical Emergency Extortion) -> deteksi instan skor 95-100% Kritis.
    - Modus Pemerasan Aparat Penegak Hukum / Kasus Narkoba / Tilang Gadungan.
    - Modus Phishing Perubahan Tarif Bank / Pembajakan M-Banking.
    - Modus Teror Pinjol / Ancaman Sebar Data Pribadi & Foto KTP (Doxing).
    - Modus Sniffer APK Kurir / Undangan Nikah / Tilang ETLE.
    - Modus Loker Freelance / Misi Like Video & Follow Toko (Task Scam).
    - Modus Hadiah / Undian Palsu / Biaya Tebusan Admin di Muka.
    - Modus Impersonasi Kerabat Ganti Nomor HP Pinjam Uang.
    - Deteksi Korelasi Triad Rekayasa Sosial (Fear + Urgency + Coercion) yang otomatis memicu peringatan merah kritis.
- **Jarak & Proporsi Area Upload Berkas**:
  - Menambahkan jarak pemisah tegas (`gap-3 sm:gap-4`) antara teks berkas di kiri dan tombol `Pilih File` di kanan.
  - Memperpendek teks instruksi menjadi `Unggah APK, gambar, atau dokumen` agar tidak terpotong kaku atau bertumpuk dengan tombol di layar HP.
- **Pembersihan Visual Icon Upload Berkas**:
  - Menghapus kotak latar belakang (`bg-blue-950/60 border border-blue-500/30`) pada ikon upload di tab Berkas / APK.
  - Ikon panah upload kini tampil bersih dan menyatu langsung dengan teks tanpa bingkai kotak.
- **Cakupan Nomor Telepon Global & Pembersih UI Email**:
  - Menghapus simbol `@` yang berlebih pada input email sehingga hanya menyisakan ikon amplop yang bersih dan minimalis.
  - Mengubah prefix nomor telepon menjadi pemilih kode negara global interaktif (OSINT Industries style):
    - Mendukung katalog negara global lengkap dengan bendera dan kode panggil (+62 Indonesia, +60 Malaysia, +65 Singapura, +855 Kamboja, +95 Myanmar, +1 AS, +44 UK, +234 Nigeria, dll).
    - Dilengkapi pencarian nama negara atau kode panggil secara instan.
    - Backend Go (`AnalyzePhone`) diperbarui untuk mengenali operator internasional dan negara asal nomor secara otomatis.
- **UI Radar Forensik Presisi (Gaya OSINT Industries Search Dock)**:
  - Mengubah pemilih target 6 kotak kaku menjadi deretan dock pill horizontal dinamis persis referensi OSINT Industries:
    - Target tidak aktif hanya menampilkan ikon minimalis (Chat, Web, Telepon, Rekening, Email, Berkas).
    - Saat diklik, tab yang aktif otomatis bertransisi melebar memunculkan nama target (`Pesan Chat`, `Rekening Bank`, dll).
  - Mengintegrasikan kolom input menjadi satu kesatuan (*unified continuous input container*):
    - Rekening Bank: Menyatukan pemilih bank sebagai tombol prefix di sisi kiri (`[ 💳 BCA ▾ ]`) dengan dropdown popover ringkas yang menempel langsung di bawahnya, bersanding dengan kolom nomor rekening.
    - No. Telepon: Prefix kode negara bendera `[ 🇮🇩 +62 ]` menyatu di dalam baris input.
    - Tautan Web: Prefix protokol `[ 🌐 https:// ]` menyatu di dalam baris input.
    - Alamat Email: Prefix simbol `[ ✉️ @ ]` menyatu di dalam baris input.
  - Memangkas ruang vertikal secara drastis, menghilangkan popup modal, dan memberikan nuansa perkakas investigasi intelijen yang rapi dan profesional.
- **UI Pemilih Bank & E-Wallet Ergonomis (Zero Modal, 1-Tap FinTech Grid)**:
  - Menghapus modal pop-up berlebih, search bar berlebihan, dan filter angka yang kaku.
  - Menggantinya dengan grid tombol bank & e-wallet langsung di halaman (1-tap):
    - Baris Bank Nasional: BCA, BRI, Mandiri, BNI, BSI, CIMB, Danamon, Permata, BTN, Jago, SeaBank.
    - Baris Dompet Digital: DANA, GoPay, OVO, ShopeePay.
  - Tombol aktif menyala biru solid, placeholder input nomor rekening sinkron otomatis mengikuti bank terpilih.
- **Intelijen Terbuka Global & Berkas Nyata**:
  - StopForumSpam (Global Email Spam Network) via hash MD5 & DNS MX query.
  - RDAP registry domain & urlscan.io public search untuk investigasi URL/domain.
  - Upload berkas nyata (multipart hingga 5 MB) dengan hashing SHA-256/MD5 asli dari byte berkas, korelasi CIRCL hashlookup, dan inspeksi permission AndroidManifest.xml pada paket .APK.
- **Audit Integritas Sumber Eksternal — Scanner Tanpa Klaim Asal**:
  - Menghapus Pesan Chat, Nomor Telepon, dan Rekening Bank dari UI Investigasi Ancaman Digital serta menonaktifkan route pemindaiannya; ketiganya belum memiliki basis data eksternal terstruktur yang bisa dikueri PANDU secara konsisten.
  - Menyisakan Tautan Web, Alamat Email, dan Berkas/APK karena tersedia sumber terstruktur: RDAP + urlscan.io/OpenPhish, StopForumSpam + DNS MX, dan CIRCL hashlookup.
  - Riwayat urlscan biasa tetap dianggap konteks netral; hanya entri urlscan yang menyebut sumber feed OpenPhish dinaikkan menjadi kecocokan ancaman.
  - Nomor/rekening yang dilaporkan masyarakat tetap dikelola terpisah di Pusat Laporan PANDU dan tidak disamarkan sebagai intelijen internet eksternal.
  - Menambahkan regression test agar route `/scan/text`, `/scan/phone`, dan `/scan/bank` tetap tidak terekspos sampai sumber eksternal yang sah tersedia.
- **Kalibrasi Skor URL — Pemisahan Heuristik dan Bukti Ancaman**:
  - Memperbaiki false-positive `autogopay.site` yang sebelumnya memperoleh 85% hanya dari substring brand (+55) dan ekstensi `.site` (+30), meski tidak ada kecocokan urlscan/OpenPhish maupun jejak laporan publik.
  - Kemiripan nama brand kini berbobot heuristik 25 dan TLD alternatif hanya konteks tambahan 5; keduanya tidak boleh menghasilkan status `phishing tinggi` tanpa bukti ancaman terstruktur.
  - Status bahaya tinggi kini memerlukan provenance feed ancaman seperti OpenPhish. Grade A security headers diperlakukan sebagai konteks hardening teknis, bukan bukti situs resmi dan bukan penghapus bukti ancaman.
  - Menambahkan regression test untuk pemisahan Grade A, heuristik brand, dan bukti reputasi terstruktur.
