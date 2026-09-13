import React from 'react';

export interface Hut4DevsLogoProps {
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  wordmarkOrientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Hut4DevsLogo: React.FC<Hut4DevsLogoProps> = ({
  isDark = false,
  size = 'md',
  showWordmark = true,
  wordmarkOrientation = 'horizontal',
  className = '',
}) => {
  const isVertical = wordmarkOrientation === 'vertical';

  const markSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-[17px] font-semibold',
    md: 'text-[22px] font-bold',
    lg: 'text-3xl sm:text-4xl font-bold',
  };

  const verticalOffsets = {
    sm: 'translate-x-[22px]',
    md: 'translate-x-[30px]',
    lg: 'translate-x-[48px]',
  };

  const textColor = isDark ? '#FFF9EE' : '#5A2D0C';
  const gold = isDark ? '#D49A47' : '#B77620';

  return (
    <div
      role="img"
      aria-label="Hut4Devs"
      className={`
        inline-flex
        ${isVertical ? 'flex-col justify-center text-center gap-2.5' : 'flex-row items-center gap-2.5'}
        select-none
        ${className}
      `}
    >
      {/* =====================================================
          HUT4DEVS MARK
          
          Keycap  = Developers
          Roof    = Hut / Community
          "4"     = Hut4Devs
         ===================================================== */}
      <div
        className={`
          ${markSizes[size]}
          shrink-0
          flex items-center justify-center
          rounded-[28%]
          border border-[#C88D3A]/70
          bg-[#5A2D0C]
          shadow-[inset_0_-2px_0_rgba(47,23,7,0.65),0_3px_10px_rgba(90,45,12,0.16)]
          ${isVertical ? verticalOffsets[size] : ''}
        `}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          className={iconSizes[size]}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          {/* Hut roof */}
          <path
            d="M5.5 13.1L16 5.4L26.5 13.1"
            stroke="#C88D3A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hut structure */}
          <path
            d="M8.2 12V25H23.8V12"
            stroke="#FFF9EE"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Signature 4 */}
          <path
            d="M18.2 23V11.8L11.9 19H21.2"
            stroke="#C88D3A"
            strokeWidth="2.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Open doorway / trail */}
          <path
            d="M13.2 25V22.4"
            stroke="#FFF9EE"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* =====================================================
          WORDMARK
         ===================================================== */}
      {showWordmark && (
        <span
          className={`
            leading-none
            tracking-[-0.035em]
            ${textSizes[size]}
          `}
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            color: textColor,
          }}
        >
          Hut
          <span
            style={{
              color: gold,
              fontWeight: 800,
            }}
          >
            4
          </span>
          Devs
        </span>
      )}
    </div>
  );
};

export default Hut4DevsLogo;