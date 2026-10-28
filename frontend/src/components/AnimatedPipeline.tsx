"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Shield, Cpu, Database, Zap } from "lucide-react";

const PIPELINE_STEPS = [
  {
    idx: 0,
    step: "01",
    phase: "INGESTION",
    title: "Input Muatan Pesan & Tautan",
    desc: "Sistem menerima pesan teks dari WhatsApp, Telegram, SMS, atau link mencurigakan, kemudian memecah muatan menjadi token analitik tanpa menyimpan identitas pengguna.",
    telemetry: "> ingest: payload_tokenized [100% anonymized]",
    icon: Terminal,
  },
  {
    idx: 1,
    step: "02",
    phase: "DECOMPOSITION",
    title: "Pembedahan Pola Manipulasi",
    desc: "Mesin backend Go mengevaluasi indikator bias kognitif (kepanikan waktu, iming-iming komisi, otoritas palsu) dan menghitung nilai anomali entropi Shannon.",
    telemetry: "> heuristic: 6_manipulation_vectors_evaluated",
    icon: Cpu,
  },
  {
    idx: 2,
    step: "03",
    phase: "FORENSIC TRACE",
    title: "Forensik Domain & Izin File APK",
    desc: "Melacak rantai redirect shortlink, memeriksa umur pendaftaran domain tiruan (.SITE / .XYZ), serta mengurai izin bahaya penyadap SMS OTP.",
    telemetry: "> trace: dns_hops_resolved | domain_age: 2_days",
    icon: Shield,
  },
  {
    idx: 3,
    step: "04",
    phase: "REGISTRY & MITIGATE",
    title: "Pencatatan Database & Tindakan Cepat",
    desc: "Menerbitkan skor risiko transparan, checklist tindakan darurat isolasi akun 5 menit, dan secara otomatis mencatat entitas ke basis data daftar hitam PANDU.",
    telemetry: "> registry: blacklisted_in_pandu_db [stored]",
    icon: Database,
  },
];

export default function AnimatedPipeline() {
  const [activeStep, setActiveStep] = useState(0);

  // Sequential cycling: step 0 -> step 1 -> step 2 -> step 3 -> step 0
  // Each step lights up for 2.4 seconds, then current turns off and next turns on!
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative pl-10 sm:pl-14 space-y-6 text-left my-4 select-none">
      {/* Continuous Vertical Backbone Bus Wire */}
      <div className="absolute left-[18px] sm:left-[23px] top-6 bottom-6 w-[2px] bg-slate-800 rounded-full overflow-hidden">
        {/* Dynamic moving electric current indicating data movement */}
        <div
          className="absolute left-0 w-full h-24 bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[1px] transition-all duration-700 ease-in-out"
          style={{
            top: `${activeStep * 28}%`,
          }}
        />
      </div>

      {PIPELINE_STEPS.map((item) => {
        const IconComp = item.icon;
        const isActive = activeStep === item.idx;

        return (
          <div
            key={item.step}
            onClick={() => setActiveStep(item.idx)}
            className="relative cursor-pointer group"
          >
            {/* MICROCHIP JUNCTION NODE (Hardware IC Socket with Metal Pins) */}
            <div
              className={`absolute -left-[37px] sm:-left-[44px] top-4 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg font-mono transition-all duration-300 ${
                isActive
                  ? "bg-[#06101e] border-2 border-cyan-400 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.8)] scale-110"
                  : "bg-[#0a0c10] border border-slate-700 text-slate-500 hover:border-slate-500"
              }`}
            >
              {/* Left IC Metal Pins */}
              <span
                className={`absolute -left-1.5 top-2 w-1.5 h-1 rounded-l-sm transition-colors duration-300 ${
                  isActive ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-slate-700"
                }`}
              />
              <span
                className={`absolute -left-1.5 bottom-2 w-1.5 h-1 rounded-l-sm transition-colors duration-300 ${
                  isActive ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-slate-700"
                }`}
              />

              {/* Right IC Metal Pins */}
              <span
                className={`absolute -right-1.5 top-2 w-1.5 h-1 rounded-r-sm transition-colors duration-300 ${
                  isActive ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-slate-700"
                }`}
              />
              <span
                className={`absolute -right-1.5 bottom-2 w-1.5 h-1 rounded-r-sm transition-colors duration-300 ${
                  isActive ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-slate-700"
                }`}
              />

              {/* Top Notch Indicator */}
              <span
                className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-b-sm transition-colors duration-300 ${
                  isActive ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-slate-700"
                }`}
              />

              {/* Chip Core Display */}
              <span className="font-mono text-xs sm:text-sm font-black tracking-tight z-10">
                {item.step}
              </span>
            </div>

            {/* Horizontal Circuit Bus Trace (Connecting Chip to Card) */}
            <div
              className={`absolute -left-[2px] top-8 h-[2px] transition-all duration-300 ${
                isActive
                  ? "w-4 sm:w-6 bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                  : "w-3 sm:w-5 bg-slate-800"
              }`}
            />

            {/* STEP CARD: Active lights up blue, inactive turns off (dormant) */}
            <div
              className={`rounded-2xl transition-all duration-300 p-4 sm:p-5 space-y-2.5 ${
                isActive
                  ? "border-2 border-cyan-400 bg-[#070e1b] shadow-[0_0_35px_rgba(34,211,238,0.3)] opacity-100 scale-[1.01]"
                  : "border border-white/10 bg-[#0c0d12]/70 backdrop-blur-md opacity-45 hover:opacity-75 hover:border-white/20"
              }`}
            >
              {/* Header Meta Row */}
              <div
                className={`flex items-center justify-between font-mono text-[10px] border-b pb-2 transition-colors ${
                  isActive ? "border-blue-500/30" : "border-white/5"
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400"
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  <span>// TAHAPAN {item.step}</span>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5">
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                      <Zap className="h-2.5 w-2.5 text-cyan-400 animate-pulse fill-cyan-400" />
                      <span>AKTIF BERJALAN</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                      {item.phase}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-1">
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

              {/* Technical Telemetry Output */}
              <div className="pt-1">
                <div
                  className={`font-mono text-[10px] px-3 py-1.5 rounded-lg border truncate transition-all ${
                    isActive
                      ? "text-cyan-200 bg-[#070b14] border-cyan-500/40 shadow-inner"
                      : "text-slate-400 bg-[#090a0d] border-white/5"
                  }`}
                >
                  {item.telemetry}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
