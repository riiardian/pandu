"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Lock,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  Eye,
  AlertTriangle,
  Search,
} from "lucide-react";

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
        setLoginError(data.message || "Gagal masuk: Kredensial tidak valid");
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

  const handleVerify = async (reportId: string) => {
    if (!token) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const res = await fetch(`/api/v1/admin/reports/${reportId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memverifikasi laporan");
      }

      setActionFeedback("Laporan berhasil diverifikasi dan disinkronkan ke daftar hitam.");
      setSelectedReport(null);
      setReviewNotes("");
      loadDashboardData(token);
    } catch (err: any) {
      setActionFeedback("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reportId: string) => {
    if (!token) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const res = await fetch(`/api/v1/admin/reports/${reportId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal menolak laporan");
      }

      setActionFeedback("Laporan berhasil ditolak.");
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

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600/30">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111317] p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-2 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-1">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              PANDU Forensics
            </h1>
            <p className="text-xs text-slate-400">
              Panel Verifikasi Laporan & Daftar Hitam Ancaman Siber
            </p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                Username Admin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_rio"
                required
                className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                Kunci Akses (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                required
                className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              {loginLoading ? "Memverifikasi Kredensial..." : "Masuk ke Panel Kendali"}
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 text-center">
            <span className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Dual-Key HMAC Encrypted Session • Rate-Limited</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0d0e12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-mono font-black text-xs">
              P
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Pusat Verifikasi Laporan Forensik
                </span>
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                  LIVE OPS
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 block">
                Operasi Intelijen Siber PANDU • Akses Terautentikasi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 space-y-6 text-left">
        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-4 text-xs sm:text-sm text-blue-200 flex items-center justify-between animate-in fade-in">
            <span>{actionFeedback}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-xs font-bold text-blue-400 hover:underline ml-3"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 1. Quick Stats Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-[#111317] p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Total Laporan
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats ? stats.total_reports : "—"}
            </div>
            <span className="text-[10px] text-slate-500 block">Seluruh riwayat aduan masuk</span>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              Menunggu Review
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
              {stats ? stats.pending_reports : "—"}
            </div>
            <span className="text-[10px] text-amber-500/80 block">Wajib diverifikasi buktinya</span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
              Terverifikasi
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
              {stats ? stats.verified_reports : "—"}
            </div>
            <span className="text-[10px] text-emerald-500/80 block">Masuk daftar hitam aktif</span>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400">
              Ditolak
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">
              {stats ? stats.rejected_reports : "—"}
            </div>
            <span className="text-[10px] text-rose-500/80 block">Bukti palsu / tidak valid</span>
          </div>
        </section>

        {/* 2. Controls & Search Filter */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors shrink-0 ${
                    active
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-[#111317] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        active ? "bg-white/20 text-white" : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari target, nomor, ID..."
              className="w-full rounded-lg border border-white/10 bg-[#111317] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </section>

        {/* 3. Report List */}
        <section className="space-y-4">
          {loading && reports.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-slate-400 rounded-2xl border border-white/10 bg-[#111317]">
              Memuat data laporan siber...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 rounded-2xl border border-white/10 bg-[#111317] space-y-1">
              <div className="font-semibold text-white">Tidak ada laporan yang sesuai</div>
              <p className="text-slate-500">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian Anda."
                  : "Belum ada aduan penipuan dalam kategori ini."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map((report) => {
                const isPending = report.status === "pending";
                const isVerified = report.status === "verified";
                const isRejected = report.status === "rejected";

                return (
                  <div
                    key={report.id}
                    className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-xl transition-all ${
                      isPending
                        ? "border-amber-500/30 bg-[#13151b]"
                        : isVerified
                        ? "border-emerald-500/20 bg-[#111317]"
                        : "border-white/10 bg-[#111317] opacity-60"
                    }`}
                  >
                    {/* Header Row: ID, Time, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          {report.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(report.id, `id-${report.id}`)}
                          className="text-slate-500 hover:text-white"
                          title="Salin ID Laporan"
                        >
                          {copiedId === `id-${report.id}` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        <span className="text-[11px] text-slate-500">•</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {report.created_at}
                        </span>
                        {report.client_ip && (
                          <span className="text-[10px] font-mono text-slate-600 hidden sm:inline">
                            (IP: {report.client_ip})
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                          isPending
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : isVerified
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {isPending && <Clock className="h-3 w-3" />}
                        {isVerified && <CheckCircle2 className="h-3 w-3" />}
                        {isRejected && <XCircle className="h-3 w-3" />}
                        <span className="uppercase">
                          {isPending ? "Menunggu Verifikasi" : isVerified ? "Terverifikasi" : "Ditolak"}
                        </span>
                      </span>
                    </div>

                    {/* Report Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left: Target Identifier & Category */}
                      <div className="md:col-span-5 space-y-3">
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                            Target Terlapor ({report.type})
                          </span>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-base font-mono font-bold text-white break-all">
                              {report.identifier}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(report.identifier, `target-${report.id}`)}
                              className="text-slate-500 hover:text-white shrink-0"
                              title="Salin Target"
                            >
                              {copiedId === `target-${report.id}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          {report.reported_bank && (
                            <span className="text-xs text-blue-400 font-semibold block pt-0.5">
                              Bank: {report.reported_bank}
                              {report.account_holder ? ` • a/n ${report.account_holder}` : ""}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                            Kategori Modus
                          </span>
                          <span className="inline-block mt-0.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-200">
                            {report.category}
                          </span>
                        </div>
                      </div>

                      {/* Right: Chronology */}
                      <div className="md:col-span-7 space-y-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                          Kronologi Kejadian dari Pelapor
                        </span>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed p-3 rounded-xl bg-black/40 border border-white/5 whitespace-pre-wrap">
                          {report.chronology || "(Tidak ada rincian kronologi)"}
                        </p>
                      </div>
                    </div>

                    {/* Evidence Section */}
                    {report.evidence_file_name && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-slate-300">
                            <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                            <span className="font-mono font-semibold truncate text-white">
                              {report.evidence_file_name}
                            </span>
                          </div>
                          {report.evidence_sha256 && (
                            <span className="font-mono text-[10px] text-slate-400 block truncate">
                              SHA-256: {report.evidence_sha256}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewEvidence(report)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 px-3.5 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition-colors shrink-0 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Lihat Bukti Lampiran</span>
                        </button>
                      </div>
                    )}

                    {/* Review Notes (if already reviewed) */}
                    {report.reviewed_at && (
                      <div className="text-[11px] text-slate-400 border-t border-white/5 pt-2 flex items-center justify-between">
                        <span>Direview pada: {report.reviewed_at}</span>
                        {report.review_notes && <span>Catatan: {report.review_notes}</span>}
                      </div>
                    )}

                    {/* Actions Bar for Pending Reports */}
                    {isPending && (
                      <div className="border-t border-white/10 pt-3 flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(report);
                            setReviewNotes("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/20 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Tolak Laporan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(report);
                            setReviewNotes("Bukti otentik valid dan sesuai.");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Verifikasi & Masukkan Daftar Hitam</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL: VERIFY / REJECT CONFIRMATION */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121419] p-6 space-y-4 shadow-2xl text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Tindakan Review Laporan: {selectedReport.id}
              </h3>
              <p className="text-xs text-slate-400">
                Target: <span className="font-mono text-white font-bold">{selectedReport.identifier}</span> ({selectedReport.category})
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                Catatan Pemeriksa Forensik (Opsional)
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Tuliskan catatan verifikasi bukti atau alasan penolakan..."
                className="w-full rounded-xl border border-white/10 bg-[#06070a] p-3 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setSelectedReport(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReject(selectedReport.id)}
                className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-950/60 cursor-pointer"
              >
                {actionLoading ? "Memproses..." : "Tolak Laporan"}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleVerify(selectedReport.id)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer shadow-md"
              >
                {actionLoading ? "Menyimpan..." : "Konfirmasi Verifikasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EVIDENCE PREVIEW */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-[#121419] overflow-hidden shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 p-4 bg-[#0e1014]">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-mono font-bold text-blue-400 block truncate">
                  Bukti Laporan {previewEvidence.id}
                </span>
                <span className="text-xs text-white truncate block font-medium">
                  {previewEvidence.evidence_file_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 min-h-[300px]">
              {previewEvidence.evidence_file_name?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={`/api/v1/admin/evidence/${previewEvidence.id}`}
                  alt="Bukti Laporan"
                  className="max-h-[65vh] w-auto rounded-lg object-contain border border-white/10"
                />
              ) : (
                <div className="text-center space-y-3 p-6">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto" />
                  <p className="text-xs text-slate-300">
                    Berkas berformat non-gambar ({previewEvidence.evidence_file_name})
                  </p>
                  <a
                    href={`/api/v1/admin/evidence/${previewEvidence.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Buka / Unduh Berkas</span>
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3 bg-[#0e1014] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="truncate pr-2">SHA-256: {previewEvidence.evidence_sha256}</span>
              <a
                href={`/api/v1/admin/evidence/${previewEvidence.id}`}
                download={previewEvidence.evidence_file_name}
                className="text-blue-400 hover:underline shrink-0"
              >
                Unduh File Asli
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
