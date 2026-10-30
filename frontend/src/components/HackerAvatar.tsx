import React from "react";

interface HackerAvatarProps {
  className?: string;
}

export default function HackerAvatar({ className = "h-10 w-10" }: HackerAvatarProps) {
  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="hackerBgG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="hackerMaskG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="hackerHoodG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="hackerNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Circular Base & Glow Ring */}
        <circle cx="50" cy="50" r="48" fill="url(#hackerBgG)" stroke="#38bdf8" strokeWidth="2" />

        {/* Faint Cyber Reticle Background */}
        <path d="M15 50 H85 M50 15 V85" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="0.75"
          strokeOpacity="0.3"
          strokeDasharray="3,3"
        />

        {/* Shoulders & Upper Chest */}
        <path
          d="M12 92 C12 74 26 68 50 68 C74 68 88 74 88 92 Z"
          fill="#090d16"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Hoodie Outer Contour */}
        <path
          d="M50 14 C32 14 24 26 24 50 C24 64 34 71 44 72 C47 72.5 50 73 50 73 C50 73 53 72.5 56 72 C66 71 76 64 76 50 C76 26 68 14 50 14 Z"
          fill="url(#hackerHoodG)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Deep Black Inner Hood Shadow */}
        <path
          d="M50 20 C36 20 31 30 31 50 C31 62 38 66 50 67 C62 66 69 62 69 50 C69 30 64 20 50 20 Z"
          fill="#020617"
        />

        {/* High-Contrast White/Silver Hacker Mask */}
        <path
          d="M38 38 C38 34 43 32 50 32 C57 32 62 34 62 38 C62 48 61 58 50 65 C39 58 38 48 38 38 Z"
          fill="url(#hackerMaskG)"
          stroke="#94a3b8"
          strokeWidth="1"
        />

        {/* Dark Eye Sockets */}
        <path d="M41 42 C41 40 44 39 48 41 C46 44 43 45 41 42 Z" fill="#020617" />
        <path d="M59 42 C59 40 56 39 52 41 C54 44 57 45 59 42 Z" fill="#020617" />

        {/* Glowing Cyber Neon Cyan Eyes */}
        <ellipse cx="45" cy="42" rx="2" ry="1.2" fill="#00f2fe" filter="url(#hackerNeonGlow)" />
        <ellipse cx="55" cy="42" rx="2" ry="1.2" fill="#00f2fe" filter="url(#hackerNeonGlow)" />

        {/* Hacker Mustache & Cyber Glitch Contour */}
        <path
          d="M43 51 C46 53 48 53 50 51 C52 53 54 53 57 51 C55 54 52 55 50 54 C48 55 45 54 43 51 Z"
          fill="#0f172a"
        />

        {/* Goatee */}
        <polygon points="50,56 48,60 52,60" fill="#0f172a" />

        {/* Tech Neon Accent Collar */}
        <path
          d="M46 72 L50 82 L54 72"
          fill="none"
          stroke="#00f2fe"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
