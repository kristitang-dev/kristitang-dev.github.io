import type { RefObject } from 'react'
import './HeroContent.css'

interface HeroContentProps {
  chairRef?: RefObject<SVGCircleElement | null>
}

export function HeroContent({ chairRef }: HeroContentProps) {
  return (
    <div className="hero-content">
      <div className="hero-content__left">
        <div className="hero-placeholder">
          <div className="hero-placeholder__block hero-placeholder__block--title" />
          <div className="hero-placeholder__block hero-placeholder__block--subtitle" />
          <div className="hero-placeholder__block hero-placeholder__block--tagline" />
          <div className="hero-placeholder__block hero-placeholder__block--line" />
          <div className="hero-placeholder__block hero-placeholder__block--line hero-placeholder__block--short" />
        </div>
      </div>

      <div className="hero-content__right">
        <IsometricScene chairRef={chairRef} />
      </div>
    </div>
  )
}

interface IsometricSceneProps {
  chairRef?: RefObject<SVGCircleElement | null>
}

function IsometricScene({ chairRef }: IsometricSceneProps) {
  return (
    <svg
      className="isometric-scene"
      viewBox="0 0 520 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="floor-grid" width="40" height="23" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 23"
            fill="none"
            stroke="var(--grid-color, #c8c8ce)"
            strokeWidth="0.75"
            opacity="0.5"
          />
        </pattern>
        <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="var(--grid-color, #c8c8ce)"
            strokeWidth="0.5"
            opacity="0.35"
          />
        </pattern>
      </defs>

      {/* Floor plane */}
      <path d="M 60 340 L 500 340 L 500 380 L 60 380 Z" fill="url(#floor-grid)" />
      <path d="M 60 340 L 500 340 L 500 380 L 60 380 Z" fill="url(#blueprint-grid)" opacity="0.4" />

      {/* Desk — grey isometric box */}
      <g className="desk">
        {/* Right face */}
        <path d="M 340 260 L 460 260 L 460 340 L 340 340 Z" fill="#3a3a42" />
        {/* Left face */}
        <path d="M 260 300 L 340 260 L 340 340 L 260 380 Z" fill="#4a4a52" />
        {/* Top surface */}
        <path d="M 260 300 L 340 260 L 460 260 L 380 300 Z" fill="#5a5a62" />
        {/* Edge highlight */}
        <path
          d="M 260 300 L 340 260 L 460 260 L 380 300 Z"
          fill="none"
          stroke="#6a6a72"
          strokeWidth="1"
        />
      </g>

      {/* Laptop on desk */}
      <g className="laptop">
        {/* Screen — open, blue */}
        <path d="M 310 248 L 370 218 L 420 218 L 360 248 Z" fill="#2b4c7e" />
        <path d="M 318 244 L 368 220 L 412 220 L 362 244 Z" fill="#3d6a9e" />
        {/* Screen glow line */}
        <path d="M 325 238 L 365 222" stroke="#5a8ec4" strokeWidth="1.5" opacity="0.6" />
        {/* Keyboard base */}
        <path d="M 300 268 L 380 228 L 400 228 L 320 268 Z" fill="#0f1b2e" />
        <path d="M 300 268 L 320 268 L 320 274 L 300 274 Z" fill="#1a2a42" />
      </g>

      {/* Red Chair — focal point, bottom-right area */}
      <g className="chair">
        {/* Chair base / legs */}
        <path d="M 400 310 L 430 310 L 430 340 L 400 340 Z" fill="#a82e2e" />
        <path d="M 385 325 L 400 310 L 430 310 L 415 325 Z" fill="#8a2525" />
        {/* Seat */}
        <path d="M 370 295 L 430 295 L 450 310 L 390 310 Z" fill="#d63b3b" />
        {/* Seat front edge */}
        <path d="M 390 310 L 450 310 L 445 318 L 385 318 Z" fill="#c43333" />
        {/* Back rest */}
        <path d="M 370 295 L 378 240 L 398 240 L 390 295 Z" fill="#d63b3b" />
        <path d="M 378 240 L 398 240 L 405 248 L 385 248 Z" fill="#e84545" />
        {/* Back rest side */}
        <path d="M 398 240 L 405 248 L 405 303 L 398 295 Z" fill="#b83232" />
      </g>

      {/* Spotlight anchor — invisible target at chair seat center */}
      <circle
        ref={chairRef}
        cx="415"
        cy="302"
        r="4"
        fill="transparent"
        className="chair-anchor"
      />

      {/* Blueprint dimension lines (decorative) */}
      <g className="blueprint-annotations" opacity="0.4">
        <line x1="260" y1="385" x2="460" y2="385" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 3" />
        <line x1="255" y1="300" x2="255" y2="385" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 3" />
        <text x="350" y="395" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="currentColor">
          workspace
        </text>
      </g>
    </svg>
  )
}
