"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const PIPELINE_STEPS_ID = [
  {
    step: "01",
    title: "Identifikasi Target",
    desc: "Sistem menerima email, tautan, nomor, atau berkas yang dicurigai, lalu menormalkan parameter secara aman sebelum pemeriksaan eksternal.",
  },
  {
    step: "02",
    title: "Korelasi Intelijen",
    desc: "PANDU memeriksa reputasi email, rekam pemindaian domain, registrasi RDAP, dan kecocokan hash berkas pada sumber eksternal terpercaya.",
  },
  {
    step: "03",
    title: "Verifikasi Jejak Digital",
    desc: "Sistem menelusuri kecocokan data ke basis data registri PANDU dan jaringan intelijen terbuka untuk menemukan indikasi rekam jejak kejahatan.",
  },
  {
    step: "04",
    title: "Laporan & Mitigasi",
    desc: "Menerbitkan skor risiko transparan, checklist tindakan darurat isolasi akun 5 menit, dan opsi pelaporan terverifikasi dengan bukti otentik.",
  },
];

const PIPELINE_STEPS_EN = [
  {
    step: "01",
    title: "Target Identification",
    desc: "The system ingests suspicious emails, links, numbers, or files, safely normalizing parameters prior to external inspection.",
  },
  {
    step: "02",
    title: "Intelligence Correlation",
    desc: "Audits email reputation, domain scan records, RDAP registration, and file hash matches against verified threat sources.",
  },
  {
    step: "03",
    title: "Digital Footprint Verification",
    desc: "Cross-references data against PANDU's threat registry and open intelligence networks to uncover digital crime indicators.",
  },
  {
    step: "04",
    title: "Report & Mitigation",
    desc: "Issues a transparent risk score, a 5-minute emergency account isolation checklist, and authentic evidence-backed reporting.",
  },
];

export default function AnimatedPipeline() {
  const lang = useLanguage();
  const steps = lang === "en" ? PIPELINE_STEPS_EN : PIPELINE_STEPS_ID;
  const [activeStep, setActiveStep] = useState(0);

  // Sequential stage illumination: lights up step 1, then step 2, step 3, step 4 in sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative my-4 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {steps.map((item, idx) => {
          const isCurrent = activeStep === idx;
          return (
            <div
              key={item.step}
              onClick={() => setActiveStep(idx)}
              className={`relative rounded-2xl p-5 flex flex-col justify-between transition-colors duration-500 cursor-pointer ${
                isCurrent
                  ? "border-2 border-blue-500 bg-[#070e1b] shadow-lg shadow-blue-950/50"
                  : "border border-white/10 bg-[#121316]/90 opacity-60"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center h-8 w-8 rounded-lg font-mono text-xs font-bold transition-colors duration-500 ${
                      isCurrent
                        ? "bg-blue-600 text-white border border-blue-400"
                        : "bg-white/5 border border-white/10 text-slate-400"
                    }`}
                  >
                    {item.step}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors duration-500 ${
                      isCurrent ? "text-blue-400 font-bold" : "text-slate-500"
                    }`}
                  >
                    {lang === "en" ? `Stage ${idx + 1}` : `Tahap ${idx + 1}`}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4
                    className={`text-sm sm:text-base font-bold leading-snug transition-colors duration-500 ${
                      isCurrent ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed transition-colors duration-500 ${
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
    </div>
  );
}
