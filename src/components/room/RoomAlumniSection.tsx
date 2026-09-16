import React from 'react';
import { RoomAlumniRecord } from '../../data/demoRoomStory';
import {
  GraduationCap,
  Calendar,
  Code2,
  Sparkles,
  Quote,
  Shield,
  Briefcase,
  HeartHandshake,
} from 'lucide-react';

interface RoomAlumniSectionProps {
  alumniRecords: RoomAlumniRecord[];
  roomNumber: string;
  isDark?: boolean;
}

export const RoomAlumniSection: React.FC<RoomAlumniSectionProps> = ({
  alumniRecords,
  roomNumber,
  isDark = false,
}) => {
  return (
    <div className="space-y-6" id="room-alumni-section">
      {/* Warm Community Memory Banner */}
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
            <GraduationCap className="w-5 h-5 text-[#B77620] dark:text-[#C88D3A]" />
          </div>
          <div>
            <h3
              className="font-serif font-bold text-base sm:text-lg"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Room Alumni Memory &bull; {roomNumber}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              People move on, but their contribution to the room&apos;s story and community remains
            </p>
          </div>
        </div>

        <span
          className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-semibold border self-start sm:self-auto inline-flex items-center gap-1.5"
          style={{
            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
            color: isDark ? '#C88D3A' : '#B77620',
          }}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Alumni Continuum</span>
        </span>
      </div>

      {/* Alumni Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alumniRecords.map((alumnus) => (
          <div
            key={alumnus.id}
            id={`alumni-card-${alumnus.id}`}
            className="h4d-card-static p-5 sm:p-6 rounded-2xl border-2 border-b-4 shadow-xs flex flex-col justify-between"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.55)' : 'rgba(255, 253, 248, 0.85)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
            }}
          >
            <div>
              {/* Header: Avatar, Name, Residency */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center text-sm shadow-xs ${alumnus.avatarBgColor} border-2`}
                    style={{
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.25)',
                    }}
                  >
                    {alumnus.avatarInitials}
                  </div>
                  <div>
                    <h4
                      className="font-bold text-sm leading-tight"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      {alumnus.fullName}
                    </h4>
                    <p
                      className="text-xs font-semibold mt-0.5"
                      style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                    >
                      {alumnus.cohort}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25 shrink-0">
                  Alumni
                </span>
              </div>

              {/* Lived here period badge */}
              <div
                className="mb-3 p-2 rounded-xl border flex items-center gap-2 text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.5)' : 'rgba(247, 241, 231, 0.6)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                }}
              >
                <Calendar className="w-3.5 h-3.5 text-[#B77620] dark:text-[#C88D3A] shrink-0" />
                <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                  Lived here: <strong className="font-semibold text-[#5A2D0C] dark:text-[#FFF9EE]">{alumnus.residencyPeriod}</strong>
                </span>
              </div>

              {/* Role & Status */}
              <div className="mb-3 space-y-1">
                <div
                  className="text-xs font-medium"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  {alumnus.publicTrackAndRole}
                </div>
                <div
                  className="text-[11px] font-semibold flex items-center gap-1.5"
                  style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                >
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>{alumnus.currentStatus}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {alumnus.skills.map((skill) => (
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
              </div>

              {/* Public Note */}
              {alumnus.publicNote && (
                <div
                  className="p-3 rounded-xl border text-xs leading-relaxed italic relative mb-2"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.35)' : 'rgba(247, 241, 231, 0.5)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                    color: isDark ? '#E5D6C5' : '#5A2D0C',
                  }}
                >
                  <Quote className="w-3 h-3 text-[#B77620] dark:text-[#C88D3A] inline mr-1 opacity-70" />
                  &ldquo;{alumnus.publicNote}&rdquo;
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="pt-3 border-t text-[10px] font-medium flex items-center justify-between"
              style={{
                borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)',
                color: isDark ? '#A98F77' : '#8A5D3B',
              }}
            >
              <span>Verified Room Resident</span>
              <span className="font-mono">Hut4Devs Alumni</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
