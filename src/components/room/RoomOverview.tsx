import React from 'react';
import { CampusRoom, RoomBed } from '../../domain/roomOperations';
import {
  Bed,
  Users,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface RoomOverviewProps {
  room: CampusRoom;
  isDark?: boolean;
  isCoordinatorView?: boolean;
  onOpenDelegateChoice?: (bedId: string) => void;
  onOpenDirectAssign?: (bedId: string) => void;
}

export const RoomOverview: React.FC<RoomOverviewProps> = ({
  room,
  isDark = false,
  isCoordinatorView = false,
  onOpenDelegateChoice,
  onOpenDirectAssign,
}) => {
  const vacantBedsCount = room.beds.filter((b) => b.status === 'VACANT').length;
  const delegatedBedsCount = room.beds.filter((b) => b.status === 'DELEGATED_CHOICE').length;

  return (
    <div id={`room-overview-${room.id}`} className="space-y-6">
      {/* 1. Room Pulse & Key Metrics */}
      <section
        aria-labelledby="room-metrics-heading"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
      >
        {/* Metric 1: Capacity & Occupancy */}
        <div
          className="p-4 sm:p-5 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className="font-bold uppercase tracking-wider text-[10px]"
              style={{ color: isDark ? '#C88D3A' : '#B77620' }}
            >
              Occupancy
            </span>
            <Users className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
          </div>
          <div
            className="text-2xl sm:text-3xl font-bold font-mono tracking-tight"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            {room.occupiedBeds} / {room.totalBeds}
          </div>
          <div
            className="text-[11px] font-medium mt-1"
            style={{ color: isDark ? '#D9C4AC' : '#704728' }}
          >
            {room.occupiedBeds === room.totalBeds
              ? 'Room fully occupied'
              : `${room.totalBeds - room.occupiedBeds} beds available`}
          </div>
        </div>

        {/* Metric 2: Vacancies */}
        <div
          className="p-4 sm:p-5 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-400"
            >
              Vacancies
            </span>
            <Bed className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div
            className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-700 dark:text-emerald-400"
          >
            {vacantBedsCount}
          </div>
          <div
            className="text-[11px] font-medium mt-1"
            style={{ color: isDark ? '#D9C4AC' : '#704728' }}
          >
            Immediate ready bunks
          </div>
        </div>

        {/* Metric 3: Delegations Pending */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md ${
            delegatedBedsCount > 0 ? 'ring-2 ring-purple-600/30' : ''
          }`}
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-purple-700 dark:text-purple-400">
              Delegated Choices
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-purple-700 dark:text-purple-400">
            {delegatedBedsCount}
          </div>
          <div
            className="text-[11px] font-medium mt-1"
            style={{ color: isDark ? '#D9C4AC' : '#704728' }}
          >
            {delegatedBedsCount > 0
              ? 'Captain selection in flight'
              : 'No pending delegations'}
          </div>
        </div>

        {/* Metric 4: Property Monthly Rate */}
        <div
          className="p-4 sm:p-5 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className="font-bold uppercase tracking-wider text-[10px]"
              style={{ color: isDark ? '#C88D3A' : '#B77620' }}
            >
              Rate / Fellow
            </span>
            <Building2 className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
          </div>
          <div
            className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#B77620] dark:text-[#C88D3A]"
          >
            ₦{room.monthlyCommitment.toLocaleString()}
          </div>
          <div
            className="text-[11px] font-medium mt-1"
            style={{ color: isDark ? '#D9C4AC' : '#704728' }}
          >
            Per month &bull; {room.campus}
          </div>
        </div>
      </section>

      {/* 2. Room Bunk Spaces Layout (The Tactical Room Grid) */}
      <section
        aria-labelledby="bed-spaces-heading"
        className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b-2 gap-2"
          style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
              <h2
                id="bed-spaces-heading"
                className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Bed Space Allocation &bull; {room.roomNumber}
              </h2>
            </div>
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              {room.propertyName} &bull; {room.floorName} &bull; Delegated Captain authority: {room.captainName || 'Coordinator Oversight'}
            </p>
          </div>

          <span
            className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-semibold border self-start sm:self-auto"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
              color: isDark ? '#C88D3A' : '#B77620',
            }}
          >
            {room.beds.length} Total Spaces
          </span>
        </div>

        {/* Beds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {room.beds.map((bed, idx) => {
            const isOccupied = bed.status === 'OCCUPIED';
            const isDelegated = bed.status === 'DELEGATED_CHOICE';
            const isVacant = bed.status === 'VACANT';

            return (
              <div
                key={bed.id}
                id={`bed-card-${bed.id}`}
                className="p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 backdrop-blur-xs flex flex-col justify-between"
                style={{
                  backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                  borderColor: isDelegated
                    ? (isDark ? '#9333EA' : '#7E22CE')
                    : isOccupied
                    ? (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)')
                    : (isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)'),
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#B77620] dark:text-[#C88D3A]">
                        #{idx + 1}
                      </span>
                      <h3
                        className="font-serif font-bold text-sm"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {bed.bedLabel}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${
                        isOccupied
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                          : isDelegated
                          ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700 animate-pulse'
                          : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                      }`}
                    >
                      {isOccupied
                        ? 'Occupied'
                        : isDelegated
                        ? 'Delegated Choice'
                        : 'Vacant'}
                    </span>
                  </div>

                  {/* Occupant or State description */}
                  {isOccupied && (
                    <div className="mt-2 space-y-1">
                      <div
                        className="font-bold text-sm flex items-center gap-1.5"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{bed.occupantName}</span>
                      </div>
                      {bed.occupantTrack && (
                        <div
                          className="text-xs font-medium"
                          style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                        >
                          {bed.occupantTrack}
                        </div>
                      )}
                      {bed.occupantH4dId && (
                        <div className="text-[10px] font-mono text-[#B77620] dark:text-[#C88D3A]">
                          ID: {bed.occupantH4dId}
                        </div>
                      )}
                    </div>
                  )}

                  {isDelegated && (
                    <div className="mt-2 text-xs text-purple-900 dark:text-purple-200 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg p-2.5">
                      <div className="font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Delegated to Room Captain</span>
                      </div>
                      <p className="mt-0.5 text-[11px] opacity-90">
                        Coordinator has assigned a candidate pool for Room Captain evaluation.
                      </p>
                    </div>
                  )}

                  {isVacant && (
                    <div className="mt-2 text-xs text-stone-600 dark:text-stone-300">
                      <p>Open bunk space ready for assignment or captain-scoped candidate delegation.</p>
                    </div>
                  )}
                </div>

                {/* Coordinator quick actions */}
                {isCoordinatorView && isVacant && (
                  <div
                    className="mt-4 pt-3 border-t flex items-center gap-2"
                    style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.10)' }}
                  >
                    {onOpenDelegateChoice && (
                      <button
                        type="button"
                        id={`btn-delegate-choice-${bed.id}`}
                        onClick={() => onOpenDelegateChoice(bed.id)}
                        className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer text-center active:translate-y-[1px] ${
                          isDark
                            ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                            : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                        }`}
                      >
                        Delegate Choice
                      </button>
                    )}
                    {onOpenDirectAssign && (
                      <button
                        type="button"
                        id={`btn-direct-assign-${bed.id}`}
                        onClick={() => onOpenDirectAssign(bed.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer active:translate-y-[1px]"
                        style={{
                          backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                          borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                          color: isDark ? '#FFF9EE' : '#5A2D0C',
                        }}
                      >
                        Assign Directly
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Room Governance & Authority Attribution Notice */}
      <section
        aria-labelledby="room-authority-heading"
        className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md flex items-start gap-3.5"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <ShieldCheck className="w-5 h-5 text-[#B77620] dark:text-[#C88D3A] shrink-0 mt-0.5" />
        <div>
          <h2
            id="room-authority-heading"
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            Room Governance &amp; Authority Scope
          </h2>
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: isDark ? '#D9C4AC' : '#704728' }}
          >
            {room.captainName
              ? `Room Captain ${room.captainName} holds delegated room-level authority for ${room.roomNumber}. This authority is strictly room-scoped and includes in-person occupancy verification and explicitly delegated candidate selection.`
              : `No Room Captain is currently assigned to ${room.roomNumber}. Operational oversight is provided directly by the Accommodation Fellows Coordinator.`}
          </p>
        </div>
      </section>
    </div>
  );
};
