"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const PIPELINE_STEPS_ID = [
  {
    step: "1",
    title: "Identifikasi Target",
    desc: "Sistem menerima email, tautan, nomor, atau berkas yang dicurigai, lalu menormalkan parameter secara aman sebelum pemeriksaan eksternal.",
  },
  {
    step: "2",
    title: "Korelasi Intelijen",
    desc: "PANDU memeriksa reputasi email, rekam pemindaian domain, registrasi RDAP, dan kecocokan hash berkas pada sumber eksternal terpercaya.",
  },
  {
    step: "3",
    title: "Verifikasi Jejak Digital",
    desc: "Sistem menelusuri kecocokan data ke basis data registri PANDU dan jaringan intelijen terbuka untuk menemukan indikasi rekam jejak kejahatan.",
  },
  {
    step: "4",
    title: "Laporan & Mitigasi",
    desc: "Menerbitkan skor risiko transparan, checklist tindakan darurat isolasi akun 5 menit, dan opsi pelaporan terverifikasi dengan bukti otentik.",
  },
];

const PIPELINE_STEPS_EN = [
  {
    step: "1",
    title: "Target Identification",
    desc: "The system ingests suspicious emails, links, numbers, or files, safely normalizing parameters prior to external inspection.",
  },
  {
    step: "2",
    title: "Intelligence Correlation",
    desc: "Audits email reputation, domain scan records, RDAP registration, and file hash matches against verified threat sources.",
  },
  {
    step: "3",
    title: "Digital Footprint Verification",
    desc: "Cross-references data against PANDU's threat registry and open intelligence networks to uncover digital crime indicators.",
  },
  {
    step: "4",
    title: "Report & Mitigation",
    desc: "Issues a transparent risk score, a 5-minute emergency account isolation checklist, and authentic evidence-backed reporting.",
  },
];

export default function AnimatedPipeline() {
  const lang = useLanguage();
  const steps = lang === "en" ? PIPELINE_STEPS_EN : PIPELINE_STEPS_ID;
  const [activeStep, setActiveStep] = useState(0);

  // Animasi nyala berurutan: Tahap 1 -> Tahap 2 -> Tahap 3 -> Tahap 4 berputar otomatis
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative space-y-4 sm:space-y-5 text-left my-4 select-none">
      {/* 1px Vertical Cable Conduit (Centered with circular badges at left:15.5px) */}
      <div className="absolute left-[15.5px] sm:left-[17.5px] top-6 bottom-6 w-[1px] bg-slate-800 pointer-events-none" />

      {steps.map((item, idx) => {
        const isCurrent = activeStep === idx;

        return (
          <div
            key={item.step}
            onClick={() => setActiveStep(idx)}
            className="flex items-center cursor-pointer"
          >
            {/* 1. Circular Step Badge (Bulat murni, TIDAK BERUBAH saat kursor lewat) */}
            <div
              className={`relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold border transition-colors duration-500 select-none ${
                isCurrent
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-[#0a0c10] border-slate-700 text-slate-500"
              }`}
            >
              {item.step}
            </div>

            {/* 2. Horizontal Connecting Wire (Kabel penghubung ke card) */}
            <div
              className={`h-[1px] shrink-0 w-3 sm:w-5 transition-colors duration-500 ${
                isCurrent ? "bg-blue-500" : "bg-slate-800"
              }`}
            />

            {/* 3. Card Container: Nyala berurutan via activeStep, TIDAK ADA efek hover kursor */}
            <div
              className={`relative flex-1 rounded-2xl p-4 sm:p-5 overflow-hidden border transition-colors duration-500 ${
                isCurrent
                  ? "border-blue-500/80 bg-[#070e1b] opacity-100"
                  : "border-white/10 bg-[#0c0d12]/70 opacity-55"
              }`}
            >
              {/* Header Tahap */}
              <div className="relative z-10 mb-1">
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-500 ${
                    isCurrent ? "text-blue-400 font-bold" : "text-slate-500"
                  }`}
                >
                  {lang === "en" ? `Stage ${item.step}` : `Tahap ${item.step}`}
                </span>
              </div>

              {/* Title & Description */}
              <div className="relative z-10 space-y-1">
                <h4
                  className={`text-sm sm:text-base font-bold leading-snug transition-colors duration-500 ${
                    isCurrent ? "text-white" : "text-slate-400"
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed transition-colors duration-500 ${
                    isCurrent ? "text-slate-300" : "text-slate-500"
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
