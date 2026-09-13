import React, { useState } from 'react';
import { Member } from '../domain/auth';
import { X, Shield, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VouchModalProps {
  availableMembers: Member[];
  currentMember: Member;
  isDark?: boolean;
  onClose: () => void;
  onSubmitVouch: (
    targetMemberId: string,
    targetMemberName: string,
    context: string,
    confidence: 'high' | 'moderate' | 'cautious',
    scope: string,
    notes: string
  ) => void;
}

export const VouchModal: React.FC<VouchModalProps> = ({
  availableMembers,
  currentMember,
  isDark = false,
  onClose,
  onSubmitVouch,
}) => {
  const eligibleTargets = availableMembers.filter((m) => m.id !== currentMember.id);

  const [targetId, setTargetId] = useState<string>(
    eligibleTargets.length > 0 ? eligibleTargets[0].id : ''
  );
  const [context, setContext] = useState<string>('Accommodation Rent Reliability');
  const [confidence, setConfidence] = useState<'high' | 'moderate' | 'cautious'>('high');
  const [scope, setScope] = useState<string>('Up to ₦60,000 accommodation share');
  const [notes, setNotes] = useState<string>(
    'Consistently follows up and honors shared roommate timelines. Always communicates transparently.'
  );

  const targetMember = availableMembers.find((m) => m.id === targetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !targetMember) return;
    onSubmitVouch(targetId, targetMember.displayName, context, confidence, scope, notes);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#24211F] text-[#2B211B] dark:text-[#FFF9EE] rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-stone-200 dark:border-[#C88D3A]/40 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#C88D3A]/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FFF9EE] dark:bg-[#1E1B18] text-[#5A2D0C] dark:text-[#C88D3A] rounded-xl border border-[#E7D6C1] dark:border-[#C88D3A]/30 shadow-xs">
              <Shield className="w-4 h-4 text-[#C88D3A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#5A2D0C] dark:text-[#FFF9EE] text-base">Issue Contextual Vouch</h3>
              <p className="text-[11px] text-stone-500 dark:text-[#D9C4AC]/70">Provide bounded trust evidence for a peer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-[#FFF9EE] p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Target Fellow</label>
            <select
              id="select-vouch-target"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE] font-medium"
            >
              {eligibleTargets.map((f) => (
                <option key={f.id} value={f.id} className="bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]">
                  {f.displayName} ({f.h4dMemberId || f.roles?.join(', ') || 'FELLOW'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Domain Context</label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE] font-medium"
            >
              <option value="Accommodation Rent Reliability" className="bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]">Accommodation Rent Reliability</option>
              <option value="Chamber Utilities & Upkeep" className="bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]">Chamber Utilities & Upkeep</option>
              <option value="Short-term Hardware / Laptop Support" className="bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]">Short-term Hardware / Laptop Support</option>
              <option value="Technical Project Delivery" className="bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]">Technical Project Delivery</option>
              <option value="Communication During Stoppages" className="bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]">Communication During Stoppages</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Confidence Rating</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setConfidence('high')}
                className={`p-2.5 rounded-xl border-2 text-xs font-bold text-center transition-all cursor-pointer ${
                  confidence === 'high'
                    ? 'border-[#227B5D] bg-[#D7F3E9] text-[#0C3829] dark:bg-[#3F8F76]/40 dark:text-[#C1F5E8] dark:border-[#5CA98C]'
                    : 'border-stone-200 dark:border-[#C88D3A]/30 bg-white dark:bg-[#1E1B18] text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-50 dark:hover:bg-[#292522]'
                }`}
              >
                High Confidence
              </button>
              <button
                type="button"
                onClick={() => setConfidence('moderate')}
                className={`p-2.5 rounded-xl border-2 text-xs font-bold text-center transition-all cursor-pointer ${
                  confidence === 'moderate'
                    ? 'border-[#465BA0] bg-[#DFE6F9] text-[#192750] dark:bg-[#6F7FBF]/40 dark:text-[#D8E0FF] dark:border-[#8190CF]'
                    : 'border-stone-200 dark:border-[#C88D3A]/30 bg-white dark:bg-[#1E1B18] text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-50 dark:hover:bg-[#292522]'
                }`}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setConfidence('cautious')}
                className={`p-2.5 rounded-xl border-2 text-xs font-bold text-center transition-all cursor-pointer ${
                  confidence === 'cautious'
                    ? 'border-[#C25E00] bg-[#FEF3C7] text-[#712B07] dark:bg-[#D97706]/40 dark:text-[#FDE68A] dark:border-[#F59E0B]'
                    : 'border-stone-200 dark:border-[#C88D3A]/30 bg-white dark:bg-[#1E1B18] text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-50 dark:hover:bg-[#292522]'
                }`}
              >
                Cautious / Bounded
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Commitment Scope Limit</label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="e.g. Up to ₦50,000 accommodation share"
              required
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Observation &amp; Reasoning</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]"
            />
          </div>

          {/* Explicit No Guarantor Liability Reassurance */}
          <div className="p-3 bg-[#FFF9EE] dark:bg-[#1E1B18] border border-[#E7D6C1] dark:border-[#C88D3A]/30 rounded-xl text-[11px] text-[#5A2D0C] dark:text-[#FFF9EE] flex items-start gap-2 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#C88D3A] shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Guarantor Liability Notice:</strong> This vouch serves strictly as evidence of past demonstrated reliability. In Hut4Devs, issuing a vouch creates NO automatic financial liability or debt responsibility for the voucher.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-[#C88D3A]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-100 dark:hover:bg-[#1E1B18] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-vouch-modal"
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#5A2D0C] hover:bg-[#3D1D08] dark:bg-[#C88D3A] dark:hover:bg-[#B77620] text-[#FFF9EE] dark:text-[#241004] rounded-xl border-b-4 border-[#381B07] dark:border-[#915B15] active:border-b active:translate-y-[2px] transition-all shadow-sm cursor-pointer"
            >
              Publish Bounded Vouch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
