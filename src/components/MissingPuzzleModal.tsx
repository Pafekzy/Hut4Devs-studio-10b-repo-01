import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import {
  Puzzle,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  UserCheck,
  Code2,
  Lightbulb,
  X,
  AlertCircle,
  ShieldCheck,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  puzzleFeedbackStore,
  SharedMissingPuzzleReport,
  MissingPuzzleInvolvement,
  PersistenceClassification,
  FeedbackEventType,
} from '../services/puzzleFeedbackStore';

interface MissingPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: Member;
  isDark?: boolean;
  defaultLocation?: string;
  initialReportId?: string;
}

const CATEGORIES = [
  'Visual / UI Glitch',
  'Accommodation Flow',
  'Peer Support',
  'Performance / Speed',
  'Idea / Missing Feature',
  'Other',
];

const INVOLVEMENT_OPTIONS: {
  id: MissingPuzzleInvolvement;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'JUST_LOG',
    title: 'Just log it',
    description: 'Keep the trail recorded; I will watch progress in the changelog.',
    icon: CheckCircle2,
  },
  {
    id: 'CONTACT_ME',
    title: 'Contact me for clarification',
    description: 'Reach out to my room or contact info if reproduction details are needed.',
    icon: MessageSquare,
  },
  {
    id: 'HELP_TEST',
    title: 'I can help test the fix',
    description: 'Give me access to verify the staged patch in my accommodation setting.',
    icon: UserCheck,
  },
  {
    id: 'CONTRIBUTE_FIX',
    title: 'I want to contribute to fixing it',
    description: 'I would like to help build the code or UI adjustment directly.',
    icon: Code2,
  },
  {
    id: 'CONSULT_DESIGN',
    title: 'Consult me when designing the solution',
    description: 'Let me share ideas on human UX and community interaction expectations.',
    icon: Lightbulb,
  },
];

export const MissingPuzzleModal: React.FC<MissingPuzzleModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  isDark = false,
  defaultLocation = 'Fellow Workspace',
  initialReportId,
}) => {
  const [activeView, setActiveView] = useState<'REPORT' | 'COMMUNITY_LEDGER'>('REPORT');
  const [isSlotted, setIsSlotted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [locationContext, setLocationContext] = useState(defaultLocation);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-submit state
  const [submittedReport, setSubmittedReport] = useState<SharedMissingPuzzleReport | null>(null);
  const [selectedInvolvement, setSelectedInvolvement] = useState<MissingPuzzleInvolvement | null>(null);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceClassification>('DEMO_LOCAL_FALLBACK');
  const [allReports, setAllReports] = useState<SharedMissingPuzzleReport[]>([]);

  // Ledger state
  const [ledgerFilter, setLedgerFilter] = useState<'MY_REPORTS' | 'ALL'>('MY_REPORTS');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(initialReportId || null);
  const [clarificationReplies, setClarificationReplies] = useState<Record<string, string>>({});
  const [replySuccess, setReplySuccess] = useState<Record<string, string>>({});
  const [replyError, setReplyError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setAllReports(puzzleFeedbackStore.getReports());
      if (initialReportId) {
        setActiveView('COMMUNITY_LEDGER');
        setExpandedReportId(initialReportId);
      }
      if (!submittedReport) {
        setIsSlotted(false);
        setTitle('');
        setDescription('');
        setErrorMsg('');
      }
    }
  }, [isOpen, submittedReport, initialReportId]);

  if (!isOpen) return null;

  const handleSlotPiece = () => {
    setIsSlotted(true);
    setSelectedPieceId('piece-core');
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', 'h4d-puzzle-piece');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleSlotPiece();
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please give this missing puzzle piece a concise title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please describe what happened or what is missing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { report, persistence } = await puzzleFeedbackStore.createFeedback(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          locationContext,
          pageContext: locationContext,
          reporterMemberId: currentMember.id,
          reporterDisplayName: currentMember.displayName,
          reporterEmail: currentMember.email,
          h4dMemberId: currentMember.h4dMemberId,
          puzzleCompleted: isSlotted,
          involvementPreference: 'JUST_LOG',
        },
        currentMember
      );

      setSubmittedReport(report);
      setPersistenceStatus(persistence);
      setAllReports(puzzleFeedbackStore.getReports());
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting feedback report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectInvolvement = async (inv: MissingPuzzleInvolvement) => {
    if (!submittedReport) return;
    try {
      const updated = await puzzleFeedbackStore.updateInvolvementForMember(
        submittedReport.id,
        currentMember,
        inv
      );
      setSubmittedReport({ ...updated });
      setSelectedInvolvement(inv);
      setAllReports(puzzleFeedbackStore.getReports());
    } catch {
      const fallback = puzzleFeedbackStore.updateInvolvement(submittedReport.id, inv);
      if (fallback) {
        setSubmittedReport({ ...fallback });
        setSelectedInvolvement(inv);
        setAllReports(puzzleFeedbackStore.getReports());
      }
    }
  };

  const handleSendClarificationReply = async (reportId: string) => {
    const text = clarificationReplies[reportId]?.trim();
    if (!text) {
      setReplyError((prev) => ({ ...prev, [reportId]: 'Reply message cannot be empty.' }));
      return;
    }

    try {
      await puzzleFeedbackStore.replyToClarification(reportId, currentMember, text);
      setClarificationReplies((prev) => ({ ...prev, [reportId]: '' }));
      setReplySuccess((prev) => ({ ...prev, [reportId]: 'Clarification response appended to factual trail.' }));
      setReplyError((prev) => ({ ...prev, [reportId]: '' }));
      setAllReports(puzzleFeedbackStore.getReports());
    } catch (err: any) {
      setReplyError((prev) => ({ ...prev, [reportId]: err?.message || 'Failed to submit reply.' }));
    }
  };

  const handleUpdateInvolvementInLedger = async (reportId: string, inv: MissingPuzzleInvolvement) => {
    try {
      await puzzleFeedbackStore.updateInvolvementForMember(reportId, currentMember, inv);
      setAllReports(puzzleFeedbackStore.getReports());
    } catch (err: any) {
      alert(err?.message || 'Failed to update involvement.');
    }
  };

  const handleResetForAnother = () => {
    setSubmittedReport(null);
    setSelectedInvolvement(null);
    setIsSlotted(false);
    setTitle('');
    setDescription('');
    setErrorMsg('');
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
        return 'Volunteered to Code Fix';
      case 'STATUS_CHANGED':
        return 'Status Updated';
      case 'RESOLVED':
        return 'Resolved';
      case 'CLOSED':
        return 'Closed';
      default:
        return type;
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

  const myReports = allReports.filter((r) => r.reporterMemberId === currentMember.id);
  const displayReports = ledgerFilter === 'MY_REPORTS' ? myReports : allReports;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-puzzle-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-2xl my-auto ${
          isDark
            ? 'bg-[#2F1707] text-[#FFF9EE] border-[#C88D3A]/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(200,141,58,0.2)]'
            : 'bg-[#FFFDF9] text-[#5A2D0C] border-[#5A2D0C]/30 shadow-[0_20px_50px_-15px_rgba(90,45,12,0.35),0_0_0_1px_rgba(200,141,58,0.25)]'
        }`}
      >
        {/* Top Header Bar */}
        <div
          className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#231004] border-[#3E200C]' : 'bg-[#F7F1E7] border-[#EAE0D0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5A2D0C] border border-[#C88D3A] flex items-center justify-center shadow-inner">
              <Puzzle className="w-5 h-5 text-[#C88D3A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="missing-puzzle-title" className="font-serif font-bold text-base sm:text-lg">
                  Fix a Missing Puzzle
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border bg-[#C88D3A]/15 border-[#C88D3A]/40 text-[#B77620] dark:text-[#E2AB5D] font-semibold">
                  Community Feedback
                </span>
              </div>
              <p className="text-xs opacity-75">
                Every bug or gap is just a piece of our collective home waiting to be slotted.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl border border-transparent hover:border-[#C88D3A]/40 hover:bg-[#C88D3A]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 opacity-70 hover:opacity-100" />
          </button>
        </div>

        {/* View Toggle (Report vs Ledger) */}
        <div
          className={`px-6 pt-3 pb-2 border-b flex items-center justify-between gap-2 text-xs ${
            isDark ? 'bg-[#2B1406] border-[#3E200C]' : 'bg-[#FFF9EE] border-[#EAE0D0]'
          }`}
        >
          <div className="inline-flex p-1 rounded-xl bg-black/10 dark:bg-black/25 border border-[#C88D3A]/20">
            <button
              type="button"
              id="tab-btn-report-puzzle"
              onClick={() => {
                setActiveView('REPORT');
                setSubmittedReport(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeView === 'REPORT'
                  ? 'bg-[#5A2D0C] text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Slot &amp; Log Piece
            </button>
            <button
              type="button"
              id="tab-btn-community-ledger"
              onClick={() => setActiveView('COMMUNITY_LEDGER')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'COMMUNITY_LEDGER'
                  ? 'bg-[#5A2D0C] text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>My Reports &amp; Community Trail</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C88D3A] text-white font-mono">
                {myReports.length}
              </span>
            </button>
          </div>

          <span className="text-[11px] opacity-60 hidden sm:inline">
            Reporter: <strong>{currentMember.displayName}</strong>
          </span>
        </div>

        {/* VIEW 1: REPORT A MISSING PIECE */}
        {activeView === 'REPORT' && (
          <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {!submittedReport ? (
              <>
                {/* 3D Interactive Puzzle Placement Stage */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                    isDark
                      ? 'bg-[#231004] border-[#C88D3A]/30'
                      : 'bg-[#FDFBF7] border-[#5A2D0C]/15 shadow-inner'
                  }`}
                >
                  <div className="text-center space-y-1 mb-4">
                    <h3 className="font-serif font-semibold text-sm sm:text-base text-[#5A2D0C] dark:text-[#FFF9EE]">
                      {isSlotted ? 'Puzzle Piece Slotted in Place' : 'Drag or Click the Missing Piece to Slot It'}
                    </h3>
                    <p className="text-[11px] opacity-70">
                      {isSlotted
                        ? 'Thank you for connecting the missing piece! Now add the description below.'
                        : 'Slot the physical piece into the empty chamber socket, or click to slot.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                    {/* The Empty Socket */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={handleSlotPiece}
                      title="Chamber puzzle slot"
                      className={`w-36 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSlotted
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : isDragging
                          ? 'border-[#C88D3A] bg-[#C88D3A]/15 scale-105'
                          : 'border-[#C88D3A]/40 bg-black/5 dark:bg-black/20 hover:border-[#C88D3A]'
                      }`}
                    >
                      {isSlotted ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            Piece Slotted
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl border border-dashed border-[#C88D3A]/60 flex items-center justify-center text-[#C88D3A]">
                            <Puzzle className="w-5 h-5 opacity-40" />
                          </div>
                          <span className="text-[10px] font-semibold opacity-60 text-center px-2">
                            Drop Missing Piece Here
                          </span>
                        </>
                      )}
                    </div>

                    {/* The Drifting Piece (if not slotted) */}
                    {!isSlotted ? (
                      <div className="flex flex-col items-center gap-2">
                        <div
                          tabIndex={0}
                          role="button"
                          aria-label="Missing puzzle piece. Click, drag, or press Enter or Space to slot into place."
                          draggable
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onClick={handleSlotPiece}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSlotPiece();
                            }
                          }}
                          id="draggable-puzzle-piece"
                          title="Click, drag, or press Enter to slot into place"
                          className="w-28 h-24 rounded-2xl bg-[#5A2D0C] text-[#FFF9EE] border-2 border-[#C88D3A] flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#5A2D0C]/30 hover:scale-105 active:scale-95 transition-all cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-[#C88D3A] focus:outline-hidden focus:ring-2 focus:ring-[#C88D3A] animate-pulse"
                        >
                          <Puzzle className="w-6 h-6 text-[#C88D3A]" />
                          <span className="text-[11px] font-bold">Missing Piece</span>
                          <span className="text-[9px] opacity-75 text-[#C88D3A]">Drag or Click</span>
                        </div>
                        <span className="text-[10px] opacity-70 italic text-center max-w-[140px]">
                          Drifting gap found in community experience
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs opacity-75 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C88D3A]" />
                        <span>Great! Now describe the piece below.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* The Issue Report Form */}
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl border border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label
                      htmlFor="puzzle-issue-title"
                      className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#B77620] dark:text-[#E2AB5D]"
                    >
                      Issue Title *
                    </label>
                    <input
                      id="puzzle-issue-title"
                      type="text"
                      required
                      placeholder="e.g., Tooltip cut off on mobile receipt download"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden transition-all ${
                        isDark
                          ? 'bg-[#180A02] border-[#C88D3A]/40 text-[#FFF9EE] focus:border-[#C88D3A] focus:ring-1 focus:ring-[#C88D3A]'
                          : 'bg-white border-[#EAE0D0] text-stone-900 focus:border-[#5A2D0C] focus:ring-1 focus:ring-[#5A2D0C]'
                      }`}
                    />
                  </div>

                  {/* Category & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="puzzle-issue-category"
                        className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#B77620] dark:text-[#E2AB5D]"
                      >
                        Category *
                      </label>
                      <select
                        id="puzzle-issue-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-hidden cursor-pointer ${
                          isDark
                            ? 'bg-[#180A02] border-[#C88D3A]/40 text-[#FFF9EE] focus:border-[#C88D3A]'
                            : 'bg-white border-[#EAE0D0] text-[#5A2D0C] focus:border-[#5A2D0C]'
                        }`}
                      >
                        {CATEGORIES.map((cat) => (
                          <option
                            key={cat}
                            value={cat}
                            className="bg-white dark:bg-[#180A02] text-stone-900 dark:text-[#FFF9EE]"
                          >
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="puzzle-issue-location"
                        className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#B77620] dark:text-[#E2AB5D]"
                      >
                        App Location / Context
                      </label>
                      <input
                        id="puzzle-issue-location"
                        type="text"
                        placeholder="e.g., Peer Support Hub, Chamber View"
                        value={locationContext}
                        onChange={(e) => setLocationContext(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden transition-all ${
                          isDark
                            ? 'bg-[#180A02] border-[#C88D3A]/40 text-[#FFF9EE] focus:border-[#C88D3A]'
                            : 'bg-white border-[#EAE0D0] text-stone-900 focus:border-[#5A2D0C]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="puzzle-issue-description"
                      className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#B77620] dark:text-[#E2AB5D]"
                    >
                      Description &amp; Observations *
                    </label>
                    <textarea
                      id="puzzle-issue-description"
                      rows={3}
                      required
                      placeholder="Describe what happened, what was confusing, or what missing capability would help fellows thrive."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden transition-all ${
                        isDark
                          ? 'bg-[#180A02] border-[#C88D3A]/40 text-[#FFF9EE] focus:border-[#C88D3A] focus:ring-1 focus:ring-[#C88D3A]'
                          : 'bg-white border-[#EAE0D0] text-stone-900 focus:border-[#5A2D0C] focus:ring-1 focus:ring-[#5A2D0C]'
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#5A2D0C]/20 hover:bg-[#5A2D0C]/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="submit-missing-puzzle-btn"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#5A2D0C] text-[#FFF9EE] border-2 border-[#C88D3A] hover:bg-[#3D1E08] active:translate-y-[1px] transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Logging Piece...' : 'Record Missing Puzzle Piece →'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success & Involvement Screen */
              <div className="space-y-6 py-2">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#5A2D0C] dark:text-[#FFF9EE]">
                    Missing Puzzle Placed &amp; Recorded
                  </h3>
                  <p className="text-xs opacity-80 max-w-md mx-auto">
                    Your observation <strong>"{submittedReport.title}"</strong> has been logged to the
                    community trail.
                  </p>

                  <div className="pt-1">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${
                        persistenceStatus === 'SHARED_OPERATIONAL_PERSISTENCE'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {persistenceStatus === 'SHARED_OPERATIONAL_PERSISTENCE'
                        ? '● SHARED FIRESTORE PERSISTENCE'
                        : '▲ DEMO LOCAL FALLBACK'}
                    </span>
                  </div>
                </div>

                {/* Involvement Preference Question */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-[#231004] border-[#C88D3A]/40' : 'bg-[#FFF9EE] border-[#C88D3A]/40'
                  }`}
                >
                  <div className="mb-3 text-center sm:text-left">
                    <h4 className="font-serif font-bold text-sm text-[#5A2D0C] dark:text-[#FFF9EE]">
                      How would you like to participate in the solution?
                    </h4>
                    <p className="text-[11px] opacity-70">
                      Hut4Devs is built by us and for us-all. Select your intended involvement:
                    </p>
                  </div>

                  <div className="space-y-2">
                    {INVOLVEMENT_OPTIONS.map((opt) => {
                      const isSelected =
                        selectedInvolvement === opt.id ||
                        submittedReport.involvementPreference === opt.id;
                      const Icon = opt.icon;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectInvolvement(opt.id)}
                          className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#5A2D0C] text-[#FFF9EE] border-[#C88D3A] shadow-md ring-1 ring-[#C88D3A]'
                              : isDark
                              ? 'bg-[#180A02] border-[#C88D3A]/20 hover:border-[#C88D3A]/50 text-[#FFF9EE]'
                              : 'bg-white border-[#5A2D0C]/15 hover:border-[#C88D3A]/60 text-[#5A2D0C]'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isSelected
                                ? 'bg-[#C88D3A] text-[#5A2D0C]'
                                : 'bg-[#C88D3A]/10 text-[#C88D3A]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">{opt.title}</div>
                            <div className="text-[11px] opacity-75">{opt.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetForAnother}
                    className="text-xs font-semibold text-[#B77620] hover:underline"
                  >
                    + Log another missing piece
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('COMMUNITY_LEDGER')}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#C88D3A] text-white hover:bg-[#B77620] transition-colors"
                  >
                    View in Community Ledger →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: COMMUNITY LEDGER & MY REPORTS */}
        {activeView === 'COMMUNITY_LEDGER' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Filter toggle */}
            <div className="flex items-center justify-between gap-2 border-b border-[#C88D3A]/20 pb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  id="ledger-filter-my-btn"
                  onClick={() => setLedgerFilter('MY_REPORTS')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    ledgerFilter === 'MY_REPORTS'
                      ? 'bg-[#5A2D0C] text-white'
                      : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  My Reports ({myReports.length})
                </button>
                <button
                  type="button"
                  id="ledger-filter-all-btn"
                  onClick={() => setLedgerFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    ledgerFilter === 'ALL'
                      ? 'bg-[#5A2D0C] text-white'
                      : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  All Community Reports ({allReports.length})
                </button>
              </div>

              <span className="text-[10px] opacity-60">Append-only facts</span>
            </div>

            {displayReports.length === 0 ? (
              <div className="py-12 text-center text-xs opacity-60">
                {ledgerFilter === 'MY_REPORTS'
                  ? "You haven't logged any missing puzzle pieces yet."
                  : 'No reports logged yet.'}
              </div>
            ) : (
              displayReports.map((item) => {
                const isExpanded = expandedReportId === item.id;
                const isReporter = item.reporterMemberId === currentMember.id;
                const clarificationEvt = item.events?.slice().reverse().find(
                  (e) => e.eventType === 'CLARIFICATION_REQUESTED'
                );

                return (
                  <div
                    key={item.id}
                    id={`report-item-${item.id}`}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-[#231004] border-[#C88D3A]/30 text-[#FFF9EE]'
                        : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A]/15 text-[#C88D3A]">
                            {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              getStatusBadge(item.status).className
                            }`}
                          >
                            {getStatusBadge(item.status).label}
                          </span>
                          {item.involvementPreference && (
                            <span className="text-[10px] opacity-75">
                              • Preference: <strong>{item.involvementPreference}</strong>
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif font-bold text-sm text-[#5A2D0C] dark:text-[#FFF9EE]">
                          {item.title}
                        </h4>
                        <p className="text-xs opacity-80 line-clamp-2">{item.description}</p>

                        <div className="flex flex-wrap items-center gap-x-4 text-[10px] opacity-60 pt-1">
                          <span>By: {item.reporterDisplayName}</span>
                          <span>Context: {item.pageContext}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReportId(isExpanded ? null : item.id)
                        }
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center gap-1 shrink-0"
                      >
                        <span>{isExpanded ? 'Hide Facts' : 'Inspect Trail'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Factual Trail & Actions */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#C88D3A]/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold flex items-center gap-1.5 text-[#C88D3A]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Factual Audit History ({item.events?.length || 0} events)
                          </span>
                          <span className="text-[10px] opacity-60">ID: {item.id}</span>
                        </div>

                        {/* Events List */}
                        <div
                          className={`p-3 rounded-xl border space-y-2 max-h-48 overflow-y-auto ${
                            isDark ? 'bg-[#180A02] border-[#C88D3A]/20' : 'bg-[#FDFBF7] border-[#5A2D0C]/10'
                          }`}
                        >
                          {item.events?.map((evt, idx) => (
                            <div key={evt.eventId || idx} className="text-xs space-y-0.5 border-b border-[#C88D3A]/10 pb-2 last:border-b-0 last:pb-0">
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-bold text-[#C88D3A]">
                                  {formatEventName(evt.eventType)}
                                </span>
                                <span className="text-[10px] opacity-60">
                                  {new Date(evt.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-[11px] opacity-75">
                                Actor: {evt.actorDisplayName}
                              </div>
                              {evt.message && <p className="italic opacity-90">{evt.message}</p>}
                            </div>
                          ))}
                        </div>

                        {/* If Clarification was requested, show reply box for reporter */}
                        {isReporter && item.status !== 'IMPLEMENTED' && item.status !== 'RESOLVED' && item.status !== 'CLOSED' && (
                          <div
                            className={`p-3 rounded-xl border space-y-2 ${
                              isDark ? 'bg-[#2F1707] border-[#C88D3A]/30' : 'bg-[#FFF9EE] border-[#C88D3A]/30'
                            }`}
                          >
                            <label className="block text-xs font-bold text-[#C88D3A]">
                              Reply or Provide Clarification to Coordinator:
                            </label>
                            {replySuccess[item.id] && (
                              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 text-xs font-semibold">
                                {replySuccess[item.id]}
                              </div>
                            )}
                            {replyError[item.id] && (
                              <div className="p-2 rounded-lg bg-rose-500/15 text-rose-600 text-xs font-semibold">
                                {replyError[item.id]}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={clarificationReplies[item.id] || ''}
                                onChange={(e) =>
                                  setClarificationReplies((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add context, reproduction steps, or device details..."
                                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border ${
                                  isDark
                                    ? 'bg-[#180A02] border-[#C88D3A]/30 text-[#FFF9EE]'
                                    : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C]'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleSendClarificationReply(item.id)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#C88D3A] text-white hover:bg-[#B77620] flex items-center gap-1 shrink-0"
                              >
                                <Send className="w-3 h-3" />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Adjust Involvement preference */}
                        {isReporter && item.status !== 'RESOLVED' && item.status !== 'CLOSED' && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-semibold opacity-70">Update preference:</span>
                            {(['HELP_TEST', 'CONTRIBUTE_FIX', 'CONTACT_ME', 'JUST_LOG'] as MissingPuzzleInvolvement[]).map(
                              (inv) => (
                                <button
                                  key={inv}
                                  type="button"
                                  onClick={() => handleUpdateInvolvementInLedger(item.id, inv)}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                    item.involvementPreference === inv
                                      ? 'bg-[#C88D3A] text-white'
                                      : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  {inv}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
