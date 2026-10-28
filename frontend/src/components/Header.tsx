"use client";

import React from "react";
import { ShieldAlert, Compass, BookOpen, FileCheck2, Cpu } from "lucide-react";

interface HeaderProps {
  activeTab: "scanner" | "sandbox" | "dossier";
  setActiveTab: (tab: "scanner" | "sandbox" | "dossier") => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-lg shadow-sm">
            <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-900">PANDU</span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] sm:text-[11px] font-bold text-zinc-600 border border-zinc-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
              Navigating Digital Deception · <span className="hidden sm:inline">Tim 404Forbidden</span>
            </p>
          </div>
        </div>

        {/* Desktop Tab Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "scanner"
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>X-Ray Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "sandbox"
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Arena Simulasi</span>
          </button>

          <button
            onClick={() => setActiveTab("dossier")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "dossier"
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Pusat Aksi & Laporan</span>
          </button>
        </nav>

        {/* Engine Status Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs text-emerald-800 font-semibold shrink-0">
          <Cpu className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Go Engine</span>
          <span>Online</span>
        </div>
      </div>

      {/* Mobile Tab Segmented Control (Visible only on Mobile screens) */}
      <div className="border-t border-zinc-200 bg-zinc-50/90 px-2 py-1.5 md:hidden">
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-200/70 p-1">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-bold transition-all ${
              activeTab === "scanner"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">X-Ray</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-bold transition-all ${
              activeTab === "sandbox"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Simulasi</span>
          </button>

          <button
            onClick={() => setActiveTab("dossier")}
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-bold transition-all ${
              activeTab === "dossier"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Pusat Aksi</span>
          </button>
        </div>
      </div>
    </header>
  );
}
