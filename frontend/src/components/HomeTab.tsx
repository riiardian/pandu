"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LiveTerminalFeed from "@/components/LiveTerminalFeed";
import AnimatedPipeline from "@/components/AnimatedPipeline";
import {
  ShieldAlert,
  BookOpen,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  Smartphone,
  Globe,
  Users,
  AlertTriangle,
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
    <div className="max-w-4xl mx-auto space-y-14 sm:space-y-20 pt-8 pb-12 sm:py-12">
      {/* 1. Hero Section */}
      <section className="text-left space-y-4 max-w-xl">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.14] font-sans">
          <TypewriterAcronymHeadline />
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
          Layanan analisis praktis untuk memeriksa keaslian pesan, tautan mencurigakan, dan file APK penipuan secara instan tanpa mengambil data pribadi. Saatnya memperkuat pertahanan siber dan menghentikan manipulasi di ruang digital.
        </p>

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

      {/* 2. OSINT Live Forensic Preview Card (Tilted 3D Isometric Perspective) */}
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

      {/* 3. Alat Forensik & Respons Insiden */}
      <section className="space-y-5">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 text-left">
            Alat Forensik &amp; Respons Insiden
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Module 1: X-Ray */}
          <Link
            href="/xray"
            className="group rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="text-blue-400">
                <Search className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Radar Forensik
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Periksa pesan WhatsApp, SMS, dan tautan mencurigakan untuk mendeteksi indikasi penipuan serta domain palsu secara instan.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40">
                Mulai Pindai
              </span>
            </div>
          </Link>

          {/* Module 2: Simulasi */}
          <Link
            href="/simulasi"
            className="group rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Simulasi Modus Penipuan
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Latihan mengenali modus rekayasa sosial lewat simulasi chat interaktif, mulai dari loker bodong hingga kiriman file APK kurir.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40">
                Masuk Simulasi
              </span>
            </div>
          </Link>

          {/* Module 3: Dossier / Blacklist */}
          <Link
            href="/aksi"
            className="group rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="text-blue-400">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Pusat Laporan &amp; Daftar Hitam
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Laporkan nomor penipu, rekening bank, dan tautan mencurigakan langsung ke basis data PANDU. Periksa apakah target sudah masuk daftar hitam sebelum Anda bertransaksi.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40">
                Cek Daftar Hitam
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Alur Kerja Investigasi (Animated Cable Conduit Pipeline) */}
      <section className="space-y-4 text-left">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Alur Kerja Sistem (Pipeline Investigasi)
          </h3>
        </div>

        <AnimatedPipeline />
      </section>

      {/* 5. Vektor Ancaman Rekayasa Sosial di Indonesia */}
      <section className="space-y-5 text-left">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Vektor Ancaman yang Ditangani
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          {/* Vector 1 */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Smartphone className="h-4 w-4 text-blue-400" />
              <span>Sniffer APK Berkedok Resi / Surat Tilang</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penyebaran file .APK berbahaya berkedok foto paket kurir ekspedisi atau surat konfirmasi ETLE untuk menyadap izin akses SMS dan mencuri kode OTP perbankan.
            </p>
          </div>

          {/* Vector 2 */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
              <span>Loker Freelance Tugas Like &amp; Follow</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tawaran pekerjaan sampingan like video dengan komisi pancingan di awal sebelum korban diarahkan ke grup Telegram untuk deposit tugas VIP hingga puluhan juta rupiah.
            </p>
          </div>

          {/* Vector 3 */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Globe className="h-4 w-4 text-blue-400" />
              <span>Phishing Perbankan Domain Murah (.SITE / .XYZ)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Situs tiruan yang mencatut nama dan visual perbankan atau e-wallet nasional untuk menjebak korban memasukkan nomor kartu debit, PIN, dan kredensial login.
            </p>
          </div>

          {/* Vector 4 */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Users className="h-4 w-4 text-blue-400" />
              <span>Impersonasi Kerabat Pinjam Dana Darurat</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pengambilan identitas foto profil kerabat atau teman dekat yang mengaku baru berganti nomor telepon untuk meminjam uang mendesak tanpa verifikasi suara/video.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ Teknis & Operasional */}
      <section className="space-y-5 text-left">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Pertanyaan Umum (Technical FAQ)
          </h3>
        </div>

        <div className="space-y-3">
          {/* FAQ 1 */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1">
            <h5 className="text-sm font-bold text-white">
              Apakah sistem PANDU menyimpan data pesan atau nomor yang saya periksa?
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tidak sama sekali. PANDU beroperasi secara stateless dengan arsitektur Zero-Knowledge. Seluruh token teks dan URL diproses langsung di memori server dan segera dibuang tanpa pernah dicatat ke dalam database riwayat pengguna.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1">
            <h5 className="text-sm font-bold text-white">
              Bagaimana cara kerja deteksi tanpa menggunakan model AI pihak ketiga?
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              PANDU mengandalkan mesin heuristik deterministik (pattern matching, analisis entropi Shannon, deteksi typosquatting, dan pelacakan redirect DNS) yang dieksekusi secara lokal di backend Go. Hal ini menjamin kecepatan analisa &lt; 50ms, tanpa halusinasi, dan tanpa kebocoran data ke API pihak ketiga.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1">
            <h5 className="text-sm font-bold text-white">
              Bagaimana sistem Basis Data Daftar Hitam (Threat Registry) PANDU bekerja?
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Setiap laporan nomor WhatsApp, rekening bank, atau tautan penipuan yang masuk diverifikasi dan dicatat ke dalam database ancaman PANDU. Pengguna lain dapat memeriksa keabsahan suatu nomor atau rekening secara real-time sebelum bertransaksi.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Standar Privasi & Keamanan (Clean Invariants Grid) */}
      <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xl text-left">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Standar Privasi &amp; Kepatuhan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Nol Pengumpulan Data</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tidak pernah meminta atau menyimpan KTP, PIN, kata sandi, atau nomor rekening asli pengguna.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Lock className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Simulasi Terkendali</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Arena simulasi percakapan beroperasi aman tanpa mendistribusikan malware nyata atau tautan berbahaya.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Deteksi Transparan</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Menyajikan indikator peringatan teknis berbasis bukti terukur tanpa klaim hitam-putih 100% mutlak.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Minimal Bottom Anchor Footer */}
      <footer className="pt-2 pb-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400 text-left">
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
