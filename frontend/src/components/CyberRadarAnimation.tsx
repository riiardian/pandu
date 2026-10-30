"use client";

import React, { useEffect, useRef } from "react";
import animData from "@/assets/cyber-radar.json";

interface CyberRadarAnimationProps {
  className?: string;
}

export default function CyberRadarAnimation({
  className = "w-56 h-36 sm:w-72 sm:h-44 lg:w-80 lg:h-48",
}: CyberRadarAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: any = null;
    import("lottie-web").then((lottieModule) => {
      const lottie = lottieModule.default || lottieModule;
      if (containerRef.current) {
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: animData,
        });
      }
    });

    return () => {
      if (anim) anim.destroy();
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
