"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Search,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  Phone,
  CreditCard,
  Globe,
  FileCode,
  Flame,
  ArrowRight,
  PhoneCall,
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
  { name: "DANA", number: "1500445" },
  { name: "GoPay", number: "1500304" },
  { name: "OVO", number: "1500696" },
];

export default function DossierTab({ initialData }: DossierTabProps) {
  const lang = useLanguage();
  const [activeTab, setActiveTab] = useState<"search" | "report" | "firstaid">("search");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentThreats, setRecentThreats] = useState<any[]>([]);

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

  // Fetch recent threats on mount
  useEffect(() => {
    fetchRecentThreats();
  }, []);

  // Handle forwarded data from X-Ray
  useEffect(() => {
    if (initialData) {
      if (initialData.suspect_url) {
        setSearchQuery(initialData.suspect_url);
        handleSearch(initialData.suspect_url);
      }
    } else if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("pandu_forward_dossier");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.suspect_url) {
            setSearchQuery(parsed.suspect_url);
            handleSearch(parsed.suspect_url);
          }
          sessionStorage.removeItem("pandu_forward_dossier");
        }
      } catch (e) {}
    }
  }, [initialData]);

  const fetchRecentThreats = async () => {
    try {
      const res = await fetch("/api/v1/blacklist/recent");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecentThreats(json.data);
      }
    } catch (e) {
      console.error("Gagal memuat daftar hitam terbaru", e);
    }
  };

  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/v1/blacklist/check?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setSearchResult(json);
    } catch (e) {
      console.error("Gagal memeriksa blacklist", e);
      setSearchResult({ success: false, found: false, message: "Koneksi ke basis data terputus." });
    } finally {
      setSearchLoading(false);
    }
  };

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
        fetchRecentThreats();
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
          {lang === "en" ? "Threat Registry & Report Center" : "Pusat Laporan & Daftar Hitam"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {lang === "en"
            ? "Verify suspicious phone numbers, bank accounts, or links against community records, or file a new scam report."
            : "Periksa rekam jejak nomor kontak, rekening bank, atau tautan mencurigakan, atau laporkan temuan penipuan baru."}
        </p>
      </div>

      {/* 2. Segmented Navigation Control */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300/70 dark:border-white/10 gap-1 text-xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "search"
              ? "bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          }`}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{lang === "en" ? "Check Registry" : "Cek Daftar Hitam"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "report"
              ? "bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{lang === "en" ? "File Report" : "Lapor Penipuan"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("firstaid")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "firstaid"
              ? "bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{lang === "en" ? "First Aid" : "Langkah Darurat"}</span>
        </button>
      </div>

      {/* TAB 1: PERIKSA DAFTAR HITAM */}
      {activeTab === "search" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Integrated Search Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#121316]/90 p-4 sm:p-5 shadow-sm space-y-2.5">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              {lang === "en" ? "Search phone number, bank account, or URL:" : "Cari nomor telepon, rekening bank, atau tautan:"}
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === "en" ? "Example: 0858..., BCA 827..., or URL..." : "Contoh: 0858..., BCA 827..., atau URL..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#090a0d] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={searchLoading}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {searchLoading ? (lang === "en" ? "Checking..." : "Memeriksa...") : (lang === "en" ? "Check" : "Periksa")}
              </button>
            </div>
          </div>

          {/* Search Result Display */}
          {hasSearched && searchResult && (
            <div className="animate-in fade-in duration-200">
              {searchResult.found ? (
                /* Found in Blacklist Alert Card */
                <div className="rounded-2xl border border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/20 p-4 sm:p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm">
                      <Flame className="h-4 w-4 shrink-0" />
                      <span>{lang === "en" ? "Registered in Threat Blacklist" : "Terdaftar dalam Daftar Hitam"}</span>
                    </div>
                    <span className="rounded-full bg-rose-600/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300">
                      {searchResult.data?.risk_level || "CRITICAL"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl border border-rose-500/15 bg-white/60 dark:bg-black/30 p-3 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-rose-300/80 block">
                        {lang === "en" ? "Target Identifier" : "Identitas Target"}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono break-all">
                        {searchResult.data?.identifier}
                      </p>
                      {searchResult.data?.account_holder && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {lang === "en" ? "o/b" : "a.n"} {searchResult.data?.account_holder} ({searchResult.data?.reported_bank})
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-rose-500/15 bg-white/60 dark:bg-black/30 p-3 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-rose-300/80 block">
                        {lang === "en" ? "Total Complaints" : "Jumlah Laporan"}
                      </span>
                      <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        {searchResult.data?.report_count} {lang === "en" ? "Reports" : "Laporan"}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {lang === "en" ? "First reported:" : "Pertama dilaporkan:"} {searchResult.data?.first_reported?.split(" ")[0]}
                      </p>
                    </div>
                  </div>

                  {searchResult.data?.chronology && (
                    <div className="rounded-xl border border-rose-500/15 bg-white/60 dark:bg-black/30 p-3 space-y-1 text-xs">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-rose-300/80 block">
                        {lang === "en" ? "Modus & Chronology Note:" : "Catatan Modus & Kronologi:"}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                        {searchResult.data?.chronology}
                      </p>
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setReportTarget(searchResult.data?.identifier || "");
                        setActiveTab("report");
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{lang === "en" ? "Add complaint report on this target" : "Tambah laporan aduan pada target ini"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Not Found Clean Card */
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#121316] p-5 text-center space-y-2">
                  <div className="mx-auto h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === "en" ? "Not Found in Blacklist" : "Belum Terdaftar dalam Daftar Hitam"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {lang === "en"
                      ? "This entity has no prior fraud reports recorded in PANDU's database. Stay vigilant and verify through official channels before sending funds or data."
                      : "Entitas ini belum memiliki catatan aduan di basis data PANDU. Tetap waspada dan utamakan verifikasi kanal resmi sebelum mentransfer dana atau data."}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReportTarget(searchQuery);
                        setActiveTab("report");
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <span>{lang === "en" ? "Report this entity if you suspect fraud" : "Laporkan entitas ini jika mencurigakan"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Threats Feed */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {lang === "en" ? "Recent Threat Reports" : "Laporan Ancaman Terkini"}
              </h4>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {recentThreats.length} {lang === "en" ? "Registered" : "Terdaftar"}
              </span>
            </div>

            {recentThreats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recentThreats.slice(0, 6).map((threat) => (
                  <div
                    key={threat.id}
                    onClick={() => {
                      setSearchQuery(threat.identifier);
                      handleSearch(threat.identifier);
                    }}
                    className="cursor-pointer rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121316]/80 p-3 space-y-1.5 hover:border-blue-500/50 hover:shadow-sm transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">
                        {threat.identifier}
                      </span>
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                        {threat.report_count} {lang === "en" ? "Reports" : "Laporan"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {threat.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-white/5">
                      <span className="capitalize">{threat.category?.replace("_", " ")}</span>
                      <span>{threat.last_reported?.split(" ")[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-6 text-center space-y-1">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {lang === "en" ? "No complaint records in the database yet." : "Belum ada catatan laporan aduan pada basis data."}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {lang === "en"
                    ? "PANDU does not load mock entries. Blacklist records expand transparently based on verified public reports."
                    : "PANDU tidak memuat data rekaan. Daftar hitam akan bertambah secara transparan saat ada laporan riil yang diajukan masyarakat."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LAPOR PENIPUAN BARU */}
      {activeTab === "report" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#121316]/90 p-4 sm:p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {lang === "en" ? "File Threat Report" : "Formulir Laporan Penipuan"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                {lang === "en"
                  ? "Your submission will be immediately recorded into PANDU's blacklist registry to warn other users."
                  : "Laporan Anda langsung dicatat ke basis data daftar hitam PANDU untuk memperingatkan pengguna lain."}
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
                  onClick={() => setActiveTab("search")}
                  className="rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-500 text-[11px] shrink-0 cursor-pointer"
                >
                  {lang === "en" ? "View Blacklist" : "Cek di Daftar"}
                </button>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-3.5 text-xs">
              {/* Type Selector Pills */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {lang === "en" ? "Entity Type:" : "Tipe Entitas:"}
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
                    {lang === "en" ? "Scam Modus Category:" : "Kategori Modus:"}
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
                  : (lang === "en" ? "Save to Threat Blacklist" : "Simpan ke Basis Data")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PERTOLONGAN PERTAMA */}
      {activeTab === "firstaid" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Emergency 5-Minute Checklist */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#121316]/90 p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm sm:text-base">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{lang === "en" ? "First 5-Minute Emergency Protocol" : "Prosedur Darurat 5 Menit Pertama"}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === "en"
                ? "If you have accidentally installed a malicious .APK file or transferred funds to a fraudster, execute these 4 isolation steps immediately in sequence:"
                : "Jika Anda terlanjur menginstal file .APK mencurigakan atau mentransfer dana kepada pelaku, lakukan 4 langkah isolasi darurat ini secara berurutan:"}
            </p>

            <div className="space-y-2.5">
              {(lang === "en"
                ? [
                    {
                      step: "01",
                      title: "Sever Internet Connection (Enable Airplane Mode)",
                      desc: "Turn off WiFi and Mobile Data immediately. SMS-stealing trojans require active internet to forward your banking OTP codes to attacker servers.",
                    },
                    {
                      step: "02",
                      title: "Contact Your Official Bank / E-Wallet Call Center",
                      desc: "Request an immediate emergency account freeze or m-banking block to prevent unauthorized balance draining.",
                    },
                    {
                      step: "03",
                      title: "Identify & Uninstall Suspicious Applications",
                      desc: "Open Phone Settings > Apps. Search for iconless apps or unfamiliar names (e.g. 'Package Receipt', 'ETLE Confirmation') and uninstall immediately.",
                    },
                    {
                      step: "04",
                      title: "Reset Email Passwords & Banking Credentials",
                      desc: "Perform password resets from another secure device (not from the infected smartphone).",
                    },
                  ]
                : [
                    {
                      step: "01",
                      title: "Putus Koneksi Internet (Aktifkan Mode Pesawat)",
                      desc: "Matikan WiFi dan Data Seluler segera. Trojan penyadap SMS memerlukan koneksi internet untuk mengirimkan kode OTP m-banking ke server penipu.",
                    },
                    {
                      step: "02",
                      title: "Hubungi Call Center Resmi Bank / E-Wallet Anda",
                      desc: "Minta pemblokiran rekening darurat atau pembekuan akses m-banking agar penipu tidak dapat melakukan transaksi pengurasan saldo.",
                    },
                    {
                      step: "03",
                      title: "Cek & Uninstall Aplikasi Mencurigakan",
                      desc: "Buka Pengaturan HP > Aplikasi. Cari aplikasi tanpa ikon atau bernama mencurigakan (misal: 'Surat Paket', 'Konfirmasi ETLE') lalu copot pemasangannya.",
                    },
                    {
                      step: "04",
                      title: "Ganti Password Email & Kredensial Perbankan",
                      desc: "Lakukan pergantian kata sandi dari perangkat lain yang aman (bukan dari ponsel yang terinfeksi malware).",
                    },
                  ]
              ).map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#090a0d] p-3 sm:p-3.5 flex gap-3 text-xs"
                >
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm shrink-0 h-6 w-6 rounded bg-rose-500/10 flex items-center justify-center">
                    {item.step}
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{item.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">{item.desc}</p>
                    {item.step === "02" && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 block">
                          {lang === "en" ? "Tap to Call Official Hotline:" : "Ketuk untuk Hubungi Hotline Resmi:"}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {BANK_HOTLINES.map((b) => (
                            <a
                              key={b.name}
                              href={`tel:${b.number}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 py-0.5 text-[11px] text-slate-800 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <PhoneCall className="h-2.5 w-2.5 text-slate-400" />
                              <span className="font-semibold">{b.name}</span>
                              <span className="text-slate-500 font-mono text-[10px]">{b.number}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Alert WhatsApp Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#121316]/90 p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {lang === "en" ? "Family WhatsApp Security Warning Draft" : "Draf Peringatan WhatsApp Keluarga"}
              </h4>
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
