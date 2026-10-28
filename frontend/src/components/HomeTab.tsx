"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  BookOpen,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Search,
} from "lucide-react";

export default function HomeTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 sm:space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950">
            PANDU
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-zinc-500">
            Protective Analysis &amp; Navigation for Digital Users
          </p>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold text-zinc-800 leading-snug max-w-2xl mx-auto">
          Ketika Rekayasa Sosial Mengaburkan Fakta, PANDU Menjadi Navigasi Anda.
        </h2>

        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl mx-auto">
          Platform navigasi pertahanan digital untuk generasi muda Indonesia. 
          Pembedah pesan manipulatif secara transparan, simulator pengambilan keputusan siber, 
          dan generator langkah pemulihan hukum saat menjadi target penipuan online.
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/xray"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors shadow-sm"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Mulai Bedah Pesan (X-Ray)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/simulasi"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
          >
            <BookOpen className="h-4 w-4 text-zinc-500" />
            <span>Uji di Arena Simulasi</span>
          </Link>
        </div>
      </section>

      {/* 3 Core Modules (Minimal, Clean, Monochrome Grid) */}
      <section className="space-y-4">
        <div className="border-b border-zinc-200 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Tiga Modul Utama
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module 1: X-Ray */}
          <Link
            href="/xray"
            className="group rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Search className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Deception X-Ray
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Bedah pesan teks dan tautan mencurigakan berbasis aturan heuristik transparan. Memetakan indikator manipulasi dan forensik domain tanpa menyimpan data pribadi.
              </p>
            </div>
            <div className="pt-4 mt-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors">
              <span>Buka X-Ray</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Module 2: Simulasi */}
          <Link
            href="/simulasi"
            className="group rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <BookOpen className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                The Deception Arena
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Simulator percakapan interaktif untuk melatih ketahanan menghadapi skenario penipuan lokal seperti loker freelance, kurir paket .APK, dan impersonasi kerabat.
              </p>
            </div>
            <div className="pt-4 mt-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors">
              <span>Buka Simulasi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Module 3: Dossier */}
          <Link
            href="/aksi"
            className="group rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                First-Aid Dossier
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Panduan darurat pertolongan pertama dan generator draf laporan resmi siap kirim ke Komdigi, CekRekening.id, dan Bareskrim Polri dalam satu klik.
              </p>
            </div>
            <div className="pt-4 mt-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors">
              <span>Buka Pusat Aksi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Safety & Integrity Standards (Clean, borderless list) */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Standar Privasi &amp; Keamanan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
              <ShieldCheck className="h-4 w-4 text-zinc-700 shrink-0" />
              <span>Nol Pengumpulan Data</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Tidak pernah meminta atau menyimpan KTP, PIN, kata sandi, atau nomor rekening asli. Seluruh analisis berjalan lokal.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
              <Lock className="h-4 w-4 text-zinc-700 shrink-0" />
              <span>Simulasi Terkendali</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Arena simulasi tidak mendistribusikan malware atau link berbahaya nyata. Seluruh kontak dan entitas adalah fiktif.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
              <ShieldAlert className="h-4 w-4 text-zinc-700 shrink-0" />
              <span>Deteksi Objektif</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Sistem menyajikan indikator peringatan teknis berbasis bukti secara transparan tanpa klaim palsu 100% aman.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
