"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Home,
  ShieldAlert,
  BookOpen,
  FileCheck2,
  ChevronRight,
  Shield,
  Activity,
  ArrowUpRight,
} from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu automatically on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isHome = pathname === "/";
  const isXray = pathname.startsWith("/xray");
  const isSimulasi = pathname.startsWith("/simulasi");
  const isAksi =
    pathname.startsWith("/aksi") ||
    pathname.startsWith("/dossier") ||
    pathname.startsWith("/laporan");

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-transparent border-none">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Brand & Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none min-w-0"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-600/30">
              <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white block leading-tight">
              PANDU
            </span>
          </Link>

          {/* Minimalist Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            className="flex h-9 w-9 items-center justify-center text-slate-200 hover:text-blue-400 focus:outline-none transition-all active:scale-90"
          >
            {isOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3.5" y1="7" x2="20.5" y2="7" />
                <line x1="3.5" y1="12" x2="16.5" y2="12" />
                <line x1="3.5" y1="17" x2="20.5" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Modern High-End Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop with Soft Blur */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          />

          {/* Premium Narrow Glassmorphism Drawer */}
          <div className="relative ml-auto flex h-full w-[78vw] max-w-[310px] flex-col bg-[#0b0c10]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right duration-200 text-slate-200 select-none">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 bg-[#0f1117]/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shrink-0 shadow-md shadow-blue-600/30">
                  <Compass className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-white tracking-tight leading-none">
                    PANDU
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 leading-tight mt-0.5">
                    Platform Navigasi
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Tutup Menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors active:scale-90"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-left">
              {/* Category: Navigasi Utama */}
              <div className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  // Menu Utama
                </div>

                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-xl p-2.5 transition-all ${
                    isHome
                      ? "bg-blue-600/15 border border-blue-500/40 text-white font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        isHome
                          ? "bg-blue-600 text-white"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <Home className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">
                        Beranda
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                        Ringkasan sistem &amp; live feed
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Link>
              </div>

              {/* Category: Modul Investigasi */}
              <div className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  // Modul Forensik &amp; Latihan
                </div>

                {/* X-Ray Scanner */}
                <Link
                  href="/xray"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-xl p-2.5 transition-all ${
                    isXray
                      ? "bg-blue-600/15 border border-blue-500/40 text-white font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        isXray
                          ? "bg-blue-600 text-white"
                          : "bg-white/5 text-blue-400"
                      }`}
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">
                        X-Ray Scanner
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                        Bedah pesan, link, &amp; APK
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Link>

                {/* Arena Simulasi */}
                <Link
                  href="/simulasi"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-xl p-2.5 transition-all ${
                    isSimulasi
                      ? "bg-blue-600/15 border border-blue-500/40 text-white font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        isSimulasi
                          ? "bg-blue-600 text-white"
                          : "bg-white/5 text-blue-400"
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">
                        The Deception Arena
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                        Latihan chat WhatsApp interaktif
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Link>

                {/* Pusat Aksi & Laporan */}
                <Link
                  href="/aksi"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-xl p-2.5 transition-all ${
                    isAksi
                      ? "bg-blue-600/15 border border-blue-500/40 text-white font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        isAksi
                          ? "bg-blue-600 text-white"
                          : "bg-white/5 text-blue-400"
                      }`}
                    >
                      <FileCheck2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">
                        First-Aid Dossier
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                        Draf aduan resmi Komdigi &amp; Polri
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Link>
              </div>
            </div>

            {/* Bottom Status Card */}
            <div className="p-3 border-t border-white/10 bg-[#0f1117]/80">
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="font-mono text-slate-300">Engine Online</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Zero-Storage</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
