import React, { useState } from 'react';
import { CampusRoom, CandidateAssignment } from '../../domain/roomOperations';
import { roomOperationsStore } from '../../services/roomOperationsStore';
import {
  Bed,
  Check,
  X,
  UserCheck,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface AssignCandidateModalProps {
  room: CampusRoom;
  bedId: string;
  isDark?: boolean;
  coordinatorAttribution: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignCandidateModal: React.FC<AssignCandidateModalProps> = ({
  room,
  bedId,
  isDark = false,
  coordinatorAttribution,
  onClose,
  onSuccess,
}) => {
  const bed = room.beds.find((b) => b.id === bedId);
  const candidates = roomOperationsStore.getPendingCandidates();

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) {
      setError('Please select a candidate to assign to this bed.');
      return;
    }

    try {
      roomOperationsStore.assignCandidateDirectly({
        candidateId: selectedCandidateId,
        roomId: room.id,
        bedId,
        coordinatorAttribution,
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
      aria-labelledby="assign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="w-full max-w-xl rounded-2xl border-2 border-b-4 shadow-2xl p-6 sm:p-7 my-8 transition-all backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.95)' : 'rgba(255, 253, 248, 0.95)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.40)' : 'rgba(90, 45, 12, 0.30)',
        }}
      >
        <div
          className="flex items-center justify-between pb-4 mb-4 border-b"
          style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h2
              id="assign-modal-title"
              className="font-serif font-bold text-base sm:text-lg"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Direct Bed Assignment &bull; {room.roomNumber}
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

        {/* Room & Bed Target */}
        <div
          className="p-3.5 rounded-xl border-2 border-b-3 mb-4 flex items-center justify-between text-xs"
          style={{
            backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(247, 241, 231, 0.60)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.30)' : 'rgba(90, 45, 12, 0.15)',
          }}
        >
          <span>
            <strong>Bed Space:</strong> {bed?.bedLabel}
          </span>
          <span>
            <strong>Property:</strong> {room.propertyName}
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-100 text-red-800 text-xs mb-4 flex items-center gap-2 border border-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Select Candidate from 13 Demo Candidates
            </label>

            <div
              className="max-h-60 overflow-y-auto rounded-xl border-2 border-b-3 p-3 space-y-2"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.70)' : 'rgba(255, 255, 255, 0.80)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              {candidates.map((cand) => {
                const isSelected = selectedCandidateId === cand.id;

                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/40'
                    }`}
                  >
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

                    <span className="text-[10px] font-mono text-stone-500">
                      {cand.admissionNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
          >
            <div
              className="text-[11px]"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              Authority: Direct Coordinator Allocation
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
                id="btn-confirm-direct-assign"
                disabled={!selectedCandidateId}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-lg border-2 border-b-3 transition-all duration-150 cursor-pointer active:translate-y-[1px] disabled:opacity-50 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                }`}
              >
                Assign Fellow
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
