"use client";

import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";
import animData from "@/assets/cyber-radar.json";

interface CyberRadarAnimationProps {
  className?: string;
}

export default function CyberRadarAnimation({
  className = "w-36 h-36 sm:w-44 sm:h-44",
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
      className={`flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}
