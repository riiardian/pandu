import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
