"use client";

import React, { useState, useEffect } from "react";

const TERMINAL_STREAM = [
  { pfx: "[+]", color: "text-emerald-400", text: "scanning /var/inbound/resi_paket_kurir_v2.apk (4,180 KB)" },
  { pfx: "[*]", color: "text-blue-400",    text: "classes.dex indexed: 14,820 methods, 3,410 classes" },
  { pfx: "[!]", color: "text-amber-400",   text: "manifest: found permission android.permission.RECEIVE_SMS" },
  { pfx: "[!]", color: "text-rose-400",    text: "manifest: found permission android.permission.READ_SMS [CRITICAL]" },
  { pfx: "[!]", color: "text-rose-400",    text: "smali: hook detected at com/sec/receiver/SmsHook.smali -> Intercepting OTP" },
  { pfx: "[!]", color: "text-rose-400",    text: "yara: rule matched 'id_banking_stealer_gen' (offset: 0x0004a2c0)" },
  { pfx: "[*]", color: "text-blue-400",    text: "hash: sha256 8f4457b4f0c7e2b192834c362f3c41e2... [MALICIOUS]" },
  { pfx: "[+]", color: "text-emerald-400", text: "extracted shortlink: bit.ly/3x-shopee-komisi -> shopee-vip-toko.site" },
  { pfx: "[!]", color: "text-amber-400",   text: "dns: A record 185.220.101.4 (unregistered brand spoofing)" },
  { pfx: "[!]", color: "text-amber-400",   text: "ssl: cert age 2 days, issuer Free-CA [HIGH_RISK_ANOMALY]" },
  { pfx: "[!]", color: "text-amber-400",   text: "nlp heuristic: task scam deposit pattern detected (risk: 88%)" },
  { pfx: "[!]", color: "text-rose-400",    text: "c2 egress: active socket connection to 185.220.101.4:8443" },
  { pfx: "[*]", color: "text-blue-400",    text: "iptables: egress socket connection blocked to 185.220.101.4" },
  { pfx: "[+]", color: "text-emerald-400", text: "scanning /var/inbound/surat_tilang_elektronik_etle.apk (2,840 KB)" },
  { pfx: "[*]", color: "text-blue-400",    text: "dex: classes2.dex packed with commercial DexGuard protector" },
  { pfx: "[!]", color: "text-rose-400",    text: "smali: hook detected at org/etle/service/Forwarder.smali -> SMS to Telegram" },
  { pfx: "[!]", color: "text-rose-400",    text: "yara: rule matched 'sms_forwarder_trojan_v4' [CONFIRMED]" },
  { pfx: "[!]", color: "text-rose-400",    text: "composite threat score: 94.8% -> Critical infection vector" },
  { pfx: "[+]", color: "text-emerald-400", text: "triage: incident dossier generated for Komdigi & Bareskrim" },
  { pfx: "[*]", color: "text-blue-400",    text: "batch scan completed: 1,480 heuristic vectors verified in 0.38s" },
];

export default function LiveTerminalFeed() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    // Fast realistic terminal scan speed (130ms per line)
    const interval = setInterval(() => {
      setLineIndex((prev) => prev + 1);
    }, 130);

    return () => clearInterval(interval);
  }, []);

  // Compute rolling slice of 8 visible lines
  const visibleLines = [];
  const total = TERMINAL_STREAM.length;
  for (let i = 0; i < 8; i++) {
    const idx = (lineIndex + i) % total;
    visibleLines.push({ ...TERMINAL_STREAM[idx], id: `${lineIndex}-${i}` });
  }

  return (
    <div className="terminal-feed-card w-full rounded-2xl border-0 bg-[#06070a] shadow-2xl overflow-hidden font-mono text-left select-none pointer-events-none touch-none">
      {/* Authentic Minimalist Terminal Titlebar */}
      <div className="terminal-titlebar flex items-center justify-between border-b border-white/5 bg-[#0d0f15] px-3.5 py-2">
        <div className="flex items-center gap-2">
          {/* Subtle Window Dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="titlebar-text text-[11px] text-slate-400 ml-1.5 font-mono">
            pandu@scanner: ~/forensics
          </span>
        </div>
      </div>

      {/* Terminal Output Body - Real terminal syntax, no badges, non-scrollable */}
      <div className="terminal-body p-3.5 space-y-1.5 overflow-hidden text-[11px] sm:text-xs leading-relaxed">
        {visibleLines.map((item, idx) => (
          <div key={item.id} className="flex items-baseline gap-2 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            <span className={`${item.color} font-bold select-none shrink-0`}>
              {item.pfx}
            </span>
            <span className={`terminal-log-text truncate ${idx === visibleLines.length - 1 ? "active-line font-semibold" : "text-slate-200"}`}>
              {item.text}
            </span>
            {idx === visibleLines.length - 1 && (
              <span className="terminal-cursor inline-block w-1.5 h-3.5 bg-white animate-pulse shrink-0 ml-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
