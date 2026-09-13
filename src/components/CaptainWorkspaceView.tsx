import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, formatActionAttribution } from '../domain/membership';
import { membershipStore } from '../services/membershipStore';
import { Home, CheckCircle2, XCircle, MessageSquare, Users, Shield } from 'lucide-react';

interface CaptainWorkspaceViewProps {
  member: Member;
  activeMode: ActiveMode;
}

export const CaptainWorkspaceView: React.FC<CaptainWorkspaceViewProps> = ({
  member,
  activeMode,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return membershipStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  // Determine Captain's assigned scope
  const scopedAssignments = membershipStore.getScopedRolesForMember(member.id);
  const captainScope = scopedAssignments.find((s) => s.role === 'ROOM_CAPTAIN' as any)?.scope || {
    propertyName: 'Infinite Grace Apartment',
    roomName: 'Room 304',
    roomId: 'room-304',
  };

  const attribution = formatActionAttribution(member, activeMode, `${captainScope.propertyName} — ${captainScope.roomName}`);

  // Fetch only delegations relevant to Captain's room scope
  const allRequests = membershipStore.getRequests();
  const roomDelegations = allRequests.filter(
    (r) =>
      r.delegation &&
      (r.delegation.delegatedToMemberId === member.id ||
        r.roomName.toLowerCase() === (captainScope.roomName || '').toLowerCase() ||
        activeMode === 'CAPTAIN_COVERAGE')
  );

  // Active fellows in this room
  const assignments = membershipStore.getAssignments().filter(
    (a) =>
      a.status === 'ACTIVE' &&
      a.roomName.toLowerCase() === (captainScope.roomName || '').toLowerCase()
  );

  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [captainNote, setCaptainNote] = useState('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const handleConfirm = (reqId: string) => {
    membershipStore.resolveDelegation({
      requestId: reqId,
      status: 'CONFIRMED',
      note: 'Verified in-person occupancy and assigned bed space.',
    });
  };

  const handleCannotConfirm = (reqId: string) => {
    membershipStore.resolveDelegation({
      requestId: reqId,
      status: 'CANNOT_CONFIRM',
      note: 'Candidate not located in assigned room during verification check.',
    });
  };

  const handleOpenNote = (reqId: string) => {
    setSelectedReqId(reqId);
    setCaptainNote('');
    setNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedReqId || !captainNote.trim()) return;
    membershipStore.resolveDelegation({
      requestId: selectedReqId,
      status: 'CONFIRMED',
      note: captainNote.trim(),
    });
    setNoteModalOpen(false);
    setSelectedReqId(null);
  };

  return (
    <div id="captain-workspace" className="space-y-6">
      {/* Captain Scope Banner */}
      <div className="bg-[#FFF9EE] border border-[#C88D3A]/30 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#5A2D0C] text-[#FFF9EE]">
                Room Captain Responsibility
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#C88D3A]/20 text-[#5A2D0C]">
                Strictly Room-Scoped
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#5A2D0C] mt-1.5">
              {captainScope.propertyName} — {captainScope.roomName}
            </h1>
            <p className="text-xs text-[#5A2D0C]/70 mt-1">
              Delegated room-level verification and active peer support for your assigned living space.
            </p>
          </div>

          <div className="text-right text-xs bg-[#F7F1E7] border border-[#5A2D0C]/10 rounded-xl px-4 py-2.5">
            <span className="text-[#5A2D0C]/60 block text-[10px] uppercase font-semibold">Acting As</span>
            <span className="font-bold text-[#5A2D0C]">{attribution.actingCapacity}</span>
          </div>
        </div>
      </div>

      {/* Delegated Verification Queue */}
      <div className="bg-white border border-[#5A2D0C]/15 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A2D0C]/70 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#C88D3A]" />
          Delegated Room Occupancy Verifications ({roomDelegations.length})
        </h2>

        {roomDelegations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A2D0C]/60 bg-[#F7F1E7]/50 rounded-xl">
            No pending room verification requests for {captainScope.roomName}.
          </div>
        ) : (
          <div className="space-y-3">
            {roomDelegations.map((req) => {
              const delegation = req.delegation!;
              return (
                <div
                  key={req.id}
                  id={`captain-delegation-card-${req.id}`}
                  className="p-4 bg-[#FFF9EE] border border-[#C88D3A]/25 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#5A2D0C]">
                        {req.fullName}
                      </span>
                      <span className="text-xs text-[#5A2D0C]/70">({req.email})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          delegation.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : delegation.status === 'CANNOT_CONFIRM'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {delegation.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#5A2D0C]/80">
                      Program: <strong>{req.programCommunity}</strong> • Room Allocation:{' '}
                      <strong>{req.roomName}</strong>
                    </div>

                    <div className="text-[11px] text-[#5A2D0C]/70">
                      Delegated By: {delegation.delegatedBy} • Task: {delegation.responsibility}
                    </div>

                    {delegation.captainNote && (
                      <div className="text-xs text-purple-900 bg-purple-50 p-2 rounded-md border border-purple-200 mt-1">
                        Captain Feedback: "{delegation.captainNote}"
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id={`btn-captain-confirm-${req.id}`}
                      type="button"
                      onClick={() => handleConfirm(req.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5A2D0C] text-[#FFF9EE] text-xs font-semibold rounded-lg hover:bg-[#2F1707] transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Confirm Occupancy
                    </button>

                    <button
                      id={`btn-captain-cannot-confirm-${req.id}`}
                      type="button"
                      onClick={() => handleCannotConfirm(req.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-red-300 text-red-700 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cannot Confirm
                    </button>

                    <button
                      id={`btn-captain-note-${req.id}`}
                      type="button"
                      onClick={() => handleOpenNote(req.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#5A2D0C]/25 text-[#5A2D0C] text-xs font-medium rounded-lg hover:bg-[#F7F1E7] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#C88D3A]" /> Add Note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assigned Room Fellows Roster */}
      <div className="bg-white border border-[#5A2D0C]/15 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A2D0C]/70 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#C88D3A]" />
          Fellows Currently Assigned to {captainScope.roomName}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assignments.map((a) => {
            const m = membershipStore.getMemberById(a.memberId);
            return (
              <div
                key={a.id}
                className="p-3.5 bg-[#F7F1E7] border border-[#C88D3A]/20 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-serif font-bold text-sm text-[#5A2D0C]">
                    {m?.displayName || 'Fellow'}
                  </div>
                  <div className="text-xs text-[#5A2D0C]/70">{m?.email}</div>
                  <div className="text-[11px] text-[#5A2D0C]/60 mt-0.5">
                    Residency Period: {a.period}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F1707]/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFF9EE] border border-[#C88D3A]/40 rounded-2xl shadow-xl max-w-md w-full p-6 text-[#5A2D0C]">
            <h3 className="font-serif text-lg font-bold">Room Verification Note</h3>
            <p className="text-xs text-[#5A2D0C]/70 mt-1">
              Add observations regarding room occupancy to relay back to the Coordinator.
            </p>
            <div className="mt-4">
              <textarea
                rows={3}
                value={captainNote}
                onChange={(e) => setCaptainNote(e.target.value)}
                placeholder="e.g. Fellow moved in today, confirmed bed space 2."
                className="w-full px-3 py-2 text-xs bg-white border border-[#5A2D0C]/20 rounded-lg focus:ring-2 focus:ring-[#C88D3A]"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#5A2D0C]/70 hover:text-[#5A2D0C]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-2 bg-[#5A2D0C] text-[#FFF9EE] rounded-lg text-xs font-semibold hover:bg-[#2F1707]"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
