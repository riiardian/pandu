"use client";

import React from "react";
import { ShieldAlert, Compass, BookOpen, FileCheck2, Cpu } from "lucide-react";

interface HeaderProps {
  activeTab: "scanner" | "sandbox" | "dossier";
  setActiveTab: (tab: "scanner" | "sandbox" | "dossier") => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-lg shadow-sm">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-900">PANDU</span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600 border border-zinc-300">
                v1.0
              </span>
            </div>
            <p className="hidden sm:block text-xs text-zinc-500">
              Navigating Digital Deception · Tim 404Forbidden
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "scanner"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>X-Ray Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "sandbox"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Arena Simulasi</span>
          </button>

          <button
            onClick={() => setActiveTab("dossier")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "dossier"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Pusat Aksi & Laporan</span>
          </button>
        </nav>

        {/* System Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 font-medium">
          <Cpu className="h-3.5 w-3.5 text-emerald-600" />
          <span>Go Engine Online</span>
        </div>
      </div>
    </header>
  );
}
