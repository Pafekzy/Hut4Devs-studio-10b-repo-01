import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import {
  AccommodationMembershipRequest,
  ActiveMode,
  formatActionAttribution,
} from '../domain/membership';
import { CampusRoom, CandidateAssignment } from '../domain/roomOperations';
import { membershipStore } from '../services/membershipStore';
import { roomOperationsStore } from '../services/roomOperationsStore';
import { puzzleFeedbackStore } from '../services/puzzleFeedbackStore';
import { CommunityFeedbackTriageView } from './CommunityFeedbackTriageView';
import { RoomOverview } from './room/RoomOverview';
import { RoomActions } from './room/RoomActions';
import { RoomCommons } from './room/RoomCommons';
import { RoomCommunication } from './room/RoomCommunication';
import { RoomTrail } from './room/RoomTrail';
import { SharedRoomWorkspace } from './room/SharedRoomWorkspace';
import { DelegateCandidateChoiceModal } from './room/DelegateCandidateChoiceModal';
import { AssignCandidateModal } from './room/AssignCandidateModal';
import {
  Building2,
  Bed,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  UserCheck,
  ChevronRight,
  Puzzle,
  Share2,
  ExternalLink,
  MessageSquare,
  History,
} from 'lucide-react';

interface CoordinatorWorkspaceViewProps {
  member: Member;
  activeMode: ActiveMode;
  isDark?: boolean;
}

type MainTab = 'ROOM_OPERATIONS' | 'PENDING_ASSIGNMENTS' | 'MEMBERSHIP_REQUESTS' | 'FEEDBACK_TRIAGE';
type SharedRoomSubTab = 'OVERVIEW' | 'ACTIONS' | 'COMMONS' | 'COMMUNICATION' | 'TRAIL';

export const CoordinatorWorkspaceView: React.FC<CoordinatorWorkspaceViewProps> = ({
  member,
  activeMode,
  isDark = false,
}) => {
  const [, setTick] = useState(0);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('ROOM_OPERATIONS');

  // Campus Rooms & Selected Room state
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomSubTab, setRoomSubTab] = useState<SharedRoomSubTab>('OVERVIEW');
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Candidate Assignment state (13 Candidates Fixture)
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState<string>('ALL');
  const [candidateTrackFilter, setCandidateTrackFilter] = useState<string>('ALL');

  // Modals
  const [delegateModalData, setDelegateModalData] = useState<{ room: CampusRoom; bedId: string } | null>(null);
  const [assignModalData, setAssignModalData] = useState<{ room: CampusRoom; bedId: string } | null>(null);

  // Membership Requests state (Legacy workflows preserved)
  const [membershipTab, setMembershipTab] = useState<'NEEDS_REVIEW' | 'DELEGATED' | 'CLARIFICATION' | 'APPROVED'>('NEEDS_REVIEW');
  const [selectedRequest, setSelectedRequest] = useState<AccommodationMembershipRequest | null>(null);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [clarificationNote, setClarificationNote] = useState('');
  const [delegateVerifModalOpen, setDelegateVerifModalOpen] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState('');

  // Subscriptions
  useEffect(() => {
    const unsub1 = membershipStore.subscribe(() => setTick((t) => t + 1));
    const unsub2 = roomOperationsStore.subscribe(() => setTick((t) => t + 1));
    const unsub3 = puzzleFeedbackStore.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const attribution = formatActionAttribution(member, activeMode);
  const rooms = roomOperationsStore.getRooms();
  const candidates = roomOperationsStore.getCandidates();
  const requests = membershipStore.getRequests();
  const properties = membershipStore.getProperties();
  const openFeedbackCount = puzzleFeedbackStore.getReports().filter((r) => r.status === 'OPEN').length;

  const roomCaptains = membershipStore
    .getMembers()
    .filter((m) => m.roles.includes('ROOM_CAPTAIN' as any));

  // Pulse Metrics Calculations
  const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
  const totalVacant = rooms.reduce((sum, r) => sum + (r.totalBeds - r.occupiedBeds), 0);
  const roomsRequiringAttention = rooms.filter((r) => r.status === 'ATTENTION_REQUIRED').length;
  const pendingCandidatesCount = candidates.filter((c) => c.status === 'PENDING_ASSIGNMENT').length;

  // Filtered Rooms
  const filteredRooms = rooms.filter((r) => {
    if (propertyFilter !== 'ALL' && r.propertyId !== propertyFilter) return false;
    if (statusFilter === 'ATTENTION' && r.status !== 'ATTENTION_REQUIRED') return false;
    if (statusFilter === 'VACANT' && r.occupiedBeds === r.totalBeds) return false;
    if (statusFilter === 'FULL' && r.occupiedBeds < r.totalBeds) return false;
    return true;
  });

  // Filtered Candidates (13 Fixture Candidates)
  const filteredCandidates = candidates.filter((c) => {
    if (candidateStatusFilter !== 'ALL' && c.status !== candidateStatusFilter) return false;
    if (candidateTrackFilter !== 'ALL' && !c.track.toLowerCase().includes(candidateTrackFilter.toLowerCase()))
      return false;
    if (candidateSearch.trim()) {
      const q = candidateSearch.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.track.toLowerCase().includes(q) ||
        c.admissionNumber.toLowerCase().includes(q) ||
        c.preferredPropertyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedRoom = selectedRoomId ? roomOperationsStore.getRoomById(selectedRoomId) : null;

  // Legacy Request Filters
  const needsReviewRequests = requests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'TRANSFER_RECOGNIZED' || r.status === 'UNDER_REVIEW'
  );
  const delegatedRequests = requests.filter((r) => r.status === 'DELEGATED');
  const clarificationRequests = requests.filter((r) => r.status === 'NEEDS_CLARIFICATION');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');

  const handleApprove = (req: AccommodationMembershipRequest) => {
    membershipStore.approveMembershipRequest({
      requestId: req.id,
      reviewedBy: attribution.displayLabel,
    });
  };

  const handleOpenClarification = (req: AccommodationMembershipRequest) => {
    setSelectedRequest(req);
    setClarificationNote('Please confirm cohort admission number and bed assignment with coordinator.');
    setClarificationModalOpen(true);
  };

  const handleSubmitClarification = () => {
    if (!selectedRequest || !clarificationNote.trim()) return;
    membershipStore.requestClarification({
      requestId: selectedRequest.id,
      note: clarificationNote.trim(),
      reviewedBy: attribution.displayLabel,
    });
    setClarificationModalOpen(false);
    setSelectedRequest(null);
  };

  const handleOpenDelegateVerif = (req: AccommodationMembershipRequest) => {
    setSelectedRequest(req);
    setSelectedCaptainId(roomCaptains[0]?.id || '');
    setDelegateVerifModalOpen(true);
  };

  const handleSubmitDelegateVerif = () => {
    if (!selectedRequest || !selectedCaptainId) return;
    membershipStore.delegateRoomVerification({
      requestId: selectedRequest.id,
      delegatedBy: attribution.displayLabel,
      captainMemberId: selectedCaptainId,
    });
    setDelegateVerifModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div
      id="coordinator-workspace-view"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      {/* 1. Header & Coordinator Authority Attribution */}
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
              Lagos Yaba Campus &bull; Operational Headquarters
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700">
              Campus-Wide Scope
            </span>
          </div>

          <h1
            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            Accommodation Operations &amp; Room Coverage
          </h1>

          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: isDark ? '#D9C4AC' : '#704728' }}
          >
            Managing {rooms.length} campus rooms, delegated Room Captain assignments, and prospective fellow admissions.
          </p>
        </div>

        {/* Attributed Coordinator Card */}
        <div
          className="p-3 rounded-xl border-2 border-b-3 text-xs flex items-center gap-3 shadow-xs self-start md:self-auto"
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
      </header>

      {/* 2. Top-Level Main Navigation Tabs */}
      <nav
        aria-label="Coordinator Operational Views"
        className="flex flex-wrap gap-2 border-b pb-2"
        style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
      >
        <button
          type="button"
          id="tab-campus-rooms"
          onClick={() => {
            setActiveMainTab('ROOM_OPERATIONS');
            setSelectedRoomId(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-2 active:translate-y-[1px] ${
            activeMainTab === 'ROOM_OPERATIONS'
              ? isDark
                ? 'bg-[#C88D3A] text-[#241104] border-[#915B15] shadow-xs'
                : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
              : isDark
              ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)] hover:border-[rgba(200,141,58,0.4)]'
              : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)] hover:border-[rgba(90,45,12,0.3)]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Campus Rooms &amp; Coverage ({rooms.length})</span>
          {roomsRequiringAttention > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold">
              {roomsRequiringAttention}
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-pending-assignments"
          onClick={() => {
            setActiveMainTab('PENDING_ASSIGNMENTS');
            setSelectedRoomId(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-2 active:translate-y-[1px] ${
            activeMainTab === 'PENDING_ASSIGNMENTS'
              ? isDark
                ? 'bg-[#C88D3A] text-[#241104] border-[#915B15] shadow-xs'
                : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
              : isDark
              ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)] hover:border-[rgba(200,141,58,0.4)]'
              : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)] hover:border-[rgba(90,45,12,0.3)]'
          }`}
        >
          <Bed className="w-3.5 h-3.5" />
          <span>Pending Assignments (13 Candidates)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-600 text-white font-bold">
            13
          </span>
        </button>

        <button
          type="button"
          id="tab-membership-requests"
          onClick={() => {
            setActiveMainTab('MEMBERSHIP_REQUESTS');
            setSelectedRoomId(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-2 active:translate-y-[1px] ${
            activeMainTab === 'MEMBERSHIP_REQUESTS'
              ? isDark
                ? 'bg-[#C88D3A] text-[#241104] border-[#915B15] shadow-xs'
                : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
              : isDark
              ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)] hover:border-[rgba(200,141,58,0.4)]'
              : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)] hover:border-[rgba(90,45,12,0.3)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Membership Admissions ({requests.length})</span>
          {needsReviewRequests.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold">
              {needsReviewRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-feedback-triage"
          onClick={() => {
            setActiveMainTab('FEEDBACK_TRIAGE');
            setSelectedRoomId(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center gap-2 active:translate-y-[1px] ${
            activeMainTab === 'FEEDBACK_TRIAGE'
              ? isDark
                ? 'bg-[#C88D3A] text-[#241104] border-[#915B15] shadow-xs'
                : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
              : isDark
              ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)] hover:border-[rgba(200,141,58,0.4)]'
              : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)] hover:border-[rgba(90,45,12,0.3)]'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5" />
          <span>Community Missing Puzzles</span>
          {openFeedbackCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-bold">
              {openFeedbackCount}
            </span>
          )}
        </button>
      </nav>

      {/* 3. MAIN TAB CONTENT */}

      {/* TAB 1: CAMPUS ROOM OPERATIONS / ROOM CAPTAIN COVERAGE */}
      {activeMainTab === 'ROOM_OPERATIONS' && (
        <div className="space-y-6">
          {/* If a room is selected -> Show the Shared Room View */}
          {selectedRoom ? (
            <SharedRoomWorkspace
              room={selectedRoom}
              viewerRole="COORDINATOR"
              currentMember={member}
              isDark={isDark}
              onBack={() => setSelectedRoomId(null)}
              onOpenDelegateChoice={(bedId) => setDelegateModalData({ room: selectedRoom, bedId })}
              onOpenDirectAssign={(bedId) => setAssignModalData({ room: selectedRoom, bedId })}
            />
          ) : (
            /* Campus Rooms Grid & Overview */
            <div className="space-y-6">
              {/* Pulse Metrics Cards (Tactile 3D Hover & Press) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                <div
                  className="p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#B77620] dark:text-[#C88D3A]">
                      Rooms
                    </span>
                    <Building2 className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
                  </div>
                  <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    {rooms.length}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                    Across 4 properties
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#B77620] dark:text-[#C88D3A]">
                      Total Beds
                    </span>
                    <Bed className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
                  </div>
                  <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    {totalBeds}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                    Campus capacity
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-400">
                      Occupied
                    </span>
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-emerald-700 dark:text-emerald-400">
                    {totalOccupied}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                    Active residents
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#B77620] dark:text-[#C88D3A]">
                      Vacancies
                    </span>
                    <Bed className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
                  </div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-[#B77620] dark:text-[#C88D3A]">
                    {totalVacant}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                    Available spaces
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 shadow-md backdrop-blur-md ${
                    roomsRequiringAttention > 0 ? 'ring-2 ring-amber-500/30' : ''
                  }`}
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">
                      Attention
                    </span>
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-amber-700 dark:text-amber-400">
                    {roomsRequiringAttention}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                    Delegation in flight
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div
                className="p-4 rounded-2xl border-2 border-b-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md backdrop-blur-md"
                style={{
                  backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B77620] dark:text-[#C88D3A]">
                    Property:
                  </span>
                  <select
                    id="filter-room-property"
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                    className="text-xs p-2 rounded-lg border-2 border-b-3"
                    style={{
                      backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                      color: isDark ? '#FFF9EE' : '#5A2D0C',
                    }}
                  >
                    <option value="ALL">All Properties ({properties.length})</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B77620] dark:text-[#C88D3A] mr-1">
                    Status:
                  </span>
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'ATTENTION', label: 'Attention Required' },
                    { id: 'VACANT', label: 'Has Vacancies' },
                    { id: 'FULL', label: 'Fully Occupied' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      id={`btn-filter-status-${st.id.toLowerCase()}`}
                      onClick={() => setStatusFilter(st.id)}
                      className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold rounded-lg border-2 transition-all cursor-pointer ${
                        statusFilter === st.id
                          ? isDark
                            ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                            : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                          : isDark
                          ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)]'
                          : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map((r) => {
                  const vacancies = r.totalBeds - r.occupiedBeds;
                  const isAttention = r.status === 'ATTENTION_REQUIRED';

                  return (
                    <div
                      key={r.id}
                      id={`room-card-${r.id}`}
                      onClick={() => {
                        setSelectedRoomId(r.id);
                        setRoomSubTab('OVERVIEW');
                      }}
                      className="p-5 rounded-2xl border-2 border-b-4 transition-all duration-200 cursor-pointer shadow-md backdrop-blur-md hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
                      style={{
                        backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                        borderColor: isAttention
                          ? (isDark ? '#EAB308' : '#D97706')
                          : isDark
                          ? 'rgba(200, 141, 58, 0.35)'
                          : 'rgba(90, 45, 12, 0.25)',
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border border-[#B77620]/30 text-[#B77620] dark:text-[#C88D3A]">
                            {r.propertyName}
                          </span>

                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                              isAttention
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 animate-pulse'
                                : r.status === 'FULL'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                                : 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700'
                            }`}
                          >
                            {isAttention ? 'Action Required' : r.status === 'FULL' ? 'Full' : `${vacancies} Vacant`}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1">
                          <h3
                            className="font-serif font-bold text-lg"
                            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                          >
                            {r.roomNumber}
                          </h3>
                          <span
                            className="text-xs font-mono font-bold"
                            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                          >
                            {r.occupiedBeds} / {r.totalBeds} Bunks
                          </span>
                        </div>

                        <div
                          className="text-xs mt-1"
                          style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                        >
                          Floor: {r.floorName} &bull; Captain: <strong>{r.captainName || 'Unassigned'}</strong>
                        </div>

                        {/* Occupancy Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 mt-3 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#B77620] dark:bg-[#C88D3A] transition-all"
                            style={{ width: `${(r.occupiedBeds / r.totalBeds) * 100}%` }}
                          />
                        </div>

                        {/* Attention reason callout */}
                        {isAttention && r.attentionReason && (
                          <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{r.attentionReason}</span>
                          </div>
                        )}
                      </div>

                      <div
                        className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold text-[#B77620] dark:text-[#C88D3A]"
                        style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.10)' }}
                      >
                        <span>Open Room Management</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING ASSIGNMENTS (13 DEMO CANDIDATES) */}
      {activeMainTab === 'PENDING_ASSIGNMENTS' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <section
            aria-labelledby="pending-candidates-heading"
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
                    id="pending-candidates-heading"
                    className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                    style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                  >
                    Campus Pending Assignments &bull; 13 Demo Candidates
                  </h2>
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                >
                  Accredited fellow admissions awaiting bed space allocation or delegated Room Captain choice.
                </p>
              </div>

              <span
                className="text-[10px] font-mono uppercase px-2.5 py-1 rounded font-semibold border self-start sm:self-auto"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
                  color: isDark ? '#C88D3A' : '#B77620',
                }}
              >
                13 Candidates Total
              </span>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="relative md:col-span-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  id="search-candidates"
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Search by name, track, or ID..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border-2 border-b-3"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B77620] dark:text-[#C88D3A]">
                  Status:
                </span>
                <select
                  id="filter-candidate-status"
                  value={candidateStatusFilter}
                  onChange={(e) => setCandidateStatusFilter(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border-2 border-b-3"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                >
                  <option value="ALL">All Statuses (13)</option>
                  <option value="PENDING_ASSIGNMENT">Pending Assignment</option>
                  <option value="DELEGATED_TO_CAPTAIN">Delegated to Captain</option>
                  <option value="ASSIGNED">Assigned</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B77620] dark:text-[#C88D3A]">
                  Track:
                </span>
                <select
                  id="filter-candidate-track"
                  value={candidateTrackFilter}
                  onChange={(e) => setCandidateTrackFilter(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border-2 border-b-3"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                >
                  <option value="ALL">All Tracks</option>
                  <option value="Frontend">Frontend Engineering</option>
                  <option value="Backend">Backend &amp; Systems</option>
                  <option value="AI">AI &amp; Machine Learning</option>
                  <option value="Mobile">Mobile Applications</option>
                  <option value="Security">Security &amp; Cryptography</option>
                  <option value="Data">Data Engineering</option>
                </select>
              </div>
            </div>

            {/* Candidates List (The 13 Fixture Candidates) */}
            <div className="space-y-4">
              {filteredCandidates.map((cand, idx) => {
                const isDelegated = cand.status === 'DELEGATED_TO_CAPTAIN';
                const isAssigned = cand.status === 'ASSIGNED';
                const isPending = cand.status === 'PENDING_ASSIGNMENT';

                return (
                  <div
                    key={cand.id}
                    id={`candidate-row-${cand.id}`}
                    className="p-5 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                      borderColor: isDelegated
                        ? (isDark ? '#9333EA' : '#7E22CE')
                        : isAssigned
                        ? (isDark ? '#10B981' : '#059669')
                        : (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)'),
                    }}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#B77620] dark:text-[#C88D3A]">
                          #{idx + 1}
                        </span>
                        <h3
                          className="font-serif font-bold text-base"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {cand.fullName}
                        </h3>

                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                            isAssigned
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : isDelegated
                              ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 animate-pulse'
                              : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                          }`}
                        >
                          {isAssigned ? 'Assigned' : isDelegated ? 'Delegated to Captain' : 'Pending Assignment'}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400">
                          {cand.admissionNumber}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-[#B77620] dark:text-[#C88D3A]">
                        {cand.track} &bull; {cand.cohort}
                      </div>

                      <p
                        className="text-xs leading-relaxed max-w-2xl"
                        style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                      >
                        {cand.candidateBio}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-stone-500 dark:text-stone-400 pt-1">
                        <span>Prefers: <strong>{cand.preferredPropertyName}</strong> ({cand.preferredRoomName || 'Any'})</span>
                        <span>&bull;</span>
                        <span>GitHub: @{cand.githubHandle}</span>
                        <span>&bull;</span>
                        <span>{cand.phone}</span>
                      </div>

                      {/* State attribution detail */}
                      {isDelegated && (
                        <div className="text-[11px] font-mono text-purple-700 dark:text-purple-300 pt-1">
                          Delegated to Room Captain {cand.delegatedToCaptainName} for {cand.delegatedToRoomName} evaluation.
                        </div>
                      )}

                      {isAssigned && (
                        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 pt-1">
                          Assigned to {cand.assignedRoomName} ({cand.assignedBedLabel}) by {cand.assignedBy}.
                        </div>
                      )}
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex flex-row md:flex-col items-stretch gap-2 shrink-0">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            id={`btn-delegate-from-list-${cand.id}`}
                            onClick={() => {
                              // Find matching room or default to room-304
                              const targetRoom =
                                rooms.find((r) => r.propertyId === cand.preferredPropertyId && r.occupiedBeds < r.totalBeds) ||
                                rooms.find((r) => r.id === 'room-304') ||
                                rooms[0];
                              const vacantBed = targetRoom.beds.find((b) => b.status === 'VACANT') || targetRoom.beds[0];
                              setDelegateModalData({ room: targetRoom, bedId: vacantBed.id });
                            }}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 active:translate-y-[1px] ${
                              isDark
                                ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                                : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Delegate Choice</span>
                          </button>

                          <button
                            type="button"
                            id={`btn-assign-direct-from-list-${cand.id}`}
                            onClick={() => {
                              const targetRoom =
                                rooms.find((r) => r.propertyId === cand.preferredPropertyId && r.occupiedBeds < r.totalBeds) ||
                                rooms[0];
                              const vacantBed = targetRoom.beds.find((b) => b.status === 'VACANT') || targetRoom.beds[0];
                              setAssignModalData({ room: targetRoom, bedId: vacantBed.id });
                            }}
                            className="px-4 py-2 text-xs font-medium rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer active:translate-y-[1px] text-center"
                            style={{
                              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                              borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                              color: isDark ? '#FFF9EE' : '#5A2D0C',
                            }}
                          >
                            Assign Directly
                          </button>
                        </>
                      )}

                      {isDelegated && (
                        <button
                          type="button"
                          onClick={() => {
                            const rId = cand.delegatedToRoomId || 'room-304';
                            setSelectedRoomId(rId);
                            setRoomSubTab('ACTIONS');
                            setActiveMainTab('ROOM_OPERATIONS');
                          }}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-950/60 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>View in Room Actions</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: MEMBERSHIP ADMISSIONS (Legacy Workflows Preserved & Elevated) */}
      {activeMainTab === 'MEMBERSHIP_REQUESTS' && (
        <div className="space-y-6">
          <section
            aria-labelledby="membership-admissions-heading"
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
                  <FileText className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
                  <h2
                    id="membership-admissions-heading"
                    className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                    style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                  >
                    Accommodation Membership Admissions
                  </h2>
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                >
                  Admissions verification and room-level verification delegations.
                </p>
              </div>

              {/* Sub-Tabs for Requests */}
              <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
                {[
                  { id: 'NEEDS_REVIEW', label: `Needs Review (${needsReviewRequests.length})` },
                  { id: 'DELEGATED', label: `Delegated (${delegatedRequests.length})` },
                  { id: 'CLARIFICATION', label: `Clarification (${clarificationRequests.length})` },
                  { id: 'APPROVED', label: `Approved (${approvedRequests.length})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    id={`btn-subtab-req-${st.id.toLowerCase()}`}
                    onClick={() => setMembershipTab(st.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                      membershipTab === st.id
                        ? isDark
                          ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                          : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                        : isDark
                        ? 'bg-[rgba(30,27,24,0.5)] text-[#D9C4AC] border-[rgba(200,141,58,0.2)]'
                        : 'bg-[rgba(255,253,248,0.7)] text-[#704728] border-[rgba(90,45,12,0.15)]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {(membershipTab === 'NEEDS_REVIEW'
                ? needsReviewRequests
                : membershipTab === 'DELEGATED'
                ? delegatedRequests
                : membershipTab === 'CLARIFICATION'
                ? clarificationRequests
                : approvedRequests
              ).map((req) => (
                <div
                  key={req.id}
                  id={`req-card-${req.id}`}
                  className="p-5 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-serif font-bold text-sm sm:text-base"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {req.fullName}
                      </h3>
                      {req.isExistingFellowRecognized && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300">
                          Recognized Fellow ({req.h4dMemberId})
                        </span>
                      )}
                    </div>

                    <div className="text-xs" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                      {req.programCommunity} &bull; {req.email} &bull; {req.phone}
                    </div>

                    <div className="text-xs font-medium text-[#B77620] dark:text-[#C88D3A]">
                      Target: {req.propertyName} &bull; {req.roomName} &bull; ₦{req.monthlyCommitment.toLocaleString()}/mo
                    </div>

                    {req.clarificationNote && (
                      <div className="mt-2 text-xs p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                        Clarification: {req.clarificationNote}
                      </div>
                    )}
                  </div>

                  {/* Actions for request */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {req.status !== 'APPROVED' && (
                      <>
                        <button
                          type="button"
                          id={`btn-approve-${req.id}`}
                          onClick={() => handleApprove(req)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer active:translate-y-[1px] ${
                            isDark
                              ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                              : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                          }`}
                        >
                          Approve Admission
                        </button>

                        <button
                          type="button"
                          id={`btn-delegate-verif-${req.id}`}
                          onClick={() => handleOpenDelegateVerif(req)}
                          className="px-3.5 py-1.5 text-xs font-medium rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer active:translate-y-[1px]"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                            color: isDark ? '#FFF9EE' : '#5A2D0C',
                          }}
                        >
                          Delegate Verification
                        </button>

                        <button
                          type="button"
                          id={`btn-clarify-${req.id}`}
                          onClick={() => handleOpenClarification(req)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer active:translate-y-[1px]"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                            color: isDark ? '#FFF9EE' : '#5A2D0C',
                          }}
                        >
                          Clarify
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: COMMUNITY FEEDBACK TRIAGE */}
      {activeMainTab === 'FEEDBACK_TRIAGE' && (
        <CommunityFeedbackTriageView
          currentMember={member}
          activeMode={activeMode}
          attribution={attribution}
          isDark={isDark}
        />
      )}

      {/* MODALS */}

      {/* 1. Delegate Candidate Choice Modal */}
      {delegateModalData && (
        <DelegateCandidateChoiceModal
          room={delegateModalData.room}
          bedId={delegateModalData.bedId}
          isDark={isDark}
          coordinatorAttribution={attribution.displayLabel}
          onClose={() => setDelegateModalData(null)}
          onSuccess={() => {
            setDelegateModalData(null);
            // If viewing this room, refresh sub-tab to ACTIONS
            if (selectedRoomId === delegateModalData.room.id) {
              setRoomSubTab('ACTIONS');
            }
          }}
        />
      )}

      {/* 2. Assign Candidate Directly Modal */}
      {assignModalData && (
        <AssignCandidateModal
          room={assignModalData.room}
          bedId={assignModalData.bedId}
          isDark={isDark}
          coordinatorAttribution={attribution.displayLabel}
          onClose={() => setAssignModalData(null)}
          onSuccess={() => setAssignModalData(null)}
        />
      )}

      {/* 3. Clarification Modal */}
      {clarificationModalOpen && selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            className="w-full max-w-lg rounded-2xl border-2 border-b-4 shadow-2xl p-6 transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(23, 21, 19, 0.95)' : 'rgba(255, 253, 248, 0.95)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.40)' : 'rgba(90, 45, 12, 0.30)',
            }}
          >
            <h3
              className="font-serif font-bold text-lg mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Request Clarification from {selectedRequest.fullName}
            </h3>
            <textarea
              rows={3}
              value={clarificationNote}
              onChange={(e) => setClarificationNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border-2 border-b-3 mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClarificationModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border-2 border-b-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitClarification}
                className={`px-4 py-2 text-xs font-bold rounded-lg border-2 border-b-3 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                }`}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delegate Verification Modal */}
      {delegateVerifModalOpen && selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            className="w-full max-w-lg rounded-2xl border-2 border-b-4 shadow-2xl p-6 transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(23, 21, 19, 0.95)' : 'rgba(255, 253, 248, 0.95)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.40)' : 'rgba(90, 45, 12, 0.30)',
            }}
          >
            <h3
              className="font-serif font-bold text-lg mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Delegate In-Person Verification: {selectedRequest.roomName}
            </h3>
            <p className="text-xs mb-3" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
              Assign verification of {selectedRequest.fullName} to the designated Room Captain.
            </p>
            <select
              value={selectedCaptainId}
              onChange={(e) => setSelectedCaptainId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border-2 border-b-3 mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              {roomCaptains.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} (Room Captain)
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDelegateVerifModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border-2 border-b-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDelegateVerif}
                className={`px-4 py-2 text-xs font-bold rounded-lg border-2 border-b-3 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                }`}
              >
                Confirm Delegation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
