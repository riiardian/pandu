"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Check,
  Copy,
  Eye,
  Search,
  ExternalLink,
  RefreshCw,
  LogOut,
  AlertCircle,
  X,
} from "lucide-react";
import PanduLogo from "@/components/PanduLogo";

interface ThreatReport {
  id: string;
  type: string;
  identifier: string;
  clean_key: string;
  category: string;
  reported_bank?: string;
  account_holder?: string;
  chronology: string;
  evidence_file_name?: string;
  evidence_file_path?: string;
  evidence_sha256?: string;
  status: "pending" | "verified" | "rejected";
  client_ip?: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface ReportStats {
  total_reports: number;
  pending_reports: number;
  verified_reports: number;
  rejected_reports: number;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split(" ");
    if (parts.length === 2) {
      const datePart = parts[0];
      const timePart = parts[1].slice(0, 5); // HH:MM
      const today = new Date().toISOString().slice(0, 10);
      if (datePart === today) {
        return `Hari ini, ${timePart}`;
      }
      return `${datePart}, ${timePart}`;
    }
  } catch {}
  return dateStr;
}

function formatTarget(identifier: string, type: string): string {
  if (!identifier) return "";
  if (type === "phone" && identifier.startsWith("08") && identifier.length >= 10) {
    if (identifier.length === 11) {
      return `${identifier.slice(0, 4)}-${identifier.slice(4, 7)}-${identifier.slice(7)}`;
    }
    if (identifier.length >= 12) {
      return `${identifier.slice(0, 4)}-${identifier.slice(4, 8)}-${identifier.slice(8)}`;
    }
  }
  return identifier;
}

export default function AdminVerificationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard states
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ThreatReport | null>(null);
  const [reviewAction, setReviewAction] = useState<"verify" | "reject">("verify");
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<ThreatReport | null>(null);

  // Ensure Light Mode theme on admin panel
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    return () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("pandu_theme");
        if (saved === "dark" || !saved) {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
        }
      }
    };
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? sessionStorage.getItem("pandu_admin_token") : null;
    if (savedToken) {
      setToken(savedToken);
      fetchSession(savedToken);
    }
  }, []);

  const fetchSession = async (currentToken: string) => {
    try {
      const res = await fetch("/api/v1/admin/auth/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(currentToken);
        loadDashboardData(currentToken);
      } else {
        sessionStorage.removeItem("pandu_admin_token");
        setToken(null);
      }
    } catch {
      sessionStorage.removeItem("pandu_admin_token");
      setToken(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || "Kredensial tidak valid");
        setLoginLoading(false);
        return;
      }

      const receivedToken = data.token;
      sessionStorage.setItem("pandu_admin_token", receivedToken);
      setToken(receivedToken);
      setPassword("");
      loadDashboardData(receivedToken);
    } catch (err: any) {
      setLoginError(err.message || "Gagal menghubungi server");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/v1/admin/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    sessionStorage.removeItem("pandu_admin_token");
    setToken(null);
    setReports([]);
    setStats(null);
  };

  const loadDashboardData = async (activeToken = token) => {
    if (!activeToken) return;
    setLoading(true);
    setActionFeedback(null);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/v1/admin/stats", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // 2. Fetch Reports
      const reportsRes = await fetch(`/api/v1/admin/reports?status=${statusFilter}&limit=100`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        if (reportsData.success) {
          setReports(reportsData.data || []);
        }
      }
    } catch (err: any) {
      setActionFeedback("Gagal memperbarui data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData(token);
    }
  }, [statusFilter]);

  const handleExecuteAction = async () => {
    if (!token || !selectedReport) return;
    setActionLoading(true);
    setActionFeedback(null);

    const isVerify = reviewAction === "verify";
    const endpoint = `/api/v1/admin/reports/${selectedReport.id}/${isVerify ? "verify" : "reject"}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Gagal ${isVerify ? "memverifikasi" : "menolak"} laporan`);
      }

      setActionFeedback(
        isVerify
          ? "Laporan berhasil diverifikasi dan disinkronkan ke daftar hitam."
          : "Laporan berhasil ditolak."
      );
      setSelectedReport(null);
      setReviewNotes("");
      loadDashboardData(token);
    } catch (err: any) {
      setActionFeedback("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filtered reports by search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.identifier.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.chronology.toLowerCase().includes(q) ||
        (r.reported_bank && r.reported_bank.toLowerCase().includes(q))
    );
  }, [reports, searchQuery]);

  // LOGIN SCREEN (Natural, Clean, No Badges)
  if (!token) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 selection:bg-blue-100">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-7 sm:p-8 space-y-6 text-left shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 pb-1">
              <PanduLogo className="h-4.5 w-auto text-slate-900" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                PANDU Console
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Verifikasi Laporan
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Masuk untuk memeriksa dan memverifikasi laporan pengguna.
            </p>
          </div>

          {loginError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_rio"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none font-mono transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              {loginLoading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN (Pure Natural, Zero Badges, Unified Slate Palette)
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <PanduLogo className="h-4.5 w-auto text-slate-900" />
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Pusat Verifikasi Laporan
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              admin_rio
            </span>

            <button
              type="button"
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Segarkan data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-rose-600 transition-colors cursor-pointer ml-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6 space-y-4 text-left">
        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 flex items-center justify-between shadow-xs">
            <span>{actionFeedback}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-xs text-blue-600 hover:underline cursor-pointer ml-3 font-medium"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 1. Clean Navigation Bar: Underline Tabs & Search (Zero Badges, Zero Colored Boxes) */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          {/* Flat Underline Tabs (No badge pills) */}
          <div className="flex items-center gap-6 text-xs sm:text-sm">
            {[
              { id: "all", label: "Semua", count: stats?.total_reports },
              { id: "pending", label: "Menunggu", count: stats?.pending_reports },
              { id: "verified", label: "Terverifikasi", count: stats?.verified_reports },
              { id: "rejected", label: "Ditolak", count: stats?.rejected_reports },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`pb-2 -mb-px border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "border-blue-600 text-blue-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[11px] font-mono text-slate-400">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clean Search Input */}
          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari target, nomor, ID..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-7 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </section>

        {/* 2. Natural Report Cards Queue (Zero Badges, Pure Typography) */}
        <section className="space-y-3">
          {loading && reports.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500 rounded-xl border border-slate-200 bg-white">
              Memuat data laporan...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-200 bg-white">
              Tidak ada laporan yang sesuai.
            </div>
          ) : (
            filteredReports.map((report) => {
              const isPending = report.status === "pending";
              const isVerified = report.status === "verified";
              const isImage = report.evidence_file_name?.match(/\.(jpg|jpeg|png|webp)$/i);

              return (
                <div
                  key={report.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 shadow-xs"
                >
                  {/* Row 1: Status (Plain Text, NO BADGE), Time, ID */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={isPending ? "text-amber-700 font-semibold" : isVerified ? "text-emerald-700 font-semibold" : "text-slate-500 font-medium"}>
                        {isPending ? "Menunggu Verifikasi" : isVerified ? "Terverifikasi" : "Ditolak"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">
                        {formatDisplayDate(report.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                      <span>{report.id}</span>
                      <button
                        type="button"
                        onClick={() => copyText(report.id, `id-${report.id}`)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Salin ID"
                      >
                        {copiedId === `id-${report.id}` ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Target & Modus Category (Plain text, NO BADGE) */}
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-base sm:text-lg font-bold text-slate-900 break-all">
                        {formatTarget(report.identifier, report.type)}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(report.identifier, `target-${report.id}`)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Salin Target"
                      >
                        {copiedId === `target-${report.id}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                      <span>{report.category}</span>
                      {report.reported_bank && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700">
                            {report.reported_bank}
                            {report.account_holder ? ` (${report.account_holder})` : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Chronology (Plain clean paragraph) */}
                  {report.chronology && (
                    <div className="text-xs text-slate-700 leading-relaxed pt-0.5">
                      <span className="text-slate-400 text-[11px] block">
                        Kronologi:
                      </span>
                      <p className="whitespace-pre-wrap">{report.chronology}</p>
                    </div>
                  )}

                  {/* Row 4: Evidence Attachment (Clean Row, NO Button Badge) */}
                  {report.evidence_file_name && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isImage ? (
                          <img
                            src={`/api/v1/admin/evidence/${report.id}`}
                            alt="Bukti Lampiran"
                            onClick={() => setPreviewEvidence(report)}
                            className="h-10 w-10 rounded object-cover border border-slate-200 bg-white shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                        )}

                        <div className="min-w-0">
                          <span className="font-medium text-slate-800 block truncate">
                            {report.evidence_file_name}
                          </span>
                          {report.evidence_sha256 && (
                            <span className="font-mono text-[10px] text-slate-400 block truncate">
                              SHA: {report.evidence_sha256.slice(0, 16)}...
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewEvidence(report)}
                        className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                      >
                        Lihat Gambar
                      </button>
                    </div>
                  )}

                  {/* Row 5: Audit Review Notes (if already verified or rejected) */}
                  {report.reviewed_at && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span>Direview: {formatDisplayDate(report.reviewed_at)}</span>
                      {report.review_notes && <span>Catatan: {report.review_notes}</span>}
                    </div>
                  )}

                  {/* Row 6: Action Buttons (Only for Pending, Clean & Simple) */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(report);
                          setReviewAction("reject");
                          setReviewNotes("");
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(report);
                          setReviewAction("verify");
                          setReviewNotes("Bukti otentik valid.");
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Verifikasi
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* MODAL: VERIFY / REJECT DIALOG */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 space-y-4 text-left shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                {reviewAction === "verify" ? "Konfirmasi Verifikasi Laporan" : "Tolak Laporan"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedReport.id} • {selectedReport.identifier}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Catatan Pemeriksaan (Opsional)
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Tuliskan catatan pemeriksaan..."
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setSelectedReport(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteAction}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors ${
                  reviewAction === "verify"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading ? "Memproses..." : reviewAction === "verify" ? "Verifikasi & Sinkronkan" : "Tolak Laporan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EVIDENCE PREVIEW */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  Bukti: {previewEvidence.evidence_file_name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block truncate">
                  {previewEvidence.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100 min-h-[260px]">
              {previewEvidence.evidence_file_name?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={`/api/v1/admin/evidence/${previewEvidence.id}`}
                  alt="Bukti Laporan"
                  className="max-h-[60vh] w-auto rounded object-contain border border-slate-300 shadow-sm bg-white"
                />
              ) : (
                <div className="text-center space-y-2 p-6">
                  <FileText className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    Berkas non-gambar ({previewEvidence.evidence_file_name})
                  </p>
                  <a
                    href={`/api/v1/admin/evidence/${previewEvidence.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Buka Berkas</span>
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="truncate pr-2">
                SHA: {previewEvidence.evidence_sha256}
              </span>
              <a
                href={`/api/v1/admin/evidence/${previewEvidence.id}`}
                download={previewEvidence.evidence_file_name}
                className="text-blue-600 font-medium hover:underline shrink-0"
              >
                Unduh
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
