"use client";

import React from "react";
import { Terminal, Shield, Cpu, Database } from "lucide-react";

const PIPELINE_STEPS = [
  {
    step: "01",
    phase: "INGESTION",
    title: "Input Muatan Pesan & Tautan",
    desc: "Sistem menerima pesan teks dari WhatsApp, Telegram, SMS, atau link mencurigakan, kemudian memecah muatan menjadi token analitik tanpa menyimpan identitas pengguna.",
    telemetry: "> ingest: payload_tokenized [100% anonymized]",
    icon: Terminal,
  },
  {
    step: "02",
    phase: "DECOMPOSITION",
    title: "Pembedahan Pola Manipulasi",
    desc: "Mesin backend Go mengevaluasi indikator bias kognitif (kepanikan waktu, iming-iming komisi, otoritas palsu) dan menghitung nilai anomali entropi Shannon.",
    telemetry: "> heuristic: 6_manipulation_vectors_evaluated",
    icon: Cpu,
  },
  {
    step: "03",
    phase: "FORENSIC TRACE",
    title: "Forensik Domain & Izin File APK",
    desc: "Melacak rantai redirect shortlink, memeriksa umur pendaftaran domain tiruan (.SITE / .XYZ), serta mengurai izin bahaya penyadap SMS OTP.",
    telemetry: "> trace: dns_hops_resolved | domain_age: 2_days",
    icon: Shield,
  },
  {
    step: "04",
    phase: "REGISTRY & MITIGATE",
    title: "Pencatatan Database & Tindakan Cepat",
    desc: "Menerbitkan skor risiko transparan, checklist tindakan darurat isolasi akun 5 menit, dan secara otomatis mencatat entitas ke basis data daftar hitam PANDU.",
    telemetry: "> registry: blacklisted_in_pandu_db [stored]",
    icon: Database,
  },
];

export default function AnimatedPipeline() {
  return (
    <div className="relative pl-7 sm:pl-10 space-y-6 text-left my-4">
      {/* The Continuous Vertical Cable / Conduit Wire */}
      <div className="absolute left-[13px] sm:left-[17px] top-6 bottom-6 w-[2px] bg-slate-800 rounded-full overflow-hidden">
        {/* Animated Electric Glowing Pulse Flowing Down the Cable */}
        <div className="absolute left-0 top-0 w-full h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[1px] animate-cable-flow" />
      </div>

      {/* Pipeline Steps with Cable Junction Nodes */}
      {PIPELINE_STEPS.map((item) => {
        const IconComp = item.icon;
        return (
          <div key={item.step} className="relative group">
            {/* Cable Junction Node (Circle sitting right on the wire) */}
            <div className="absolute -left-[24px] sm:-left-[28px] top-4 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#08090d] border border-blue-500/80 font-mono text-[10px] sm:text-xs font-bold text-blue-400 shadow-[0_0_12px_rgba(0,119,255,0.35)] z-10 group-hover:border-blue-400 group-hover:shadow-[0_0_16px_rgba(0,119,255,0.6)] transition-all">
              {item.step}
            </div>

            {/* Horizontal Jumper Lead connecting Node to Card */}
            <div className="absolute -left-[3px] top-7 w-2 sm:w-3 h-[1px] bg-blue-500/30" />

            {/* Step Card Content */}
            <div className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-4 sm:p-5 space-y-2.5 shadow-xl hover:border-blue-500/40 hover:bg-[#16181f] transition-all">
              {/* Header Meta Row */}
              <div className="flex items-center justify-between font-mono text-[10px] border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <IconComp className="h-3.5 w-3.5" />
                  <span>// TAHAPAN {item.step}</span>
                </div>
                <span className="text-slate-400 uppercase tracking-wider">
                  {item.phase}
                </span>
              </div>

              {/* Title & Body */}
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Technical Telemetry Output */}
              <div className="pt-1">
                <div className="font-mono text-[10px] text-slate-400 bg-[#090a0d] px-3 py-1.5 rounded-lg border border-white/5 truncate">
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
