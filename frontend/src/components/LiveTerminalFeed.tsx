"use client";

import React, { useState, useEffect, useRef } from "react";

interface LogEntry {
  tag: string;
  tagColor: string;
  message: string;
  detail?: string;
}

const TERMINAL_LOGS: LogEntry[] = [
  {
    tag: "INTERCEPT",
    tagColor: "text-blue-400 bg-blue-950/60 border-blue-800/50",
    message: "Payload inbound from WA gateway: +62-838-7192-xxxx",
    detail: "MIME: text/plain | 248 bytes",
  },
  {
    tag: "TOKENIZE",
    tagColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800/50",
    message: "Shannon entropy score: 4.88 -> Anomaly threshold exceeded",
    detail: "Tokens: [loker, komisi, tugas, like, shopee, vip, deposit]",
  },
  {
    tag: "HEURISTIC",
    tagColor: "text-blue-300 bg-blue-900/40 border-blue-700/50",
    message: "Pattern match: TASK_SCAM_PYRAMID_TRAP (Rule ID: #ID-092)",
    detail: "Confidence: 94.6% [RECOGNIZED]",
  },
  {
    tag: "COGNITIVE",
    tagColor: "text-indigo-300 bg-indigo-950/60 border-indigo-800/50",
    message: "Psychological vector: Urgency + Greed Baiting detected",
    detail: "Trigger: 'slot terbatas hanya hari ini' -> Risk +35",
  },
  {
    tag: "DNS_HOPS",
    tagColor: "text-sky-400 bg-sky-950/60 border-sky-800/50",
    message: "Resolving shortlink: bit.ly/3x88-job -> Destination tracking",
    detail: "Target: https://shopee-vip-komisi.site/login",
  },
  {
    tag: "DOMAIN_INTEL",
    tagColor: "text-blue-400 bg-blue-950/60 border-blue-800/50",
    message: "TLD check: .SITE registered 3 days ago via Namecheap",
    detail: "WHOIS: Privacy protected | Typosquat of 'shopee.co.id'",
  },
  {
    tag: "BINARY_AUDIT",
    tagColor: "text-cyan-300 bg-cyan-950/60 border-cyan-800/50",
    message: "Dissecting attachment: Undangan_Resmi_Pernikahan.apk",
    detail: "DEX decompilation: Found android.permission.RECEIVE_SMS",
  },
  {
    tag: "THREAT_EVAL",
    tagColor: "text-white bg-blue-600/50 border-blue-400/60",
    message: "Composite Threat Score: 88.4% [CRITICAL_EXPOSURE]",
    detail: "Verdict: MALICIOUS OTP SNIFFER & IMPERSONATION",
  },
  {
    tag: "AUTO_DOSSIER",
    tagColor: "text-blue-300 bg-blue-950/60 border-blue-800/50",
    message: "Compiling CSIRT forensic package #DOSSIER-2026-X09...",
    detail: "Formal evidence ready for Komdigi, OJK & Siber Polri",
  },
  {
    tag: "SURVEILLANCE",
    tagColor: "text-blue-400 bg-blue-950/60 border-blue-800/50",
    message: "Listening on socket :8082... Continuous node surveillance active",
    detail: "No unauthorized intrusions logged",
  },
];

export default function LiveTerminalFeed() {
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Seed initial 3 logs
    setDisplayedLogs(TERMINAL_LOGS.slice(0, 3));
    setCurrentIndex(3);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedLogs((prev) => {
        const nextItem = TERMINAL_LOGS[currentIndex % TERMINAL_LOGS.length];
        const updated = [...prev, nextItem];
        // Keep last 14 logs in memory
        return updated.slice(-14);
      });
      setCurrentIndex((prev) => prev + 1);
    }, 1400);

    return () => clearInterval(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-[#090b10] shadow-2xl overflow-hidden font-mono text-left">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#10131a] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          {/* Terminal Dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20 inline-block" />
          </div>
          <span className="text-[11px] font-bold text-slate-300 ml-1">
            pandu@forensic-soc: ~/engine/surveillance
          </span>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="tracking-wider">LIVE RECON</span>
        </div>
      </div>

      {/* Terminal Output Body with Auto-Scroll */}
      <div
        ref={scrollRef}
        className="h-[250px] sm:h-[280px] overflow-y-auto p-3 sm:p-4 space-y-2.5 scroll-smooth text-[10px] sm:text-[11px] leading-relaxed selection:bg-blue-600/40"
      >
        <div className="text-slate-400 pb-1 border-b border-white/5">
          [INIT] PANDU Automated Heuristic Engine v1.0.4 loaded. Core modules: [Scanner, Sandbox, Dossier]
        </div>

        {displayedLogs.map((log, idx) => (
          <div key={idx} className="space-y-0.5 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <span className="text-slate-400 select-none">&gt;</span>
              <span
                className={`px-1.5 py-0.2 rounded border text-[9px] sm:text-[10px] font-bold uppercase shrink-0 ${log.tagColor}`}
              >
                {log.tag}
              </span>
              <span className="text-slate-200 font-medium break-all">{log.message}</span>
            </div>
            {log.detail && (
              <div className="pl-6 text-[10px] text-slate-400 font-mono">
                └─ {log.detail}
              </div>
            )}
          </div>
        ))}

        {/* Active Typing Prompt Line */}
        <div className="flex items-center gap-2 pt-1 text-blue-400">
          <span className="text-slate-400 select-none">&gt;</span>
          <span className="text-white font-semibold">pandu@soc:~#</span>
          <span className="text-slate-400">analyzing stream</span>
          <span className="inline-block w-2 h-3.5 bg-blue-400 animate-pulse ml-0.5" />
        </div>
      </div>

      {/* Terminal Footer Info Bar */}
      <div className="flex items-center justify-between border-t border-white/5 bg-[#0d0f15] px-3.5 py-1.5 text-[10px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>PORT: 8082 (Go Fiber)</span>
          <span>LATENCY: &lt;1ms</span>
        </div>
        <span className="text-blue-400 font-semibold">ZERO_DATA_STORAGE: TRUE</span>
      </div>
    </div>
  );
}
