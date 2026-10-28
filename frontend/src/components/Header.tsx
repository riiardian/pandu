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
  Search,
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
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand & Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none min-w-0"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-lg shadow-sm">
              <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white block leading-tight">
              PANDU
            </span>
          </Link>

          {/* Sleek Cloudflare-style Naked Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            className="flex h-9 w-9 items-center justify-center text-slate-200 hover:text-white focus:outline-none transition-all active:scale-90"
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
                <line x1="3.5" y1="12" x2="15.5" y2="12" />
                <line x1="3.5" y1="17" x2="20.5" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Cloudflare-Style Compact Slide-out Drawer in Gemini Dark Theme */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop (Leaves ~30% viewport visible on the side) */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Sleek Narrow Drawer (Width 68vw, max 265px) */}
          <div className="relative ml-auto flex h-full w-[68vw] max-w-[265px] flex-col bg-[#121316] border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right duration-200 text-slate-200 select-none">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-600 text-white font-bold shrink-0 shadow-sm">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold text-sm text-white truncate">PANDU Nav</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Tutup Menu"
                className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-white focus:outline-none transition-colors active:scale-90"
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

            {/* Quick Search Bar */}
            <div className="px-3 pt-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#1a1b20] px-2.5 py-1.5 text-xs text-slate-400">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Navigasi cepat...</span>
              </div>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
              {/* Section 1: Overview */}
              <div>
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                    isHome
                      ? "bg-[#22242b] font-semibold text-white border border-white/10"
                      : "text-slate-300 hover:bg-[#1a1b20] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="h-4 w-4 text-slate-400" />
                    <span>Beranda Utama</span>
                  </div>
                </Link>
              </div>

              {/* Section 2: Modul Utama */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Modul Deteksi &amp; Latihan
                </div>

                <Link
                  href="/xray"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                    isXray
                      ? "bg-[#22242b] font-semibold text-white border border-white/10"
                      : "text-slate-300 hover:bg-[#1a1b20] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="truncate">X-Ray Scanner</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Link>

                <Link
                  href="/simulasi"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                    isSimulasi
                      ? "bg-[#22242b] font-semibold text-white border border-white/10"
                      : "text-slate-300 hover:bg-[#1a1b20] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="truncate">Arena Simulasi</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Link>
              </div>

              {/* Section 3: Respons Darurat */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Respons &amp; Pemulihan
                </div>

                <Link
                  href="/aksi"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                    isAksi
                      ? "bg-[#22242b] font-semibold text-white border border-white/10"
                      : "text-slate-300 hover:bg-[#1a1b20] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Pusat Aksi &amp; Laporan</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
