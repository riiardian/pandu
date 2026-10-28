"use client";

import React from "react";

export default function GeminiBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-black">
      {/* 
        Authentic Google Gemini Chromatic Aurora:
        Multi-point fluid mesh: Electric Cobalt (#2563eb), Celestial Violet (#7c3aed), and Luminous Cyan (#06b6d4)
        Washing seamlessly through the top navigation header down across the viewport.
      */}

      {/* Header Permanent Illumination (Directly bathes the top bar and status bar in light) */}
      <div
        className="absolute -top-[50px] left-1/2 -translate-x-1/2 w-[90vw] sm:w-[650px] h-[200px] sm:h-[260px] rounded-full blur-[70px] sm:blur-[100px] opacity-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.70) 0%, rgba(124, 58, 237, 0.45) 45%, transparent 80%)",
        }}
      />

      {/* Layer 1: Electric Cobalt Blue (Starts above header at -top-[120px] and sweeps down) */}
      <div
        className="absolute -top-[120px] left-[15%] w-[420px] sm:w-[680px] h-[440px] sm:h-[680px] rounded-full blur-[90px] sm:blur-[140px] opacity-80 animate-aurora-sweep pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #2563eb 0%, #1d4ed8 45%, #1e3a8a 70%, transparent 85%)",
        }}
      />

      {/* Layer 2: Celestial Violet (Starts at top-right at -top-[100px] washing through header) */}
      <div
        className="absolute -top-[100px] right-[10%] w-[380px] sm:w-[620px] h-[400px] sm:h-[620px] rounded-full blur-[90px] sm:blur-[140px] opacity-75 animate-aurora-counter pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #7c3aed 0%, #6366f1 45%, transparent 80%)",
        }}
      />

      {/* Layer 3: Luminous Cyan Highlight (Drifting vertically through mid-center) */}
      <div
        className="absolute top-[28vh] left-[25%] w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] rounded-full blur-[85px] sm:blur-[130px] opacity-65 animate-aurora-sweep pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #06b6d4 0%, #0284c7 45%, transparent 80%)",
        }}
      />
    </div>
  );
}
