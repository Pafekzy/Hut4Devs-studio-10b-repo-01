import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, formatActionAttribution } from '../domain/membership';
import { roomOperationsStore } from '../services/roomOperationsStore';
import { SharedRoomWorkspace } from './room/SharedRoomWorkspace';
import { MissingPuzzleModal } from './MissingPuzzleModal';
import {
  ShieldCheck,
  Puzzle,
} from 'lucide-react';

interface CaptainWorkspaceViewProps {
  member: Member;
  activeMode: ActiveMode;
  isDark?: boolean;
  onOpenFeedbackReport?: (feedbackId?: string) => void;
}

export const CaptainWorkspaceView: React.FC<CaptainWorkspaceViewProps> = ({
  member,
  activeMode,
  isDark = false,
  onOpenFeedbackReport,
}) => {
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to roomOperationsStore
  useEffect(() => {
    const unsub = roomOperationsStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  // Derivation of Room Scope: Captain is strictly scoped to their assigned room
  const captainRoomId = 'room-304'; // Default demo assigned room for Chinedu Okeke
  const room = roomOperationsStore.getRoomById(captainRoomId) || {
    id: 'room-304',
    roomNumber: 'Room 304',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 3',
    campus: 'Lagos Yaba',
    totalBeds: 4,
    occupiedBeds: 2,
    captainMemberId: member.id,
    captainName: member.displayName,
    monthlyCommitment: 66000,
    status: 'ATTENTION_REQUIRED' as const,
    beds: [],
  };

  const attribution = formatActionAttribution(
    member,
    activeMode,
    `${room.propertyName} — ${room.roomNumber}`
  );

  return (
    <div
      id="captain-workspace-view"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      {/* 1. Header & Room Authority Banner */}
      <header
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2"
        style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: isDark ? '#C88D3A' : '#B77620' }}
            >
              Lagos Yaba Campus &bull; {room.propertyName}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700">
              Strictly Room-Scoped
            </span>
          </div>

          <h1
            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            {room.roomNumber} &bull; Room Captain Workspace
          </h1>

          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: isDark ? '#D9C4AC' : '#704728' }}
          >
            Delegated operational authority for {room.roomNumber} living space, peer guidelines, and in-person candidate verification.
          </p>
        </div>

        {/* Attributed Actor Card & Report Puzzle Action */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            id="btn-report-room-puzzle"
            onClick={() => setShowPuzzleModal(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-xs active:translate-y-[1px]"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
              color: isDark ? '#FFF9EE' : '#5A2D0C',
            }}
          >
            <Puzzle className="w-3.5 h-3.5 text-[#B77620] dark:text-[#C88D3A]" />
            <span>Report Room Puzzle</span>
          </button>

          <div
            className="p-3 rounded-xl border-2 border-b-3 text-xs flex items-center gap-3 shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(23, 21, 19, 0.65)' : 'rgba(255, 253, 248, 0.75)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
            }}
          >
            <ShieldCheck className="w-5 h-5 text-[#B77620] dark:text-[#C88D3A] shrink-0" />
            <div>
              <div
                className="font-bold text-xs"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                {member.displayName}
              </div>
              <div
                className="text-[11px] font-medium"
                style={{ color: isDark ? '#D9C4AC' : '#704728' }}
              >
                {attribution.actingCapacity}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Unified Shared Room Workspace (Automatic Room Captain Scope) */}
      <SharedRoomWorkspace
        room={room}
        viewerRole="ROOM_CAPTAIN"
        currentMember={member}
        isDark={isDark}
      />

      {/* Missing Puzzle Report Modal */}
      {showPuzzleModal && (
        <MissingPuzzleModal
          isOpen={showPuzzleModal}
          onClose={() => setShowPuzzleModal(false)}
          currentMember={member}
          isDark={isDark}
          defaultLocation={`${room.propertyName} — ${room.roomNumber}`}
        />
      )}
    </div>
  );
};
