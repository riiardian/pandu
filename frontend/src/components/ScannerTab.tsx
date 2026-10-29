"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  FileCode,
  ArrowRight,
  Flame,
  Globe,
  Mail,
  Upload,
  FileText,
} from "lucide-react";

interface ScannerTabProps {
  onForwardToDossier?: (data: {
    category: string;
    suspect_url?: string;
    chronology: string;
  }) => void;
}

type ScanCategory = "url" | "email" | "file";

export default function ScannerTab({ onForwardToDossier }: ScannerTabProps) {
  const router = useRouter();
  const [scanType, setScanType] = useState<ScanCategory>("url");

  // Form states
  const [inputURL, setInputURL] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRunScan = async () => {
    setErrorMsg("");
    setResult(null);

    let endpoint = "";
    let payload: any = {};

    if (scanType === "url") {
      if (!inputURL.trim()) {
        setErrorMsg("Masukkan tautan atau domain website yang ingin Anda periksa.");
        return;
      }
      endpoint = "/api/v1/scan/url";
      payload = { url: inputURL, follow_redirects: true };
    } else if (scanType === "email") {
      if (!inputEmail.trim()) {
        setErrorMsg("Masukkan alamat email yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/email";
      payload = { email: inputEmail };
    } else if (scanType === "file") {
      if (!selectedFile) {
        setErrorMsg("Pilih berkas atau gambar yang ingin diperiksa.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran berkas maksimal 5 MB.");
        return;
      }
      endpoint = "/api/v1/scan/file";
    }

    setLoading(true);
    try {
      const isFileScan = scanType === "file" && selectedFile;
      const requestBody = isFileScan
        ? (() => {
            const form = new FormData();
            form.append("file", selectedFile);
            return form;
          })()
        : JSON.stringify(payload);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: isFileScan ? undefined : { "Content-Type": "application/json" },
        body: requestBody,
      });

      const responseText = await res.text();
      let json: any;
      try {
        json = JSON.parse(responseText);
      } catch {
        throw new Error(res.status === 413 ? "Ukuran berkas melebihi batas 5 MB." : "Respons engine PANDU tidak dapat dibaca.");
      }
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses pemindaian.");
      }

      setResult(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghubungi engine keamanan PANDU.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSelectedFile(null);
        setErrorMsg("Ukuran berkas maksimal 5 MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
      setResult(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-rose-400 bg-rose-950/40 border-rose-500/40";
    if (score >= 35) return "text-indigo-300 bg-indigo-950/30 border-indigo-500/30";
    return "text-blue-300 bg-blue-950/25 border-blue-500/25";
  };

  const TABS = [
    { id: "url", label: "Tautan Web", icon: Globe },
    { id: "email", label: "Alamat Email", icon: Mail },
    { id: "file", label: "Berkas / APK", icon: FileCode },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Intro Header Section */}
      <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-2 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Investigasi Ancaman Digital
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
          Pemeriksaan tautan, email, dan hash berkas terhadap sumber intelijen eksternal yang dapat dikueri dan ditampilkan buktinya.
        </p>
      </section>

      {/* Main Scanner Card */}
      <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-5 shadow-xl">
        {/* Multi-Target Category Tabs (OSINT Industries Dynamic Pill Dock) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = scanType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setScanType(tab.id as ScanCategory);
                  setResult(null);
                  setErrorMsg("");
                }}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-full text-xs transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 border border-blue-500"
                    : "bg-[#060a14] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"
                }`}
                title={tab.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {isActive && (
                  <span className="text-xs font-semibold tracking-tight whitespace-nowrap animate-in fade-in duration-200">
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-950/15 px-3.5 py-3 text-xs text-slate-300 leading-relaxed">
          Nomor telepon, rekening, dan analisis pesan tidak ditampilkan karena PANDU belum memiliki sumber eksternal terstruktur yang dapat membuktikan riwayat laporannya secara konsisten. Data laporan masyarakat tetap dikelola terpisah di Pusat Laporan.
        </div>

        {/* Input Form Fields by Active Tab (OSINT Industries Unified Input Style) */}
        <div className="pt-1">
          {scanType === "url" && (
            <div className="flex items-center rounded-xl border border-white/10 bg-[#060a14] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
              <span className="flex items-center gap-1 px-3.5 py-3 text-xs text-slate-400 bg-white/5 border-r border-white/10 font-mono shrink-0 select-none">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span>https://</span>
              </span>
              <input
                type="text"
                value={inputURL}
                onChange={(e) => setInputURL(e.target.value)}
                placeholder="bca-tarif-transaksi.xyz/login atau link bansos..."
                className="w-full px-3.5 py-3 text-sm text-white bg-transparent placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {scanType === "email" && (
            <div className="flex items-center rounded-xl border border-white/10 bg-[#060a14] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
              <span className="flex items-center px-3.5 py-3 text-xs text-slate-400 bg-white/5 border-r border-white/10 shrink-0 select-none">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
              </span>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="rekrutmen.pertamina@gmail.com atau official@..."
                className="w-full px-3.5 py-3 text-sm text-white bg-transparent placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {scanType === "file" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 sm:gap-4 rounded-xl border border-dashed border-white/20 bg-[#060a14] p-3 sm:p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Upload className="h-5 w-5 text-blue-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {selectedFile ? selectedFile.name : "Unggah APK, gambar, atau dokumen"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Maksimal 5 MB"}
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shrink-0 shadow-sm shadow-blue-600/30">
                  <span>{selectedFile ? "Ganti" : "Pilih File"}</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".apk,.exe,.zip,.pdf,.jpg,.jpeg,.png,.webp"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 px-3">
                  <div className="flex items-center gap-2 text-xs min-w-0">
                    <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="font-mono text-white font-medium truncate">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 ml-2 shrink-0 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunScan}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>
              {loading
                ? "Memeriksa..."
                : scanType === "url"
                ? "Periksa Tautan"
                : scanType === "email"
                ? "Periksa Email"
                : "Periksa Berkas"}
            </span>
          </button>
        </div>
      </section>

      {/* Result Section */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Diagnostic Header Card */}
          <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Hasil Diagnosis Forensik
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {result.detected_category ||
                    (result.impersonated_brand
                      ? `Pencatutan ${result.impersonated_brand}`
                      : result.operator
                      ? `${result.operator} (${result.country_name})`
                      : result.institution_type
                      ? `${result.original_bank} — ${result.clean_number}`
                      : result.file_type_category
                      ? `Berkas: ${result.file_name}`
                      : "Pemeriksaan Keabsahan Target")}
                </h3>
                {result.hostname && (
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    Host: {result.hostname} {result.tld ? `(${result.tld})` : ""}
                  </p>
                )}
              </div>

              {/* Score Badge */}
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${getScoreColor(result.risk_score)}`}>
                <div className="text-right">
                  <div className="text-2xl font-black">{result.risk_score}%</div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider">Indeks Risiko</div>
                </div>
                <div className="h-8 w-px bg-current opacity-20" />
                <div className="text-xs font-bold uppercase tracking-wide">
                  {result.threat_level}
                </div>
              </div>
            </div>

            {/* Coverage and queried-source evidence */}
            {result.coverage_summary && (
              <div className={`rounded-xl border p-4 space-y-1 ${
                result.coverage === "complete"
                  ? "border-blue-500/30 bg-blue-950/20"
                  : "border-amber-500/30 bg-amber-950/20"
              }`}>
                <div className="text-xs font-bold text-white">
                  Cakupan pemeriksaan: {result.coverage === "complete" ? "Lengkap" : result.coverage === "partial" ? "Parsial" : "Terbatas"}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.coverage_summary}</p>
              </div>
            )}

            {result.sources && result.sources.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Sumber yang Diperiksa
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.sources.map((source: any) => (
                    <div key={source.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-white">{source.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 break-all">{source.checked_at}</div>
                        </div>
                        <span className={`rounded px-2 py-1 text-[10px] font-bold ${
                          source.status === "unavailable"
                            ? "bg-amber-950/60 text-amber-300"
                            : source.outcome === "match"
                            ? "bg-rose-950/60 text-rose-300"
                            : "bg-blue-950/60 text-blue-300"
                        }`}>
                          {source.status === "unavailable"
                            ? "Tidak tersedia"
                            : source.outcome === "match"
                            ? "Ada kecocokan"
                            : source.outcome === "no_match"
                            ? "Tidak ditemukan"
                            : "Konteks ditemukan"}
                        </span>
                      </div>
                      {source.evidence?.map((item: any, index: number) => (
                        <div key={`${source.id}-${index}`} className="text-[11px] text-slate-300">
                          <span className="text-slate-500">{item.label}: </span>
                          <span className="font-mono break-all">{item.value}</span>
                        </div>
                      ))}
                      {source.limitation && <p className="text-[11px] text-slate-500 leading-relaxed">{source.limitation}</p>}
                      {source.attribution_url && (
                        <a href={source.attribution_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:text-blue-300">
                          Lihat sumber
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blacklist Match Card if registered */}
            {result.blacklist_entry && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Flame className="h-4 w-4 shrink-0" />
                  <span>Entitas Tercatat di Registri Internal Terverifikasi PANDU</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Total Laporan Masyarakat:</span>
                    <span className="font-bold text-rose-300 font-mono">
                      {result.blacklist_entry.report_count} Laporan
                    </span>
                  </div>
                  {result.blacklist_entry.account_holder && (
                    <div>
                      <span className="text-slate-500 block">Nama Pemilik Akun:</span>
                      <span className="font-bold text-white font-mono">
                        {result.blacklist_entry.account_holder}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block">Modus Utama:</span>
                    <span className="font-bold text-white">
                      {result.blacklist_entry.category}
                    </span>
                  </div>
                </div>
                {result.blacklist_entry.description && (
                  <p className="text-xs text-slate-300 pt-1 border-t border-rose-500/20 leading-relaxed">
                    Kronologi catatan: {result.blacklist_entry.description}
                  </p>
                )}
              </div>
            )}

            {/* Global Threat Intelligence Box (StopForumSpam) */}
            {result.global_intel && result.global_intel.found && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Flame className="h-4 w-4 shrink-0" />
                  <span>Terdeteksi di Jaringan Intelijen Kejahatan Siber Global ({result.global_intel.source})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Total Laporan Global:</span>
                    <span className="font-bold text-rose-300 font-mono">
                      {result.global_intel.frequency} Kali Terdeteksi
                    </span>
                  </div>
                  {result.global_intel.last_seen && (
                    <div>
                      <span className="text-slate-500 block">Terakhir Aktif:</span>
                      <span className="font-bold text-white font-mono">
                        {result.global_intel.last_seen}
                      </span>
                    </div>
                  )}
                  {result.global_intel.confidence !== undefined && (
                    <div>
                      <span className="text-slate-500 block">Indeks Keyakinan Sensor:</span>
                      <span className="font-bold text-rose-400 font-mono">
                        {result.global_intel.confidence}%
                      </span>
                    </div>
                  )}
                </div>
                {result.global_intel.risk_summary && (
                  <p className="text-xs text-slate-300 pt-1 border-t border-rose-500/20 leading-relaxed">
                    {result.global_intel.risk_summary}
                  </p>
                )}
              </div>
            )}

            {/* Technical Detail Badges */}
            {(result.operator || result.hlr_region || result.institution_type || result.bank_routing_code || result.domain || result.geolocation || result.tls_cert || result.domain_age_summary || result.web_posture || result.sha256) && (
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {result.operator && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Operator Seluler:</span>
                    <span className="font-bold text-white">{result.operator}</span>
                  </div>
                )}
                {result.hlr_region && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Wilayah Distribusi HLR:</span>
                    <span className="font-bold text-white">{result.hlr_region}</span>
                  </div>
                )}
                {result.country_name && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Negara Asal:</span>
                    <span className="font-bold text-white">{result.country_name}</span>
                  </div>
                )}
                {result.institution_type && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Tipe Lembaga:</span>
                    <span className="font-bold text-white">{result.institution_type}</span>
                  </div>
                )}
                {result.bank_routing_code && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Kode Kliring BI Fast / SKNBI:</span>
                    <span className="font-bold text-blue-400 font-mono">{result.bank_routing_code}</span>
                  </div>
                )}
                {result.report_status && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Status Registri Internal PANDU:</span>
                    <span className={`font-bold font-mono ${result.total_reports > 0 ? "text-rose-400" : "text-slate-300"}`}>
                      {result.report_status}
                    </span>
                  </div>
                )}
                {result.account_holder && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Nama Pemilik Akun:</span>
                    <span className="font-bold text-white font-mono">{result.account_holder}</span>
                  </div>
                )}
                {result.domain_age_summary && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Umur Registrasi Domain:</span>
                    <span className="font-bold text-emerald-400 font-mono">{result.domain_age_summary}</span>
                  </div>
                )}
                {result.domain && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Domain Server:</span>
                    <span className="font-bold text-white font-mono">@{result.domain}</span>
                  </div>
                )}
                {result.geolocation && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Server Hosting &amp; ASN:</span>
                    <span className="font-bold text-white">{result.geolocation.isp} ({result.geolocation.country})</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{result.geolocation.asn}</span>
                  </div>
                )}
                {result.tls_cert && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Penerbit Sertifikat SSL:</span>
                    <span className="font-bold text-white">{result.tls_cert.issuer}</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Berlaku s/d {result.tls_cert.valid_until}</span>
                  </div>
                )}
                {result.web_posture && (
                  <div className="rounded-xl bg-white/5 p-3 sm:col-span-3 space-y-2 border border-blue-500/20 bg-blue-950/10">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 block font-bold">Struktur Pertahanan Keamanan Web:</span>
                      <span className={`font-mono font-bold text-xs ${result.web_posture.security_grade.startsWith("A") ? "text-emerald-400" : "text-amber-400"}`}>
                        {result.web_posture.security_grade}
                      </span>
                    </div>
                    {result.web_posture.security_strengths && result.web_posture.security_strengths.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {result.web_posture.security_strengths.map((str: string, sidx: number) => (
                          <div key={sidx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {result.sha256 && (
                  <div className="rounded-xl bg-white/5 p-3 sm:col-span-3">
                    <span className="text-slate-500 block">Sidik Jari Kriptografi (SHA-256):</span>
                    <span className="font-bold text-slate-300 font-mono text-[11px] break-all">{result.sha256}</span>
                  </div>
                )}
              </div>
            )}

            {/* Live DNS MX Records (if email) */}
            {result.mx_records && result.mx_records.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Server Mail Exchange (MX) Aktif di DNS Publik:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {result.mx_records.map((mx: string, mxidx: number) => (
                    <div key={mxidx} className="rounded-lg bg-black/60 border border-white/10 p-2 font-mono text-[11px] text-slate-300">
                      {mx}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Cognitive Bias Section (If analyzing text) */}
          {result.cognitive_biases && result.cognitive_biases.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-blue-400" />
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Anatomi Manipulasi Emosi (Cognitive Bias)
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Sindikat penipuan memanfaatkan bias kognitif berikut untuk menekan nalar Anda:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                {result.cognitive_biases.map((bias: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-[#0d0e12] p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300">{bias.label}</span>
                      <span className="rounded bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-mono text-blue-300">
                        Bobot +{bias.weight}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{bias.description}</p>
                    {bias.trigger_words && bias.trigger_words.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {bias.trigger_words.map((tw: string, tidx: number) => (
                          <span
                            key={tidx}
                            className="rounded bg-black border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-300"
                          >
                            "{tw}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dangerous Android Permissions for APK */}
          {result.dangerous_perms && result.dangerous_perms.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Izin Bahaya Tingkat Tinggi yang Diminta Aplikasi (.APK):</span>
              </div>
              <div className="space-y-1.5">
                {result.dangerous_perms.map((perm: string, pidx: number) => (
                  <div
                    key={pidx}
                    className="rounded-lg bg-rose-950/20 border border-rose-500/20 p-2.5 text-xs text-slate-300 font-mono"
                  >
                    {perm}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Red Flags Indicators */}
          {result.red_flags && result.red_flags.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-400" />
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Indikator &amp; Temuan yang Dapat Dijelaskan
                </h4>
              </div>

              <div className="space-y-3 pt-1">
                {result.red_flags.map((rf: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-[#0d0e12] p-4 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                          rf.level === "CRITICAL"
                            ? "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                            : rf.level === "HIGH"
                            ? "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {rf.level}
                      </span>
                      <h5 className="text-sm font-bold text-white">{rf.title}</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {rf.explanation}
                    </p>
                    {rf.snippet && (
                      <div className="mt-2 rounded-lg bg-black border border-white/10 p-2.5 font-mono text-xs text-slate-300 break-all">
                        Target/Cuplikan: {rf.snippet}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Safety Recommendations */}
          <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h4 className="text-sm sm:text-base font-bold text-white">
                Langkah Pengamanan &amp; Mitigasi
              </h4>
            </div>

            <ul className="space-y-2.5">
              {result.recommendations &&
                result.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
            </ul>

            {/* Direct CTA to Action Center */}
            <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Apakah Anda atau kerabat Anda terlanjur menjadi target atau mengirim uang?
              </p>
              <button
                onClick={() => {
                  const payload = {
                    category:
                      result.detected_category?.includes("APK") || result.file_type_category === "APK_TROJAN"
                        ? "APK_SNIFFER"
                        : result.detected_category?.includes("Loker")
                        ? "LOKER_FREELANCE"
                        : "PHISHING_URL",
                    suspect_url:
                      result.normalized_url ||
                      result.clean_number ||
                      result.email ||
                      result.file_name ||
                      "",
                    chronology: `Hasil pemeriksaan PANDU: ${
                      result.detected_category || result.threat_level || "indikator digital"
                    }. Indeks indikator ${result.risk_score}%; hasil bergantung pada sumber yang berhasil diperiksa.`,
                  };
                  if (typeof window !== "undefined") {
                    try {
                      sessionStorage.setItem("pandu_forward_dossier", JSON.stringify(payload));
                    } catch (e) {}
                  }
                  if (onForwardToDossier) {
                    onForwardToDossier(payload);
                  } else {
                    router.push("/aksi");
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all w-full sm:w-auto"
              >
                <span>Bawa ke Pusat Laporan &amp; Daftar Hitam</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
