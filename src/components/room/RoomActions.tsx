import React, { useState, useEffect } from 'react';
import { CampusRoom, CandidateAssignment, DelegatedCandidateChoice } from '../../domain/roomOperations';
import { roomOperationsStore } from '../../services/roomOperationsStore';
import { membershipStore } from '../../services/membershipStore';
import { AccommodationMembershipRequest } from '../../domain/membership';
import {
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Sparkles,
  FileText,
  Clock,
  Send,
  MessageSquare,
  Check,
  X,
  Building2,
  Bed,
  ExternalLink,
} from 'lucide-react';

interface RoomActionsProps {
  room: CampusRoom;
  isDark?: boolean;
  activeMemberId?: string;
  activeMemberName?: string;
  actingCapacity?: string;
  isCaptain?: boolean;
  isCoordinator?: boolean;
}

export const RoomActions: React.FC<RoomActionsProps> = ({
  room,
  isDark = false,
  activeMemberId = 'member-chinedu-captain',
  activeMemberName = 'Chinedu Okeke',
  actingCapacity = 'Room Captain — Room 304',
  isCaptain = true,
  isCoordinator = false,
}) => {
  // Candidate Choice Delegation state
  const [delegatedChoices, setDelegatedChoices] = useState<DelegatedCandidateChoice[]>([]);
  const [candidates, setCandidates] = useState<CandidateAssignment[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [captainNote, setCaptainNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Occupancy Verification Requests
  const [verificationRequests, setVerificationRequests] = useState<AccommodationMembershipRequest[]>([]);
  const [verificationNotes, setVerificationNotes] = useState<{ [reqId: string]: string }>({});

  useEffect(() => {
    const updateData = () => {
      setDelegatedChoices(roomOperationsStore.getDelegatedChoicesForRoom(room.id));
      setCandidates(roomOperationsStore.getCandidates());

      // Filter membership requests for room verification
      const allReqs = membershipStore.getRequests();
      const roomVerifs = allReqs.filter(
        (r) =>
          r.roomName.toLowerCase() === room.roomNumber.toLowerCase() &&
          r.delegation &&
          (r.delegation.status === 'PENDING' || r.delegation.status === 'CONFIRMED')
      );
      setVerificationRequests(roomVerifs);
    };

    updateData();
    const unsub1 = roomOperationsStore.subscribe(updateData);
    const unsub2 = membershipStore.subscribe(updateData);

    return () => {
      unsub1();
      unsub2();
    };
  }, [room.id, room.roomNumber]);

  const pendingChoices = delegatedChoices.filter((dc) => dc.status === 'PENDING');
  const resolvedChoices = delegatedChoices.filter((dc) => dc.status === 'SELECTED');

  const handleResolveCandidateChoice = (delegationId: string) => {
    if (!selectedCandidateId) return;

    setIsSubmitting(true);
    try {
      const resolved = roomOperationsStore.resolveCandidateChoice({
        delegationId,
        selectedCandidateId,
        captainNote: captainNote.trim() || 'Selected after peer living space check and schedule verification.',
        captainAttribution: `${activeMemberName} (${actingCapacity})`,
        captainMemberId: activeMemberId,
      });

      setActionSuccessMessage(
        `Successfully assigned candidate ${resolved.selectedCandidateName} to bed ${resolved.bedLabel}! The selection has been recorded in the Room Trail.`
      );
      setSelectedCandidateId('');
      setCaptainNote('');
      setTimeout(() => setActionSuccessMessage(null), 7000);
    } catch (err: any) {
      alert(`Error resolving candidate selection: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOccupancy = (requestId: string) => {
    const note = verificationNotes[requestId] || 'Room Captain verified in-person check-in.';
    membershipStore.resolveDelegation({
      requestId,
      status: 'CONFIRMED',
      note,
    });
    setActionSuccessMessage('Occupancy verification successfully confirmed and recorded.');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleCannotConfirmOccupancy = (requestId: string) => {
    const note = verificationNotes[requestId] || 'Fellow not present or bed space discrepancy detected.';
    membershipStore.resolveDelegation({
      requestId,
      status: 'CANNOT_CONFIRM',
      note,
    });
    setActionSuccessMessage('Occupancy verification marked as cannot confirm. Coordinator alerted.');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  return (
    <div id={`room-actions-${room.id}`} className="space-y-6">
      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div
          role="status"
          className="p-4 rounded-xl border-2 border-b-3 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 flex items-start gap-3 shadow-xs"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm font-medium">{actionSuccessMessage}</div>
        </div>
      )}

      {/* 1. DELEGATED CANDIDATE CHOICE (Coordinator -> Captain) */}
      <section
        aria-labelledby="delegated-candidates-heading"
        className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div
          className="flex items-center justify-between pb-4 mb-5 border-b-2"
          style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2
              id="delegated-candidates-heading"
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Delegated Candidate Choice Flow
            </h2>
          </div>
          <span
            className="text-[10px] font-mono uppercase px-2.5 py-1 rounded font-semibold border"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
              color: isDark ? '#C88D3A' : '#B77620',
            }}
          >
            {pendingChoices.length} Pending Choice
          </span>
        </div>

        {pendingChoices.length === 0 ? (
          <div
            className="p-6 rounded-xl border-2 border-dashed text-center"
            style={{
              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.30)' : 'rgba(247, 241, 231, 0.30)',
            }}
          >
            <ShieldCheck className="w-8 h-8 mx-auto text-[#B77620] dark:text-[#C88D3A] mb-2 opacity-80" />
            <h3
              className="font-bold text-sm"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              No Pending Candidate Choice Delegations
            </h3>
            <p
              className="text-xs mt-1 max-w-md mx-auto"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              {isCoordinator
                ? 'As Coordinator, you can explicitly delegate prospective fellow selection to the Room Captain from the Bed Spaces tab or Pending Assignments.'
                : 'All prospective fellow selections for this room are up to date. New delegations from the Coordinator will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingChoices.map((choice) => {
              const delegatedPool = candidates.filter((c) =>
                choice.candidateIds.includes(c.id)
              );

              return (
                <div
                  key={choice.id}
                  id={`delegation-card-${choice.id}`}
                  className="p-5 sm:p-6 rounded-xl border-2 border-b-3 shadow-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                    borderColor: isDark ? '#9333EA' : '#7E22CE',
                  }}
                >
                  {/* Delegation Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-purple-200 dark:border-purple-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                          {choice.bedLabel}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-700">
                          Delegated by Coordinator
                        </span>
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                      >
                        Delegated by: <strong className="font-semibold">{choice.delegatedBy}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-[#B77620] dark:text-[#C88D3A]">
                      {new Date(choice.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Instructions */}
                  {choice.instructions && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Coordinator Guidance:</strong> {choice.instructions}
                      </div>
                    </div>
                  )}

                  {/* Candidate Selection List */}
                  <div className="space-y-3">
                    <div
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      Eligible Candidate Pool ({delegatedPool.length} Candidates Provided)
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {delegatedPool.map((cand) => {
                        const isSelected = selectedCandidateId === cand.id;

                        return (
                          <div
                            key={cand.id}
                            id={`candidate-card-${cand.id}`}
                            onClick={() => setSelectedCandidateId(cand.id)}
                            className={`p-4 rounded-xl border-2 border-b-3 transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? 'border-purple-600 ring-2 ring-purple-600/30 bg-purple-50 dark:bg-purple-950/40'
                                : 'hover:-translate-y-0.5 shadow-xs'
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? undefined
                                : isDark
                                ? 'rgba(38, 33, 28, 0.5)'
                                : 'rgba(255, 253, 248, 0.7)',
                              borderColor: isSelected
                                ? undefined
                                : isDark
                                ? 'rgba(200, 141, 58, 0.25)'
                                : 'rgba(90, 45, 12, 0.15)',
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'border-purple-600 bg-purple-600 text-white'
                                      : 'border-stone-400'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <div
                                    className="font-bold text-sm"
                                    style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                                  >
                                    {cand.fullName}
                                  </div>
                                  <div
                                    className="text-xs font-medium text-[#B77620] dark:text-[#C88D3A]"
                                  >
                                    {cand.track}
                                  </div>
                                </div>
                              </div>

                              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400">
                                {cand.admissionNumber}
                              </span>
                            </div>

                            <p
                              className="text-xs mt-2 pl-8 leading-relaxed"
                              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                            >
                              {cand.candidateBio}
                            </p>

                            <div className="mt-2.5 pl-8 flex items-center gap-4 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                              <span>GitHub: @{cand.githubHandle}</span>
                              <span>&bull;</span>
                              <span>{cand.phone}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Captain Action Confirmation Box */}
                  <div
                    className="mt-5 pt-4 border-t space-y-3"
                    style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
                  >
                    <div>
                      <label
                        htmlFor={`captain-note-${choice.id}`}
                        className="block text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        Room Captain Verification &amp; Living Space Note
                      </label>
                      <textarea
                        id={`captain-note-${choice.id}`}
                        rows={2}
                        value={captainNote}
                        onChange={(e) => setCaptainNote(e.target.value)}
                        placeholder="e.g. Confirmed with room fellows; candidate study schedule aligns with quiet hours."
                        className="w-full text-xs p-2.5 rounded-lg border-2 border-b-3 focus:outline-none focus:ring-2 focus:ring-[#B77620]"
                        style={{
                          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                          borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                          color: isDark ? '#FFF9EE' : '#5A2D0C',
                        }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div
                        className="text-[11px]"
                        style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                      >
                        Attributed actor: <strong>{activeMemberName}</strong> ({actingCapacity})
                      </div>

                      <button
                        type="button"
                        id={`btn-confirm-selection-${choice.id}`}
                        disabled={!selectedCandidateId || isSubmitting}
                        onClick={() => handleResolveCandidateChoice(choice.id)}
                        className={`w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark
                            ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                            : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Candidate Selection &amp; Assign Bed</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. OCCUPANCY VERIFICATION REQUESTS */}
      <section
        aria-labelledby="occupancy-verification-heading"
        className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div
          className="flex items-center justify-between pb-4 mb-5 border-b-2"
          style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
            <h2
              id="occupancy-verification-heading"
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              In-Person Occupancy Verification
            </h2>
          </div>
          <span
            className="text-[10px] font-mono uppercase px-2.5 py-1 rounded font-semibold border"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
              color: isDark ? '#C88D3A' : '#B77620',
            }}
          >
            {verificationRequests.length} Requests
          </span>
        </div>

        {verificationRequests.length === 0 ? (
          <div
            className="p-6 rounded-xl border-2 border-dashed text-center"
            style={{
              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.30)' : 'rgba(247, 241, 231, 0.30)',
            }}
          >
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2 opacity-80" />
            <h3
              className="font-bold text-sm"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              All Occupancy Checks Completed
            </h3>
            <p
              className="text-xs mt-1 max-w-md mx-auto"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              No fellows in {room.roomNumber} currently require in-person occupancy verification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verificationRequests.map((req) => (
              <div
                key={req.id}
                id={`verif-card-${req.id}`}
                className="p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="font-bold text-sm"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      {req.fullName}
                    </h3>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                    >
                      {req.programCommunity} &bull; {req.email}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${
                      req.delegation?.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    }`}
                  >
                    {req.delegation?.status || 'PENDING'}
                  </span>
                </div>

                {req.delegation?.status === 'PENDING' && (
                  <div className="mt-4 pt-3 border-t space-y-3" style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.10)' }}>
                    <input
                      type="text"
                      placeholder="Observation / verification note (optional)..."
                      value={verificationNotes[req.id] || ''}
                      onChange={(e) =>
                        setVerificationNotes({ ...verificationNotes, [req.id]: e.target.value })
                      }
                      className="w-full text-xs p-2 rounded-lg border-2 border-b-3"
                      style={{
                        backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                        color: isDark ? '#FFF9EE' : '#5A2D0C',
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id={`btn-confirm-occupancy-${req.id}`}
                        onClick={() => handleConfirmOccupancy(req.id)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg border-2 border-b-3 cursor-pointer active:translate-y-[1px] ${
                          isDark
                            ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                            : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                        }`}
                      >
                        Confirm Occupancy
                      </button>

                      <button
                        type="button"
                        id={`btn-cannot-confirm-${req.id}`}
                        onClick={() => handleCannotConfirmOccupancy(req.id)}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg border-2 border-b-3 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 cursor-pointer active:translate-y-[1px]"
                      >
                        Cannot Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
