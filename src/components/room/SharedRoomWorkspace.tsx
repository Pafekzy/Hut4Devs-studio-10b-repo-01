import React, { useState } from 'react';
import { CampusRoom } from '../../domain/roomOperations';
import { Member } from '../../domain/auth';
import { formatActionAttribution } from '../../domain/membership';
import {
  getRoommatesForRoom,
  getStoryFactsForRoom,
  getAlumniForRoom,
  getCultureForRoom,
} from '../../data/demoRoomStory';
import { RoomOverview } from './RoomOverview';
import { RoomActions } from './RoomActions';
import { RoomCommons } from './RoomCommons';
import { RoomCommunication } from './RoomCommunication';
import { RoomTrail } from './RoomTrail';
import { RoommateCards } from './RoommateCards';
import { RoomStorySection } from './RoomStorySection';
import { RoomAlumniSection } from './RoomAlumniSection';
import { RoomCultureSection } from './RoomCultureSection';
import {
  Bed,
  Users,
  BookOpen,
  GraduationCap,
  Sparkles,
  FileText,
  MessageSquare,
  History,
  ArrowLeft,
  Shield,
  BadgeCheck,
} from 'lucide-react';

export type SharedRoomTab =
  | 'OVERVIEW'
  | 'ROOMMATES'
  | 'STORY'
  | 'ALUMNI'
  | 'CULTURE'
  | 'COMMONS'
  | 'TRAIL'
  | 'ACTIONS'
  | 'COMMUNICATION';

export interface SharedRoomWorkspaceProps {
  room: CampusRoom;
  viewerRole: 'FELLOW' | 'ROOM_CAPTAIN' | 'COORDINATOR';
  currentMember: Member;
  isDark?: boolean;
  onBack?: () => void;
  // Coordinator / Captain specific action modal callbacks
  onOpenDelegateChoice?: (bedId: string) => void;
  onOpenDirectAssign?: (bedId: string) => void;
  initialTab?: SharedRoomTab;
}

export const SharedRoomWorkspace: React.FC<SharedRoomWorkspaceProps> = ({
  room,
  viewerRole,
  currentMember,
  isDark = false,
  onBack,
  onOpenDelegateChoice,
  onOpenDirectAssign,
  initialTab = 'OVERVIEW',
}) => {
  const [activeTab, setActiveTab] = useState<SharedRoomTab>(initialTab);

  // Derive community fixtures for this room
  const roommates = getRoommatesForRoom(room.id, currentMember.id);
  const storyFacts = getStoryFactsForRoom(room.id);
  const alumniRecords = getAlumniForRoom(room.id);
  const cultureGuide = getCultureForRoom(room.id);

  // Authority attribution
  const attribution = formatActionAttribution(
    currentMember,
    viewerRole === 'ROOM_CAPTAIN'
      ? 'ROOM_CAPTAIN'
      : viewerRole === 'COORDINATOR'
      ? 'COORDINATOR'
      : 'FELLOW'
  );

  // Count pending actions for badge
  const pendingDelegatedCount = room.beds.filter((b) => b.status === 'DELEGATED_CHOICE').length;

  // Define tab navigation based on role authority
  const isCaptain = viewerRole === 'ROOM_CAPTAIN';
  const isCoordinator = viewerRole === 'COORDINATOR';
  const isFellow = viewerRole === 'FELLOW';

  const availableTabs: { id: SharedRoomTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'OVERVIEW', label: 'Overview & Bunks', icon: <Bed className="w-3.5 h-3.5" /> },
    { id: 'ROOMMATES', label: 'Roommates', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'STORY', label: 'Room Story', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'ALUMNI', label: 'Room Alumni', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'CULTURE', label: 'Room Culture', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'COMMONS', label: 'Room Commons', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'TRAIL', label: 'Room Trail', icon: <History className="w-3.5 h-3.5" /> },
  ];

  // Actions & Communication tabs are strictly role-authorized
  if (isCaptain || isCoordinator) {
    availableTabs.splice(5, 0, {
      id: 'ACTIONS',
      label: isCaptain ? 'Captain Actions' : 'Room Actions',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      badge: isCaptain ? pendingDelegatedCount : undefined,
    });
    availableTabs.splice(6, 0, {
      id: 'COMMUNICATION',
      label: 'Communication',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    });
  }

  return (
    <div id={`shared-room-workspace-${room.id}`} className="space-y-6">
      {/* 1. Header & Navigation Context Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2"
        style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              id="btn-back-from-room"
              onClick={onBack}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:translate-y-[1px] hover:-translate-y-0.5 shadow-xs"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                {isFellow
                  ? 'Back to Fellow Accommodation'
                  : isCoordinator
                  ? 'Back to Campus Rooms'
                  : 'Back to Overview'}
              </span>
            </button>
          )}

          <div className="text-xs font-medium" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
            <span>{room.campus}</span> &bull; <span>{room.propertyName}</span> &bull;{' '}
            <strong className="font-bold text-[#B77620] dark:text-[#C88D3A] text-sm">
              {room.roomNumber}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFellow && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-bold border bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Resident Fellow</span>
            </span>
          )}

          {isCaptain && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-bold border bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700">
              <Shield className="w-3.5 h-3.5" />
              <span>Delegated Captain Scope</span>
            </span>
          )}

          {isCoordinator && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-bold border bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700">
              <span>Coordinator Coverage Mode</span>
            </span>
          )}

          <span
            className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
              color: isDark ? '#FFF9EE' : '#5A2D0C',
            }}
          >
            {room.occupiedBeds} / {room.totalBeds} Bunks
          </span>
        </div>
      </div>

      {/* 2. Canonical Sub-Navigation Tabs */}
      <nav
        aria-label="Shared Room Navigation Tabs"
        className="flex flex-wrap gap-2 border-b-2 pb-2.5"
        style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
      >
        {availableTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              id={`tab-room-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:translate-y-[1px] ${
                isActive
                  ? isDark
                    ? 'bg-[#C88D3A] text-[#241104] border-[#915B15] shadow-xs'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
                  : isDark
                  ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)] hover:border-[rgba(200,141,58,0.4)]'
                  : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)] hover:border-[rgba(90,45,12,0.3)]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-red-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Tab Contents */}
      {/* Tab: Overview & Bunks */}
      {activeTab === 'OVERVIEW' && (
        <RoomOverview
          room={room}
          isDark={isDark}
          isCoordinatorView={isCoordinator}
          onOpenDelegateChoice={onOpenDelegateChoice}
          onOpenDirectAssign={onOpenDirectAssign}
        />
      )}

      {/* Tab: Roommates */}
      {activeTab === 'ROOMMATES' && (
        <RoommateCards
          roommates={roommates}
          isDark={isDark}
        />
      )}

      {/* Tab: Room Story */}
      {activeTab === 'STORY' && (
        <RoomStorySection
          storyFacts={storyFacts}
          roomNumber={room.roomNumber}
          isDark={isDark}
        />
      )}

      {/* Tab: Room Alumni */}
      {activeTab === 'ALUMNI' && (
        <RoomAlumniSection
          alumniRecords={alumniRecords}
          roomNumber={room.roomNumber}
          isDark={isDark}
        />
      )}

      {/* Tab: Room Culture */}
      {activeTab === 'CULTURE' && (
        <RoomCultureSection
          cultureGuide={cultureGuide}
          isDark={isDark}
        />
      )}

      {/* Tab: Room Commons */}
      {activeTab === 'COMMONS' && (
        <RoomCommons
          room={room}
          isDark={isDark}
          activeMemberName={currentMember.displayName}
          actingCapacity={attribution.actingCapacity}
          canPost={isCaptain || isCoordinator}
        />
      )}

      {/* Tab: Room Trail */}
      {activeTab === 'TRAIL' && (
        <RoomTrail
          room={room}
          isDark={isDark}
        />
      )}

      {/* Role-Authorized Tab: Room Actions */}
      {activeTab === 'ACTIONS' && (isCaptain || isCoordinator) && (
        <RoomActions
          room={room}
          isDark={isDark}
          activeMemberId={currentMember.id}
          activeMemberName={currentMember.displayName}
          actingCapacity={attribution.actingCapacity}
          isCaptain={isCaptain}
          isCoordinator={isCoordinator}
        />
      )}

      {/* Role-Authorized Tab: Communication */}
      {activeTab === 'COMMUNICATION' && (isCaptain || isCoordinator) && (
        <RoomCommunication
          room={room}
          isDark={isDark}
          activeMemberId={currentMember.id}
          activeMemberName={currentMember.displayName}
          actingCapacity={attribution.actingCapacity}
        />
      )}
    </div>
  );
};
