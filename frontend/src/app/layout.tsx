import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "PANDU — Navigating Digital Deception | MIT-WEEK 2026",
  description: "Aplikasi Web Pemecah Jebakan Tipuan Digital, Simulator Keputusan Siber & Generator Laporan Forensik Resmi untuk Generasi Muda Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100 w-full overflow-x-hidden selection:bg-orange-500/20 selection:text-orange-200">{children}</body>
    </html>
  );
}
