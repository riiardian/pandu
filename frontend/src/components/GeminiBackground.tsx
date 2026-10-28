"use client";

import React from "react";

export default function GeminiBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-black">
      {/* 
        Authentic Google Gemini Luminous Moving Aurora:
        High-luminance electric cobalt & cyan highlights blooming over pitch black void (#000000)
        Actively gliding up/down and sideways in real time.
      */}

      {/* Primary Electric Cobalt Light Source (Intense, Vivid, Radiant) */}
      <div
        className="absolute top-[80px] left-1/2 w-[360px] sm:w-[620px] h-[360px] sm:h-[540px] rounded-full blur-[70px] sm:blur-[100px] opacity-90 animate-gemini-float"
        style={{
          background:
            "radial-gradient(circle, #0077ff 0%, #0055dd 30%, #002b99 65%, transparent 100%)",
        }}
      />

      {/* Secondary Vibrant Electric Cyan-Blue Core (Adds luminous aura contrast) */}
      <div
        className="absolute top-[160px] left-1/2 w-[260px] sm:w-[440px] h-[260px] sm:h-[400px] rounded-full blur-[60px] sm:blur-[90px] opacity-80 animate-gemini-drift"
        style={{
          background:
            "radial-gradient(circle, #00c3ff 0%, #0066ff 40%, #002288 75%, transparent 100%)",
        }}
      />

      {/* Tertiary Ambient Blue Bloom */}
      <div
        className="absolute top-[420px] left-1/2 w-[320px] sm:w-[500px] h-[260px] sm:h-[380px] rounded-full blur-[80px] sm:blur-[120px] opacity-70 animate-gemini-pulse"
        style={{
          background:
            "radial-gradient(circle, #0055ff 0%, #0033aa 45%, transparent 80%)",
        }}
      />
    </div>
  );
}
