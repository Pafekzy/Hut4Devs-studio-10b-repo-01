import React, { useState } from 'react';
import {
  PeerSupportAgreement,
  PeerSupportType,
  PeerLoanStatus,
} from '../domain/peerSupport';
import { Member } from '../domain/auth';
import {
  HandCoins,
  Gift,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  Filter,
  Sparkles,
  Users,
  Info,
  DollarSign,
} from 'lucide-react';
import { PeerSupportModal } from './PeerSupportModal';

interface PeerSupportSectionProps {
  currentMember: Member;
  availableMembers: Member[];
  supports: PeerSupportAgreement[];
  isDark?: boolean;
  onCreateSupport: (data: {
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
  onRecordRepayment: (supportId: string, amount: number) => void;
  onConvertToGift: (supportId: string, reason: string) => void;
  onContributeToCampaign: (campaignId: string, amount: number, note?: string) => void;
  onDeclineSupport?: (supportId: string, reason?: string) => void;
}

export const PeerSupportSection: React.FC<PeerSupportSectionProps> = ({
  currentMember,
  availableMembers,
  supports,
  isDark = false,
  onCreateSupport,
  onRecordRepayment,
  onConvertToGift,
  onContributeToCampaign,
  onDeclineSupport,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedInitialType, setSelectedInitialType] = useState<PeerSupportType>('gift');

  // Modals for Actions
  const [repayModalSupport, setRepayModalSupport] = useState<PeerSupportAgreement | null>(null);
  const [repayAmount, setRepayAmount] = useState<number>(0);

  const [forgiveModalSupport, setForgiveModalSupport] = useState<PeerSupportAgreement | null>(null);
  const [forgiveReason, setForgiveReason] = useState<string>(
    'Solidarity and mutual support celebration. Debt permanently forgiven.'
  );

  const [campaignModal, setCampaignModal] = useState<PeerSupportAgreement | null>(null);
  const [campaignContribAmount, setCampaignContribAmount] = useState<number>(10000);
  const [campaignContribNote, setCampaignContribNote] = useState<string>('Chamber solidarity');

  // Filtered Agreements
  const filteredSupports = supports.filter((s) => {
    if (filterType === 'all') return true;
    return s.type === filterType;
  });

  const handleOpenCreate = (type: PeerSupportType) => {
    setSelectedInitialType(type);
    setIsCreateModalOpen(true);
  };

  const handleOpenRepay = (support: PeerSupportAgreement) => {
    const remaining = support.amount - support.amountRepaid;
    setRepayModalSupport(support);
    setRepayAmount(remaining > 0 ? remaining : support.amount);
  };

  const handleConfirmRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayModalSupport || repayAmount <= 0) return;
    onRecordRepayment(repayModalSupport.id, repayAmount);
    setRepayModalSupport(null);
  };

  const handleOpenForgive = (support: PeerSupportAgreement) => {
    setForgiveModalSupport(support);
  };

  const handleConfirmForgive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgiveModalSupport) return;
    onConvertToGift(forgiveModalSupport.id, forgiveReason);
    setForgiveModalSupport(null);
  };

  const handleOpenCampaignContrib = (campaign: PeerSupportAgreement) => {
    setCampaignModal(campaign);
  };

  const handleConfirmCampaignContrib = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignModal || campaignContribAmount <= 0) return;
    onContributeToCampaign(campaignModal.id, campaignContribAmount, campaignContribNote);
    setCampaignModal(null);
  };

  return (
    <div className="space-y-6">
      {/* 3 Core Peer Support Channels (Top Surface) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. GIFT Card */}
        <article
          id="card-action-gift"
          className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: isDark ? '#E5A955' : '#B77620' }}
              >
                Voluntary Support
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  color: isDark ? '#D8B4E2' : '#6B21A8',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-xs"
                  style={{ backgroundColor: '#9333EA' }}
                  aria-hidden="true"
                />
                No Debt
              </span>
            </div>

            <h3
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              1. Give a Gift
            </h3>

            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              Support a fellow with zero expectation of repayment. Gifts cannot be weaponized or converted into debt later.
            </p>
          </div>

          <button
            type="button"
            id="btn-open-gift-modal"
            onClick={() => handleOpenCreate('gift')}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
              isDark
                ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#261205]'
                : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#FFF9EE]'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Initiate Gift</span>
          </button>
        </article>

        {/* 2. LEND / BORROW Card */}
        <article
          id="card-action-loan"
          className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: isDark ? '#E5A955' : '#B77620' }}
              >
                Peer Coordination
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  color: isDark ? '#F5C678' : '#8C4D11',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-xs"
                  style={{ backgroundColor: isDark ? '#C88D3A' : '#B77620' }}
                  aria-hidden="true"
                />
                Clear Timelines
              </span>
            </div>

            <h3
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              2. Lend or Borrow
            </h3>

            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              Coordinate direct peer loans with clear timelines. Lenders can later permanently forgive debt into a gift.
            </p>
          </div>

          <button
            type="button"
            id="btn-open-loan-modal"
            onClick={() => handleOpenCreate('loan')}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
              isDark
                ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#261205]'
                : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#FFF9EE]'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Initiate Peer Loan</span>
          </button>
        </article>

        {/* 3. CONTRIBUTE Card */}
        <article
          id="card-action-contrib"
          className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: isDark ? '#E5A955' : '#B77620' }}
              >
                Shared Essentials
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  color: isDark ? '#86EFAC' : '#166534',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-xs"
                  style={{ backgroundColor: '#16A34A' }}
                  aria-hidden="true"
                />
                Pooled Funds
              </span>
            </div>

            <h3
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              3. Chamber Contribution
            </h3>

            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              Pool mutual resources for shared chamber necessities (solar inverters, mesh Wi-Fi) without social debt.
            </p>
          </div>

          <button
            type="button"
            id="btn-open-contrib-modal"
            onClick={() => handleOpenCreate('contribution')}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
              isDark
                ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#261205]'
                : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#FFF9EE]'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Create Shared Campaign</span>
          </button>
        </article>
      </div>

      {/* Main List Section with Filters */}
      <section
        className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2"
          style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
        >
          <div>
            <span
              className="text-xs font-bold uppercase tracking-wider block mb-1"
              style={{ color: isDark ? '#E5A955' : '#B77620' }}
            >
              Peer Support Agreements
            </span>
            <h2
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Active Agreements &amp; Campaigns
            </h2>
          </div>

          {/* Filter Chips */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl border"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
            }}
          >
            {[
              { id: 'all', label: 'All Agreements' },
              { id: 'loan', label: 'Peer Loans' },
              { id: 'gift', label: 'Gifts' },
              { id: 'contribution', label: 'Campaigns' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? isDark
                      ? 'bg-[#C88D3A] text-[#241104] shadow-xs'
                      : 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs'
                    : isDark
                    ? 'text-[#D9C4AC] hover:text-[#FFF9EE]'
                    : 'text-[#6D4223] hover:text-[#5A2D0C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agreements Stream */}
        <div className="space-y-5">
          {filteredSupports.length === 0 ? (
            <div
              className="text-center py-12 text-xs rounded-xl border border-dashed"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.2)',
                color: isDark ? '#D9C4AC' : '#8A5D3B',
              }}
            >
              No peer support agreements matching this filter.
            </div>
          ) : (
            filteredSupports.map((support) => {
              const isCurrentUserLender = support.fromMemberId === currentMember.id;
              const remaining = support.amount - support.amountRepaid;
              const isRepaid = support.amountRepaid >= support.amount;
              const isForgiven = support.status === 'CONVERTED_TO_GIFT';
              const isOverdue = support.status === 'OVERDUE';

              return (
                <div
                  key={support.id}
                  id={`peer-support-${support.id}`}
                  className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md space-y-4"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  {/* Top Bar: Badges + Timestamp */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b"
                    style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {support.type === 'loan' && (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-xs"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                            color: isDark ? '#F5C678' : '#8C4D11',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-xs"
                            style={{ backgroundColor: isDark ? '#C88D3A' : '#B77620' }}
                            aria-hidden="true"
                          />
                          Peer Loan
                        </span>
                      )}
                      {support.type === 'gift' && (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-xs"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                            color: isDark ? '#D8B4E2' : '#6B21A8',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-xs"
                            style={{ backgroundColor: '#9333EA' }}
                            aria-hidden="true"
                          />
                          Voluntary Gift
                        </span>
                      )}
                      {support.type === 'contribution' && (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-xs"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                            color: isDark ? '#86EFAC' : '#166534',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-xs"
                            style={{ backgroundColor: '#16A34A' }}
                            aria-hidden="true"
                          />
                          Chamber Campaign
                        </span>
                      )}

                      {isForgiven && (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-xs"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                            color: isDark ? '#F5C678' : '#B77620',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" /> Converted to Gift (Forgiven)
                        </span>
                      )}

                      {isOverdue && (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-xs"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                            color: isDark ? '#FCA5A5' : '#B91C1C',
                            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(185, 28, 28, 0.2)',
                          }}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Not Advisable (Delayed)
                        </span>
                      )}

                      {isRepaid && !isForgiven && support.type === 'loan' && (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-xs"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                            color: isDark ? '#86EFAC' : '#15803D',
                            borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(21, 128, 61, 0.2)',
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Fully Repaid
                        </span>
                      )}
                    </div>

                    <div
                      className="text-xs flex items-center gap-1 font-medium"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(support.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Middle Area: Participants & Details Card */}
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                    }}
                  >
                    {support.type === 'contribution' ? (
                      <div>
                        <h4
                          className="font-serif font-bold text-base sm:text-lg tracking-tight"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {support.title}
                        </h4>
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                        >
                          {support.purpose}
                        </p>
                        <div
                          className="mt-2 text-xs flex items-center gap-2 font-medium"
                          style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                        >
                          <span>Organized by: <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{support.fromMemberName}</strong></span>
                          <span>&bull;</span>
                          <span>{support.contributors?.length || 0} Peer Contributors</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="text-sm font-bold flex items-center gap-2"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          <span>{support.fromMemberName}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                          <span>{support.toMemberName}</span>
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                        >
                          {support.purpose}
                        </p>
                        {support.repaymentPeriod && (
                          <p
                            className="text-xs mt-1.5 font-medium"
                            style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                          >
                            Repayment Plan: <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{support.repaymentPeriod}</strong> ({support.repaymentDate})
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3-Column Figures Grid (matching Accommodation card) */}
                  <div
                    className="grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-4 border-t-2 border-b-2"
                    style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
                  >
                    <div>
                      <span
                        className="text-[11px] sm:text-xs block mb-1 truncate font-medium"
                        style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                      >
                        {support.type === 'contribution' ? 'Raised So Far' : 'Agreement Amount'}
                      </span>
                      <span
                        className="text-sm sm:text-base md:text-lg font-bold truncate block"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {support.currency}{support.amount.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-[11px] sm:text-xs block mb-1 truncate font-medium"
                        style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                      >
                        {support.type === 'contribution' ? 'Target Goal' : 'Amount Repaid'}
                      </span>
                      <span
                        className="text-sm sm:text-base md:text-lg font-bold truncate block"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {support.type === 'contribution' && support.targetAmount
                          ? `${support.currency}${support.targetAmount.toLocaleString()}`
                          : `${support.currency}${support.amountRepaid.toLocaleString()}`}
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-[11px] sm:text-xs block mb-1 truncate font-medium"
                        style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                      >
                        {support.type === 'contribution' ? 'Remaining Goal' : 'Remaining Balance'}
                      </span>
                      <span
                        className="text-sm sm:text-base md:text-lg font-bold truncate block"
                        style={{ color: isDark ? '#F5C678' : '#B77620' }}
                      >
                        {support.type === 'contribution' && support.targetAmount
                          ? `${support.currency}${Math.max(0, support.targetAmount - support.amount).toLocaleString()}`
                          : `${support.currency}${Math.max(0, support.amount - support.amountRepaid).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Campaign Progress Bar */}
                  {support.type === 'contribution' && support.targetAmount && (
                    <div className="space-y-1.5">
                      <div
                        className="flex justify-between text-xs font-semibold"
                        style={{ color: isDark ? '#D9C4AC' : '#5A2D0C' }}
                      >
                        <span>Campaign Progress ({Math.round((support.amount / support.targetAmount) * 100)}%)</span>
                        <span>
                          {support.currency}{support.amount.toLocaleString()} of {support.currency}{support.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-2.5 overflow-hidden border"
                        style={{
                          backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                          borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: isDark ? '#C88D3A' : '#B77620',
                            width: `${Math.min(100, Math.round((support.amount / support.targetAmount) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Forgiven Reason Callout */}
                  {isForgiven && (
                    <div
                      className="p-3 rounded-xl border text-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                        color: isDark ? '#FFF9EE' : '#5A2D0C',
                      }}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1" style={{ color: isDark ? '#F5C678' : '#B77620' }}>
                        <Gift className="w-3.5 h-3.5" />
                        <span>Debt Permanently Converted to Gift</span>
                      </div>
                      <p className="leading-relaxed opacity-90">
                        {support.forgivenReason || 'Mutual solidarity celebration. Full balance forgiven.'}
                      </p>
                    </div>
                  )}

                  {/* Bottom Actions Bar */}
                  <div
                    className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
                    style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
                  >
                    <div
                      className="text-xs font-medium"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      {support.notes && <span><strong>Context:</strong> {support.notes}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Campaign Contribution Action */}
                      {support.type === 'contribution' && support.status !== 'REPAID' && (
                        <button
                          type="button"
                          id={`btn-contribute-campaign-${support.id}`}
                          onClick={() => handleOpenCampaignContrib(support)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
                            isDark
                              ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15]'
                              : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07]'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Contribute to Campaign
                        </button>
                      )}

                      {/* Lender Action: Convert Debt to Gift */}
                      {support.type === 'loan' && isCurrentUserLender && remaining > 0 && !isForgiven && (
                        <button
                          type="button"
                          id={`btn-forgive-loan-${support.id}`}
                          onClick={() => handleOpenForgive(support)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border border-b-3 active:border-b active:translate-y-[1px] ${
                            isDark
                              ? 'bg-[rgba(42,34,28,0.7)] text-[#F5C678] border-[#C88D3A]/40 hover:bg-[rgba(52,44,38,0.8)]'
                              : 'bg-[#F7F1E7] text-[#5A2D0C] border-[#5A2D0C]/25 hover:bg-[#EFE5D5]'
                          }`}
                          title="Lender prerogative: permanently forgive outstanding balance into a voluntary gift"
                        >
                          <Gift className="w-3.5 h-3.5 text-[#B77620]" />
                          Convert to Gift (Forgive)
                        </button>
                      )}

                      {/* Repayment Action */}
                      {support.type === 'loan' && remaining > 0 && !isForgiven && (
                        <button
                          type="button"
                          id={`btn-record-repay-${support.id}`}
                          onClick={() => handleOpenRepay(support)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
                            isDark
                              ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15]'
                              : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07]'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Record Repayment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* MODAL 1: Create Peer Support (Gift / Loan / Contribution) */}
      {isCreateModalOpen && (
        <PeerSupportModal
          currentMember={currentMember}
          availableMembers={availableMembers}
          initialType={selectedInitialType}
          isDark={isDark}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitSupport={(data) => {
            onCreateSupport(data);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* MODAL 2: Record Repayment */}
      {repayModalSupport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#24211F] text-[#2B211B] dark:text-[#FFF9EE] rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-stone-200 dark:border-[#C88D3A]/40 animate-in fade-in zoom-in-95">
            <h3 className="font-serif font-bold text-[#5A2D0C] dark:text-[#FFF9EE] text-base">Record Loan Repayment</h3>
            <p className="text-xs text-stone-600 dark:text-[#D9C4AC] mt-1">
              Fulfilling agreement between {repayModalSupport.fromMemberName} and {repayModalSupport.toMemberName}.
            </p>

            <form onSubmit={handleConfirmRepay} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                  Repayment Amount ({repayModalSupport.currency})
                </label>
                <input
                  type="number"
                  min={100}
                  max={repayModalSupport.amount - repayModalSupport.amountRepaid}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#180A02] text-[#5A2D0C] dark:text-[#FFF9EE] border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl outline-none focus:border-[#C88D3A] font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-[#C88D3A]/20">
                <button
                  type="button"
                  onClick={() => setRepayModalSupport(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-100 dark:hover:bg-[#1E1B18] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-repay-modal"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#5A2D0C] hover:bg-[#432108] text-[#FFF9EE] dark:bg-[#C88D3A] dark:hover:bg-[#DDA250] dark:text-[#241104] border-b-3 border-[#381B07] dark:border-[#915B15] active:border-b active:translate-y-[1px] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Confirm Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Convert Debt to Gift (Forgive Debt) */}
      {forgiveModalSupport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#24211F] text-[#2B211B] dark:text-[#FFF9EE] rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-stone-200 dark:border-[#C88D3A]/40 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded-xl">
                <Gift className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="font-serif font-bold text-[#5A2D0C] dark:text-[#FFF9EE] text-base">Convert Debt to Gift (Forgive)</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-[#D9C4AC] leading-relaxed">
              As the original lender, you are choosing to permanently forgive the remaining{' '}
              <strong className="text-[#5A2D0C] dark:text-[#FFF9EE]">
                {forgiveModalSupport.currency}
                {(forgiveModalSupport.amount - forgiveModalSupport.amountRepaid).toLocaleString()}
              </strong>{' '}
              owed by {forgiveModalSupport.toMemberName}.
            </p>

            <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 rounded-xl text-[11px] text-emerald-950 dark:text-emerald-200">
              <strong>Hut4Devs Invariant:</strong> Once converted, this agreement is permanently recorded
              as a voluntary gift. It can NEVER be converted back to debt.
            </div>

            <form onSubmit={handleConfirmForgive} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Reason / Note for Forgiveness</label>
                <textarea
                  value={forgiveReason}
                  onChange={(e) => setForgiveReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#180A02] text-[#5A2D0C] dark:text-[#FFF9EE] border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl outline-none focus:border-[#C88D3A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-[#C88D3A]/20">
                <button
                  type="button"
                  onClick={() => setForgiveModalSupport(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-100 dark:hover:bg-[#1E1B18] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-forgive-modal"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white border-b-3 border-emerald-900 active:border-b active:translate-y-[1px] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Permanently Convert to Gift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Contribute to Campaign */}
      {campaignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#24211F] text-[#2B211B] dark:text-[#FFF9EE] rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-stone-200 dark:border-[#C88D3A]/40 animate-in fade-in zoom-in-95">
            <h3 className="font-serif font-bold text-[#5A2D0C] dark:text-[#FFF9EE] text-base">Contribute to Campaign</h3>
            <p className="text-xs text-stone-600 dark:text-[#D9C4AC] mt-1">
              Adding your solidarity support to "{campaignModal.title}".
            </p>

            <form onSubmit={handleConfirmCampaignContrib} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">
                  Contribution Amount ({campaignModal.currency})
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={campaignContribAmount}
                  onChange={(e) => setCampaignContribAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#180A02] text-[#5A2D0C] dark:text-[#FFF9EE] border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl outline-none focus:border-[#C88D3A] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D9C4AC] mb-1">Optional Note</label>
                <input
                  type="text"
                  value={campaignContribNote}
                  onChange={(e) => setCampaignContribNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#180A02] text-[#5A2D0C] dark:text-[#FFF9EE] border border-stone-300 dark:border-[#C88D3A]/40 rounded-xl outline-none focus:border-[#C88D3A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-[#C88D3A]/20">
                <button
                  type="button"
                  onClick={() => setCampaignModal(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-[#D9C4AC] hover:bg-stone-100 dark:hover:bg-[#1E1B18] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-campaign-contrib"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white border-b-3 border-purple-900 active:border-b active:translate-y-[1px] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
