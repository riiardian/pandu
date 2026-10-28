import Header from "@/components/Header";
import DossierTab from "@/components/DossierTab";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incident First-Aid Dossier — PANDU",
  description: "Checklist darurat 5 menit pertama dan generator draf aduan resmi Komdigi, OJK, dan Siber Polri.",
};

export default function AksiPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-full max-w-5xl rounded-full bg-gradient-to-b from-blue-900/25 via-indigo-950/20 to-transparent blur-3xl" />
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <DossierTab />
      </main>
    </div>
  );
}
