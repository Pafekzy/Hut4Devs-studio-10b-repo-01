import React, { useState, useEffect } from 'react';
import {
  puzzleFeedbackStore,
  SharedMissingPuzzleReport,
  FeedbackStatus,
  FeedbackEventType,
  MissingPuzzleInvolvement,
  PersistenceClassification,
} from '../services/puzzleFeedbackStore';
import { Member } from '../domain/auth';
import { ActiveMode, FormattedAttribution } from '../domain/membership';
import {
  Puzzle,
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Code2,
  ChevronRight,
  X,
  Send,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface CommunityFeedbackTriageViewProps {
  currentMember: Member;
  activeMode: ActiveMode;
  attribution: FormattedAttribution;
  isDark?: boolean;
}

type TriageFilter =
  | 'ALL'
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'IMPLEMENTED'
  | 'NEEDS_CLARIFICATION'
  | 'WILLING_TO_TEST'
  | 'WILLING_TO_CONTRIBUTE'
  | 'NEW'
  | 'RESOLVED';

export const CommunityFeedbackTriageView: React.FC<CommunityFeedbackTriageViewProps> = ({
  currentMember,
  attribution,
  isDark = false,
}) => {
  const [reports, setReports] = useState<SharedMissingPuzzleReport[]>([]);
  const [activeFilter, setActiveFilter] = useState<TriageFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<SharedMissingPuzzleReport | null>(null);

  // Modal actions
  const [clarificationText, setClarificationText] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<FeedbackStatus>('IN_PROGRESS');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadReports = async () => {
    try {
      const data = await puzzleFeedbackStore.getTriageFeedback(currentMember);
      setReports(data);
    } catch {
      setReports(puzzleFeedbackStore.getReports());
    }
  };

  useEffect(() => {
    loadReports();
    const unsub = puzzleFeedbackStore.subscribe(() => {
      loadReports();
    });
    return () => unsub();
  }, [currentMember]);

  // Keep selected report updated if list updates
  useEffect(() => {
    if (selectedReport) {
      const updated = reports.find((r) => r.id === selectedReport.id);
      if (updated) setSelectedReport(updated);
    }
  }, [reports]);

  // Filter calculations (Attention-First)
  const pendingReviewCount = reports.filter(
    (r) => r.status === 'PENDING_REVIEW' || r.status === 'OPEN'
  ).length;
  const underReviewCount = reports.filter(
    (r) => r.status === 'UNDER_REVIEW' || r.status === 'ACKNOWLEDGED'
  ).length;
  const inProgressCount = reports.filter((r) => r.status === 'IN_PROGRESS').length;
  const implementedCount = reports.filter(
    (r) => r.status === 'IMPLEMENTED' || r.status === 'RESOLVED' || r.status === 'CLOSED'
  ).length;
  const needsClarificationCount = reports.filter(
    (r) =>
      r.events?.some((e) => e.eventType === 'CLARIFICATION_REQUESTED') &&
      r.status !== 'IMPLEMENTED' &&
      r.status !== 'RESOLVED' &&
      r.status !== 'CLOSED'
  ).length;
  const willingToTestCount = reports.filter((r) => r.involvementPreference === 'HELP_TEST').length;
  const willingToContributeCount = reports.filter(
    (r) => r.involvementPreference === 'CONTRIBUTE_FIX'
  ).length;

  const categories = ['ALL', ...Array.from(new Set(reports.map((r) => r.category)))];

  const filteredReports = reports.filter((r) => {
    // Category match
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchReporter = r.reporterDisplayName.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchReporter && !matchCat) return false;
    }

    // Filter type match
    switch (activeFilter) {
      case 'PENDING_REVIEW':
      case 'NEW':
        return r.status === 'PENDING_REVIEW' || r.status === 'OPEN';
      case 'UNDER_REVIEW':
        return r.status === 'UNDER_REVIEW' || r.status === 'ACKNOWLEDGED';
      case 'IN_PROGRESS':
        return r.status === 'IN_PROGRESS';
      case 'IMPLEMENTED':
      case 'RESOLVED':
        return r.status === 'IMPLEMENTED' || r.status === 'RESOLVED' || r.status === 'CLOSED';
      case 'NEEDS_CLARIFICATION':
        return (
          r.events?.some((e) => e.eventType === 'CLARIFICATION_REQUESTED') &&
          r.status !== 'IMPLEMENTED' &&
          r.status !== 'RESOLVED' &&
          r.status !== 'CLOSED'
        );
      case 'WILLING_TO_TEST':
        return r.involvementPreference === 'HELP_TEST';
      case 'WILLING_TO_CONTRIBUTE':
        return r.involvementPreference === 'CONTRIBUTE_FIX';
      case 'ALL':
      default:
        return true;
    }
  });

  const handleAcknowledge = async (reportId: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await puzzleFeedbackStore.acknowledgeFeedback(
        reportId,
        currentMember,
        'Report moved to Under Review by Accommodation Fellows Coordination team.'
      );
      setSelectedReport(updated);
      setActionSuccess('Report moved to Under Review. Reporter has been notified.');
    } catch (err: any) {
      setActionError(err?.message || 'Failed to acknowledge report.');
    }
  };

  const handleSendClarification = async () => {
    if (!selectedReport) return;
    if (!clarificationText.trim()) {
      setActionError('Please enter a clarification question.');
      return;
    }
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await puzzleFeedbackStore.requestClarification(
        selectedReport.id,
        currentMember,
        clarificationText.trim()
      );
      setSelectedReport(updated);
      setClarificationText('');
      setActionSuccess('Clarification request logged and dispatched to the reporter.');
    } catch (err: any) {
      setActionError(err?.message || 'Failed to request clarification.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await puzzleFeedbackStore.updateStatus(
        selectedReport.id,
        currentMember,
        targetStatus,
        statusNote.trim() || undefined
      );
      setSelectedReport(updated);
      setStatusNote('');
      setActionSuccess(`Status transitioned to ${targetStatus}.`);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update status.');
    }
  };

  const handleQuickResolve = async (reportId: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await puzzleFeedbackStore.resolveFeedback(
        reportId,
        currentMember,
        resolutionNote.trim() || 'Missing puzzle piece implemented and verified.'
      );
      setSelectedReport(updated);
      setResolutionNote('');
      setActionSuccess('Issue marked as Implemented. Reporter notified.');
    } catch (err: any) {
      setActionError(err?.message || 'Failed to resolve report.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
      case 'OPEN':
        return {
          label: 'Pending Review',
          className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30',
        };
      case 'UNDER_REVIEW':
      case 'ACKNOWLEDGED':
        return {
          label: 'Under Review',
          className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          className: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30',
        };
      case 'IMPLEMENTED':
      case 'RESOLVED':
        return {
          label: 'Implemented',
          className: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
        };
      case 'CLOSED':
        return {
          label: 'Closed',
          className: 'bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border border-zinc-500/30',
        };
      default:
        return {
          label: status,
          className: 'bg-zinc-500/20 text-zinc-700 dark:text-zinc-400',
        };
    }
  };

  const formatEventName = (type: FeedbackEventType): string => {
    switch (type) {
      case 'FEEDBACK_CREATED':
        return 'Report Created';
      case 'FEEDBACK_ACKNOWLEDGED':
        return 'Coordinator Acknowledged';
      case 'CLARIFICATION_REQUESTED':
        return 'Clarification Requested';
      case 'MEMBER_REPLIED':
        return 'Fellow Responded';
      case 'TESTING_VOLUNTEERED':
        return 'Volunteered to Test';
      case 'CONTRIBUTION_VOLUNTEERED':
        return 'Volunteered to Contribute Code';
      case 'STATUS_CHANGED':
        return 'Status Updated';
      case 'RESOLVED':
        return 'Issue Resolved / Implemented';
      case 'CLOSED':
        return 'Report Closed';
      default:
        return type;
    }
  };

  return (
    <div id="community-feedback-triage" className="space-y-6">
      {/* Triage Header Card */}
      <div
        className={`p-6 rounded-2xl border transition-colors shadow-xs ${
          isDark
            ? 'bg-[#2F1707] border-[#C88D3A]/30 text-[#FFF9EE]'
            : 'bg-[#FFF9EE] border-[#C88D3A]/30 text-[#5A2D0C]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#C88D3A]/20 text-[#C88D3A]">
                Missing Puzzle Feedback Triage
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border ${
                  puzzleFeedbackStore.getLastPersistenceClassification() ===
                  'SHARED_OPERATIONAL_PERSISTENCE'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}
              >
                {puzzleFeedbackStore.getLastPersistenceClassification() ===
                'SHARED_OPERATIONAL_PERSISTENCE'
                  ? '● SHARED FIRESTORE PERSISTENCE'
                  : '▲ DEMO LOCAL FALLBACK'}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold mt-1.5 flex items-center gap-2">
              <Puzzle className="w-6 h-6 text-[#C88D3A]" />
              Community Feedback & Issue Triage
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-[#FFF9EE]/70' : 'text-[#5A2D0C]/70'}`}>
              Review missing pieces, UX obstacles, and product gaps identified by fellows. Coordinate
              clarifications, track volunteer engineers, and resolve issues with append-only truth.
            </p>
          </div>

          <div
            className={`text-right text-xs rounded-xl px-4 py-2.5 border ${
              isDark
                ? 'bg-[#1E0E04] border-[#C88D3A]/20 text-[#FFF9EE]'
                : 'bg-[#F7F1E7] border-[#5A2D0C]/10 text-[#5A2D0C]'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold text-[#C88D3A]">
              Active Triage Capacity
            </span>
            <span className="font-bold">{attribution.displayLabel}</span>
          </div>
        </div>

        {/* Attention-First Filter KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === 'ALL'
                ? isDark
                  ? 'bg-[#3E1F0B] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                  : 'bg-[#F7F1E7] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                : isDark
                ? 'bg-[#241205] border-[#C88D3A]/20 hover:border-[#C88D3A]/50'
                : 'bg-white border-[#5A2D0C]/10 hover:border-[#C88D3A]/40'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">Total Reports</div>
            <div className="text-xl font-serif font-bold mt-0.5">{reports.length}</div>
            <div className="text-[9px] opacity-60 mt-0.5">All community feedback</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('PENDING_REVIEW')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === 'PENDING_REVIEW' || activeFilter === 'NEW'
                ? isDark
                  ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                  : 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                : isDark
                ? 'bg-[#241205] border-[#C88D3A]/20 hover:border-amber-500/50'
                : 'bg-white border-[#5A2D0C]/10 hover:border-amber-500/40'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Pending Review
            </div>
            <div className="text-xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {pendingReviewCount}
            </div>
            <div className="text-[9px] opacity-60 mt-0.5">Awaiting evaluation</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('UNDER_REVIEW')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === 'UNDER_REVIEW'
                ? isDark
                  ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                : isDark
                ? 'bg-[#241205] border-[#C88D3A]/20 hover:border-blue-500/50'
                : 'bg-white border-[#5A2D0C]/10 hover:border-blue-500/40'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Under Review
            </div>
            <div className="text-xl font-serif font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {underReviewCount}
            </div>
            <div className="text-[9px] opacity-60 mt-0.5">Actively evaluating</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('IN_PROGRESS')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === 'IN_PROGRESS'
                ? isDark
                  ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                  : 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                : isDark
                ? 'bg-[#241205] border-[#C88D3A]/20 hover:border-purple-500/50'
                : 'bg-white border-[#5A2D0C]/10 hover:border-purple-500/40'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              In Progress
            </div>
            <div className="text-xl font-serif font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              {inProgressCount}
            </div>
            <div className="text-[9px] opacity-60 mt-0.5">Being implemented</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('IMPLEMENTED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === 'IMPLEMENTED' || activeFilter === 'RESOLVED'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                : isDark
                ? 'bg-[#241205] border-[#C88D3A]/20 hover:border-emerald-500/50'
                : 'bg-white border-[#5A2D0C]/10 hover:border-emerald-500/40'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Implemented
            </div>
            <div className="text-xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {implementedCount}
            </div>
            <div className="text-[9px] opacity-60 mt-0.5">Completed & deployed</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('NEEDS_CLARIFICATION')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === 'NEEDS_CLARIFICATION'
                ? isDark
                  ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                : isDark
                ? 'bg-[#241205] border-[#C88D3A]/20 hover:border-sky-500/50'
                : 'bg-white border-[#5A2D0C]/10 hover:border-sky-500/40'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Clarification Active
            </div>
            <div className="text-xl font-serif font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              {needsClarificationCount}
            </div>
            <div className="text-[9px] opacity-60 mt-0.5">Thread in discussion</div>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-[#FFF9EE]/40' : 'text-[#5A2D0C]/40'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, reporter, or description..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#2F1707] border-[#C88D3A]/30 text-[#FFF9EE] focus:border-[#C88D3A] focus:outline-hidden'
                  : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C] focus:border-[#C88D3A] focus:outline-hidden'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#FFF9EE]/50' : 'text-[#5A2D0C]/50'}`}>
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#C88D3A] text-white shadow-xs'
                  : isDark
                  ? 'bg-[#2F1707] text-[#FFF9EE]/80 hover:bg-[#3E1F0B] border border-[#C88D3A]/20'
                  : 'bg-white text-[#5A2D0C]/80 hover:bg-[#F7F1E7] border border-[#5A2D0C]/10'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div
            className={`text-center py-12 rounded-2xl border ${
              isDark ? 'bg-[#2F1707] border-[#C88D3A]/20 text-[#FFF9EE]' : 'bg-white border-[#5A2D0C]/10 text-[#5A2D0C]'
            }`}
          >
            <Puzzle className="w-10 h-10 mx-auto text-[#C88D3A]/60 mb-2" />
            <p className="font-serif font-bold text-base">No Missing Puzzle reports match this filter</p>
            <p className="text-xs opacity-60 mt-1">All reports in this category have been addressed.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isSelected = selectedReport?.id === report.id;
            const lastEvent = report.events?.[report.events.length - 1];

            return (
              <div
                key={report.id}
                id={`triage-card-${report.id}`}
                className={`p-5 rounded-2xl border transition-all ${
                  isDark
                    ? isSelected
                      ? 'bg-[#3E1F0B] border-[#C88D3A] shadow-md ring-1 ring-[#C88D3A]'
                      : 'bg-[#2F1707] border-[#C88D3A]/20 hover:border-[#C88D3A]/50'
                    : isSelected
                    ? 'bg-[#FFF9EE] border-[#C88D3A] shadow-md ring-1 ring-[#C88D3A]'
                    : 'bg-white border-[#5A2D0C]/10 hover:border-[#C88D3A]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A]/20 text-[#C88D3A]">
                        {report.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          getStatusBadge(report.status).className
                        }`}
                      >
                        {getStatusBadge(report.status).label}
                      </span>
                      {report.involvementPreference === 'HELP_TEST' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Willing to Test
                        </span>
                      )}
                      {report.involvementPreference === 'CONTRIBUTE_FIX' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Code2 className="w-3 h-3" /> Wants to Code Fix
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-base mt-1 text-[#5A2D0C] dark:text-[#FFF9EE]">
                      {report.title}
                    </h3>
                    <p className="text-xs line-clamp-2 text-[#5A2D0C]/80 dark:text-[#FFF9EE]/80">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] opacity-70 pt-1">
                      <span>
                        Reporter: <strong className="font-semibold">{report.reporterDisplayName}</strong>
                      </span>
                      <span>
                        Location: <em>{report.pageContext || report.locationContext || 'App'}</em>
                      </span>
                      <span>
                        Logged: {new Date(report.createdAt).toLocaleDateString()} at{' '}
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {lastEvent && (
                      <div
                        className={`text-[11px] p-2 rounded-lg border mt-2 flex items-center gap-2 ${
                          isDark
                            ? 'bg-[#1E0E04] border-[#C88D3A]/15 text-[#FFF9EE]/80'
                            : 'bg-[#F7F1E7] border-[#5A2D0C]/10 text-[#5A2D0C]/80'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5 text-[#C88D3A] shrink-0" />
                        <span className="font-semibold text-[#C88D3A]">
                          Latest Fact ({formatEventName(lastEvent.eventType)}):
                        </span>
                        <span className="truncate">{lastEvent.message || lastEvent.actorDisplayName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      id={`inspect-btn-${report.id}`}
                      onClick={() => {
                        setSelectedReport(report);
                        setActionError('');
                        setActionSuccess('');
                      }}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#C88D3A] text-white hover:bg-[#B77620] shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <span>Inspect & Triage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {(report.status === 'PENDING_REVIEW' || report.status === 'OPEN') && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(report.id)}
                        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25 transition-all"
                      >
                        Review & Ack
                      </button>
                    )}

                    {report.status !== 'IMPLEMENTED' && report.status !== 'RESOLVED' && report.status !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() => handleQuickResolve(report.id)}
                        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 transition-all"
                      >
                        Mark Implemented
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Triage Inspection Modal */}
      {selectedReport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="triage-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedReport(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-3xl rounded-2xl border p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto transition-colors ${
              isDark
                ? 'bg-[#2F1707] border-[#C88D3A]/40 text-[#FFF9EE]'
                : 'bg-[#FFF9EE] border-[#C88D3A]/40 text-[#5A2D0C]'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b pb-4 border-[#C88D3A]/20">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A]/20 text-[#C88D3A]">
                    {selectedReport.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      getStatusBadge(selectedReport.status).className
                    }`}
                  >
                    STATUS: {getStatusBadge(selectedReport.status).label}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">ID: {selectedReport.id}</span>
                </div>
                <h2 id="triage-modal-title" className="font-serif text-xl font-bold mt-1.5">
                  {selectedReport.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Feedback Messages */}
            {actionError && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-[#1E0E04] border-[#C88D3A]/20' : 'bg-[#F7F1E7] border-[#5A2D0C]/10'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#C88D3A] mb-1">
                  Reporter Identity
                </div>
                <div className="font-bold text-sm">{selectedReport.reporterDisplayName}</div>
                <div className="text-xs opacity-70">{selectedReport.reporterEmail || 'Fellow'}</div>
                <div className="text-[11px] opacity-60 mt-1">
                  Member ID: {selectedReport.loggedBy?.h4dMemberId || selectedReport.reporterMemberId}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-[#1E0E04] border-[#C88D3A]/20' : 'bg-[#F7F1E7] border-[#5A2D0C]/10'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#C88D3A] mb-1">
                  Context & Involvement Preference
                </div>
                <div className="text-xs">
                  <span className="font-semibold">Context:</span> {selectedReport.pageContext}
                </div>
                <div className="text-xs mt-1">
                  <span className="font-semibold">Preference:</span>{' '}
                  <span className="font-bold text-[#C88D3A]">
                    {selectedReport.involvementPreference}
                  </span>
                </div>
                <div className="text-[10px] opacity-60 mt-1">
                  Puzzle completion verified:{' '}
                  {selectedReport.puzzleCompleted ? 'Piece Slotted' : 'Logged directly'}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#1E0E04] border-[#C88D3A]/20' : 'bg-white border-[#5A2D0C]/10'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#C88D3A] mb-1">
                Report Description
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{selectedReport.description}</p>
            </div>

            {/* Factual Audit Trail / History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C88D3A]" />
                  Factual Audit Trail ({selectedReport.events?.length || 0} facts appended)
                </h4>
                <span className="text-[10px] opacity-60">Append-only • Immutable</span>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-3 max-h-56 overflow-y-auto ${
                  isDark ? 'bg-[#1E0E04] border-[#C88D3A]/20' : 'bg-white border-[#5A2D0C]/10'
                }`}
              >
                {selectedReport.events?.map((evt, idx) => (
                  <div
                    key={evt.eventId || idx}
                    className="flex items-start gap-3 text-xs border-b border-[#C88D3A]/10 pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#C88D3A] mt-1.5 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-bold text-[11px] text-[#C88D3A]">
                          {formatEventName(evt.eventType)}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-80">
                        Actor: <strong className="font-semibold">{evt.actorDisplayName}</strong> (
                        {evt.actorMemberId})
                      </div>
                      {evt.message && (
                        <p className="text-xs pt-1 italic opacity-90">{evt.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinator Triage Operations */}
            <div
              className={`p-4 rounded-xl border space-y-4 ${
                isDark ? 'bg-[#1E0E04] border-[#C88D3A]/30' : 'bg-[#F7F1E7] border-[#C88D3A]/30'
              }`}
            >
              <h4 className="font-serif font-bold text-sm text-[#C88D3A] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Coordinator Triage Actions
              </h4>

              {/* Request Clarification Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  Ask Reporter for Clarification:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                    placeholder="e.g. Could you confirm which browser version and device this occurred on?"
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border ${
                      isDark
                        ? 'bg-[#2F1707] border-[#C88D3A]/30 text-[#FFF9EE]'
                        : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSendClarification}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#C88D3A] text-white hover:bg-[#B77620] transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Query</span>
                  </button>
                </div>
              </div>

              {/* Status Transition Section */}
              <div className="space-y-2 pt-2 border-t border-[#C88D3A]/20">
                <label className="block text-xs font-bold">Transition Report Status:</label>
                <div className="flex flex-wrap items-center gap-2">
                  {([
                    { id: 'PENDING_REVIEW', label: 'Pending Review' },
                    { id: 'UNDER_REVIEW', label: 'Under Review' },
                    { id: 'IN_PROGRESS', label: 'In Progress' },
                    { id: 'IMPLEMENTED', label: 'Implemented' },
                    { id: 'CLOSED', label: 'Closed' },
                  ] as { id: FeedbackStatus; label: string }[]).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTargetStatus(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        targetStatus === item.id
                          ? 'bg-[#C88D3A] text-white shadow-xs'
                          : isDark
                          ? 'bg-[#2F1707] text-[#FFF9EE]/70 hover:bg-[#3E1F0B] border border-[#C88D3A]/20'
                          : 'bg-white text-[#5A2D0C]/70 hover:bg-[#F7F1E7] border border-[#5A2D0C]/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional note for status transition..."
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border ${
                      isDark
                        ? 'bg-[#2F1707] border-[#C88D3A]/30 text-[#FFF9EE]'
                        : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5A2D0C] text-white hover:bg-[#3E1F0B] dark:bg-[#C88D3A] dark:hover:bg-[#B77620] transition-all shrink-0"
                  >
                    Apply Status
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className={`px-5 py-2 text-xs font-bold rounded-xl border ${
                  isDark
                    ? 'border-[#C88D3A]/30 text-[#FFF9EE] hover:bg-[#1E0E04]'
                    : 'border-[#5A2D0C]/20 text-[#5A2D0C] hover:bg-[#F7F1E7]'
                }`}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
