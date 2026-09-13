import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import {
  AccommodationMembershipRequest,
  ActiveMode,
  formatActionAttribution,
} from '../domain/membership';
import { membershipStore } from '../services/membershipStore';
import { puzzleFeedbackStore } from '../services/puzzleFeedbackStore';
import { CommunityFeedbackTriageView } from './CommunityFeedbackTriageView';
import {
  Users,
  Check,
  HelpCircle,
  Share2,
  Clock,
  Building,
  UserCheck,
  AlertCircle,
  FileText,
  Puzzle,
} from 'lucide-react';

interface CoordinatorWorkspaceViewProps {
  member: Member;
  activeMode: ActiveMode;
  isDark?: boolean;
}

export const CoordinatorWorkspaceView: React.FC<CoordinatorWorkspaceViewProps> = ({
  member,
  activeMode,
  isDark = false,
}) => {
  const [, setTick] = useState(0);
  const [workspaceDomain, setWorkspaceDomain] = useState<'RESIDENCY' | 'FEEDBACK_TRIAGE'>('RESIDENCY');
  const [feedbackCount, setFeedbackCount] = useState(puzzleFeedbackStore.getReports().length);
  const [openFeedbackCount, setOpenFeedbackCount] = useState(
    puzzleFeedbackStore.getReports().filter((r) => r.status === 'OPEN').length
  );

  useEffect(() => {
    const unsubMembership = membershipStore.subscribe(() => setTick((t) => t + 1));
    const unsubFeedback = puzzleFeedbackStore.subscribe(() => {
      const all = puzzleFeedbackStore.getReports();
      setFeedbackCount(all.length);
      setOpenFeedbackCount(all.filter((r) => r.status === 'OPEN').length);
    });
    return () => {
      unsubMembership();
      unsubFeedback();
    };
  }, []);

  const attribution = formatActionAttribution(member, activeMode);
  const requests = membershipStore.getRequests();
  const properties = membershipStore.getProperties();
  const roomCaptains = membershipStore
    .getMembers()
    .filter((m) => m.roles.includes('ROOM_CAPTAIN' as any));

  // Modals & action states
  const [selectedRequest, setSelectedRequest] = useState<AccommodationMembershipRequest | null>(null);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [clarificationNote, setClarificationNote] = useState('');
  const [delegateModalOpen, setDelegateModalOpen] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState(roomCaptains[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'NEEDS_REVIEW' | 'DELEGATED' | 'CLARIFICATION' | 'APPROVED'>('NEEDS_REVIEW');

  // Filtered requests
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

  const handleOpenDelegate = (req: AccommodationMembershipRequest) => {
    setSelectedRequest(req);
    setDelegateModalOpen(true);
  };

  const handleSubmitDelegate = () => {
    if (!selectedRequest || !selectedCaptainId) return;
    membershipStore.delegateRoomVerification({
      requestId: selectedRequest.id,
      delegatedBy: attribution.actingCapacity,
      captainMemberId: selectedCaptainId,
    });
    setDelegateModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div id="coordinator-workspace" className="space-y-6">
      {/* Coordinator Domain Switcher (Tactile 3D tabs) */}
      <div className="flex items-center gap-2 border-b border-[#C88D3A]/20 pb-3">
        <button
          type="button"
          id="coordinator-domain-residency-btn"
          onClick={() => setWorkspaceDomain('RESIDENCY')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            workspaceDomain === 'RESIDENCY'
              ? 'bg-[#5A2D0C] text-white shadow-md'
              : 'bg-white/80 dark:bg-[#2F1707] text-[#5A2D0C] dark:text-[#FFF9EE] hover:bg-[#F7F1E7] border border-[#5A2D0C]/10'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-[#C88D3A]" />
          <span>Residency &amp; Room Scoping</span>
          {needsReviewRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {needsReviewRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          id="coordinator-domain-triage-btn"
          onClick={() => setWorkspaceDomain('FEEDBACK_TRIAGE')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            workspaceDomain === 'FEEDBACK_TRIAGE'
              ? 'bg-[#5A2D0C] text-white shadow-md'
              : 'bg-white/80 dark:bg-[#2F1707] text-[#5A2D0C] dark:text-[#FFF9EE] hover:bg-[#F7F1E7] border border-[#5A2D0C]/10'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5 text-[#C88D3A]" />
          <span>Missing Puzzle Triage</span>
          {openFeedbackCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C88D3A] text-white font-bold animate-pulse">
              {openFeedbackCount} new
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#5A2D0C]/20 text-[#5A2D0C] dark:text-[#FFF9EE]">
              {feedbackCount}
            </span>
          )}
        </button>
      </div>

      {workspaceDomain === 'FEEDBACK_TRIAGE' ? (
        <CommunityFeedbackTriageView
          currentMember={member}
          activeMode={activeMode}
          attribution={attribution}
          isDark={isDark}
        />
      ) : (
        <>
          {/* Workspace Header */}
          <div className="bg-[#FFF9EE] border border-[#C88D3A]/30 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#C88D3A]/20 text-[#5A2D0C]">
                    L2E Accommodation Fellows Coordination
                  </span>
                  {activeMode === 'CAPTAIN_COVERAGE' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900">
                      Exercising Room Captain Coverage
                    </span>
                  )}
                  {activeMode === 'FINANCIAL_COVERAGE' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-900">
                      Exercising Financial Admin Coverage
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#5A2D0C] mt-1.5">
                  Membership Approval &amp; Accommodation Scoping
                </h1>
                <p className="text-xs text-[#5A2D0C]/70 mt-1">
                  Authoritative review of applicant identities, room allocations, captain delegations, and transfers.
                </p>
              </div>

              <div className="text-right text-xs bg-[#F7F1E7] border border-[#5A2D0C]/10 rounded-xl px-4 py-2.5">
                <span className="text-[#5A2D0C]/60 block text-[10px] uppercase font-semibold">Active Reviewer</span>
                <span className="font-bold text-[#5A2D0C]">{attribution.displayLabel}</span>
              </div>
            </div>

            {/* Attention KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div
                onClick={() => setActiveTab('NEEDS_REVIEW')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeTab === 'NEEDS_REVIEW'
                    ? 'bg-[#F7F1E7] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                    : 'bg-white border-[#5A2D0C]/10 hover:border-[#C88D3A]/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-[#5A2D0C]/70 uppercase">Needs Review</div>
                <div className="text-2xl font-serif font-bold text-[#B77620] mt-1">
                  {needsReviewRequests.length}
                </div>
                <div className="text-[10px] text-[#5A2D0C]/60 mt-0.5">Awaiting Coordinator decision</div>
              </div>

              <div
                onClick={() => setActiveTab('DELEGATED')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeTab === 'DELEGATED'
                    ? 'bg-[#F7F1E7] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                    : 'bg-white border-[#5A2D0C]/10 hover:border-[#C88D3A]/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-[#5A2D0C]/70 uppercase">Delegated to Captains</div>
                <div className="text-2xl font-serif font-bold text-[#5A2D0C] mt-1">
                  {delegatedRequests.length}
                </div>
                <div className="text-[10px] text-[#5A2D0C]/60 mt-0.5">Room-level verification</div>
              </div>

              <div
                onClick={() => setActiveTab('CLARIFICATION')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeTab === 'CLARIFICATION'
                    ? 'bg-[#F7F1E7] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                    : 'bg-white border-[#5A2D0C]/10 hover:border-[#C88D3A]/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-[#5A2D0C]/70 uppercase">Needs Clarification</div>
                <div className="text-2xl font-serif font-bold text-amber-700 mt-1">
                  {clarificationRequests.length}
                </div>
                <div className="text-[10px] text-[#5A2D0C]/60 mt-0.5">Candidate response pending</div>
              </div>

              <div
                onClick={() => setActiveTab('APPROVED')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeTab === 'APPROVED'
                    ? 'bg-[#F7F1E7] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                    : 'bg-white border-[#5A2D0C]/10 hover:border-[#C88D3A]/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-[#5A2D0C]/70 uppercase">Approved Fellows</div>
                <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                  {approvedRequests.length}
                </div>
                <div className="text-[10px] text-[#5A2D0C]/60 mt-0.5">Active accommodation assigned</div>
              </div>
            </div>
          </div>

          {/* Accredited Properties Overview */}
          <div className="bg-white border border-[#5A2D0C]/15 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A2D0C]/70 mb-3 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-[#C88D3A]" />
          Accredited Accommodation Properties & Rates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="p-3.5 bg-[#FFF9EE] border border-[#C88D3A]/20 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="font-serif font-bold text-sm text-[#5A2D0C]">{p.name}</div>
                <div className="text-[11px] text-[#5A2D0C]/70 mt-0.5 line-clamp-2">{p.description}</div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#5A2D0C]/10 flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-[#5A2D0C]/60">Monthly</span>
                <span className="font-extrabold text-sm text-[#B77620]">
                  ₦{p.monthlyCommitment.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Tabbed Membership Requests List */}
      <div className="bg-white border border-[#5A2D0C]/15 rounded-2xl overflow-hidden shadow-xs">
        <div className="flex border-b border-[#5A2D0C]/10 bg-[#F7F1E7] px-4 pt-2">
          <button
            onClick={() => setActiveTab('NEEDS_REVIEW')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'NEEDS_REVIEW'
                ? 'border-[#C88D3A] text-[#5A2D0C]'
                : 'border-transparent text-[#5A2D0C]/60 hover:text-[#5A2D0C]'
            }`}
          >
            Needs Review ({needsReviewRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('DELEGATED')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'DELEGATED'
                ? 'border-[#C88D3A] text-[#5A2D0C]'
                : 'border-transparent text-[#5A2D0C]/60 hover:text-[#5A2D0C]'
            }`}
          >
            Delegated to Captains ({delegatedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('CLARIFICATION')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'CLARIFICATION'
                ? 'border-[#C88D3A] text-[#5A2D0C]'
                : 'border-transparent text-[#5A2D0C]/60 hover:text-[#5A2D0C]'
            }`}
          >
            Needs Clarification ({clarificationRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'APPROVED'
                ? 'border-[#C88D3A] text-[#5A2D0C]'
                : 'border-transparent text-[#5A2D0C]/60 hover:text-[#5A2D0C]'
            }`}
          >
            Approved ({approvedRequests.length})
          </button>
        </div>

        {/* Requests Table / Card List */}
        <div className="divide-y divide-[#5A2D0C]/10">
          {(activeTab === 'NEEDS_REVIEW'
            ? needsReviewRequests
            : activeTab === 'DELEGATED'
            ? delegatedRequests
            : activeTab === 'CLARIFICATION'
            ? clarificationRequests
            : approvedRequests
          ).length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A2D0C]/60">
              No accommodation membership requests in this category.
            </div>
          ) : (
            (activeTab === 'NEEDS_REVIEW'
              ? needsReviewRequests
              : activeTab === 'DELEGATED'
              ? delegatedRequests
              : activeTab === 'CLARIFICATION'
              ? clarificationRequests
              : approvedRequests
            ).map((req) => (
              <div
                key={req.id}
                id={`request-row-${req.id}`}
                className="p-5 hover:bg-[#FFF9EE]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Request details */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#5A2D0C]">
                      {req.fullName}
                    </span>
                    {req.h4dMemberId && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#5A2D0C]/10 text-[#5A2D0C]">
                        {req.h4dMemberId}
                      </span>
                    )}
                    {req.isExistingFellowRecognized && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
                        <span className="text-xs" aria-hidden="true">🛖</span>
                        Existing Fellow Transfer
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'DELEGATED'
                          ? 'bg-purple-100 text-purple-800'
                          : req.status === 'NEEDS_CLARIFICATION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-[#5A2D0C]/80 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>{req.email}</span>
                    <span>•</span>
                    <span>{req.programCommunity}</span>
                  </div>

                  {/* Accommodation Target */}
                  <div className="text-xs bg-[#F7F1E7] border border-[#C88D3A]/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-3">
                    <div>
                      <span className="text-[#5A2D0C]/60 text-[10px] uppercase font-semibold">Target: </span>
                      <strong className="text-[#5A2D0C]">{req.propertyName}</strong> — {req.roomName} ({req.floorName})
                    </div>
                    <div>
                      <span className="text-[#5A2D0C]/60 text-[10px] uppercase font-semibold">Rate: </span>
                      <strong className="text-[#B77620]">₦{req.monthlyCommitment.toLocaleString()}/mo</strong>
                    </div>
                  </div>

                  {/* Previous Accommodation notice for transfers */}
                  {req.previousAccommodation && (
                    <div className="text-[11px] text-[#5A2D0C]/80 bg-amber-50/70 border border-amber-200/60 rounded-md px-2.5 py-1">
                      Previous Accommodation: <strong>{req.previousAccommodation.propertyName}</strong> (
                      {req.previousAccommodation.roomName}, {req.previousAccommodation.period})
                    </div>
                  )}

                  {/* Delegation details */}
                  {req.delegation && (
                    <div className="text-[11px] text-purple-900 bg-purple-50 border border-purple-200 rounded-md px-2.5 py-1">
                      Delegated to Room Captain: <strong>{req.delegation.delegatedToName}</strong> (
                      {req.delegation.status})
                      {req.delegation.captainNote && (
                        <div className="mt-0.5 text-purple-800 italic">
                          Captain feedback: "{req.delegation.captainNote}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clarification note */}
                  {req.clarificationNote && (
                    <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1">
                      Clarification requested: "{req.clarificationNote}"
                    </div>
                  )}
                </div>

                {/* Coordinator Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  {req.status !== 'APPROVED' && (
                    <>
                      <button
                        id={`btn-approve-request-${req.id}`}
                        type="button"
                        onClick={() => handleApprove(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#2F1707] text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>

                      {req.status !== 'DELEGATED' && (
                        <button
                          id={`btn-delegate-request-${req.id}`}
                          type="button"
                          onClick={() => handleOpenDelegate(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#5A2D0C]/25 text-[#5A2D0C] hover:bg-[#F7F1E7] text-xs font-medium rounded-lg transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#C88D3A]" /> Delegate Verification
                        </button>
                      )}

                      <button
                        id={`btn-clarify-request-${req.id}`}
                        type="button"
                        onClick={() => handleOpenClarification(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#5A2D0C]/25 text-[#5A2D0C] hover:bg-[#F7F1E7] text-xs font-medium rounded-lg transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Clarify
                      </button>
                    </>
                  )}

                  {req.status === 'APPROVED' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium rounded-lg">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Active Membership Assigned
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delegate Verification Modal */}
      {delegateModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F1707]/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFF9EE] border border-[#C88D3A]/40 rounded-2xl shadow-xl max-w-md w-full p-6 text-[#5A2D0C]">
            <h3 className="font-serif text-lg font-bold">Delegate Room Verification</h3>
            <p className="text-xs text-[#5A2D0C]/70 mt-1">
              Delegate occupancy verification for <strong>{selectedRequest.fullName}</strong> in{' '}
              <strong>{selectedRequest.roomName}</strong> ({selectedRequest.propertyName}).
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold">Select Assigned Room Captain:</label>
              <select
                id="select-room-captain-delegation"
                value={selectedCaptainId}
                onChange={(e) => setSelectedCaptainId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#5A2D0C]/20 rounded-lg focus:ring-2 focus:ring-[#C88D3A]"
              >
                {roomCaptains.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDelegateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#5A2D0C]/70 hover:text-[#5A2D0C]"
              >
                Cancel
              </button>
              <button
                id="confirm-delegation-btn"
                type="button"
                onClick={handleSubmitDelegate}
                className="px-4 py-2 bg-[#5A2D0C] text-[#FFF9EE] rounded-lg text-xs font-semibold hover:bg-[#2F1707]"
              >
                Confirm Delegation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {clarificationModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F1707]/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFF9EE] border border-[#C88D3A]/40 rounded-2xl shadow-xl max-w-md w-full p-6 text-[#5A2D0C]">
            <h3 className="font-serif text-lg font-bold">Request Clarification</h3>
            <p className="text-xs text-[#5A2D0C]/70 mt-1">
              Send operational clarification request to <strong>{selectedRequest.fullName}</strong>.
            </p>

            <div className="mt-4 space-y-2">
              <label className="block text-xs font-semibold">Clarification Note:</label>
              <textarea
                id="input-clarification-note"
                rows={3}
                value={clarificationNote}
                onChange={(e) => setClarificationNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#5A2D0C]/20 rounded-lg focus:ring-2 focus:ring-[#C88D3A]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClarificationModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#5A2D0C]/70 hover:text-[#5A2D0C]"
              >
                Cancel
              </button>
              <button
                id="submit-clarification-btn"
                type="button"
                onClick={handleSubmitClarification}
                className="px-4 py-2 bg-[#C88D3A] text-white rounded-lg text-xs font-semibold hover:bg-[#B77620]"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
