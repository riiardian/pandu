"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldAlert, Compass, BookOpen, FileCheck2 } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isXray = pathname.startsWith("/xray");
  const isSimulasi = pathname.startsWith("/simulasi");
  const isAksi =
    pathname.startsWith("/aksi") ||
    pathname.startsWith("/dossier") ||
    pathname.startsWith("/laporan");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Brand & Identity (Clickable Link to /) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none min-w-0"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-lg shadow-sm">
            <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 block leading-tight">
              PANDU
            </span>
            <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
              Navigating Digital Deception
            </p>
          </div>
        </Link>

        {/* Desktop Tab Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              isHome
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Beranda</span>
          </Link>

          <Link
            href="/xray"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              isXray
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>X-Ray Scanner</span>
          </Link>

          <Link
            href="/simulasi"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              isSimulasi
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Arena Simulasi</span>
          </Link>

          <Link
            href="/aksi"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              isAksi
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Pusat Aksi</span>
          </Link>
        </nav>
      </div>

      {/* Mobile Tab Segmented Control (Visible only on Mobile screens) */}
      <div className="border-t border-zinc-200 bg-zinc-50/90 px-2 py-1.5 md:hidden">
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-zinc-200/70 p-1">
          <Link
            href="/"
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold transition-all ${
              isHome
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Beranda</span>
          </Link>

          <Link
            href="/xray"
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold transition-all ${
              isXray
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">X-Ray</span>
          </Link>

          <Link
            href="/simulasi"
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold transition-all ${
              isSimulasi
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Simulasi</span>
          </Link>

          <Link
            href="/aksi"
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold transition-all ${
              isAksi
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Aksi</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
