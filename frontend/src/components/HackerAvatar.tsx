import React from "react";

interface HackerAvatarProps {
  className?: string;
}

export default function HackerAvatar({ className = "h-10 w-10" }: HackerAvatarProps) {
  return (
    <div className={`relative shrink-0 select-none overflow-hidden rounded-full ${className}`}>
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <clipPath id="avatarCircle">
            <circle cx="256" cy="256" r="248" />
          </clipPath>
        </defs>

        <g clipPath="url(#avatarCircle)">
          {/* Deep obsidian dark base */}
          <rect width="512" height="512" fill="#0c0d12" />

          {/* Circuit Traces Background (Subtle cyber network) */}
          <g stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.35" fill="none" strokeLinecap="round">
            <path d="M 170 200 H 110 V 150 H 70" />
            <path d="M 130 150 H 160 V 90 H 190" />
            <path d="M 90 180 H 50 V 250 H 90" />
            <path d="M 60 250 V 350 H 90" />
            <path d="M 210 100 V 55 H 180" />

            <path d="M 342 200 H 402 V 150 H 442" />
            <path d="M 382 150 H 352 V 90 H 322" />
            <path d="M 422 180 H 462 V 250 H 422" />
            <path d="M 452 250 V 350 H 422" />
            <path d="M 302 100 V 55 H 332" />

            {/* Nodes */}
            <circle cx="70" cy="150" r="4" fill="#38bdf8" />
            <circle cx="190" cy="90" r="4" fill="#38bdf8" />
            <circle cx="90" cy="350" r="4" fill="#38bdf8" />
            <circle cx="442" cy="150" r="4" fill="#38bdf8" />
            <circle cx="322" cy="90" r="4" fill="#38bdf8" />
            <circle cx="422" cy="350" r="4" fill="#38bdf8" />
          </g>

          {/* Hacker Hood & Body Silhouette */}
          <path
            d="M 256 74
              C 276 102, 330 144, 330 210
              C 330 238, 314 256, 332 266
              C 364 282, 428 326, 436 420
              L 76 420
              C 84 326, 148 282, 180 266
              C 198 256, 182 238, 182 210
              C 182 144, 236 102, 256 74 Z"
            fill="#161821"
            stroke="#ffffff"
            strokeWidth="3"
          />

          {/* Inner Hood Shadow Void */}
          <path
            d="
              M 196 236
              C 192 162, 230 138, 256 138
              C 282 138, 320 162, 316 236
              C 300 248, 276 254, 256 254
              C 236 254, 212 248, 196 236 Z"
            fill="#050608"
            stroke="#ffffff"
            strokeWidth="3.5"
          />

          {/* Cowl / Collar V-Slashes */}
          <path d="M 226 244 Q 244 268 250 286 Q 238 270 220 254 Z" fill="#ffffff" />
          <path d="M 286 244 Q 268 268 262 286 Q 274 270 292 254 Z" fill="#ffffff" />

          {/* Sleeve Creases / Folds */}
          <path d="M 120 376 C 134 368, 148 368, 160 376" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 132 390 C 144 382, 156 382, 166 390" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 392 376 C 378 368, 364 368, 352 376" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 380 390 C 368 382, 356 382, 346 390" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Sharp Glowing White Slanted Eyes (High Contrast!) */}
          <path d="M 216 190 Q 234 192 248 205 Q 234 209 214 195 Q 210 191 216 190 Z" fill="#ffffff" />
          <path d="M 296 190 Q 278 192 264 205 Q 278 209 298 195 Q 302 191 296 190 Z" fill="#ffffff" />

          {/* Glowing Cyan Accents in Eyes */}
          <ellipse cx="232" cy="199" rx="4" ry="2" fill="#00f2fe" />
          <ellipse cx="280" cy="199" rx="4" ry="2" fill="#00f2fe" />

          {/* Laptop Lid (Facing away, with Padlock) */}
          <rect x="144" y="278" width="224" height="132" rx="12" fill="#12141c" stroke="#ffffff" strokeWidth="5" />

          {/* Padlock Badge on Laptop Lid */}
          <g transform="translate(0, -6)">
            {/* Padlock Shackle */}
            <path
              d="M 245 348 V 338 C 245 329 267 329 267 338 V 348"
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Padlock Body */}
            <rect x="237" y="348" width="38" height="30" rx="5" fill="#ffffff" />
            {/* Keyhole */}
            <circle cx="256" cy="359" r="3.5" fill="#0c0d12" />
            <polygon points="254,359 258,359 260,370 252,370" fill="#0c0d12" />
          </g>

          {/* Laptop Base / Chassis */}
          <path d="M 134 416 L 378 416 L 370 426 L 142 426 Z" fill="#161821" stroke="#ffffff" strokeWidth="3.5" />
          <rect x="132" y="424" width="248" height="5" rx="2.5" fill="#ffffff" />

          {/* Desk Speed / Shadow Lines */}
          <g fill="#ffffff" opacity="0.8">
            <rect x="90" y="435" width="332" height="4" rx="2" />
            <rect x="120" y="443" width="272" height="3.5" rx="1.7" />
            <rect x="150" y="450" width="212" height="3" rx="1.5" />
            <rect x="180" y="456" width="152" height="2.5" rx="1.2" />
            <rect x="210" y="461" width="92" height="2" rx="1" />
          </g>
        </g>
      </svg>
    </div>
  );
}
