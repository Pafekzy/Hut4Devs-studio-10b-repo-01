import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LANDING_STORY_SLIDES, LandingStorySlide } from '../data/landingStorySlides';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  Users,
  Building2,
  FileCheck2,
  MessageSquare,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

interface LandingStoryCarouselProps {
  isDark: boolean;
  slides?: LandingStorySlide[];
  onSlideChange?: (index: number) => void;
}

// Map each story focus to an evocative Lucide icon
const STORY_ICONS = [
  Users, // Slide 1: Mutual Support
  Sparkles, // Slide 2: Shared Contributions
  FileCheck2, // Slide 3: Digital Registration & E-Signature
  MessageSquare, // Slide 4: Communication & Accountability
  ShieldCheck, // Slide 5: Financial Accountability
  HeartHandshake, // Slide 6: Welfare & Mediation
];

export const LandingStoryCarousel: React.FC<LandingStoryCarouselProps> = ({
  isDark,
  slides = LANDING_STORY_SLIDES,
  onSlideChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setIsPlaying(false);
      }
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) setIsPlaying(false);
      };
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex] || slides[0];
  const StoryIcon = STORY_ICONS[currentIndex % STORY_ICONS.length] || Users;

  const goToSlide = useCallback(
    (index: number) => {
      const targetIndex = (index + totalSlides) % totalSlides;
      setCurrentIndex(targetIndex);
      if (onSlideChange) onSlideChange(targetIndex);
    },
    [totalSlides, onSlideChange]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Autoplay timer: 7 seconds per slide, paused when hovered or focused
  useEffect(() => {
    if (!isPlaying || isHovered || isFocused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, isFocused, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(totalSlides - 1);
    }
  };

  return (
    <section
      id="landing-story-carousel"
      aria-roledescription="carousel"
      aria-label="Hut4Devs Living &amp; Community Coordination Stories"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="w-full rounded-2xl sm:rounded-3xl border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] focus-visible:ring-offset-2 overflow-hidden shadow-xs"
      style={{
        backgroundColor: isDark ? '#341905' : '#FFF9EE',
        borderColor: isDark ? '#4B2710' : '#E7D6C1',
      }}
    >
      {/* 1. CINEMATIC 16:9 IMAGE / STORY FRAME */}
      <div
        className="relative w-full aspect-[16/9] overflow-hidden border-b transition-colors duration-200 flex items-center justify-center select-none"
        style={{
          borderColor: isDark ? '#4B2710' : '#EAE0D0',
          backgroundColor: isDark ? '#261103' : '#F7F1E7',
        }}
        role="group"
        aria-roledescription="slide"
        aria-label={`Story ${currentSlide.slideNumber} of ${totalSlides}: ${currentSlide.focus}`}
      >
        {/* If imageSrc is available, render it with subtle top story counter badge; otherwise render the tasteful story stage placeholder */}
        {currentSlide.imageSrc ? (
          <div className="relative w-full h-full">
            <img
              src={currentSlide.imageSrc}
              alt={currentSlide.imageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border shadow-xs backdrop-blur-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(47, 23, 7, 0.85)' : 'rgba(255, 249, 238, 0.92)',
                  borderColor: isDark ? '#623416' : '#C88D3A40',
                  color: isDark ? '#C88D3A' : '#5A2D0C',
                }}
              >
                <StoryIcon className="w-3.5 h-3.5 text-[#C88D3A]" aria-hidden="true" />
                <span>Story {currentSlide.slideNumber} of {totalSlides}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 text-center relative overflow-hidden">
            {/* Background watermark badge */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-[0.06] dark:opacity-[0.08] pointer-events-none"
              aria-hidden="true"
            >
              <span className="text-8xl sm:text-9xl">🛖</span>
            </div>

            {/* Top Indicator Badge */}
            <div className="w-full flex items-center justify-between z-10">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(47, 23, 7, 0.85)' : 'rgba(255, 249, 238, 0.9)',
                  borderColor: isDark ? '#623416' : '#C88D3A40',
                  color: isDark ? '#C88D3A' : '#5A2D0C',
                }}
              >
                <StoryIcon className="w-3.5 h-3.5 text-[#C88D3A]" aria-hidden="true" />
                <span>Story {currentSlide.slideNumber} of {totalSlides}</span>
              </span>

              <span
                className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md"
                style={{
                  color: isDark ? '#A67B54' : '#8A5D3B',
                  backgroundColor: isDark ? 'rgba(47, 23, 7, 0.4)' : 'rgba(90, 45, 12, 0.05)',
                }}
              >
                16:9 Cinematic Frame
              </span>
            </div>

            {/* Center Story Staging Note */}
            <div className="z-10 max-w-md px-2 py-3 my-auto">
              <div
                className="inline-block p-2.5 sm:p-3.5 rounded-xl border backdrop-blur-xs shadow-xs transition-colors duration-200"
                style={{
                  backgroundColor: isDark ? 'rgba(47, 23, 7, 0.75)' : 'rgba(255, 253, 248, 0.85)',
                  borderColor: isDark ? '#4B2710' : '#E7D6C1',
                }}
              >
                <p
                  className="text-[11px] sm:text-xs font-medium uppercase tracking-wider mb-1"
                  style={{ color: '#C88D3A' }}
                >
                  {currentSlide.focus}
                </p>
                <p
                  className="text-xs sm:text-sm font-serif font-bold leading-snug"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  "{currentSlide.title}"
                </p>
                <p
                  className="text-[11px] sm:text-xs mt-1.5 opacity-75 leading-relaxed line-clamp-2"
                  style={{ color: isDark ? '#F5E6D3' : '#4A2710' }}
                >
                  {currentSlide.plannedSceneDescription}
                </p>
              </div>
            </div>

            {/* Bottom Staging Footer */}
            <div className="w-full flex items-center justify-center z-10">
              <span
                className="text-[10px] font-mono tracking-wider opacity-65"
                style={{ color: isDark ? '#C88D3A' : '#8A5D3B' }}
              >
                Photographic scene visual staged for Checkpoint 02
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. TEXT & MESSAGING AREA (STABLE MIN-HEIGHT TO PREVENT JUMPS) */}
      <div className="p-4 sm:p-6 flex flex-col justify-between">
        <div className="min-h-[96px] sm:min-h-[88px] flex flex-col justify-center">
          {/* Focus Eyebrow */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[11px] font-bold font-mono uppercase tracking-wider"
              style={{ color: '#C88D3A' }}
            >
              {currentSlide.focus}
            </span>
          </div>

          {/* Story Title */}
          <h3
            className="font-serif text-lg sm:text-xl font-bold tracking-tight mb-1 transition-colors duration-150"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            {currentSlide.title}
          </h3>

          {/* Story Supporting Message */}
          <p
            className="text-xs sm:text-sm leading-relaxed transition-colors duration-150"
            style={{ color: isDark ? '#F5E6D3' : '#4A2710' }}
          >
            {currentSlide.message}
          </p>
        </div>

        {/* 3. CAROUSEL CONTROLS BAR */}
        <div
          className="mt-4 pt-3.5 border-t flex items-center justify-between gap-2"
          style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}
        >
          {/* Dots Indicator */}
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Story slides selection"
          >
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  id={`carousel-dot-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to story ${slide.slideNumber}: ${slide.title}`}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                    isActive
                      ? 'w-6 bg-[#C88D3A]'
                      : isDark
                      ? 'w-2 bg-[#4B2710] hover:bg-[#623416]'
                      : 'w-2 bg-[#E7D6C1] hover:bg-[#C88D3A]/60'
                  }`}
                />
              );
            })}
          </div>

          {/* Navigation Buttons: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-1.5">
            {/* Play/Pause Toggle */}
            <button
              id="carousel-play-pause-btn"
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause story slideshow' : 'Play story slideshow'}
              className="p-1.5 rounded-lg text-xs transition-colors cursor-pointer border flex items-center justify-center"
              style={{
                backgroundColor: isDark ? '#261103' : '#FFFDF8',
                borderColor: isDark ? '#4B2710' : '#E7D6C1',
                color: isDark ? '#C88D3A' : '#5A2D0C',
              }}
              title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>

            {/* Previous Button */}
            <button
              id="carousel-prev-btn"
              type="button"
              onClick={prevSlide}
              aria-label="Previous story"
              className="p-1.5 rounded-lg text-xs transition-colors cursor-pointer border flex items-center justify-center hover:bg-[#C88D3A]/10 active:scale-95"
              style={{
                backgroundColor: isDark ? '#261103' : '#FFFDF8',
                borderColor: isDark ? '#4B2710' : '#E7D6C1',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Next Button */}
            <button
              id="carousel-next-btn"
              type="button"
              onClick={nextSlide}
              aria-label="Next story"
              className="p-1.5 rounded-lg text-xs transition-colors cursor-pointer border flex items-center justify-center hover:bg-[#C88D3A]/10 active:scale-95"
              style={{
                backgroundColor: isDark ? '#261103' : '#FFFDF8',
                borderColor: isDark ? '#4B2710' : '#E7D6C1',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
