import Header from "@/components/Header";
import SandboxTab from "@/components/SandboxTab";
import GeminiBackground from "@/components/GeminiBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Deception Arena — PANDU",
  description: "Simulator percakapan interaktif penguji ketahanan kognitif dan pengambilan keputusan siber.",
};

export default function SimulasiPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <GeminiBackground />
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <SandboxTab />
      </main>
    </div>
  );
}
