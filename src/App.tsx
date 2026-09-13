import React, { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { MemberHomeView } from './components/MemberHomeView';
import { ResponsibilityDetailView } from './components/ResponsibilityDetailView';
import { AccommodationAdminView, AdminProviderEventDisplay } from './components/AccommodationAdminView';
import { CoordinatorWorkspaceView } from './components/CoordinatorWorkspaceView';
import { CaptainWorkspaceView } from './components/CaptainWorkspaceView';
import { WelfareMediationWorkspaceView } from './components/WelfareMediationWorkspaceView';
import { DevAuthView } from './components/DevAuthView';
import { PendingMembershipView } from './components/PendingMembershipView';
import { RegistrationModal } from './components/RegistrationModal';
import { Hut4DevsLogo } from './components/Hut4DevsLogo';
import { ModeSwitcher } from './components/ModeSwitcher';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from './data/demoAccommodation';
import { DEMO_COMMAND_CENTER_RESPONSIBILITIES } from './data/demoCommandCenterPopulation';
import {
  AccommodationResponsibility,
  AccommodationPaymentIntent,
  PaymentIntentStatus,
} from './domain/accommodation';
import { ExternalPaymentProposal } from './domain/payments';
import { Member, MemberRole } from './domain/auth';
import {
  ActiveMode,
  getDefaultModeForMember,
  ScopedRoleAssignment,
  AccommodationMembershipRequest,
} from './domain/membership';
import { membershipStore } from './services/membershipStore';
import {
  fetchAccommodationState,
  savePaymentIntent,
  subscribeToAdminStream,
  fetchAdminProviderEvents,
  fetchAdminReconciliations,
  triggerAdminReconcile,
} from './services/paymentClient';
import {
  establishDevSession,
  fetchCurrentSession,
  logoutSession,
} from './services/authClient';
import { auth, onAuthStateChanged, signOutUser } from './services/firebase';
import { firebaseMembershipSync, UserSessionState } from './services/firebaseMembershipSync';
import { Loader2 } from 'lucide-react';

type AppView =
  | 'landing'
  | 'dev-auth'
  | 'pending-membership'
  | 'member-home'
  | 'responsibility-detail'
  | 'accommodation-admin'
  | 'coordinator'
  | 'room-captain'
  | 'welfare-workspace';

type AppTheme = 'light' | 'dark';

export default function App() {
  // Theme state with localStorage persistence (UI preference only)
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem('h4d_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch {
      // Ignore localStorage read errors in restricted sandbox
    }
    return 'light';
  });

  // Active view
  const [view, setView] = useState<AppView>('landing');

  // Active authenticated member (H4D-FUNC-011 + DEMO-001)
  const [member, setMember] = useState<Member | null>(null);

  // Active acting mode (DEMO-001)
  const [activeMode, setActiveMode] = useState<ActiveMode>('FELLOW');

  // Scoped role assignments for current member
  const [scopedRoles, setScopedRoles] = useState<ScopedRoleAssignment[]>([]);

  // Pending membership request if authenticated but awaiting coordinator approval
  const [pendingRequest, setPendingRequest] = useState<AccommodationMembershipRequest | null>(null);

  // Membership authorization loading indicator
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);

  // Registration modal visibility
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Authoritative accommodation responsibility from PostgreSQL
  const [responsibility, setResponsibility] = useState<AccommodationResponsibility>(
    DEMO_ACCOMMODATION_RESPONSIBILITY
  );

  // Prepared payment intents (H4D-FUNC-004 & H4D-FUNC-008) - Authoritative PostgreSQL persistence
  const [preparedIntents, setPreparedIntents] = useState<AccommodationPaymentIntent[]>([]);

  // Created payment proposals (H4D-FUNC-005 & H4D-FUNC-008) - Authoritative PostgreSQL persistence
  const [paymentProposals, setPaymentProposals] = useState<ExternalPaymentProposal[]>([]);

  // Ingested provider events (H4D-FUNC-012) - Authoritative PostgreSQL store
  const [providerEvents, setProviderEvents] = useState<AdminProviderEventDisplay[]>([]);

  // Authoritative payment reconciliations (H4D-FUNC-013) - Authoritative PostgreSQL store
  const [reconciliations, setReconciliations] = useState<any[]>([]);

  // Truthful error state if database is unavailable
  const [dbError, setDbError] = useState<string | null>(null);

  // Live stream connection state (H4D-FUNC-010 & H4D-FUNC-011)
  const [streamStatus, setStreamStatus] = useState<
    'connecting' | 'connected' | 'error' | 'disconnected'
  >('disconnected');

  // Synchronize scoped roles whenever member changes
  useEffect(() => {
    if (member) {
      const roles = membershipStore.getScopedRolesForMember(member.id);
      setScopedRoles(roles);
      const defaultMode = getDefaultModeForMember(member);
      setActiveMode(defaultMode);
    } else {
      setScopedRoles([]);
      setActiveMode('FELLOW');
    }
  }, [member?.id]);

  // Initial load: Fetch current session and authoritative persistence state from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    if (typeof fetch === 'function') {
      fetchCurrentSession()
        .then((res) => {
          if (!isMounted) return;
          if (res.success && res.member) {
            setMember(res.member);
          }
        })
        .catch(() => {});

      fetchAccommodationState()
        .then((state) => {
          if (!isMounted) return;
          if (state && state.success) {
            if (state.responsibility) {
              setResponsibility(state.responsibility);
            }
            if (state.preparedIntents && state.preparedIntents.length > 0) {
              setPreparedIntents(state.preparedIntents);
            }
            if (state.paymentProposals && state.paymentProposals.length > 0) {
              setPaymentProposals(state.paymentProposals);
            }
          }
        })
        .catch(() => {});
    }

    // Firebase Auth State Listener
    const unsubscribeFb = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && isMounted) {
        setIsCheckingMembership(true);
        try {
          const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(fbUser);
          if (isMounted) {
            handleFirebaseSessionResolved(session);
          }
        } catch (e) {
          console.warn('[Firebase Auth] Error resolving session:', e);
        } finally {
          if (isMounted) {
            setIsCheckingMembership(false);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeFb();
    };
  }, []);

  // Real-time operational stream for Accommodation Admin
  useEffect(() => {
    if (view !== 'accommodation-admin' && activeMode !== 'FINANCIAL_ADMIN' && activeMode !== 'FINANCIAL_COVERAGE') {
      setStreamStatus('disconnected');
      return;
    }

    const unsubscribe = subscribeToAdminStream(
      (event) => {
        if (event.eventType === 'accommodation.payment_intent.prepared') {
          const payload = event.data;
          if (payload && payload.intentId) {
            const incomingIntent: AccommodationPaymentIntent = {
              id: payload.intentId,
              responsibilityId: payload.responsibilityId,
              amount: Number(payload.amount),
              fulfilmentType: payload.fulfilmentType || 'PARTIAL',
              status: PaymentIntentStatus.PREPARED,
              createdAt: payload.createdAt || new Date().toISOString(),
            };
            setPreparedIntents((prev) => {
              const exists = prev.some((i) => i.id === incomingIntent.id);
              if (exists) {
                return prev.map((i) => (i.id === incomingIntent.id ? incomingIntent : i));
              }
              return [...prev, incomingIntent];
            });
          }
        } else if (event.eventType === 'accommodation.payment_proposal.created') {
          const payload = event.data;
          if (payload && payload.proposalId) {
            const incomingProposal: ExternalPaymentProposal = {
              id: payload.proposalId,
              paymentIntentId: payload.paymentIntentId,
              responsibilityId: payload.responsibilityId,
              amount: Number(payload.amount),
              currency: payload.currency || 'NGN',
              provider: payload.provider,
              providerProposalId: payload.providerProposalId || payload.proposalId,
              providerStatus: payload.providerStatus,
              isSimulated: Boolean(payload.isSimulated),
              createdAt: payload.createdAt || new Date().toISOString(),
            };
            setPaymentProposals((prev) => {
              const exists = prev.some((p) => p.id === incomingProposal.id);
              if (exists) {
                return prev.map((p) => (p.id === incomingProposal.id ? incomingProposal : p));
              }
              return [...prev, incomingProposal];
            });
          }
        } else if (event.eventType === 'accommodation.provider_event.received') {
          const payload = event.data?.payload || event.data;
          if (payload) {
            const incomingEvt: AdminProviderEventDisplay = {
              id: payload.id,
              provider: payload.provider || 'BMONI',
              providerEventId: payload.providerEventId || '',
              eventType: payload.eventType || '',
              providerStatus: payload.providerStatus || '',
              providerProposalId: payload.providerProposalId || null,
              statusLabel: payload.statusLabel || 'Received — Awaiting Reconciliation',
              notice: payload.notice,
              receivedAt: payload.receivedAt || new Date().toISOString(),
            };
            setProviderEvents((prev) => {
              const exists = prev.some((e) => e.providerEventId === incomingEvt.providerEventId);
              if (exists) {
                return prev.map((e) =>
                  e.providerEventId === incomingEvt.providerEventId ? incomingEvt : e
                );
              }
              return [incomingEvt, ...prev];
            });
          }
        } else if (event.eventType === 'accommodation.payment.reconciled') {
          const payload = event.data?.payload || event.data;
          if (payload) {
            setResponsibility((prev) => ({
              ...prev,
              verifiedAmount: Number(payload.verifiedAmount),
              status: payload.status,
            }));
            fetchAdminReconciliations()
              .then((recRes) => {
                if (recRes.success && Array.isArray(recRes.reconciliations)) {
                  setReconciliations(recRes.reconciliations);
                }
              })
              .catch(() => {});
          }
        } else if (event.eventType === 'accommodation.reconciliation.mismatch') {
          fetchAdminReconciliations()
            .then((recRes) => {
              if (recRes.success && Array.isArray(recRes.reconciliations)) {
                setReconciliations(recRes.reconciliations);
              }
            })
            .catch(() => {});
        }
      },
      (status) => {
        setStreamStatus(status);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [view, activeMode, member]);

  // Mode change handler (DEMO-001)
  const handleModeChange = (newMode: ActiveMode) => {
    setActiveMode(newMode);
    switch (newMode) {
      case 'FELLOW':
        setView('member-home');
        break;
      case 'ROOM_CAPTAIN':
      case 'CAPTAIN_COVERAGE':
        setView('room-captain');
        break;
      case 'COORDINATOR':
        setView('coordinator');
        break;
      case 'FINANCIAL_ADMIN':
      case 'FINANCIAL_COVERAGE':
        setView('accommodation-admin');
        break;
      case 'WELFARE_OFFICER':
        setView('welfare-workspace');
        break;
    }
  };

  const handleEnter = () => {
    setView('member-home');
    if (typeof fetch === 'function') {
      establishDevSession(MemberRole.FELLOW)
        .then((res) => {
          if (res.success && res.member) {
            setMember(res.member);
          }
        })
        .catch(() => {});
    }
  };

  const handleSelectDevIdentity = async (role: MemberRole) => {
    if (typeof fetch === 'function') {
      const res = await establishDevSession(role);
      if (res.success && res.member) {
        setMember(res.member);
        const roles = membershipStore.getScopedRolesForMember(res.member.id);
        setScopedRoles(roles);
        const defMode = getDefaultModeForMember(res.member);
        setActiveMode(defMode);

        if (defMode === 'COORDINATOR') {
          setView('coordinator');
        } else if (defMode === 'ROOM_CAPTAIN') {
          setView('room-captain');
        } else if (defMode === 'FINANCIAL_ADMIN') {
          setView('accommodation-admin');
          loadAdminAuditData();
        } else if (defMode === 'WELFARE_OFFICER') {
          setView('welfare-workspace');
        } else {
          setView('member-home');
        }
      }
    }
  };

  const loadAdminAuditData = () => {
    fetchAdminProviderEvents()
      .then((peRes) => {
        if (peRes.success && Array.isArray(peRes.providerEvents)) {
          setProviderEvents(peRes.providerEvents);
        }
      })
      .catch(() => {});
    fetchAdminReconciliations()
      .then((recRes) => {
        if (recRes.success && Array.isArray(recRes.reconciliations)) {
          setReconciliations(recRes.reconciliations);
        }
      })
      .catch(() => {});
  };

  const handleSwitchToAdmin = () => {
    setView('accommodation-admin');
    setActiveMode('FINANCIAL_ADMIN');
    if (typeof fetch === 'function') {
      establishDevSession(MemberRole.ACCOMMODATION_ADMIN)
        .then((res) => {
          if (res.success && res.member) {
            setMember(res.member);
            loadAdminAuditData();
          }
        })
        .catch(() => {});
    }
  };

  const handleReconcileEvent = async (providerEventId: string) => {
    const res = await triggerAdminReconcile(providerEventId);
    if (res.success) {
      const st = await fetchAccommodationState();
      if (st.success && st.responsibility) {
        setResponsibility(st.responsibility);
      }
      const recs = await fetchAdminReconciliations();
      if (recs.success && Array.isArray(recs.reconciliations)) {
        setReconciliations(recs.reconciliations);
      }
    }
  };

  const handleSwitchToFellow = () => {
    setView('member-home');
    setActiveMode('FELLOW');
    if (typeof fetch === 'function') {
      establishDevSession(MemberRole.FELLOW)
        .then((res) => {
          if (res.success && res.member) {
            setMember(res.member);
          }
        })
        .catch(() => {});
    }
  };

  const handleFirebaseSessionResolved = (session: UserSessionState) => {
    if (session.isPendingVerification) {
      setPendingRequest(session.membershipRequest || null);
      setView('pending-membership');
      return;
    }

    if (session.member) {
      setMember(session.member);
      const roles = membershipStore.getScopedRolesForMember(session.member.id);
      setScopedRoles(roles);
      const defMode = getDefaultModeForMember(session.member);
      setActiveMode(defMode);

      if (defMode === 'COORDINATOR') {
        setView('coordinator');
      } else if (defMode === 'ROOM_CAPTAIN') {
        setView('room-captain');
      } else if (defMode === 'FINANCIAL_ADMIN') {
        setView('accommodation-admin');
        loadAdminAuditData();
      } else if (defMode === 'WELFARE_OFFICER') {
        setView('welfare-workspace');
      } else {
        setView('member-home');
      }
    }
  };

  const handleRefreshPendingStatus = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setIsCheckingMembership(true);
      try {
        const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(currentUser);
        handleFirebaseSessionResolved(session);
      } catch (err) {
        console.warn('Failed to refresh status:', err);
      } finally {
        setIsCheckingMembership(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // Ignore auth signout error
    }
    try {
      await logoutSession();
    } catch {
      // Ignore network errors in test environment
    }
    setMember(null);
    setPendingRequest(null);
    setView('landing');
  };

  const handleIntentPrepared = async (newIntent: AccommodationPaymentIntent) => {
    try {
      const res = await savePaymentIntent(newIntent);
      if (!res.success) {
        setDbError(res.error || 'Failed to persist payment intent to PostgreSQL.');
        return;
      }
      setPreparedIntents((prev) => {
        const filtered = prev.filter((i) => i.id !== newIntent.id);
        return [...filtered, newIntent];
      });
    } catch (err: any) {
      setDbError(err.message || 'Database unavailable.');
    }
  };

  const handleProposalCreated = (newProposal: ExternalPaymentProposal) => {
    setPaymentProposals((prev) => {
      const filtered = prev.filter((p) => p.id !== newProposal.id);
      return [...filtered, newProposal];
    });
  };

  // Synchronize document theme class and body background
  useEffect(() => {
    try {
      localStorage.setItem('h4d_theme', theme);
    } catch {
      // Ignore storage errors
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#2F1707';
      document.body.style.color = '#FFF9EE';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F7F1E7';
      document.body.style.color = '#5A2D0C';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      {dbError && (
        <aside
          role="alert"
          className="w-full bg-amber-900/20 border-b border-amber-700/40 px-4 py-2 text-center text-xs text-amber-200"
        >
          {dbError}
        </aside>
      )}

      {/* Checking Membership Authorization Loading State */}
      {isCheckingMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7F1E7]/90 dark:bg-[#2F1707]/90 backdrop-blur-xs text-[#5A2D0C] dark:text-[#FFF9EE]">
          <div className="text-center space-y-3 p-6 rounded-2xl bg-white/80 dark:bg-[#3A1E0B]/80 shadow-lg border border-[#E7D6C1] dark:border-[#4B2710]">
            <Hut4DevsLogo isDark={isDark} size="md" showWordmark={true} />
            <div className="flex items-center justify-center gap-2 text-xs font-mono opacity-90 pt-2 text-[#5A2D0C] dark:text-[#FFF9EE]">
              <Loader2 className="w-4 h-4 animate-spin text-[#C88D3A]" />
              <span>Checking your Hut4Devs membership...</span>
            </div>
            <p className="text-[11px] opacity-70 max-w-xs font-mono">
              Verifying identity credentials & scoped role authority...
            </p>
          </div>
        </div>
      )}

      {/* Public Landing View */}
      {view === 'landing' && (
        <LandingView
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onEnter={handleEnter}
          onOpenRegistration={() => setIsRegistrationOpen(true)}
          onOpenDevAuth={() => setView('dev-auth')}
        />
      )}

      {/* Dev / Firebase Identity Authentication View */}
      {view === 'dev-auth' && (
        <DevAuthView
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onAuthenticate={handleSelectDevIdentity}
          onFirebaseSessionResolved={handleFirebaseSessionResolved}
          onCancel={() => setView('landing')}
          onOpenRegistrationModal={() => setIsRegistrationOpen(true)}
        />
      )}

      {/* Pending Membership Gate View */}
      {view === 'pending-membership' && (
        <PendingMembershipView
          isDark={isDark}
          onToggleTheme={toggleTheme}
          membershipRequest={pendingRequest}
          userEmail={auth.currentUser?.email || undefined}
          onRefreshStatus={handleRefreshPendingStatus}
          onLogout={handleLogout}
        />
      )}

      {/* Fellow Workspace */}
      {view === 'member-home' && (
        <MemberHomeView
          isDark={isDark}
          responsibility={responsibility}
          member={member || undefined}
          scopedRoles={scopedRoles}
          currentMode={activeMode}
          onModeChange={handleModeChange}
          onToggleTheme={toggleTheme}
          onExitToLanding={() => setView('landing')}
          onViewResponsibilityDetails={() => setView('responsibility-detail')}
          onSwitchToAdmin={handleSwitchToAdmin}
          onSwitchToCaptain={() => handleModeChange('ROOM_CAPTAIN')}
          onSwitchToCoordinator={() => handleModeChange('COORDINATOR')}
          onLogout={handleLogout}
        />
      )}

      {/* Responsibility Detail View */}
      {view === 'responsibility-detail' && (
        <ResponsibilityDetailView
          responsibility={responsibility}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onBackToHome={() => setView('member-home')}
          preparedIntents={preparedIntents}
          onIntentPrepared={handleIntentPrepared}
          paymentProposals={paymentProposals}
          onProposalCreated={handleProposalCreated}
        />
      )}

      {/* Coordinator Workspace View */}
      {view === 'coordinator' && member && (
        <div
          className={`min-h-screen transition-colors duration-200 ${
            isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
          }`}
        >
          <header
            className="border-b transition-colors duration-200"
            style={{
              borderColor: isDark ? '#3E200C' : '#EAE0D0',
              backgroundColor: isDark ? 'rgba(47, 23, 7, 0.95)' : 'rgba(247, 241, 231, 0.95)',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setView('landing')}
                className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer"
                title="Return to Public Landing"
              >
                <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
              </button>

              <div className="flex items-center gap-2.5">
                <ModeSwitcher
                  member={member}
                  scopedRoles={scopedRoles}
                  currentMode={activeMode}
                  onModeChange={handleModeChange}
                  isDark={isDark}
                />
                <button
                  type="button"
                  id="coordinator-logout-btn"
                  onClick={handleLogout}
                  aria-label="Log Out"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isDark ? 'text-[#C88D3A] hover:text-[#FFF9EE]' : 'text-[#8A5D3B] hover:text-[#5A2D0C]'
                  }`}
                >
                  Log Out
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <CoordinatorWorkspaceView member={member} activeMode={activeMode} isDark={isDark} />
          </main>
        </div>
      )}

      {/* Room Captain Workspace View */}
      {view === 'room-captain' && member && (
        <div
          className={`min-h-screen transition-colors duration-200 ${
            isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
          }`}
        >
          <header
            className="border-b transition-colors duration-200"
            style={{
              borderColor: isDark ? '#3E200C' : '#EAE0D0',
              backgroundColor: isDark ? 'rgba(47, 23, 7, 0.95)' : 'rgba(247, 241, 231, 0.95)',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setView('landing')}
                className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer"
                title="Return to Public Landing"
              >
                <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
              </button>

              <div className="flex items-center gap-2.5">
                <ModeSwitcher
                  member={member}
                  scopedRoles={scopedRoles}
                  currentMode={activeMode}
                  onModeChange={handleModeChange}
                  isDark={isDark}
                />
                <button
                  type="button"
                  id="captain-logout-btn"
                  onClick={handleLogout}
                  aria-label="Log Out"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isDark ? 'text-[#C88D3A] hover:text-[#FFF9EE]' : 'text-[#8A5D3B] hover:text-[#5A2D0C]'
                  }`}
                >
                  Log Out
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <CaptainWorkspaceView member={member} activeMode={activeMode} />
          </main>
        </div>
      )}

      {/* Accommodation Welfare & Mediation Workspace View */}
      {view === 'welfare-workspace' && member && (
        <div
          className={`min-h-screen transition-colors duration-200 ${
            isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
          }`}
        >
          <header
            className="border-b transition-colors duration-200"
            style={{
              borderColor: isDark ? '#3E200C' : '#EAE0D0',
              backgroundColor: isDark ? 'rgba(47, 23, 7, 0.95)' : 'rgba(247, 241, 231, 0.95)',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setView('landing')}
                className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer"
                title="Return to Public Landing"
              >
                <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
              </button>

              <div className="flex items-center gap-2.5">
                <ModeSwitcher
                  member={member}
                  scopedRoles={scopedRoles}
                  currentMode={activeMode}
                  onModeChange={handleModeChange}
                  isDark={isDark}
                />
                <button
                  type="button"
                  id="welfare-logout-btn"
                  onClick={handleLogout}
                  aria-label="Log Out"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isDark ? 'text-[#C88D3A] hover:text-[#FFF9EE]' : 'text-[#8A5D3B] hover:text-[#5A2D0C]'
                  }`}
                >
                  Log Out
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <WelfareMediationWorkspaceView member={member} activeMode={activeMode} isDark={isDark} />
          </main>
        </div>
      )}

      {/* Accommodation Admin View */}
      {view === 'accommodation-admin' && (
        <AccommodationAdminView
          isDark={isDark}
          responsibilities={DEMO_COMMAND_CENTER_RESPONSIBILITIES}
          onToggleTheme={toggleTheme}
          onSwitchToFellow={handleSwitchToFellow}
          onExitToLanding={() => setView('landing')}
          paymentProposals={paymentProposals}
          preparedIntents={preparedIntents}
          providerEvents={providerEvents}
          reconciliations={reconciliations}
          streamStatus={streamStatus}
          onReconcileEvent={handleReconcileEvent}
          currentMember={member || undefined}
          currentMode={activeMode}
          scopedRoles={scopedRoles}
          onModeChange={handleModeChange}
        />
      )}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={() => {
          // Keep open or notify
        }}
      />
    </div>
  );
}
