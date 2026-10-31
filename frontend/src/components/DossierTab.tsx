"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Upload,
  FileCheck,
  ArrowRight,
} from "lucide-react";

interface DossierTabProps {
  initialData?: {
    category: string;
    suspect_url?: string;
    chronology: string;
  } | null;
}

const BANK_HOTLINES = [
  { name: "BCA", number: "1500888" },
  { name: "Mandiri", number: "14000" },
  { name: "BRI", number: "1500017" },
  { name: "BNI", number: "1500046" },
  { name: "BSI", number: "14040" },
  { name: "CIMB Niaga", number: "14041" },
  { name: "DANA", number: "1500445" },
  { name: "GoPay", number: "1500304" },
  { name: "OVO", number: "1500696" },
  { name: "ShopeePay", number: "02139500300" },
];

const OFFICIAL_CHANNELS = [
  {
    name: "Patroli Siber Polri (Bareskrim)",
    desc: "Laporan tindak pidana penipuan online, pemerasan, dan kejahatan siber untuk penyelidikan kepolisian.",
    contact: "Hotline 110 (24 Jam)",
    url: "https://patrolisiber.id",
    domain: "patrolisiber.id",
  },
  {
    name: "CekRekening.id (Komdigi)",
    desc: "Portal resmi pelaporan rekening bank atau e-wallet penipu agar diverifikasi dan dibekukan perbankan.",
    contact: "Layanan Pemblokiran Rekening",
    url: "https://cekrekening.id",
    domain: "cekrekening.id",
  },
  {
    name: "Aduan Konten Komdigi",
    desc: "Pemblokiran situs web phishing, file APK berbahaya, dan penutupan nomor WhatsApp penipu.",
    contact: "WhatsApp: 0811-9224-545",
    url: "https://aduankonten.id",
    domain: "aduankonten.id",
  },
  {
    name: "Kontak OJK 157 (Satgas PASTI)",
    desc: "Pengaduan investasi bodong, pinjaman online ilegal, dan transfer dana ke layanan tanpa izin OJK.",
    contact: "Telepon 157 / WA 081-157-157-157",
    url: "https://kontak157.ojk.go.id",
    domain: "kontak157.ojk.go.id",
  },
];

const SCAM_CATEGORIES = [
  {
    id: "loker_freelance",
    labelId: "Loker Freelance (Misi Like / Deposit)",
    labelEn: "Freelance Task Scam (Like / Deposit)",
  },
  {
    id: "kurir_apk",
    labelId: "Penyebaran File APK (Kurir / Surat Tilang)",
    labelEn: "Malicious APK (Fake Courier / Traffic Ticket)",
  },
  {
    id: "phishing_bank",
    labelId: "Phishing Bank (Pencurian OTP & Kredensial)",
    labelEn: "Bank Phishing (OTP & Balance Theft)",
  },
  {
    id: "impersonasi",
    labelId: "Impersonasi Teman / WhatsApp Hijacking",
    labelEn: "Relative Impersonation / WhatsApp Hijack",
  },
  {
    id: "pinjol_ilegal",
    labelId: "Pinjol Ilegal & Pemerasan Kontak",
    labelEn: "Illegal Online Loan & Contact Extortion",
  },
  {
    id: "investasi_bodong",
    labelId: "Investasi Bodong / Trading Palsu",
    labelEn: "Fake Investment / Fraudulent Trading",
  },
  {
    id: "masalah_lain",
    labelId: "Lainnya / Masalah Lain",
    labelEn: "Other / Other Issues",
  },
];

export default function DossierTab({ initialData }: DossierTabProps) {
  const lang = useLanguage();
  const [activeTab, setActiveTab] = useState<"report" | "guide">("report");

  // Report Form State
  const [reportType, setReportType] = useState<"phone" | "bank_account" | "url" | "email">("phone");
  const [reportTarget, setReportTarget] = useState("");
  const [reportCategory, setReportCategory] = useState("loker_freelance");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [legalConfirmed, setLegalConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reportBank, setReportBank] = useState("");
  const [reportAccountHolder, setReportAccountHolder] = useState("");
  const [reportChronology, setReportChronology] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    if (!evidenceFile) {
      alert(lang === "en" ? "Evidence file (screenshot/receipt) is required." : "Wajib melampirkan berkas bukti (screenshot chat atau bukti transaksi).");
      return;
    }
    if (!legalConfirmed) {
      alert(lang === "en" ? "Please check the legal declaration statement." : "Wajib mencentang pernyataan pertanggungjawaban hukum.");
      return;
    }

    setReportSubmitting(true);
    setReportSuccess(null);

    try {
      const formData = new FormData();
      formData.append("type", reportType);
      formData.append("identifier", reportTarget.trim());
      formData.append("category", reportCategory);
      formData.append("reported_bank", reportBank.trim());
      formData.append("account_holder", reportAccountHolder.trim());
      formData.append("chronology", reportChronology.trim());
      if (evidenceFile) {
        formData.append("evidence", evidenceFile);
      }

      const res = await fetch("/api/v1/blacklist/report", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setReportSuccess(json.message || (lang === "en" ? "Report recorded successfully." : "Laporan berhasil dicatat dalam basis data."));
        setReportTarget("");
        setReportBank("");
        setReportAccountHolder("");
        setReportChronology("");
        setEvidenceFile(null);
        setLegalConfirmed(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
        return lang === "en" ? "Phone Number / WhatsApp" : "Nomor Telepon / WhatsApp Target";
      case "bank_account":
        return lang === "en" ? "Bank Account / E-Wallet Number" : "Nomor Rekening / Akun E-Wallet";
      case "url":
        return lang === "en" ? "Website Link / URL" : "Tautan / URL Website Target";
      case "email":
        return lang === "en" ? "Target Email Address" : "Alamat Email Target";
      default:
        return lang === "en" ? "Target Identifier" : "Identitas Target";
    }
  };

  const getDynamicTargetPlaceholder = () => {
    switch (reportType) {
      case "phone":
        return lang === "en" ? "e.g. 085812345678" : "Contoh: 085812345678";
      case "bank_account":
        return lang === "en" ? "e.g. 8271039481 or 0858... (DANA)" : "Contoh: 8271039481 atau 0858... (DANA)";
      case "url":
        return lang === "en" ? "e.g. https://shopee-vip-toko.site" : "Contoh: https://shopee-vip-toko.site";
      case "email":
        return lang === "en" ? "e.g. info@promo-bank.com or scammer@gmail.com" : "Contoh: penipu@gmail.com atau cs@bank-promo.com";
      default:
        return "";
    }
  };

  const selectedCategoryObj = SCAM_CATEGORIES.find((c) => c.id === reportCategory) || SCAM_CATEGORIES[0];
  const selectedCategoryLabel = lang === "en" ? selectedCategoryObj.labelEn : selectedCategoryObj.labelId;

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-left">
      {/* 1. Header: Clean & Direct */}
      <div className="space-y-1 pt-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {lang === "en" ? "Report Center" : "Pusat Laporan"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {lang === "en"
            ? "Submit digital fraud reports or find emergency contacts and official channels."
            : "Laporkan penipuan digital atau temukan kontak darurat jika menjadi korban."}
        </p>
      </div>

      {/* 2. Clean Underline Tabs (Human & Natural) */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-6 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`pb-2.5 font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === "report"
              ? "border-blue-600 text-blue-600 dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {lang === "en" ? "Submit Report" : "Lapor Penipuan"}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`pb-2.5 font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === "guide"
              ? "border-blue-600 text-blue-600 dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {lang === "en" ? "Emergency Guide" : "Jika Jadi Korban"}
        </button>
      </div>

      {/* TAB 1: FORMULIR LAPOR PENIPUAN */}
      {activeTab === "report" && (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111317] p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {lang === "en" ? "Fraud Incident Form" : "Formulir Laporan Penipuan"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {lang === "en"
                ? "Submissions are recorded in the threat database to protect other users."
                : "Laporan dicatat dalam basis data untuk memperingatkan pengguna lain."}
            </p>
          </div>

          {reportSuccess && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{reportSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className="text-emerald-700 dark:text-emerald-300 font-semibold underline text-xs shrink-0 cursor-pointer"
              >
                {lang === "en" ? "Emergency Guide" : "Lihat Panduan"}
              </button>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            {/* Entity Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "en" ? "Entity Type" : "Tipe Entitas"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: "phone", label: lang === "en" ? "Phone / WA" : "Nomor Telepon" },
                  { id: "bank_account", label: lang === "en" ? "Bank / E-Wallet" : "Rekening Bank" },
                  { id: "url", label: lang === "en" ? "Website Link" : "Tautan Web" },
                  { id: "email", label: lang === "en" ? "Email Address" : "Email" },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setReportType(t.id as any)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      reportType === t.id
                        ? "bg-blue-600 border-blue-600 text-white font-semibold"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getDynamicTargetLabel()}
              </label>
              <input
                type={reportType === "email" ? "email" : "text"}
                required
                placeholder={getDynamicTargetPlaceholder()}
                value={reportTarget}
                onChange={(e) => setReportTarget(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/30 p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono transition-colors"
              />
            </div>

            {/* Custom Aesthetic Dropdown for Category */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "en" ? "Scam Modus Category" : "Kategori Modus Penipuan"}
              </label>

              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/30 p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between focus:border-blue-500 focus:outline-none transition-colors cursor-pointer text-left"
              >
                <span className="truncate pr-2">{selectedCategoryLabel}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    categoryDropdownOpen ? "rotate-180 text-blue-500" : ""
                  }`}
                />
              </button>

              {/* Custom Popover Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#181a20] shadow-xl p-1.5 space-y-0.5 text-xs sm:text-sm animate-in fade-in-50 zoom-in-95 duration-100">
                  {SCAM_CATEGORIES.map((cat) => {
                    const isSelected = reportCategory === cat.id;
                    const label = lang === "en" ? cat.labelEn : cat.labelId;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setReportCategory(cat.id);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{label}</span>
                        {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bank details if bank_account */}
            {reportType === "bank_account" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === "en" ? "Bank & Account Holder Name" : "Nama Bank & Atas Nama Pemilik"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Bank (BCA/BRI/DANA)"
                    value={reportBank}
                    onChange={(e) => setReportBank(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/30 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder={lang === "en" ? "Account Holder Name" : "Atas Nama Pemilik"}
                    value={reportAccountHolder}
                    onChange={(e) => setReportAccountHolder(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/30 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Chronology */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "en" ? "Short Chronology" : "Kronologi Singkat Kejadian"}
              </label>
              <textarea
                rows={3}
                required
                placeholder={lang === "en" ? "Describe how you were contacted and what they asked for..." : "Ceritakan bagaimana pelaku menghubungi dan apa yang mereka minta..."}
                value={reportChronology}
                onChange={(e) => setReportChronology(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/30 p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none leading-relaxed transition-colors"
              />
            </div>

            {/* Lampiran Bukti Otentik (Wajib) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {lang === "en" ? "Evidence File (Mandatory)" : "Lampiran Bukti Percakapan / Transfer (Wajib)"}
                </label>
                <span className="text-[10px] text-slate-500">Maks. 10 MB (PNG, JPG, PDF)</span>
              </div>

              {!evidenceFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border border-dashed border-slate-300 dark:border-white/20 bg-slate-50/60 dark:bg-black/20 p-3.5 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-600/5 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEvidenceFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {lang === "en" ? "Upload chat screenshot or bank transfer receipt" : "Unggah screenshot chat atau bukti transfer"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {lang === "en" ? "Full screenshot showing date, time, and sender identity" : "Tangkapan layar utuh (memuat tanggal, jam, dan nomor/rekening)"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{evidenceFile.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{(evidenceFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-rose-500 hover:underline px-2 py-1 cursor-pointer font-medium"
                  >
                    {lang === "en" ? "Change" : "Ganti"}
                  </button>
                </div>
              )}
            </div>

            {/* Pakta Integritas / Pertanggungjawaban Hukum (Anti-Fitnah) */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={legalConfirmed}
                onChange={(e) => setLegalConfirmed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === "en"
                  ? "I declare that this report is true, supported by authentic evidence, and I am legally accountable under applicable cyber laws against false reports."
                  : "Saya menyatakan bahwa laporan ini benar, didukung bukti otentik, dan siap bertanggung jawab secara hukum sesuai UU ITE apabila laporan ini palsu atau fitnah."}
              </span>
            </label>

            <button
              type="submit"
              disabled={reportSubmitting || !reportTarget.trim() || !evidenceFile || !legalConfirmed}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {reportSubmitting
                ? (lang === "en" ? "Saving..." : "Menyimpan...")
                : (lang === "en" ? "Submit Report" : "Kirim Laporan")}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PANDUAN KORBAN (JIKA JADI KORBAN) */}
      {activeTab === "guide" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 1. Tindakan Darurat 5 Menit */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111317] p-5 sm:p-6 space-y-3.5 shadow-sm">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {lang === "en" ? "First 5-Minute Emergency Steps" : "Tindakan Darurat 5 Menit Pertama"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {lang === "en"
                ? "If you have accidentally installed an APK or sent funds, perform these actions immediately in order:"
                : "Jika terlanjur menginstal file .APK atau mentransfer uang ke penipu, lakukan langkah berikut secara berurutan:"}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex gap-3 items-start">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs shrink-0 w-5 pt-0.5">01</span>
                <div>
                  <strong className="text-slate-900 dark:text-white block">{lang === "en" ? "Turn on Airplane Mode immediately" : "Aktifkan Mode Pesawat segera"}</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                    {lang === "en"
                      ? "Disconnect WiFi and Mobile Data to stop SMS trojans from sending banking OTPs to attacker servers."
                      : "Putus koneksi data dan WiFi agar trojan APK penyadap tidak dapat mengirimkan SMS OTP perbankan ke penipu."}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs shrink-0 w-5 pt-0.5">02</span>
                <div>
                  <strong className="text-slate-900 dark:text-white block">{lang === "en" ? "Call your bank to freeze accounts" : "Hubungi bank untuk blokir rekening"}</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                    {lang === "en"
                      ? "Request an immediate emergency block on your m-banking and accounts to prevent balance draining."
                      : "Minta pemblokiran darurat akun m-banking dan rekening Anda agar saldo tidak terkuras."}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs shrink-0 w-5 pt-0.5">03</span>
                <div>
                  <strong className="text-slate-900 dark:text-white block">{lang === "en" ? "Reset passwords from another device" : "Ganti password dari perangkat lain"}</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                    {lang === "en"
                      ? "Change your email passwords and banking PINs using a clean, uninfected phone or laptop."
                      : "Ubah kata sandi email dan PIN m-banking menggunakan HP atau laptop lain yang aman."}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs shrink-0 w-5 pt-0.5">04</span>
                <div>
                  <strong className="text-slate-900 dark:text-white block">{lang === "en" ? "Uninstall suspicious apps" : "Copot pemasangan aplikasi mencurigakan"}</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                    {lang === "en"
                      ? "Go to Phone Settings > Apps. Look for unfamiliar apps or iconless files and uninstall them."
                      : "Buka Pengaturan HP > Aplikasi. Cari aplikasi tanpa ikon atau yang mencurigakan lalu copot pemasangannya."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Telepon Kemana: Hotline Bank */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111317] p-5 sm:p-6 space-y-3 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {lang === "en" ? "Emergency Bank & E-Wallet Hotlines" : "Telepon Kemana: Hotline Darurat Bank & E-Wallet"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {lang === "en"
                  ? "Tap to call immediately for emergency account freeze:"
                  : "Ketuk nomor untuk langsung menelepon dan minta pemblokiran darurat:"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {BANK_HOTLINES.map((b) => (
                <a
                  key={b.name}
                  href={`tel:${b.number}`}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200">{b.name}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{b.number}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 3. Lapor Kemana: Kanal Resmi Pemerintah */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111317] p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {lang === "en" ? "Where to Report: Official Government Channels" : "Lapor Kemana: Kanal Resmi Otoritas"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {lang === "en"
                  ? "Official agencies to report fraud for legal processing and nationwide blocking:"
                  : "Instansi resmi untuk pelaporan tindak pidana dan pemblokiran nasional:"}
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {OFFICIAL_CHANNELS.map((ch) => (
                <div key={ch.name} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{ch.name}</span>
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>{ch.domain}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ch.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Edukasi & Slogan Perlindungan Keluarga */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111317] p-5 sm:p-6 space-y-3 shadow-sm">
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {lang === "en"
                  ? "Protect Your Family from Digital Deception"
                  : "Lindungi Keluarga dari Tipu Daya Digital"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === "en"
                  ? "Don't let your parents or relatives become the next victim. Share awareness and test their responses against scam tactics through PANDU's interactive practice."
                  : "Jangan biarkan orang tua atau kerabat Anda menjadi korban berikutnya. Bagikan pemahaman dan uji respon mereka menghadapi taktik penipu lewat latihan interaktif PANDU."}
              </p>
            </div>

            <div className="pt-1">
              <Link
                href="/simulasi"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
              >
                <span>{lang === "en" ? "Open Educational Practice" : "Buka Latihan Edukasi"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
