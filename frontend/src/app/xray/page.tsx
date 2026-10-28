import Header from "@/components/Header";
import ScannerTab from "@/components/ScannerTab";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deception X-Ray Scanner — PANDU",
  description: "Pembedah anatomi pesan teks mencurigakan dan tautan digital berbasis aturan heuristik transparan.",
};

export default function XrayPage() {
  return (
    <div className="min-h-screen bg-black gemini-aura-bg text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <ScannerTab />
      </main>
    </div>
  );
}
