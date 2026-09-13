import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDark,
  onToggle,
  className = '',
}) => {
  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-full text-sm font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
        isDark
          ? 'bg-[#3E200C] text-[#FFF9EE] border border-[#623416] hover:bg-[#4B2710]'
          : 'bg-[#FFF9EE] text-[#5A2D0C] border border-[#E7D6C1] hover:bg-[#F2E8D8]'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-[#C88D3A] shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline text-xs tracking-wide">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-[#5A2D0C] shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline text-xs tracking-wide">Dark Mode</span>
        </>
      )}
    </button>
  );
};
