"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const PIPELINE_STEPS_ID = [
  {
    step: "1",
    title: "Identifikasi Target",
    desc: "Sistem menerima email, tautan, atau berkas yang dicurigai, lalu menormalkan parameter secara aman sebelum pemeriksaan eksternal.",
  },
  {
    step: "2",
    title: "Korelasi Intelijen",
    desc: "PANDU memeriksa reputasi email, rekam pemindaian domain, registrasi RDAP, dan kecocokan hash berkas pada sumber eksternal.",
  },
  {
    step: "3",
    title: "Verifikasi Jejak Digital",
    desc: "Sistem menelusuri kecocokan data ke basis data PANDU dan jaringan intelijen terbuka untuk menemukan indikasi rekam jejak kejahatan digital.",
  },
  {
    step: "4",
    title: "Laporan & Mitigasi",
    desc: "Menerbitkan skor risiko transparan, checklist tindakan darurat isolasi akun 5 menit, dan secara otomatis mencatat entitas ke basis data daftar hitam PANDU.",
  },
];

const PIPELINE_STEPS_EN = [
  {
    step: "1",
    title: "Target Identification",
    desc: "The system ingests suspicious emails, links, or files, safely normalizing parameters prior to external inspection.",
  },
  {
    step: "2",
    title: "Intelligence Correlation",
    desc: "PANDU audits email reputation, domain scan records, RDAP registration, and file hash matches against external threat sources.",
  },
  {
    step: "3",
    title: "Digital Footprint Verification",
    desc: "Cross-references data against PANDU's blacklist database and open intelligence networks to uncover digital crime indicators.",
  },
  {
    step: "4",
    title: "Report & Mitigation",
    desc: "Issues a transparent risk score, a 5-minute emergency account isolation checklist, and automatically indexes confirmed threats into the blacklist.",
  },
];

export default function AnimatedPipeline() {
  const lang = useLanguage();
  const PIPELINE_STEPS = (lang === "en" ? PIPELINE_STEPS_EN : PIPELINE_STEPS_ID).map((item, idx) => ({
    ...item,
    idx,
  }));
  const [activeStep, setActiveStep] = useState(0);
  const [phase, setPhase] = useState<"igniting" | "active" | "receding" | "traveling">("igniting");

  // Majestic Slow Pacing: 5.5 seconds per step cycle
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
      {/* Sleek 1px Vertical Cable Conduit (Centered with 32px circular badges at left:15.5px) */}
      <div className="absolute left-[15.5px] sm:left-[17.5px] top-6 bottom-6 w-[1px] bg-slate-800 pointer-events-none" />

      {PIPELINE_STEPS.map((item) => {
        const isCurrent = activeStep === item.idx;

        return (
          <div
            key={item.step}
            onClick={() => {
              setActiveStep(item.idx);
            }}
            className="flex items-center cursor-pointer group"
          >
            {/* 1. Circular Step Badge (Clean, flat 1px border) */}
            <div
              className={`relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold border transition-colors select-none ${
                isCurrent
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-[#0a0c10] border-slate-700 text-slate-400"
              }`}
            >
              {item.step}
            </div>

            {/* 2. Thin 1px Horizontal Connecting Wire */}
            <div
              className={`h-[1px] shrink-0 w-3 sm:w-5 ${
                isCurrent
                  ? "bg-blue-500"
                  : "bg-slate-800"
              }`}
            />

            {/* 3. Card Container: Single crisp 1px border */}
            <div
              className={`relative flex-1 rounded-2xl p-4 sm:p-5 overflow-hidden border transition-colors ${
                isCurrent
                  ? "border-blue-500/80 bg-[#070e1b] opacity-100"
                  : "border-white/10 bg-[#0c0d12]/70 opacity-70 hover:opacity-100"
              }`}
            >
              {/* Clean Minimalist Header: Tahap 1, Tahap 2, etc. */}
              <div className="relative z-10 mb-1">
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                    isCurrent ? "text-blue-400" : "text-slate-400"
                  }`}
                >
                  Tahap {item.step}
                </span>
              </div>

              {/* Title & Description */}
              <div className="relative z-10 space-y-1">
                <h4
                  className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                    isCurrent ? "text-white" : "text-slate-300"
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed transition-colors ${
                    isCurrent ? "text-slate-200" : "text-slate-400"
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
