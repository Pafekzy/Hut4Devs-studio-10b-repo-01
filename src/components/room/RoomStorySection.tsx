import React, { useState } from 'react';
import { RoomStoryFact, RoomStoryCategory } from '../../data/demoRoomStory';
import {
  BookOpen,
  Calendar,
  Sparkles,
  Wrench,
  Users,
  Compass,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface RoomStorySectionProps {
  storyFacts: RoomStoryFact[];
  roomNumber: string;
  isDark?: boolean;
}

const CATEGORY_META: Record<
  RoomStoryCategory,
  { label: string; icon: React.ReactNode; colorLight: string; colorDark: string }
> = {
  FOUNDING: {
    label: 'Founding & Inhabitation',
    icon: <Compass className="w-3.5 h-3.5" />,
    colorLight: 'text-amber-800 bg-amber-100/70 border-amber-300',
    colorDark: 'text-amber-200 bg-amber-950/70 border-amber-700',
  },
  PEOPLE: {
    label: 'People & Stewardship',
    icon: <Users className="w-3.5 h-3.5" />,
    colorLight: 'text-blue-800 bg-blue-100/70 border-blue-300',
    colorDark: 'text-blue-200 bg-blue-950/70 border-blue-700',
  },
  SHARED_CONTRIBUTIONS: {
    label: 'Shared Contributions',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    colorLight: 'text-purple-800 bg-purple-100/70 border-purple-300',
    colorDark: 'text-purple-200 bg-purple-950/70 border-purple-700',
  },
  CARE_REPAIR: {
    label: 'Care & Maintenance',
    icon: <Wrench className="w-3.5 h-3.5" />,
    colorLight: 'text-emerald-800 bg-emerald-100/70 border-emerald-300',
    colorDark: 'text-emerald-200 bg-emerald-950/70 border-emerald-700',
  },
  COMMUNITY_MOMENTS: {
    label: 'Community Moments',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    colorLight: 'text-rose-800 bg-rose-100/70 border-rose-300',
    colorDark: 'text-rose-200 bg-rose-950/70 border-rose-700',
  },
  ROOM_EVOLUTION: {
    label: 'Room Evolution',
    icon: <Layers className="w-3.5 h-3.5" />,
    colorLight: 'text-orange-800 bg-orange-100/70 border-orange-300',
    colorDark: 'text-orange-200 bg-orange-950/70 border-orange-700',
  },
};

export const RoomStorySection: React.FC<RoomStorySectionProps> = ({
  storyFacts = [],
  roomNumber,
  isDark = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RoomStoryCategory | 'ALL'>('ALL');

  const safeFacts = storyFacts || [];
  const filteredFacts =
    selectedCategory === 'ALL'
      ? safeFacts
      : safeFacts.filter((f) => f.category === selectedCategory);

  return (
    <div className="space-y-6" id="room-story-section">
      {/* Intro Banner */}
      <div
        className="h4d-card-static p-5 sm:p-6 rounded-2xl border-2 border-b-4 shadow-xs backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
            <BookOpen className="w-5 h-5 text-[#B77620] dark:text-[#C88D3A]" />
          </div>
          <div>
            <h3
              className="font-serif font-bold text-base sm:text-lg"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Our Room Story &bull; {roomNumber}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              Documented milestones, care history, and communal living memory across fellowship cohorts
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
          Community Memory
        </span>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 pb-1" aria-label="Filter story facts by category">
        <button
          type="button"
          id="filter-category-all"
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:translate-y-[1px] ${
            selectedCategory === 'ALL'
              ? isDark
                ? 'bg-[#C88D3A] text-[#241104] border-[#915B15] shadow-xs'
                : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
              : isDark
              ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)] hover:border-[rgba(200,141,58,0.4)]'
              : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)] hover:border-[rgba(90,45,12,0.3)]'
          }`}
        >
          <span>All Milestones ({safeFacts.length})</span>
        </button>

        {(Object.keys(CATEGORY_META) as RoomStoryCategory[]).map((catKey) => {
          const meta = CATEGORY_META[catKey];
          const count = safeFacts.filter((f) => f.category === catKey).length;
          const isSelected = selectedCategory === catKey;

          return (
            <button
              key={catKey}
              type="button"
              id={`filter-category-${catKey.toLowerCase()}`}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:translate-y-[1px] ${
                isSelected
                  ? isDark
                    ? 'bg-[#C88D3A] text-[#241104] border-[#915B15] shadow-xs'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
                  : isDark
                  ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)] hover:border-[rgba(200,141,58,0.4)]'
                  : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)] hover:border-[rgba(90,45,12,0.3)]'
              }`}
            >
              {meta.icon}
              <span>{meta.label}</span>
              {count > 0 && <span className="opacity-75 font-mono text-[10px]">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Story Timeline Cards */}
      <div className="space-y-4">
        {filteredFacts.length === 0 ? (
          <div
            className="p-8 rounded-2xl border-2 border-dashed text-center"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.4)' : 'rgba(255, 253, 248, 0.6)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              color: isDark ? '#D9C4AC' : '#704728',
            }}
          >
            <p className="text-sm font-medium">No recorded facts in this category yet.</p>
          </div>
        ) : (
          filteredFacts.map((fact) => {
            const meta = CATEGORY_META[fact.category];

            return (
              <div
                key={fact.id}
                id={`story-fact-${fact.id}`}
                className="h4d-card-static p-5 sm:p-6 rounded-2xl border-2 border-b-4 shadow-xs flex flex-col justify-between"
                style={{
                  backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
                }}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isDark ? meta.colorDark : meta.colorLight
                        }`}
                      >
                        {meta.icon}
                        <span>{meta.label}</span>
                      </span>

                      {fact.badgeLabel && (
                        <span
                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.8)',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
                            color: isDark ? '#C88D3A' : '#B77620',
                          }}
                        >
                          {fact.badgeLabel}
                        </span>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1.5 text-xs font-mono font-semibold"
                      style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{fact.dateOrPeriod}</span>
                    </div>
                  </div>

                  <h4
                    className="font-serif font-bold text-base sm:text-lg mb-1.5"
                    style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                  >
                    {fact.title}
                  </h4>

                  <p
                    className="text-xs sm:text-sm leading-relaxed mb-2"
                    style={{ color: isDark ? '#E5D6C5' : '#5A2D0C' }}
                  >
                    {fact.summary}
                  </p>

                  {fact.details && (
                    <p
                      className="text-xs leading-relaxed p-3 rounded-xl border"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : 'rgba(247, 241, 231, 0.5)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                        color: isDark ? '#D9C4AC' : '#704728',
                      }}
                    >
                      {fact.details}
                    </p>
                  )}
                </div>

                {fact.attributedTo && (
                  <div
                    className="pt-3 mt-4 border-t flex items-center justify-between text-[11px]"
                    style={{
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)',
                      color: isDark ? '#A98F77' : '#8A5D3B',
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Attributed to: <strong className="font-semibold">{fact.attributedTo}</strong></span>
                    </span>

                    <span className="font-mono text-[10px]">Verified Event</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
