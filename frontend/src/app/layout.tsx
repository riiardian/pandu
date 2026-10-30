import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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
    <html lang="id" className={`h-full antialiased dark ${plusJakartaSans.className}`}>
      <body className="min-h-full flex flex-col bg-black text-slate-100 w-full overflow-x-hidden selection:bg-blue-600/30 selection:text-white">{children}</body>
    </html>
  );
}
