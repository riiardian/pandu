"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LiveTerminalFeed from "@/components/LiveTerminalFeed";
import AnimatedPipeline from "@/components/AnimatedPipeline";
import { useLanguage } from "@/hooks/useLanguage";
import {
  BookOpen,
  FileCheck2,
  ArrowRight,
  Search,
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
    <span className="relative grid grid-cols-1">
      {/* 1. Invisible Anchor: Locks height to full 100% capacity to eliminate layout shift (layar netep) */}
      <span className="invisible pointer-events-none select-none col-start-1 row-start-1" aria-hidden="true">
        {ACRONYM_PHRASE}
        <span className="inline-block w-[3px] h-[0.85em] ml-1" />
      </span>

      {/* 2. Active Typewriter: Sits on the exact same grid footprint without pushing content down */}
      <span className="text-white col-start-1 row-start-1">
        {text}
        <span className="inline-block w-[3px] h-[0.85em] bg-current ml-1 align-baseline animate-pulse" />
      </span>
    </span>
  );
}

const FAQS_ID = [
  {
    q: "Apakah pesan atau nomor yang saya periksa di sini aman dan tidak disebarkan?",
    a: "Sangat aman. Sistem kami hanya membaca pesan atau nomor yang Anda masukkan untuk diperiksa saat itu juga. Kami tidak pernah meminta nomor KTP, kata sandi, ataupun menyimpan riwayat obrolan pribadi Anda.",
  },
  {
    q: "Bagaimana cara PANDU mengetahui suatu pesan atau tautan itu penipuan?",
    a: "PANDU mengenali ciri-ciri yang biasa dipakai pelaku, seperti iming-iming komisi tak wajar, desakan waktu agar korban panik, alamat website palsu yang meniru bank resmi, hingga file mencurigakan yang bisa menyadap SMS HP Anda.",
  },
  {
    q: "Bagaimana cara kerja daftar hitam penipu di PANDU?",
    a: "Setiap ada nomor WhatsApp, nomor rekening, atau website penipu yang dilaporkan oleh masyarakat, sistem akan menyimpannya ke dalam daftar hitam. Anda bisa mengecek nomor tersebut sebelum bertransaksi agar tidak menjadi korban berikutnya.",
  },
  {
    q: "Apa yang harus saya lakukan jika sudah terlanjur mengirim uang atau mengklik file penipu?",
    a: "Segera aktifkan Mode Pesawat di HP agar file berbahaya tidak bisa mengirim SMS OTP Anda ke penipu. Setelah itu, langsung hubungi bank Anda untuk memblokir rekening, dan laporkan nomor rekening pelaku di PANDU agar orang lain waspada.",
  },
  {
    q: "Apakah PANDU bisa memeriksa file kiriman mencurigakan selain pesan teks?",
    a: "Bisa. PANDU mampu membedah berkas aplikasi (.APK) untuk memeriksa izin tersembunyi yang bisa menyadap SMS OTP, serta memeriksa keaslian gambar tangkapan layar untuk mendeteksi apakah bukti transfer tersebut asli atau hasil editan.",
  },
];

const FAQS_EN = [
  {
    q: "Are the messages or numbers I inspect here secure and kept confidential?",
    a: "Completely secure. Our system only reads the input data to inspect it in real time. We never request national ID numbers, passwords, or store your private conversation history.",
  },
  {
    q: "How does PANDU detect whether a message or web link is fraudulent?",
    a: "PANDU identifies indicators commonly used by threat actors, such as unrealistic commission bait, artificial urgency, spoofed bank domains, and suspicious files that intercept SMS OTPs.",
  },
  {
    q: "How does the PANDU scammer blacklist operate?",
    a: "Whenever a fraudulent WhatsApp number, bank account, or phishing link is reported by the public, it is indexed into the blacklist. You can verify targets prior to transacting.",
  },
  {
    q: "What should I do if I already clicked a suspicious file or sent money?",
    a: "Immediately turn on Airplane Mode on your phone to prevent malicious files from forwarding SMS OTPs. Then, immediately contact your bank to freeze your accounts, and report the scammer's bank account on PANDU.",
  },
  {
    q: "Can PANDU inspect suspicious attachments other than text messages?",
    a: "Yes. PANDU decompiles Android package files (.APK) to audit hidden permissions that forward SMS OTPs, and verifies screenshot authenticity to detect forged transfer receipts.",
  },
];

export default function HomeTab() {
  const lang = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const FAQS = lang === "en" ? FAQS_EN : FAQS_ID;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 sm:space-y-16 pt-6 pb-0">
      {/* 1. Hero Section & Live Forensic Preview (Balanced 2-Column on Desktop) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-2 pb-8">
        <div className="lg:col-span-7 text-left space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.14] font-sans">
            <TypewriterAcronymHeadline />
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
            {lang === "en"
              ? "Practical analysis service to verify the authenticity of messages, suspicious links, and fraudulent APK files instantly without harvesting personal data. Time to strengthen cyber defense and stop digital manipulation."
              : "Layanan analisis praktis untuk memeriksa keaslian pesan, tautan mencurigakan, dan file APK penipuan secara instan tanpa mengambil data pribadi. Saatnya memperkuat pertahanan siber dan menghentikan manipulasi di ruang digital."}
          </p>

          <div className="pt-1 flex items-center">
            <Link
              href="/investigasi"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-950/40"
            >
              <Search className="h-4 w-4" />
              <span>{lang === "en" ? "Start Forensic Analysis" : "Mulai Analisis Forensik"}</span>
            </Link>
          </div>
        </div>

        {/* 2. OSINT Live Forensic Preview Card (Clean, Flat 2D, No Slop Cursor Tilt) */}
        <div className="lg:col-span-5 w-full">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <LiveTerminalFeed />
          </div>
        </div>
      </section>

      {/* 3. Alat Forensik & Respons Insiden */}
      <section className="space-y-5">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 text-left">
            {lang === "en" ? "Forensic Tools & Incident Response" : "Alat Forensik & Respons Insiden"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Module 1: X-Ray */}
          <Link
            href="/investigasi"
            className="group rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="text-blue-400">
                <Search className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {lang === "en" ? "Digital Threat Investigation" : "Investigasi Ancaman Digital"}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "en"
                    ? "Inspect web links, email addresses, and file hashes using verifiable external threat intelligence sources."
                    : "Periksa tautan, alamat email, dan hash berkas menggunakan sumber intelijen eksternal yang dapat dikueri serta ditampilkan buktinya."}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40">
                {lang === "en" ? "Start Scan" : "Mulai Pindai"}
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
                  {lang === "en" ? "Scam Modus Simulation" : "Simulasi Modus Penipuan"}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "en"
                    ? "Practice spotting social engineering tactics through interactive chat simulations, from fake jobs to APK packages."
                    : "Latihan mengenali modus rekayasa sosial lewat simulasi chat interaktif, mulai dari loker bodong hingga kiriman file APK kurir."}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40">
                {lang === "en" ? "Enter Simulation" : "Masuk Simulasi"}
              </span>
            </div>
          </Link>

          {/* Module 3: Dossier / Blacklist */}
          <Link
            href="/lapor"
            className="group rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 hover:border-blue-500/50 hover:bg-[#18191f] transition-all flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="text-blue-400">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {lang === "en" ? "Report Center & Blacklist" : "Pusat Laporan & Daftar Hitam"}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "en"
                    ? "Report scammer phone numbers, bank accounts, and suspicious links directly to the PANDU database. Check blacklist before transacting."
                    : "Laporkan nomor penipu, rekening bank, dan tautan mencurigakan langsung ke basis data PANDU. Periksa apakah target sudah masuk daftar hitam sebelum Anda bertransaksi."}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40">
                {lang === "en" ? "Check Blacklist" : "Cek Daftar Hitam"}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Alur Kerja Investigasi (Animated Cable Conduit Pipeline) */}
      <section id="alur-kerja" className="space-y-4 text-left scroll-mt-20">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "System Workflow" : "Alur Kerja Sistem"}
          </h3>
        </div>

        <AnimatedPipeline />
      </section>

      {/* 5. Bentuk Manipulasi Digital */}
      <section id="manipulasi-digital" className="space-y-4 text-left scroll-mt-20">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Digital Manipulation Vectors" : "Bentuk Manipulasi Digital"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          {/* Case 1: Panggilan Palsu & Penyamaran Otoritas */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Users className="h-4 w-4 text-blue-400" />
              <span>{lang === "en" ? "Spoofed Calls & Authority Impersonation" : "Panggilan Palsu & Penyamaran Otoritas"}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === "en"
                ? "Manipulating victim panic by posing as bank officials, police, or relatives in distress to extort instant transfers without verification."
                : "Memanipulasi kepanikan korban dengan mengaku petugas bank, kepolisian, atau kerabat dalam kondisi darurat untuk memeras transfer dana kilat tanpa verifikasi."}
            </p>
          </div>

          {/* Case 2: Loker Bodong & Tugas Komisi Bertahap */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Wallet className="h-4 w-4 text-blue-400" />
              <span>{lang === "en" ? "Fake Job Scams & Tiered Tasks" : "Loker Bodong & Tugas Komisi Bertahap"}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === "en"
                ? "Baiting with easy video-liking freelance income, then trapping victims into tiered capital deposits on Telegram until savings are drained."
                : "Umpan pekerjaan sampingan like video dengan komisi pancingan di awal, lalu menjebak deposit modal bertingkat di grup Telegram hingga tabungan habis."}
            </p>
          </div>

          {/* Case 3: Situs Tiruan & Phishing Perbankan */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Globe className="h-4 w-4 text-blue-400" />
              <span>{lang === "en" ? "Fake Websites & Banking Phishing" : "Situs Tiruan & Phishing Perbankan"}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === "en"
                ? "Creating cheap copycat domains (.SITE / .XYZ) or fake shops to trick victims into entering debit card numbers, PINs, and login credentials."
                : "Membuat domain tiruan murah (.SITE / .XYZ) atau toko online fiktif untuk menjebak korban memasukkan nomor kartu debit, PIN, dan data kredensial login."}
            </p>
          </div>

          {/* Case 4: Trojan APK Kurir & Surat Tilang */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/80 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Smartphone className="h-4 w-4 text-blue-400" />
              <span>{lang === "en" ? "Courier APK Trojans & Fake Fines" : "Trojan APK Kurir & Surat Tilang"}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === "en"
                ? "Spreading malicious .APK files disguised as parcel delivery photos or traffic ticket notices to hijack SMS access permissions and steal OTPs."
                : "Penyebaran file .APK berbahaya berkedok foto paket ekspedisi atau dokumen konfirmasi ETLE untuk menyadap izin akses SMS dan mencuri kode OTP perbankan secara diam-diam."}
            </p>
          </div>
        </div>
      </section>

      {/* 6. Pertanyaan Umum (FAQ) - Clean Accordion Blending with Background */}
      <section id="faq" className="space-y-4 text-left scroll-mt-20">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Frequently Asked Questions (FAQ)" : "Pertanyaan Umum (FAQ)"}
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
                  <span className="text-sm sm:text-base font-semibold text-white leading-snug">
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

      {/* Clean Bottom Footer */}
      <footer className="pt-6 pb-3 sm:pb-4 border-t border-white/10 text-center text-xs font-mono text-slate-500">
        {lang === "en" ? "© 2026 PANDU. All rights reserved." : "© 2026 PANDU. Hak cipta dilindungi undang-undang."}
      </footer>
    </div>
  );
}
