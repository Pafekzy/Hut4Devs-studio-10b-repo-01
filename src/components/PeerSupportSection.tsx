import React, { useState, useEffect } from 'react';
import {
  PeerSupportAgreement,
  PeerSupportType,
  PeerLoanStatus,
  TrustTrailEvent,
  PeerVouch,
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
  Footprints,
  Layers,
} from 'lucide-react';
import { PeerSupportModal } from './PeerSupportModal';
import { TrustTrailFeed } from './TrustTrailFeed';
import { VouchSection } from './VouchSection';

interface PeerSupportSectionProps {
  currentMember: Member;
  availableMembers: Member[];
  supports: PeerSupportAgreement[];
  trailEvents?: TrustTrailEvent[];
  vouches?: PeerVouch[];
  isDark?: boolean;
  initialSubTab?: 'agreements' | 'trust-trails' | 'vouches';
  onSubTabChange?: (subTab: 'agreements' | 'trust-trails' | 'vouches') => void;
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
  onAddVouch?: (
    targetMemberId: string,
    targetMemberName: string,
    context: string,
    confidence: 'high' | 'moderate' | 'cautious',
    scope: string,
    notes: string
  ) => void;
  onDeclineSupport?: (supportId: string, reason?: string) => void;
}

export const PeerSupportSection: React.FC<PeerSupportSectionProps> = ({
  currentMember,
  availableMembers,
  supports,
  trailEvents = [],
  vouches = [],
  isDark = false,
  initialSubTab = 'agreements',
  onSubTabChange,
  onCreateSupport,
  onRecordRepayment,
  onConvertToGift,
  onContributeToCampaign,
  onAddVouch,
  onDeclineSupport,
}) => {
  const [hubSubTab, setHubSubTab] = useState<'agreements' | 'trust-trails' | 'vouches'>(initialSubTab);
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedInitialType, setSelectedInitialType] = useState<PeerSupportType>('gift');

  useEffect(() => {
    if (initialSubTab) {
      setHubSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabSwitch = (tab: 'agreements' | 'trust-trails' | 'vouches') => {
    setHubSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

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
      {/* 3 Streamlined Peer Support & Trust Hub Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: CHOOSE SUPPORT PATH (Unified Gift, Lend, Contribute) */}
        <article
          id="card-action-choose-path"
          className="h4d-card-static rounded-2xl p-5 sm:p-6 border-2 border-b-4 shadow-md flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.75)',
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
                Solidarity
              </span>
            </div>

            <h3
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Choose Support Path
            </h3>

            <div className="space-y-2 mb-4">
              <div
                className="p-2.5 rounded-xl border flex items-start gap-2 text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : '#FFFDF8',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                }}
              >
                <Gift className="w-3.5 h-3.5 mt-0.5 text-purple-600 shrink-0" />
                <div>
                  <strong className="block text-[11px]" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    1. Gift
                  </strong>
                  <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Zero repayment obligation</span>
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl border flex items-start gap-2 text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : '#FFFDF8',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                }}
              >
                <HandCoins className="w-3.5 h-3.5 mt-0.5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block text-[11px]" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    2. Lend
                  </strong>
                  <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Clear repayment timeline &amp; forgiveness</span>
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl border flex items-start gap-2 text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : '#FFFDF8',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
                }}
              >
                <HeartHandshake className="w-3.5 h-3.5 mt-0.5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-[11px]" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    3. Contribute
                  </strong>
                  <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Shared community need &amp; chamber fund</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              id="btn-initiate-peer-support"
              onClick={() => handleOpenCreate('gift')}
              className={`h4d-btn-soft inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
                isDark
                  ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15]'
                  : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07]'
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Initiate Support</span>
            </button>

            {/* Quick-select path triggers maintaining test & flow compatibility */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-open-gift-modal"
                onClick={() => handleOpenCreate('gift')}
                className="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border text-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : '#FFFDF8',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                  color: isDark ? '#FCD34D' : '#5A2D0C',
                }}
              >
                + Gift
              </button>
              <button
                type="button"
                id="btn-open-loan-modal"
                onClick={() => handleOpenCreate('loan')}
                className="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border text-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : '#FFFDF8',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                  color: isDark ? '#FCD34D' : '#5A2D0C',
                }}
              >
                + Lend
              </button>
              <button
                type="button"
                id="btn-open-contrib-modal"
                onClick={() => handleOpenCreate('contribution')}
                className="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border text-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : '#FFFDF8',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                  color: isDark ? '#FCD34D' : '#5A2D0C',
                }}
              >
                + Campaign
              </button>
            </div>
          </div>
        </article>

        {/* CARD 2: TRAILS OF TRUST (Nested Trust Ledger) */}
        <article
          id="card-action-trust-trails"
          className="h4d-card-static rounded-2xl p-5 sm:p-6 border-2 border-b-4 shadow-md flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.75)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: isDark ? '#E5A955' : '#B77620' }}
              >
                Immutable Ledger
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  color: isDark ? '#F5C678' : '#8C4D11',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                }}
              >
                <Footprints className="w-3 h-3 mr-1 text-[#B77620] dark:text-[#C88D3A]" />
                Integrity
              </span>
            </div>

            <h3
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Trails of Trust
            </h3>

            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              Append-only chronological audit trail capturing every gift, repayment, and pooled chamber contribution with transparent receipts.
            </p>

            <div
              className="p-3 rounded-xl border mb-4 flex items-center justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : '#FFFDF8',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
              }}
            >
              <span className="text-xs font-medium" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                Recorded Events
              </span>
              <span className="font-mono font-bold text-xs" style={{ color: isDark ? '#FCD34D' : '#5A2D0C' }}>
                {trailEvents.length} Verifiable Events
              </span>
            </div>
          </div>

          <button
            type="button"
            id="btn-view-trust-trails"
            onClick={() => handleSubTabSwitch('trust-trails')}
            className={`h4d-btn-soft inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
              hubSubTab === 'trust-trails'
                ? isDark
                  ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                  : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                : isDark
                ? 'bg-[#2E1809] text-[#FFF9EE] hover:bg-[#3E200C] border-[#4A240A]'
                : 'bg-[#F7F1E7] text-[#5A2D0C] hover:bg-[#EFE5D5] border-[#D9C4AC]'
            }`}
          >
            <Footprints className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{hubSubTab === 'trust-trails' ? 'Viewing Trust Ledger' : 'Explore Trust Ledger'}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </article>

        {/* CARD 3: CONTEXTUAL VOUCHES (Nested Vouch Section) */}
        <article
          id="card-action-vouches"
          className="h4d-card-static rounded-2xl p-5 sm:p-6 border-2 border-b-4 shadow-md flex flex-col justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.75)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: isDark ? '#E5A955' : '#B77620' }}
              >
                Peer Attestation
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  color: isDark ? '#86EFAC' : '#166534',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                }}
              >
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                No Guarantor
              </span>
            </div>

            <h3
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Contextual Vouches
            </h3>

            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              Vouch for fellows across specific character and skill domains (craft, living harmony, reliability) without financial liability or debt risk.
            </p>

            <div
              className="p-3 rounded-xl border mb-4 flex items-center justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.4)' : '#FFFDF8',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.12)',
              }}
            >
              <span className="text-xs font-medium" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                Active Peer Vouches
              </span>
              <span className="font-mono font-bold text-xs" style={{ color: isDark ? '#FCD34D' : '#5A2D0C' }}>
                {vouches.length} Attestations
              </span>
            </div>
          </div>

          <button
            type="button"
            id="btn-view-vouches"
            onClick={() => handleSubTabSwitch('vouches')}
            className={`h4d-btn-soft inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
              hubSubTab === 'vouches'
                ? isDark
                  ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                  : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                : isDark
                ? 'bg-[#2E1809] text-[#FFF9EE] hover:bg-[#3E200C] border-[#4A240A]'
                : 'bg-[#F7F1E7] text-[#5A2D0C] hover:bg-[#EFE5D5] border-[#D9C4AC]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{hubSubTab === 'vouches' ? 'Viewing Peer Vouches' : 'View & Give Vouches'}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </article>
      </div>

      {/* Nested Hub Sub-Tab Navigator */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b-2"
        style={{ borderColor: isDark ? '#3E200C' : '#EAE0D0' }}
      >
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            type="button"
            id="hub-tab-agreements"
            onClick={() => handleSubTabSwitch('agreements')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-xs ${
              hubSubTab === 'agreements'
                ? isDark
                  ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                  : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                : isDark
                ? 'text-[#D9C4AC] hover:text-[#FFF9EE] hover:bg-[#3E200C] border-transparent'
                : 'text-[#6D4223] hover:text-[#5A2D0C] hover:bg-[#EFE5D5] border-transparent'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Agreements &amp; Campaigns ({supports.length})</span>
          </button>

          <button
            type="button"
            id="hub-tab-trust-trails"
            onClick={() => handleSubTabSwitch('trust-trails')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-xs ${
              hubSubTab === 'trust-trails'
                ? isDark
                  ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                  : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                : isDark
                ? 'text-[#D9C4AC] hover:text-[#FFF9EE] hover:bg-[#3E200C] border-transparent'
                : 'text-[#6D4223] hover:text-[#5A2D0C] hover:bg-[#EFE5D5] border-transparent'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Trails of Trust ({trailEvents.length})</span>
          </button>

          <button
            type="button"
            id="hub-tab-vouches"
            onClick={() => handleSubTabSwitch('vouches')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-xs ${
              hubSubTab === 'vouches'
                ? isDark
                  ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                  : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                : isDark
                ? 'text-[#D9C4AC] hover:text-[#FFF9EE] hover:bg-[#3E200C] border-transparent'
                : 'text-[#6D4223] hover:text-[#5A2D0C] hover:bg-[#EFE5D5] border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Contextual Vouches ({vouches.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ACTIVE AGREEMENTS & CAMPAIGNS */}
      {hubSubTab === 'agreements' && (
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
                            Shared Campaign
                          </span>
                        )}

                        {/* Status Badges */}
                        {isForgiven && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            <Gift className="w-3 h-3 mr-1" />
                            Forgiven into Gift
                          </span>
                        )}
                        {isRepaid && !isForgiven && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Fully Repaid
                          </span>
                        )}
                        {isOverdue && !isRepaid && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                          </span>
                        )}
                      </div>

                      <span
                        className="text-xs font-mono font-medium"
                        style={{ color: isDark ? '#D9C4AC' : '#8A5D3B' }}
                      >
                        {new Date(support.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Parties & Purpose */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-bold text-base"
                            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                          >
                            {support.fromMemberName}
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: isDark ? '#D9C4AC' : '#8A5D3B' }}
                          >
                            →
                          </span>
                          <span
                            className="font-bold text-base"
                            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                          >
                            {support.type === 'contribution'
                              ? support.title || 'Chamber Campaign'
                              : support.toMemberName}
                          </span>
                        </div>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: isDark ? '#D9C4AC' : '#6F4E37' }}
                        >
                          {support.purpose}
                        </p>
                      </div>

                      {/* Amounts */}
                      <div className="text-left md:text-right shrink-0">
                        <div
                          className="font-mono font-bold text-xl sm:text-2xl"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          ₦{support.amount.toLocaleString()}
                        </div>
                        {support.type === 'loan' && (
                          <div
                            className="text-xs font-mono"
                            style={{ color: isDark ? '#E5A955' : '#B77620' }}
                          >
                            Repaid: ₦{support.amountRepaid.toLocaleString()} / Remaining: ₦{remaining.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Loans & Campaigns */}
                    {support.type === 'loan' && (
                      <div className="space-y-1">
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: isDark ? '#3E200C' : '#EAE0D0' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.round((support.amountRepaid / support.amount) * 100))}%`,
                              backgroundColor: isForgiven ? '#9333EA' : isRepaid ? '#16A34A' : '#C88D3A',
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-mono">
                          <span style={{ color: isDark ? '#D9C4AC' : '#8A5D3B' }}>
                            {Math.round((support.amountRepaid / support.amount) * 100)}% Repaid
                          </span>
                          {support.repaymentDate && (
                            <span style={{ color: isDark ? '#D9C4AC' : '#8A5D3B' }}>
                              Due: {new Date(support.repaymentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Agreements */}
                    <div
                      className="pt-3 border-t flex flex-wrap items-center justify-end gap-2.5"
                      style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
                    >
                      {support.type === 'loan' && !isRepaid && !isForgiven && (
                        <>
                          <button
                            type="button"
                            id={`btn-repay-${support.id}`}
                            onClick={() => handleOpenRepay(support)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Record Repayment
                          </button>

                          {isCurrentUserLender && (
                            <button
                              type="button"
                              id={`btn-forgive-${support.id}`}
                              onClick={() => handleOpenForgive(support)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-purple-600 text-white hover:bg-purple-700"
                            >
                              Forgive Debt into Gift
                            </button>
                          )}
                        </>
                      )}

                      {support.type === 'contribution' && (
                        <button
                          type="button"
                          id={`btn-contrib-${support.id}`}
                          onClick={() => handleOpenCampaignContrib(support)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-amber-600 text-white hover:bg-amber-700"
                        >
                          + Contribute to Fund
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* VIEW 2: TRAILS OF TRUST FEED */}
      {hubSubTab === 'trust-trails' && (
        <div className="animate-in fade-in duration-150">
          <TrustTrailFeed trailEvents={trailEvents} availableMembers={availableMembers} isDark={isDark} />
        </div>
      )}

      {/* VIEW 3: CONTEXTUAL VOUCHES */}
      {hubSubTab === 'vouches' && (
        <div className="animate-in fade-in duration-150">
          <VouchSection
            vouches={vouches}
            availableMembers={availableMembers}
            currentMember={currentMember}
            isDark={isDark}
            onAddVouch={onAddVouch || (() => {})}
          />
        </div>
      )}

      {/* MODAL: CREATE PEER SUPPORT */}
      {isCreateModalOpen && (
        <PeerSupportModal
          onClose={() => setIsCreateModalOpen(false)}
          availableMembers={availableMembers}
          currentMember={currentMember}
          initialType={selectedInitialType}
          onSubmitSupport={onCreateSupport}
          isDark={isDark}
        />
      )}

      {/* MODAL: RECORD REPAYMENT */}
      {repayModalSupport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 border-2 border-b-4 shadow-xl space-y-4"
            style={{
              backgroundColor: isDark ? '#231206' : '#FFF9EE',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.3)',
            }}
          >
            <h3
              className="font-serif text-lg font-bold"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Record Loan Repayment
            </h3>
            <p className="text-xs" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
              Confirm repayment amount received from {repayModalSupport.toMemberName}.
            </p>
            <form onSubmit={handleConfirmRepay} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  Amount (₦)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.7)' : '#FFFDF8',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRepayModalSupport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : '#F7F1E7',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FORGIVE DEBT INTO GIFT */}
      {forgiveModalSupport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 border-2 border-b-4 shadow-xl space-y-4"
            style={{
              backgroundColor: isDark ? '#231206' : '#FFF9EE',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.3)',
            }}
          >
            <h3
              className="font-serif text-lg font-bold"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Permanently Forgive Debt into Gift
            </h3>
            <p className="text-xs" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
              Converting this loan of ₦{forgiveModalSupport.amount.toLocaleString()} into a gift permanently extinguishes repayment liability.
            </p>
            <form onSubmit={handleConfirmForgive} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  Solidarity Note
                </label>
                <textarea
                  value={forgiveReason}
                  onChange={(e) => setForgiveReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm border"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.7)' : '#FFFDF8',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgiveModalSupport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : '#F7F1E7',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                >
                  Confirm Forgiveness
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CAMPAIGN CONTRIBUTION */}
      {campaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 border-2 border-b-4 shadow-xl space-y-4"
            style={{
              backgroundColor: isDark ? '#231206' : '#FFF9EE',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.3)',
            }}
          >
            <h3
              className="font-serif text-lg font-bold"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Contribute to {campaignModal.title || 'Chamber Fund'}
            </h3>
            <form onSubmit={handleConfirmCampaignContrib} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  Contribution Amount (₦)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={campaignContribAmount}
                  onChange={(e) => setCampaignContribAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.7)' : '#FFFDF8',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  Note
                </label>
                <input
                  type="text"
                  value={campaignContribNote}
                  onChange={(e) => setCampaignContribNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.7)' : '#FFFDF8',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCampaignModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : '#F7F1E7',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                >
                  Contribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
