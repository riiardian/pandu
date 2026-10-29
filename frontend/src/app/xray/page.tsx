import Header from "@/components/Header";
import ScannerTab from "@/components/ScannerTab";
import GeminiBackground from "@/components/GeminiBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radar Forensik Siber — PANDU",
  description: "Layanan deteksi terpadu untuk memverifikasi nomor kontak, rekening bank, tautan web, email, dan muatan file mencurigakan dari potensi kejahatan sosial engineering.",
};

export default function XrayPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <GeminiBackground />
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <ScannerTab />
      </main>
    </div>
  );
}
