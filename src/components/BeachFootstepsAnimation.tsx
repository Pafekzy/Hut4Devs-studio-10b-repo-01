import React from 'react';

interface BeachFootstepsAnimationProps {
  isDark?: boolean;
  className?: string;
}

export const BeachFootstepsAnimation: React.FC<BeachFootstepsAnimationProps> = ({
  isDark = false,
  className = '',
}) => {
  // 6 footsteps forming a meandering walking trail across the sand (left/right alternating)
  const steps = [
    { id: 1, side: 'left', x: 22, y: 72, angle: -18, delay: '0.4s' },
    { id: 2, side: 'right', x: 50, y: 56, angle: -10, delay: '1.2s' },
    { id: 3, side: 'left', x: 80, y: 44, angle: 6, delay: '2.0s' },
    { id: 4, side: 'right', x: 112, y: 32, angle: 14, delay: '2.8s' },
    { id: 5, side: 'left', x: 146, y: 24, angle: 10, delay: '3.6s' },
    { id: 6, side: 'right', x: 180, y: 16, angle: 4, delay: '4.4s' },
  ];

  return (
    <div
      className={`relative w-full h-[104px] rounded-xl overflow-hidden border select-none ${className}`}
      style={{
        backgroundColor: isDark ? '#1C130B' : '#FAF3E8',
        borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.16)',
        boxShadow: isDark
          ? 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
          : 'inset 0 2px 6px rgba(90, 45, 12, 0.05)',
      }}
      role="img"
      aria-label="Animated footsteps trail forming in the beach sand representing immutable trust events"
    >
      {/* Beach Sand Subtle Texture & Ripples */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-25"
        preserveAspectRatio="none"
        viewBox="0 0 240 100"
      >
        {/* Soft Dune Contours */}
        <path
          d="M0,85 Q60,65 120,78 T240,60 L240,100 L0,100 Z"
          fill={isDark ? '#261A10' : '#F2E6D4'}
        />
        <path
          d="M0,50 Q70,35 140,45 T240,30"
          fill="none"
          stroke={isDark ? '#3D2817' : '#E8D8C2'}
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M0,75 Q90,60 170,68 T240,55"
          fill="none"
          stroke={isDark ? '#3D2817' : '#E8D8C2'}
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        {/* Sand grain flecks */}
        <circle cx="35" cy="25" r="0.8" fill={isDark ? '#C88D3A' : '#C49B75'} opacity="0.6" />
        <circle cx="85" cy="80" r="0.7" fill={isDark ? '#C88D3A' : '#C49B75'} opacity="0.5" />
        <circle cx="160" cy="18" r="0.9" fill={isDark ? '#C88D3A' : '#C49B75'} opacity="0.7" />
        <circle cx="210" cy="70" r="0.8" fill={isDark ? '#C88D3A' : '#C49B75'} opacity="0.5" />
      </svg>

      {/* Walking Footprints Trail */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 210 90"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Detailed Left Footprint Graphic */}
          <g id="left-footprint">
            {/* Heel indentation */}
            <ellipse cx="0" cy="4.5" rx="2.4" ry="3.2" />
            {/* Arch / Ball indentation */}
            <path d="M-2.2,2 C-2.7,0.5 -2.6,-2 -1.4,-3.8 C-0.5,-5.2 1.2,-5.2 2.1,-3.6 C2.8,-2.2 2.5,0.8 1.8,2 Z" />
            {/* 5 Toes */}
            <circle cx="1.6" cy="-6.5" r="1.15" /> {/* Big toe */}
            <circle cx="0.1" cy="-6.8" r="0.85" /> {/* Second toe */}
            <circle cx="-1.1" cy="-6.3" r="0.75" /> {/* Middle toe */}
            <circle cx="-2.0" cy="-5.4" r="0.65" /> {/* Fourth toe */}
            <circle cx="-2.7" cy="-4.3" r="0.55" /> {/* Pinky toe */}
          </g>

          {/* Detailed Right Footprint Graphic */}
          <g id="right-footprint">
            {/* Heel indentation */}
            <ellipse cx="0" cy="4.5" rx="2.4" ry="3.2" />
            {/* Arch / Ball indentation */}
            <path d="M2.2,2 C2.7,0.5 2.6,-2 1.4,-3.8 C0.5,-5.2 -1.2,-5.2 -2.1,-3.6 C-2.8,-2.2 -2.5,0.8 -1.8,2 Z" />
            {/* 5 Toes */}
            <circle cx="-1.6" cy="-6.5" r="1.15" /> {/* Big toe */}
            <circle cx="-0.1" cy="-6.8" r="0.85" /> {/* Second toe */}
            <circle cx="1.1" cy="-6.3" r="0.75" /> {/* Middle toe */}
            <circle cx="2.0" cy="-5.4" r="0.65" /> {/* Fourth toe */}
            <circle cx="2.7" cy="-4.3" r="0.55" /> {/* Pinky toe */}
          </g>

          {/* Sand indentation shadow filter */}
          <filter id="sand-imprint" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0.4"
              dy="0.8"
              stdDeviation="0.4"
              floodColor={isDark ? '#000000' : '#6A370A'}
              floodOpacity="0.45"
            />
          </filter>
        </defs>

        {/* Trail Line connection (faint sand depression path) */}
        <path
          d="M 22 72 Q 60 58 112 32 T 180 16"
          fill="none"
          stroke={isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.08)'}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Render each footprint in the animated walking cycle */}
        {steps.map((step) => (
          <g
            key={step.id}
            transform={`translate(${step.x}, ${step.y}) rotate(${step.angle}) scale(1.15)`}
            className="footstep-impression"
            style={{
              animationDelay: step.delay,
            }}
          >
            {/* Sand displacement ring (appears momentarily as foot presses down) */}
            <circle
              cx="0"
              cy="0"
              r="7.5"
              className="sand-ripple"
              style={{
                animationDelay: step.delay,
                stroke: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(183, 118, 32, 0.3)',
              }}
              fill="none"
              strokeWidth="0.75"
            />

            {/* Deep Footprint In Sand */}
            <g
              filter="url(#sand-imprint)"
              fill={isDark ? '#C88D3A' : '#703D14'}
              opacity={isDark ? 0.95 : 0.85}
            >
              <use href={`#${step.side}-footprint`} />
            </g>
          </g>
        ))}
      </svg>

      {/* Floating Micro-Badge */}
      <div className="absolute top-2 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/75 dark:bg-[#2A1C12]/85 border border-[#5A2D0C]/15 dark:border-[#C88D3A]/30 backdrop-blur-xs text-[9px] font-bold tracking-tight text-[#5A2D0C] dark:text-[#F5C678]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Trail</span>
      </div>

      <style>{`
        @keyframes stepImprint {
          0% {
            opacity: 0;
            transform: scale(0.65) translateY(-4px);
          }
          6% {
            opacity: 1;
            transform: scale(1.18) translateY(0);
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          80% {
            opacity: 1;
            transform: scale(1);
          }
          92% {
            opacity: 0;
            transform: scale(0.98);
          }
          100% {
            opacity: 0;
            transform: scale(0.65);
          }
        }

        @keyframes rippleExpand {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }
          4% {
            opacity: 0.8;
            transform: scale(0.9);
          }
          12% {
            opacity: 0;
            transform: scale(1.6);
          }
          100% {
            opacity: 0;
            transform: scale(1.6);
          }
        }

        .footstep-impression {
          opacity: 0;
          animation: stepImprint 8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }

        .sand-ripple {
          opacity: 0;
          animation: rippleExpand 8s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .footstep-impression {
            opacity: 1 !important;
            animation: none !important;
          }
          .sand-ripple {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
