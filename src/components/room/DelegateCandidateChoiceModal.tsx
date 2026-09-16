import React, { useState } from 'react';
import { CampusRoom, CandidateAssignment } from '../../domain/roomOperations';
import { roomOperationsStore } from '../../services/roomOperationsStore';
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  User,
  Building2,
  Bed,
} from 'lucide-react';

interface DelegateCandidateChoiceModalProps {
  room: CampusRoom;
  bedId: string;
  isDark?: boolean;
  coordinatorAttribution: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DelegateCandidateChoiceModal: React.FC<DelegateCandidateChoiceModalProps> = ({
  room,
  bedId,
  isDark = false,
  coordinatorAttribution,
  onClose,
  onSuccess,
}) => {
  const bed = room.beds.find((b) => b.id === bedId);
  const candidates = roomOperationsStore
    .getCandidates()
    .filter((c) => c.status === 'PENDING_ASSIGNMENT' || c.status === 'DELEGATED_TO_CAPTAIN');

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string>(
    'Please review candidate alignment with existing room study rhythms and verify in-person hub residency.'
  );
  const [error, setError] = useState<string | null>(null);

  const toggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter((cId) => cId !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateIds.length === 0) {
      setError('Please select at least 1 eligible candidate for the delegation pool.');
      return;
    }

    if (!room.captainMemberId) {
      setError(`Cannot delegate choice: No Room Captain assigned to ${room.roomNumber}.`);
      return;
    }

    try {
      roomOperationsStore.delegateCandidateChoice({
        roomId: room.id,
        bedId,
        candidateIds: selectedCandidateIds,
        instructions: instructions.trim(),
        coordinatorAttribution,
        captainMemberId: room.captainMemberId,
        captainName: room.captainName || 'Room Captain',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delegate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border-2 border-b-4 shadow-2xl p-6 sm:p-7 my-8 transition-all backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.95)' : 'rgba(255, 253, 248, 0.95)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.40)' : 'rgba(90, 45, 12, 0.30)',
        }}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b"
          style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2
              id="delegate-modal-title"
              className="font-serif font-bold text-base sm:text-lg"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Delegate Candidate Choice &bull; {room.roomNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg border border-transparent hover:border-stone-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room & Bed Target Banner */}
        <div
          className="p-3.5 rounded-xl border-2 border-b-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          style={{
            backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(247, 241, 231, 0.60)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.30)' : 'rgba(90, 45, 12, 0.15)',
          }}
        >
          <div>
            <strong>Target:</strong> {room.propertyName} &bull; {room.roomNumber} ({bed?.bedLabel})
          </div>
          <div>
            <strong>Delegated to:</strong> {room.captainName || 'Room Captain'}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-100 text-red-800 text-xs mb-4 flex items-center gap-2 border border-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Select Candidate Pool ({selectedCandidateIds.length} Selected)
              </label>
              <span className="text-[10px] font-mono text-[#B77620] dark:text-[#C88D3A]">
                13 Available Fixture Candidates
              </span>
            </div>

            <div
              className="max-h-60 overflow-y-auto rounded-xl border-2 border-b-3 p-3 space-y-2"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.70)' : 'rgba(255, 255, 255, 0.80)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              {candidates.map((cand) => {
                const isSelected = selectedCandidateIds.includes(cand.id);

                return (
                  <div
                    key={cand.id}
                    onClick={() => toggleCandidate(cand.id)}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40'
                        : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-stone-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <div
                          className="font-bold text-xs"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {cand.fullName}
                        </div>
                        <div className="text-[11px] text-[#B77620] dark:text-[#C88D3A]">
                          {cand.track} &bull; Prefers {cand.preferredPropertyName}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                      {cand.admissionNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="delegation-instructions"
              className="block text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Coordinator Guidance for Captain
            </label>
            <textarea
              id="delegation-instructions"
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border-2 border-b-3"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            />
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
          >
            <div
              className="text-[11px]"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              Authority: Explicit room-scoped delegation
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg border-2 border-b-3"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                  color: isDark ? '#FFF9EE' : '#5A2D0C',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-delegation"
                disabled={selectedCandidateIds.length === 0}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer active:translate-y-[1px] disabled:opacity-50 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                }`}
              >
                Dispatch Delegation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
