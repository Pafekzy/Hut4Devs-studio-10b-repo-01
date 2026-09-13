import React, { useState } from 'react';
import { MemberRole } from '../domain/auth';
import { Hut4DevsLogo } from './Hut4DevsLogo';
import { ThemeToggle } from './ThemeToggle';
import { GovernanceDevHierarchy } from './GovernanceDevHierarchy';
import {
  User,
  ShieldCheck,
  ArrowRight,
  Home,
  Users,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  FirebaseUser,
} from '../services/firebase';
import {
  firebaseMembershipSync,
  UserSessionState,
} from '../services/firebaseMembershipSync';

interface DevAuthViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onAuthenticate: (role: MemberRole) => Promise<void>;
  onCancel?: () => void;
  onOpenRegistrationModal?: () => void;
  onFirebaseSessionResolved?: (session: UserSessionState) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const DevAuthView: React.FC<DevAuthViewProps> = ({
  isDark,
  onToggleTheme,
  onAuthenticate,
  onCancel,
  onOpenRegistrationModal,
  onFirebaseSessionResolved,
  isLoading = false,
  errorMessage = null,
}) => {
  const [selectedRole, setSelectedRole] = useState<MemberRole>(MemberRole.FELLOW);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDevTools, setShowDevTools] = useState(false);
  const [hierarchyResetKey, setHierarchyResetKey] = useState(0);

  // Safe Home Key handler: clears only temporary governance navigation state
  // and returns cleanly to the Sign In / Development Entry screen
  const handleHomeKeyClick = () => {
    setShowDevTools(false);
    setHierarchyResetKey((prev) => prev + 1);
    setAuthError(null);
  };

  // Firebase email form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fbSession, setFbSession] = useState<UserSessionState | null>(null);

  const formatFirebaseError = (err: any): string => {
    const code = err.code || '';
    const msg = err.message || '';
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'
    ) {
      return 'Invalid email or password. If you are a new applicant, please select "Create Account".';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please select "Sign In".';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters.';
    }
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      msg.includes('closed-by-user')
    ) {
      return 'Google sign-in was cancelled.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (code === 'permission-denied' || msg.includes('PERMISSION_DENIED')) {
      return 'Access denied. Please check permissions.';
    }
    return msg || 'Authentication could not be completed. Please try again.';
  };

  const handleSelectAndAuth = async (role: MemberRole) => {
    setSelectedRole(role);
    setAuthenticating(true);
    setAuthError(null);
    try {
      await onAuthenticate(role);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate dev role.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthenticating(true);
    setAuthError(null);
    try {
      const fbUser = await signInWithGoogle();
      const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(fbUser);
      setFbSession(session);
      if (onFirebaseSessionResolved) {
        onFirebaseSessionResolved(session);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(formatFirebaseError(err));
    } finally {
      setAuthenticating(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setAuthenticating(true);
    setAuthError(null);
    try {
      let fbUser: FirebaseUser;
      if (authMode === 'signup') {
        fbUser = await signUpWithEmail(email, password);
      } else {
        fbUser = await signInWithEmail(email, password);
      }
      const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(fbUser);
      setFbSession(session);
      if (onFirebaseSessionResolved) {
        onFirebaseSessionResolved(session);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setAuthError(formatFirebaseError(err));
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
      }`}
    >
      {/* Top Sticky Header */}
      <header
        className="sticky top-0 z-30 w-full border-b transition-colors duration-200"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          backgroundColor: isDark ? 'rgba(47, 23, 7, 0.95)' : 'rgba(247, 241, 231, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              id="dev-auth-home-key-btn"
              onClick={handleHomeKeyClick}
              aria-label="Return to Sign In"
              title="Return to Sign In"
              className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer transition-opacity hover:opacity-90 active:opacity-75 shrink-0"
            >
              <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
            </button>
            {showDevTools && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-[#C88D3A]/40 bg-[#FFF9EE] dark:bg-[#3A1E0B] text-[#5A2D0C] dark:text-[#FFF9EE] shadow-xs truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C88D3A] shrink-0" aria-hidden="true" />
                <span>Switch Role &amp; Governance</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {showDevTools && (
              <button
                type="button"
                onClick={handleHomeKeyClick}
                aria-label="Return to Sign In"
                title="Return to Sign In"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FFF9EE] dark:bg-[#2F1707] border border-[#C88D3A]/40 text-[#5A2D0C] dark:text-[#FFF9EE] hover:bg-[#F7F1E7] dark:hover:bg-[#3E200C] transition-colors cursor-pointer shadow-xs"
              >
                <Home className="w-3.5 h-3.5 text-[#C88D3A]" />
                <span className="hidden md:inline">Sign In Entry</span>
              </button>
            )}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div
          className={`w-full ${showDevTools ? 'max-w-4xl' : 'max-w-lg'} rounded-2xl p-5 sm:p-8 border-2 border-b-4 transition-all duration-300 shadow-md backdrop-blur-md`}
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.75)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          {/* Header Title & Concept Note */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: isDark ? '#E5A955' : '#B77620' }}
              >
                Community Access
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
              >
                &bull; Scoped Authority &bull; Human-Centered
              </span>
            </div>
            <h1
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Sign In to Hut4Devs
            </h1>
            <p
              className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              Trusted community coordination & accommodation accountability.
            </p>
          </div>

          {/* Principle Banner */}
          <div
            className="mb-6 rounded-xl border p-3.5 text-xs font-mono transition-colors duration-200 shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              color: isDark ? '#EAD6C0' : '#5A2D0C',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]"
                style={{
                  backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                  color: isDark ? '#E5A955' : '#B77620',
                  border: isDark ? '1px solid rgba(200, 141, 58, 0.3)' : '1px solid rgba(90, 45, 12, 0.2)',
                }}
              >
                AUTHORITY MODEL
              </span>
              <span
                className="font-semibold text-[11px]"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Identity ≠ Role Selection
              </span>
            </div>
            <p className="leading-relaxed text-[11px] opacity-90">
              Authentication establishes <em>Identity</em>. Coordinator verification establishes <em>Membership</em>. Scoped delegation establishes <em>Authority</em>.
            </p>
          </div>

          {/* Errors */}
          {(errorMessage || authError) && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg text-xs font-mono bg-red-900/20 border border-red-700/50 text-red-300 text-center flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError || errorMessage}</span>
            </div>
          )}

          {/* PRIMARY AUTHENTICATION FLOW: GOOGLE + EMAIL */}
          <div className="space-y-5">
            {/* Google Sign In Button */}
            <button
              type="button"
              id="btn-firebase-google-auth"
              disabled={authenticating || isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div
                className="border-t w-full"
                style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)' }}
              />
              <span
                className="px-3 text-[11px] uppercase font-mono tracking-wider"
                style={{
                  backgroundColor: isDark ? 'rgba(23, 21, 19, 0.9)' : 'rgba(255, 253, 248, 0.9)',
                  color: isDark ? '#E5A955' : '#8A5D3B',
                }}
              >
                or email
              </span>
            </div>

            {/* Mode switch */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`transition-colors cursor-pointer ${
                  authMode === 'signin'
                    ? isDark ? 'text-[#E5A955] underline underline-offset-4' : 'text-[#B77620] underline underline-offset-4'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
              >
                Sign In
              </button>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`transition-colors cursor-pointer ${
                  authMode === 'signup'
                    ? isDark ? 'text-[#E5A955] underline underline-offset-4' : 'text-[#B77620] underline underline-offset-4'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-[#C88D3A]" />
                  <input
                    id="input-firebase-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fellow@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition-all shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(255, 255, 255, 0.75)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                      color: isDark ? '#FFF9EE' : '#5A2D0C',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#C88D3A]" />
                  <input
                    id="input-firebase-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition-all shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(255, 255, 255, 0.75)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                      color: isDark ? '#FFF9EE' : '#5A2D0C',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-firebase-submit-auth"
                disabled={authenticating || isLoading}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#261205]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#FFF9EE]'
                }`}
              >
                {authenticating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'signup' ? 'Create Hut4Devs Account' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* New Membership Registration Callout */}
          <div
            className="mt-6 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.2)',
            }}
          >
            <div>
              <div
                className="flex items-center gap-1.5 text-xs font-bold"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                <span className="text-sm" aria-hidden="true">🛖</span>
                New Fellow or Residency Transfer?
              </div>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
              >
                Submit an Accommodation Membership Request without choosing administrative roles.
              </p>
            </div>
            {onOpenRegistrationModal && (
              <button
                id="btn-open-registration-from-auth"
                type="button"
                onClick={onOpenRegistrationModal}
                className="whitespace-nowrap px-3.5 py-2 min-h-[40px] bg-[#B77620] hover:bg-[#A36618] border-b-2 border-[#8A5D3B] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5"
              >
                Submit Membership Request
              </button>
            )}
          </div>

          {/* DEVELOPMENT TOOLS & SEED FIXTURES (DEV-ONLY COLLAPSIBLE) */}
          <div
            className="mt-6 pt-4 border-t"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)' }}
          >
            <button
              type="button"
              id="dev-tools-toggle-btn"
              onClick={() => setShowDevTools(!showDevTools)}
              className="w-full flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl border transition-all cursor-pointer shadow-xs"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#5A2D0C] border border-[#C88D3A]/50 flex items-center justify-center shadow-inner">
                  <Code2 className="w-3.5 h-3.5 text-[#C88D3A]" />
                </div>
                <span className="font-semibold text-xs tracking-tight">
                  Development Tools &amp; Seed Fixtures (Dev-Only)
                </span>
              </div>
              {showDevTools ? (
                <ChevronUp className="w-4 h-4 text-[#C88D3A]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#C88D3A]" />
              )}
            </button>

            {showDevTools && (
              <div className="mt-3">
                <GovernanceDevHierarchy
                  key={hierarchyResetKey}
                  isDark={isDark}
                  isLoading={isLoading}
                  authenticating={authenticating}
                  onAuthenticate={handleSelectAndAuth}
                  onReturnToSignIn={handleHomeKeyClick}
                />
              </div>
            )}
          </div>

          {onCancel && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-medium text-[#5A2D0C]/75 dark:text-[#FFF9EE]/75 hover:text-[#C88D3A] dark:hover:text-[#C88D3A] transition-colors cursor-pointer"
              >
                Back to Public Landing
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

