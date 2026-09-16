import React from 'react';

interface BallotBoxIllustrationProps {
  isDark?: boolean;
  className?: string;
}

export const BallotBoxIllustration: React.FC<BallotBoxIllustrationProps> = ({
  isDark = false,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-[104px] rounded-xl overflow-hidden border flex items-center justify-center select-none ${className}`}
      style={{
        backgroundColor: isDark ? '#1C130B' : '#FAF3E8',
        borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.16)',
        boxShadow: isDark
          ? 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
          : 'inset 0 2px 6px rgba(90, 45, 12, 0.05)',
      }}
      role="img"
      aria-label="Illustration of a ballot box with attestation paper for contextual peer vouches"
    >
      {/* Background Decorative Rings / Seal */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-35 dark:opacity-20"
        viewBox="0 0 240 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle
          cx="120"
          cy="50"
          r="42"
          fill="none"
          stroke={isDark ? '#C88D3A' : '#B77620'}
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <circle
          cx="120"
          cy="50"
          r="48"
          fill="none"
          stroke={isDark ? '#C88D3A' : '#5A2D0C'}
          strokeWidth="0.75"
        />
      </svg>

      {/* Handcrafted Isometric Ballot Box Illustration */}
      <svg
        className="w-auto h-[86px] max-w-full drop-shadow-md relative z-10"
        viewBox="0 0 160 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Wood Gradient - Top Lid */}
          <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#5A2D0C' : '#8A4816'} />
            <stop offset="100%" stopColor={isDark ? '#3E1C05' : '#68330D'} />
          </linearGradient>

          {/* Wood Gradient - Front Face */}
          <linearGradient id="frontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#462007' : '#73390E'} />
            <stop offset="100%" stopColor={isDark ? '#261002' : '#4E2407'} />
          </linearGradient>

          {/* Wood Gradient - Side Face */}
          <linearGradient id="sideGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#351603' : '#5D2B09'} />
            <stop offset="100%" stopColor={isDark ? '#200D02' : '#3F1A04'} />
          </linearGradient>

          {/* Brass Gold Accent */}
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBD38D" />
            <stop offset="50%" stopColor="#C88D3A" />
            <stop offset="100%" stopColor="#975A16" />
          </linearGradient>

          {/* Ballot Paper Gradient */}
          <linearGradient id="ballotPaperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="100%" stopColor="#F5E7CF" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="boxShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity={isDark ? '0.6' : '0.22'} />
          </filter>
        </defs>

        {/* Ambient Floor Shadow */}
        <ellipse cx="80" cy="98" rx="46" ry="7" fill={isDark ? '#080402' : '#421E06'} opacity={isDark ? '0.7' : '0.18'} />

        {/* 1. Ballot Paper (Sliding into slot) */}
        <g transform="translate(68, 6)">
          {/* Paper Body */}
          <path
            d="M 2 0 L 22 0 C 23.1 0 24 0.9 24 2 L 24 28 L 0 28 L 0 2 C 0 0.9 0.9 0 2 0 Z"
            fill="url(#ballotPaperGrad)"
            stroke="#D4A76A"
            strokeWidth="0.8"
          />
          {/* Lines on Vouch Ballot */}
          <line x1="4" y1="5" x2="20" y2="5" stroke="#B77620" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="9" x2="16" y2="9" stroke="#C49B75" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="4" y1="13" x2="18" y2="13" stroke="#C49B75" strokeWidth="0.9" strokeLinecap="round" />

          {/* Shield / Verified Stamp on ballot paper */}
          <circle cx="12" cy="20" r="4" fill="#EBF8F2" stroke="#16A34A" strokeWidth="0.8" />
          <path d="M 10 20 L 11.5 21.5 L 14.5 18.5" fill="none" stroke="#16A34A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* 2. Main Wooden Ballot Box Body */}
        <g filter="url(#boxShadow)">
          {/* Front Face */}
          <path
            d="M 44 48 L 116 48 L 116 92 C 116 94 114 96 112 96 L 48 96 C 46 96 44 94 44 92 Z"
            fill="url(#frontGrad)"
            stroke={isDark ? '#C88D3A' : '#4E2407'}
            strokeWidth="0.8"
          />

          {/* Wooden Planks Divider Lines (Front) */}
          <line x1="44" y1="64" x2="116" y2="64" stroke={isDark ? '#230E02' : '#3A1904'} strokeWidth="1" />
          <line x1="44" y1="80" x2="116" y2="80" stroke={isDark ? '#230E02' : '#3A1904'} strokeWidth="1" />

          {/* Box Top Lid Surface (slight perspective) */}
          <path
            d="M 38 48 L 48 34 L 112 34 L 122 48 Z"
            fill="url(#lidGrad)"
            stroke={isDark ? '#C88D3A' : '#5A2D0C'}
            strokeWidth="0.8"
          />

          {/* Brass Corner Brackets */}
          <path d="M 44 48 L 52 48 L 44 56 Z" fill="url(#brassGrad)" />
          <path d="M 116 48 L 108 48 L 116 56 Z" fill="url(#brassGrad)" />
          <path d="M 44 96 L 52 96 L 44 88 Z" fill="url(#brassGrad)" />
          <path d="M 116 96 L 108 96 L 116 88 Z" fill="url(#brassGrad)" />

          {/* Top Slot */}
          <path
            d="M 64 41 C 64 39.8 65 39 66 39 L 94 39 C 95 39 96 39.8 96 41 C 96 42.2 95 43 94 43 L 66 43 C 65 43 64 42.2 64 41 Z"
            fill="#140701"
            stroke="url(#brassGrad)"
            strokeWidth="1"
          />

          {/* Brass Emblem / Plaque on Front */}
          <rect
            x="60"
            y="69"
            width="40"
            height="18"
            rx="2.5"
            fill="url(#brassGrad)"
            stroke="#653805"
            strokeWidth="0.75"
          />
          {/* Rivets on Brass Plaque */}
          <circle cx="63" cy="72" r="0.75" fill="#3D1E03" />
          <circle cx="97" cy="72" r="0.75" fill="#3D1E03" />
          <circle cx="63" cy="84" r="0.75" fill="#3D1E03" />
          <circle cx="97" cy="84" r="0.75" fill="#3D1E03" />

          {/* Plaque Text / Symbol: Shield Check Icon */}
          <g transform="translate(73, 72.5) scale(0.65)">
            <path
              d="M 10 2 L 18 5 L 18 11 C 18 16 14.5 19.5 10 21 C 5.5 19.5 2 16 2 11 L 2 5 Z"
              fill="#5A2D0C"
            />
            <path
              d="M 6 11 L 9 14 L 14 8"
              fill="none"
              stroke="#FBD38D"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>

      {/* Floating Micro-Badge */}
      <div className="absolute top-2 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/75 dark:bg-[#2A1C12]/85 border border-[#5A2D0C]/15 dark:border-[#C88D3A]/30 backdrop-blur-xs text-[9px] font-bold tracking-tight text-[#5A2D0C] dark:text-[#F5C678]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Vouch Vault</span>
      </div>
    </div>
  );
};
