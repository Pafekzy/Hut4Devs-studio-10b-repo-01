import React, { useState } from 'react';
import { PeerSupportType, PeerSupportAgreement } from '../domain/peerSupport';
import { Member } from '../domain/auth';
import { peerSupportStore } from '../services/peerSupportStore';
import {
  X,
  HandCoins,
  Gift,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  History,
} from 'lucide-react';

interface PeerSupportModalProps {
  currentMember: Member;
  availableMembers: Member[];
  initialType?: PeerSupportType;
  isDark?: boolean;
  onClose: () => void;
  onSubmitSupport: (data: {
    type: PeerSupportType;
    toMemberId?: string;
    toMemberName?: string;
    amount: number;
    purpose: string;
    repaymentPeriod?: string;
    repaymentDate?: string;
    title?: string;
    targetAmount?: number;
    notes?: string;
    acknowledgedWarning?: boolean;
  }) => void;
}

export const PeerSupportModal: React.FC<PeerSupportModalProps> = ({
  currentMember,
  availableMembers,
  initialType = 'gift',
  isDark = false,
  onClose,
  onSubmitSupport,
}) => {
  const eligibleRecipients = availableMembers.filter((m) => m.id !== currentMember.id);

  const [supportType, setSupportType] = useState<PeerSupportType>(initialType);
  const [toMemberId, setToMemberId] = useState<string>(
    eligibleRecipients.length > 0 ? eligibleRecipients[0].id : ''
  );
  const [amount, setAmount] = useState<number>(20000);
  const [purpose, setPurpose] = useState<string>('Support accommodation bridge during stipend transition');
  
  // Loan-specific
  const [repaymentPeriod, setRepaymentPeriod] = useState<string>('2 weeks');
  const [repaymentDate, setRepaymentDate] = useState<string>('2026-09-30');
  const [acknowledgedWarning, setAcknowledgedWarning] = useState<boolean>(false);
  const [showDebtHistory, setShowDebtHistory] = useState<boolean>(false);

  // Contribution-specific
  const [campaignTitle, setCampaignTitle] = useState<string>('Chamber Generator Inverter Support');
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [seedAmount, setSeedAmount] = useState<number>(25000);

  // General notes
  const [notes, setNotes] = useState<string>('Direct arrangement between peers with mutual clarity.');

  const recipientMember = availableMembers.find((m) => m.id === toMemberId);
  const overdueCheck = toMemberId
    ? peerSupportStore.checkBorrowerOverdueStatus(toMemberId)
    : { isOverdue: false, overdueLoans: [] };
  const borrowerHistory = toMemberId ? peerSupportStore.getBorrowerDebtHistory(toMemberId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (supportType === 'contribution') {
      if (!campaignTitle || targetAmount <= 0) return;
      onSubmitSupport({
        type: 'contribution',
        title: campaignTitle,
        purpose,
        amount: seedAmount,
        targetAmount,
        notes,
      });
      onClose();
      return;
    }

    if (amount <= 0 || !toMemberId) return;

    if (supportType === 'loan' && overdueCheck.isOverdue && !acknowledgedWarning) {
      alert('Please acknowledge the active delay history notice before confirming the loan.');
      return;
    }

    onSubmitSupport({
      type: supportType,
      toMemberId,
      toMemberName: recipientMember?.displayName || 'Fellow',
      amount,
      purpose,
      repaymentPeriod: supportType === 'loan' ? repaymentPeriod : undefined,
      repaymentDate: supportType === 'loan' ? repaymentDate : undefined,
      notes,
      acknowledgedWarning,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#24211F] text-[#2B211B] dark:text-[#FFF9EE] rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-stone-200 dark:border-[#C88D3A]/40 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#C88D3A]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFF9EE] dark:bg-[#1E1B18] text-[#5A2D0C] dark:text-[#C88D3A] rounded-xl border border-[#E7D6C1] dark:border-[#C88D3A]/30 shadow-xs">
              <HandCoins className="w-5 h-5 text-[#C88D3A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#5A2D0C] dark:text-[#FFF9EE] text-base">Initiate Peer Support</h3>
              <p className="text-[11px] text-stone-500 dark:text-[#D9C4AC]/80">
                Direct peer-to-peer cooperation without gatekeepers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-[#FFF9EE] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Culture Tenet Callout */}
        <div className="mt-3.5 p-3 bg-[#FFF9EE] dark:bg-[#1E1B18] border border-[#E7D6C1] dark:border-[#C88D3A]/30 rounded-xl text-[11px] text-[#5A2D0C] dark:text-[#FFF9EE] space-y-1 shadow-xs">
          <div className="font-semibold flex items-center gap-1.5 text-[#5A2D0C] dark:text-[#C88D3A]">
            <span className="text-xs" aria-hidden="true">🛖</span> Hut4Devs Mutual Support Principle
          </div>
          <p className="leading-relaxed opacity-90">
            "Asking for help is normal cooperation. Helping is voluntary solidarity. Declining to support
            ('No') is always legitimate and carries zero negative rating."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Support Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1.5">Choose Support Path</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-select-gift-path"
                onClick={() => setSupportType('gift')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                  supportType === 'gift'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-semibold shadow-xs ring-1 ring-emerald-600/30'
                    : 'border-stone-200 dark:border-[#C88D3A]/30 bg-white dark:bg-[#1E1B18] text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-50 dark:hover:bg-[#292522]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold">
                  <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Gift</span>
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal leading-tight">
                  Zero repayment obligation
                </span>
              </button>

              <button
                type="button"
                id="btn-select-loan-path"
                onClick={() => setSupportType('loan')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                  supportType === 'loan'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 font-semibold shadow-xs ring-1 ring-blue-600/30'
                    : 'border-stone-200 dark:border-[#C88D3A]/30 bg-white dark:bg-[#1E1B18] text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-50 dark:hover:bg-[#292522]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-400 font-bold">
                  <HandCoins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>2. Lend</span>
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal leading-tight">
                  Clear repayment timeline
                </span>
              </button>

              <button
                type="button"
                id="btn-select-contrib-path"
                onClick={() => setSupportType('contribution')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                  supportType === 'contribution'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-950 dark:text-purple-200 font-semibold shadow-xs ring-1 ring-purple-600/30'
                    : 'border-stone-200 dark:border-[#C88D3A]/30 bg-white dark:bg-[#1E1B18] text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-50 dark:hover:bg-[#292522]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-400 font-bold">
                  <HeartHandshake className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>3. Contribute</span>
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal leading-tight">
                  Shared community need
                </span>
              </button>
            </div>
          </div>

          {/* PATH 1 & 2: Recipient Selection */}
          {supportType !== 'contribution' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC]">
                  {supportType === 'gift' ? 'Gift Recipient' : 'Borrower / Fellow'}
                </label>
                {supportType === 'loan' && borrowerHistory && (
                  <button
                    type="button"
                    onClick={() => setShowDebtHistory(!showDebtHistory)}
                    className="text-[11px] text-stone-500 dark:text-[#C88D3A] hover:text-stone-800 dark:hover:text-[#FFF9EE] flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                  >
                    <History className="w-3 h-3" />
                    {showDebtHistory ? 'Hide Contextual History' : 'View Contextual History'}
                  </button>
                )}
              </div>
              <select
                id="select-support-recipient"
                value={toMemberId}
                onChange={(e) => {
                  setToMemberId(e.target.value);
                  setAcknowledgedWarning(false);
                }}
                className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE] font-medium"
              >
                {eligibleRecipients.map((f) => (
                  <option key={f.id} value={f.id} className="bg-white dark:bg-[#1E1B18] text-stone-900 dark:text-[#FFF9EE]">
                    {f.displayName} ({f.h4dMemberId || f.roles?.join(', ') || 'FELLOW'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Contextual Debt History Preview (Informational only, not a public shaming wall) */}
          {supportType === 'loan' && showDebtHistory && borrowerHistory && (
            <div className="p-3 bg-stone-50 dark:bg-[#1E1B18] border border-stone-200 dark:border-[#C88D3A]/30 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-semibold text-stone-800 dark:text-[#FFF9EE]">
                <span>Contextual Loan History for {recipientMember?.displayName}</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">Confidential to Prospective Lender</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white dark:bg-[#292522] rounded-lg border border-stone-200/80 dark:border-[#C88D3A]/20">
                  <span className="text-stone-500 dark:text-[#D9C4AC]/80 block">Fully Repaid Loans:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-xs">{borrowerHistory.repaidLoans.length} completed</strong>
                </div>
                <div className="p-2 bg-white dark:bg-[#292522] rounded-lg border border-stone-200/80 dark:border-[#C88D3A]/20">
                  <span className="text-stone-500 dark:text-[#D9C4AC]/80 block">Forgiven / Gift Converted:</span>
                  <strong className="text-purple-700 dark:text-purple-400 text-xs">{borrowerHistory.convertedGifts.length} agreements</strong>
                </div>
                <div className="p-2 bg-white dark:bg-[#292522] rounded-lg border border-stone-200/80 dark:border-[#C88D3A]/20">
                  <span className="text-stone-500 dark:text-[#D9C4AC]/80 block">Active Loans:</span>
                  <strong className="text-blue-700 dark:text-blue-400 text-xs">{borrowerHistory.activeLoans.length} active</strong>
                </div>
                <div className="p-2 bg-white dark:bg-[#292522] rounded-lg border border-stone-200/80 dark:border-[#C88D3A]/20">
                  <span className="text-stone-500 dark:text-[#D9C4AC]/80 block">Overdue Delays:</span>
                  <strong className={`text-xs ${borrowerHistory.overdueLoans.length > 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-600 dark:text-stone-400'}`}>
                    {borrowerHistory.overdueLoans.length} delay(s)
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* ⚠️ NOT ADVISABLE Dignified Warning Banner (Required Overdue Rule) */}
          {supportType === 'loan' && overdueCheck.isOverdue && (
            <div
              id="overdue-loan-warning-banner"
              className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/50 rounded-xl text-xs text-amber-950 dark:text-amber-200 space-y-2.5"
            >
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>⚠️ Signal: Not Advisable</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                {recipientMember?.displayName} currently has an unresolved peer loan delay.
                In Hut4Devs, this signal serves to inform human judgment — it does not permanently
                blacklist the fellow or forbid you from helping if you have personal context or choose
                to offer a voluntary gift or structured agreement.
              </p>

              <label className="flex items-start gap-2 pt-1 text-[11px] font-semibold text-amber-950 dark:text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  id="checkbox-acknowledge-warning"
                  checked={acknowledgedWarning}
                  onChange={(e) => setAcknowledgedWarning(e.target.checked)}
                  className="mt-0.5 rounded border-amber-400 text-amber-700 focus:ring-amber-500"
                />
                <span>I understand this fellow's delay history and consciously choose to proceed with this agreement.</span>
              </label>
            </div>
          )}

          {/* PATH 1 & 2: Gift / Loan Amount */}
          {supportType !== 'contribution' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                Amount (₦ Colony Currency)
              </label>
              <input
                id="input-support-amount"
                type="number"
                min={1000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-semibold bg-white dark:bg-[#180A02] text-stone-900 dark:text-[#FFF9EE]"
              />
            </div>
          )}

          {/* PATH 2: Loan Repayment Terms */}
          {supportType === 'loan' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/40 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                  Repayment Period
                </label>
                <input
                  id="input-loan-period"
                  type="text"
                  value={repaymentPeriod}
                  onChange={(e) => setRepaymentPeriod(e.target.value)}
                  placeholder="e.g. 2 weeks, End of month"
                  required
                  className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white dark:bg-[#180A02] text-stone-900 dark:text-[#FFF9EE] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                  Expected Repayment Date
                </label>
                <input
                  id="input-loan-date"
                  type="date"
                  value={repaymentDate}
                  onChange={(e) => setRepaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white dark:bg-[#180A02] text-stone-900 dark:text-[#FFF9EE] font-medium"
                />
              </div>
            </div>
          )}

          {/* PATH 3: Contribution Campaign Fields */}
          {supportType === 'contribution' && (
            <div className="space-y-3 p-3 bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                  Campaign Title / Shared Need
                </label>
                <input
                  id="input-campaign-title"
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Chamber Solar Inverter Replacement, Fiber Mesh Wi-Fi"
                  required
                  className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white dark:bg-[#180A02] text-stone-900 dark:text-[#FFF9EE] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                    Target Amount (₦)
                  </label>
                  <input
                    id="input-campaign-target"
                    type="number"
                    min={5000}
                    step={5000}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white dark:bg-[#180A02] font-semibold text-stone-900 dark:text-[#FFF9EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                    Your Initial Seed (₦)
                  </label>
                  <input
                    id="input-campaign-seed"
                    type="number"
                    min={0}
                    step={1000}
                    value={seedAmount}
                    onChange={(e) => setSeedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white dark:bg-[#180A02] font-semibold text-stone-900 dark:text-[#FFF9EE]"
                  />
                </div>
              </div>

              <p className="text-[10px] text-purple-900/80 dark:text-purple-300 font-medium">
                Notice: Community contributions are voluntary shared pooling for communal utilities or emergencies. No equity, profit-sharing, or return-on-investment is involved.
              </p>
            </div>
          )}

          {/* Purpose / Context */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Purpose / Context</label>
            <input
              id="input-support-purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              placeholder="e.g. Accommodation share bridge until stipend, emergency equipment"
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-[#180A02] text-stone-900 dark:text-[#FFF9EE] font-medium"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Notes / Terms (Optional)</label>
            <input
              id="input-support-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Direct arrangement with mutual clarity"
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-[#180A02] text-stone-900 dark:text-[#FFF9EE]"
            />
          </div>

          {/* Invariant Reassurances */}
          {supportType === 'gift' && (
            <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Gift Rule:</strong> Once given, this gift creates zero repayment obligation and cannot be converted back into a debt later.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-stone-100 dark:border-[#5A2D0C]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-100 dark:hover:bg-[#2F1707] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-peer-support"
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-[#5A2D0C] hover:bg-[#3D1D08] dark:bg-[#C88D3A] dark:hover:bg-[#B77620] text-[#FFF9EE] dark:text-[#241004] rounded-xl transition-all flex items-center gap-1.5 border-b-4 border-[#381B07] dark:border-[#915B15] active:border-b active:translate-y-[2px] shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C88D3A] dark:text-[#241004]" />
              Confirm &amp; Append to Trail
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
