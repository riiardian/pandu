"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  BookOpen,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Lock,
  Layers,
} from "lucide-react";

export default function HomeTab() {
  return (
    <div className="space-y-10 sm:space-y-14 py-2 sm:py-4">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">
          <span>Studi Kasus: The Trust Trap · MIT-WEEK 2026</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 leading-tight">
          Ketika Rekayasa Sosial Mengaburkan Fakta,{" "}
          <span className="text-orange-600">PANDU</span> Menjadi Navigasi Anda.
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto">
          Platform navigasi pertahanan digital untuk generasi muda Indonesia. 
          Pembedah pesan manipulatif secara transparan, simulator pengambilan keputusan siber, 
          dan generator langkah pemulihan hukum saat menjadi target penipuan online.
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/xray"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700 transition-colors"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Mulai Bedah Pesan (X-Ray)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/simulasi"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <BookOpen className="h-4 w-4" />
            <span>Uji di Arena Simulasi</span>
          </Link>
        </div>
      </section>

      {/* 3 Pillars Overview */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
            Arsitektur Solusi 3 Pilar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Menjawab siklus penipuan digital secara holistik: Mengenali, Melatih, dan Menindak.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-all">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Pilar 1 · Recognize
                </span>
                <h3 className="text-base font-bold text-zinc-900">
                  Deception X-Ray Scanner
                </h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Mesin aturan heuristik transparan yang membedah pesan teks dan tautan. 
                Menganalisis manipulasi psikologis (FOMO, kepanikan waktu, iming-iming komisi) 
                dan forensik domain tanpa mengirimkan data ke pihak ketiga.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-zinc-100">
              <Link
                href="/xray"
                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                <span>Buka X-Ray Scanner</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-all">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Pilar 2 · Learn
                </span>
                <h3 className="text-base font-bold text-zinc-900">
                  The Deception Arena
                </h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Simulator percakapan interaktif bergaya WhatsApp untuk menguji ketahanan mental. 
                Hadapi skenario nyata seperti jebakan loker freelance, kurir paket .APK, 
                dan impersonasi kerabat dalam lingkungan latihan yang aman.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-zinc-100">
              <Link
                href="/simulasi"
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Masuk Arena Simulasi</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-all">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Pilar 3 · Act
                </span>
                <h3 className="text-base font-bold text-zinc-900">
                  Incident First-Aid Dossier
                </h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Panduan aksi darurat pertolongan pertama dan generator berkas aduan resmi. 
                Susun draf laporan terstruktur siap kirim ke Komdigi (AduanKonten), 
                CekRekening.id, dan Bareskrim Polri dalam satu kali klik.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-zinc-100">
              <Link
                href="/aksi"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>Buka Pusat Aksi</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Anatomy of Digital Deception */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-7 shadow-sm space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Konteks Masalah di Indonesia
          </span>
          <h2 className="text-base sm:text-lg font-black text-zinc-900">
            Mengapa Jebakan Digital Menyasar Generasi Muda?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Pelaku kejahatan siber modern tidak lagi membobol firewall yang rumit. 
            Mereka memanfaatkan kelemahan psikologis manusia (*Social Engineering*) 
            lewat tiga vektor eksploitasi utama:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>Kepanikan Waktu (Urgency)</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Membuat tenggat waktu palsu (seperti resi kurir gagal kirim, surat tilang ETLE, atau rekening terblokir) 
              agar korban panik dan menuruti perintah tanpa verifikasi.
            </p>
          </div>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
              <Layers className="h-4 w-4 shrink-0" />
              <span>Umpan Keuntungan (Greed)</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Menawarkan pekerjaan sampingan instan bergaji tinggi (tugas like YouTube/Shopee) 
              sebelum akhirnya meminta deposit bertahap hingga puluhan juta rupiah.
            </p>
          </div>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Pencatutan Otoritas (Impersonation)</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Memakai nama instansi resmi, logo bank, atau mengaku sebagai teman dekat yang berganti nomor 
              untuk mematikan rasa curiga korban secara langsung.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Integrity Standards */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-900 text-white p-5 sm:p-7 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
            Prinsip Etika & Standar Teknis
          </span>
          <h2 className="text-base sm:text-lg font-black text-white">
            Komitmen Keamanan & Transparansi PANDU
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Dibangun dengan kepatuhan penuh terhadap batas etika siber dan regulasi perlindungan data pribadi (UU PDP):
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Nol Pengumpulan Data Sensitif</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Tidak pernah meminta nomor KTP, PIN, kata sandi asli, atau data rahasia riil. Seluruh proses analisis teks dilakukan secara lokal dan transparan.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Simulasi Aman Terkendali</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Arena simulasi tidak mendistribusikan malware nyata atau link berbahaya asli. Seluruh entitas dan nomor kontak adalah sampel fiktif untuk edukasi.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>Deteksi Heuristik Objektif</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Sistem tidak pernah mengklaim akurasi mutlak 100%. PANDU menyajikan temuan teknis berbasis bukti dan indikator peringatan yang dapat dipelajari.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
