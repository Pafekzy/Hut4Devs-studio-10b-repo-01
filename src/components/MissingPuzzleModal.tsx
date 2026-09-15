import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Layers,
  Search,
  PlusCircle,
  Compass,
  Info,
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

interface CategoryDropdownProps {
  value: string;
  onChange: (category: string) => void;
  categories: string[];
  isDark?: boolean;
}

/**
 * Reusable Hut4Devs Custom Category Dropdown Component
 * Follows established visual grammar: warm light surfaces, dark chocolate typography,
 * caramel/gold interaction accents, clear rotating chevron, visible focus state,
 * clear selected checkmark, and accessible keyboard navigation.
 */
const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  categories,
  isDark = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = categories.indexOf(value);
        const nextIndex = (currentIndex + 1) % categories.length;
        onChange(categories[nextIndex]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = categories.indexOf(value);
        const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
        onChange(categories[prevIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden native select for form accessibility, browser form sync, and test compatibility */}
      <select
        id="puzzle-issue-category"
        aria-hidden="true"
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Accessible Branded Trigger Button */}
      <button
        type="button"
        id="puzzle-category-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="puzzle-category-menu"
        aria-label={`Category: ${value}. Select issue category`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer outline-hidden active:scale-[0.99] ${
          isDark
            ? 'bg-[#180A02] text-[#FFF9EE] border-[#C88D3A]/40 hover:border-[#C88D3A] focus-visible:ring-2 focus-visible:ring-[#C88D3A]'
            : 'bg-white text-[#5A2D0C] border-[#EAE0D0] hover:border-[#C88D3A] focus-visible:ring-2 focus-visible:ring-[#C88D3A]'
        } ${isOpen ? 'ring-2 ring-[#C88D3A] border-[#C88D3A]' : ''}`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#C88D3A]' : isDark ? 'text-[#C88D3A]' : 'text-[#8A5D3B]'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Branded Listbox Menu */}
      {isOpen && (
        <div
          id="puzzle-category-menu"
          role="listbox"
          aria-label="Issue categories"
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border overflow-hidden shadow-xl transition-all duration-150 p-1 ${
            isDark
              ? 'bg-[#2F1707] border-[#C88D3A] text-[#FFF9EE] shadow-black/80'
              : 'bg-[#FFF9EE] border-[#C88D3A] text-[#5A2D0C] shadow-[#5A2D0C]/15'
          }`}
        >
          {categories.map((cat) => {
            const isSelected = cat === value;
            return (
              <button
                type="button"
                key={cat}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(cat);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-[#C88D3A] text-[#2F1707] font-bold'
                      : 'bg-[#C88D3A]/25 text-[#5A2D0C] font-bold'
                    : isDark
                    ? 'text-[#FFF9EE] hover:bg-[#5A2D0C] focus:bg-[#5A2D0C]'
                    : 'text-[#5A2D0C] hover:bg-[#C88D3A]/15 focus:bg-[#C88D3A]/15'
                }`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isDark ? 'text-[#2F1707]' : 'text-[#5A2D0C]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const MissingPuzzleModal: React.FC<MissingPuzzleModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  isDark = false,
  defaultLocation,
  initialReportId,
}) => {
  // Three distinct sections in exact conceptual order:
  // 1. Community Puzzle Board (Default on open)
  // 2. Spot & Log
  // 3. My Reports & Community Trail
  const [activeView, setActiveView] = useState<'COMMUNITY_BOARD' | 'SPOT_AND_LOG' | 'MY_TRAIL'>('COMMUNITY_BOARD');
  const [isSlotted, setIsSlotted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Form State - App Location / Context starts empty, with example guidance in placeholder only
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [locationContext, setLocationContext] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-submit state
  const [submittedReport, setSubmittedReport] = useState<SharedMissingPuzzleReport | null>(null);
  const [selectedInvolvement, setSelectedInvolvement] = useState<MissingPuzzleInvolvement | null>(null);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceClassification>('DEMO_LOCAL_FALLBACK');
  const [allReports, setAllReports] = useState<SharedMissingPuzzleReport[]>([]);

  // Community Board filters
  const [boardSearch, setBoardSearch] = useState('');
  const [boardStatusFilter, setBoardStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'IMPLEMENTED'>('ALL');
  const [boardCategoryFilter, setBoardCategoryFilter] = useState<string>('ALL');

  // Trail state & inline clarification replies
  const [expandedReportId, setExpandedReportId] = useState<string | null>(initialReportId || null);
  const [clarificationReplies, setClarificationReplies] = useState<Record<string, string>>({});
  const [replySuccess, setReplySuccess] = useState<Record<string, string>>({});
  const [replyError, setReplyError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setAllReports(puzzleFeedbackStore.getReports());
      if (initialReportId) {
        // If an initialReportId is supplied (e.g. from notification), check if it belongs to current member
        const reports = puzzleFeedbackStore.getReports();
        const target = reports.find((r) => r.id === initialReportId);
        if (target && target.reporterMemberId === currentMember.id) {
          setActiveView('MY_TRAIL');
        } else {
          setActiveView('COMMUNITY_BOARD');
        }
        setExpandedReportId(initialReportId);
      } else {
        // Section 1: Community Puzzle Board MUST be default when opening
        setActiveView('COMMUNITY_BOARD');
      }

      if (!submittedReport) {
        setIsSlotted(false);
        setTitle('');
        setDescription('');
        setLocationContext('');
        setErrorMsg('');
      }
    }
  }, [isOpen, submittedReport, initialReportId, currentMember.id]);

  // Subscribe to store updates for real-time responsiveness
  useEffect(() => {
    const unsub = puzzleFeedbackStore.subscribe(() => {
      setAllReports(puzzleFeedbackStore.getReports());
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSlotPiece = () => {
    setIsSlotted(true);
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
    if (!category.trim()) {
      setErrorMsg('Please select a category for this missing puzzle.');
      return;
    }
    if (!locationContext.trim()) {
      setErrorMsg('Please specify the App Location / Context where this was observed.');
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
          locationContext: locationContext.trim(),
          pageContext: locationContext.trim(),
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
    setLocationContext('');
    setErrorMsg('');
    setActiveView('SPOT_AND_LOG');
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

  const formatInvolvementLabel = (inv?: MissingPuzzleInvolvement | string): string => {
    switch (inv) {
      case 'HELP_TEST':
        return 'Willing to Help Test';
      case 'CONTRIBUTE_FIX':
        return 'Willing to Contribute Code';
      case 'CONSULT_DESIGN':
        return 'Available for Design Consultation';
      case 'CONTACT_ME':
        return 'Open to Clarification';
      case 'JUST_LOG':
        return 'Log Only';
      default:
        return inv || 'Just Log';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
      case 'OPEN':
        return {
          label: 'Pending Review',
          className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
          dotClass: 'bg-amber-500',
        };
      case 'UNDER_REVIEW':
      case 'ACKNOWLEDGED':
        return {
          label: 'Under Review',
          className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30',
          dotClass: 'bg-blue-500',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30',
          dotClass: 'bg-purple-500',
        };
      case 'IMPLEMENTED':
      case 'RESOLVED':
        return {
          label: 'Implemented',
          className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
          dotClass: 'bg-emerald-500',
        };
      case 'CLOSED':
        return {
          label: 'Closed',
          className: 'bg-stone-500/15 text-stone-700 dark:text-stone-400 border border-stone-500/30',
          dotClass: 'bg-stone-500',
        };
      default:
        return {
          label: status,
          className: 'bg-stone-500/15 text-stone-700 dark:text-stone-400 border border-stone-500/30',
          dotClass: 'bg-stone-500',
        };
    }
  };

  const myReports = allReports.filter((r) => r.reporterMemberId === currentMember.id);

  // Filter logic for Section 1: Community Puzzle Board
  const filteredBoardReports = allReports.filter((item) => {
    // Status filter
    if (boardStatusFilter !== 'ALL') {
      if (boardStatusFilter === 'PENDING_REVIEW' && item.status !== 'PENDING_REVIEW' && item.status !== 'OPEN') {
        return false;
      }
      if (boardStatusFilter === 'UNDER_REVIEW' && item.status !== 'UNDER_REVIEW' && item.status !== 'ACKNOWLEDGED') {
        return false;
      }
      if (boardStatusFilter === 'IN_PROGRESS' && item.status !== 'IN_PROGRESS') {
        return false;
      }
      if (boardStatusFilter === 'IMPLEMENTED' && item.status !== 'IMPLEMENTED' && item.status !== 'RESOLVED') {
        return false;
      }
    }

    // Category filter
    if (boardCategoryFilter !== 'ALL' && item.category !== boardCategoryFilter) {
      return false;
    }

    // Search query (title, description, location)
    if (boardSearch.trim()) {
      const q = boardSearch.toLowerCase().trim();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchLoc = (item.locationContext || item.pageContext || '').toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchCat) {
        return false;
      }
    }

    return true;
  });

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
        className={`w-full max-w-3xl rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-2xl my-auto ${
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
            <div className="w-9 h-9 rounded-xl bg-[#5A2D0C] border border-[#C88D3A] flex items-center justify-center shadow-inner shrink-0">
              <Puzzle className="w-5 h-5 text-[#C88D3A]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="missing-puzzle-title" className="font-serif font-bold text-base sm:text-lg">
                  Fix a Puzzle
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border bg-[#C88D3A]/15 border-[#C88D3A]/40 text-[#B77620] dark:text-[#E2AB5D] font-semibold">
                  Community Improvement System
                </span>
              </div>
              <p className="text-xs opacity-75">
                Every gap is a missing piece of our collective home waiting to be surfaced and solved together.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl border border-transparent hover:border-[#C88D3A]/40 hover:bg-[#C88D3A]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 opacity-70 hover:opacity-100" />
          </button>
        </div>

        {/* View Toggle: THREE Sections in exact conceptual order:
            1. Community Puzzle Board
            2. Spot & Log
            3. My Reports & Community Trail */}
        <div
          className={`px-5 sm:px-6 pt-3 pb-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
            isDark ? 'bg-[#2B1406] border-[#3E200C]' : 'bg-[#FFF9EE] border-[#EAE0D0]'
          }`}
        >
          <div className="inline-flex p-1 rounded-xl bg-black/10 dark:bg-black/25 border border-[#C88D3A]/20 gap-1 flex-wrap sm:flex-nowrap">
            {/* 1. Community Puzzle Board (Default) */}
            <button
              type="button"
              id="tab-btn-community-board"
              onClick={() => setActiveView('COMMUNITY_BOARD')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeView === 'COMMUNITY_BOARD'
                  ? 'bg-[#5A2D0C] text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#C88D3A]" />
              <span>Community Puzzle Board</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C88D3A]/25 text-[#C88D3A] dark:text-[#FFF9EE] font-mono font-bold">
                {allReports.length}
              </span>
            </button>

            {/* 2. Spot & Log */}
            <button
              type="button"
              id="tab-btn-spot-and-log"
              data-testid="tab-btn-report-puzzle"
              onClick={() => {
                setActiveView('SPOT_AND_LOG');
                setSubmittedReport(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeView === 'SPOT_AND_LOG'
                  ? 'bg-[#5A2D0C] text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5 text-[#C88D3A]" />
              <span>Spot &amp; Log</span>
            </button>

            {/* 3. My Reports & Community Trail */}
            <button
              type="button"
              id="tab-btn-my-trail"
              data-testid="tab-btn-community-ledger"
              onClick={() => setActiveView('MY_TRAIL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeView === 'MY_TRAIL'
                  ? 'bg-[#5A2D0C] text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#C88D3A]" />
              <span>My Reports &amp; Community Trail</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C88D3A] text-white font-mono font-bold">
                {myReports.length}
              </span>
            </button>
          </div>

          <span className="text-[11px] opacity-60 hidden md:inline">
            Member: <strong>{currentMember.displayName}</strong>
          </span>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: COMMUNITY PUZZLE BOARD (Default View)                           */}
        {/* ========================================================================= */}
        {activeView === 'COMMUNITY_BOARD' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Context & Action Banner */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isDark ? 'bg-[#231004] border-[#C88D3A]/30' : 'bg-[#FDFBF7] border-[#5A2D0C]/15 shadow-xs'
              }`}
            >
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C88D3A]">
                  <Layers className="w-4 h-4" />
                  <span>See What Is Already Being Solved</span>
                </div>
                <p className="text-xs opacity-75 leading-snug">
                  Browse community issues currently progressing through review, triage, and implementation. Checking first helps reduce duplicates.
                </p>
              </div>
              <button
                type="button"
                id="board-spot-new-btn"
                onClick={() => {
                  setActiveView('SPOT_AND_LOG');
                  setSubmittedReport(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5A2D0C] text-[#FFF9EE] border border-[#C88D3A] hover:bg-[#3D1E08] active:translate-y-[1px] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-[#C88D3A]" />
                <span>Spot &amp; Log a New Puzzle</span>
              </button>
            </div>

            {/* Lifecycle Stages Indicator */}
            <div
              className={`px-3.5 py-2.5 rounded-xl border text-[11px] flex flex-wrap items-center justify-between gap-2 ${
                isDark ? 'bg-[#180A02] border-[#C88D3A]/20' : 'bg-white border-[#5A2D0C]/10'
              }`}
            >
              <span className="font-bold text-[#C88D3A] uppercase tracking-wider text-[10px]">
                Technical Lifecycle:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  1. Pending Review
                </span>
                <span className="opacity-40">→</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                  2. Under Review
                </span>
                <span className="opacity-40">→</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
                  3. In Progress
                </span>
                <span className="opacity-40">→</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  4. Implemented
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    id="board-search-input"
                    value={boardSearch}
                    onChange={(e) => setBoardSearch(e.target.value)}
                    placeholder="Search community puzzles by title, description, or context..."
                    className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-hidden transition-all ${
                      isDark
                        ? 'bg-[#180A02] border-[#C88D3A]/30 text-[#FFF9EE] focus:border-[#C88D3A]'
                        : 'bg-white border-[#EAE0D0] text-[#5A2D0C] focus:border-[#5A2D0C]'
                    }`}
                  />
                  {boardSearch && (
                    <button
                      type="button"
                      onClick={() => setBoardSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  id="board-category-filter"
                  aria-label="Filter by category"
                  value={boardCategoryFilter}
                  onChange={(e) => setBoardCategoryFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl border text-xs outline-hidden cursor-pointer ${
                    isDark
                      ? 'bg-[#180A02] border-[#C88D3A]/30 text-[#FFF9EE] focus:border-[#C88D3A]'
                      : 'bg-white border-[#EAE0D0] text-[#5A2D0C] focus:border-[#5A2D0C]'
                  }`}
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {(
                  [
                    { id: 'ALL', label: 'All Statuses' },
                    { id: 'PENDING_REVIEW', label: 'Pending Review' },
                    { id: 'UNDER_REVIEW', label: 'Under Review' },
                    { id: 'IN_PROGRESS', label: 'In Progress' },
                    { id: 'IMPLEMENTED', label: 'Implemented' },
                  ] as const
                ).map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setBoardStatusFilter(st.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      boardStatusFilter === st.id
                        ? 'bg-[#5A2D0C] text-white shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Issues List */}
            {filteredBoardReports.length === 0 ? (
              <div
                className={`py-12 text-center rounded-2xl border ${
                  isDark ? 'bg-[#231004]/50 border-[#C88D3A]/20' : 'bg-[#FDFBF7] border-[#5A2D0C]/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#C88D3A]/10 text-[#C88D3A] flex items-center justify-center mx-auto mb-2">
                  <Puzzle className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">
                  No matching community puzzle pieces found
                </p>
                <p className="text-[11px] opacity-70 mt-1 max-w-sm mx-auto">
                  {boardSearch || boardStatusFilter !== 'ALL' || boardCategoryFilter !== 'ALL'
                    ? 'Try clearing the search query or status filter.'
                    : 'Be the first to log an issue or observation for this setting.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('SPOT_AND_LOG');
                    setSubmittedReport(null);
                  }}
                  className="mt-3 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#C88D3A] text-white hover:bg-[#B77620] cursor-pointer"
                >
                  Spot &amp; Log This Piece →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBoardReports.map((item) => {
                  const statusInfo = getStatusBadge(item.status);
                  const isReporter = item.reporterMemberId === currentMember.id;
                  const latestEvent = item.events && item.events.length > 0 ? item.events[item.events.length - 1] : null;

                  return (
                    <div
                      key={item.id}
                      id={`board-item-${item.id}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDark
                          ? 'bg-[#231004] border-[#C88D3A]/30 text-[#FFF9EE] hover:border-[#C88D3A]/60'
                          : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C] hover:border-[#C88D3A]/50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Top Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A]/15 text-[#C88D3A]">
                              {item.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusInfo.className}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                              {statusInfo.label}
                            </span>
                            {isReporter && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#5A2D0C] text-[#FFF9EE] border border-[#C88D3A]">
                                My Report
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="font-serif font-bold text-sm text-[#5A2D0C] dark:text-[#FFF9EE] leading-tight">
                            {item.title}
                          </h4>

                          {/* Description */}
                          <p className="text-xs opacity-80 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Context & Metadata (Strictly preserving privacy: no email or private IDs exposed) */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] opacity-75 pt-1">
                            <span className="flex items-center gap-1">
                              <Compass className="w-3.5 h-3.5 text-[#C88D3A]" />
                              <strong>Context:</strong> {item.locationContext || item.pageContext}
                            </span>
                            <span>
                              <strong>Logged:</strong> {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            {item.involvementPreference && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 font-medium">
                                {formatInvolvementLabel(item.involvementPreference)}
                              </span>
                            )}
                          </div>

                          {/* Most Recent Relevant Update */}
                          {latestEvent && (
                            <div
                              className={`mt-2 p-2 rounded-lg text-[11px] border ${
                                isDark
                                  ? 'bg-[#180A02] border-[#C88D3A]/20 text-[#FFF9EE]/90'
                                  : 'bg-[#FFF9EE] border-[#C88D3A]/25 text-[#5A2D0C]/90'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                                <span className="font-bold text-[#C88D3A]">
                                  Latest Progress: {formatEventName(latestEvent.eventType)}
                                </span>
                                <span>{new Date(latestEvent.timestamp).toLocaleDateString()}</span>
                              </div>
                              {latestEvent.message && (
                                <p className="italic opacity-85 leading-snug">
                                  "{latestEvent.message}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: SPOT & LOG (Issue Reporting Workflow)                           */}
        {/* ========================================================================= */}
        {activeView === 'SPOT_AND_LOG' && (
          <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {!submittedReport ? (
              <>
                {/* 3D Interactive Physical Puzzle Placement Stage */}
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
                        ? 'Thank you for connecting the missing piece! Now record the details below.'
                        : 'Slot the physical piece into the chamber socket to anchor your observation.'}
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
                    {/* Item 1: Reusable Custom Category Dropdown */}
                    <div>
                      <label
                        htmlFor="puzzle-issue-category"
                        className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#B77620] dark:text-[#E2AB5D]"
                      >
                        Category *
                      </label>
                      <CategoryDropdown
                        value={category}
                        onChange={setCategory}
                        categories={CATEGORIES}
                        isDark={isDark}
                      />
                    </div>

                    {/* Item 2: App Location / Context with Placeholder Guidance only (no pre-filled mutable text) */}
                    <div>
                      <label
                        htmlFor="puzzle-issue-location"
                        className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#B77620] dark:text-[#E2AB5D]"
                      >
                        App Location / Context *
                      </label>
                      <input
                        id="puzzle-issue-location"
                        type="text"
                        required
                        placeholder={defaultLocation ? `e.g. ${defaultLocation}` : 'e.g. Member Home Workspace'}
                        value={locationContext}
                        onChange={(e) => setLocationContext(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden transition-all ${
                          isDark
                            ? 'bg-[#180A02] border-[#C88D3A]/40 text-[#FFF9EE] focus:border-[#C88D3A] focus:ring-1 focus:ring-[#C88D3A]'
                            : 'bg-white border-[#EAE0D0] text-stone-900 focus:border-[#5A2D0C] focus:ring-1 focus:ring-[#5A2D0C]'
                        }`}
                      />
                      <span className="text-[10px] opacity-60 block mt-0.5">
                        Specify the room, workspace, or feature view where you encountered this.
                      </span>
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
                      onClick={() => setActiveView('COMMUNITY_BOARD')}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#5A2D0C]/20 hover:bg-[#5A2D0C]/5 transition-colors cursor-pointer"
                    >
                      ← Back to Community Board
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
                    community trail with initial status: <strong>Pending Review</strong>.
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
                    className="text-xs font-semibold text-[#B77620] hover:underline cursor-pointer"
                  >
                    + Log another missing piece
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('MY_TRAIL')}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#C88D3A] text-white hover:bg-[#B77620] transition-colors cursor-pointer"
                  >
                    View in My Reports &amp; Community Trail →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: MY REPORTS & COMMUNITY TRAIL (Personal Tracking & Trail)       */}
        {/* ========================================================================= */}
        {activeView === 'MY_TRAIL' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Context Header */}
            <div className="flex items-center justify-between gap-2 border-b border-[#C88D3A]/20 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A2D0C] dark:text-[#FFF9EE]">
                  My Submitted Puzzle Reports ({myReports.length})
                </h3>
                <p className="text-[11px] opacity-60">
                  Track the audit trail, coordinator reviews, and clarification discussions on your submissions.
                </p>
              </div>
              <span className="text-[10px] font-mono opacity-60 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                Append-only history
              </span>
            </div>

            {myReports.length === 0 ? (
              <div
                className={`py-12 text-center rounded-2xl border ${
                  isDark ? 'bg-[#231004]/50 border-[#C88D3A]/20' : 'bg-[#FDFBF7] border-[#5A2D0C]/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#C88D3A]/10 text-[#C88D3A] flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">
                  You haven't logged any missing puzzle pieces yet.
                </p>
                <p className="text-[11px] opacity-70 mt-1 max-w-sm mx-auto">
                  Notice an interface glitch, accommodation workflow obstacle, or missing feature?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('SPOT_AND_LOG');
                    setSubmittedReport(null);
                  }}
                  className="mt-3 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#C88D3A] text-white hover:bg-[#B77620] cursor-pointer"
                >
                  Spot &amp; Log Your First Piece →
                </button>
              </div>
            ) : (
              myReports.map((item) => {
                const isExpanded = expandedReportId === item.id;
                const statusInfo = getStatusBadge(item.status);

                return (
                  <div
                    key={item.id}
                    id={`my-report-item-${item.id}`}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-[#231004] border-[#C88D3A]/30 text-[#FFF9EE]'
                        : 'bg-white border-[#5A2D0C]/15 text-[#5A2D0C] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A]/15 text-[#C88D3A]">
                            {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusInfo.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                            {statusInfo.label}
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
                          <span>Context: {item.locationContext || item.pageContext}</span>
                          <span>Logged: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedReportId(isExpanded ? null : item.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Factual Trail' : 'Inspect Trail'}</span>
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
                          <span className="text-[10px] opacity-60 font-mono">ID: {item.id}</span>
                        </div>

                        {/* Events List */}
                        <div
                          className={`p-3 rounded-xl border space-y-2 max-h-48 overflow-y-auto ${
                            isDark ? 'bg-[#180A02] border-[#C88D3A]/20' : 'bg-[#FDFBF7] border-[#5A2D0C]/10'
                          }`}
                        >
                          {item.events?.map((evt, idx) => (
                            <div
                              key={evt.eventId || idx}
                              className="text-xs space-y-0.5 border-b border-[#C88D3A]/10 pb-2 last:border-b-0 last:pb-0"
                            >
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-bold text-[#C88D3A]">
                                  {formatEventName(evt.eventType)}
                                </span>
                                <span className="text-[10px] opacity-60">
                                  {new Date(evt.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-[11px] opacity-75">
                                Actor: {evt.actorDisplayName} {evt.actorCapacity ? `(${evt.actorCapacity})` : ''}
                              </div>
                              {evt.message && <p className="italic opacity-90">{evt.message}</p>}
                            </div>
                          ))}
                        </div>

                        {/* Clarification response form if needed */}
                        {item.status !== 'IMPLEMENTED' && item.status !== 'RESOLVED' && item.status !== 'CLOSED' && (
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
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#C88D3A] text-white hover:bg-[#B77620] flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Adjust Involvement preference */}
                        {item.status !== 'RESOLVED' && item.status !== 'CLOSED' && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-semibold opacity-70">Update preference:</span>
                            {(['HELP_TEST', 'CONTRIBUTE_FIX', 'CONTACT_ME', 'JUST_LOG'] as MissingPuzzleInvolvement[]).map(
                              (inv) => (
                                <button
                                  key={inv}
                                  type="button"
                                  onClick={() => handleUpdateInvolvementInLedger(item.id, inv)}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
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
