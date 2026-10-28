"use client";

import React, { useState, useEffect } from "react";

const SCAN_LINES = [
  { prefix: "[SCAN]", type: "info", text: "inbound/resi_paket_kurir_v2.apk -> unpacking payload..." },
  { prefix: "[DEX]",  type: "proc", text: "classes.dex: 14,820 methods, 3,410 classes indexed" },
  { prefix: "[PERM]", type: "warn", text: "AndroidManifest.xml: android.permission.RECEIVE_SMS" },
  { prefix: "[PERM]", type: "crit", text: "AndroidManifest.xml: android.permission.READ_SMS [CRITICAL]" },
  { prefix: "[HOOK]", type: "crit", text: "smali/com/sec/receiver/SmsHook.smali -> Intercepting OTP broadcast" },
  { prefix: "[YARA]", type: "crit", text: "rule match: id_banking_stealer_gen (offset: 0x0004a2c0)" },
  { prefix: "[HASH]", type: "info", text: "sha256: 8f4457b4f0c7e2b1... verified against malware db" },
  { prefix: "[URL]",  type: "info", text: "found embedded shortlink: bit.ly/3x-shopee-komisi" },
  { prefix: "[DNS]",  type: "warn", text: "resolving A record: shopee-vip-toko.site -> 185.220.101.4" },
  { prefix: "[SSL]",  type: "warn", text: "domain age: 2 days | issuer: Free-CA [HIGH_RISK_ANOMALY]" },
  { prefix: "[HEUR]", type: "warn", text: "NLP pattern: 'tugas like video VIP slot terbatas' (Risk: 88%)" },
  { prefix: "[C2]",   type: "crit", text: "detected egress command-and-control socket: 185.220.101.4:8443" },
  { prefix: "[BLOCK]",type: "proc", text: "C2 socket blocked by PANDU active heuristic filter" },
  { prefix: "[TRIP]", type: "crit", text: "rule ID-902 triggered: TaskScam.DepositPhishing [MALICIOUS]" },
  { prefix: "[PCAP]", type: "info", text: "session_dump.pcap (48 KB) -> 24 packet streams inspected" },
  { prefix: "[SCAN]", type: "info", text: "inbound/surat_tilang_elektronik_etle.apk -> scanning bytecode..." },
  { prefix: "[DEX]",  type: "warn", text: "classes2.dex: obfuscated with ProGuard / DexGuard packers" },
  { prefix: "[HOOK]", type: "crit", text: "smali/org/etle/service/Forwarder.smali -> Auto-forwarding SMS to Telegram bot" },
  { prefix: "[YARA]", type: "crit", text: "rule match: sms_forwarder_trojan_v4 [CONFIRMED]" },
  { prefix: "[EVAL]", type: "crit", text: "threat rating: 94.8% -> Critical infection vector confirmed" },
  { prefix: "[AUTO]", type: "proc", text: "compiling official CSIRT dossier #DOSSIER-2026-X09" },
  { prefix: "[DONE]", type: "proc", text: "target analyzed: 1,480 heuristic vectors verified [0.38s]" },
];

export default function LiveTerminalFeed() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    // High-speed file scanning animation (every 140ms new line)
    const interval = setInterval(() => {
      setLineIndex((prev) => prev + 1);
    }, 140);

    return () => clearInterval(interval);
  }, []);

  // Compute the rolling visible slice of lines (last 8 lines)
  const visibleLines = [];
  const total = SCAN_LINES.length;
  for (let i = 0; i < 9; i++) {
    const idx = (lineIndex + i) % total;
    visibleLines.push({ ...SCAN_LINES[idx], id: `${lineIndex}-${i}` });
  }

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "crit":
        return "text-rose-400 bg-rose-950/60 border-rose-800/60";
      case "warn":
        return "text-amber-400 bg-amber-950/60 border-amber-800/60";
      case "proc":
        return "text-cyan-400 bg-cyan-950/60 border-cyan-800/60";
      default:
        return "text-blue-400 bg-blue-950/60 border-blue-800/60";
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-[#07080c] shadow-2xl overflow-hidden font-mono text-left select-none pointer-events-none touch-none">
      {/* Terminal Titlebar - Clean, no live recon badge */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0e1017] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          {/* Terminal Window Controls */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-[11px] font-bold text-slate-300 ml-1 truncate">
            pandu-engine --scan /var/inbound/
          </span>
        </div>

        {/* Live File Rate Counter */}
        <div className="text-[10px] font-mono text-slate-400">
          <span>{((lineIndex * 47) % 9400) + 1200} files/s</span>
        </div>
      </div>

      {/* Terminal Output Body - Fast streaming, strictly non-scrollable */}
      <div className="h-[210px] sm:h-[235px] p-3 sm:p-3.5 space-y-1.5 overflow-hidden text-[10px] sm:text-[11px] leading-relaxed">
        {visibleLines.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="text-slate-400 text-[9px] select-none">&gt;</span>
            <span
              className={`px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase shrink-0 ${getBadgeStyle(
                item.type
              )}`}
            >
              {item.prefix}
            </span>
            <span className={`truncate ${idx === visibleLines.length - 1 ? "text-white font-semibold" : "text-slate-300"}`}>
              {item.text}
            </span>
            {idx === visibleLines.length - 1 && (
              <span className="inline-block w-1.5 h-3 bg-blue-400 animate-pulse shrink-0 ml-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
