import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Protective Analysis & Navigation for Digital Users",
  description: "Layanan analisis praktis untuk memeriksa keaslian pesan, tautan mencurigakan, dan file APK penipuan secara instan tanpa mengambil data pribadi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full antialiased dark ${spaceGrotesk.className}`}>
      <body className="min-h-full flex flex-col bg-black text-slate-100 w-full overflow-x-hidden selection:bg-blue-600/30 selection:text-white">{children}</body>
    </html>
  );
}
