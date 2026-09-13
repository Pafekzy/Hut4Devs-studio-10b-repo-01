import React from 'react';
import { Hut4DevsLogo } from './Hut4DevsLogo';
import { ThemeToggle } from './ThemeToggle';
import { LandingStoryCarousel } from './LandingStoryCarousel';
import { ArrowRight, Shield } from 'lucide-react';

interface LandingViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onEnter: () => void;
  onOpenRegistration?: () => void;
  onOpenDevAuth?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  isDark,
  onToggleTheme,
  onEnter,
  onOpenRegistration,
  onOpenDevAuth,
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
      }`}
    >
      {/* Sticky Top Navigation Bar */}
      <header
        className="sticky top-0 z-30 w-full border-b transition-colors duration-200"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          backgroundColor: isDark ? 'rgba(47, 23, 7, 0.88)' : 'rgba(247, 241, 231, 0.88)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
          <div className="flex items-center gap-3">
            {onOpenDevAuth && (
              <button
                type="button"
                id="landing-open-dev-auth-btn"
                onClick={onOpenDevAuth}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#C88D3A]/40 text-[#5A2D0C] bg-[#FFF9EE] hover:bg-[#F7F1E7] transition-colors cursor-pointer shadow-xs"
              >
                Switch Identity
              </button>
            )}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Public Hero / Storytelling Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl mx-auto w-full">
          {/* Section A: Brand Identity & Canonical Tagline (Top on mobile, Left Top on desktop) */}
          <div className="lg:col-span-5 lg:row-start-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Selected Hut4Devs Logo & Vertical Wordmark */}
            <div className="mb-6 sm:mb-8">
              <Hut4DevsLogo
                isDark={isDark}
                size="lg"
                showWordmark={true}
                wordmarkOrientation="vertical"
              />
            </div>

            {/* Canonical Tagline */}
            <h1
              className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-snug tracking-tight mb-3 sm:mb-4 transition-colors duration-200"
              style={{
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              Turning everyday collaboration into trails of trust built by us and for us-all.
            </h1>

            {/* Supporting Philosophy */}
            <p
              className="text-xs sm:text-sm leading-relaxed max-w-lg mb-2 transition-colors duration-200 opacity-85"
              style={{
                color: isDark ? '#F5E6D3' : '#4A2710',
              }}
            >
              Accommodation is where we begin — community coordination, verified responsibilities,
              and peer solidarity are where trust is built.
            </p>
          </div>

          {/* Section B: Visual Story Carousel (Middle on mobile, Right Column on desktop) */}
          <div className="lg:col-span-7 lg:row-span-2 lg:col-start-6 lg:row-start-1 w-full flex items-center justify-center">
            <LandingStoryCarousel isDark={isDark} />
          </div>

          {/* Section C: Primary Action CTAs (Bottom on mobile, Left Bottom on desktop) */}
          <div className="lg:col-span-5 lg:row-start-2 flex flex-col items-center lg:items-start w-full">
            <div className="flex flex-col items-center lg:items-start w-full max-w-sm gap-3 pt-2 lg:pt-4">
              {/* Primary: Enter Hut4Devs */}
              <button
                type="button"
                id="enter-hut4devs-btn"
                onClick={onEnter}
                className={`group w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl text-base font-medium shadow-sm transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#2F1707] hover:bg-[#DDA250] active:bg-[#B77620] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#2F1707]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] active:bg-[#341905] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#F7F1E7]'
                }`}
              >
                <span>Enter Hut4Devs</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>

              {/* Secondary: Accommodation Membership Onboarding */}
              {onOpenRegistration && (
                <button
                  type="button"
                  id="landing-open-registration-btn"
                  onClick={onOpenRegistration}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/70 border border-[#C88D3A]/30 text-[#5A2D0C] hover:bg-[#FFF9EE] transition-colors cursor-pointer shadow-2xs"
                >
                  <span className="text-sm" aria-hidden="true">🛖</span>
                  <span>Submit Accommodation Membership Request</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Public Landing Footer */}
      <footer
        className="w-full py-6 text-center text-xs tracking-wider uppercase border-t transition-colors duration-200"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          color: isDark ? '#A67B54' : '#8A5D3B',
        }}
      >
        <p>Hut4Devs &bull; Canonical Application Foundation &bull; Build. Pay. Support. Thrive.</p>
      </footer>
    </div>
  );
};
