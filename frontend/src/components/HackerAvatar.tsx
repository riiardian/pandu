import React from "react";

interface HackerAvatarProps {
  className?: string;
}

export default function HackerAvatar({ className = "h-9 w-9" }: HackerAvatarProps) {
  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="avatarBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a0d14" />
            <stop offset="100%" stopColor="#141923" />
          </linearGradient>
          <linearGradient id="avatarHoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2b3346" />
            <stop offset="100%" stopColor="#151922" />
          </linearGradient>
          <linearGradient id="avatarVisorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#00f2fe" stopOpacity="1" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
          <filter id="avatarGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Circular Container & Subtle Border */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#avatarBgGrad)"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Cyber Radar / Targeting Track */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.75"
          strokeOpacity="0.25"
          strokeDasharray="2,3"
        />

        {/* Shoulders / Torso */}
        <path
          d="M18 90 C18 73 32 66 50 66 C68 66 82 73 82 90 Z"
          fill="#161b24"
          stroke="#2a3245"
          strokeWidth="1"
        />

        {/* Outer Hoodie Silhouette */}
        <path
          d="M50 16 C34 16 28 28 28 48 C28 62 36 67 44 68 C47 68.5 50 69 50 69 C50 69 53 68.5 56 68 C64 67 72 62 72 48 C72 28 66 16 50 16 Z"
          fill="url(#avatarHoodGrad)"
        />

        {/* Inner Hood Deep Black Void */}
        <path
          d="M50 22 C38 22 34 32 34 49 C34 60 40 64 50 65 C60 64 66 60 66 49 C66 32 62 22 50 22 Z"
          fill="#060709"
        />

        {/* Faceless Mask Shadow */}
        <ellipse cx="50" cy="46" rx="11" ry="14" fill="#0b0e14" />

        {/* Glowing Cyber Hacker Visor */}
        <path
          d="M41 44 Q50 42 59 44 Q50 47 41 44 Z"
          fill="url(#avatarVisorGlow)"
          filter="url(#avatarGlowFilter)"
        />

        {/* Center Visor Glint */}
        <ellipse cx="50" cy="44.2" rx="3" ry="1" fill="#ffffff" opacity="0.9" />

        {/* Tech Collar Accent */}
        <path
          d="M44 68 L50 77 L56 68"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
      </svg>
    </div>
  );
}
