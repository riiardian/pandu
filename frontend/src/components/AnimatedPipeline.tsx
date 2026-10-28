"use client";

import React, { useState, useEffect } from "react";

const PIPELINE_STEPS = [
  {
    idx: 0,
    step: "1",
    title: "Input Muatan Pesan & Tautan",
    desc: "Sistem menerima pesan teks dari WhatsApp, Telegram, SMS, atau tautan mencurigakan, kemudian memecah muatan menjadi token analitik tanpa menyimpan identitas pengguna.",
  },
  {
    idx: 1,
    step: "2",
    title: "Pembedahan Pola Manipulasi",
    desc: "Mesin backend Go mengevaluasi indikator bias kognitif (kepanikan waktu, iming-iming komisi, otoritas palsu) dan menghitung nilai anomali entropi Shannon.",
  },
  {
    idx: 2,
    step: "3",
    title: "Forensik Domain & Izin File APK",
    desc: "Melacak rantai redirect shortlink, memeriksa umur pendaftaran domain tiruan (.SITE / .XYZ), serta mengurai izin bahaya penyadap SMS OTP.",
  },
  {
    idx: 3,
    step: "4",
    title: "Pencatatan Database & Tindakan Cepat",
    desc: "Menerbitkan skor risiko transparan, checklist tindakan darurat isolasi akun 5 menit, dan secara otomatis mencatat entitas ke basis data daftar hitam PANDU.",
  },
];

export default function AnimatedPipeline() {
  const [activeStep, setActiveStep] = useState(0);

  // Slow, majestic cycle: 4.2 seconds per step
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative space-y-4 sm:space-y-5 text-left my-4 select-none">
      {/* Continuous Vertical Cable Conduit (Exactly Centered with the 32px/36px circular badges) */}
      <div className="absolute left-[15px] sm:left-[17px] top-6 bottom-6 w-[2px] bg-slate-800 rounded-full overflow-hidden pointer-events-none">
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
            className="flex items-center cursor-pointer group"
          >
            {/* 1. Circular Step Badge (Clean 1, 2, 3, 4 without leading zero, vertically centered) */}
            <div
              className={`relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-500 ${
                isActive
                  ? "bg-[#06101e] border-2 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.7)] scale-110"
                  : "bg-[#0a0c10] border border-slate-700 text-slate-500 hover:border-slate-500"
              }`}
            >
              {item.step}
            </div>

            {/* 2. Horizontal Connecting Cable Trace (Visible wire running from badge into the card) */}
            <div
              className={`h-[2px] shrink-0 w-3 sm:w-5 transition-all duration-500 ${
                isActive
                  ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                  : "bg-slate-800"
              }`}
            />

            {/* 3. Card Container: Single true boundary border, no extra lip or dark overhang underneath */}
            <div
              className={`relative flex-1 rounded-2xl p-4 sm:p-5 transition-all duration-500 overflow-hidden ${
                isActive
                  ? "border-2 border-cyan-400 bg-[#070e1b] shadow-[0_0_30px_rgba(34,211,238,0.25)] opacity-100"
                  : "border border-white/10 bg-[#0c0d12]/70 opacity-45 hover:opacity-75 hover:border-white/20"
              }`}
            >
              {/* Progressive Electrical Light Sweep (Internal sheen ONLY, no border to prevent double-outline lip) */}
              {isActive && (
                <div
                  key={`pulse-${activeStep}`}
                  className="absolute inset-0 pointer-events-none animate-circuit-wave bg-gradient-to-r from-cyan-400/20 via-blue-500/10 to-transparent"
                />
              )}

              {/* Clean Minimalist Header: Tahap 1, Tahap 2, etc. */}
              <div className="relative z-10 mb-1.5">
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400"
                  }`}
                >
                  Tahap {item.step}
                </span>
              </div>

              {/* Title & Description */}
              <div className="relative z-10 space-y-1">
                <h4
                  className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
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
