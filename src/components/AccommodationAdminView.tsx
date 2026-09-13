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

  // Believable 24-Fellow population counts for top attention cards
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

          {/* Scope Mode Control */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#EAE0D0] dark:bg-[#3E200C] border border-[#C88D3A]/30">
            <button
              type="button"
              id="scope-btn-community"
              onClick={() => setScopeMode('ALL_FELLOWS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scopeMode === 'ALL_FELLOWS'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs'
                  : 'text-[#5A2D0C] dark:text-[#D9C4AC] hover:text-[#B77620]'
              }`}
            >
              Accredited Community (24 Fellows)
            </button>
            <button
              type="button"
              id="scope-btn-single"
              onClick={() => setScopeMode('SINGLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scopeMode === 'SINGLE'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs'
                  : 'text-[#5A2D0C] dark:text-[#D9C4AC] hover:text-[#B77620]'
              }`}
            >
              Focus Session (1 Record)
            </button>
          </div>
        </div>

        {/* 6 Top Attention Metric Cards */}
        <section
          aria-label="Attention Metrics"
          className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5"
        >
          {/* 1. Outstanding: 4 */}
          <button
            type="button"
            id="metric-card-outstanding"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('OUTSTANDING');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-150 cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'OUTSTANDING'
                ? 'border-[#B77620] ring-2 ring-[#B77620]/50 bg-amber-100/60 dark:bg-amber-950/50 shadow-md'
                : 'border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 bg-white/60 dark:bg-[rgba(23,21,19,0.55)] hover:border-[#B77620]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#B77620] dark:text-[#F3BA6B]">Outstanding Dues</span>
              <AlertTriangle className="w-4 h-4 text-[#B77620] dark:text-[#F3BA6B]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#B77620] dark:text-[#F3BA6B]">{outstandingCount}</div>
            <div className="text-[10px] text-[#5A2D0C]/70 dark:text-[#FFF9EE]/70 mt-1">Awaiting fulfillment</div>
          </button>

          {/* 2. Partially Fulfilled: 3 */}
          <button
            type="button"
            id="metric-card-partially-fulfilled"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('PARTIALLY_FULFILLED');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-150 cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'PARTIALLY_FULFILLED'
                ? 'border-amber-500 ring-2 ring-amber-500/50 bg-amber-100/60 dark:bg-amber-950/50 shadow-md'
                : 'border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 bg-white/60 dark:bg-[rgba(23,21,19,0.55)] hover:border-amber-500'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-300">Partial</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-700 dark:text-amber-300">{partiallyFulfilledCount}</div>
            <div className="text-[10px] text-[#5A2D0C]/70 dark:text-[#FFF9EE]/70 mt-1">Active installment</div>
          </button>

          {/* 3. Awaiting Reconciliation: 4 */}
          <button
            type="button"
            id="metric-card-awaiting-reconciliation"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('AWAITING_RECONCILIATION');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-150 cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'AWAITING_RECONCILIATION'
                ? 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-100/60 dark:bg-blue-950/50 shadow-md'
                : 'border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 bg-white/60 dark:bg-[rgba(23,21,19,0.55)] hover:border-blue-500'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-blue-700 dark:text-blue-300">Awaiting Recon</span>
              <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-700 dark:text-blue-300">{awaitingReconciliationCount}</div>
            <div className="text-[10px] text-[#5A2D0C]/70 dark:text-[#FFF9EE]/70 mt-1">Provider event staged</div>
          </button>

          {/* 4. Mismatch / Requires Review: 3 */}
          <button
            type="button"
            id="metric-card-mismatch"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('MISMATCH');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-150 cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'MISMATCH'
                ? 'border-red-500 ring-2 ring-red-500/50 bg-red-100/60 dark:bg-red-950/50 shadow-md'
                : 'border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 bg-white/60 dark:bg-[rgba(23,21,19,0.55)] hover:border-red-500'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-red-700 dark:text-red-300">Mismatch Review</span>
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-red-700 dark:text-red-300">{mismatchCount}</div>
            <div className="text-[10px] text-[#5A2D0C]/70 dark:text-[#FFF9EE]/70 mt-1">Audit flagged</div>
          </button>

          {/* 5. Fulfilled: 17 */}
          <button
            type="button"
            id="metric-card-fulfilled"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('FULFILLED');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-150 cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'FULFILLED'
                ? 'border-emerald-600 ring-2 ring-emerald-600/50 bg-emerald-100/60 dark:bg-emerald-950/50 shadow-md'
                : 'border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 bg-white/60 dark:bg-[rgba(23,21,19,0.55)] hover:border-emerald-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-300">Fulfilled</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{fulfilledCount}</div>
            <div className="text-[10px] text-[#5A2D0C]/70 dark:text-[#FFF9EE]/70 mt-1">Verified complete</div>
          </button>

          {/* 6. All Fellows: 24 */}
          <button
            type="button"
            id="metric-card-all"
            onClick={() => {
              setScopeMode('ALL_FELLOWS');
              setAttentionFilter('ALL');
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left transition-all duration-150 cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:border-b-2 backdrop-blur-md ${
              attentionFilter === 'ALL'
                ? 'border-[#5A2D0C] dark:border-[#C88D3A] ring-2 ring-[#C88D3A]/50 bg-stone-200/70 dark:bg-[rgba(42,34,28,0.7)] shadow-md'
                : 'border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 bg-white/60 dark:bg-[rgba(23,21,19,0.55)] hover:border-[#5A2D0C]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#5A2D0C] dark:text-[#FFF9EE]">All Fellows</span>
              <UserCheck className="w-4 h-4 text-[#C88D3A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#5A2D0C] dark:text-[#FFF9EE]">{allCount}</div>
            <div className="text-[10px] text-[#5A2D0C]/70 dark:text-[#FFF9EE]/70 mt-1">Total population</div>
          </button>
        </section>

        {/* Multi-Property Contextual Rates */}
        <section
          aria-labelledby="properties-rates-heading"
          className="mb-6 bg-white/40 dark:bg-black/30 backdrop-blur-md border border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 rounded-2xl p-4 sm:p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3 border-b border-[#5A2D0C]/10 dark:border-[#C88D3A]/15 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C88D3A]" />
              <h2
                id="properties-rates-heading"
                className="text-xs font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE]"
              >
                Accredited Property Commitments (Multi-Property Architecture)
              </h2>
            </div>
            <span className="text-[10px] text-[#5A2D0C]/60 dark:text-[#FFF9EE]/60 font-mono">
              Rates Vary By Property Scope
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ACCOMMODATION_PROPERTIES.map((prop) => (
              <div
                key={prop.id}
                className="p-3 bg-[rgba(255,249,238,0.65)] dark:bg-[rgba(30,27,24,0.45)] backdrop-blur-xs border border-[#5A2D0C]/15 dark:border-[#C88D3A]/20 rounded-xl flex flex-col justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">{prop.name}</div>
                  <div className="text-[10px] text-[#5A2D0C]/60 dark:text-[#FFF9EE]/60 mt-0.5">{prop.location}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-[#5A2D0C]/10 dark:border-[#C88D3A]/15 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-[#5A2D0C]/60 dark:text-[#FFF9EE]/60">Required</span>
                  <span className="font-extrabold text-[#B77620]">
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
          className="rounded-2xl p-5 sm:p-7 border mb-6 transition-all duration-200 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          <div
            className="flex items-center justify-between border-b pb-4 mb-5"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)' }}
          >
            <h2
              id="operational-summary-heading"
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
              style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}
            >
              Operational Summary
            </h2>
            <span
              className="text-[11px] font-mono uppercase px-2 py-0.5 rounded shadow-xs"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                color: isDark ? '#C88D3A' : '#B77620',
              }}
            >
              Derived
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div
              id="summary-properties-count"
              className="p-4 rounded-xl border backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-medium text-stone-600">Properties</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-[#5A2D0C]">
                Properties: {summary.propertiesCount}
              </p>
            </div>

            <div
              id="summary-rooms-count"
              className="p-4 rounded-xl border backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <DoorClosed className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-medium text-stone-600">Rooms represented</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-[#5A2D0C]">
                Rooms represented: {summary.roomsRepresentedCount}
              </p>
            </div>

            <div
              id="summary-fellows-count"
              className="p-4 rounded-xl border backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <User className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-medium text-stone-600">Fellows represented</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-[#5A2D0C]">
                Fellows represented: {summary.fellowsRepresentedCount}
              </p>
            </div>

            <div
              id="summary-outstanding-count"
              className="p-4 rounded-xl border backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                <span className="text-xs font-medium text-stone-600">Outstanding responsibilities</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-[#B77620]">
                Outstanding responsibilities: {summary.outstandingResponsibilitiesCount}
              </p>
            </div>
          </div>
        </section>

        {/* Attention-First Filter Bar */}
        <section className="mb-6 bg-white/50 dark:bg-black/40 backdrop-blur-md border border-[#5A2D0C]/20 dark:border-[#C88D3A]/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-[#5A2D0C]/10 dark:border-[#C88D3A]/15 pb-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#C88D3A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE]">
                Attention Queue Filter
              </h3>
            </div>
            <span className="text-[11px] text-[#5A2D0C]/70 dark:text-[#FFF9EE]/70 font-mono">
              Showing {filteredResponsibilities.length} of {effectiveResponsibilities.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              id="filter-attention-all"
              type="button"
              onClick={() => setAttentionFilter('ALL')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border-b-2 shadow-xs transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 ${
                attentionFilter === 'ALL'
                  ? 'bg-[#5A2D0C] text-[#FFF9EE] border-[#3E200C]'
                  : 'bg-[#F7F1E7]/80 dark:bg-[#2A221C]/80 text-[#5A2D0C] dark:text-[#FFF9EE] border-[#5A2D0C]/20 hover:border-[#C88D3A]'
              }`}
            >
              All Records ({effectiveResponsibilities.length})
            </button>

            <button
              id="filter-attention-outstanding"
              type="button"
              onClick={() => setAttentionFilter('OUTSTANDING')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border-b-2 shadow-xs transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 ${
                attentionFilter === 'OUTSTANDING'
                  ? 'bg-[#B77620] text-white border-[#8A5D3B]'
                  : 'bg-[#FFF9EE]/80 dark:bg-[#2A221C]/80 text-[#B77620] border-[#B77620]/30 hover:border-[#B77620]'
              }`}
            >
              Outstanding ({outstandingCount})
            </button>

            <button
              id="filter-attention-partially-fulfilled"
              type="button"
              onClick={() => setAttentionFilter('PARTIALLY_FULFILLED')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border-b-2 shadow-xs transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 ${
                attentionFilter === 'PARTIALLY_FULFILLED'
                  ? 'bg-amber-600 text-white border-amber-800'
                  : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 hover:border-amber-500'
              }`}
            >
              Partially Fulfilled ({partiallyFulfilledCount})
            </button>

            <button
              id="filter-attention-awaiting-reconciliation"
              type="button"
              onClick={() => setAttentionFilter('AWAITING_RECONCILIATION')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border-b-2 shadow-xs transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 ${
                attentionFilter === 'AWAITING_RECONCILIATION'
                  ? 'bg-blue-600 text-white border-blue-800'
                  : 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 hover:border-blue-500'
              }`}
            >
              Awaiting Reconciliation ({awaitingReconciliationCount})
            </button>

            <button
              id="filter-attention-mismatch"
              type="button"
              onClick={() => setAttentionFilter('MISMATCH')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border-b-2 shadow-xs transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 ${
                attentionFilter === 'MISMATCH'
                  ? 'bg-red-600 text-white border-red-800'
                  : 'bg-red-50/80 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-300 hover:border-red-500'
              }`}
            >
              Mismatch / Requires Review ({mismatchCount})
            </button>

            <button
              id="filter-attention-fulfilled"
              type="button"
              onClick={() => setAttentionFilter('FULFILLED')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border-b-2 shadow-xs transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 ${
                attentionFilter === 'FULFILLED'
                  ? 'bg-emerald-700 text-white border-emerald-900'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 hover:border-emerald-500'
              }`}
            >
              Fulfilled ({fulfilledCount})
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
                className="rounded-2xl p-6 sm:p-8 border transition-all duration-200 shadow-md backdrop-blur-md"
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
                    className="rounded-xl p-4 sm:p-5 border font-mono text-sm leading-relaxed backdrop-blur-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
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
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border mb-6 backdrop-blur-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                  }}
                >
                  <div>
                    <span className="text-xs block mb-1 text-stone-600 dark:text-stone-400">Required:</span>
                    <p className="text-base sm:text-lg font-semibold text-[#5A2D0C] dark:text-[#FFF9EE]">
                      {formatNaira(resp.requiredAmount)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs block mb-1 text-stone-600 dark:text-stone-400">Verified:</span>
                    <p className="text-base sm:text-lg font-medium text-[#704728] dark:text-[#D9C4AC]">
                      {formatNaira(resp.verifiedAmount)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs block mb-1 font-medium text-[#B77620]">Remaining:</span>
                    <p className="text-base sm:text-lg font-bold text-[#B77620]">
                      {formatNaira(remaining)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs block mb-1 text-stone-600 dark:text-stone-400">Status:</span>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[rgba(247,241,231,0.8)] dark:bg-[rgba(42,34,28,0.7)] text-[#B77620] border border-[#5A2D0C]/15 dark:border-[#C88D3A]/25"
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
                    className="mb-4 p-4 rounded-xl border bg-[#F9F5EE] border-[#E7D6C1]"
                  >
                    <div className="flex items-center justify-between border-b pb-2.5 mb-3 border-[#EAE0D0]">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#C88D3A]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A5D3B]">
                          Operational Activity: Payment Preparation
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20">
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
                            className="p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs bg-[#FFF9EE] border-[#E7D6C1]"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-[#5A2D0C]">
                                  Payment Preparation
                                </span>
                                <span className="text-stone-400">&bull;</span>
                                <span className="font-medium text-[#5A2D0C]">
                                  {resp.fellow?.name || 'Current Fellow'}
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span>{resp.title || 'September Accommodation'}</span>
                                <span>&bull;</span>
                                <span>
                                  Amount: <strong className="font-bold text-[#5A2D0C]">{formatNaira(intent.amount)}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-1">
                              <span
                                id="admin-intent-status-badge"
                                className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-xs bg-[#FEF3C7] border-[#FCD34D] text-[#B45309]"
                              >
                                Status: Prepared — Not Verified
                              </span>
                              <span className="text-[10px] italic text-stone-500">
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
                      className="mb-4 p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs bg-[#F9F5EE] border-[#E7D6C1]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#B77620]">
                          {isSim ? 'SIMULATED PROVIDER:' : 'BMONI Proposal:'}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono font-semibold text-[11px] border bg-[#FEF3C7] border-[#FCD34D] text-[#B45309]">
                          {isSim ? 'Proposal: Simulated' : (proposal?.providerStatus || 'Pending Approval')}
                        </span>
                      </div>
                      <span className="text-stone-500 italic text-[11px]">
                        {isSim ? 'No request was sent to BMONI. * Unverified.' : `* Unverified. Verified remains ${formatNaira(resp.verifiedAmount)}.`}
                      </span>
                    </div>
                  );
                })()}

                {/* Contextual Financial Notes Toggle & Section */}
                <div className="mt-4 pt-4 border-t border-[#5A2D0C]/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      id={`btn-toggle-notes-${resp.id}`}
                      onClick={() => setExpandedNotesId(isNotesExpanded ? null : resp.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A2D0C] hover:text-[#B77620] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <span>{isNotesExpanded ? 'Close Financial Notes' : 'Contextual Financial Notes & Inquiries'}</span>
                    </button>
                    <span className="text-[11px] text-stone-500 font-mono">
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
            className="mt-6 p-4 rounded-xl border flex flex-col gap-3 text-xs bg-[rgba(249,245,238,0.65)] dark:bg-[rgba(30,27,24,0.55)] backdrop-blur-md border-[#5A2D0C]/15 dark:border-[#C88D3A]/25 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#B77620]">
                  Provider Ingestion Audit &bull; Provider Events Received
                </span>
              </div>
              <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                Total Ingested: {providerEvents.length} (Authoritative PostgreSQL Store)
              </span>
            </div>
            <div className="space-y-2 mt-1">
              {providerEvents.map((evt, idx) => (
                <div
                  key={evt.id || evt.providerEventId || idx}
                  id={`admin-provider-event-${evt.providerEventId || idx}`}
                  className="p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[rgba(255,253,249,0.7)] dark:bg-[rgba(42,34,28,0.6)] backdrop-blur-xs border-[#5A2D0C]/15 dark:border-[#C88D3A]/20"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="font-semibold text-[#5A2D0C] dark:text-[#FFF9EE]">
                        Provider: {evt.provider}
                      </span>
                      <span className="text-stone-400">&bull;</span>
                      <span className="text-stone-500 dark:text-stone-400">Event: {evt.eventType}</span>
                      <span className="text-stone-400">&bull;</span>
                      <span className="text-stone-400 text-[10px]">ID: {evt.providerEventId}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Provider Status: <strong className="font-semibold">{evt.providerStatus}</strong>
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
                          <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] border uppercase bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]">
                            Status: Verified &bull; Reconciled ({formatNaira(rec.amount)})
                          </span>
                        );
                      }
                      if (rec && rec.reconciliationStatus === 'MISMATCH') {
                        return (
                          <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] border uppercase bg-[#FEF2F2] border-[#FCA5A5] text-[#B91C1C]">
                            Status: Requires Review &bull; {rec.reasonCode}
                          </span>
                        );
                      }
                      return (
                        <>
                          <span
                            id="admin-provider-event-status-badge"
                            className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] border uppercase bg-[#FEF3C7] border-[#FCD34D] text-[#B45309]"
                          >
                            Status: Received — Awaiting Reconciliation
                          </span>
                          {onReconcileEvent && (
                            <button
                              type="button"
                              onClick={() => onReconcileEvent(evt.providerEventId)}
                              className="mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors bg-[#F2E8D8] border-[#B77620] text-[#5A2D0C] hover:bg-[#EAE0D0]"
                            >
                              Trigger Reconcile
                            </button>
                          )}
                        </>
                      );
                    })()}
                    <span className="text-[10px] italic text-stone-500 dark:text-stone-400">
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
            className="mt-6 p-4 rounded-xl border flex flex-col gap-3 text-xs bg-[rgba(249,245,238,0.65)] dark:bg-[rgba(30,27,24,0.55)] backdrop-blur-md border-[#5A2D0C]/15 dark:border-[#C88D3A]/25 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#B77620]">
                  Authoritative Payment Reconciliations &bull; Evidence Chain Audit
                </span>
              </div>
              <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                Total Reconciled Records: {reconciliations.length}
              </span>
            </div>
            <div className="space-y-2 mt-1">
              {reconciliations.map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  id={`admin-reconciliation-${rec.id || idx}`}
                  className="p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[rgba(255,253,249,0.7)] dark:bg-[rgba(42,34,28,0.6)] backdrop-blur-xs border-[#5A2D0C]/15 dark:border-[#C88D3A]/20"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="font-semibold text-[#5A2D0C] dark:text-[#FFF9EE]">
                        Amount: {formatNaira(rec.amount)}
                      </span>
                      <span className="text-stone-400">&bull;</span>
                      <span className="text-stone-500 dark:text-stone-400">Provider: {rec.provider}</span>
                      <span className="text-stone-400">&bull;</span>
                      <span className="text-stone-400 text-[10px]">Event ID: {rec.providerEventId}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Reason: <strong className="font-semibold">{rec.reasonCode}</strong>
                      {rec.reconciledAt && <span> &bull; Verified At: {new Date(rec.reconciledAt).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] border uppercase ${
                        rec.reconciliationStatus === 'VERIFIED'
                          ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                          : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#B91C1C]'
                      }`}
                    >
                      Status: {rec.reconciliationStatus === 'VERIFIED' ? 'VERIFIED' : 'Requires Review'}
                    </span>
                    <span className="text-[10px] italic text-stone-500 dark:text-stone-400">
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
