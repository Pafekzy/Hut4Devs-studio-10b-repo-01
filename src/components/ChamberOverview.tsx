import React, { useState } from 'react';
import { Chamber, Fellow, Commitment } from '../types';
import {
  Calendar,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  MessageSquareShare,
  Zap,
} from 'lucide-react';

interface ChamberOverviewProps {
  chamber: Chamber;
  fellows: Fellow[];
  commitments: Commitment[];
  currentFellowId: string;
  onOpenPaymentModal: (commitment: Commitment) => void;
  onOpenRepairModal: (commitment: Commitment) => void;
  onOpenPeerSupportModal: () => void;
}

export const ChamberOverview: React.FC<ChamberOverviewProps> = ({
  chamber,
  fellows,
  commitments,
  currentFellowId,
  onOpenPaymentModal,
  onOpenRepairModal,
  onOpenPeerSupportModal,
}) => {
  const chamberFellows = fellows.filter((f) => chamber.members.includes(f.id));
  const chamberCommitments = commitments.filter((c) => c.chamberId === chamber.id);

  // Calculate totals
  const totalDue = chamberCommitments.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = chamberCommitments.reduce((sum, c) => sum + c.amountPaid, 0);
  const percentFulfilled = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  // Current user's commitments
  const myCommitments = chamberCommitments.filter((c) => c.fellowId === currentFellowId);

  const getStatusBadge = (status: Commitment['status'], revisedDate?: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Honoured
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" />
            Partially Honoured {revisedDate ? `(Target: ${revisedDate})` : ''}
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded-full font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Hardship Communicated
          </span>
        );
      case 'extended':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" />
            Extended Date
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 text-xs px-2.5 py-1 rounded-full font-medium">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Chamber Banner */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {chamber.code}
              </span>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Cycle: {chamber.cycle}
              </span>
            </div>
            <h1 className="text-xl font-bold text-stone-900 mt-1.5">{chamber.name}</h1>
            <p className="text-xs text-stone-600 mt-0.5">{chamber.location}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-request-peer-support"
              onClick={onOpenPeerSupportModal}
              className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors border border-stone-300"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Request or Offer Peer Support
            </button>
          </div>
        </div>

        {/* Progress and Chamber Stats */}
        <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-stone-50/80 rounded-lg p-3.5 border border-stone-200/60">
            <span className="text-xs text-stone-500 font-medium">Total Accommodation Pool</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-stone-900">
                {chamber.currency}
                {(chamber.totalMonthlyRent + chamber.totalUtilities).toLocaleString()}
              </span>
              <span className="text-xs text-stone-400">/ month</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Rent: {chamber.currency}
              {chamber.totalMonthlyRent.toLocaleString()} • Utilities: {chamber.currency}
              {chamber.totalUtilities.toLocaleString()}
            </p>
          </div>

          <div className="bg-stone-50/80 rounded-lg p-3.5 border border-stone-200/60">
            <span className="text-xs text-stone-500 font-medium">Chamber Fulfillment</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-bold text-stone-900">{percentFulfilled}%</span>
              <span className="text-xs text-emerald-600 font-medium">
                ({chamber.currency}
                {totalPaid.toLocaleString()} paid)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-stone-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentFulfilled}%` }}
              />
            </div>
          </div>

          <div className="bg-stone-50/80 rounded-lg p-3.5 border border-stone-200/60">
            <span className="text-xs text-stone-500 font-medium">Target Settlement Date</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-stone-900">{chamber.dueDate}</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5 flex items-center gap-1">
              <span className="text-xs" aria-hidden="true">🛖</span> Direct peer settlement (No gatekeeper)
            </p>
          </div>
        </div>
      </div>

      {/* Current User's Direct Responsibility */}
      <div className="bg-gradient-to-br from-amber-500/5 via-stone-50 to-white rounded-xl border border-amber-500/20 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-700 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Your Active Accommodation Responsibilities</h2>
              <p className="text-xs text-stone-500">Individual commitments logged for this settlement window</p>
            </div>
          </div>
        </div>

        {myCommitments.length === 0 ? (
          <p className="text-xs text-stone-500 mt-4">No pending commitments found for this chamber cycle.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {myCommitments.map((com) => {
              const remaining = com.amount - com.amountPaid;
              return (
                <div
                  key={com.id}
                  id={`commitment-card-${com.id}`}
                  className="bg-white rounded-lg p-4 border border-stone-200 shadow-xs hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                        {com.category}
                      </span>
                      <h3 className="text-sm font-semibold text-stone-900 mt-0.5">{com.title}</h3>
                    </div>
                    {getStatusBadge(com.status, com.revisedDueDate)}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-stone-400">Total Share</span>
                      <p className="text-base font-bold text-stone-900">
                        {com.currency}
                        {com.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-400">Amount Paid</span>
                      <p className="text-base font-semibold text-emerald-600">
                        {com.currency}
                        {com.amountPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {remaining > 0 && (
                    <div className="mt-2.5 p-2 bg-stone-50 rounded text-xs flex justify-between items-center border border-stone-100">
                      <span className="text-stone-600">Remaining Due:</span>
                      <span className="font-bold text-amber-800">
                        {com.currency}
                        {remaining.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {com.repairNotes && (
                    <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded text-[11px] text-amber-900">
                      <span className="font-semibold flex items-center gap-1">
                        <MessageSquareShare className="w-3.5 h-3.5" /> Note to Roommates:
                      </span>
                      <p className="mt-0.5">{com.repairNotes}</p>
                    </div>
                  )}

                  {com.paymentReference && (
                    <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Ref: {com.paymentReference}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                    {remaining > 0 ? (
                      <>
                        <button
                          id={`btn-record-payment-${com.id}`}
                          onClick={() => onOpenPaymentModal(com)}
                          className="flex-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Record Payment
                        </button>
                        <button
                          id={`btn-communicate-hardship-${com.id}`}
                          onClick={() => onOpenRepairModal(com)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium py-2 px-3 rounded-md transition-colors"
                          title="Communicate delay or request revised timeline"
                        >
                          Revise Timeline
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center py-1 text-xs text-emerald-700 font-medium bg-emerald-50 rounded-md border border-emerald-200/60 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Obligation Honoured for Cycle
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Roommates / Chamber Fellows Status */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Chamber Roommates & Collective Accountability</h2>
            <p className="text-xs text-stone-500">
              Clear expectations without shaming. Direct peer accountability built on dignity.
            </p>
          </div>
          <span className="text-xs font-medium text-stone-500">{chamberFellows.length} Fellows</span>
        </div>

        <div className="divide-y divide-stone-100">
          {chamberFellows.map((fellow) => {
            const fellowCommitments = chamberCommitments.filter((c) => c.fellowId === fellow.id);
            const fellowDue = fellowCommitments.reduce((s, c) => s + c.amount, 0);
            const fellowPaid = fellowCommitments.reduce((s, c) => s + c.amountPaid, 0);
            const isSettled = fellowPaid >= fellowDue && fellowDue > 0;
            const isPartial = fellowPaid > 0 && fellowPaid < fellowDue;
            const isOverdue = fellow.hasOverdueObligation;

            return (
              <div key={fellow.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img
                    src={fellow.avatar}
                    alt={fellow.name}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-stone-900">{fellow.name}</span>
                      <span className="text-xs text-stone-400 font-mono">{fellow.handle}</span>
                      <span className="bg-stone-100 text-stone-600 text-[10px] px-1.5 py-0.5 rounded">
                        {fellow.role}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{fellow.bio}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-400">
                      <span>Schedule: {fellow.stipendSchedule}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                  <div className="text-right">
                    <span className="text-xs text-stone-500">Contribution: </span>
                    <span className="text-xs font-bold text-stone-900">
                      {chamber.currency}
                      {fellowPaid.toLocaleString()} / {chamber.currency}
                      {fellowDue.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    {isSettled && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Fully Settled
                      </span>
                    )}
                    {isPartial && (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" /> 50% Paid (Staged)
                      </span>
                    )}
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" /> Repair in Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
