"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LiveTerminalFeed from "@/components/LiveTerminalFeed";
import {
  ShieldAlert,
  BookOpen,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";

const ACRONYM_PHRASE = "Protective Analysis & Navigation for Digital Users";

function TypewriterAcronymHeadline() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(55);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting && text === ACRONYM_PHRASE) {
      timer = setTimeout(() => setIsDeleting(true), 4500);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setTypingSpeed(55);
    } else {
      timer = setTimeout(() => {
        const next = isDeleting
          ? ACRONYM_PHRASE.substring(0, text.length - 1)
          : ACRONYM_PHRASE.substring(0, text.length + 1);
        setText(next);
        setTypingSpeed(isDeleting ? 25 : 55);
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, typingSpeed]);

  return (
    <span className="text-white">
      {text}
      <span className="inline-block w-[3px] h-[0.85em] bg-white ml-1 align-baseline animate-pulse" />
    </span>
  );
}

export default function HomeTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16 pt-8 pb-8 sm:py-10">
      {/* OSINT-Style Left-Aligned Hero Section */}
      <section className="text-left space-y-4 max-w-xl">
        {/* Main Headline - Typewriter strictly on Protective Analysis & Navigation for Digital Users */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.14] font-sans">
          <TypewriterAcronymHeadline />
        </h1>

        {/* Project Purpose & Mission Statement */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
          Layanan analisis praktis untuk memeriksa keaslian pesan, tautan mencurigakan, dan file APK penipuan secara instan tanpa mengambil data pribadi. Saatnya memperkuat pertahanan siber dan menghentikan manipulasi di ruang digital.
        </p>

        {/* Left-Aligned Action Controls */}
        <div className="pt-1 flex items-center">
          <Link
            href="/xray"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-950/40"
          >
            <Search className="h-4 w-4" />
            <span>Mulai Analisis Forensik</span>
          </Link>
        </div>
      </section>

      {/* OSINT Live Forensic Preview Card (Visibly Tilted 3D Isometric Perspective & Compact Width) */}
      <section className="relative pt-2 pb-6" style={{ perspective: "1000px" }}>
        <div
          className="rounded-2xl border border-white/20 bg-[#121316] p-1.5 sm:p-2.5 shadow-2xl transition-all duration-300 hover:rotate-0"
          style={{
            transform: "rotateX(8deg) rotateY(-12deg) rotateZ(1.5deg)",
            transformOrigin: "center left",
            transformStyle: "preserve-3d",
            boxShadow: "0 20px 50px -10px rgba(0, 85, 255, 0.25), 0 10px 30px -15px rgba(0, 0, 0, 0.8)",
          }}
        >
          <LiveTerminalFeed />
        </div>
      </section>

      {/* 3 Core Forensic Capabilities (Clean OSINT Capability Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Modul Investigasi &amp; Pertahanan
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            ARSITEKTUR 3 PILAR
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Module 1: X-Ray */}
          <Link
            href="/xray"
            className="group rounded-2xl border border-white/10 bg-[#0d0f15]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#12151e] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171a24] text-blue-400 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
                  PILAR 01 · RECOGNIZE
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Deception X-Ray Scanner
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mesin aturan heuristik deterministik untuk membedah pesan mencurigakan, melacak redirect shortlink, dan mengecek anomali pendaftaran domain perbankan.
                </p>
              </div>

              {/* Technical Capability Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Analisis Teks &amp; URL
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Deteksi Typosquatting
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
              <span>Buka X-Ray Scanner</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 2: Simulasi */}
          <Link
            href="/simulasi"
            className="group rounded-2xl border border-white/10 bg-[#0d0f15]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#12151e] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171a24] text-blue-400 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
                  PILAR 02 · LEARN
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  The Deception Arena
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Arena simulasi percakapan interaktif gaya WhatsApp untuk melatih ketahanan menghadapi skenario loker tugas freelance, kurir paket .APK, dan impersonasi kerabat.
                </p>
              </div>

              {/* Technical Capability Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Simulasi Chat WhatsApp
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Skor Imunitas Kognitif
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
              <span>Masuk Arena Simulasi</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 3: Dossier */}
          <Link
            href="/aksi"
            className="group rounded-2xl border border-white/10 bg-[#0d0f15]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#12151e] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171a24] text-blue-400 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
                  PILAR 03 · ACT
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Incident First-Aid Dossier
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generator berkas bukti insiden dan checklist isolasi darurat. Menghasilkan draf laporan berstandar hukum siap kirim ke Komdigi, CekRekening.id, dan Bareskrim Polri.
                </p>
              </div>

              {/* Technical Capability Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Checklist Isolasi 5 Menit
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Draf Laporan 1-Klik
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
              <span>Buka Pusat Aksi &amp; Laporan</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Security & Privacy Invariants (CSIRT Zero-Knowledge Standard) */}
      <section className="rounded-2xl border border-white/10 bg-[#0d0f15]/90 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xl text-left">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Prinsip Privasi &amp; Standar Teknis
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
            ZERO-KNOWLEDGE VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5 rounded-xl border border-white/5 bg-[#12151e]/60 p-3.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Nol Pengumpulan Data Sensitif</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Sistem tidak pernah meminta nomor KTP, PIN perbankan, kata sandi, atau data rahasia riil. Analisis token berjalan secara lokal di server tanpa database penyimpanan pesan pengguna.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-white/5 bg-[#12151e]/60 p-3.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <Lock className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Lingkungan Uji Terisolasi</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Arena simulasi percakapan beroperasi dalam sandbox aman tanpa mendistribusikan malware aktif atau tautan eksploitasi nyata. Seluruh kontak dan entitas adalah sampel simulasi.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-white/5 bg-[#12151e]/60 p-3.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Deteksi Heuristik Transparan</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              PANDU tidak menggunakan klaim black-box mutlak 100%. Setiap skor risiko diuraikan secara ilmiah berdasarkan indikator teknis dan pemetaan manipulasi psikologis yang objektif.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Bottom Anchor */}
      <footer className="pt-2 pb-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">PANDU</span>
          <span>—</span>
          <span>Protective Analysis &amp; Navigation for Digital Users</span>
        </div>
        <div className="text-slate-400">
          Tim 404Forbidden · Web Development Competition MIT-WEEK 2026
        </div>
      </footer>
    </div>
  );
}
