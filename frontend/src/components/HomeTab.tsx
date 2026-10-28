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
  AlertTriangle,
  BrainCircuit,
  Globe,
  Terminal,
} from "lucide-react";

const TYPEWRITER_PHRASES = [
  "Pesan Penipuan",
  "File Kurir .APK",
  "Tautan Phishing",
  "Loker Freelance",
  "Akun Rekening Bodong",
];

function TypewriterHeadline() {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(65);

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIdx % TYPEWRITER_PHRASES.length];
    let timer: NodeJS.Timeout;

    if (!isDeleting && text === currentPhrase) {
      // Pause 2.8 seconds on full phrase
      timer = setTimeout(() => setIsDeleting(true), 2800);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIdx((prev) => prev + 1);
      setTypingSpeed(65);
    } else {
      timer = setTimeout(() => {
        const next = isDeleting
          ? currentPhrase.substring(0, text.length - 1)
          : currentPhrase.substring(0, text.length + 1);
        setText(next);
        setTypingSpeed(isDeleting ? 30 : 65);
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIdx, typingSpeed]);

  return (
    <span className="text-blue-500 inline-flex items-center">
      <span>{text}</span>
      <span className="inline-block w-[3px] h-[0.9em] bg-blue-500 ml-1 animate-pulse" />
    </span>
  );
}

export default function HomeTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16 py-3 sm:py-6">
      {/* OSINT-Style Left-Aligned Hero Section */}
      <section className="text-left space-y-4 sm:space-y-5 max-w-2xl">
        {/* Acronym Badge & Tagline */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>PANDU · OSINT DEFENSE PLATFORM</span>
          </div>

          <p className="text-[11px] sm:text-xs font-mono font-semibold tracking-wide uppercase text-slate-400">
            Protective Analysis &amp; Navigation for Digital Users
          </p>
        </div>

        {/* Dynamic Typewriter Headline (OSINT Industries Pattern) */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
          Deteksi &amp; Bedah <br />
          <TypewriterHeadline />
        </h1>

        {/* Indonesian Translation Description */}
        <div className="space-y-1 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
          <p className="text-white font-medium">
            Analisis Protektif &amp; Navigasi bagi Pengguna Ruang Digital.
          </p>
          <p className="text-slate-400">
            Akurasi heuristik real-time. Membedah rekayasa sosial, manipulasi kognitif, dan forensik tautan digital tanpa menyimpan data pribadi Anda.
          </p>
        </div>

        {/* Left-Aligned Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/xray"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-950/50"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Mulai Bedah Pesan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/simulasi"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            <BookOpen className="h-4 w-4 text-blue-400" />
            <span>Arena Simulasi &gt;</span>
          </Link>
        </div>
      </section>

      {/* OSINT Live Forensic Preview Card (Visibly Tilted 3D Isometric Perspective & Compact Width) */}
      <section className="relative pt-2 pb-4">
        <div
          className="rounded-2xl border border-white/20 bg-[#121316]/95 backdrop-blur-xl p-4 sm:p-6 shadow-2xl transition-all duration-300 hover:rotate-0"
          style={{
            transform: "perspective(900px) rotateX(6deg) rotateY(-8deg) rotateZ(1.5deg)",
            transformOrigin: "center left",
          }}
        >
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-mono font-bold text-slate-300">
                Live Forensic Intelligence Feed
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-300 bg-blue-950/60 border border-blue-700/40 px-2 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>STATUS: ARMED &amp; ANALYZING</span>
            </div>
          </div>

          {/* Simulated Query Box (Strict Biru, Hitam, Putih) */}
          <div className="rounded-lg border border-white/10 bg-[#090a0d] p-2.5 sm:p-3 mb-4 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-300 truncate">
                "Halo kak, loker sampingan tugas like video komisi 300rb/hari..."
              </span>
            </div>
            <span className="rounded bg-blue-600/30 border border-blue-500/50 px-2 py-0.5 text-[10px] font-bold text-blue-200 shrink-0">
              88% RISIKO TINGGI
            </span>
          </div>

          {/* 2x2 Metric Grid (Just like OSINT Industries) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-left">
            {/* Tile 1 */}
            <div className="rounded-xl border border-white/10 bg-[#16181e] p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <AlertTriangle className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono">Trik Manipulasi</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono">
                6 Indikator
              </div>
              <p className="text-[10px] text-slate-400">
                Urgensi waktu, tugas VIP &amp; deposit bertahap
              </p>
            </div>

            {/* Tile 2 */}
            <div className="rounded-xl border border-white/10 bg-[#16181e] p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <BrainCircuit className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono">Cognitive Bias</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono">
                3 Vektor Emosi
              </div>
              <p className="text-[10px] text-slate-400">
                Greed baiting, false scarcity &amp; FOMO
              </p>
            </div>

            {/* Tile 3 */}
            <div className="rounded-xl border border-white/10 bg-[#16181e] p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono">Forensik Domain</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono">
                .SITE / Typosquat
              </div>
              <p className="text-[10px] text-slate-400">
                Mencatut e-commerce tanpa sertifikat resmi
              </p>
            </div>

            {/* Tile 4 */}
            <div className="rounded-xl border border-white/10 bg-[#16181e] p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono">Mitigasi Cepat</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono">
                Laporan Instan
              </div>
              <p className="text-[10px] text-slate-400">
                Draf aduan resmi Komdigi, OJK &amp; Polri
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Modules */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
            Tiga Modul Utama
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
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

      {/* Safety & Integrity Standards */}
      <section className="rounded-xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xl text-left">
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
