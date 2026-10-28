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
    </div>
  );
}
