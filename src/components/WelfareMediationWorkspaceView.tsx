import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, formatActionAttribution } from '../domain/membership';
import { puzzleFeedbackStore } from '../services/puzzleFeedbackStore';
import { SharedMissingPuzzleReport, FeedbackStatus } from '../domain/puzzleFeedback';
import {
  HeartHandshake,
  ShieldAlert,
  HelpCircle,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles,
  Info,
  Calendar,
  User,
  Filter,
} from 'lucide-react';

export interface WelfareMediationWorkspaceViewProps {
  member: Member;
  activeMode: ActiveMode;
  isDark?: boolean;
}

type WelfareSectionKey =
  | 'ALL'
  | 'NEEDS_SUPPORT'
  | 'NEEDS_CLARIFICATION'
  | 'IN_MEDIATION'
  | 'FACILITY_ESCALATION'
  | 'RESOLVED';

export const WelfareMediationWorkspaceView: React.FC<WelfareMediationWorkspaceViewProps> = ({
  member,
  activeMode,
  isDark = false,
}) => {
  const [reports, setReports] = useState<SharedMissingPuzzleReport[]>([]);
  const [activeSection, setActiveSection] = useState<WelfareSectionKey>('ALL');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const attribution = formatActionAttribution(member, activeMode);

  // Load and subscribe to welfare reports
  const reloadReports = () => {
    puzzleFeedbackStore
      .getWelfareReports(member)
      .then((data) => {
        setReports(data);
        if (data.length > 0 && !selectedReportId) {
          setSelectedReportId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load welfare reports:', err);
      });
  };

  useEffect(() => {
    reloadReports();
    const unsub = puzzleFeedbackStore.subscribe(() => {
      reloadReports();
    });
    return () => unsub();
  }, [member]);

  // Operational section groupings mapped to factual states
  // Factual states: PENDING_REVIEW | UNDER_REVIEW | IN_PROGRESS | IMPLEMENTED | RESOLVED
  const needsSupportList = reports.filter(
    (r) =>
      r.status === 'PENDING_REVIEW' ||
      r.category.toLowerCase().includes('support') ||
      r.category.toLowerCase().includes('wellbeing')
  );

  const inMediationList = reports.filter(
    (r) =>
      r.status === 'IN_PROGRESS' ||
      r.category.toLowerCase().includes('mediation') ||
      r.category.toLowerCase().includes('roommate')
  );

  const needsClarificationList = reports.filter(
    (r) =>
      r.status === 'UNDER_REVIEW' ||
      r.events.some((e) => e.eventType === 'CLARIFICATION_REQUESTED')
  );

  const facilityEscalationsList = reports.filter(
    (r) =>
      r.category.toLowerCase().includes('facility') ||
      r.category.toLowerCase().includes('living') ||
      r.category.toLowerCase().includes('repair')
  );

  const resolvedList = reports.filter(
    (r) => r.status === 'IMPLEMENTED' || r.status === 'RESOLVED' || r.status === 'CLOSED'
  );

  // Filter based on active section tab
  const getFilteredReports = (): SharedMissingPuzzleReport[] => {
    switch (activeSection) {
      case 'NEEDS_SUPPORT':
        return needsSupportList;
      case 'IN_MEDIATION':
        return inMediationList;
      case 'NEEDS_CLARIFICATION':
        return needsClarificationList;
      case 'FACILITY_ESCALATION':
        return facilityEscalationsList;
      case 'RESOLVED':
        return resolvedList;
      default:
        return reports;
    }
  };

  const filteredReports = getFilteredReports();
  const selectedReport = reports.find((r) => r.id === selectedReportId) || filteredReports[0] || null;

  // Scoped Welfare Action: Add mediation/clarification note
  const handleAddMediationNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !noteInput.trim()) return;

    setIsSubmitting(true);
    try {
      await puzzleFeedbackStore.recordWelfareMediationNote(
        selectedReport.id,
        member,
        noteInput.trim(),
        'CLARIFICATION_REQUESTED'
      );
      setNoteInput('');
      setActionSuccessMessage('Mediation follow-up note recorded.');
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to record mediation note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scoped Welfare Action: Transition status (e.g. into mediation or resolved)
  const handleTransitionStatus = async (newStatus: FeedbackStatus, noteText: string) => {
    if (!selectedReport) return;

    setIsSubmitting(true);
    try {
      await puzzleFeedbackStore.updateWelfareStatus(
        selectedReport.id,
        member,
        newStatus,
        noteText
      );
      setActionSuccessMessage(`Welfare record marked as ${newStatus}.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to update welfare status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Header Card */}
      <div
        id="welfare-officer-banner"
        className="p-6 rounded-2xl border transition-colors duration-200"
        style={{
          backgroundColor: isDark ? '#3A1E0B' : '#FFF9EE',
          borderColor: isDark ? '#5A2D0C' : '#EADCCB',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="p-3 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                color: '#C88D3A',
              }}
            >
              <HeartHandshake className="w-6 h-6 text-[#C88D3A]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="font-serif text-xl sm:text-2xl font-bold tracking-tight"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  Accommodation Welfare &amp; Mediation
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border"
                  style={{
                    backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                    borderColor: '#C88D3A',
                    color: '#C88D3A',
                  }}
                >
                  Restorative Scope
                </span>
              </div>
              <p
                className="text-xs sm:text-sm mt-1 max-w-2xl"
                style={{ color: isDark ? '#D6BA9C' : '#7D471D' }}
              >
                Dedicated support workspace for resident wellbeing, roommate mediation, and facility living-condition escalations. Scoped strictly outside membership admission and financial reconciliation.
              </p>
            </div>
          </div>

          <div
            className="px-4 py-2.5 rounded-xl border flex flex-col items-start sm:items-end justify-center self-start md:self-auto shrink-0"
            style={{
              backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
              borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
            }}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C88D3A]">
              Acting Authority
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              {attribution.displayLabel}
            </span>
            <span className="text-[11px]" style={{ color: isDark ? '#D6BA9C' : '#8A5D3B' }}>
              Learn2Earn Lagos Yaba Campus
            </span>
          </div>
        </div>

        {/* Boundary Notice Banner */}
        <div
          className="mt-4 pt-3.5 border-t flex items-center gap-2 text-xs"
          style={{
            borderColor: isDark ? '#5A2D0C' : '#EADCCB',
            color: isDark ? '#D6BA9C' : '#7D471D',
          }}
        >
          <Info className="w-4 h-4 text-[#C88D3A] shrink-0" />
          <span>
            <strong>Authority Boundary:</strong> This workspace receives living-condition and mediation signals. It cannot approve membership admissions, reallocate rooms, or inspect private financial transactions.
          </span>
        </div>
      </div>

      {/* Operational Triage Queues / Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            key: 'ALL',
            label: 'All Welfare',
            count: reports.length,
            icon: HeartHandshake,
          },
          {
            key: 'NEEDS_SUPPORT',
            label: 'Needs Support',
            count: needsSupportList.length,
            icon: ShieldAlert,
          },
          {
            key: 'IN_MEDIATION',
            label: 'In Mediation',
            count: inMediationList.length,
            icon: Sparkles,
          },
          {
            key: 'NEEDS_CLARIFICATION',
            label: 'Needs Clarification',
            count: needsClarificationList.length,
            icon: HelpCircle,
          },
          {
            key: 'FACILITY_ESCALATION',
            label: 'Facility Issues',
            count: facilityEscalationsList.length,
            icon: Building2,
          },
          {
            key: 'RESOLVED',
            label: 'Resolved',
            count: resolvedList.length,
            icon: CheckCircle2,
          },
        ].map((item) => {
          const isSelected = activeSection === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              id={`welfare-filter-${item.key.toLowerCase()}`}
              onClick={() => setActiveSection(item.key as WelfareSectionKey)}
              className="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between"
              style={{
                backgroundColor: isSelected
                  ? isDark
                    ? '#5A2D0C'
                    : '#FFF9EE'
                  : isDark
                  ? '#3A1E0B'
                  : '#F7F1E7',
                borderColor: isSelected ? '#C88D3A' : isDark ? '#5A2D0C' : '#EADCCB',
                boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C88D3A]' : isDark ? 'text-[#D6BA9C]' : 'text-[#8A5D3B]'}`} />
                <span
                  className="text-sm font-bold font-mono"
                  style={{ color: isSelected ? '#C88D3A' : isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  {item.count}
                </span>
              </div>
              <span
                className="text-xs font-medium leading-snug"
                style={{
                  color: isSelected
                    ? isDark
                      ? '#FFF9EE'
                      : '#5A2D0C'
                    : isDark
                    ? '#D6BA9C'
                    : '#7D471D',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace 2-Column Split: Case List on Left, Detail & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Welfare Case Stream */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span
              className="text-xs font-bold uppercase tracking-wider text-[#C88D3A] flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              Active Queue ({filteredReports.length})
            </span>
            <span className="text-[11px]" style={{ color: isDark ? '#D6BA9C' : '#8A5D3B' }}>
              Select item to mediate
            </span>
          </div>

          {filteredReports.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center"
              style={{
                backgroundColor: isDark ? '#3A1E0B' : '#FFF9EE',
                borderColor: isDark ? '#5A2D0C' : '#EADCCB',
                color: isDark ? '#D6BA9C' : '#7D471D',
              }}
            >
              <CheckCircle2 className="w-8 h-8 text-[#C88D3A] mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                No active records in this queue
              </p>
              <p className="text-xs mt-1">All concerns matching this filter are addressed or clear.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {filteredReports.map((report) => {
                const isSelected = report.id === selectedReport?.id;
                return (
                  <div
                    key={report.id}
                    id={`welfare-item-${report.id}`}
                    onClick={() => setSelectedReportId(report.id)}
                    className="p-4 rounded-xl border text-left cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? isDark
                          ? '#4D260D'
                          : '#FFFDF9'
                        : isDark
                        ? '#3A1E0B'
                        : '#FFF9EE',
                      borderColor: isSelected ? '#C88D3A' : isDark ? '#5A2D0C' : '#EADCCB',
                      boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                        style={{
                          backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                          borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                          color: '#C88D3A',
                        }}
                      >
                        {report.category}
                      </span>
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor:
                            report.status === 'IMPLEMENTED' || report.status === 'RESOLVED'
                              ? isDark
                                ? '#1B3B1B'
                                : '#EEF8EE'
                              : isDark
                              ? '#2F1707'
                              : '#F7F1E7',
                          borderColor:
                            report.status === 'IMPLEMENTED' || report.status === 'RESOLVED'
                              ? '#4CAF50'
                              : '#C88D3A',
                          color:
                            report.status === 'IMPLEMENTED' || report.status === 'RESOLVED'
                              ? '#388E3C'
                              : '#C88D3A',
                        }}
                      >
                        {report.status}
                      </span>
                    </div>

                    <h3
                      className="text-sm font-bold line-clamp-1"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      {report.title}
                    </h3>

                    <p
                      className="text-xs line-clamp-2 mt-1 leading-relaxed"
                      style={{ color: isDark ? '#D6BA9C' : '#7D471D' }}
                    >
                      {report.description}
                    </p>

                    <div
                      className="flex items-center justify-between text-[11px] mt-3 pt-2.5 border-t"
                      style={{
                        borderColor: isDark ? '#5A2D0C' : '#EADCCB',
                        color: isDark ? '#D6BA9C' : '#8A5D3B',
                      }}
                    >
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3 h-3" />
                        {report.reporterDisplayName}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Workspace & Mediation Restorative Action Panel */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div
              id="welfare-case-detail"
              className="p-6 rounded-2xl border space-y-6"
              style={{
                backgroundColor: isDark ? '#3A1E0B' : '#FFF9EE',
                borderColor: isDark ? '#5A2D0C' : '#EADCCB',
              }}
            >
              {/* Case Header */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                        borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                        color: '#C88D3A',
                      }}
                    >
                      {selectedReport.category}
                    </span>
                    <span
                      className="text-xs font-mono font-medium"
                      style={{ color: isDark ? '#D6BA9C' : '#8A5D3B' }}
                    >
                      ID: {selectedReport.id}
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor:
                        selectedReport.status === 'IMPLEMENTED' || selectedReport.status === 'RESOLVED'
                          ? isDark
                            ? '#1B3B1B'
                            : '#EEF8EE'
                          : isDark
                          ? '#2F1707'
                          : '#F7F1E7',
                      borderColor:
                        selectedReport.status === 'IMPLEMENTED' || selectedReport.status === 'RESOLVED'
                          ? '#4CAF50'
                          : '#C88D3A',
                      color:
                        selectedReport.status === 'IMPLEMENTED' || selectedReport.status === 'RESOLVED'
                          ? '#388E3C'
                          : '#C88D3A',
                    }}
                  >
                    Status: {selectedReport.status}
                  </span>
                </div>

                <h2
                  className="font-serif text-lg sm:text-xl font-bold"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  {selectedReport.title}
                </h2>

                <p
                  className="text-sm mt-2 leading-relaxed whitespace-pre-wrap"
                  style={{ color: isDark ? '#D6BA9C' : '#5A2D0C' }}
                >
                  {selectedReport.description}
                </p>

                {/* Reporter & Location Meta */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 p-3 rounded-xl border text-xs"
                  style={{
                    backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                    borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                    color: isDark ? '#D6BA9C' : '#7D471D',
                  }}
                >
                  <div>
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-[#C88D3A]">
                      Resident Reporter
                    </span>
                    <span className="font-semibold text-sm" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                      {selectedReport.reporterDisplayName}
                    </span>
                    {selectedReport.reporterEmail && (
                      <span className="block text-[11px] font-mono opacity-80">
                        {selectedReport.reporterEmail}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-[#C88D3A]">
                      Living Context &amp; Scope
                    </span>
                    <span className="font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                      {selectedReport.locationContext || selectedReport.pageContext || 'Living Quarters'}
                    </span>
                    <span className="block text-[11px] opacity-80">
                      Preference: {selectedReport.involvementPreference}
                    </span>
                  </div>
                </div>
              </div>

              {/* Success notification banner */}
              {actionSuccessMessage && (
                <div
                  className="p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold"
                  style={{
                    backgroundColor: isDark ? '#1B3B1B' : '#EDF7ED',
                    borderColor: '#4CAF50',
                    color: isDark ? '#A5D6A7' : '#2E7D32',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {/* Restorative Action Controls */}
              <div
                className="p-4 rounded-xl border space-y-4"
                style={{
                  backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                  borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                }}
              >
                <div className="flex items-center justify-between">
                  <h4
                    className="text-xs font-bold uppercase tracking-wider text-[#C88D3A] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Welfare Officer Actions
                  </h4>
                  <span className="text-[11px]" style={{ color: isDark ? '#D6BA9C' : '#8A5D3B' }}>
                    Non-punitive restorative authority
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    id="welfare-action-mediate"
                    disabled={isSubmitting || selectedReport.status === 'IN_PROGRESS'}
                    onClick={() =>
                      handleTransitionStatus(
                        'IN_PROGRESS',
                        'Initiated restorative roommate mediation with participating fellows.'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: isDark ? '#3A1E0B' : '#FFF9EE',
                      borderColor: '#C88D3A',
                      color: isDark ? '#FFF9EE' : '#5A2D0C',
                    }}
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-[#C88D3A]" />
                    <span>Open Mediation Circle</span>
                  </button>

                  <button
                    type="button"
                    id="welfare-action-escalate-facility"
                    disabled={isSubmitting}
                    onClick={() =>
                      handleTransitionStatus(
                        'UNDER_REVIEW',
                        'Facility escalation logged with campus maintenance coordinator.'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: isDark ? '#3A1E0B' : '#FFF9EE',
                      borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                      color: isDark ? '#FFF9EE' : '#5A2D0C',
                    }}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#C88D3A]" />
                    <span>Escalate to Facility</span>
                  </button>

                  <button
                    type="button"
                    id="welfare-action-resolve"
                    disabled={isSubmitting || selectedReport.status === 'IMPLEMENTED' || selectedReport.status === 'RESOLVED'}
                    onClick={() =>
                      handleTransitionStatus(
                        'RESOLVED',
                        'Restorative agreement reached and welfare follow-up completed.'
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: '#5A2D0C',
                      color: '#FFF9EE',
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C88D3A]" />
                    <span>Mark Resolved &amp; Supported</span>
                  </button>
                </div>

                {/* Mediation Notes Form */}
                <form onSubmit={handleAddMediationNote} className="space-y-2 pt-2 border-t" style={{ borderColor: isDark ? '#5A2D0C' : '#E3D3BE' }}>
                  <label
                    htmlFor="welfare-note-input"
                    className="block text-xs font-semibold"
                    style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                  >
                    Record Mediation Note or Welfare Follow-up
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="welfare-note-input"
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="e.g. Spoke with chamber members; agreed to silent study hours from 10 PM..."
                      className="flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                      style={{
                        backgroundColor: isDark ? '#3A1E0B' : '#FFF9EE',
                        borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                        color: isDark ? '#FFF9EE' : '#5A2D0C',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !noteInput.trim()}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <span>Post Note</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3">
                <h4
                  className="text-xs font-bold uppercase tracking-wider text-[#C88D3A] flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Chronological Record &amp; Mediation Trail
                </h4>

                <div className="space-y-2.5">
                  {selectedReport.events.map((evt, idx) => (
                    <div
                      key={evt.eventId || idx}
                      className="p-3 rounded-xl border text-xs"
                      style={{
                        backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                        borderColor: isDark ? '#5A2D0C' : '#E3D3BE',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className="font-bold"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {evt.actorDisplayName}{' '}
                          {evt.actorCapacity && (
                            <span className="font-normal opacity-80">({evt.actorCapacity})</span>
                          )}
                        </span>
                        <span
                          className="font-mono text-[10px]"
                          style={{ color: isDark ? '#D6BA9C' : '#8A5D3B' }}
                        >
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p
                        className="leading-relaxed"
                        style={{ color: isDark ? '#D6BA9C' : '#5A2D0C' }}
                      >
                        {evt.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="p-12 rounded-2xl border text-center"
              style={{
                backgroundColor: isDark ? '#3A1E0B' : '#FFF9EE',
                borderColor: isDark ? '#5A2D0C' : '#EADCCB',
                color: isDark ? '#D6BA9C' : '#7D471D',
              }}
            >
              <HeartHandshake className="w-10 h-10 text-[#C88D3A] mx-auto mb-3 opacity-70" />
              <h3 className="font-serif text-lg font-bold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                No Welfare Case Selected
              </h3>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                Select an active case from the left panel to review living conditions, mediate roommate disputes, or add support notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
