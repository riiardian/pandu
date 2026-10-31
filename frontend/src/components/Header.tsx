"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PanduLogo from "./PanduLogo";
import {
  Home,
  Search,
  BookOpen,
  FileCheck2,
  Workflow,
  Fingerprint,
  HelpCircle,
  Globe,
  Sun,
  Moon,
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
  const [lang, setLang] = useState<"id" | "en">("id");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();

  // Initialize theme and language from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("pandu_theme") as "dark" | "light" | null;
      if (savedTheme === "light") {
        setTheme("light");
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        setTheme("dark");
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }

      const savedLang = localStorage.getItem("pandu_lang") as "id" | "en" | null;
      if (savedLang === "en") {
        setLang("en");
        document.documentElement.lang = "en";
      } else {
        setLang("id");
        document.documentElement.lang = "id";
      }
    } catch (e) {
      // LocalStorage access fallback
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("pandu_theme", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } catch (e) {}
  };

  const toggleLanguage = () => {
    const nextLang = lang === "id" ? "en" : "id";
    setLang(nextLang);
    try {
      localStorage.setItem("pandu_lang", nextLang);
      document.documentElement.lang = nextLang;
      window.dispatchEvent(new CustomEvent("pandu_lang_change", { detail: { lang: nextLang } }));
    } catch (e) {}
  };

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
  const isInvestigasi = pathname.startsWith("/investigasi") || pathname.startsWith("/xray");
  const isSimulasi = pathname.startsWith("/simulasi");
  const isLapor =
    pathname.startsWith("/lapor") ||
    pathname.startsWith("/aksi") ||
    pathname.startsWith("/dossier") ||
    pathname.startsWith("/laporan");

  const NAV_ITEMS = [
    { href: "/", label: lang === "en" ? "Home" : "Beranda", icon: Home, active: isHome },
    { href: "/investigasi", label: lang === "en" ? "Threat Investigation" : "Investigasi Ancaman", icon: Search, active: isInvestigasi },
    { href: "/simulasi", label: lang === "en" ? "Scam Simulation" : "Simulasi Modus Penipuan", icon: BookOpen, active: isSimulasi },
    { href: "/lapor", label: lang === "en" ? "Report Center & Victim Guide" : "Pusat Laporan & Panduan Korban", icon: FileCheck2, active: isLapor },
    { href: "/#alur-kerja", label: lang === "en" ? "System Workflow" : "Alur Kerja Sistem", icon: Workflow, active: false },
    { href: "/#manipulasi-digital", label: lang === "en" ? "Digital Manipulation" : "Bentuk Manipulasi Digital", icon: Fingerprint, active: false },
    { href: "/#faq", label: lang === "en" ? "Frequently Asked Questions (FAQ)" : "Pertanyaan Umum (FAQ)", icon: HelpCircle, active: false },
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
          {/* Brand & Identity (Logo replaces letter P, fused into [Logo]ANDU) */}
          <Link
            href="/"
            className="flex items-center gap-[2px] text-left focus:outline-none min-w-0 group"
          >
            <div className="flex shrink-0 items-center justify-center text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <PanduLogo className="h-[18px] sm:h-[20px] w-auto" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              ANDU
            </span>
          </Link>

          {/* Header Controls (Language, Theme, Menu) - Floating, Borderless, Zero-Background */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              aria-label="Ubah Bahasa / Switch Language"
              className="flex items-center gap-1 h-9 px-1 text-xs font-mono font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none focus:outline-none"
              title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span>{lang === "id" ? "EN" : "ID"}</span>
            </button>

            {/* Light / Dark Theme Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Ubah Tema / Toggle Theme"
              className="flex h-9 w-9 items-center justify-center text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none focus:outline-none"
              title={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-white" />
              ) : (
                <Moon className="h-4.5 w-4.5" />
              )}
            </button>

            {/* Minimalist Hamburger Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Navigation Menu"
              className="flex h-9 w-9 items-center justify-center text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors cursor-pointer select-none"
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
          <div className="relative ml-auto flex h-full w-[78vw] max-w-[290px] flex-col bg-[#101114] border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right duration-200 select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                {lang === "en" ? "Navigation Menu" : "Menu Navigasi"}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Tutup Menu"
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
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
                        ? "bg-blue-600/10 text-blue-600 dark:bg-white/10 dark:text-white font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 shrink-0 ${
                        item.active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                      }`}
                    />
                    <span className={item.active ? "text-blue-600 dark:text-white font-semibold" : "text-slate-600 dark:text-slate-300"}>
                      {item.label}
                    </span>
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
