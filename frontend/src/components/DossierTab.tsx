"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  CreditCard,
  Globe,
  FileCode,
  PhoneCall,
  ExternalLink,
  Shield,
  Building2,
  Landmark,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface DossierTabProps {
  initialData?: {
    category: string;
    suspect_url?: string;
    chronology: string;
  } | null;
}

const BANK_HOTLINES = [
  { name: "BCA", number: "1500888", desc: "Halo BCA 24 Jam" },
  { name: "Mandiri", number: "14000", desc: "Mandiri Call" },
  { name: "BRI", number: "1500017", desc: "Contact BRI" },
  { name: "BNI", number: "1500046", desc: "BNI Call" },
  { name: "BSI", number: "14040", desc: "BSI Call" },
  { name: "CIMB Niaga", number: "14041", desc: "14041 Call Center" },
  { name: "DANA", number: "1500445", desc: "Customer Care DANA" },
  { name: "GoPay", number: "1500304", desc: "Bantuan GoPay 24 Jam" },
  { name: "OVO", number: "1500696", desc: "Pusat Bantuan OVO" },
  { name: "ShopeePay", number: "02139500300", desc: "CS ShopeePay" },
];

const OFFICIAL_CHANNELS = [
  {
    id: "polri",
    title: "Patroli Siber Polri (Bareskrim)",
    category: "Laporan Tindak Pidana Penipuan",
    desc: "Kanal resmi Direktorat Tindak Pidana Siber Bareskrim Polri untuk pelaporan kasus penipuan online, pemerasan, dan kejahatan digital.",
    contact: "Hotline 110 (24 Jam) / patrolisiber.id",
    url: "https://patrolisiber.id",
    icon: Shield,
    action: "Buka Portal Polri",
  },
  {
    id: "cekrekening",
    title: "CekRekening.id (Komdigi)",
    category: "Pemblokiran Rekening Bank & E-Wallet",
    desc: "Portal resmi Kementerian Komdigi untuk melaporkan rekening bank atau nomor e-wallet penipu agar diverifikasi dan dibekukan oleh perbankan.",
    contact: "Portal Nasional cekrekening.id",
    url: "https://cekrekening.id",
    icon: Landmark,
    action: "Buka CekRekening",
  },
  {
    id: "aduankonten",
    title: "Aduan Konten Komdigi",
    category: "Pemblokiran Link & Berkas Malware",
    desc: "Layanan penanganan konten internet negatif untuk pemblokiran website phishing, file APK berbahaya, dan penutupan nomor WhatsApp penipu.",
    contact: "WA: 0811-9224-545 / aduankonten.id",
    url: "https://aduankonten.id",
    icon: Globe,
    action: "Buka Aduan Konten",
  },
  {
    id: "ojk",
    title: "Kontak OJK 157 (Satgas PASTI)",
    category: "Investasi Bodong & Pinjol Ilegal",
    desc: "Satuan Tugas Pemberantasan Aktivitas Keuangan Ilegal (Satgas PASTI) OJK untuk menangani pinjaman online ilegal dan investasi bodong.",
    contact: "Hotline: 157 / WA: 081-157-157-157",
    url: "https://kontak157.ojk.go.id",
    icon: Building2,
    action: "Buka Kontak OJK",
  },
];

export default function DossierTab({ initialData }: DossierTabProps) {
  const lang = useLanguage();
  const [activeTab, setActiveTab] = useState<"report" | "guide">("report");

  // Report Form State
  const [reportType, setReportType] = useState<"phone" | "bank_account" | "url" | "apk_hash">("phone");
  const [reportTarget, setReportTarget] = useState("");
  const [reportCategory, setReportCategory] = useState("loker_freelance");
  const [reportBank, setReportBank] = useState("");
  const [reportAccountHolder, setReportAccountHolder] = useState("");
  const [reportChronology, setReportChronology] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Handle forwarded data from X-Ray
  useEffect(() => {
    if (initialData) {
      if (initialData.suspect_url) {
        setReportType("url");
        setReportTarget(initialData.suspect_url);
        if (initialData.chronology) {
          setReportChronology(initialData.chronology);
        }
        setActiveTab("report");
      }
    } else if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("pandu_forward_dossier");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.suspect_url) {
            setReportType("url");
            setReportTarget(parsed.suspect_url);
            if (parsed.chronology) {
              setReportChronology(parsed.chronology);
            }
            setActiveTab("report");
          }
          sessionStorage.removeItem("pandu_forward_dossier");
        }
      } catch (e) {}
    }
  }, [initialData]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget.trim()) return;

    setReportSubmitting(true);
    setReportSuccess(null);

    try {
      const res = await fetch("/api/v1/blacklist/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          identifier: reportTarget.trim(),
          category: reportCategory,
          reported_bank: reportBank.trim(),
          account_holder: reportAccountHolder.trim(),
          chronology: reportChronology.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReportSuccess(json.message || "Laporan berhasil dicatat dalam Daftar Hitam PANDU.");
        setReportTarget("");
        setReportBank("");
        setReportAccountHolder("");
        setReportChronology("");
      }
    } catch (e) {
      console.error("Gagal mengirim laporan", e);
    } finally {
      setReportSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getDynamicTargetLabel = () => {
    switch (reportType) {
      case "phone":
        return lang === "en" ? "Target Phone Number / WhatsApp:" : "Nomor Telepon / WhatsApp Target:";
      case "bank_account":
        return lang === "en" ? "Target Bank Account / E-Wallet Number:" : "Nomor Rekening / Akun E-Wallet Target:";
      case "url":
        return lang === "en" ? "Target Website Link / URL:" : "Tautan / URL Website Target:";
      case "apk_hash":
        return lang === "en" ? "Target APK File Name or Hash:" : "Nama Berkas atau Hash APK Target:";
      default:
        return lang === "en" ? "Target Identifier:" : "Identitas Target:";
    }
  };

  const getDynamicTargetPlaceholder = () => {
    switch (reportType) {
      case "phone":
        return lang === "en" ? "Example: 085812345678" : "Contoh: 085812345678";
      case "bank_account":
        return lang === "en" ? "Example: 8271039481 or 0858... (DANA)" : "Contoh: 8271039481 atau 0858... (DANA)";
      case "url":
        return lang === "en" ? "Example: https://shopee-vip-toko.site" : "Contoh: https://shopee-vip-toko.site";
      case "apk_hash":
        return lang === "en" ? "Example: Lihat_Foto_Paket.apk or sha256..." : "Contoh: Lihat_Foto_Paket.apk atau sha256...";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto text-left">
      {/* 1. Header: Clean & Natural without bulky box */}
      <div className="space-y-1.5 pt-2 pb-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {lang === "en" ? "Report Center & Victim Guide" : "Pusat Laporan & Panduan Korban"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {lang === "en"
            ? "File a digital fraud report or learn emergency isolation steps and official reporting channels if you become a victim."
            : "Formulir pelaporan kejahatan digital serta panduan darurat kontak dan kanal aduan resmi jika menjadi korban penipuan."}
        </p>
      </div>

      {/* 2. Clean 2-Segment Navigation Control */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300/70 dark:border-white/10 gap-1 text-xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg transition-all cursor-pointer ${
            activeTab === "report"
              ? "bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          }`}
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{lang === "en" ? "File Scam Report" : "Formulir Laporan"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg transition-all cursor-pointer ${
            activeTab === "guide"
              ? "bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span className="truncate">{lang === "en" ? "Victim Emergency Guide" : "Panduan Korban Penipuan"}</span>
        </button>
      </div>

      {/* TAB 1: FORMULIR LAPORAN PENIPUAN */}
      {activeTab === "report" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#121316]/95 p-4 sm:p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {lang === "en" ? "File Threat Report" : "Formulir Pelaporan Penipuan"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                {lang === "en"
                  ? "Your submission will be immediately recorded into PANDU's blacklist registry to warn other users investigating this target."
                  : "Laporan Anda langsung dicatat ke basis data daftar hitam PANDU untuk memperingatkan pengguna lain yang melakukan pencarian terhadap nomor, rekening, atau tautan ini."}
              </p>
            </div>

            {reportSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{reportSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("guide")}
                  className="rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-500 text-[11px] shrink-0 cursor-pointer"
                >
                  {lang === "en" ? "View Emergency Guide" : "Lihat Panduan Bantuan"}
                </button>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-3.5 text-xs">
              {/* Type Selector Pills */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {lang === "en" ? "Entity Type:" : "Tipe Entitas yang Dilaporkan:"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "phone", label: lang === "en" ? "Phone / WA" : "No. Telepon / WA", icon: Phone },
                    { id: "bank_account", label: lang === "en" ? "Bank / E-Wallet" : "Rekening / E-Wallet", icon: CreditCard },
                    { id: "url", label: lang === "en" ? "Website Link" : "Tautan / Website", icon: Globe },
                    { id: "apk_hash", label: lang === "en" ? "Malicious APK" : "Aplikasi (.APK)", icon: FileCode },
                  ].map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setReportType(t.id as any)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 transition-all cursor-pointer ${
                          reportType === t.id
                            ? "border-blue-600 bg-blue-600 text-white font-semibold shadow-sm"
                            : "border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <IconComp className="h-3.5 w-3.5" />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Target Input */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {getDynamicTargetLabel()}
                </label>
                <input
                  type="text"
                  required
                  placeholder={getDynamicTargetPlaceholder()}
                  value={reportTarget}
                  onChange={(e) => setReportTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] p-2.5 sm:p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono transition-colors"
                />
              </div>

              {/* Category & Bank details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    {lang === "en" ? "Scam Modus Category:" : "Kategori Modus Penipuan:"}
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] p-2.5 sm:p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="loker_freelance">{lang === "en" ? "Freelance Task Scam (Video Likes / Deposit)" : "Loker Freelance (Misi Like / Deposit)"}</option>
                    <option value="kurir_apk">{lang === "en" ? "Malicious APK (Fake Courier / ETLE Ticket)" : "Penyebaran File APK (Kurir / Surat Tilang)"}</option>
                    <option value="phishing_bank">{lang === "en" ? "Bank Phishing (OTP & Balance Theft)" : "Phishing Bank (Pencurian OTP & Kredensial)"}</option>
                    <option value="impersonasi">{lang === "en" ? "Relative Impersonation / WhatsApp Hijack" : "Impersonasi Teman / WhatsApp Hijacking"}</option>
                    <option value="pinjol_ilegal">{lang === "en" ? "Illegal Loan / Contact Extortion" : "Pinjol Ilegal & Pemerasan Kontak"}</option>
                    <option value="investasi_bodong">{lang === "en" ? "Fake Investment / Trading Scam" : "Investasi Bodong / Trading Palsu"}</option>
                  </select>
                </div>

                {reportType === "bank_account" && (
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      {lang === "en" ? "Bank & Account Holder Name:" : "Nama Bank & Atas Nama:"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Bank (BCA/BRI/DANA)"
                        value={reportBank}
                        onChange={(e) => setReportBank(e.target.value)}
                        className="w-1/2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] p-2.5 sm:p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder={lang === "en" ? "Holder Name" : "Atas Nama"}
                        value={reportAccountHolder}
                        onChange={(e) => setReportAccountHolder(e.target.value)}
                        className="w-1/2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] p-2.5 sm:p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chronology / Summary */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {lang === "en" ? "Incident Chronology / Summary:" : "Kronologi Singkat / Catatan Modus:"}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={lang === "en" ? "Explain briefly how you were contacted and what the perpetrator demanded..." : "Ceritakan singkat bagaimana pelaku menghubungi Anda dan apa yang mereka minta..."}
                  value={reportChronology}
                  onChange={(e) => setReportChronology(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] p-2.5 sm:p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none leading-relaxed transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={reportSubmitting}
                className="w-full rounded-xl bg-blue-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {reportSubmitting
                  ? (lang === "en" ? "Saving..." : "Menyimpan...")
                  : (lang === "en" ? "Submit Report to Blacklist" : "Kirim Laporan ke Basis Data")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PANDUAN KORBAN (TELEPON & LAPOR KEMANA) */}
      {activeTab === "guide" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 1. Langkah Cepat 5 Menit Pertama */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#121316]/95 p-4 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm sm:text-base">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{lang === "en" ? "First 5-Minute Emergency Action" : "Langkah Cepat 5 Menit Pertama"}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === "en"
                ? "If you have accidentally installed an APK or sent funds to a scammer, perform these 3 containment steps immediately:"
                : "Jika Anda terlanjur menginstal file .APK kurir atau mentransfer dana kepada pelaku, lakukan 3 tindakan isolasi ini sekarang juga:"}
            </p>

            <div className="space-y-2">
              {[
                {
                  step: "01",
                  title: lang === "en" ? "Sever Internet (Turn on Airplane Mode)" : "Putus Internet Segera (Mode Pesawat)",
                  desc: lang === "en"
                    ? "Turn off WiFi and Mobile Data immediately. SMS-stealing trojans require active internet to send your banking OTPs to criminal servers."
                    : "Matikan WiFi dan Data Seluler segera. Trojan penyadap SMS memerlukan koneksi internet untuk mengirimkan kode OTP m-banking ke server penipu.",
                },
                {
                  step: "02",
                  title: lang === "en" ? "Secure Accounts & Reset Passwords" : "Amankan Akun & Ganti Kata Sandi",
                  desc: lang === "en"
                    ? "Reset your email passwords and banking PINs from another secure device (not from the infected phone)."
                    : "Lakukan pergantian kata sandi email dan PIN m-banking Anda dari perangkat lain yang aman (bukan dari HP yang terinfeksi).",
                },
                {
                  step: "03",
                  title: lang === "en" ? "Remove Suspicious Applications" : "Copot Aplikasi Mencurigakan",
                  desc: lang === "en"
                    ? "Go to Phone Settings > Apps. Look for iconless apps or recent unfamiliar downloads (e.g. 'Package Photo', 'ETLE') and uninstall them."
                    : "Buka Pengaturan HP > Aplikasi. Cari aplikasi tanpa ikon atau yang baru diunduh (misal: 'Foto Paket', 'Surat Tilang') lalu segera copot pemasangannya.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#090a0d] p-3 flex gap-3 text-xs"
                >
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs shrink-0 h-6 w-6 rounded bg-rose-500/10 flex items-center justify-center">
                    {item.step}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{item.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Telepon Kemana: Hotline Resmi Darurat Bank & E-Wallet */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#121316]/95 p-4 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base">
              <PhoneCall className="h-5 w-5 shrink-0" />
              <span>{lang === "en" ? "Emergency Bank & E-Wallet Freeze Hotlines" : "Telepon Kemana: Hotline Darurat Bank & E-Wallet"}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === "en"
                ? "Tap directly to call your bank or e-wallet call center to request an immediate emergency account freeze:"
                : "Segera ketuk nomor di bawah untuk menghubungi call center resmi bank atau e-wallet Anda guna meminta pemblokiran rekening darurat agar saldo tidak terkuras:"}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {BANK_HOTLINES.map((b) => (
                <a
                  key={b.name}
                  href={`tel:${b.number}`}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-600/10 transition-all text-left"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{b.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">{b.desc}</span>
                  </div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs shrink-0 pl-2">
                    {b.number}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* 3. Lapor Kemana: Kanal Resmi Pengaduan Pemerintah & Penegak Hukum */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#121316]/95 p-4 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              <Building2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === "en" ? "Where to Report: Official Government Channels" : "Lapor Kemana: Kanal Resmi Penegak Hukum & Otoritas"}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === "en"
                ? "Submit official reports and suspect identities to authorized government institutions for legal investigation and nationwide blocking:"
                : "Laporkan identitas pelaku (nomor HP, rekening, link, atau APK) ke instansi berwenang resmi di bawah ini untuk proses pemblokiran nasional dan penyelidikan hukum:"}
            </p>

            <div className="space-y-2.5">
              {OFFICIAL_CHANNELS.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#090a0d] space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{ch.title}</h5>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">{ch.category}</span>
                        </div>
                      </div>
                      <a
                        href={ch.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg"
                      >
                        <span>{ch.action}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{ch.desc}</p>
                    <div className="pt-1 border-t border-slate-200/60 dark:border-white/5 text-[10px] text-slate-500 font-mono">
                      <span>{ch.contact}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Draf Peringatan WhatsApp Keluarga */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#121316]/95 p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {lang === "en" ? "Family Security Warning Draft" : "Draf Peringatan untuk Keluarga"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    lang === "en"
                      ? `Security alert for family: Please stay vigilant if you receive messages from unknown numbers sending .APK files (disguised as package receipts / traffic tickets) or claiming to be relatives in emergency distress. Never click or install them as they intercept mobile banking SMS OTPs. Always verify directly with the person. Stay safe!`
                      : `Peringatan untuk keluarga: Harap waspada jika ada nomor baru yang mengirim file .APK (pura-pura foto paket kurir / surat tilang) atau mengaku saudara meminjam uang mendesak. Jangan pernah diklik atau diinstal karena itu modus penyadap SMS perbankan. Selalu verifikasi langsung ke orangnya. Tetap waspada!`,
                    "family"
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {copiedKey === "family" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">{lang === "en" ? "Copied" : "Tersalin"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{lang === "en" ? "Copy Draft" : "Salin Draf"}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] p-3 font-sans text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {lang === "en"
                ? `Security alert for family: Please stay vigilant if you receive messages from unknown numbers sending .APK files (disguised as package receipts / traffic tickets) or claiming to be relatives in emergency distress. Never click or install them as they intercept mobile banking SMS OTPs. Always verify directly with the person. Stay safe!`
                : `Peringatan untuk keluarga: Harap waspada jika ada nomor baru yang mengirim file .APK (pura-pura foto paket kurir / surat tilang) atau mengaku saudara meminjam uang mendesak. Jangan pernah diklik atau diinstal karena itu modus penyadap SMS perbankan. Selalu verifikasi langsung ke orangnya. Tetap waspada!`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
