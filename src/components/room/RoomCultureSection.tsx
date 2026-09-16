import React from 'react';
import { RoomCultureGuide } from '../../data/demoRoomStory';
import {
  Sparkles,
  Moon,
  Clock,
  CheckSquare,
  Zap,
  Heart,
  ShieldCheck,
  Coffee,
} from 'lucide-react';

interface RoomCultureSectionProps {
  cultureGuide: RoomCultureGuide;
  isDark?: boolean;
}

export const RoomCultureSection: React.FC<RoomCultureSectionProps> = ({
  cultureGuide,
  isDark = false,
}) => {
  return (
    <div className="space-y-6" id="room-culture-section">
      {/* Intro Banner */}
      <div
        className="p-5 sm:p-6 rounded-2xl border-2 border-b-4 transition-all shadow-xs backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.75)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl border-2 border-b-3 flex items-center justify-center shrink-0 shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.7)' : 'rgba(247, 241, 231, 0.9)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.25)',
            }}
          >
            <Sparkles className="w-5 h-5 text-[#B77620] dark:text-[#C88D3A]" />
          </div>
          <div>
            <h3
              className="font-serif font-bold text-base sm:text-lg"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Room Culture &amp; Shared Life &bull; {cultureGuide.roomNumber}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              How we share this co-living space &bull; Agreed living rhythms, care habits, and study protocols
            </p>
          </div>
        </div>

        <span
          className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-semibold border self-start sm:self-auto"
          style={{
            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
            color: isDark ? '#C88D3A' : '#B77620',
          }}
        >
          Shared Stewardship
        </span>
      </div>

      {/* Community Pledge */}
      <div
        className="p-5 rounded-2xl border-2 border-b-3 shadow-xs"
        style={{
          backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
          <h4
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: isDark ? '#C88D3A' : '#B77620' }}
          >
            Room 304 Living Pledge
          </h4>
        </div>
        <p
          className="text-sm font-medium leading-relaxed italic"
          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
        >
          &ldquo;{cultureGuide.communityPledge}&rdquo;
        </p>
      </div>

      {/* Grid of Culture Cards: Quiet Hours, Cleaning Rhythms, Power Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Quiet Hours & Rest */}
        <div
          className="p-5 rounded-2xl border-2 border-b-4 shadow-xs flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4
                className="font-bold text-sm"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Quiet Hours &amp; Rest
              </h4>
            </div>

            <div className="space-y-2 mb-3">
              <div
                className="p-2.5 rounded-xl border text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.5)' : 'rgba(247, 241, 231, 0.6)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                }}
              >
                <div className="font-semibold text-[11px] text-purple-700 dark:text-purple-300">
                  Weekdays (Mon – Fri)
                </div>
                <div className="font-mono font-bold text-xs" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  {cultureGuide.quietHours.weekdays}
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl border text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.5)' : 'rgba(247, 241, 231, 0.6)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                }}
              >
                <div className="font-semibold text-[11px] text-purple-700 dark:text-purple-300">
                  Weekends (Sat – Sun)
                </div>
                <div className="font-mono font-bold text-xs" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  {cultureGuide.quietHours.weekends}
                </div>
              </div>
            </div>

            <p
              className="text-xs leading-relaxed"
              style={{ color: isDark ? '#E5D6C5' : '#704728' }}
            >
              {cultureGuide.quietHours.guideline}
            </p>
          </div>

          <div
            className="pt-3 mt-4 border-t text-[10px] font-mono"
            style={{
              borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)',
              color: isDark ? '#A98F77' : '#8A5D3B',
            }}
          >
            Dimmer Switch &bull; Focus Protocol
          </div>
        </div>

        {/* Card 2: Cleaning & Hygiene Rhythms */}
        <div
          className="p-5 rounded-2xl border-2 border-b-4 shadow-xs flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4
                className="font-bold text-sm"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Cleaning &amp; Chore Roster
              </h4>
            </div>

            <div
              className="p-2.5 rounded-xl border text-xs mb-3"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.5)' : 'rgba(247, 241, 231, 0.6)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
              }}
            >
              <div className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-300">
                Weekly Schedule
              </div>
              <div className="font-bold text-xs" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                {cultureGuide.cleaningRhythm.schedule}
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {cultureGuide.cleaningRhythm.areas.map((area, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs"
                  style={{ color: isDark ? '#E5D6C5' : '#5A2D0C' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>

            <p
              className="text-xs italic"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              {cultureGuide.cleaningRhythm.notes}
            </p>
          </div>

          <div
            className="pt-3 mt-4 border-t text-[10px] font-mono"
            style={{
              borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)',
              color: isDark ? '#A98F77' : '#8A5D3B',
            }}
          >
            Rotating Responsibility
          </div>
        </div>

        {/* Card 3: Power & Inverter Usage */}
        <div
          className="p-5 rounded-2xl border-2 border-b-4 shadow-xs flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4
                className="font-bold text-sm"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Inverter Power Protocol
              </h4>
            </div>

            <div
              className="p-2.5 rounded-xl border text-xs mb-3"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.5)' : 'rgba(247, 241, 231, 0.6)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
              }}
            >
              <div className="font-semibold text-[11px] text-amber-700 dark:text-amber-300">
                Protected Sub-Line
              </div>
              <div className="font-bold text-xs" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                {cultureGuide.powerAndInverterProtocol.summary}
              </div>
            </div>

            <p
              className="text-xs leading-relaxed"
              style={{ color: isDark ? '#E5D6C5' : '#704728' }}
            >
              {cultureGuide.powerAndInverterProtocol.guideline}
            </p>
          </div>

          <div
            className="pt-3 mt-4 border-t text-[10px] font-mono"
            style={{
              borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)',
              color: isDark ? '#A98F77' : '#8A5D3B',
            }}
          >
            Safe Electrical Loading
          </div>
        </div>
      </div>

      {/* Shared Traditions Section */}
      <div
        className="p-5 sm:p-6 rounded-2xl border-2 border-b-4 shadow-xs"
        style={{
          backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Coffee className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
          <h4
            className="font-bold text-sm"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            Room 304 Living Traditions
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {cultureGuide.sharedTraditions.map((tradition, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border flex flex-col justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.5)' : 'rgba(247, 241, 231, 0.6)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h5
                    className="font-bold text-xs"
                    style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                  >
                    {tradition.title}
                  </h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold border bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25 shrink-0">
                    {tradition.cadence}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                >
                  {tradition.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
