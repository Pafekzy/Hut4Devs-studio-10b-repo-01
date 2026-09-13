import React, { useState } from 'react';
import { Commitment, Fellow } from '../types';
import { X, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';

interface CommitmentPaymentModalProps {
  commitment: Commitment;
  currentFellow: Fellow;
  onClose: () => void;
  onSubmitPayment: (commitmentId: string, amount: number, reference: string, notes: string) => void;
}

export const CommitmentPaymentModal: React.FC<CommitmentPaymentModalProps> = ({
  commitment,
  currentFellow,
  onClose,
  onSubmitPayment,
}) => {
  const remaining = commitment.amount - commitment.amountPaid;
  const [payAmount, setPayAmount] = useState<number>(remaining);
  const [channel, setChannel] = useState<string>('Bank Transfer');
  const [reference, setReference] = useState<string>(
    `PAY-${Date.now().toString().slice(-6)}`
  );
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    const combinedNotes = `${channel}: ${notes || 'Standard fulfillment'}`;
    onSubmitPayment(commitment.id, payAmount, reference, combinedNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Record Accommodation Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60 text-xs">
            <div className="flex justify-between text-stone-500">
              <span>Commitment:</span>
              <span className="font-medium text-stone-800">{commitment.title}</span>
            </div>
            <div className="flex justify-between text-stone-500 mt-1">
              <span>Total Amount:</span>
              <span className="font-medium text-stone-800">
                {commitment.currency}
                {commitment.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-stone-500 mt-1">
              <span>Already Paid:</span>
              <span className="font-medium text-emerald-600">
                {commitment.currency}
                {commitment.amountPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-stone-700 font-semibold border-t border-stone-200 mt-2 pt-2">
              <span>Remaining Balance:</span>
              <span className="text-amber-700">
                {commitment.currency}
                {remaining.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Amount to Settle ({commitment.currency})
            </label>
            <div className="relative">
              <input
                id="input-payment-amount"
                type="number"
                max={remaining}
                min={1}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setPayAmount(remaining)}
                className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded transition-colors"
              >
                Pay Full Balance ({commitment.currency}{remaining.toLocaleString()})
              </button>
              {remaining > 20000 && (
                <button
                  type="button"
                  onClick={() => setPayAmount(Math.floor(remaining / 2))}
                  className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded transition-colors"
                >
                  Pay 50% ({commitment.currency}{Math.floor(remaining / 2).toLocaleString()})
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
            >
              <option value="Direct Bank Wire / NIP">Direct Bank Wire / NIP Transfer</option>
              <option value="Mobile Money / Fintech">Fintech / Mobile Money App</option>
              <option value="USDC / Web3 Settlement">USDC / External Settlement Anchor</option>
              <option value="Cash / Communal Safe">Cash / Physical Colony Deposit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Verifiable Evidence / Reference ID
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              placeholder="e.g. TXN-10928374 or receipt #"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Recorded into the Colony Trust Trail as immutable evidence.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Clarification (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent via OPay to landlord account"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
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
              id="btn-confirm-payment"
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Confirm & Append to Trail
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
