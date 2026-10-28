"use client";

import React from "react";

export default function GeminiBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-black">
      {/* 
        Authentic Google Gemini Chromatic Aurora:
        Multi-point fluid mesh: Electric Cobalt (#2563eb), Celestial Violet (#7c3aed), and Luminous Cyan (#06b6d4)
        Gliding smoothly up, down, and across a pure pitch-black void (#000000).
      */}

      {/* Layer 1: Electric Cobalt Blue (Drifting through center-left) */}
      <div
        className="absolute top-[8vh] left-[15%] w-[380px] sm:w-[620px] h-[380px] sm:h-[620px] rounded-full blur-[85px] sm:blur-[130px] opacity-75 animate-aurora-sweep"
        style={{
          background:
            "radial-gradient(circle, #2563eb 0%, #1d4ed8 50%, transparent 80%)",
        }}
      />

      {/* Layer 2: Celestial Violet (Drifting through top-right) */}
      <div
        className="absolute top-[5vh] right-[10%] w-[350px] sm:w-[560px] h-[350px] sm:h-[560px] rounded-full blur-[85px] sm:blur-[130px] opacity-70 animate-aurora-counter"
        style={{
          background:
            "radial-gradient(circle, #7c3aed 0%, #6366f1 45%, transparent 80%)",
        }}
      />

      {/* Layer 3: Luminous Cyan Highlight (Drifting vertically through mid-center) */}
      <div
        className="absolute top-[32vh] left-[30%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[120px] opacity-60 animate-aurora-sweep"
        style={{
          background:
            "radial-gradient(circle, #06b6d4 0%, #0284c7 45%, transparent 80%)",
        }}
      />
    </div>
  );
}
