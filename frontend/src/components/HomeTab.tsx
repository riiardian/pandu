"use client";

import React, { useState, useEffect } from "react";
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

const ACRONYM_TEXT = "Protective Analysis & Navigation for Digital Users";

function TypewriterAcronym() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting && text === ACRONYM_TEXT) {
      // Pause 4.5 seconds at full string
      timer = setTimeout(() => setIsDeleting(true), 4500);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setTypingSpeed(60);
    } else {
      timer = setTimeout(() => {
        const next = isDeleting
          ? ACRONYM_TEXT.substring(0, text.length - 1)
          : ACRONYM_TEXT.substring(0, text.length + 1);
        setText(next);
        setTypingSpeed(isDeleting ? 25 : 60);
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, typingSpeed]);

  return (
    <div className="inline-flex items-center gap-1 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-blue-400">
      <span>{text}</span>
      <span className="inline-block w-[2px] h-[1.1em] bg-blue-500 animate-pulse ml-0.5" />
    </div>
  );
}

export default function HomeTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 sm:space-y-6 pt-2">
        {/* Typewriter Acronym Header */}
        <div className="space-y-2">
          <div className="min-h-[26px] flex items-center justify-center">
            <TypewriterAcronym />
          </div>

          {/* Indonesian Translation Subtitle */}
          <p className="text-xs sm:text-sm font-medium text-slate-300">
            Arti: <span className="text-white font-semibold">Analisis Protektif &amp; Navigasi bagi Pengguna Ruang Digital</span>
          </p>
        </div>

        <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-snug max-w-2xl mx-auto">
          Ketika Rekayasa Sosial Mengaburkan Fakta, <span className="text-blue-500">PANDU</span> Menjadi Navigasi Anda.
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
          Platform navigasi pertahanan digital untuk generasi muda Indonesia. 
          Pembedah pesan manipulatif secara transparan, simulator pengambilan keputusan siber, 
          dan generator langkah pemulihan hukum saat menjadi target penipuan online.
        </p>

        {/* CTA Buttons in Pure Biru, Hitam, Putih */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/xray"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-950/50"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Mulai Bedah Pesan (X-Ray)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/simulasi"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#16171b]/95 backdrop-blur-md px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#202127] hover:border-white/25 transition-colors shadow-sm"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>Uji di Arena Simulasi</span>
          </Link>
        </div>
      </section>

      {/* 3 Core Modules (Matte Charcoal Cards over Gemini Blue Aura) */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tiga Modul Utama
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module 1: X-Ray */}
          <Link
            href="/xray"
            className="group rounded-xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202228] text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Search className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-white">
                Deception X-Ray
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bedah pesan teks dan tautan mencurigakan berbasis aturan heuristik transparan. Memetakan indikator manipulasi dan forensik domain tanpa menyimpan data pribadi.
              </p>
            </div>
            <div className="pt-4 mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
              <span>Buka X-Ray</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Module 2: Simulasi */}
          <Link
            href="/simulasi"
            className="group rounded-xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202228] text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-white">
                The Deception Arena
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulator percakapan interaktif untuk melatih ketahanan menghadapi skenario penipuan lokal seperti loker freelance, kurir paket .APK, dan impersonasi kerabat.
              </p>
            </div>
            <div className="pt-4 mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
              <span>Buka Simulasi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Module 3: Dossier */}
          <Link
            href="/aksi"
            className="group rounded-xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202228] text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-white">
                First-Aid Dossier
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Panduan darurat pertolongan pertama dan generator draf laporan resmi siap kirim ke Komdigi, CekRekening.id, dan Bareskrim Polri dalam satu klik.
              </p>
            </div>
            <div className="pt-4 mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
              <span>Buka Pusat Aksi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Safety & Integrity Standards (Clean Matte Charcoal Card) */}
      <section className="rounded-xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Standar Privasi &amp; Keamanan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Nol Pengumpulan Data</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tidak pernah meminta atau menyimpan KTP, PIN, kata sandi, atau nomor rekening asli. Seluruh analisis berjalan lokal.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Lock className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Simulasi Terkendali</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Arena simulasi tidak mendistribusikan malware atau link berbahaya nyata. Seluruh kontak dan entitas adalah fiktif.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldAlert className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Deteksi Objektif</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Sistem menyajikan indikator peringatan teknis berbasis bukti secara transparan tanpa klaim palsu 100% aman.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
