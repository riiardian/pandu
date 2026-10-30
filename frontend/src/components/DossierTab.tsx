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
  ExternalLink,
  ShieldAlert,
  Send,
  Clock,
  User,
  CreditCard,
  Phone,
  Globe,
  FileCode,
  Flame,
} from "lucide-react";

interface DossierTabProps {
  initialData?: {
    category: string;
    suspect_url?: string;
    chronology: string;
  } | null;
}

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
        // Refresh recent threats
        fetchRecentThreats();
        // Reset form
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Intro Header */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f15]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4" />
          <span>{lang === "en" ? "Cyber Threat Intelligence Database" : "Basis Data Intelijen Siber"}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {lang === "en" ? "Report Center & Blacklist Registry" : "Pusat Laporan & Daftar Hitam (Threat Registry)"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          {lang === "en"
            ? "Verify suspicious WhatsApp numbers, bank accounts, or links against PANDU's cybercrime threat registry. You can also report new fraudulent entities to protect the public in real time."
            : "Verifikasi keabsahan nomor WhatsApp, rekening bank, atau link mencurigakan terhadap basis data kejahatan siber PANDU. Anda juga dapat melaporkan entitas penipuan baru untuk melindungi masyarakat secara real-time."}
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "search"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Search className="h-4 w-4" />
          <span>{lang === "en" ? "Check Blacklist" : "Periksa Daftar Hitam"}</span>
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "report"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>{lang === "en" ? "Report New Scam" : "Lapor Penipuan Baru"}</span>
        </button>

        <button
          onClick={() => setActiveTab("firstaid")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "firstaid"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{lang === "en" ? "Emergency First-Aid" : "Pertolongan Pertama"}</span>
        </button>
      </div>

      {/* TAB 1: PERIKSA DAFTAR HITAM */}
      {activeTab === "search" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search Box */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/90 p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white">
              {lang === "en" ? "Check Status of Phone Number, Bank Account, or Link" : "Cek Status Nomor Telepon, Rekening, atau Tautan"}
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === "en" ? "Enter phone number (08...), bank account (BCA/BRI...), or web URL..." : "Masukkan no WA (08...), no rekening (BCA/BRI...), atau URL web..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-xl border border-white/10 bg-[#090a0d] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={searchLoading}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-950/40 disabled:opacity-50 shrink-0"
              >
                {searchLoading ? (lang === "en" ? "Checking..." : "Memeriksa...") : (lang === "en" ? "Check Now" : "Periksa Sekarang")}
              </button>
            </div>

            {/* Quick Helper Note */}
            <p className="text-[11px] text-slate-500 pt-1">
              {lang === "en" ? "Input suspicious phone numbers, bank accounts, or web links to verify if they have been reported by the public." : "Masukkan nomor kontak, rekening bank, atau tautan yang mencurigakan untuk memeriksa apakah sudah pernah dilaporkan masyarakat."}
            </p>
          </div>

          {/* Search Result Display */}
          {hasSearched && searchResult && (
            <div className="animate-in fade-in duration-300">
              {searchResult.found ? (
                /* RED DANGER ALERT: MATCHED IN BLACKLIST */
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm sm:text-base">
                      <Flame className="h-5 w-5 animate-pulse" />
                      <span>{lang === "en" ? "WARNING: REGISTERED IN PANDU THREAT BLACKLIST" : "PERINGATAN: TERDAFTAR DALAM DAFTAR HITAM PANDU"}</span>
                    </div>
                    <span className="rounded bg-rose-600/30 border border-rose-500/50 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-200">
                      {lang === "en" ? "RISK" : "RISIKO"} {searchResult.data?.risk_level || "CRITICAL"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-950/40 p-3 space-y-1">
                      <span className="text-[10px] font-mono text-rose-300 uppercase">{lang === "en" ? "Target Identity" : "Identitas Target"}</span>
                      <p className="text-sm font-bold text-white font-mono break-all">
                        {searchResult.data?.identifier}
                      </p>
                      {searchResult.data?.account_holder && (
                        <p className="text-[11px] text-rose-200">
                          {lang === "en" ? "o/b" : "a.n"} {searchResult.data?.account_holder} ({searchResult.data?.reported_bank})
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-rose-500/20 bg-rose-950/40 p-3 space-y-1">
                      <span className="text-[10px] font-mono text-rose-300 uppercase">{lang === "en" ? "Report Count" : "Jumlah Laporan Korban"}</span>
                      <p className="text-xl font-black text-rose-400 font-mono">
                        {searchResult.data?.report_count} {lang === "en" ? "Reports" : "Laporan"}
                      </p>
                      <p className="text-[10px] text-rose-200">
                        {lang === "en" ? "First:" : "Pertama:"} {searchResult.data?.first_reported?.split(" ")[0]}
                      </p>
                    </div>

                    <div className="rounded-xl border border-rose-500/20 bg-rose-950/40 p-3 space-y-1">
                      <span className="text-[10px] font-mono text-rose-300 uppercase">{lang === "en" ? "Modus Category" : "Kategori Modus"}</span>
                      <p className="text-sm font-bold text-white capitalize">
                        {searchResult.data?.category?.replace("_", " ")}
                      </p>
                      <p className="text-[10px] text-rose-200">
                        {lang === "en" ? "Status: Verified Dangerous" : "Status: Terverifikasi Berbahaya"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#090a0d] p-3.5 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{lang === "en" ? "Notes / Chronology:" : "Keterangan / Kronologi Kejadian:"}</span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {searchResult.data?.description}
                    </p>
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-[11px] text-rose-300">
                      {lang === "en"
                        ? "Do not transfer money or download any files from this number/link."
                        : "Jangan lakukan transfer uang atau unduh file apa pun dari nomor/link ini."}
                    </p>
                    <button
                      onClick={() => {
                        setReportTarget(searchResult.data?.identifier || "");
                        setActiveTab("report");
                      }}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shrink-0"
                    >
                      {lang === "en" ? "+ Add New Report" : "+ Tambahkan Laporan Baru"}
                    </button>
                  </div>
                </div>
              ) : (
                /* GREEN / SAFE ALERT: NOT IN BLACKLIST */
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md p-5 sm:p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{lang === "en" ? "Not Listed in PANDU Threat Blacklist" : "Belum Terdaftar dalam Basis Data Daftar Hitam PANDU"}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === "en"
                      ? <>Target <span className="font-mono text-white font-bold">"{searchResult.query}"</span> has not been reported by the PANDU community yet.</>
                      : <>Target <span className="font-mono text-white font-bold">"{searchResult.query}"</span> saat ini belum pernah dilaporkan oleh komunitas PANDU.</>}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {lang === "en"
                      ? "Security Note: Not being listed does not guarantee 100% safety. Scammers frequently switch phone numbers or spin up new domains every few days. Always remain vigilant against requests for wire transfers or APK app installations."
                      : "Catatan Keamanan: Belum terdaftar bukan jaminan 100% aman. Penipu kerap berganti nomor baru atau menggunakan domain baru setiap beberapa hari. Tetap waspadai permintaan transfer uang atau penginstalan file format .APK."}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setReportTarget(searchResult.query);
                        setActiveTab("report");
                      }}
                      className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      {lang === "en" ? "Found Suspicious Activity? Report This Target" : "Apakah Anda Menemukan Indikasi Mencurigakan? Laporkan Target Ini"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Threats Live Feed */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                {lang === "en" ? "LATEST THREAT REPORTS IN PANDU DATABASE" : "Laporan Ancaman Terkini di Basis Data PANDU"}
              </h4>
              <span className="text-[11px] font-mono text-blue-400">
                {recentThreats.length} {lang === "en" ? "Entities Registered" : "Entitas Terdaftar"}
              </span>
            </div>

            {recentThreats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentThreats.slice(0, 6).map((threat) => (
                  <div
                    key={threat.id}
                    onClick={() => {
                      setSearchQuery(threat.identifier);
                      handleSearch(threat.identifier);
                    }}
                    className="cursor-pointer rounded-xl border border-white/10 bg-[#121316]/80 p-3.5 space-y-2 hover:border-blue-500/40 hover:bg-[#18191f] transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono truncate">
                        {threat.identifier}
                      </span>
                      <span className="rounded bg-rose-950/60 border border-rose-800/40 px-2 py-0.2 text-[9px] font-mono font-bold text-rose-300 shrink-0">
                        {threat.report_count} {lang === "en" ? "Reports" : "Laporan"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {threat.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-white/5">
                      <span className="capitalize">{threat.category?.replace("_", " ")}</span>
                      <span>{lang === "en" ? "Active:" : "Aktif:"} {threat.last_reported?.split(" ")[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center space-y-1.5">
                <p className="text-xs text-slate-300 font-medium">
                  {lang === "en" ? "No complaint report records in the database yet." : "Belum ada catatan laporan aduan pada basis data."}
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                  {lang === "en"
                    ? "PANDU does not load artificial mock data. Blacklist entries expand transparently upon genuine community reports."
                    : "PANDU tidak memuat data rekaan. Daftar hitam akan bertambah secara transparan saat ada laporan riil yang diajukan oleh masyarakat."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LAPOR PENIPUAN BARU */}
      {activeTab === "report" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-white/10 bg-[#121316]/90 p-5 sm:p-6 space-y-5 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === "en" ? "Malicious Entity Reporting Form" : "Formulir Pelaporan Entitas Berbahaya"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                {lang === "en"
                  ? "Your report will be immediately recorded into PANDU's blacklist registry to warn other users investigating this target."
                  : "Laporan Anda akan langsung dicatat ke basis data daftar hitam PANDU dan memperingatkan pengguna lain yang melakukan pencarian terhadap nomor, rekening, atau tautan ini."}
              </p>
            </div>

            {reportSuccess && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{reportSuccess}</span>
                </div>
                <button
                  onClick={() => setActiveTab("search")}
                  className="rounded bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-500 text-[11px] shrink-0"
                >
                  {lang === "en" ? "View in Blacklist" : "Lihat di Daftar Hitam"}
                </button>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              {/* Type Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  {lang === "en" ? "Reported Entity Type:" : "Tipe Entitas yang Dilaporkan:"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "phone", label: lang === "en" ? "Phone / WA" : "No. Telepon / WA", icon: Phone },
                    { id: "bank_account", label: lang === "en" ? "Bank / E-Wallet" : "Rekening / E-Wallet", icon: CreditCard },
                    { id: "url", label: lang === "en" ? "Link / Website" : "Tautan / Website", icon: Globe },
                    { id: "apk_hash", label: lang === "en" ? "Malicious APK" : "File APK Jahat", icon: FileCode },
                  ].map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setReportType(t.id as any)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 transition-all ${
                          reportType === t.id
                            ? "border-blue-500 bg-blue-600/20 text-white font-bold"
                            : "border-white/10 bg-[#090a0d] text-slate-400 hover:text-white"
                        }`}
                      >
                        <IconComp className="h-3.5 w-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Identifier Target */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  {lang === "en" ? "Target Number / Account / Link:" : "Nomor / Akun / Tautan Target:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    reportType === "phone"
                      ? (lang === "en" ? "Example: 085812345678" : "Contoh: 085812345678")
                      : reportType === "bank_account"
                      ? (lang === "en" ? "Example: 8271039481 or 0858xxxx (DANA)" : "Contoh: 8271039481 atau 0858xxxx (DANA)")
                      : (lang === "en" ? "Example: https://shopee-vip-toko.site" : "Contoh: https://shopee-vip-toko.site")
                  }
                  value={reportTarget}
                  onChange={(e) => setReportTarget(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#090a0d] p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              {/* Modality Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    {lang === "en" ? "Scam Modus Category:" : "Modus Penipuan:"}
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#090a0d] p-3 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="loker_freelance">{lang === "en" ? "Freelance Task Scam (Video Likes / Deposit)" : "Loker Freelance (Misi Like Video / Deposit)"}</option>
                    <option value="kurir_apk">{lang === "en" ? "Malicious APK (Courier / Traffic Fine ETLE)" : "Penyebaran APK Kurir / Surat Tilang ETLE"}</option>
                    <option value="phishing_bank">{lang === "en" ? "Bank Phishing (OTP & Balance Theft)" : "Phishing Bank (Pencurian OTP & Saldo)"}</option>
                    <option value="impersonasi">{lang === "en" ? "Relative Impersonation / WhatsApp Hijack" : "Impersonasi Kerabat / WhatsApp Hijacking"}</option>
                    <option value="pinjol_ilegal">{lang === "en" ? "Illegal Loan / Contact Extortion" : "Pinjol Ilegal & Pemerasan Kontak"}</option>
                    <option value="investasi_bodong">{lang === "en" ? "Fake Investment / Fraudulent Trading" : "Investasi Bodong / Trading Palsu"}</option>
                  </select>
                </div>

                {reportType === "bank_account" && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      {lang === "en" ? "Bank Name & Account Holder:" : "Nama Bank / E-Wallet & Atas Nama:"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === "en" ? "Bank (BCA/BRI/DANA)" : "Bank (BCA/BRI/DANA)"}
                        value={reportBank}
                        onChange={(e) => setReportBank(e.target.value)}
                        className="w-1/2 rounded-xl border border-white/10 bg-[#090a0d] p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder={lang === "en" ? "Account Holder Name" : "Atas Nama Pemilik"}
                        value={reportAccountHolder}
                        onChange={(e) => setReportAccountHolder(e.target.value)}
                        className="w-1/2 rounded-xl border border-white/10 bg-[#090a0d] p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chronology / Story */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  {lang === "en" ? "Incident Chronology / Summary:" : "Kronologi Singkat / Catatan Modus:"}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={lang === "en" ? "Briefly explain how the scammer contacted you and what was requested..." : "Ceritakan singkat bagaimana pelaku menghubungi Anda dan apa yang mereka minta..."}
                  value={reportChronology}
                  onChange={(e) => setReportChronology(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#090a0d] p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={reportSubmitting}
                className="w-full rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-950/40 disabled:opacity-50"
              >
                {reportSubmitting
                  ? (lang === "en" ? "Saving to Database..." : "Mencatat ke Basis Data...")
                  : (lang === "en" ? "Save to PANDU Threat Blacklist" : "Simpan ke Basis Data Daftar Hitam PANDU")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PERTOLONGAN PERTAMA */}
      {activeTab === "firstaid" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Emergency 5-Minute Checklist */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm sm:text-base">
              <ShieldAlert className="h-5 w-5" />
              <span>{lang === "en" ? "First 5-Minute Emergency Account Isolation Protocol" : "Prosedur Isolasi Darurat 5 Menit Pertama"}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === "en"
                ? "If you have accidentally installed a malicious .APK file or transferred funds to a fraudster, execute these 4 isolation steps immediately in sequence:"
                : "Jika Anda terlanjur menginstal file .APK kurir atau mentransfer uang kepada penipu, lakukan 4 langkah isolasi darurat ini secara berurutan sekarang juga:"}
            </p>

            <div className="space-y-2.5">
              {(lang === "en"
                ? [
                    {
                      step: "01",
                      title: "Sever Internet Connection (Enable Airplane Mode)",
                      desc: "Turn off WiFi and Cellular Data immediately. SMS-stealing trojans require an active internet connection to forward your banking OTP codes to attacker servers.",
                    },
                    {
                      step: "02",
                      title: "Contact Your Official Bank / E-Wallet Call Center",
                      desc: "Request an emergency account freeze or m-banking lock to prevent scammers from executing fund draining transactions.",
                    },
                    {
                      step: "03",
                      title: "Identify & Uninstall Suspicious Applications",
                      desc: "Open Phone Settings > Apps. Search for iconless apps or unfamiliar names (e.g. 'Package Receipt', 'ETLE Confirmation') and uninstall them immediately.",
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
                      desc: "Matikan WiFi dan Data Seluler segera. Trojan penyadap SMS memerlukan koneksi internet untuk mengirimkan kode OTP m-banking Anda ke server penipu.",
                    },
                    {
                      step: "02",
                      title: "Hubungi Call Center Resmi Bank / E-Wallet Anda",
                      desc: "Minta pemblokiran rekening darurat atau pembekuan akses m-banking Anda agar penipu tidak dapat melakukan transaksi pengurasan saldo.",
                    },
                    {
                      step: "03",
                      title: "Cek & Uninstall Aplikasi Mencurigakan",
                      desc: "Buka Pengaturan HP > Aplikasi. Cari aplikasi tanpa ikon atau bernama aneh (misal: 'Surat Paket', 'Konfirmasi ETLE') lalu copot pemasangannya.",
                    },
                    {
                      step: "04",
                      title: "Ganti Password Email & Kredensial Perbankan",
                      desc: "Lakukan pergantian kata sandi dari perangkat lain yang aman (bukan dari ponsel yang terinfeksi malware).",
                    },
                  ]
              ).map((item) => (
                <div key={item.step} className="rounded-xl border border-white/10 bg-[#090a0d] p-3.5 flex gap-3 text-xs">
                  <span className="font-mono font-bold text-rose-400 text-sm shrink-0">{item.step}</span>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-white">{item.title}</h5>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Alert WhatsApp Card */}
          <div className="rounded-2xl border border-white/10 bg-[#121316]/90 p-5 sm:p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">
                {lang === "en" ? "Family WhatsApp Security Warning Draft" : "Draf Peringatan untuk Grup WhatsApp Keluarga"}
              </h4>
              <button
                onClick={() =>
                  copyToClipboard(
                    lang === "en"
                      ? `Security alert for family: Please stay vigilant if you receive messages from unknown numbers sending .APK files (disguised as package receipts / traffic tickets) or claiming to be relatives in emergency distress. Never click or install them as they intercept mobile banking SMS OTPs. Always verify directly with the person. Stay safe!`
                      : `Peringatan untuk keluarga: Harap waspada jika ada nomor baru yang mengirim file .APK (pura-pura foto paket kurir / surat tilang) atau mengaku saudara meminjam uang mendesak. Jangan pernah diklik atau diinstal karena itu modus penyadap SMS perbankan. Selalu verifikasi langsung ke orangnya. Tetap waspada!`,
                    "family"
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {copiedKey === "family" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{lang === "en" ? "Copied" : "Tersalin"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-300" />
                    <span>{lang === "en" ? "Copy Message" : "Salin Pesan WA"}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="rounded-xl border border-white/10 bg-[#090a0d] p-3.5 font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
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
