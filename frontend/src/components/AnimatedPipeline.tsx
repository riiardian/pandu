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
  const [phase, setPhase] = useState<"igniting" | "active" | "receding" | "traveling">("igniting");

  // Majestic Slow Pacing: 5.5 seconds per step cycle
  // Phase 1 (0-1400ms): Igniting sweep from front (left) to back (right)
  // Phase 2 (1400-3800ms): Steady active hold with full glowing cyan border
  // Phase 3 (3800-4800ms): Receding sweep (right edge fades first, shrinking back to cable)
  // Phase 4 (4800-5500ms): Traveling electric pulse shoots down the vertical wire to next step!
  useEffect(() => {
    setPhase("igniting");

    const t1 = setTimeout(() => {
      setPhase("active");
    }, 1400);

    const t2 = setTimeout(() => {
      setPhase("receding");
    }, 3800);

    const t3 = setTimeout(() => {
      setPhase("traveling");
    }, 4800);

    const t4 = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeStep]);

  return (
    <div className="relative space-y-4 sm:space-y-5 text-left my-4 select-none">
      {/* Continuous Vertical Cable Conduit (Centered with 32px/36px circular badges) */}
      <div className="absolute left-[15px] sm:left-[17px] top-6 bottom-6 w-[2px] bg-slate-800 rounded-full overflow-hidden pointer-events-none">
        {/* Slow moving electric pulse that travels down the cable in Phase 4 */}
        <div
          className={`absolute left-0 w-full h-24 bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[1px] transition-all ${
            phase === "traveling" ? "duration-700 ease-in-out opacity-100" : "duration-300 opacity-30"
          }`}
          style={{
            top: phase === "traveling" ? `${((activeStep + 1) % 4) * 26}%` : `${activeStep * 26}%`,
          }}
        />
      </div>

      {PIPELINE_STEPS.map((item) => {
        const isCurrent = activeStep === item.idx;
        const isLit = isCurrent && phase !== "traveling";

        return (
          <div
            key={item.step}
            onClick={() => {
              setActiveStep(item.idx);
              setPhase("igniting");
            }}
            className="flex items-center cursor-pointer group"
          >
            {/* 1. Circular Step Badge (Clean 1, 2, 3, 4 without leading zero, vertically centered) */}
            <div
              className={`relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-500 ${
                isLit
                  ? "bg-[#06101e] border-2 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.7)] scale-110"
                  : "bg-[#0a0c10] border border-slate-700 text-slate-500 hover:border-slate-500"
              }`}
            >
              {item.step}
            </div>

            {/* 2. Horizontal Connecting Cable Trace (Visible wire running from badge into the card) */}
            <div
              className={`h-[2px] shrink-0 w-3 sm:w-5 transition-all duration-500 ${
                isLit
                  ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                  : "bg-slate-800"
              }`}
            />

            {/* 3. Card Container: Clean border flush with card geometry */}
            <div
              className={`relative flex-1 rounded-2xl p-4 sm:p-5 transition-all duration-500 overflow-hidden ${
                isLit
                  ? "bg-[#070e1b] shadow-[0_0_30px_rgba(34,211,238,0.2)] opacity-100 border-2 border-cyan-400"
                  : "border border-white/10 bg-[#0c0d12]/70 opacity-45 hover:opacity-75 hover:border-white/20"
              }`}
            >
              {/* Progressive Electrical Sweep Overlay (Depan menjalar ke belakang saat mulai, kanan menipis saat selesai) */}
              {isCurrent && phase === "igniting" && (
                <div
                  key={`ignite-${activeStep}`}
                  className="absolute inset-0 pointer-events-none animate-sweep-in bg-gradient-to-r from-cyan-400/25 via-blue-500/15 to-transparent border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                />
              )}

              {isCurrent && phase === "active" && (
                <div
                  key={`active-${activeStep}`}
                  className="absolute inset-0 pointer-events-none bg-gradient-to-r from-cyan-400/20 via-blue-500/10 to-transparent border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                />
              )}

              {isCurrent && phase === "receding" && (
                <div
                  key={`recede-${activeStep}`}
                  className="absolute inset-0 pointer-events-none animate-sweep-out bg-gradient-to-r from-cyan-400/25 via-blue-500/15 to-transparent border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                />
              )}

              {/* Clean Minimalist Header: Tahap 1, Tahap 2, etc. */}
              <div className="relative z-10 mb-1.5">
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                    isLit ? "text-cyan-400" : "text-slate-400"
                  }`}
                >
                  Tahap {item.step}
                </span>
              </div>

              {/* Title & Description */}
              <div className="relative z-10 space-y-1">
                <h4
                  className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                    isLit ? "text-white" : "text-slate-300"
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed transition-colors ${
                    isLit ? "text-slate-200" : "text-slate-400"
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
