import React from "react";

interface HackerAvatarProps {
  className?: string;
}

export default function HackerAvatar({ className = "h-10 w-10" }: HackerAvatarProps) {
  return (
    <div className={`relative shrink-0 select-none overflow-hidden rounded-full ${className}`}>
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <clipPath id="avatarCircleClip">
            <circle cx="250" cy="250" r="248" />
          </clipPath>
        </defs>

        <g clipPath="url(#avatarCircleClip)">
          {/* White Circular Backdrop */}
          <circle cx="250" cy="250" r="248" fill="#FFFFFF" />

          {/* Hacker Hoodie (Head, Shoulders, Body) */}
          <path
            d="M 250 68
               C 182 68 140 125 146 198
               C 150 236 172 260 184 274
               C 142 308 86 358 80 440
               L 420 440
               C 414 358 358 308 316 274
               C 328 260 350 236 354 198
               C 360 125 318 68 250 68 Z"
            fill="#25262A"
          />

          {/* Peach Chin & Lower Cheeks */}
          <path
            d="M 200 196
               C 200 248 222 268 250 268
               C 278 268 300 248 300 196
               C 278 208 262 204 250 204
               C 238 204 222 208 200 196 Z"
            fill="#DEAA86"
          />

          {/* Dark Sunglasses / Goggles Frame */}
          <path
            d="M 198 180
               C 198 166 216 162 234 167
               C 244 170 248 180 250 186
               C 252 180 256 170 266 167
               C 284 162 302 166 302 180
               C 302 196 278 208 250 204
               C 222 208 198 196 198 180 Z"
            fill="#16171A"
          />

          {/* Left Sunglass Lens Reflection (Clean high-contrast off-white) */}
          <path
            d="M 210 183
               C 208 173 222 171 233 173
               C 241 175 244 185 240 192
               C 230 198 212 194 210 183 Z"
            fill="#E2E8F0"
          />

          {/* Right Sunglass Lens Reflection (Mirrored) */}
          <path
            d="M 290 183
               C 292 173 278 171 267 173
               C 259 175 256 185 260 192
               C 270 198 288 194 290 183 Z"
            fill="#E2E8F0"
          />

          {/* Laptop Lid (Widescreen 16:10, rounded top corners) */}
          <rect x="135" y="318" width="230" height="120" rx="10" ry="10" fill="#525559" />

          {/* Laptop Base / Lower Chassis */}
          <path
            d="M 128 438 L 372 438 L 372 450 L 366 450 L 366 446 L 134 446 L 134 450 L 128 450 Z"
            fill="#3B3D40"
          />
        </g>
      </svg>
    </div>
  );
}
