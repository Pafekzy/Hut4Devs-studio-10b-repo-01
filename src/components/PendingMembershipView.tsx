import React from 'react';
import { AccommodationMembershipRequest } from '../domain/membership';
import { Hut4DevsLogo } from './Hut4DevsLogo';
import { ThemeToggle } from './ThemeToggle';
import { Clock, AlertCircle, RefreshCw, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PendingMembershipViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  membershipRequest: AccommodationMembershipRequest | null;
  userEmail?: string;
  onRefreshStatus?: () => void;
  onLogout: () => void;
}

export const PendingMembershipView: React.FC<PendingMembershipViewProps> = ({
  isDark,
  onToggleTheme,
  membershipRequest,
  userEmail,
  onRefreshStatus,
  onLogout,
}) => {
  const status = membershipRequest?.status || 'SUBMITTED';

  const getStatusBadge = () => {
    switch (status) {
      case 'UNDER_REVIEW':
        return {
          label: 'Under Coordinator Review',
          color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700',
          icon: Clock,
        };
      case 'DELEGATED':
        return {
          label: 'Delegated to Room Captain',
          color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
          icon: RefreshCw,
        };
      case 'NEEDS_CLARIFICATION':
        return {
          label: 'Needs Clarification',
          color: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700',
          icon: AlertCircle,
        };
      case 'SUBMITTED':
      default:
        return {
          label: 'Awaiting Coordinator Review',
          color: 'bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700',
          icon: Clock,
        };
    }
  };

  const badge = getStatusBadge();
  const BadgeIcon = badge.icon;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
      }`}
    >
      {/* Header */}
      <header
        className="w-full border-b transition-colors duration-200"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          backgroundColor: isDark ? 'rgba(47, 23, 7, 0.85)' : 'rgba(247, 241, 231, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div
          id="pending-membership-gate"
          className="w-full max-w-xl rounded-2xl border p-6 sm:p-8 shadow-md transition-colors duration-200 space-y-6"
          style={{
            backgroundColor: isDark ? '#3A1E0B' : '#FFFFFF',
            borderColor: isDark ? '#4B2710' : '#E7D6C1',
          }}
        >
          {/* Top Status Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-1 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>MEMBERSHIP PENDING APPROVAL</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Residency Verification In Progress
            </h1>
            <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto">
              Your identity is authenticated, but your accommodation workspace requires authoritative approval.
            </p>
          </div>

          {/* Current Status Box */}
          <div
            className="rounded-xl border p-4 transition-colors duration-200 space-y-3"
            style={{
              backgroundColor: isDark ? '#2F1707' : '#FBF7EE',
              borderColor: isDark ? '#4B2710' : '#EAE0D0',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#C88D3A] font-bold">
                Application Status
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${badge.color}`}
              >
                <BadgeIcon className="w-3 h-3" />
                <span>{badge.label}</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 pt-1 border-t border-[#5A2D0C]/10 dark:border-[#FFF9EE]/10">
              <div className="flex justify-between">
                <span className="opacity-70">Applicant:</span>
                <span className="font-semibold">{membershipRequest?.fullName || userEmail || 'Fellow Applicant'}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Email:</span>
                <span className="font-mono text-[11px]">{membershipRequest?.email || userEmail}</span>
              </div>
              {membershipRequest?.propertyName && (
                <div className="flex justify-between">
                  <span className="opacity-70">Requested Property:</span>
                  <span className="font-semibold">{membershipRequest.propertyName}</span>
                </div>
              )}
              {membershipRequest?.roomName && (
                <div className="flex justify-between">
                  <span className="opacity-70">Assigned Room:</span>
                  <span className="font-semibold">{membershipRequest.roomName}</span>
                </div>
              )}
              {membershipRequest?.monthlyCommitment && (
                <div className="flex justify-between">
                  <span className="opacity-70">Monthly Commitment:</span>
                  <span className="font-mono font-bold text-[#C88D3A]">
                    ₦{membershipRequest.monthlyCommitment.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Steps Explanation */}
          <div className="space-y-2.5 text-xs">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider opacity-80">
              Authority Protocol
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">1. Identity Authenticated:</span>
                  <p className="text-[11px] opacity-75">Firebase authentication established your member credentials.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">2. Coordinator Review:</span>
                  <p className="text-[11px] opacity-75">
                    The Accommodation Fellows Coordinator or delegated Room Captain verifies physical room allocation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full border border-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold opacity-60">3. Workspace Activation:</span>
                  <p className="text-[11px] opacity-60">
                    Once approved, your accommodation accountability ledger and member workspace will unlock.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {onRefreshStatus && (
              <button
                id="btn-refresh-membership-status"
                type="button"
                onClick={onRefreshStatus}
                className="w-full sm:flex-1 py-2.5 px-4 bg-[#5A2D0C] hover:bg-[#432108] text-[#FFF9EE] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Approval Status</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto py-2.5 px-4 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
