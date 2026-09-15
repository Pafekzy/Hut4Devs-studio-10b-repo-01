import React, { useState } from 'react';
import {
  AccommodationResponsibility,
  AccommodationPaymentIntent,
  calculateRemainingAmount,
  deriveAccommodationOperationalSummary,
  formatNaira,
  getStatusLabel,
} from '../domain/accommodation';
import { ExternalPaymentProposal } from '../domain/payments';
import { Member, MemberRole } from '../domain/auth';
import { ActiveMode, ScopedRoleAssignment, formatActionAttribution, ACCOMMODATION_PROPERTIES } from '../domain/membership';
import {
  DEMO_COMMAND_CENTER_RESPONSIBILITIES,
  DEMO_COMMAND_CENTER_PROVIDER_EVENTS,
  DEMO_COMMAND_CENTER_RECONCILIATIONS,
} from '../data/demoCommandCenterPopulation';
import { ModeSwitcher } from './ModeSwitcher';
import { FinancialNotesThread } from './FinancialNotesThread';
import { Hut4DevsLogo } from './Hut4DevsLogo';
import { ThemeToggle } from './ThemeToggle';
import { MissingPuzzleModal } from './MissingPuzzleModal';
import { MemberNotificationsDropdown } from './MemberNotificationsDropdown';
import { MemberNotification, NotificationTargetWorkspace } from '../services/notificationStore';
import {
  ShieldAlert,
  ArrowRight,
  LogOut,
  Building2,
  Layers,
  DoorClosed,
  User,
  FileText,
  UserCheck,
  Activity,
  Radio,
  Filter,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Puzzle,
} from 'lucide-react';

export interface AdminProviderEventDisplay {
  id?: string;
  provider: string;
  providerEventId: string;
  eventType: string;
  providerStatus: string;
  providerProposalId?: string | null;
  statusLabel?: string;
  notice?: string;
  receivedAt?: string;
}

interface AccommodationAdminViewProps {
  isDark: boolean;
  responsibilities: AccommodationResponsibility[];
  onToggleTheme: () => void;
  onSwitchToFellow: () => void;
  onExitToLanding: () => void;
  paymentProposals?: ExternalPaymentProposal[];
  preparedIntents?: AccommodationPaymentIntent[];
  providerEvents?: AdminProviderEventDisplay[];
  reconciliations?: any[];
  streamStatus?: 'connecting' | 'connected' | 'error' | 'disconnected';
  onReconcileEvent?: (providerEventId: string) => void;
  currentMember?: Member;
  currentMode?: ActiveMode;
  scopedRoles?: ScopedRoleAssignment[];
  onModeChange?: (mode: ActiveMode) => void;
  onNavigate?: (notif: MemberNotification) => void;
}

type AttentionFilterType =
  | 'ALL'
  | 'OUTSTANDING'
  | 'PARTIALLY_FULFILLED'
  | 'AWAITING_RECONCILIATION'
  | 'MISMATCH'
  | 'FULFILLED';

export const AccommodationAdminView: React.FC<AccommodationAdminViewProps> = ({
  isDark,
  responsibilities,
  onToggleTheme,
  onSwitchToFellow,
  onExitToLanding,
  paymentProposals = [],
  preparedIntents = [],
  providerEvents = [],
  reconciliations = [],
  streamStatus = 'disconnected',
  onReconcileEvent,
  currentMember,
  currentMode = 'FINANCIAL_ADMIN',
  scopedRoles = [],
  onModeChange,
  onNavigate,
}) => {
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false);

  // Scope mode: default to ALL_FELLOWS if population has multiple records or if not restricted to single
  const [scopeMode, setScopeMode] = useState<'ALL_FELLOWS' | 'SINGLE'>(() =>
    responsibilities.length === 1 ? 'SINGLE' : 'ALL_FELLOWS'
  );

  const effectiveResponsibilities =
    scopeMode === 'SINGLE'
      ? (responsibilities.length === 1 ? responsibilities : [responsibilities[0]])
      : (responsibilities.length > 1 ? responsibilities : DEMO_COMMAND_CENTER_RESPONSIBILITIES);

  const effectiveProviderEvents =
    providerEvents.length > 0
      ? providerEvents
      : (scopeMode === 'ALL_FELLOWS' ? DEMO_COMMAND_CENTER_PROVIDER_EVENTS : []);

  const effectiveReconciliations =
    reconciliations.length > 0
      ? reconciliations
      : (scopeMode === 'ALL_FELLOWS' ? DEMO_COMMAND_CENTER_RECONCILIATIONS : []);

  const summary = deriveAccommodationOperationalSummary(effectiveResponsibilities);
  const [attentionFilter, setAttentionFilter] = useState<AttentionFilterType>('ALL');
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  const attribution = currentMember
    ? formatActionAttribution(currentMember, currentMode)
    : { actingCapacity: 'Accommodation Financial Admin', displayLabel: 'Chief Financial Admin' };

  // Calculate counts for attention filters
  const hasAwaitingReconciliation = (respId: string) =>
    effectiveProviderEvents.some(
      (evt) =>
        evt.providerStatus === 'COMPLETED' &&
        (evt.providerProposalId === respId || evt.id === respId || (evt as any).responsibilityId === respId) &&
        !effectiveReconciliations.some((r) => r.providerEventId === evt.providerEventId && r.reconciliationStatus === 'VERIFIED')
    );

  const hasMismatch = (respId: string) =>
    effectiveReconciliations.some(
      (r) => (r.responsibilityId === respId || (r as any).respId === respId) && r.reconciliationStatus === 'MISMATCH'
    );

  // Believable 32-Fellow population counts for top attention cards
  const outstandingCount = effectiveResponsibilities.filter((r) => r.status === 'OUTSTANDING').length;
  const partiallyFulfilledCount = effectiveResponsibilities.filter((r) => r.status === 'PARTIALLY_FULFILLED').length;
  const awaitingReconciliationCount = effectiveResponsibilities.filter((r) => hasAwaitingReconciliation(r.id)).length;
  const mismatchCount = effectiveResponsibilities.filter((r) => hasMismatch(r.id)).length;
  const fulfilledCount = effectiveResponsibilities.filter((r) => r.status === 'FULFILLED').length;
  const allCount = effectiveResponsibilities.length;

  const filteredResponsibilities = effectiveResponsibilities.filter((resp) => {
    if (attentionFilter === 'ALL') return true;
    if (attentionFilter === 'OUTSTANDING') return resp.status === 'OUTSTANDING';
    if (attentionFilter === 'PARTIALLY_FULFILLED') return resp.status === 'PARTIALLY_FULFILLED';
    if (attentionFilter === 'FULFILLED') return resp.status === 'FULFILLED';
    if (attentionFilter === 'AWAITING_RECONCILIATION') return hasAwaitingReconciliation(resp.id);
    if (attentionFilter === 'MISMATCH') return hasMismatch(resp.id);
    return true;
  });

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
      }`}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 w-full border-b transition-colors duration-200"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          backgroundColor: isDark ? 'rgba(47, 23, 7, 0.92)' : 'rgba(247, 241, 231, 0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onExitToLanding}
              className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer"
              title="Return to Public Landing"
            >
              <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
            </button>

            {currentMember && onModeChange && (
              <ModeSwitcher
                member={currentMember}
                scopedRoles={scopedRoles}
                currentMode={currentMode}
                onModeChange={onModeChange}
                isDark={isDark}
              />
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentMember && (
              <MemberNotificationsDropdown
                memberId={currentMember.id}
                isDark={isDark}
                onNavigate={onNavigate}
                buttonId="admin-notifications-btn"
                onOpenFeedbackReport={() => setIsPuzzleModalOpen(true)}
              />
            )}

            <button
              type="button"
              id="admin-btn-missing-puzzle"
              onClick={() => setIsPuzzleModalOpen(true)}
              title="Fix a Missing Puzzle (Feedback)"
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border-b-3 active:border-b active:translate-y-[1px] ${
                isDark
                  ? 'bg-[#3E200C] text-[#FFF9EE] border-[#C88D3A]/50 hover:bg-[#52270A]'
                  : 'bg-[#FFF9EE] text-[#5A2D0C] border-[#C88D3A]/60 hover:bg-[#F2E8D8]'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5 text-[#C88D3A]" />
              <span className="hidden sm:inline">Fix a Puzzle</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-lg border border-[#C88D3A]/30">
              <span
                id="realtime-sse-indicator"
                className={`w-2 h-2 rounded-full ${
                  streamStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : streamStatus === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-stone-400'
                }`}
              />
              <span className="capitalize">Live stream: {streamStatus}</span>
            </div>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={onExitToLanding}
              className="p-2 text-[#5A2D0C]/70 hover:text-[#5A2D0C] rounded-lg transition-colors cursor-pointer"
              title="Exit to Landing"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-2">
          <span
            className="text-xs sm:text-sm font-semibold uppercase tracking-wider block"
            style={{ color: isDark ? '#C88D3A' : '#B77620' }}
          >
            Command Center &bull; Attention-First Financial Accountability
          </span>
          <p className="text-[11px] opacity-70 mt-0.5">
            Development Preview: Accommodation Admin Workspace (No authentication or authorization is claimed in this preview)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1
            id="accommodation-admin-title"
            className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            Accommodation Admin
          </h1>

          {/* Scope Mode Control - Tactile Studio-10 Segmented Control */}
          <div
            className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl border-2 border-b-3 shadow-xs backdrop-blur-md"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.65)' : 'rgba(234, 224, 208, 0.70)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
            }}
          >
            <button
              type="button"
              id="scope-btn-community"
              onClick={() => setScopeMode('ALL_FELLOWS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-b-2 active:translate-y-[1px] ${
                scopeMode === 'ALL_FELLOWS'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
                  : 'text-[#704728] dark:text-[#D9C4AC] hover:text-[#5A2D0C] dark:hover:text-[#FFF9EE] border-transparent'
              }`}
            >
              Accredited Community (24 Fellows)
            </button>
            <button
              type="button"
              id="scope-btn-single"
              onClick={() => setScopeMode('SINGLE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-b-2 active:translate-y-[1px] ${
                scopeMode === 'SINGLE'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] shadow-xs'
                  : 'text-[#704728] dark:text-[#D9C4AC] hover:text-[#5A2D0C] dark:hover:text-[#FFF9EE] border-transparent'
              }`}
            >
              Focus Session (1 Record)
            </button>
          </div>
        </div>

        {/* 6 Top Attention Metric Cards - Tactile 3D Studio-10 Language */}
        <section
          aria-label="Attention Metrics"
          className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5"
        >
          {/* 1. Outstanding */}
          <button
            type="button"
            id="metric-card-outstanding"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('OUTSTANDING');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'OUTSTANDING'
                ? 'ring-2 ring-[#B77620]/40'
                : 'hover:border-[#B77620]/60'
            }`}
            style={{
              backgroundColor: attentionFilter === 'OUTSTANDING'
                ? (isDark ? 'rgba(42, 34, 28, 0.75)' : 'rgba(247, 241, 231, 0.90)')
                : (isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)'),
              borderColor: attentionFilter === 'OUTSTANDING'
                ? (isDark ? '#C88D3A' : '#B77620')
                : (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)'),
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#B77620]">Outstanding Dues</span>
              <AlertTriangle className="w-3.5 h-3.5 text-[#B77620]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#B77620]">{outstandingCount}</div>
            <div className="text-[10px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Awaiting dues</div>
          </button>

          {/* 2. Partially Fulfilled */}
          <button
            type="button"
            id="metric-card-partially-fulfilled"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('PARTIALLY_FULFILLED');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'PARTIALLY_FULFILLED'
                ? 'ring-2 ring-[#C88D3A]/40'
                : 'hover:border-[#C88D3A]/60'
            }`}
            style={{
              backgroundColor: attentionFilter === 'PARTIALLY_FULFILLED'
                ? (isDark ? 'rgba(42, 34, 28, 0.75)' : 'rgba(247, 241, 231, 0.90)')
                : (isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)'),
              borderColor: attentionFilter === 'PARTIALLY_FULFILLED'
                ? '#C88D3A'
                : (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)'),
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#C88D3A]">Partial</span>
              <Clock className="w-3.5 h-3.5 text-[#C88D3A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#C88D3A]">{partiallyFulfilledCount}</div>
            <div className="text-[10px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Active installment</div>
          </button>

          {/* 3. Awaiting Reconciliation */}
          <button
            type="button"
            id="metric-card-awaiting-reconciliation"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('AWAITING_RECONCILIATION');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'AWAITING_RECONCILIATION'
                ? 'ring-2 ring-[#B77620]/40'
                : 'hover:border-[#B77620]/60'
            }`}
            style={{
              backgroundColor: attentionFilter === 'AWAITING_RECONCILIATION'
                ? (isDark ? 'rgba(42, 34, 28, 0.75)' : 'rgba(247, 241, 231, 0.90)')
                : (isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)'),
              borderColor: attentionFilter === 'AWAITING_RECONCILIATION'
                ? (isDark ? '#C88D3A' : '#5A2D0C')
                : (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)'),
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#B77620]">Awaiting Recon</span>
              <Radio className="w-3.5 h-3.5 text-[#B77620]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
              {awaitingReconciliationCount}
            </div>
            <div className="text-[10px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Staged event</div>
          </button>

          {/* 4. Mismatch / Requires Review */}
          <button
            type="button"
            id="metric-card-mismatch"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('MISMATCH');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'MISMATCH'
                ? 'ring-2 ring-[#B91C1C]/40'
                : 'hover:border-[#B91C1C]/60'
            }`}
            style={{
              backgroundColor: attentionFilter === 'MISMATCH'
                ? (isDark ? 'rgba(42, 34, 28, 0.75)' : 'rgba(247, 241, 231, 0.90)')
                : (isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)'),
              borderColor: attentionFilter === 'MISMATCH'
                ? '#B91C1C'
                : (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)'),
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#B91C1C] dark:text-[#F87171]">Mismatch Review</span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#B91C1C] dark:text-[#F87171]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#B91C1C] dark:text-[#F87171]">{mismatchCount}</div>
            <div className="text-[10px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Audit flagged</div>
          </button>

          {/* 5. Fulfilled */}
          <button
            type="button"
            id="metric-card-fulfilled"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('FULFILLED');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'FULFILLED'
                ? 'ring-2 ring-[#2E6E45]/40'
                : 'hover:border-[#2E6E45]/60'
            }`}
            style={{
              backgroundColor: attentionFilter === 'FULFILLED'
                ? (isDark ? 'rgba(42, 34, 28, 0.75)' : 'rgba(247, 241, 231, 0.90)')
                : (isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)'),
              borderColor: attentionFilter === 'FULFILLED'
                ? '#2E6E45'
                : (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)'),
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#2E6E45] dark:text-[#4ADE80]">Fulfilled</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6E45] dark:text-[#4ADE80]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#2E6E45] dark:text-[#4ADE80]">{fulfilledCount}</div>
            <div className="text-[10px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Verified complete</div>
          </button>

          {/* 6. All Fellows */}
          <button
            type="button"
            id="metric-card-all"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('ALL');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'ALL'
                ? 'ring-2 ring-[#C88D3A]/40'
                : 'hover:border-[#5A2D0C]'
            }`}
            style={{
              backgroundColor: attentionFilter === 'ALL'
                ? (isDark ? 'rgba(42, 34, 28, 0.75)' : 'rgba(247, 241, 231, 0.90)')
                : (isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)'),
              borderColor: attentionFilter === 'ALL'
                ? (isDark ? '#C88D3A' : '#5A2D0C')
                : (isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)'),
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>All Fellows</span>
              <UserCheck className="w-3.5 h-3.5 text-[#C88D3A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{allCount}</div>
            <div className="text-[10px] font-medium mt-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Total population</div>
          </button>
        </section>

        {/* Multi-Property Contextual Rates */}
        <section
          aria-labelledby="properties-rates-heading"
          className="mb-6 rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div
            className="flex items-center justify-between mb-4 border-b-2 pb-3"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C88D3A]" />
              <h2
                id="properties-rates-heading"
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Accredited Property Commitments (Multi-Property Architecture)
              </h2>
            </div>
            <span
              className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
                color: isDark ? '#C88D3A' : '#B77620',
              }}
            >
              Rates Vary By Property Scope
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {ACCOMMODATION_PROPERTIES.map((prop) => (
              <div
                key={prop.id}
                className="p-3.5 sm:p-4 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-xs flex flex-col justify-between text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                }}
              >
                <div>
                  <div className="font-bold text-sm" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{prop.name}</div>
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>{prop.location}</div>
                </div>
                <div
                  className="mt-3 pt-2.5 border-t-2 flex items-center justify-between"
                  style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.10)' }}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Required</span>
                  <span className="font-bold font-mono text-[#B77620] text-xs sm:text-sm">
                    ₦{prop.monthlyCommitment.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Operational Summary Grid (Required Test Selectors) */}
        <section
          aria-labelledby="operational-summary-heading"
          className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 mb-6 transition-all duration-200 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div
            className="flex items-center justify-between border-b-2 pb-4 mb-5"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
          >
            <h2
              id="operational-summary-heading"
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
              style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}
            >
              Operational Summary
            </h2>
            <span
              className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded font-bold shadow-xs border"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)',
                color: isDark ? '#C88D3A' : '#B77620',
              }}
            >
              Derived
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div
              id="summary-properties-count"
              className="min-w-0 flex flex-col justify-between p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-xs min-h-[104px]"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <Building2 className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                  Properties: {summary.propertiesCount}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                {summary.propertiesCount}
              </p>
            </div>

            <div
              id="summary-rooms-count"
              className="min-w-0 flex flex-col justify-between p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-xs min-h-[104px]"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <DoorClosed className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                  Rooms represented: {summary.roomsRepresentedCount}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                {summary.roomsRepresentedCount}
              </p>
            </div>

            <div
              id="summary-fellows-count"
              className="min-w-0 flex flex-col justify-between p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-xs min-h-[104px]"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <User className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                  Fellows represented: {summary.fellowsRepresentedCount}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                {summary.fellowsRepresentedCount}
              </p>
            </div>

            <div
              id="summary-outstanding-count"
              className="min-w-0 flex flex-col justify-between p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-xs min-h-[104px]"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <FileText className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider leading-snug" style={{ color: isDark ? '#D9C4AC' : '#B77620' }}>
                  Outstanding responsibilities: {summary.outstandingResponsibilitiesCount}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#B77620]">
                {summary.outstandingResponsibilitiesCount}
              </p>
            </div>
          </div>
        </section>

        {/* Attention-First Filter Bar */}
        <section
          className="mb-6 rounded-2xl p-4 sm:p-5 border-2 border-b-4 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div
            className="flex items-center justify-between mb-3.5 border-b-2 pb-2.5"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#C88D3A]" />
              <h3
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Attention Queue Filter
              </h3>
            </div>
            <span
              className="text-[11px] font-mono font-medium"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              Showing {filteredResponsibilities.length} of {effectiveResponsibilities.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              id="filter-attention-all"
              type="button"
              onClick={() => setAttentionFilter('ALL')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:border-b active:translate-y-[1px] ${
                attentionFilter === 'ALL'
                  ? (isDark ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]' : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]')
                  : 'hover:-translate-y-0.5'
              }`}
              style={attentionFilter !== 'ALL' ? {
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(255, 253, 248, 0.70)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.18)',
                color: isDark ? '#D9C4AC' : '#704728',
              } : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${attentionFilter === 'ALL' ? (isDark ? 'bg-[#241104]' : 'bg-[#FFF9EE]') : 'bg-[#C88D3A]'}`} />
              <span>All Records ({effectiveResponsibilities.length})</span>
            </button>

            <button
              id="filter-attention-outstanding"
              type="button"
              onClick={() => setAttentionFilter('OUTSTANDING')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:border-b active:translate-y-[1px] ${
                attentionFilter === 'OUTSTANDING'
                  ? (isDark ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]' : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]')
                  : 'hover:-translate-y-0.5'
              }`}
              style={attentionFilter !== 'OUTSTANDING' ? {
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(255, 253, 248, 0.70)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.18)',
                color: isDark ? '#D9C4AC' : '#704728',
              } : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${attentionFilter === 'OUTSTANDING' ? (isDark ? 'bg-[#241104]' : 'bg-[#FFF9EE]') : 'bg-[#B77620]'}`} />
              <span>Outstanding ({outstandingCount})</span>
            </button>

            <button
              id="filter-attention-partially-fulfilled"
              type="button"
              onClick={() => setAttentionFilter('PARTIALLY_FULFILLED')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:border-b active:translate-y-[1px] ${
                attentionFilter === 'PARTIALLY_FULFILLED'
                  ? (isDark ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]' : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]')
                  : 'hover:-translate-y-0.5'
              }`}
              style={attentionFilter !== 'PARTIALLY_FULFILLED' ? {
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(255, 253, 248, 0.70)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.18)',
                color: isDark ? '#D9C4AC' : '#704728',
              } : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${attentionFilter === 'PARTIALLY_FULFILLED' ? (isDark ? 'bg-[#241104]' : 'bg-[#FFF9EE]') : 'bg-amber-600'}`} />
              <span>Partially Fulfilled ({partiallyFulfilledCount})</span>
            </button>

            <button
              id="filter-attention-awaiting-reconciliation"
              type="button"
              onClick={() => setAttentionFilter('AWAITING_RECONCILIATION')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:border-b active:translate-y-[1px] ${
                attentionFilter === 'AWAITING_RECONCILIATION'
                  ? (isDark ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]' : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]')
                  : 'hover:-translate-y-0.5'
              }`}
              style={attentionFilter !== 'AWAITING_RECONCILIATION' ? {
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(255, 253, 248, 0.70)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.18)',
                color: isDark ? '#D9C4AC' : '#704728',
              } : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${attentionFilter === 'AWAITING_RECONCILIATION' ? (isDark ? 'bg-[#241104]' : 'bg-[#FFF9EE]') : 'bg-[#704728]'}`} />
              <span>Awaiting Reconciliation ({awaitingReconciliationCount})</span>
            </button>

            <button
              id="filter-attention-mismatch"
              type="button"
              onClick={() => setAttentionFilter('MISMATCH')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:border-b active:translate-y-[1px] ${
                attentionFilter === 'MISMATCH'
                  ? (isDark ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]' : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]')
                  : 'hover:-translate-y-0.5'
              }`}
              style={attentionFilter !== 'MISMATCH' ? {
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(255, 253, 248, 0.70)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.18)',
                color: isDark ? '#D9C4AC' : '#704728',
              } : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${attentionFilter === 'MISMATCH' ? (isDark ? 'bg-[#241104]' : 'bg-[#FFF9EE]') : 'bg-red-600'}`} />
              <span>Mismatch / Requires Review ({mismatchCount})</span>
            </button>

            <button
              id="filter-attention-fulfilled"
              type="button"
              onClick={() => setAttentionFilter('FULFILLED')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:border-b active:translate-y-[1px] ${
                attentionFilter === 'FULFILLED'
                  ? (isDark ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]' : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]')
                  : 'hover:-translate-y-0.5'
              }`}
              style={attentionFilter !== 'FULFILLED' ? {
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.50)' : 'rgba(255, 253, 248, 0.70)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.18)',
                color: isDark ? '#D9C4AC' : '#704728',
              } : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${attentionFilter === 'FULFILLED' ? (isDark ? 'bg-[#241104]' : 'bg-[#FFF9EE]') : 'bg-emerald-600'}`} />
              <span>Fulfilled ({fulfilledCount})</span>
            </button>
          </div>
        </section>

        {/* Accommodation Allocations List */}
        <section aria-labelledby="allocations-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              id="allocations-heading"
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
              style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}
            >
              Accommodation Allocation &amp; Operational Records
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              {filteredResponsibilities.length} Record{filteredResponsibilities.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredResponsibilities.map((resp) => {
            const remaining = calculateRemainingAmount(resp);
            const statusLabel = getStatusLabel(resp.status);
            const isNotesExpanded = expandedNotesId === resp.id;

            return (
              <article
                key={resp.id}
                id={`admin-record-${resp.id}`}
                className="rounded-2xl p-6 sm:p-8 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
                style={{
                  backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                }}
              >
                {/* Structural Hierarchy: Property → Floor → Room → Fellow → Responsibility */}
                <div className="mb-6">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider block mb-3"
                    style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                  >
                    Allocation Hierarchy
                  </span>

                  <div
                    className="rounded-xl p-4 sm:p-5 border-2 border-b-3 font-mono text-sm leading-relaxed backdrop-blur-xs shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                    }}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Building2 className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                      <span style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                        {resp.accommodationContext.property.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-4 pt-1">
                      <span style={{ color: isDark ? '#C88D3A' : '#B77620' }}>→</span>
                      <Layers className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
                      <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                        {resp.accommodationContext.floor.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-8 pt-1">
                      <span style={{ color: isDark ? '#C88D3A' : '#B77620' }}>→</span>
                      <DoorClosed className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
                      <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                        {resp.accommodationContext.room.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-12 pt-1 font-medium">
                      <span style={{ color: isDark ? '#C88D3A' : '#B77620' }}>→</span>
                      <User className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
                      <span style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                        {resp.fellow.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-16 pt-1 font-bold">
                      <span style={{ color: isDark ? '#C88D3A' : '#B77620' }}>→</span>
                      <FileText className="w-3.5 h-3.5 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                      <span style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                        {resp.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial State Breakdown */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 border-b-3 mb-6 backdrop-blur-xs shadow-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                  }}
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Required:</span>
                    <p className="text-base sm:text-lg font-bold font-mono tracking-tight" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                      {formatNaira(resp.requiredAmount)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Verified:</span>
                    <p className="text-base sm:text-lg font-semibold font-mono tracking-tight" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                      {formatNaira(resp.verifiedAmount)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1 text-[#B77620]">Remaining:</span>
                    <p className="text-base sm:text-lg font-bold font-mono tracking-tight text-[#B77620]">
                      {formatNaira(remaining)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Status:</span>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 border-b-3 shadow-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.8)' : 'rgba(247, 241, 231, 0.9)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(183, 118, 32, 0.35)',
                        color: isDark ? '#E2AB5D' : '#B77620',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#B77620]" />
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Real-Time Operational Payment Preparation Activity */}
                {preparedIntents.some((i) => i.responsibilityId === resp.id) && (
                  <div
                    id={`admin-payment-preparations-${resp.id}`}
                    className="mb-4 p-4 sm:p-5 rounded-xl border-2 border-b-3 shadow-xs backdrop-blur-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(249, 245, 238, 0.70)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(200, 141, 58, 0.25)',
                    }}
                  >
                    <div
                      className="flex items-center justify-between border-b-2 pb-2.5 mb-3"
                      style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#C88D3A]" />
                        <h3
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          Operational Activity: Payment Preparation
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border bg-amber-500/10 text-[#B77620] border-amber-500/25">
                        Live Broadcast
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {preparedIntents
                        .filter((i) => i.responsibilityId === resp.id)
                        .map((intent) => (
                          <div
                            key={intent.id}
                            id={`admin-prep-intent-${intent.id}`}
                            className="p-3.5 sm:p-4 rounded-xl border-2 border-b-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs backdrop-blur-xs"
                            style={{
                              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.50)' : 'rgba(255, 253, 248, 0.75)',
                              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                            }}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                                  Payment Preparation
                                </span>
                                <span className="text-[#C88D3A]">&bull;</span>
                                <span className="font-medium" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                                  {resp.fellow?.name || 'Current Fellow'}
                                </span>
                              </div>
                              <div className="text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                                <span>{resp.title || 'September Accommodation'}</span>
                                <span>&bull;</span>
                                <span>
                                  Amount: <strong className="font-bold font-mono" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{formatNaira(intent.amount)}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-1">
                              <span
                                id="admin-intent-status-badge"
                                className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 border-b-3 shadow-xs"
                                style={{
                                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.8)' : 'rgba(254, 243, 199, 0.9)',
                                  borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : '#FCD34D',
                                  color: isDark ? '#F3BA6B' : '#B45309',
                                }}
                              >
                                Status: Prepared — Not Verified
                              </span>
                              <span className="text-[10px] italic" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                                * Unverified intent. Verified amount remains {formatNaira(resp.verifiedAmount)}.
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Proposal status if present */}
                {paymentProposals.some((p) => p.responsibilityId === resp.id) && (() => {
                  const proposal = paymentProposals.find((p) => p.responsibilityId === resp.id);
                  const isSim = proposal?.isSimulated || proposal?.provider === 'SIMULATED';
                  return (
                    <div
                      id={`admin-payment-prep-${resp.id}`}
                      className="mb-4 p-3.5 sm:p-4 rounded-xl border-2 border-b-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs backdrop-blur-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(249, 245, 238, 0.70)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(200, 141, 58, 0.25)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#B77620]">
                          {isSim ? 'SIMULATED PROVIDER:' : 'BMONI Proposal:'}
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] border"
                          style={{
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.8)' : 'rgba(254, 243, 199, 0.9)',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : '#FCD34D',
                            color: isDark ? '#F3BA6B' : '#B45309',
                          }}
                        >
                          {isSim ? 'Proposal: Simulated' : (proposal?.providerStatus || 'Pending Approval')}
                        </span>
                      </div>
                      <span className="italic text-[11px]" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                        {isSim ? 'No request was sent to BMONI. * Unverified.' : `* Unverified. Verified remains ${formatNaira(resp.verifiedAmount)}.`}
                      </span>
                    </div>
                  );
                })()}

                {/* Contextual Financial Notes Toggle & Section */}
                <div
                  className="mt-4 pt-4 border-t-2 flex flex-col gap-3"
                  style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.10)' }}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      id={`btn-toggle-notes-${resp.id}`}
                      onClick={() => setExpandedNotesId(isNotesExpanded ? null : resp.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold border-2 border-b-3 shadow-xs transition-all duration-150 cursor-pointer active:border-b active:translate-y-[1px] ${
                        isDark
                          ? 'bg-[#2A221C] text-[#FFF9EE] border-[#C88D3A]/40 hover:bg-[#3E200C]'
                          : 'bg-[#FFF9EE] text-[#5A2D0C] border-[#C88D3A]/50 hover:bg-[#F2E8D8]'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <span>{isNotesExpanded ? 'Close Financial Notes' : 'Contextual Financial Notes & Inquiries'}</span>
                    </button>
                    <span
                      className="text-[11px] font-mono font-medium"
                      style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                    >
                      Period: {resp.period || 'Current'}
                    </span>
                  </div>

                  {isNotesExpanded && currentMember && (
                    <div className="mt-2">
                      <FinancialNotesThread
                        responsibilityId={resp.id}
                        currentMember={currentMember}
                        activeMode={currentMode}
                        isDark={isDark}
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* Provider Event Store Operational Audit (H4D-FUNC-012) */}
        {providerEvents && providerEvents.length > 0 && (
          <div
            id="admin-provider-events-section"
            className="mt-6 p-5 sm:p-6 rounded-2xl border-2 border-b-4 shadow-md backdrop-blur-md flex flex-col gap-3 text-xs"
            style={{
              backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
            }}
          >
            <div
              className="flex items-center justify-between border-b-2 pb-3"
              style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#C88D3A]" />
                <span className="font-bold uppercase tracking-wider text-xs text-[#B77620]">
                  Provider Ingestion Audit &bull; Provider Events Received
                </span>
              </div>
              <span
                className="font-mono text-[10px] font-medium"
                style={{ color: isDark ? '#D9C4AC' : '#704728' }}
              >
                Total Ingested: {providerEvents.length} (Authoritative PostgreSQL Store)
              </span>
            </div>
            <div className="space-y-2.5 mt-1">
              {providerEvents.map((evt, idx) => (
                <div
                  key={evt.id || evt.providerEventId || idx}
                  id={`admin-provider-event-${evt.providerEventId || idx}`}
                  className="p-3.5 sm:p-4 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="font-bold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                        Provider: {evt.provider}
                      </span>
                      <span className="text-[#C88D3A]">&bull;</span>
                      <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Event: {evt.eventType}</span>
                      <span className="text-[#C88D3A]">&bull;</span>
                      <span className="text-[10px]" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>ID: {evt.providerEventId}</span>
                    </div>
                    <div className="text-[11px]" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                      Provider Status: <strong className="font-bold">{evt.providerStatus}</strong>
                      {evt.providerProposalId && (
                        <span> &bull; Proposal: {evt.providerProposalId}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    {(() => {
                      const rec = reconciliations.find((r) => r.providerEventId === evt.providerEventId);
                      if (rec && rec.reconciliationStatus === 'VERIFIED') {
                        return (
                          <span
                            className="px-2.5 py-1 rounded-full font-mono font-bold text-[10px] border-2 border-b-2 shadow-xs uppercase"
                            style={{
                              backgroundColor: isDark ? 'rgba(46, 110, 69, 0.2)' : '#DCFCE7',
                              borderColor: isDark ? 'rgba(74, 222, 128, 0.3)' : '#86EFAC',
                              color: isDark ? '#4ADE80' : '#15803D',
                            }}
                          >
                            Status: Verified &bull; Reconciled ({formatNaira(rec.amount)})
                          </span>
                        );
                      }
                      if (rec && rec.reconciliationStatus === 'MISMATCH') {
                        return (
                          <span
                            className="px-2.5 py-1 rounded-full font-mono font-bold text-[10px] border-2 border-b-2 shadow-xs uppercase"
                            style={{
                              backgroundColor: isDark ? 'rgba(185, 28, 28, 0.2)' : '#FEF2F2',
                              borderColor: isDark ? 'rgba(248, 113, 113, 0.3)' : '#FCA5A5',
                              color: isDark ? '#F87171' : '#B91C1C',
                            }}
                          >
                            Status: Requires Review &bull; {rec.reasonCode}
                          </span>
                        );
                      }
                      return (
                        <>
                          <span
                            id="admin-provider-event-status-badge"
                            className="px-2.5 py-1 rounded-full font-mono font-bold text-[10px] border-2 border-b-2 shadow-xs uppercase"
                            style={{
                              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.8)' : '#FEF3C7',
                              borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : '#FCD34D',
                              color: isDark ? '#F3BA6B' : '#B45309',
                            }}
                          >
                            Status: Received — Awaiting Reconciliation
                          </span>
                          {onReconcileEvent && (
                            <button
                              type="button"
                              onClick={() => onReconcileEvent(evt.providerEventId)}
                              className="mt-1 px-3 py-1.5 rounded-xl text-[10px] font-bold border-2 border-b-3 active:border-b active:translate-y-[1px] shadow-xs transition-all duration-150 cursor-pointer bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07] hover:bg-[#432108]"
                            >
                              Trigger Reconcile
                            </button>
                          )}
                        </>
                      );
                    })()}
                    <span className="text-[10px] italic" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                      * Provider event received. Not verified. Awaiting reconciliation.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Authoritative Payment Reconciliations Audit (H4D-FUNC-013) */}
        {reconciliations && reconciliations.length > 0 && (
          <div
            id="admin-reconciliations-section"
            className="mt-6 p-5 sm:p-6 rounded-2xl border-2 border-b-4 shadow-md backdrop-blur-md flex flex-col gap-3 text-xs"
            style={{
              backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
            }}
          >
            <div
              className="flex items-center justify-between border-b-2 pb-3"
              style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.20)' : 'rgba(90, 45, 12, 0.12)' }}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2E6E45] dark:text-[#4ADE80]" />
                <span className="font-bold uppercase tracking-wider text-xs text-[#B77620]">
                  Authoritative Payment Reconciliations &bull; Evidence Chain Audit
                </span>
              </div>
              <span
                className="font-mono text-[10px] font-medium"
                style={{ color: isDark ? '#D9C4AC' : '#704728' }}
              >
                Total Reconciled Records: {reconciliations.length}
              </span>
            </div>
            <div className="space-y-2.5 mt-1">
              {reconciliations.map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  id={`admin-reconciliation-${rec.id || idx}`}
                  className="p-3.5 sm:p-4 rounded-xl border-2 border-b-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(255, 253, 249, 0.70)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="font-bold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                        Amount: {formatNaira(rec.amount)}
                      </span>
                      <span className="text-[#C88D3A]">&bull;</span>
                      <span style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Provider: {rec.provider}</span>
                      <span className="text-[#C88D3A]">&bull;</span>
                      <span className="text-[10px]" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>Event ID: {rec.providerEventId}</span>
                    </div>
                    <div className="text-[11px]" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                      Reason: <strong className="font-bold">{rec.reasonCode}</strong>
                      {rec.reconciledAt && <span> &bull; Verified At: {new Date(rec.reconciledAt).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <span
                      className="px-2.5 py-1 rounded-full font-mono font-bold text-[10px] border-2 border-b-2 shadow-xs uppercase"
                      style={{
                        backgroundColor: rec.reconciliationStatus === 'VERIFIED'
                          ? (isDark ? 'rgba(46, 110, 69, 0.2)' : '#DCFCE7')
                          : (isDark ? 'rgba(185, 28, 28, 0.2)' : '#FEF2F2'),
                        borderColor: rec.reconciliationStatus === 'VERIFIED'
                          ? (isDark ? 'rgba(74, 222, 128, 0.3)' : '#86EFAC')
                          : (isDark ? 'rgba(248, 113, 113, 0.3)' : '#FCA5A5'),
                        color: rec.reconciliationStatus === 'VERIFIED'
                          ? (isDark ? '#4ADE80' : '#15803D')
                          : (isDark ? '#F87171' : '#B91C1C'),
                      }}
                    >
                      Status: {rec.reconciliationStatus === 'VERIFIED' ? 'VERIFIED' : 'Requires Review'}
                    </span>
                    <span className="text-[10px] italic" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                      {rec.reconciliationStatus === 'VERIFIED'
                        ? 'Evidence Chain Matched & Reconciled Atomically.'
                        : 'Financial State: Unchanged. Requires Administrative Review.'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="w-full py-5 text-center text-xs tracking-wider uppercase border-t transition-colors duration-200 mt-auto"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          color: isDark ? '#A67B54' : '#8A5D3B',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="normal-case tracking-normal">
            Hut4Devs Accommodation Admin &bull; Operational Command Center
          </p>
          {onSwitchToFellow && (
            <button
              type="button"
              id="admin-switch-to-fellow-banner-btn"
              onClick={onSwitchToFellow}
              className={`font-medium normal-case tracking-normal underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity text-xs ${
                isDark ? 'text-[#C88D3A]' : 'text-[#B77620]'
              }`}
            >
              Switch to Fellow View →
            </button>
          )}
        </div>
      </footer>

      {/* Missing Puzzle Feedback Flow */}
      <MissingPuzzleModal
        isOpen={isPuzzleModalOpen}
        onClose={() => setIsPuzzleModalOpen(false)}
        currentMember={
          currentMember ||
          ({
            id: 'admin-current',
            h4dMemberId: 'H4D-FIN-ADMIN',
            displayName: 'Accommodation Financial Admin',
            roles: [MemberRole.ACCOMMODATION_ADMIN],
            createdAt: '2025-01-01T00:00:00.000Z',
          } as Member)
        }
        isDark={isDark}
        defaultLocation="Accommodation Admin Workspace"
      />
    </div>
  );
};
