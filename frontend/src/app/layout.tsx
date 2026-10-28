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
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-zinc-900 w-full overflow-x-hidden">{children}</body>
    </html>
  );
}
