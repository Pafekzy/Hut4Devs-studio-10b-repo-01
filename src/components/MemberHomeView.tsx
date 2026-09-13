import React, { useState } from 'react';
import { Hut4DevsLogo } from './Hut4DevsLogo';
import { ThemeToggle } from './ThemeToggle';
import { AccommodationResponsibilityCard } from './AccommodationResponsibilityCard';
import { AccommodationResponsibility } from '../domain/accommodation';
import { Member } from '../domain/auth';
import { ActiveMode, ScopedRoleAssignment, formatActionAttribution } from '../domain/membership';
import { ModeSwitcher } from './ModeSwitcher';
import { FinancialNotesThread } from './FinancialNotesThread';
import { PeerSupportSection } from './PeerSupportSection';
import { TrustTrailFeed } from './TrustTrailFeed';
import { VouchSection } from './VouchSection';
import { RecognitionView } from './RecognitionView';
import { MissingPuzzleModal } from './MissingPuzzleModal';
import { MemberNotificationsDropdown } from './MemberNotificationsDropdown';
import { peerSupportStore } from '../services/peerSupportStore';
import { membershipStore } from '../services/membershipStore';
import {
  PeerSupportAgreement,
  PeerVouch,
  TrustTrailEvent,
  CommunityRecognition,
  PeerSupportType,
} from '../domain/peerSupport';
import {
  LogOut,
  Home,
  User,
  Shield,
  MessageSquare,
  Bell,
  ChevronDown,
  ChevronUp,
  HandCoins,
  Footprints,
  Award,
  ShieldCheck,
  Building,
  Puzzle,
} from 'lucide-react';

interface MemberHomeViewProps {
  isDark: boolean;
  responsibility: AccommodationResponsibility;
  member?: Member;
  scopedRoles?: ScopedRoleAssignment[];
  currentMode?: ActiveMode;
  onModeChange?: (mode: ActiveMode) => void;
  onToggleTheme: () => void;
  onExitToLanding: () => void;
  onViewResponsibilityDetails: (responsibilityId?: string) => void;
  onLogout?: () => void;
  onSwitchToAdmin?: () => void;
  onSwitchToCaptain?: () => void;
  onSwitchToCoordinator?: () => void;
}

type FellowWorkspaceTab =
  | 'accommodation'
  | 'peer-support'
  | 'trust-trails'
  | 'vouches'
  | 'recognition';

export const MemberHomeView: React.FC<MemberHomeViewProps> = ({
  isDark,
  responsibility,
  member,
  scopedRoles = [],
  currentMode = 'FELLOW',
  onModeChange,
  onToggleTheme,
  onExitToLanding,
  onViewResponsibilityDetails,
  onLogout,
  onSwitchToAdmin,
  onSwitchToCaptain,
  onSwitchToCoordinator,
}) => {
  const [activeTab, setActiveTab] = useState<FellowWorkspaceTab>('accommodation');
  const [showNotes, setShowNotes] = useState(false);
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false);
  const [selectedPuzzleReportId, setSelectedPuzzleReportId] = useState<string | undefined>(undefined);

  // Peer support state managed from store
  const [supports, setSupports] = useState<PeerSupportAgreement[]>(() =>
    peerSupportStore.getAllSupports()
  );
  const [vouches, setVouches] = useState<PeerVouch[]>(() => peerSupportStore.getAllVouches());
  const [trailEvents, setTrailEvents] = useState<TrustTrailEvent[]>(() =>
    peerSupportStore.getAllTrailEvents()
  );
  const [recognitions, setRecognitions] = useState<CommunityRecognition[]>(() =>
    peerSupportStore.getAllRecognitions()
  );

  const availableMembers = membershipStore.getMembers();

  // Active member fallback
  const currentMember: Member = member || {
    id: 'mem-1',
    displayName: 'Emmanuel Ukom',
    roles: [],
    h4dMemberId: 'H4D-00021',
    createdAt: '2026-01-10T08:00:00Z',
  };

  // Check if current fellow has an active room captain or coordinator responsibility
  const captainAssignment = scopedRoles.find((r) => r.role === ('ROOM_CAPTAIN' as any));
  const coordinatorAssignment = scopedRoles.find(
    (r) => r.role === ('ACCOMMODATION_FELLOWS_COORDINATOR' as any)
  );

  const attribution = member ? formatActionAttribution(member, currentMode) : null;

  // Handlers for Peer Support actions
  const handleCreateSupport = (data: {
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
  }) => {
    try {
      if (data.type === 'gift') {
        peerSupportStore.createGift(
          currentMember.id,
          currentMember.displayName,
          data.toMemberId!,
          data.toMemberName!,
          data.amount,
          data.purpose,
          data.notes
        );
      } else if (data.type === 'loan') {
        peerSupportStore.createLoan(
          currentMember.id,
          currentMember.displayName,
          data.toMemberId!,
          data.toMemberName!,
          data.amount,
          data.purpose,
          data.repaymentPeriod!,
          data.repaymentDate!,
          data.notes,
          data.acknowledgedWarning
        );
      } else if (data.type === 'contribution') {
        peerSupportStore.createContributionCampaign(
          currentMember.id,
          currentMember.displayName,
          data.title!,
          data.purpose,
          data.targetAmount!,
          data.amount,
          data.notes
        );
      }
      setSupports(peerSupportStore.getAllSupports());
      setTrailEvents(peerSupportStore.getAllTrailEvents());
    } catch (err: any) {
      alert(err.message || 'Error creating peer support agreement');
    }
  };

  const handleRecordRepayment = (supportId: string, amount: number) => {
    try {
      peerSupportStore.recordLoanRepayment(supportId, amount, currentMember.id);
      setSupports(peerSupportStore.getAllSupports());
      setTrailEvents(peerSupportStore.getAllTrailEvents());
    } catch (err: any) {
      alert(err.message || 'Error recording repayment');
    }
  };

  const handleConvertToGift = (supportId: string, reason: string) => {
    try {
      peerSupportStore.convertDebtToGift(supportId, currentMember.id, reason);
      setSupports(peerSupportStore.getAllSupports());
      setTrailEvents(peerSupportStore.getAllTrailEvents());
    } catch (err: any) {
      alert(err.message || 'Error converting debt to gift');
    }
  };

  const handleContributeToCampaign = (campaignId: string, amount: number, note?: string) => {
    try {
      peerSupportStore.contributeToCampaign(
        campaignId,
        currentMember.id,
        currentMember.displayName,
        amount,
        note
      );
      setSupports(peerSupportStore.getAllSupports());
      setTrailEvents(peerSupportStore.getAllTrailEvents());
    } catch (err: any) {
      alert(err.message || 'Error contributing to campaign');
    }
  };

  const handleAddVouch = (
    targetMemberId: string,
    targetMemberName: string,
    context: string,
    confidence: 'high' | 'moderate' | 'cautious',
    scope: string,
    notes: string
  ) => {
    try {
      peerSupportStore.addVouch(
        currentMember.id,
        currentMember.displayName,
        targetMemberId,
        targetMemberName,
        context,
        confidence,
        scope,
        notes
      );
      setVouches(peerSupportStore.getAllVouches());
      setTrailEvents(peerSupportStore.getAllTrailEvents());
    } catch (err: any) {
      alert(err.message || 'Error publishing vouch');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
      }`}
    >
      {/* Active Delegated Responsibility Callout Banner for Captains / Coordinators */}
      {captainAssignment && currentMode === 'FELLOW' && onSwitchToCaptain && (
        <div
          id="captain-responsibility-alert-banner"
          className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-xs text-[#5A2D0C]"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4 text-[#B77620]" />
              <span>
                You have an active delegated responsibility:{' '}
                <strong>Room Captain — {captainAssignment.scope.roomName}</strong> (
                {captainAssignment.scope.propertyName}).
              </span>
            </div>
            <button
              type="button"
              id="btn-switch-to-captain-banner"
              onClick={onSwitchToCaptain}
              className="px-3 py-1 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#2F1707] font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Switch to Room Captain Mode →
            </button>
          </div>
        </div>
      )}

      {coordinatorAssignment && currentMode === 'FELLOW' && onSwitchToCoordinator && (
        <div
          id="coordinator-responsibility-alert-banner"
          className="bg-purple-500/10 border-b border-purple-500/30 px-4 py-2.5 text-xs text-[#5A2D0C]"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4 text-purple-700" />
              <span>
                You have an active administrative role:{' '}
                <strong>L2E Accommodation Fellows Coordinator</strong>.
              </span>
            </div>
            <button
              type="button"
              id="btn-switch-to-coordinator-banner"
              onClick={onSwitchToCoordinator}
              className="px-3 py-1 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#2F1707] font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Switch to Coordinator Mode →
            </button>
          </div>
        </div>
      )}

      {/* Application Shell Header */}
      <header
        className="sticky top-0 z-30 w-full border-b transition-colors duration-200"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          backgroundColor: isDark ? 'rgba(47, 23, 7, 0.95)' : 'rgba(247, 241, 231, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
          {/* Brand Mark */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={onExitToLanding}
              className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer"
              title="Return to Public Landing"
            >
              <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
            </button>
          </div>

          {/* Global Actions: Notifications, Messages, Fix a Puzzle, Role Switcher, Theme & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Fix a Missing Puzzle Button */}
            <button
              type="button"
              id="header-missing-puzzle-btn"
              onClick={() => setIsPuzzleModalOpen(true)}
              aria-label="Fix a Missing Puzzle"
              title="Fix a Missing Puzzle (Feedback)"
              className={`p-2 sm:px-3 sm:py-2 min-h-[44px] flex items-center gap-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] border-2 border-b-3 active:border-b active:translate-y-[1px] shadow-xs ${
                isDark
                  ? 'bg-[#3E200C] text-[#FFF9EE] border-[#C88D3A]/50 hover:bg-[#52270A]'
                  : 'bg-[#FFF9EE] text-[#5A2D0C] border-[#C88D3A]/60 hover:bg-[#F2E8D8]'
              }`}
            >
              <Puzzle className="w-4 h-4 text-[#C88D3A] shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">Fix a Puzzle</span>
            </button>

            {/* Notification Bell with Live Operational Dropdown */}
            <MemberNotificationsDropdown
              memberId={currentMember.id}
              isDark={isDark}
              onOpenFeedbackReport={(feedbackId) => {
                setSelectedPuzzleReportId(feedbackId);
                setIsPuzzleModalOpen(true);
              }}
            />

            {/* Messages */}
            <button
              type="button"
              id="header-messages-btn"
              aria-label="Messages"
              title="Messages"
              className={`p-2 sm:px-2.5 sm:py-2 min-h-[44px] flex items-center gap-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                isDark
                  ? 'text-[#E5D3BA] hover:text-[#FFF9EE] hover:bg-[#3E200C]'
                  : 'text-[#6D4223] hover:text-[#5A2D0C] hover:bg-[#EFE5D5]'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">Messages</span>
            </button>

            {/* Role / Capacity Switcher — user-facing active-capacity source of truth */}
            {member && onModeChange && (
              <ModeSwitcher
                member={member}
                scopedRoles={scopedRoles}
                currentMode={currentMode}
                onModeChange={onModeChange}
                isDark={isDark}
              />
            )}

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* Quiet Secondary Log Out Action */}
            {onLogout ? (
              <button
                type="button"
                id="header-logout-btn"
                onClick={onLogout}
                aria-label="Log Out"
                title="Log Out Session"
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                  isDark
                    ? 'text-[#C88D3A] hover:text-[#FFF9EE] hover:bg-[#3E200C]'
                    : 'text-[#8A5D3B] hover:text-[#5A2D0C] hover:bg-[#EFE5D5]'
                }`}
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                id="exit-landing-btn"
                onClick={onExitToLanding}
                aria-label="Exit to public landing"
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                  isDark
                    ? 'text-[#C88D3A] hover:text-[#FFF9EE] hover:bg-[#3E200C]'
                    : 'text-[#8A5D3B] hover:text-[#5A2D0C] hover:bg-[#EFE5D5]'
                }`}
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Landing</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Workspace Navigation Tabs with 3D tactile buttons and dark mode styling */}
        <div className={`border-t transition-colors ${
          isDark ? 'border-[#3E200C] bg-[#231004]/90' : 'border-[#5A2D0C]/15 bg-[#FFFDF9]/90'
        }`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-2">
            {[
              { id: 'accommodation', label: 'Accommodation', icon: Building },
              { id: 'peer-support', label: 'Peer Support Hub', icon: HandCoins },
              { id: 'trust-trails', label: 'Trails of Trust', icon: Footprints },
              { id: 'vouches', label: 'Contextual Vouches', icon: ShieldCheck },
              { id: 'recognition', label: 'Recognition', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-nav-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id as FellowWorkspaceTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border-b-3 active:border-b active:translate-y-[1px] shadow-xs ${
                    isActive
                      ? isDark
                        ? 'bg-[#C88D3A] text-[#241104] border-[#915B15]'
                        : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
                      : isDark
                      ? 'text-[#D9C4AC] hover:text-[#FFF9EE] hover:bg-[#3E200C] border-transparent'
                      : 'text-[#6D4223] hover:text-[#5A2D0C] hover:bg-[#EFE5D5] border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* TAB 1: ACCOMMODATION */}
        {activeTab === 'accommodation' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Greeting */}
            <div>
              <p
                className="text-xs sm:text-sm font-medium tracking-wide uppercase transition-colors duration-200"
                style={{ color: isDark ? '#C88D3A' : '#B77620' }}
              >
                Welcome, {currentMember.displayName}
              </p>
              <h1
                className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mt-1 transition-colors duration-200"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                What needs your attention?
              </h1>
            </div>

            {/* Accommodation Responsibility Card */}
            <section
              aria-label="Active Accommodation Responsibilities"
              className="space-y-6"
            >
              <AccommodationResponsibilityCard
                responsibility={responsibility}
                isDark={isDark}
                onViewDetails={onViewResponsibilityDetails}
              />

              {/* Contextual Financial Notes Toggle & Section */}
              <div className="bg-white/60 dark:bg-[#241004]/80 border border-[#C88D3A]/25 dark:border-[#C88D3A]/40 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#C88D3A]" />
                    <span className="font-serif font-bold text-sm text-[#5A2D0C] dark:text-[#FFF9EE]">
                      Accommodation Notes &amp; Clarifications
                    </span>
                  </div>
                  <button
                    type="button"
                    id="toggle-fellow-notes-thread-btn"
                    onClick={() => setShowNotes(!showNotes)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A2D0C] dark:text-[#FFF9EE] hover:text-[#B77620] px-3 py-1.5 rounded-xl bg-[#F7F1E7] dark:bg-[#3D1D08] border border-[#5A2D0C]/10 dark:border-[#C88D3A]/30 cursor-pointer"
                  >
                    <span>{showNotes ? 'Hide Thread' : 'View Notes Thread'}</span>
                    {showNotes ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {showNotes && (
                  <div className="mt-4">
                    <FinancialNotesThread
                      responsibilityId={responsibility.id}
                      currentMember={currentMember}
                      activeMode={currentMode}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: PEER SUPPORT HUB */}
        {activeTab === 'peer-support' && (
          <div className="animate-in fade-in duration-150">
            <PeerSupportSection
              currentMember={currentMember}
              availableMembers={availableMembers}
              supports={supports}
              isDark={isDark}
              onCreateSupport={handleCreateSupport}
              onRecordRepayment={handleRecordRepayment}
              onConvertToGift={handleConvertToGift}
              onContributeToCampaign={handleContributeToCampaign}
            />
          </div>
        )}

        {/* TAB 3: TRUST TRAILS */}
        {activeTab === 'trust-trails' && (
          <div className="animate-in fade-in duration-150">
            <TrustTrailFeed trailEvents={trailEvents} availableMembers={availableMembers} isDark={isDark} />
          </div>
        )}

        {/* TAB 4: CONTEXTUAL VOUCHES */}
        {activeTab === 'vouches' && (
          <div className="animate-in fade-in duration-150">
            <VouchSection
              vouches={vouches}
              availableMembers={availableMembers}
              currentMember={currentMember}
              isDark={isDark}
              onAddVouch={handleAddVouch}
            />
          </div>
        )}

        {/* TAB 5: RECOGNITION */}
        {activeTab === 'recognition' && (
          <div className="animate-in fade-in duration-150">
            <RecognitionView
              recognitions={recognitions}
              availableMembers={availableMembers}
              currentMember={currentMember}
              isDark={isDark}
            />
          </div>
        )}
      </main>

      {/* Member Shell Footer */}
      <footer
        className="w-full py-5 text-center text-xs tracking-wider uppercase border-t transition-colors duration-200 mt-auto"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          color: isDark ? '#A67B54' : '#8A5D3B',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="normal-case tracking-normal">
            Hut4Devs Community Infrastructure &bull; Coordinate &bull; Support &bull; Account &bull; Grow
          </p>
          {onSwitchToAdmin && (
            <button
              type="button"
              id="fellow-switch-to-admin-banner-btn"
              onClick={onSwitchToAdmin}
              className={`font-medium normal-case tracking-normal underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity text-xs ${
                isDark ? 'text-[#C88D3A]' : 'text-[#B77620]'
              }`}
            >
              Switch to Accommodation Admin →
            </button>
          )}
        </div>
      </footer>

      {/* Missing Puzzle Feedback Flow */}
      <MissingPuzzleModal
        isOpen={isPuzzleModalOpen}
        onClose={() => {
          setIsPuzzleModalOpen(false);
          setSelectedPuzzleReportId(undefined);
        }}
        currentMember={currentMember}
        isDark={isDark}
        defaultLocation="Member Home Workspace"
        initialReportId={selectedPuzzleReportId}
      />
    </div>
  );
};
