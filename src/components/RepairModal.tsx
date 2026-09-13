import React, { useState } from 'react';
import { Commitment, Fellow } from '../types';
import { X, MessageSquareShare, Calendar } from 'lucide-react';

interface RepairModalProps {
  commitment: Commitment;
  currentFellow: Fellow;
  onClose: () => void;
  onSubmitRepair: (commitmentId: string, revisedDate: string, notes: string) => void;
}

export const RepairModal: React.FC<RepairModalProps> = ({
  commitment,
  currentFellow,
  onClose,
  onSubmitRepair,
}) => {
  const [revisedDate, setRevisedDate] = useState<string>('2026-09-28');
  const [notes, setNotes] = useState<string>(
    'Stipend disbursement rescheduled by sponsor. Requesting 1-week timeline revision.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRepair(commitment.id, revisedDate, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
              <MessageSquareShare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Communicate Hardship & Revise Timeline</h3>
              <p className="text-[11px] text-stone-500">Practice transparent repair before due dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 leading-relaxed">
          <div className="font-semibold flex items-center gap-1 text-amber-950 mb-1">
            <span className="text-xs" aria-hidden="true">🛖</span> Colony Principle
          </div>
          <p>
            "A missed commitment or unexpected difficulty does not permanently define a fellow.
            Communicating proactively creates verifiable evidence of honesty and judgment."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Commitment Under Revision
            </label>
            <div className="text-xs text-stone-800 bg-stone-50 p-2.5 rounded border border-stone-200">
              <span className="font-semibold">{commitment.title}</span> • Currently Due: {commitment.dueDate}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Proposed Revised Settlement Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={revisedDate}
                onChange={(e) => setRevisedDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Context & Communication to Roommates
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
              placeholder="Explain the timing delay honestly (e.g. stipend payout delayed, emergency laptop repair)..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-repair"
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              Log Communication & Update Trail
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
