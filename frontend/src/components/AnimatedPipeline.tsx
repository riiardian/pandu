"use client";

import React, { useState, useEffect } from "react";

const PIPELINE_STEPS = [
  {
    idx: 0,
    step: "01",
    phase: "Ingestion",
    title: "Input Muatan Pesan & Tautan",
    desc: "Sistem menerima pesan teks dari WhatsApp, Telegram, SMS, atau tautan mencurigakan, kemudian memecah muatan menjadi token analitik tanpa menyimpan identitas pengguna.",
  },
  {
    idx: 1,
    step: "02",
    phase: "Decomposition",
    title: "Pembedahan Pola Manipulasi",
    desc: "Mesin backend Go mengevaluasi indikator bias kognitif (kepanikan waktu, iming-iming komisi, otoritas palsu) dan menghitung nilai anomali entropi Shannon.",
  },
  {
    idx: 2,
    step: "03",
    phase: "Forensic Trace",
    title: "Forensik Domain & Izin File APK",
    desc: "Melacak rantai redirect shortlink, memeriksa umur pendaftaran domain tiruan (.SITE / .XYZ), serta mengurai izin bahaya penyadap SMS OTP.",
  },
  {
    idx: 3,
    step: "04",
    phase: "Registry & Mitigate",
    title: "Pencatatan Database & Tindakan Cepat",
    desc: "Menerbitkan skor risiko transparan, checklist tindakan darurat isolasi akun 5 menit, dan secara otomatis mencatat entitas ke basis data daftar hitam PANDU.",
  },
];

export default function AnimatedPipeline() {
  const [activeStep, setActiveStep] = useState(0);

  // Slow, majestic cycle: 4.2 seconds per step
  // Allows the light wave to enter from the left, illuminate the full card,
  // then recede from the right edge back into the cable before advancing!
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative pl-9 sm:pl-12 space-y-5 text-left my-4 select-none">
      {/* Continuous Vertical Cable Conduit */}
      <div className="absolute left-[15px] sm:left-[19px] top-5 bottom-5 w-[2px] bg-slate-800 rounded-full overflow-hidden">
        {/* Slow moving electric pulse that travels down the cable */}
        <div
          className="absolute left-0 w-full h-24 bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[1px] transition-all duration-1000 ease-in-out"
          style={{
            top: `${activeStep * 26}%`,
          }}
        />
      </div>

      {PIPELINE_STEPS.map((item) => {
        const isActive = activeStep === item.idx;

        return (
          <div
            key={item.step}
            onClick={() => setActiveStep(item.idx)}
            className="relative cursor-pointer"
          >
            {/* Clean & Simple Number Node (No AI-slop metal pins) */}
            <div
              className={`absolute -left-[32px] sm:-left-[36px] top-4 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-500 ${
                isActive
                  ? "bg-[#06101e] border-2 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.7)] scale-105"
                  : "bg-[#0a0c10] border border-slate-700 text-slate-500 hover:border-slate-500"
              }`}
            >
              {item.step}
            </div>

            {/* Horizontal Wire Connecting Node to Card */}
            <div
              className={`absolute -left-[2px] top-7 h-[2px] transition-all duration-500 ${
                isActive
                  ? "w-4 sm:w-5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                  : "w-3 sm:w-4 bg-slate-800"
              }`}
            />

            {/* Card Container */}
            <div
              className={`relative rounded-2xl p-4 sm:p-5 space-y-2 border transition-all duration-500 overflow-hidden ${
                isActive
                  ? "border-cyan-500/80 bg-[#070e1b] shadow-[0_0_30px_rgba(34,211,238,0.2)] opacity-100"
                  : "border-white/10 bg-[#0c0d12]/70 backdrop-blur-md opacity-45 hover:opacity-75 hover:border-white/20"
              }`}
            >
              {/* Progressive Electrical Wave Overlay (Lights from left to right, then recedes from right to left) */}
              {isActive && (
                <div
                  key={`pulse-${activeStep}`}
                  className="absolute inset-0 rounded-2xl pointer-events-none animate-circuit-wave bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                />
              )}

              {/* Clean Top Meta (No slashes, no icons, no AI badges) */}
              <div className="flex items-center justify-between text-xs font-mono relative z-10 border-b border-white/5 pb-2">
                <span className={`font-semibold ${isActive ? "text-cyan-400" : "text-slate-400"}`}>
                  Tahap {item.step}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {item.phase}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 relative z-10">
                <h4
                  className={`text-sm sm:text-base font-bold transition-colors ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed transition-colors ${
                    isActive ? "text-slate-200" : "text-slate-400"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
