import React, { useState, useEffect } from 'react';
import { CampusRoom } from '../../domain/roomOperations';
import {
  roomCommonsStore,
  RoomTrailEvent,
  RoomTrailEventType,
} from '../../services/roomCommonsStore';
import {
  History,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  Filter,
} from 'lucide-react';

interface RoomTrailProps {
  room: CampusRoom;
  isDark?: boolean;
}

export const RoomTrail: React.FC<RoomTrailProps> = ({ room, isDark = false }) => {
  const [trail, setTrail] = useState<RoomTrailEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    const loadTrail = () => {
      setTrail(roomCommonsStore.getTrail(room.id));
    };

    loadTrail();
    const unsub = roomCommonsStore.subscribe(loadTrail);
    return () => unsub();
  }, [room.id]);

  const filteredTrail = trail.filter((evt) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'DELEGATIONS')
      return evt.eventType === 'OCCUPANCY_DELEGATED' || evt.eventType === 'DECISION_MADE';
    if (filterType === 'OCCUPANCY')
      return evt.eventType === 'OCCUPANCY_CONFIRMED' || evt.eventType === 'CANNOT_CONFIRM';
    if (filterType === 'NOTICES') return evt.eventType === 'NOTICE_POSTED';
    return true;
  });

  const getEventBadge = (type: RoomTrailEventType) => {
    switch (type) {
      case 'OCCUPANCY_CONFIRMED':
        return {
          label: 'Occupancy Confirmed',
          className: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
        };
      case 'OCCUPANCY_DELEGATED':
        return {
          label: 'Delegation Recorded',
          className: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700',
          icon: <Sparkles className="w-3 h-3 text-purple-600" />,
        };
      case 'DECISION_MADE':
        return {
          label: 'Captain Decision',
          className: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700',
          icon: <ShieldCheck className="w-3 h-3 text-blue-600" />,
        };
      case 'CANNOT_CONFIRM':
        return {
          label: 'Discrepancy Logged',
          className: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-700',
          icon: <AlertCircle className="w-3 h-3 text-red-600" />,
        };
      case 'NOTICE_POSTED':
        return {
          label: 'Notice Published',
          className: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
          icon: <FileText className="w-3 h-3 text-amber-600" />,
        };
      default:
        return {
          label: 'Operational Event',
          className: 'bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-900 dark:text-stone-200 dark:border-stone-700',
          icon: <History className="w-3 h-3" />,
        };
    }
  };

  return (
    <div id={`room-trail-${room.id}`} className="space-y-6">
      <section
        aria-labelledby="room-trail-heading"
        className="h4d-card-static rounded-2xl p-5 sm:p-7 border-2 border-b-4 shadow-md backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b-2 gap-3"
          style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
              <h2
                id="room-trail-heading"
                className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Room Operations Trail &bull; {room.roomNumber}
              </h2>
            </div>
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              Immutable, append-only chronological log of room decisions, verifications, and delegations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {['ALL', 'DELEGATIONS', 'OCCUPANCY', 'NOTICES'].map((f) => (
              <button
                key={f}
                type="button"
                id={`filter-trail-${f.toLowerCase()}`}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold rounded-lg border-2 transition-all cursor-pointer ${
                  filterType === f
                    ? isDark
                      ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                      : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                    : isDark
                    ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)]'
                    : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Trail Timeline Items */}
        <div className="space-y-4">
          {filteredTrail.length === 0 ? (
            <div className="py-8 text-center">
              <p
                className="text-xs"
                style={{ color: isDark ? '#D9C4AC' : '#704728' }}
              >
                No trail events match this filter.
              </p>
            </div>
          ) : (
            filteredTrail.map((evt) => {
              const badge = getEventBadge(evt.eventType);

              return (
                <div
                  key={evt.id}
                  id={`trail-event-${evt.id}`}
                  className="h4d-card-static p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs backdrop-blur-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
                  }}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b"
                    style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.10)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border flex items-center gap-1 ${badge.className}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                      <h3
                        className="font-bold text-xs sm:text-sm"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {evt.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#B77620] dark:text-[#C88D3A]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(evt.timestamp).toLocaleString('en-GB')}</span>
                    </div>
                  </div>

                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                  >
                    {evt.description}
                  </p>

                  <div
                    className="mt-3 text-[11px] font-medium"
                    style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                  >
                    Actor: <strong className="font-semibold">{evt.actorName}</strong> &bull;{' '}
                    <span className="opacity-90">{evt.actorCapacity}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
