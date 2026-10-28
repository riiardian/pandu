import Header from "@/components/Header";
import DossierTab from "@/components/DossierTab";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incident First-Aid Dossier — PANDU",
  description: "Checklist darurat 5 menit pertama dan generator draf aduan resmi Komdigi, OJK, dan Siber Polri.",
};

export default function AksiPage() {
  return (
    <div className="min-h-screen bg-black gemini-aura-bg text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <DossierTab />
      </main>
    </div>
  );
}
