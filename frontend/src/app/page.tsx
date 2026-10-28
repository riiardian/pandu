"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ScannerTab from "@/components/ScannerTab";
import SandboxTab from "@/components/SandboxTab";
import DossierTab from "@/components/DossierTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"scanner" | "sandbox" | "dossier">("scanner");
  const [forwardedDossierData, setForwardedDossierData] = useState<any>(null);

  const handleForwardToDossier = (data: any) => {
    setForwardedDossierData(data);
    setActiveTab("dossier");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {activeTab === "scanner" && (
          <ScannerTab onForwardToDossier={handleForwardToDossier} />
        )}
        {activeTab === "sandbox" && <SandboxTab />}
        {activeTab === "dossier" && (
          <DossierTab initialData={forwardedDossierData} />
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 px-4 text-xs text-zinc-500 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-700">PANDU</span>
            <span>—</span>
            <span>Guardians of the Digital Space</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Kompetisi MIT-WEEK 2026</span>
            <span>·</span>
            <span>Tim 404Forbidden (Telkom University)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
