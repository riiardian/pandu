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

  // LOGIN SCREEN (Clean, Minimal, Sharp)
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600/30">
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0d0f13] p-6 sm:p-7 space-y-5 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 pb-1">
              <PanduLogo className="h-4 w-auto text-white" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                PANDU Console
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Verifikasi Laporan
            </h1>
            <p className="text-xs text-slate-400">
              Masuk untuk memeriksa dan memverifikasi laporan pengguna.
            </p>
          </div>

          {loginError && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-2.5 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_rio"
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              {loginLoading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN (Flat, Clean, Natural)
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <PanduLogo className="h-4.5 w-auto text-white" />
            <span className="text-sm font-bold text-white tracking-tight">
              Pusat Verifikasi Laporan
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              admin_rio
            </span>

            <button
              type="button"
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Segarkan data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer ml-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 space-y-6 text-left">
        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 px-4 py-2.5 text-xs text-blue-200 flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-xs text-blue-400 hover:underline cursor-pointer ml-3"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 1. Clean Neutral Metric Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-[#0d0f13] p-4 space-y-1">
            <span className="text-xs text-slate-400 block">Total Laporan</span>
            <div className="text-2xl font-bold font-mono text-white">
              {stats ? stats.total_reports : "0"}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d0f13] p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
              <span className="text-xs text-slate-400">Menunggu</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {stats ? stats.pending_reports : "0"}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d0f13] p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-slate-400">Terverifikasi</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {stats ? stats.verified_reports : "0"}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d0f13] p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400 inline-block" />
              <span className="text-xs text-slate-400">Ditolak</span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-300">
              {stats ? stats.rejected_reports : "0"}
            </div>
          </div>
        </section>

        {/* 2. Navigation Tabs & Search */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-2">
          {/* Underline Tabs */}
          <div className="flex items-center gap-5 text-xs sm:text-sm">
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
                  className={`pb-2 transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5 ${
                    active
                      ? "border-blue-600 text-white font-semibold"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari target, nomor, ID..."
              className="w-full rounded-lg border border-white/10 bg-[#0d0f13] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </section>

        {/* 3. Report Items */}
        <section className="space-y-3">
          {loading && reports.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500 rounded-xl border border-white/10 bg-[#0d0f13]">
              Memuat data laporan...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-xl border border-white/10 bg-[#0d0f13]">
              Tidak ada laporan yang sesuai.
            </div>
          ) : (
            filteredReports.map((report) => {
              const isPending = report.status === "pending";
              const isVerified = report.status === "verified";

              return (
                <div
                  key={report.id}
                  className="rounded-xl border border-white/10 bg-[#0d0f13] p-4 sm:p-5 space-y-3"
                >
                  {/* Row 1: ID, Time, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-400">
                        {report.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(report.id, `id-${report.id}`)}
                        className="text-slate-500 hover:text-white"
                        title="Salin ID"
                      >
                        {copiedId === `id-${report.id}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-xs font-mono text-slate-400">
                        {report.created_at}
                      </span>
                    </div>

                    {/* Status Dot */}
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPending
                            ? "bg-amber-400"
                            : isVerified
                            ? "bg-emerald-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span
                        className={
                          isPending
                            ? "text-amber-400"
                            : isVerified
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }
                      >
                        {isPending
                          ? "Menunggu"
                          : isVerified
                          ? "Terverifikasi"
                          : "Ditolak"}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Target Info & Category */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white break-all">
                        {report.identifier}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(report.identifier, `target-${report.id}`)}
                        className="text-slate-500 hover:text-white"
                        title="Salin Target"
                      >
                        {copiedId === `target-${report.id}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span>Tipe: {report.type}</span>
                      {report.reported_bank && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-blue-300">
                            Bank: {report.reported_bank}
                            {report.account_holder ? ` (a/n ${report.account_holder})` : ""}
                          </span>
                        </>
                      )}
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300">Modus: {report.category}</span>
                    </div>
                  </div>

                  {/* Row 3: Chronology */}
                  {report.chronology && (
                    <div className="text-xs text-slate-300 leading-relaxed pt-0.5">
                      <span className="text-slate-500 font-mono text-[11px] block">
                        Kronologi:
                      </span>
                      <p className="whitespace-pre-wrap">{report.chronology}</p>
                    </div>
                  )}

                  {/* Row 4: Evidence File */}
                  {report.evidence_file_name && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                        <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono truncate">{report.evidence_file_name}</span>
                        {report.evidence_sha256 && (
                          <span className="font-mono text-[10px] text-slate-600 hidden md:inline">
                            ({report.evidence_sha256.slice(0, 16)}...)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewEvidence(report)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Lihat Lampiran</span>
                      </button>
                    </div>
                  )}

                  {/* Row 5: Audit Review Notes (if already verified or rejected) */}
                  {report.reviewed_at && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <span>Direview: {report.reviewed_at}</span>
                      {report.review_notes && <span>Catatan: {report.review_notes}</span>}
                    </div>
                  )}

                  {/* Row 6: Action Buttons (Only for Pending) */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(report);
                          setReviewAction("reject");
                          setReviewNotes("");
                        }}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
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
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition-colors cursor-pointer shadow-sm"
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

      {/* MODAL: VERIFY / REJECT DIALOG (Clean, Compact) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d0f13] p-5 space-y-4 text-left shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                {reviewAction === "verify" ? "Verifikasi Laporan" : "Tolak Laporan"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {selectedReport.id} • {selectedReport.identifier}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400">
                Catatan (Opsional)
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Tuliskan catatan pemeriksaan..."
                className="w-full rounded-lg border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setSelectedReport(null)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteAction}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors ${
                  reviewAction === "verify"
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {actionLoading ? "Memproses..." : reviewAction === "verify" ? "Konfirmasi Verifikasi" : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EVIDENCE PREVIEW (Clean, Sharp) */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-xl border border-white/10 bg-[#0d0f13] overflow-hidden shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-white block truncate">
                  Bukti: {previewEvidence.evidence_file_name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block truncate">
                  {previewEvidence.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50 min-h-[260px]">
              {previewEvidence.evidence_file_name?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={`/api/v1/admin/evidence/${previewEvidence.id}`}
                  alt="Bukti Laporan"
                  className="max-h-[60vh] w-auto rounded-lg object-contain border border-white/10"
                />
              ) : (
                <div className="text-center space-y-2 p-6">
                  <FileText className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-300">
                    Berkas non-gambar ({previewEvidence.evidence_file_name})
                  </p>
                  <a
                    href={`/api/v1/admin/evidence/${previewEvidence.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Buka Berkas</span>
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="truncate pr-2">
                SHA-256: {previewEvidence.evidence_sha256}
              </span>
              <a
                href={`/api/v1/admin/evidence/${previewEvidence.id}`}
                download={previewEvidence.evidence_file_name}
                className="text-blue-400 hover:underline shrink-0"
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
