"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  BrainCircuit,
  FileCode,
  ArrowRight,
  Flame,
} from "lucide-react";

interface ScannerTabProps {
  onForwardToDossier?: (data: {
    category: string;
    suspect_url?: string;
    chronology: string;
  }) => void;
}

export default function ScannerTab({ onForwardToDossier }: ScannerTabProps) {
  const router = useRouter();
  const [scanType, setScanType] = useState<"text" | "url">("text");
  const [inputText, setInputText] = useState("");
  const [inputURL, setInputURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const samples = {
    loker: "Halo kak! Kami dari Agensi Mitra Kreatif membuka loker sampingan mahasiswa. Tugasnya like video YouTube & follow toko Shopee, komisi harian 300rb langsung cair ke e-wallet. Tugas pertama gratis, tugas VIP cukup deposit modal 500rb slot terbatas hanya hari ini!",
    apk: "Selamat siang kak, paket J&T nomor resi JNT99201 tertahan di drop point karena alamat nomor rumah tidak jelas. Silakan cek foto paket dan nomor resi di lampiran: Lihat_Foto_Paket_JNT.apk",
    bcaFake: "https://bca-klik-promo-hadiah.site/login",
    bcaReal: "https://klikbca.com",
  };

  const handleRunScan = async () => {
    setErrorMsg("");
    setResult(null);

    if (scanType === "text" && !inputText.trim()) {
      setErrorMsg("Masukkan teks pesan atau chat yang ingin Anda periksa.");
      return;
    }
    if (scanType === "url" && !inputURL.trim()) {
      setErrorMsg("Masukkan tautan atau domain website yang ingin Anda periksa.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = scanType === "text" ? "/api/v1/scan/text" : "/api/v1/scan/url";
      const payload = scanType === "text"
        ? { text: inputText }
        : { url: inputURL, follow_redirects: true };

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
      setErrorMsg(err.message || "Gagal menghubungi API server.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (val: string, type: "text" | "url") => {
    setScanType(type);
    if (type === "text") {
      setInputText(val);
    } else {
      setInputURL(val);
    }
    setResult(null);
    setErrorMsg("");
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-rose-600 bg-rose-50 border-rose-200";
    if (score >= 35) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Deception X-Ray Scanner
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
            Pembedah pesan mencurigakan dan tautan digital berbasis aturan heuristik transparan.
            Sistem menganalisis tanda bahaya teknis (*red flags*) dan memetakan manipulasi psikologis
            (*cognitive bias*) tanpa mengumpulkan data pribadi Anda.
          </p>

          {/* Quick Samples for Evaluators */}
          <div className="mt-4 pt-3.5 border-t border-zinc-100">
            <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Uji Coba Cepat (Pilih Sampel Modus):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => loadSample(samples.loker, "text")}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                Loker Like Video
              </button>
              <button
                onClick={() => loadSample(samples.apk, "text")}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                Resi Kurir .APK
              </button>
              <button
                onClick={() => loadSample(samples.bcaFake, "url")}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                Phishing BCA (.site)
              </button>
              <button
                onClick={() => loadSample(samples.bcaReal, "url")}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                Resmi KlikBCA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        {/* Type Toggle - 50/50 full width */}
        <div className="border-b border-zinc-200 pb-3.5 mb-4">
          <div className="w-full grid grid-cols-2 rounded-lg bg-zinc-100 p-1">
            <button
              onClick={() => {
                setScanType("text");
                setResult(null);
              }}
              className={`rounded-md py-1.5 text-xs sm:text-sm font-bold transition-all text-center ${
                scanType === "text"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Pesan / Chat Teks
            </button>
            <button
              onClick={() => {
                setScanType("url");
                setResult(null);
              }}
              className={`rounded-md py-1.5 text-xs sm:text-sm font-bold transition-all text-center ${
                scanType === "url"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Tautan / Web (URL)
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        {scanType === "text" ? (
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Tempelkan Pesan WhatsApp / SMS / Telegram yang Mencurigakan:
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Contoh: Halo kak, kami dari Shopee/YouTube membuka pekerjaan sampingan like video komisi 300rb per hari. Hubungi telegram kami..."
              className="w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Masukkan Alamat Web atau Link yang Diterima:
            </label>
            <div className="flex rounded-lg border border-zinc-300 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <span className="inline-flex items-center px-3 text-xs text-zinc-500 bg-zinc-50 border-r border-zinc-300 rounded-l-lg font-mono">
                https://
              </span>
              <input
                type="text"
                value={inputURL}
                onChange={(e) => setInputURL(e.target.value)}
                placeholder="contoh: bca-promo-gebyar.xyz/login"
                className="w-full rounded-r-lg p-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRunScan}
            disabled={loading}
            className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus:outline-none transition-colors disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? "Membedah Anatomi Pesan..." : "Bedah Indikator Bahaya"}</span>
          </button>
        </div>
      </div>

      {/* Result Cards */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Header Score Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Hasil Diagnosis X-Ray
                </span>
                <h3 className="text-xl font-bold text-zinc-900 mt-1">
                  {result.detected_category || (result.impersonated_brand ? `Pencatutan ${result.impersonated_brand}` : "Analisis Keamanan Domain")}
                </h3>
                {result.hostname && (
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">
                    Host: {result.hostname} {result.tld ? `(${result.tld})` : ""}
                  </p>
                )}
              </div>

              {/* Score Badge */}
              <div className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${getScoreColor(result.risk_score)}`}>
                <div className="text-right">
                  <div className="text-2xl font-black">{result.risk_score}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">Indeks Risiko</div>
                </div>
                <div className="h-8 w-px bg-current opacity-20" />
                <div className="text-xs font-bold uppercase tracking-wide">
                  {result.threat_level}
                </div>
              </div>
            </div>
          </div>

          {/* Cognitive Bias Profiler (Psychological Anatomy) */}
          {result.cognitive_biases && result.cognitive_biases.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="h-5 w-5 text-purple-600" />
                <h4 className="text-base font-bold text-zinc-900">
                  Cognitive Bias Profiler (Manipulasi Psikologis)
                </h4>
              </div>
              <p className="text-xs text-zinc-600 mb-4">
                Penipu memanipulasi cara berpikir Anda dengan mengeksploitasi bias emosi berikut:
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {result.cognitive_biases.map((bias: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-purple-100 bg-purple-50/50 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">{bias.label}</span>
                      <span className="rounded bg-purple-200 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                        Bobot +{bias.weight}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{bias.description}</p>
                    {bias.trigger_words && bias.trigger_words.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {bias.trigger_words.map((tw: string, tidx: number) => (
                          <span
                            key={tidx}
                            className="rounded bg-white border border-purple-200 px-1.5 py-0.5 text-[10px] font-mono text-purple-700"
                          >
                            "{tw}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags Breakdown (Technical Explainable Indicators) */}
          {result.red_flags && result.red_flags.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-rose-600" />
                <h4 className="text-base font-bold text-zinc-900">
                  Tanda Bahaya Terverifikasi (Explainable Red Flags)
                </h4>
              </div>

              <div className="space-y-3">
                {result.red_flags.map((rf: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          rf.level === "CRITICAL"
                            ? "bg-rose-600 text-white"
                            : rf.level === "HIGH"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-200 text-zinc-800"
                        }`}
                      >
                        {rf.level}
                      </span>
                      <h5 className="text-sm font-bold text-zinc-900">{rf.title}</h5>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed pt-1">
                      {rf.explanation}
                    </p>
                    {rf.snippet && (
                      <div className="mt-2 rounded bg-white p-2 border border-zinc-200 font-mono text-xs text-zinc-700 break-all">
                        Cuplikan: {rf.snippet}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Recommendations & Bridge to Dossier */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h4 className="text-base font-bold text-zinc-900">Langkah Pengamanan yang Wajib Dilakukan</h4>
            </div>

            <ul className="space-y-2 mb-5">
              {result.recommendations &&
                result.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
            </ul>

            {/* CTA Button to Dossier */}
            <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                Apakah Anda atau kerabat Anda terlanjur menjadi target atau mengirim uang?
              </p>
              <button
                onClick={() => {
                  const payload = {
                    category: result.detected_category?.includes("APK")
                      ? "APK_SNIFFER"
                      : result.detected_category?.includes("Loker")
                      ? "LOKER_FREELANCE"
                      : "PHISHING_URL",
                    suspect_url:
                      result.normalized_url ||
                      (result.extracted_urls ? result.extracted_urls[0] : ""),
                    chronology: `Terdeteksi indikasi ${
                      result.detected_category || "penipuan"
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
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center"
              >
                <span>Bawa ke Pusat Aksi & Draf Laporan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
