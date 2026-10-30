"use client";

import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";
import animData from "@/assets/cyber-radar.json";

interface CyberRadarAnimationProps {
  className?: string;
}

export default function CyberRadarAnimation({
  className = "w-52 h-32 sm:w-64 sm:h-40",
}: CyberRadarAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: animData,
    });

    return () => {
      anim.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
