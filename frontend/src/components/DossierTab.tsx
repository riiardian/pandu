"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertOctagon,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Users,
  Building2,
  FileCheck2,
} from "lucide-react";

interface DossierTabProps {
  initialData?: {
    category: string;
    suspect_url?: string;
    chronology: string;
  } | null;
}

export default function DossierTab({ initialData }: DossierTabProps) {
  const [category, setCategory] = useState("LOKER_FREELANCE");
  const [victimPlatform, setVictimPlatform] = useState("WhatsApp");
  const [suspectPhone, setSuspectPhone] = useState("");
  const [suspectAccount, setSuspectAccount] = useState("");
  const [suspectURL, setSuspectURL] = useState("");
  const [lossAmount, setLossAmount] = useState<number>(0);
  const [chronology, setChronology] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossierResult, setDossierResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.category) setCategory(initialData.category);
      if (initialData.suspect_url) setSuspectURL(initialData.suspect_url);
      if (initialData.chronology) setChronology(initialData.chronology);
    }
  }, [initialData]);

  const handleGenerateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/dossier/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          victim_platform: victimPlatform,
          suspect_phone: suspectPhone,
          suspect_account: suspectAccount,
          suspect_url: suspectURL,
          loss_amount: Number(lossAmount) || 0,
          chronology,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDossierResult(json.data);
      }
    } catch (err) {
      console.error("Gagal generate dossier", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          Pusat Aksi & Draf Laporan Forensik
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
          Jangan biarkan rasa panik menguasai saat menjadi target atau korban penipuan. Susun berkas
          laporan terstandarisasi, dapatkan panduan pertolongan pertama (first-aid checklist), dan
          salin draf aduan resmi untuk Komdigi, CekRekening.id, dan Kepolisian dalam satu klik.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
            <AlertOctagon className="h-5 w-5 text-orange-600" />
            <h3 className="text-base font-bold text-zinc-900">Formulir Rekam Insiden</h3>
          </div>

          <form onSubmit={handleGenerateDossier} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Jenis Modus:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:border-orange-500 focus:outline-none"
              >
                <option value="LOKER_FREELANCE">Loker Freelance Palsu (Misi Like Video)</option>
                <option value="APK_SNIFFER">Penyebaran Malware .APK (Resi/Surat Tilang)</option>
                <option value="TRANSFER_PINJOL">Pinjol Ilegal / Investasi Bodong</option>
                <option value="PHISHING_URL">Situs Phishing / Undian Palsu</option>
                <option value="LAINNYA">Tipuan Digital Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Saluran Kontak:</label>
                <select
                  value={victimPlatform}
                  onChange={(e) => setVictimPlatform(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:border-orange-500 focus:outline-none"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Instagram">Instagram</option>
                  <option value="SMS">SMS / Telepon</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Nomor Kontak Pelaku:</label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={suspectPhone}
                  onChange={(e) => setSuspectPhone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Rekening / E-Wallet Penampung (Jika Ada):
              </label>
              <input
                type="text"
                placeholder="Contoh: BCA 1234567890 a.n Budi"
                value={suspectAccount}
                onChange={(e) => setSuspectAccount(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Tautan / Domain Palsu (Jika Ada):
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={suspectURL}
                onChange={(e) => setSuspectURL(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Total Kerugian Finansial (Rp):
              </label>
              <input
                type="number"
                placeholder="0 jika berhasil digagalkan"
                value={lossAmount || ""}
                onChange={(e) => setLossAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Ringkasan Kejadian:</label>
              <textarea
                rows={3}
                placeholder="Ceritakan kronologi singkat kejadian..."
                value={chronology}
                onChange={(e) => setChronology(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Menyusun Berkas Forensik..." : "Kompilasi Draf Laporan & Checklist"}
            </button>
          </form>
        </div>

        {/* Right Column: Output Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {dossierResult ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Dossier Header */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-zinc-900 px-2.5 py-1 text-xs font-mono font-bold text-white">
                    {dossierResult.dossier_id}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">{dossierResult.created_at}</span>
                </div>
                <h3 className="text-sm font-bold text-zinc-800">{dossierResult.incident_summary}</h3>
              </div>

              {/* First-Aid Emergency Checklist */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-600">
                  <ShieldCheck className="h-5 w-5" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">
                    Checklist Tindakan Darurat Mandiri
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {dossierResult.first_aid_checklist.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                          {item.priority}
                        </span>
                        <span className="font-bold text-zinc-900">{item.action_title}</span>
                      </div>
                      <p className="text-zinc-600 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Reporting Drafts */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">
                    Draf Laporan Resmi Siap Kirim (1-Click Copy)
                  </h4>
                </div>

                <div className="space-y-3">
                  {dossierResult.official_drafts.map((draft: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-800">{draft.channel_name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(draft.draft_text, `draft_${idx}`)}
                            className="flex items-center gap-1 rounded bg-white border border-zinc-300 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            {copiedKey === `draft_${idx}` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Salin Draf</span>
                              </>
                            )}
                          </button>
                          <a
                            href={draft.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <span>Buka Portal</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <pre className="rounded bg-white p-2.5 border border-zinc-200 font-mono text-[11px] text-zinc-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                        {draft.draft_text}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family Alert Warning Card */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">
                      Pesan Peringatan Grup WhatsApp Keluarga
                    </h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard(dossierResult.family_alert_card_text, "family_alert")}
                    className="flex items-center gap-1 rounded bg-white border border-zinc-300 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    {copiedKey === "family_alert" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Pesan WA</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 font-mono text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed">
                  {dossierResult.family_alert_card_text}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center h-full min-h-[380px]">
              <FileCheck2 className="h-12 w-12 text-zinc-300 mb-3" />
              <h4 className="text-sm font-bold text-zinc-700">Belum Ada Berkas yang Disusun</h4>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                Isi formulir di sebelah kiri atau lakukan scan di menu X-Ray untuk menyusun berkas
                tindakan resmi secara otomatis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
