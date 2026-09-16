import React, { useState } from 'react';
import { RoommatePublicProfile } from '../../data/demoRoomStory';
import {
  Users,
  Award,
  Sparkles,
  Calendar,
  X,
  Code2,
  Heart,
  Shield,
  BadgeCheck,
} from 'lucide-react';

interface RoommateCardsProps {
  roommates: RoommatePublicProfile[];
  isDark?: boolean;
}

export const RoommateCards: React.FC<RoommateCardsProps> = ({
  roommates,
  isDark = false,
}) => {
  const [selectedRoommate, setSelectedRoommate] = useState<RoommatePublicProfile | null>(null);

  return (
    <div className="space-y-6" id="roommates-section">
      {/* Intro banner */}
      <div
        className="h4d-card-static p-4 sm:p-5 rounded-2xl border-2 border-b-4 shadow-xs backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.75)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl border-2 border-b-3 flex items-center justify-center shrink-0 shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.7)' : 'rgba(247, 241, 231, 0.9)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.25)',
            }}
          >
            <Users className="w-5 h-5 text-[#B77620] dark:text-[#C88D3A]" />
          </div>
          <div>
            <h3
              className="font-serif font-bold text-sm sm:text-base"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Current Roommates
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              Public community profiles &bull; Respecting privacy boundaries &bull; {roommates.length} active residents
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
          Co-living Trust
        </span>
      </div>

      {/* Roommates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roommates.map((mate) => {
          const isCaptain = mate.roomRole === 'Room Captain';

          return (
            <div
              key={mate.memberId}
              id={`roommate-card-${mate.memberId}`}
              onClick={() => setSelectedRoommate(mate)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedRoommate(mate);
                }
              }}
              className="h4d-card-interactive group p-5 rounded-2xl border-2 border-b-4 flex flex-col justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
              }}
            >
              <div>
                {/* Header: Avatar, Name, Role */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center text-sm shadow-xs ${mate.avatarBgColor} border-2`}
                      style={{
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.25)',
                      }}
                    >
                      {mate.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className="font-bold text-sm leading-tight"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {mate.displayName}
                        </h4>
                        {mate.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                            You
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs font-medium mt-0.5"
                        style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                      >
                        {mate.bedLabel}
                      </p>
                    </div>
                  </div>

                  {isCaptain ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 shrink-0">
                      <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Captain
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 shrink-0">
                      <BadgeCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Fellow
                    </span>
                  )}
                </div>

                {/* Track & Cohort */}
                <div className="mb-3">
                  <div
                    className="text-xs font-semibold"
                    style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                  >
                    {mate.track}
                  </div>
                  <div
                    className="text-[11px] font-medium"
                    style={{ color: isDark ? '#D9C4AC' : '#8A5D3B' }}
                  >
                    {mate.cohort}
                  </div>
                </div>

                {/* Short Bio */}
                <p
                  className="text-xs leading-relaxed line-clamp-3 mb-4"
                  style={{ color: isDark ? '#E5D6C5' : '#5A2D0C' }}
                >
                  &ldquo;{mate.bio}&rdquo;
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mate.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-md font-medium border"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.8)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
                        color: isDark ? '#D9C4AC' : '#704728',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {mate.skills.length > 3 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium border"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : 'rgba(247, 241, 231, 0.5)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.1)',
                        color: isDark ? '#C88D3A' : '#B77620',
                      }}
                    >
                      +{mate.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer: Safe Birthday & View Prompt */}
              <div
                className="pt-3 border-t flex items-center justify-between text-[11px]"
                style={{
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)',
                }}
              >
                {mate.publicBirthday ? (
                  <span
                    className="inline-flex items-center gap-1 font-medium"
                    style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#B77620] dark:text-[#C88D3A]" />
                    <span>Birthday: {mate.publicBirthday}</span>
                  </span>
                ) : (
                  <span
                    className="italic text-[10px]"
                    style={{ color: isDark ? '#A98F77' : '#8A5D3B' }}
                  >
                    Community member
                  </span>
                )}

                <span
                  className="font-bold text-[10px] underline underline-offset-2 group-hover:text-[#B77620] dark:group-hover:text-[#C88D3A] transition-colors"
                  style={{ color: isDark ? '#C88D3A' : '#5A2D0C' }}
                >
                  View Profile &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Public Roommate Profile Modal */}
      {selectedRoommate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="roommate-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedRoommate(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border-2 border-b-4 shadow-xl p-6 sm:p-7 transition-all backdrop-blur-md"
            style={{
              backgroundColor: isDark ? '#241206' : '#FFFDF8',
              borderColor: isDark ? '#C88D3A' : '#5A2D0C',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b-2"
              style={{
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl font-bold flex items-center justify-center text-lg shadow-xs ${selectedRoommate.avatarBgColor} border-2`}
                  style={{
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  {selectedRoommate.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      id="roommate-dialog-title"
                      className="font-serif font-bold text-lg"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      {selectedRoommate.displayName}
                    </h3>
                    {selectedRoommate.isCurrentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        You
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                  >
                    {selectedRoommate.track} &bull; {selectedRoommate.bedLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="close-roommate-modal-btn"
                onClick={() => setSelectedRoommate(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg border transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                style={{
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                  color: isDark ? '#FFF9EE' : '#5A2D0C',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4">
              {/* Program & Role Context */}
              <div
                className="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                }}
              >
                <div>
                  <span className="font-bold uppercase text-[10px] tracking-wider text-[#B77620] dark:text-[#C88D3A] block">
                    Program &amp; Residency
                  </span>
                  <span className="font-medium" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    {selectedRoommate.cohort}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold uppercase text-[10px] tracking-wider text-[#B77620] dark:text-[#C88D3A] block">
                    Room Capacity
                  </span>
                  <span className="font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    {selectedRoommate.roomRole || 'Resident Fellow'}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <span
                  className="font-bold uppercase text-[10px] tracking-wider block mb-1"
                  style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                >
                  Public Bio
                </span>
                <p
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{ color: isDark ? '#E5D6C5' : '#5A2D0C' }}
                >
                  {selectedRoommate.bio}
                </p>
              </div>

              {/* Skills */}
              <div>
                <span
                  className="font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-2"
                  style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                >
                  <Code2 className="w-3.5 h-3.5 text-[#B77620] dark:text-[#C88D3A]" />
                  <span>Public Technical Skills</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoommate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.8)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
                        color: isDark ? '#FFF9EE' : '#5A2D0C',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              {selectedRoommate.interests.length > 0 && (
                <div>
                  <span
                    className="font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-2"
                    style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                  >
                    <Heart className="w-3.5 h-3.5 text-[#B77620] dark:text-[#C88D3A]" />
                    <span>Personal Interests</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoommate.interests.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                        style={{
                          backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : 'rgba(247, 241, 231, 0.5)',
                          borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.1)',
                          color: isDark ? '#D9C4AC' : '#704728',
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Birthday */}
              {selectedRoommate.publicBirthday && (
                <div
                  className="p-3 rounded-xl border flex items-center gap-2.5 text-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : 'rgba(247, 241, 231, 0.5)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                  }}
                >
                  <Calendar className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A] shrink-0" />
                  <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                    Birthday: <strong className="font-semibold text-[#5A2D0C] dark:text-[#FFF9EE]">{selectedRoommate.publicBirthday}</strong> (Celebrated with the room)
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="pt-4 border-t flex items-center justify-between"
              style={{
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <span
                className="text-[11px] italic"
                style={{ color: isDark ? '#A98F77' : '#8A5D3B' }}
              >
                Privacy protected &bull; Public community view
              </span>
              <button
                type="button"
                id="modal-done-btn"
                onClick={() => setSelectedRoommate(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer shadow-xs active:translate-y-0.5"
                style={{
                  backgroundColor: isDark ? '#C88D3A' : '#5A2D0C',
                  borderColor: isDark ? '#915B15' : '#381B07',
                  color: isDark ? '#241104' : '#FFF9EE',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
