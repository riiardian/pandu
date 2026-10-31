import Header from "@/components/Header";
import DossierTab from "@/components/DossierTab";
import GeminiBackground from "@/components/GeminiBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fraud Report & Emergency Guide",
  description: "Checklist darurat 5 menit pertama dan formulir pelaporan entitas penipuan berbasis bukti otentik.",
};

export default function LaporPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <GeminiBackground />
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <DossierTab />
      </main>
    </div>
  );
}
