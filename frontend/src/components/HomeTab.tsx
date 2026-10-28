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
  Wallet,
  AlertTriangle,
  ChevronDown,
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const FAQS = [
    {
      q: "Apakah sistem PANDU menyimpan data pesan atau nomor yang saya periksa?",
      a: "Tidak sama sekali. PANDU beroperasi secara stateless dengan arsitektur Zero-Knowledge. Seluruh token teks dan URL diproses langsung di memori server dan segera dibuang tanpa pernah dicatat ke dalam database riwayat pengguna.",
    },
    {
      q: "Bagaimana cara kerja deteksi tanpa menggunakan model AI pihak ketiga?",
      a: "PANDU mengandalkan mesin heuristik deterministik (pattern matching, analisis entropi Shannon, deteksi typosquatting, dan pelacakan redirect DNS) yang dieksekusi secara lokal oleh engine keamanan PANDU. Hal ini menjamin kecepatan analisa < 50ms, tanpa halusinasi, dan tanpa kebocoran data ke API pihak ketiga.",
    },
    {
      q: "Bagaimana sistem Basis Data Daftar Hitam (Threat Registry) PANDU bekerja?",
      a: "Setiap laporan nomor WhatsApp, rekening bank, atau tautan penipuan yang masuk diverifikasi dan dicatat ke dalam database ancaman PANDU. Pengguna lain dapat memeriksa keabsahan suatu nomor atau rekening secara real-time sebelum bertransaksi.",
    },
  ];

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
                  Investigasi otomatis pesan chat, nomor telepon, rekening bank, email, tautan web, hingga berkas APK dan gambar untuk menelusuri rekam jejak digital kejahatan siber secara menyeluruh.
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
            Alur Kerja Sistem
          </h3>
        </div>

        <AnimatedPipeline />
      </section>

      {/* 5. Bentuk Manipulasi Digital */}
      <section className="space-y-4 text-left">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Bentuk Manipulasi Digital
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          {/* Case 1: Panggilan Palsu & Penyamaran Otoritas */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Users className="h-4 w-4 text-blue-400" />
              <span>Panggilan Palsu &amp; Penyamaran Otoritas</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memanipulasi kepanikan korban dengan mengaku petugas bank, kepolisian, atau kerabat dalam kondisi darurat untuk memeras transfer dana kilat tanpa verifikasi.
            </p>
          </div>

          {/* Case 2: Loker Bodong & Tugas Komisi Bertahap */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Wallet className="h-4 w-4 text-blue-400" />
              <span>Loker Bodong &amp; Tugas Komisi Bertahap</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Umpan pekerjaan sampingan like video dengan komisi pancingan di awal, lalu menjebak deposit modal bertingkat di grup Telegram hingga tabungan habis.
            </p>
          </div>

          {/* Case 3: Situs Tiruan & Phishing Perbankan */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Globe className="h-4 w-4 text-blue-400" />
              <span>Situs Tiruan &amp; Phishing Perbankan</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Membuat domain tiruan murah (.SITE / .XYZ) atau toko online fiktif untuk menjebak korban memasukkan nomor kartu debit, PIN, dan data kredensial login.
            </p>
          </div>

          {/* Case 4: Trojan APK Kurir & Surat Tilang */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Smartphone className="h-4 w-4 text-blue-400" />
              <span>Trojan APK Kurir &amp; Surat Tilang</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penyebaran file .APK berbahaya berkedok foto paket ekspedisi atau dokumen konfirmasi ETLE untuk menyadap izin akses SMS dan mencuri kode OTP perbankan secara diam-diam.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Pertanyaan Umum (FAQ) - Clean Accordion Blending with Background */}
      <section className="space-y-4 text-left">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Pertanyaan Umum (FAQ)
          </h3>
        </div>

        <div className="divide-y divide-white/10">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left gap-3 focus:outline-none group cursor-pointer"
                >
                  <span
                    className={`text-sm sm:text-base font-semibold transition-colors leading-snug ${
                      isOpen ? "text-blue-400" : "text-white group-hover:text-blue-300"
                    }`}
                  >
                    {item.q}
                  </span>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="pt-3 pr-8 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
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
