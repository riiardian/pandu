"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Menu,
  X,
  Home,
  ShieldAlert,
  BookOpen,
  FileCheck2,
  ArrowRight,
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

  const navItems = [
    {
      href: "/",
      label: "Beranda",
      subtitle: "Halaman Utama & Panduan Sistem",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/xray",
      label: "Deception X-Ray Scanner",
      subtitle: "Deteksi Pesan, Resi .APK & Link Palsu",
      icon: ShieldAlert,
      isActive: pathname.startsWith("/xray"),
    },
    {
      href: "/simulasi",
      label: "The Deception Arena",
      subtitle: "Simulasi Chat Interaktif & Uji Keputusan",
      icon: BookOpen,
      isActive: pathname.startsWith("/simulasi"),
    },
    {
      href: "/aksi",
      label: "Incident First-Aid Dossier",
      subtitle: "Checklist Darurat & Draf Laporan Resmi",
      icon: FileCheck2,
      isActive:
        pathname.startsWith("/aksi") ||
        pathname.startsWith("/dossier") ||
        pathname.startsWith("/laporan"),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand & Identity */}
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

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Hamburger Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-600 text-white font-bold shadow-sm">
                  <Compass className="h-4 w-4" />
                </div>
                <span className="font-black text-lg text-zinc-900">Menu Navigasi</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start gap-3 rounded-xl p-3.5 transition-all ${
                      item.isActive
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-800 hover:bg-zinc-100"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        item.isActive
                          ? "bg-white/10 text-white"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold leading-snug">{item.label}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          item.isActive ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer CTA */}
            <div className="border-t border-zinc-200 p-4 space-y-3 bg-zinc-50">
              <Link
                href="/xray"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-orange-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700 transition-colors"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Mulai Bedah Pesan</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="text-center text-[11px] text-zinc-400">
                PANDU · Guardians of the Digital Space
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
