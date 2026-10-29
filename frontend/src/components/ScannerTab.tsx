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
  MessageSquare,
  Globe,
  Phone,
  CreditCard,
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

type ScanCategory = "text" | "url" | "phone" | "bank" | "email" | "file";

export default function ScannerTab({ onForwardToDossier }: ScannerTabProps) {
  const router = useRouter();
  const [scanType, setScanType] = useState<ScanCategory>("text");

  // Form states
  const [inputText, setInputText] = useState("");
  const [inputURL, setInputURL] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [inputBankName, setInputBankName] = useState("BCA");
  const [inputBankAcc, setInputBankAcc] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRunScan = async () => {
    setErrorMsg("");
    setResult(null);

    let endpoint = "";
    let payload: any = {};

    if (scanType === "text") {
      if (!inputText.trim()) {
        setErrorMsg("Masukkan teks pesan atau chat yang ingin Anda periksa.");
        return;
      }
      endpoint = "/api/v1/scan/text";
      payload = { text: inputText };
    } else if (scanType === "url") {
      if (!inputURL.trim()) {
        setErrorMsg("Masukkan tautan atau domain website yang ingin Anda periksa.");
        return;
      }
      endpoint = "/api/v1/scan/url";
      payload = { url: inputURL, follow_redirects: true };
    } else if (scanType === "phone") {
      if (!inputPhone.trim()) {
        setErrorMsg("Masukkan nomor telepon atau nomor WhatsApp yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/phone";
      payload = { phone: inputPhone };
    } else if (scanType === "bank") {
      if (!inputBankAcc.trim()) {
        setErrorMsg("Masukkan nomor rekening bank atau nomor akun e-wallet.");
        return;
      }
      endpoint = "/api/v1/scan/bank";
      payload = { bank_name: inputBankName, account_number: inputBankAcc };
    } else if (scanType === "email") {
      if (!inputEmail.trim()) {
        setErrorMsg("Masukkan alamat email yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/email";
      payload = { email: inputEmail };
    } else if (scanType === "file") {
      if (!fileName.trim()) {
        setErrorMsg("Pilih atau masukkan nama berkas yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/file";
      payload = { file_name: fileName, file_size: fileSize };
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
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
      setFileName(file.name);
      setFileSize(file.size);
      setErrorMsg("");
      setResult(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-rose-400 bg-rose-950/40 border-rose-500/40";
    if (score >= 35) return "text-amber-400 bg-amber-950/40 border-amber-500/40";
    return "text-emerald-400 bg-emerald-950/40 border-emerald-500/40";
  };

  const TABS = [
    { id: "text", label: "Pesan Chat", icon: MessageSquare },
    { id: "url", label: "Tautan Web", icon: Globe },
    { id: "phone", label: "No. Telepon", icon: Phone },
    { id: "bank", label: "Rekening Bank", icon: CreditCard },
    { id: "email", label: "Alamat Email", icon: Mail },
    { id: "file", label: "Berkas / APK", icon: FileCode },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Intro Header Section */}
      <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-2 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Radar Forensik Siber
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
          Layanan deteksi terpadu untuk memverifikasi nomor kontak, rekening bank, tautan web, email, dan muatan file mencurigakan dari potensi kejahatan sosial engineering.
        </p>
      </section>

      {/* Main Scanner Card */}
      <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-5 shadow-xl">
        {/* Multi-Target Category Tabs */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Pilih Target Investigasi:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = scanType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setScanType(tab.id as ScanCategory);
                    setResult(null);
                    setErrorMsg("");
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500"
                      : "bg-[#0d0e12] border border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="text-[11px] leading-tight text-center">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form Fields by Active Tab */}
        <div className="pt-2 border-t border-white/10">
          {scanType === "text" && (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Muatan Teks Pesan WhatsApp / SMS / Telegram:
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Contoh: Halo kak, kami dari Shopee/YouTube membuka lowongan sampingan like video komisi 300rb per hari. Hubungi telegram admin untuk klaim bonus..."
                className="w-full rounded-xl border border-white/10 bg-[#060a14] p-3 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
              />
            </div>
          )}

          {scanType === "url" && (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Alamat Web atau Tautan yang Diterima:
              </label>
              <div className="flex rounded-xl border border-white/10 bg-[#060a14] overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <span className="inline-flex items-center px-3.5 text-xs text-slate-400 bg-white/5 border-r border-white/10 font-mono">
                  https://
                </span>
                <input
                  type="text"
                  value={inputURL}
                  onChange={(e) => setInputURL(e.target.value)}
                  placeholder="bca-tarif-transaksi.xyz/login atau link penerimaan bansos"
                  className="w-full p-3 text-sm text-white bg-transparent placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {scanType === "phone" && (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Nomor Telepon atau WhatsApp yang Menghubungi:
              </label>
              <input
                type="text"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="Contoh: 085819238491 atau +62821..."
                className="w-full rounded-xl border border-white/10 bg-[#060a14] p-3 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Sistem akan memverifikasi operator, kode wilayah, serta rekam jejak laporan kejahatan di basis data.
              </p>
            </div>
          )}

          {scanType === "bank" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pilih Bank atau Layanan E-Wallet:
                </label>
                <select
                  value={inputBankName}
                  onChange={(e) => setInputBankName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#060a14] p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="CIMB">CIMB Niaga</option>
                  <option value="Danamon">Bank Danamon</option>
                  <option value="Permata">Bank Permata</option>
                  <option value="BTN">BTN (Bank Tabungan Negara)</option>
                  <option value="Jago">Bank Jago</option>
                  <option value="SeaBank">SeaBank Indonesia</option>
                  <option value="DANA">DANA (E-Wallet)</option>
                  <option value="GoPay">GoPay (E-Wallet)</option>
                  <option value="OVO">OVO (E-Wallet)</option>
                  <option value="ShopeePay">ShopeePay (E-Wallet)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nomor Rekening / Akun Penerima Dana:
                </label>
                <input
                  type="text"
                  value={inputBankAcc}
                  onChange={(e) => setInputBankAcc(e.target.value)}
                  placeholder="Contoh: 8271039481"
                  className="w-full rounded-xl border border-white/10 bg-[#060a14] p-3 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {scanType === "email" && (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Alamat Email Pengirim:
              </label>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="Contoh: rekrutmen.pertamina@gmail.com atau official@bca-promo.site"
                className="w-full rounded-xl border border-white/10 bg-[#060a14] p-3 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                PANDU memeriksa apakah pengirim menggunakan email sekali pakai, domain tiruan (typosquatting), atau mencatut instansi perbankan dengan webmail gratisan.
              </p>
            </div>
          )}

          {scanType === "file" && (
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Pemeriksaan Berkas (.APK, Dokumen, atau Screenshot Bukti):
              </label>

              <div className="rounded-xl border border-dashed border-white/20 bg-[#060a14] p-5 text-center">
                <Upload className="h-7 w-7 text-blue-400 mx-auto mb-2" />
                <label className="inline-block cursor-pointer rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">
                  <span>Pilih Berkas dari HP</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".apk,.exe,.zip,.pdf,.jpg,.jpeg,.png,.webp"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-2">
                  Format didukung: Berkas Android (.APK), Gambar tangkapan layar chat/transfer (.PNG, .JPG), atau Dokumen lampiran.
                </p>
              </div>

              {fileName && (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-white font-medium">{fileName}</span>
                    {fileSize > 0 && (
                      <span className="text-slate-500">({(fileSize / 1024).toFixed(1)} KB)</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setFileName("");
                      setFileSize(0);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus:outline-none transition-all disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? "Membedah Indikator Bahaya..." : "Mulai Analisis Forensik"}</span>
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

            {/* Blacklist Match Card if registered */}
            {result.blacklist_entry && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Flame className="h-4 w-4 shrink-0" />
                  <span>Entitas Resmi Terdaftar di Basis Data Daftar Hitam PANDU</span>
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

            {/* Technical Detail Badges */}
            {(result.operator || result.institution_type || result.domain || result.dangerous_perms) && (
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {result.operator && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Operator Seluler:</span>
                    <span className="font-bold text-white">{result.operator}</span>
                  </div>
                )}
                {result.country_name && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Wilayah Asal:</span>
                    <span className="font-bold text-white">{result.country_name}</span>
                  </div>
                )}
                {result.institution_type && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Tipe Lembaga:</span>
                    <span className="font-bold text-white">{result.institution_type}</span>
                  </div>
                )}
                {result.standard_digits && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Standar Digit Rekening:</span>
                    <span className="font-bold text-white">{result.standard_digits}</span>
                  </div>
                )}
                {result.domain && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Domain Server:</span>
                    <span className="font-bold text-white font-mono">@{result.domain}</span>
                  </div>
                )}
                {result.file_type_category && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Klasifikasi File:</span>
                    <span className="font-bold text-white font-mono">{result.file_type_category}</span>
                  </div>
                )}
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
                  Tanda Bahaya Terverifikasi (Explainable Red Flags)
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
                    chronology: `Terdeteksi indikasi ${
                      result.detected_category || result.threat_level || "penipuan"
                    } dengan skor risiko ${result.risk_score}%.`,
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
