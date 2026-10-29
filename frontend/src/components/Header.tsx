"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Home,
  Search,
  BookOpen,
  FileCheck2,
  Workflow,
  Fingerprint,
  HelpCircle,
} from "lucide-react";

// Silky-smooth slow animated scroll for quick navigation jumps
function smoothScrollToY(targetY: number, duration: number = 1100) {
  if (typeof window === "undefined") return;
  const startY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  const diff = targetY - startY;
  if (Math.abs(diff) < 5) return;
  let startTime: number | null = null;

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo({
      top: startY + diff * ease,
      behavior: "instant" as ScrollBehavior,
    });

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

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

  const NAV_ITEMS = [
    { href: "/", label: "Beranda", icon: Home, active: isHome },
    { href: "/xray", label: "Investigasi Ancaman", icon: Search, active: isXray },
    { href: "/simulasi", label: "Simulasi Modus Penipuan", icon: BookOpen, active: isSimulasi },
    { href: "/aksi", label: "Pusat Laporan & Daftar Hitam", icon: FileCheck2, active: isAksi },
    { href: "/#alur-kerja", label: "Alur Kerja Sistem", icon: Workflow, active: false },
    { href: "/#manipulasi-digital", label: "Bentuk Manipulasi Digital", icon: Fingerprint, active: false },
    { href: "/#faq", label: "Pertanyaan Umum (FAQ)", icon: HelpCircle, active: false },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "");
      if (pathname === "/") {
        e.preventDefault();
        setIsOpen(false);
        document.body.style.overflow = "";
        window.history.pushState(null, "", href);
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            const navOffset = 60;
            const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navOffset);
            smoothScrollToY(targetY, 1100);
          }
        }, 150);
        return;
      }
    } else if (href === "/" && pathname === "/") {
      e.preventDefault();
      setIsOpen(false);
      document.body.style.overflow = "";
      window.history.pushState(null, "", "/");
      setTimeout(() => {
        smoothScrollToY(0, 900);
      }, 150);
      return;
    }

    setIsOpen(false);
  };

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

      {/* Clean & Simple Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Minimalist Drawer Panel */}
          <div className="relative ml-auto flex h-full w-[78vw] max-w-[290px] flex-col bg-[#101114] border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right duration-200 text-slate-200 select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <span className="font-bold text-sm text-white tracking-wide">
                Menu
              </span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Tutup Menu"
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Clean Navigation Links */}
            <nav className="flex-1 px-2.5 py-3 space-y-1 text-left">
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      item.active
                        ? "bg-white/10 text-white font-medium"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 shrink-0 ${
                        item.active ? "text-blue-400" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
