import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, formatActionAttribution } from '../domain/membership';
import { membershipStore } from '../services/membershipStore';
import {
  roomCommonsStore,
  RoomNotice,
  RoomTrailEvent,
  RoomMessage,
  RoomCommunicationChannel,
} from '../services/roomCommonsStore';
import { puzzleFeedbackStore } from '../services/puzzleFeedbackStore';
import { notificationStore } from '../services/notificationStore';
import { MissingPuzzleModal } from './MissingPuzzleModal';
import {
  Shield,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Users,
  Bell,
  Clock,
  AlertTriangle,
  Send,
  PlusCircle,
  FileText,
  Activity,
  Puzzle,
  ChevronRight,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';

interface CaptainWorkspaceViewProps {
  member: Member;
  activeMode: ActiveMode;
  isDark?: boolean;
  onOpenFeedbackReport?: (feedbackId?: string) => void;
}

type CaptainActiveTab = 'ACTIONS' | 'COMMONS' | 'COMMUNICATION' | 'TRAIL';

export const CaptainWorkspaceView: React.FC<CaptainWorkspaceViewProps> = ({
  member,
  activeMode,
  isDark = false,
  onOpenFeedbackReport,
}) => {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<CaptainActiveTab>('ACTIONS');

  // Room Scope derivation
  const scopedAssignments = membershipStore.getScopedRolesForMember(member.id);
  const captainScope = scopedAssignments.find((s) => (s.role as any) === 'ROOM_CAPTAIN')?.scope || {
    propertyName: 'Infinite Grace Apartment',
    roomName: 'Room 304',
    roomId: 'room-304',
  };

  const roomId = captainScope.roomId || 'room-304';
  const attribution = formatActionAttribution(
    member,
    activeMode,
    `${captainScope.propertyName} — ${captainScope.roomName}`
  );

  // Subscriptions
  useEffect(() => {
    const unsubMembership = membershipStore.subscribe(() => setTick((t) => t + 1));
    const unsubCommons = roomCommonsStore.subscribe(() => setTick((t) => t + 1));
    const unsubFeedback = puzzleFeedbackStore.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsubMembership();
      unsubCommons();
      unsubFeedback();
    };
  }, []);

  // Room Delegations & Occupants
  const allRequests = membershipStore.getRequests();
  const roomDelegations = allRequests.filter(
    (r) =>
      r.delegation &&
      (r.delegation.delegatedToMemberId === member.id ||
        r.roomName.toLowerCase() === (captainScope.roomName || '').toLowerCase() ||
        activeMode === 'CAPTAIN_COVERAGE')
  );

  const pendingDelegations = roomDelegations.filter(
    (r) => r.delegation && r.delegation.status === 'PENDING'
  );

  const activeOccupants = membershipStore.getAssignments().filter(
    (a) =>
      a.status === 'ACTIVE' &&
      a.roomName.toLowerCase() === (captainScope.roomName || '').toLowerCase()
  );

  // Room Commons data
  const notices = roomCommonsStore.getNotices(roomId);
  const trail = roomCommonsStore.getTrail(roomId);

  // Room Puzzles / Improvements
  const roomReports = puzzleFeedbackStore
    .getReports()
    .filter(
      (r) =>
        r.locationContext?.toLowerCase().includes((captainScope.roomName || '').toLowerCase()) ||
        r.locationContext?.toLowerCase().includes('304')
    );

  // Modal & Input States
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [captainNote, setCaptainNote] = useState('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Notice Form State
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<RoomNotice['category']>('GUIDELINE');

  // Communication State
  const [commChannel, setCommChannel] = useState<RoomCommunicationChannel>('ROOM_MEMBERS');
  const [newCommMessage, setNewCommMessage] = useState('');
  const channelMessages = roomCommonsStore.getMessages(roomId, commChannel);

  // Fix a Puzzle Modal
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false);

  // Action Handlers
  const handleConfirm = (reqId: string) => {
    const req = membershipStore.resolveDelegation({
      requestId: reqId,
      status: 'CONFIRMED',
      note: 'Verified in-person occupancy and assigned bed space.',
    });

    roomCommonsStore.addTrailEvent({
      roomId,
      roomName: captainScope.roomName || 'Room 304',
      eventType: 'OCCUPANCY_CONFIRMED',
      actorName: member.displayName,
      actorCapacity: attribution.actingCapacity,
      title: `Occupancy Confirmed: ${req.fullName}`,
      description: `In-person bed space verified in ${captainScope.roomName}. Ready for coordinator final approval.`,
    });

    // Notify Coordinator
    notificationStore.addNotification({
      memberId: 'member-zainab-coordinator',
      title: `Occupancy Verified: ${req.fullName}`,
      message: `Room Captain ${member.displayName} verified occupancy for ${req.fullName} in ${captainScope.roomName}.`,
      type: 'DELEGATED_TASK',
      targetWorkspace: 'coordinator',
      targetContextId: req.id,
      targetContextType: 'MEMBERSHIP_REQUEST',
    });
  };

  const handleCannotConfirm = (reqId: string) => {
    const req = membershipStore.resolveDelegation({
      requestId: reqId,
      status: 'CANNOT_CONFIRM',
      note: 'Candidate not located in assigned room during verification check.',
    });

    roomCommonsStore.addTrailEvent({
      roomId,
      roomName: captainScope.roomName || 'Room 304',
      eventType: 'CANNOT_CONFIRM',
      actorName: member.displayName,
      actorCapacity: attribution.actingCapacity,
      title: `Cannot Confirm Occupancy: ${req.fullName}`,
      description: 'Candidate was not present during in-person room inspection.',
    });

    // Notify Coordinator
    notificationStore.addNotification({
      memberId: 'member-zainab-coordinator',
      title: `Occupancy Cannot Confirm: ${req.fullName}`,
      message: `Room Captain ${member.displayName} reported candidate not located in ${captainScope.roomName}.`,
      type: 'DELEGATED_TASK',
      targetWorkspace: 'coordinator',
      targetContextId: req.id,
      targetContextType: 'MEMBERSHIP_REQUEST',
    });
  };

  const handleOpenNote = (reqId: string) => {
    setSelectedReqId(reqId);
    setCaptainNote('');
    setNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedReqId || !captainNote.trim()) return;
    const req = membershipStore.resolveDelegation({
      requestId: selectedReqId,
      status: 'CONFIRMED',
      note: captainNote.trim(),
    });

    roomCommonsStore.addTrailEvent({
      roomId,
      roomName: captainScope.roomName || 'Room 304',
      eventType: 'NOTE_RECORDED',
      actorName: member.displayName,
      actorCapacity: attribution.actingCapacity,
      title: `Captain Note Recorded: ${req.fullName}`,
      description: captainNote.trim(),
    });

    setNoteModalOpen(false);
    setSelectedReqId(null);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    roomCommonsStore.addNotice({
      roomId,
      roomName: captainScope.roomName || 'Room 304',
      title: newNoticeTitle.trim(),
      content: newNoticeContent.trim(),
      postedBy: `${member.displayName} (Room Captain)`,
      category: newNoticeCategory,
    });

    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNoticeModalOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommMessage.trim()) return;

    roomCommonsStore.addMessage({
      roomId,
      channel: commChannel,
      senderId: member.id,
      senderName: member.displayName,
      senderCapacity: attribution.actingCapacity,
      content: newCommMessage.trim(),
    });

    // If dispatching to coordinator or welfare, send a notification
    if (commChannel === 'COORDINATOR_DISPATCH') {
      notificationStore.addNotification({
        memberId: 'member-zainab-coordinator',
        title: `Room ${captainScope.roomName} Dispatch from Captain`,
        message: `${member.displayName}: "${newCommMessage.trim().slice(0, 80)}..."`,
        type: 'SYSTEM',
        targetWorkspace: 'coordinator',
      });
    } else if (commChannel === 'WELFARE_ESCALATION') {
      notificationStore.addNotification({
        memberId: 'member-admin-financial', // or welfare officer
        title: `Welfare Concern Escalated: ${captainScope.roomName}`,
        message: `A room-level welfare inquiry was logged for mediation review.`,
        type: 'WELFARE_ALERT',
        targetWorkspace: 'welfare-workspace',
      });
    }

    setNewCommMessage('');
  };

  const lastActivity = trail[0];
  const unresolvedCount = pendingDelegations.length + roomReports.filter((r) => r.status === 'PENDING_REVIEW' || r.status === 'UNDER_REVIEW').length;

  return (
    <div id="captain-workspace" className="space-y-6">
      {/* 1. Captain Scope Header */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
          isDark
            ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
            : 'bg-[#FFF9EE] border-[#C88D3A]/35 text-[#5A2D0C]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#5A2D0C] text-[#FFF9EE] shadow-xs">
                Room Captain Responsibility
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#C88D3A]/25 border border-[#C88D3A]/40 text-[#5A2D0C] dark:text-[#FFF9EE]">
                Strictly Room-Scoped
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-[#5A2D0C] dark:text-[#FFF9EE] bg-[#F7F1E7] dark:bg-[#2F1707] border border-[#5A2D0C]/15 dark:border-white/15">
                Authority: Delegated Verification Only
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A2D0C] dark:text-[#FFF9EE] tracking-tight">
              {captainScope.propertyName} &bull; {captainScope.roomName}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE]/90 mt-1.5 max-w-2xl leading-relaxed font-normal">
              Serving as primary peer liaison, verifying occupancy delegations from the Accommodation Coordinator,
              and stewarding shared living space guidelines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5">
            <div className="text-left md:text-right text-xs bg-white dark:bg-[#2F1707] border border-[#5A2D0C]/20 dark:border-[#623416] rounded-xl px-4 py-2.5 shadow-xs">
              <span className="text-[10px] text-[#7A4B20] dark:text-[#E2C79E] block uppercase font-bold tracking-wider">
                Attributed Capacity
              </span>
              <span className="font-bold text-sm text-[#5A2D0C] dark:text-[#FFF9EE]">
                {attribution.actingCapacity}
              </span>
            </div>

            {/* Room Improvement Quick Action */}
            <button
              type="button"
              id="btn-captain-spot-room-puzzle"
              onClick={() => setIsPuzzleModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#C88D3A] hover:bg-[#B77620] text-[#FFF9EE] border-b-2 border-[#8E560C] transition-all shadow-xs cursor-pointer active:translate-y-[1px]"
            >
              <Puzzle className="w-4 h-4 text-[#FFF9EE]" />
              <span>Spot a Room Puzzle</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ROOM PULSE: Concise Room-Level Summary */}
      <div
        id="room-pulse-summary"
        className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
          isDark
            ? 'bg-[#2F1707] border-[#623416] text-[#FFF9EE]'
            : 'bg-[#FFF9EE] border-[#C88D3A]/30 text-[#5A2D0C]'
        }`}
      >
        <div className="flex items-center justify-between mb-3.5 border-b pb-2.5 border-[#5A2D0C]/15 dark:border-white/15">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE]">
              Room Pulse &bull; Operational Snapshot
            </h2>
          </div>
          <span className="text-xs font-mono">
            {pendingDelegations.length > 0 ? (
              <span className="text-amber-800 dark:text-amber-200 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                Attention Required ({pendingDelegations.length} Pending)
              </span>
            ) : (
              <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Room in Good Order
              </span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3.5">
          {/* Stat 1: Active Occupants */}
          <div
            id="pulse-occupants-card"
            className={`p-4 rounded-xl border transition-all ${
              isDark ? 'bg-[#3E200C] border-[#623416]' : 'bg-white border-[#5A2D0C]/15 shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
              Active Occupants
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5A2D0C] dark:text-[#FFF9EE] mt-1.5">
              {activeOccupants.length}
            </div>
            <div className="text-xs font-medium text-[#7A4B20] dark:text-[#D1B898] mt-0.5">
              Verified resident fellows
            </div>
          </div>

          {/* Stat 2: Pending Room Actions */}
          <div
            id="pulse-actions-card"
            className={`p-4 rounded-xl border transition-all ${
              pendingDelegations.length > 0
                ? isDark
                  ? 'bg-amber-950/40 border-2 border-amber-600/60'
                  : 'bg-amber-50/90 border-2 border-amber-300 shadow-xs'
                : isDark
                ? 'bg-[#3E200C] border-[#623416]'
                : 'bg-white border-[#5A2D0C]/15 shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
              Pending Actions
            </div>
            <div
              className={`text-2xl sm:text-3xl font-serif font-bold mt-1.5 ${
                pendingDelegations.length > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-[#5A2D0C] dark:text-[#FFF9EE]'
              }`}
            >
              {pendingDelegations.length}
            </div>
            <div className="text-xs font-medium text-[#7A4B20] dark:text-[#D1B898] mt-0.5">
              Delegated verification checks
            </div>
          </div>

          {/* Stat 3: Unresolved Room Matters */}
          <div
            id="pulse-unresolved-card"
            className={`p-4 rounded-xl border transition-all ${
              isDark ? 'bg-[#3E200C] border-[#623416]' : 'bg-white border-[#5A2D0C]/15 shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
              Unresolved Matters
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5A2D0C] dark:text-[#FFF9EE] mt-1.5">
              {unresolvedCount}
            </div>
            <div className="text-xs font-medium text-[#7A4B20] dark:text-[#D1B898] mt-0.5">
              Delegations &amp; reported room issues
            </div>
          </div>

          {/* Stat 4: Last Meaningful Room Activity */}
          <div
            id="pulse-last-activity-card"
            className={`p-4 rounded-xl border transition-all ${
              isDark ? 'bg-[#3E200C] border-[#623416]' : 'bg-white border-[#5A2D0C]/15 shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
              Recent Room Event
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#5A2D0C] dark:text-[#FFF9EE] mt-1.5 truncate">
              {lastActivity?.title || 'No recorded events yet'}
            </div>
            <div className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898] mt-0.5">
              {lastActivity
                ? new Date(lastActivity.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  }) +
                  ' • ' +
                  lastActivity.actorName.split(' ')[0]
                : 'Awaiting initial activity'}
            </div>
          </div>
        </div>

        {/* Attention Prompt Message */}
        <div
          id="pulse-prompt-message"
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm font-medium ${
            isDark ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]' : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C] shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D] shrink-0" />
            <span>
              {pendingDelegations.length > 0
                ? `Attention Required: 1 delegated occupancy verification awaiting your inspection in ${captainScope.roomName}.`
                : `Does this room currently need attention? No outstanding occupancy verifications or urgent room notices.`}
            </span>
          </div>
          {pendingDelegations.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('ACTIONS')}
              className="text-xs font-bold text-[#B77620] dark:text-[#E2AB5D] hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Review Actions →
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#5A2D0C]/15 dark:border-white/15 pb-2.5">
        <button
          type="button"
          id="tab-captain-actions"
          onClick={() => setActiveTab('ACTIONS')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ACTIONS'
              ? 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs border-b-2 border-[#351A07]'
              : 'bg-white dark:bg-[#3E200C] border border-[#5A2D0C]/15 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] hover:bg-[#FFF9EE] dark:hover:bg-[#4B2710]'
          }`}
        >
          <Shield className="w-4 h-4 text-[#C88D3A]" />
          <span>Room Actions</span>
          {pendingDelegations.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#C88D3A] text-[#FFF9EE] text-[10px] flex items-center justify-center font-bold">
              {pendingDelegations.length}
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-captain-commons"
          onClick={() => setActiveTab('COMMONS')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'COMMONS'
              ? 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs border-b-2 border-[#351A07]'
              : 'bg-white dark:bg-[#3E200C] border border-[#5A2D0C]/15 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] hover:bg-[#FFF9EE] dark:hover:bg-[#4B2710]'
          }`}
        >
          <Users className="w-4 h-4 text-[#C88D3A]" />
          <span>Room Commons ({activeOccupants.length})</span>
        </button>

        <button
          type="button"
          id="tab-captain-communication"
          onClick={() => setActiveTab('COMMUNICATION')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'COMMUNICATION'
              ? 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs border-b-2 border-[#351A07]'
              : 'bg-white dark:bg-[#3E200C] border border-[#5A2D0C]/15 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] hover:bg-[#FFF9EE] dark:hover:bg-[#4B2710]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#C88D3A]" />
          <span>Room Communication</span>
        </button>

        <button
          type="button"
          id="tab-captain-trail"
          onClick={() => setActiveTab('TRAIL')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TRAIL'
              ? 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs border-b-2 border-[#351A07]'
              : 'bg-white dark:bg-[#3E200C] border border-[#5A2D0C]/15 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] hover:bg-[#FFF9EE] dark:hover:bg-[#4B2710]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#C88D3A]" />
          <span>Room Trail ({trail.length})</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: ROOM ACTIONS */}
      {activeTab === 'ACTIONS' && (
        <div className="space-y-5">
          {/* Section: Delegated Verification Queue */}
          <div
            className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
              isDark
                ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
                : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/30 text-[#5A2D0C]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
                  Delegated Room Occupancy Verifications ({roomDelegations.length})
                </h2>
                <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] font-medium mt-0.5">
                  Confirm whether assigned fellows physically occupy their designated bed spaces.
                </p>
              </div>
            </div>

            {roomDelegations.length === 0 ? (
              <div className="p-8 text-center text-xs sm:text-sm font-medium text-[#7A4B20] dark:text-[#D1B898] bg-white dark:bg-[#2F1707] border border-[#5A2D0C]/15 dark:border-[#623416] rounded-xl shadow-2xs">
                No delegated room verification requests currently assigned for {captainScope.roomName}.
              </div>
            ) : (
              <div className="space-y-3">
                {roomDelegations.map((req) => {
                  const delegation = req.delegation!;
                  const isPending = delegation.status === 'PENDING';
                  return (
                    <div
                      key={req.id}
                      id={`captain-delegation-card-${req.id}`}
                      className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isDark
                          ? 'bg-[#2F1707] border-[#623416]'
                          : 'bg-white border-[#5A2D0C]/15 shadow-xs'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif font-bold text-base sm:text-lg text-[#5A2D0C] dark:text-[#FFF9EE]">
                            {req.fullName}
                          </span>
                          <span className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898]">({req.email})</span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              delegation.status === 'CONFIRMED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                                : delegation.status === 'CANNOT_CONFIRM'
                                ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                            }`}
                          >
                            {delegation.status}
                          </span>
                        </div>

                        <div className="text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE]">
                          Cohort: <strong className="font-bold">{req.programCommunity}</strong> &bull; Requested Space:{' '}
                          <strong className="font-bold">{req.roomName}</strong>
                        </div>

                        <div className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898]">
                          Delegated by: <span className="font-semibold">{delegation.delegatedBy}</span> &bull; Task: {delegation.responsibility}
                        </div>

                        {delegation.captainNote && (
                          <div className="text-xs p-2.5 rounded-lg bg-[#FFF9EE] dark:bg-[#1E0E04] border border-[#C88D3A]/40 text-[#5A2D0C] dark:text-[#FFF9EE] mt-1.5">
                            <strong className="font-bold">Captain Record:</strong> "{delegation.captainNote}"
                            {delegation.resolvedAt && (
                              <span className="block text-[10px] font-mono text-[#7A4B20] dark:text-[#D1B898] mt-0.5">
                                Logged {new Date(delegation.resolvedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Controls */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isPending ? (
                          <>
                            <button
                              id={`btn-captain-confirm-${req.id}`}
                              type="button"
                              onClick={() => handleConfirm(req.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5A2D0C] hover:bg-[#3E200C] text-[#FFF9EE] text-xs font-bold rounded-xl border-b-2 border-[#351A07] transition-all shadow-xs cursor-pointer active:translate-y-[1px]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm Occupancy
                            </button>

                            <button
                              id={`btn-captain-cannot-confirm-${req.id}`}
                              type="button"
                              onClick={() => handleCannotConfirm(req.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#1E0E04] border-2 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer active:translate-y-[1px]"
                            >
                              <XCircle className="w-4 h-4" /> Cannot Confirm
                            </button>

                            <button
                              id={`btn-captain-note-${req.id}`}
                              type="button"
                              onClick={() => handleOpenNote(req.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#1E0E04] border-2 border-[#5A2D0C]/25 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] text-xs font-bold rounded-xl hover:bg-[#FFF9EE] dark:hover:bg-[#3E200C] transition-colors cursor-pointer active:translate-y-[1px]"
                            >
                              <MessageSquare className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" /> Add Note
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Action Recorded
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Coordinator-Requested Room Context */}
          <div
            className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
              isDark
                ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
                : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/30 text-[#5A2D0C]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
                  Coordinator-Requested Room Context &amp; Clarifications
                </h2>
                <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] font-medium mt-0.5">
                  Direct requests from Accommodation Coordinator Zainab Aliyu regarding living space status.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#2F1707] border border-[#5A2D0C]/15 dark:border-[#623416] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm sm:text-base text-[#5A2D0C] dark:text-[#FFF9EE]">
                  Bed Space 3 Readiness &bull; L2E Cohort Allocation
                </span>
                <span className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898]">Sep 07, 2026</span>
              </div>
              <p className="text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE] leading-relaxed font-normal">
                "Please verify if Bed Space 3 has been vacated and cleaned following the previous cohort graduation,
                prior to David Adeleke’s check-in."
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[#5A2D0C]/10 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Status: Context Provided in Room Commons
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('COMMUNICATION');
                    setCommChannel('COORDINATOR_DISPATCH');
                  }}
                  className="text-xs font-bold text-[#B77620] dark:text-[#E2AB5D] hover:underline cursor-pointer"
                >
                  Reply via Coordinator Dispatch →
                </button>
              </div>
            </div>
          </div>

          {/* Section: Authority Boundary Notice */}
          <div className="p-4 rounded-xl bg-[#FFF9EE] dark:bg-[#2F1707] border-2 border-[#C88D3A]/35 flex items-start gap-3 text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE]">
            <Lock className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Authority Boundary Invariant</span>
              Room Captains operate under delegated room-level authority. Captains verify physical occupancy and coordinate living guidelines; final admission decisions remain with the Accommodation Coordinator, and all financial reconciliation remains strictly with the Financial Admin.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROOM COMMONS */}
      {activeTab === 'COMMONS' && (
        <div className="space-y-5">
          {/* Active Assigned Fellows */}
          <div
            className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
              isDark
                ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
                : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/30 text-[#5A2D0C]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
                  Active Fellows Assigned to {captainScope.roomName} ({activeOccupants.length})
                </h2>
                <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] font-medium mt-0.5">
                  Official accommodation assignments for this room.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeOccupants.map((a, index) => {
                const m = membershipStore.getMemberById(a.memberId);
                const isCaptainOccupant = m?.id === member.id || m?.roles.includes('ROOM_CAPTAIN' as any);
                return (
                  <div
                    key={a.id}
                    id={`occupant-card-${a.id}`}
                    className={`p-4 sm:p-5 rounded-xl border-2 flex flex-col justify-between gap-3 ${
                      isDark
                        ? 'bg-[#2F1707] border-[#623416]'
                        : 'bg-white border-[#5A2D0C]/15 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif font-bold text-base sm:text-lg text-[#5A2D0C] dark:text-[#FFF9EE]">
                          {m?.displayName || 'Fellow'}
                        </span>
                        {isCaptainOccupant ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#5A2D0C] text-[#FFF9EE] border border-[#351A07]">
                            Room Captain
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                            Active Fellow
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898] mt-1">{m?.email}</div>
                      <div className="text-xs font-medium text-[#5A2D0C] dark:text-[#FFF9EE] mt-1.5">
                        Bed Space: #{index + 1} &bull; Period: {a.period}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#5A2D0C]/15 dark:border-white/15 flex items-center justify-between text-xs font-medium text-[#7A4B20] dark:text-[#D1B898]">
                      <span>Status: In Residence</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">H4D-Verified</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Notices & Guidelines */}
          <div
            className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
              isDark
                ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
                : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/30 text-[#5A2D0C]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
                  Room Notices &amp; Shared Guidelines ({notices.length})
                </h2>
                <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] font-medium mt-0.5">
                  Peer-agreed living space expectations, quiet periods, and sanitation schedules.
                </p>
              </div>

              <button
                type="button"
                id="btn-post-room-notice"
                onClick={() => setNoticeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5A2D0C] hover:bg-[#3E200C] text-[#FFF9EE] text-xs font-bold rounded-xl border-b-2 border-[#351A07] transition-all shadow-xs cursor-pointer active:translate-y-[1px] shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-[#C88D3A]" /> Post Notice
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  id={`room-notice-${n.id}`}
                  className={`p-4 sm:p-5 rounded-xl border-2 space-y-2 ${
                    isDark
                      ? 'bg-[#2F1707] border-[#623416]'
                      : 'bg-white border-[#5A2D0C]/15 shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-[#5A2D0C] dark:text-[#FFF9EE]">
                        {n.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A]/25 border border-[#C88D3A]/40 text-[#5A2D0C] dark:text-[#FFF9EE]">
                        {n.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898]">
                      {new Date(n.postedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE] leading-relaxed font-normal">{n.content}</p>
                  <div className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898] pt-1.5 border-t border-[#5A2D0C]/10 dark:border-white/10">
                    Posted by: {n.postedBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROOM COMMUNICATION */}
      {activeTab === 'COMMUNICATION' && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
            isDark
              ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
              : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/30 text-[#5A2D0C]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-[#5A2D0C]/15 dark:border-white/15">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
                Room-Scoped Communication Channels
              </h2>
              <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] font-medium mt-0.5">
                Targeted channels for roommates, coordinator dispatch, and welfare escalation.
              </p>
            </div>

            {/* Persistence Honesty Tag */}
            <div className="text-xs font-mono px-3 py-1 rounded-lg bg-white dark:bg-[#2F1707] border border-[#5A2D0C]/15 dark:border-[#623416] text-[#7A4B20] dark:text-[#D1B898]">
              Local session / browser persistence
            </div>
          </div>

          {/* Channel Selector */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              id="channel-room-members-btn"
              onClick={() => setCommChannel('ROOM_MEMBERS')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                commChannel === 'ROOM_MEMBERS'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] border-b-2 border-[#351A07] shadow-xs'
                  : 'bg-white dark:bg-[#2F1707] text-[#5A2D0C] dark:text-[#FFF9EE] border border-[#5A2D0C]/15 dark:border-[#623416] hover:bg-[#FFF9EE] dark:hover:bg-[#4B2710]'
              }`}
            >
              Room Members &bull; Internal Thread
            </button>

            <button
              type="button"
              id="channel-coordinator-dispatch-btn"
              onClick={() => setCommChannel('COORDINATOR_DISPATCH')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                commChannel === 'COORDINATOR_DISPATCH'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] border-b-2 border-[#351A07] shadow-xs'
                  : 'bg-white dark:bg-[#2F1707] text-[#5A2D0C] dark:text-[#FFF9EE] border border-[#5A2D0C]/15 dark:border-[#623416] hover:bg-[#FFF9EE] dark:hover:bg-[#4B2710]'
              }`}
            >
              Accommodation Coordinator Dispatch
            </button>

            <button
              type="button"
              id="channel-welfare-escalation-btn"
              onClick={() => setCommChannel('WELFARE_ESCALATION')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                commChannel === 'WELFARE_ESCALATION'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] border-b-2 border-[#351A07] shadow-xs'
                  : 'bg-white dark:bg-[#2F1707] text-[#5A2D0C] dark:text-[#FFF9EE] border border-[#5A2D0C]/15 dark:border-[#623416] hover:bg-[#FFF9EE] dark:hover:bg-[#4B2710]'
              }`}
            >
              Welfare &amp; Mediation Escalation
            </button>
          </div>

          {/* Privacy Notice for Welfare */}
          {commChannel === 'WELFARE_ESCALATION' && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/30 text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-medium">
              <strong className="font-bold">Privacy Protection:</strong> When escalating welfare concerns to the Accommodation Welfare &amp; Mediation Officer, provide only essential context. Confidential health, personal, or mediation records remain strictly protected.
            </div>
          )}

          {/* Message Thread */}
          <div
            id="captain-message-thread"
            className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl bg-white dark:bg-black/25 border-2 border-[#5A2D0C]/15 dark:border-[#623416]"
          >
            {channelMessages.length === 0 ? (
              <div className="text-center text-xs sm:text-sm font-medium text-[#7A4B20] dark:text-[#D1B898] py-8">
                No messages in this channel yet. Start a discussion below.
              </div>
            ) : (
              channelMessages.map((msg) => (
                <div
                  key={msg.id}
                  id={`room-msg-${msg.id}`}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm space-y-1 ${
                    msg.senderId === member.id
                      ? 'bg-[#FFF9EE] dark:bg-[#2F1707] border-2 border-[#C88D3A]/40 ml-4 shadow-xs'
                      : 'bg-[#F7F1E7] dark:bg-[#1E0E04] border border-[#5A2D0C]/20 dark:border-white/10 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE]">
                      {msg.senderName}
                    </span>
                    <span className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898]">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#7A4B20] dark:text-[#D1B898]">{msg.senderCapacity}</div>
                  <p className="text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE] leading-relaxed pt-0.5 font-normal">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              id="input-captain-room-msg"
              value={newCommMessage}
              onChange={(e) => setNewCommMessage(e.target.value)}
              placeholder={
                commChannel === 'ROOM_MEMBERS'
                  ? 'Message Room 304 occupants...'
                  : commChannel === 'COORDINATOR_DISPATCH'
                  ? 'Dispatch context note to Coordinator Zainab...'
                  : 'Escalate welfare inquiry to Welfare & Mediation Officer...'
              }
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#2F1707] border-2 border-[#5A2D0C]/20 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] placeholder:text-[#7A4B20]/60 dark:placeholder:text-[#D1B898]/60 focus:ring-2 focus:ring-[#C88D3A] focus:outline-none"
            />
            <button
              type="submit"
              id="btn-send-captain-room-msg"
              className="px-5 py-2.5 bg-[#5A2D0C] hover:bg-[#3E200C] text-[#FFF9EE] rounded-xl text-xs sm:text-sm font-bold border-b-2 border-[#351A07] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:translate-y-[1px]"
            >
              <Send className="w-3.5 h-3.5 text-[#C88D3A]" /> Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ROOM TRAIL */}
      {activeTab === 'TRAIL' && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
            isDark
              ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
              : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/30 text-[#5A2D0C]'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-[#5A2D0C]/15 dark:border-white/15">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
                Room Trail &bull; Append-Oriented Event Log ({trail.length})
              </h2>
              <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] font-medium mt-0.5">
                Immutable factual history of room inspections, occupancy confirmations, notices, and escalations.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">
              Append-Only History
            </span>
          </div>

          <div id="captain-room-trail-list" className="space-y-3">
            {trail.map((event) => (
              <div
                key={event.id}
                id={`room-trail-event-${event.id}`}
                className={`p-4 sm:p-5 rounded-xl border-2 flex items-start gap-3.5 transition-all ${
                  isDark
                    ? 'bg-[#2F1707] border-[#623416]'
                    : 'bg-white border-[#5A2D0C]/15 shadow-xs'
                }`}
              >
                <div className="mt-1 shrink-0">
                  {event.eventType.includes('CONFIRMED') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : event.eventType.includes('DELEGATED') ? (
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : event.eventType.includes('WELFARE') ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <Activity className="w-4 h-4 text-[#C88D3A]" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-sm sm:text-base text-[#5A2D0C] dark:text-[#FFF9EE]">
                      {event.title}
                    </span>
                    <span className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898]">
                      {new Date(event.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5A2D0C] dark:text-[#FFF9EE] leading-relaxed font-normal">{event.description}</p>
                  <div className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898] pt-1 border-t border-[#5A2D0C]/10 dark:border-white/10">
                    Actor: <span className="font-semibold">{event.actorName}</span> &bull; {event.actorCapacity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ROOM IMPROVEMENT: Missing Puzzle Section */}
      <div
        id="captain-room-improvement-section"
        className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
          isDark
            ? 'bg-[#3E200C] border-[#623416] text-[#FFF9EE]'
            : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/35 text-[#5A2D0C]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center gap-2">
              <Puzzle className="w-4 h-4 text-[#B77620] dark:text-[#E2AB5D]" />
              Room Improvement &bull; Community Puzzle Board
            </h2>
            <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] font-medium mt-0.5">
              Spotted a physical defect, missing appliance, or living space improvement needed in {captainScope.roomName}?
            </p>
          </div>

          <button
            type="button"
            id="btn-spot-room-puzzle-secondary"
            onClick={() => setIsPuzzleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5A2D0C] hover:bg-[#3E200C] text-[#FFF9EE] text-xs font-bold rounded-xl border-b-2 border-[#351A07] transition-all shadow-xs cursor-pointer active:translate-y-[1px] shrink-0"
          >
            <Puzzle className="w-4 h-4 text-[#C88D3A]" />
            <span>Spot a Room Puzzle</span>
          </button>
        </div>

        {/* Existing Room Reports */}
        {roomReports.length === 0 ? (
          <div className="p-6 rounded-xl bg-white dark:bg-[#2F1707] border border-[#5A2D0C]/15 dark:border-[#623416] text-center text-xs sm:text-sm font-medium text-[#7A4B20] dark:text-[#D1B898] shadow-2xs">
            No missing puzzles currently logged for {captainScope.roomName}. Log one above to initiate the technical lifecycle (Pending Review → Under Review → In Progress → Implemented).
          </div>
        ) : (
          <div className="space-y-2.5">
            {roomReports.map((report) => (
              <div
                key={report.id}
                id={`room-report-${report.id}`}
                className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#2F1707] border border-[#5A2D0C]/15 dark:border-[#623416] flex items-center justify-between text-xs sm:text-sm shadow-xs"
              >
                <div>
                  <div className="font-bold text-sm sm:text-base text-[#5A2D0C] dark:text-[#FFF9EE]">{report.title}</div>
                  <div className="text-xs font-mono text-[#7A4B20] dark:text-[#D1B898] mt-0.5">
                    Category: {report.category} &bull; Location: {report.locationContext || captainScope.roomName}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A]/25 border border-[#C88D3A]/40 text-[#5A2D0C] dark:text-[#FFF9EE]">
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Modal for Delegations */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F1707]/60 backdrop-blur-xs p-4">
          <div
            className={`border rounded-2xl shadow-xl max-w-md w-full p-6 transition-all ${
              isDark
                ? 'bg-[#2F1707] border-[#623416] text-[#FFF9EE]'
                : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/40 text-[#5A2D0C]'
            }`}
          >
            <h3 className="font-serif text-lg font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">Room Verification Note</h3>
            <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] mt-1 font-medium">
              Add observations regarding room occupancy to record into Room Trail and notify the Coordinator.
            </p>
            <div className="mt-4">
              <textarea
                id="captain-note-input"
                rows={3}
                value={captainNote}
                onChange={(e) => setCaptainNote(e.target.value)}
                placeholder="e.g. Fellow moved in today, confirmed bed space 2."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#1E0E04] border-2 border-[#5A2D0C]/20 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] rounded-xl focus:ring-2 focus:ring-[#C88D3A] focus:outline-none"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#7A4B20] dark:text-[#D1B898] hover:text-[#5A2D0C] dark:hover:text-[#FFF9EE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-save-captain-note"
                onClick={handleSaveNote}
                className="px-4 py-2 bg-[#5A2D0C] hover:bg-[#3E200C] text-[#FFF9EE] rounded-xl text-xs font-bold border-b-2 border-[#351A07] cursor-pointer active:translate-y-[1px]"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Room Notice Modal */}
      {noticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F1707]/60 backdrop-blur-xs p-4">
          <div
            className={`border rounded-2xl shadow-xl max-w-md w-full p-6 transition-all ${
              isDark
                ? 'bg-[#2F1707] border-[#623416] text-[#FFF9EE]'
                : 'bg-[#FFF9EE] border-2 border-[#C88D3A]/40 text-[#5A2D0C]'
            }`}
          >
            <h3 className="font-serif text-lg font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">
              Post Room Notice &bull; {captainScope.roomName}
            </h3>
            <p className="text-xs text-[#7A4B20] dark:text-[#D1B898] mt-1 font-medium">
              Announce a living space guideline, study hour schedule, or sanitation reminder to room fellows.
            </p>
            <form onSubmit={handlePostNotice} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  id="input-notice-title"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="e.g. Inverter Schedule or Quiet Hours"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#1E0E04] border-2 border-[#5A2D0C]/20 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] rounded-xl focus:ring-2 focus:ring-[#C88D3A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] mb-1">
                  Category
                </label>
                <select
                  id="select-notice-category"
                  value={newNoticeCategory}
                  onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#1E0E04] border-2 border-[#5A2D0C]/20 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] rounded-xl focus:ring-2 focus:ring-[#C88D3A] focus:outline-none"
                >
                  <option value="GUIDELINE">Guideline</option>
                  <option value="SCHEDULE">Schedule</option>
                  <option value="FACILITY">Facility</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] mb-1">
                  Content
                </label>
                <textarea
                  id="textarea-notice-content"
                  rows={3}
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="Details for room occupants..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#1E0E04] border-2 border-[#5A2D0C]/20 dark:border-[#623416] text-[#5A2D0C] dark:text-[#FFF9EE] rounded-xl focus:ring-2 focus:ring-[#C88D3A] focus:outline-none"
                  required
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNoticeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A4B20] dark:text-[#D1B898] hover:text-[#5A2D0C] dark:hover:text-[#FFF9EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-room-notice"
                  className="px-4 py-2 bg-[#5A2D0C] hover:bg-[#3E200C] text-[#FFF9EE] rounded-xl text-xs font-bold border-b-2 border-[#351A07] cursor-pointer active:translate-y-[1px]"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spot a Room Puzzle Modal */}
      {isPuzzleModalOpen && (
        <MissingPuzzleModal
          isOpen={isPuzzleModalOpen}
          onClose={() => setIsPuzzleModalOpen(false)}
          currentMember={member}
          isDark={isDark}
          defaultLocation={`${captainScope.propertyName} · ${captainScope.roomName}`}
        />
      )}
    </div>
  );
};
