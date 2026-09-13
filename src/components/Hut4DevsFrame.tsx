import React from 'react';

export interface Hut4DevsFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  isDark?: boolean;
  variant?: 'card' | 'surface' | 'highlight' | 'subtle';
  accentColor?: string; // Optional internal semantic accent border or glow
  children: React.ReactNode;
}

/**
 * Hut4DevsFrame: Unified External Brand Frame Primitive
 *
 * Core Principle: "THIRD-PARTY / SEMANTIC COLOR INSIDE, HUT4DEVS BRAND FRAME OUTSIDE"
 * Enforces the brand palette:
 * - Warm ivory: #F7F1E7
 * - Soft cream: #FFF9EE
 * - Dark chocolate: #5A2D0C
 * - Caramel gold: #C88D3A
 * - Deep golden brown: #B77620
 * - Dark surface: #2F1707
 */
export const Hut4DevsFrame: React.FC<Hut4DevsFrameProps> = ({
  isDark = false,
  variant = 'card',
  accentColor,
  className = '',
  style = {},
  children,
  ...rest
}) => {
  // Base classes with rounded geometry and smooth theme transition
  const baseClasses = 'rounded-2xl transition-all duration-200';

  // Variant styling
  const variantStyles = {
    card: isDark
      ? 'bg-[rgba(23,21,19,0.55)] text-[#FFF9EE] border-2 border-[#C88D3A]/35 backdrop-blur-md shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(200,141,58,0.2)]'
      : 'bg-[rgba(255,253,248,0.65)] text-[#2B211B] border-2 border-[#5A2D0C]/25 backdrop-blur-md shadow-[0_8px_30px_-6px_rgba(90,45,12,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]',
    surface: isDark
      ? 'bg-[rgba(30,27,24,0.45)] text-[#FFF9EE] border border-[#C88D3A]/25 backdrop-blur-xs shadow-xs'
      : 'bg-[rgba(247,241,231,0.50)] text-[#2B211B] border border-[#5A2D0C]/18 backdrop-blur-xs shadow-xs',
    highlight: isDark
      ? 'bg-[rgba(42,34,28,0.60)] text-[#FFF9EE] border-2 border-[#C88D3A] backdrop-blur-md shadow-[0_10px_35px_-5px_rgba(200,141,58,0.25),inset_0_1px_0_rgba(226,171,93,0.3)]'
      : 'bg-[rgba(255,249,238,0.75)] text-[#2B211B] border-2 border-[#C88D3A] backdrop-blur-md shadow-[0_10px_35px_-5px_rgba(200,141,58,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]',
    subtle: isDark
      ? 'bg-[rgba(23,21,19,0.35)] text-[#FFF9EE] border border-[#C88D3A]/20 backdrop-blur-xs'
      : 'bg-[rgba(255,253,248,0.40)] text-[#2B211B] border border-[#5A2D0C]/15 backdrop-blur-xs',
  };

  const combinedStyles: React.CSSProperties = {
    ...(accentColor ? { borderLeft: `4px solid ${accentColor}` } : {}),
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantStyles[variant]} ${className}`}
      style={combinedStyles}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface BrandedSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  isDark?: boolean;
  elevation?: 1 | 2 | 3;
  children: React.ReactNode;
}

/**
 * BrandedSurface: Internal nested surface within Hut4Devs brand geometry
 */
export const BrandedSurface: React.FC<BrandedSurfaceProps> = ({
  isDark = false,
  elevation = 1,
  className = '',
  children,
  style = {},
  ...rest
}) => {
  const elevationStyles = {
    1: isDark
      ? 'bg-[rgba(30,27,24,0.45)] border border-[#C88D3A]/20 backdrop-blur-xs text-[#FFF9EE]'
      : 'bg-[rgba(247,241,231,0.50)] border border-[#5A2D0C]/15 backdrop-blur-xs text-[#2B211B]',
    2: isDark
      ? 'bg-[rgba(42,34,28,0.55)] border border-[#C88D3A]/30 backdrop-blur-xs text-[#FFF9EE]'
      : 'bg-[rgba(255,249,238,0.65)] border border-[#C88D3A]/25 backdrop-blur-xs text-[#2B211B]',
    3: isDark
      ? 'bg-[rgba(50,40,32,0.65)] border border-[#C88D3A]/45 backdrop-blur-xs text-[#FFF9EE]'
      : 'bg-[rgba(255,255,255,0.75)] border border-[#C88D3A]/35 backdrop-blur-xs text-[#2B211B]',
  };

  return (
    <div
      className={`rounded-xl p-4 transition-colors duration-150 ${elevationStyles[elevation]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface BrandedActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDark?: boolean;
  variant?: 'bmoni' | 'primary' | 'secondary' | 'accent' | 'gift' | 'loan' | 'contribution';
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * BrandedActionButton: 3D Raised Interaction Button
 *
 * Requirements:
 * - DEFAULT: 3D / raised appearance, clear tactile depth
 * - HOVER: slight upward lift (translateY(-2px)), subtle glow highlight
 * - ACTIVE: small press-down effect (translateY(1px)), reduced shadow
 */
export const BrandedActionButton: React.FC<BrandedActionButtonProps> = ({
  isDark = false,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  // 3D tactile button styling
  const variantStyles = {
    // BMONI button: BMONI own brand color inside Hut4Devs 3D raised elevation
    bmoni: isDark
      ? 'bg-[#2563EB] text-white border-b-4 border-[#1E3A8A] hover:bg-[#3B82F6] hover:border-[#1D4ED8] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#1D4ED8] text-white border-b-4 border-[#172554] hover:bg-[#2563EB] hover:border-[#1E3A8A] hover:shadow-[0_8px_25px_rgba(37,99,235,0.45)] active:border-b-1 active:translate-y-[2px]',
    // Primary caramel/gold
    primary: isDark
      ? 'bg-[#C88D3A] text-[#2F1707] border-b-4 border-[#8E560C] hover:bg-[#DDA250] hover:shadow-[0_6px_18px_rgba(200,141,58,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#5A2D0C] text-[#FFF9EE] border-b-4 border-[#351A07] hover:bg-[#432108] hover:shadow-[0_6px_18px_rgba(90,45,12,0.3)] active:border-b-1 active:translate-y-[2px]',
    // Secondary ivory / chocolate outline
    secondary: isDark
      ? 'bg-[#2F1707] text-[#E5D3BA] border-b-4 border-[#1A0C04] hover:bg-[#3E200C] hover:text-[#FFF9EE] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#FFF9EE] text-[#5A2D0C] border-b-4 border-[#D9C8B0] hover:bg-[#F2E8D8] active:border-b-1 active:translate-y-[2px]',
    // Accent semantic button
    accent: isDark
      ? 'bg-[#B77620] text-white border-b-4 border-[#7A4B0A] hover:bg-[#C88D3A] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#B77620] text-white border-b-4 border-[#8E560C] hover:bg-[#9E6316] active:border-b-1 active:translate-y-[2px]',
    // Peer Support: Gift
    gift: isDark
      ? 'bg-[#059669] text-white border-b-4 border-[#064E3B] hover:bg-[#10B981] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#047857] text-white border-b-4 border-[#064E3B] hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(4,120,87,0.3)] active:border-b-1 active:translate-y-[2px]',
    // Peer Support: Loan
    loan: isDark
      ? 'bg-[#2563EB] text-white border-b-4 border-[#1E3A8A] hover:bg-[#3B82F6] hover:shadow-[0_6px_20px_rgba(59,130,246,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#1D4ED8] text-white border-b-4 border-[#172554] hover:bg-[#2563EB] hover:shadow-[0_6px_20px_rgba(29,78,216,0.3)] active:border-b-1 active:translate-y-[2px]',
    // Peer Support: Contribution
    contribution: isDark
      ? 'bg-[#7C3AED] text-white border-b-4 border-[#4C1D95] hover:bg-[#8B5CF6] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#6D28D9] text-white border-b-4 border-[#4C1D95] hover:bg-[#7C3AED] hover:shadow-[0_6px_20px_rgba(109,40,217,0.3)] active:border-b-1 active:translate-y-[2px]',
  };

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer select-none ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed transform-none shadow-none'
          : 'hover:-translate-y-[2px] active:translate-y-[1px]'
      } ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
