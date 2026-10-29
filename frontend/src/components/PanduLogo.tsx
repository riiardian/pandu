import React from "react";

interface PanduLogoProps {
  className?: string;
  size?: number;
}

export default function PanduLogo({ className = "h-6 w-6", size }: PanduLogoProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <mask id="panduEyeMask">
          <rect width="512" height="512" fill="white" />
          {/* Magnifying glass ring cutout */}
          <circle cx="256" cy="256" r="70" fill="black" />
          {/* Diagonal handle cutout at 45 degrees */}
          <rect
            x="236"
            y="256"
            width="40"
            height="150"
            rx="2"
            fill="black"
            transform="rotate(-45 256 256)"
          />
          {/* Central pupil restoration */}
          <circle cx="256" cy="256" r="38" fill="white" />
        </mask>
      </defs>
      {/* Almond eye silhouette with negative space magnifying glass */}
      <path
        d="M 60 256 C 128 144, 384 144, 452 256 C 384 368, 128 368, 60 256 Z"
        fill="currentColor"
        mask="url(#panduEyeMask)"
      />
    </svg>
  );
}
