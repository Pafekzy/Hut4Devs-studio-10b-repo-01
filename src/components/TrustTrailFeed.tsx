import React, { useState } from 'react';
import { TrustTrailEvent } from '../domain/peerSupport';
import { Member } from '../domain/auth';
import {
  Footprints,
  CheckCircle2,
  Clock,
  Gift,
  HandCoins,
  Shield,
  MessageSquareShare,
  Search,
  Filter,
  ExternalLink,
  Layers,
  Sparkles,
  HeartHandshake,
  Calendar,
} from 'lucide-react';

interface TrustTrailFeedProps {
  trailEvents: TrustTrailEvent[];
  availableMembers: Member[];
  isDark?: boolean;
}

export const TrustTrailFeed: React.FC<TrustTrailFeedProps> = ({ trailEvents, availableMembers, isDark = false }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getMember = (id: string, fallbackName: string) => {
    return availableMembers.find((m) => m.id === id) || {
      id,
      displayName: fallbackName,
      email: '',
      role: 'FELLOW',
      h4dMemberId: 'H4D-MEMBER',
      createdAt: '',
    };
  };

  const getEventIcon = (type: TrustTrailEvent['type']) => {
    switch (type) {
      case 'payment_recorded':
      case 'repayment_recorded':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'part_payment':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'peer_loan':
      case 'loan_requested':
      case 'loan_accepted':
        return <HandCoins className="w-4 h-4 text-blue-600" />;
      case 'gift_created':
      case 'debt_to_gift':
        return <Gift className="w-4 h-4 text-purple-600" />;
      case 'contribution_created':
      case 'contribution_received':
      case 'contribution_completed':
        return <HeartHandshake className="w-4 h-4 text-purple-700" />;
      case 'vouch_issued':
        return <Shield className="w-4 h-4 text-indigo-600" />;
      case 'repair_logged':
        return <MessageSquareShare className="w-4 h-4 text-amber-700" />;
      default:
        return <Footprints className="w-4 h-4 text-stone-600" />;
    }
  };

  const getEventTypeLabel = (type: TrustTrailEvent['type']) => {
    switch (type) {
      case 'payment_recorded':
        return 'Accommodation Verified';
      case 'part_payment':
        return 'Partial Repayment';
      case 'peer_loan':
        return 'Peer Loan';
      case 'gift_created':
        return 'Voluntary Gift';
      case 'debt_to_gift':
        return 'Debt-to-Gift Forgiveness';
      case 'repayment_recorded':
        return 'Loan Repaid in Full';
      case 'contribution_created':
        return 'Campaign Initiated';
      case 'contribution_received':
        return 'Contribution Added';
      case 'contribution_completed':
        return 'Campaign Target Met';
      case 'vouch_issued':
        return 'Contextual Vouch';
      case 'repair_logged':
        return 'Delay Communicated';
      case 'support_declined':
        return 'Request Declined (Valid No)';
      default:
        return 'Community Event';
    }
  };

  const filteredEvents = trailEvents.filter((event) => {
    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'payments' && !['payment_recorded', 'part_payment', 'repayment_recorded'].includes(event.type)) {
        return false;
      }
      if (
        filterType === 'support' &&
        !['peer_loan', 'gift_created', 'debt_to_gift', 'contribution_created', 'contribution_received', 'contribution_completed'].includes(event.type)
      ) {
        return false;
      }
      if (filterType === 'vouches' && event.type !== 'vouch_issued') {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.evidenceRef.toLowerCase().includes(q) ||
        event.actorName.toLowerCase().includes(q) ||
        (event.recipientName && event.recipientName.toLowerCase().includes(q))
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section
        className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: isDark ? '#E5A955' : '#B77620' }}
              >
                Append-Only Proof of Trust
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
              >
                &bull; Human Accountability
              </span>
            </div>
            <h1
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Trails of Trust Ledger
            </h1>
            <p
              className="text-xs mt-1.5 max-w-2xl leading-relaxed"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              "People present narratives. The platform preserves facts." Every verified accommodation settlement,
              peer loan, voluntary gift, forgiven balance, and shared contribution creates an immutable trail of dignity and reliability.
            </p>
          </div>

          <div
            className="flex items-center gap-3 p-3.5 rounded-xl border shrink-0 shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              color: isDark ? '#FFF9EE' : '#5A2D0C',
            }}
          >
            <Layers className="w-5 h-5 text-[#B77620] shrink-0" />
            <div>
              <span className="font-bold block text-sm sm:text-base">{trailEvents.length} Verified Records</span>
              <span className="text-xs font-medium" style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}>
                Append-only audit trail
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div
          className="mt-6 pt-5 border-t-2 flex flex-col sm:flex-row gap-3"
          style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#B77620] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by fellow name, evidence hash, or event details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border outline-none font-medium transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            />
          </div>

          <div
            className="flex items-center gap-1 p-1 rounded-xl border text-xs"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
            }}
          >
            {[
              { id: 'all', label: 'All Records' },
              { id: 'payments', label: 'Settlements' },
              { id: 'support', label: 'Peer Support' },
              { id: 'vouches', label: 'Vouches' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? isDark
                      ? 'bg-[#C88D3A] text-[#241104] shadow-xs'
                      : 'bg-[#5A2D0C] text-[#FFF9EE] shadow-xs'
                    : isDark
                    ? 'text-[#D9C4AC] hover:text-[#FFF9EE]'
                    : 'text-[#6D4223] hover:text-[#5A2D0C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Timeline Feed */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div
            className="text-center py-12 text-xs rounded-xl border border-dashed"
            style={{
              backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.2)',
              color: isDark ? '#D9C4AC' : '#8A5D3B',
            }}
          >
            No trust trail events matching your search filter.
          </div>
        ) : (
          filteredEvents.map((event) => {
            return (
              <article
                key={event.id}
                id={`trail-event-${event.id}`}
                className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                }}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="p-2.5 rounded-xl border shrink-0 mt-0.5 shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    }}
                  >
                    {getEventIcon(event.type)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-xs"
                        style={{
                          backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                          color: isDark ? '#F5C678' : '#8C4D11',
                          borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-xs"
                          style={{ backgroundColor: isDark ? '#C88D3A' : '#B77620' }}
                          aria-hidden="true"
                        />
                        {getEventTypeLabel(event.type)}
                      </span>
                      <h3
                        className="font-serif font-bold text-sm sm:text-base"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {event.title}
                      </h3>
                    </div>

                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                    >
                      {event.description}
                    </p>

                    <div
                      className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      <span>
                        Actor: <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{event.actorName}</strong>
                      </span>
                      {event.recipientName && (
                        <>
                          <span>&bull;</span>
                          <span>
                            Recipient: <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{event.recipientName}</strong>
                          </span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span className="font-mono text-[11px]" style={{ color: isDark ? '#F5C678' : '#B77620' }}>
                        Ref: {event.evidenceRef}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end"
                  style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
                >
                  {event.amount ? (
                    <span
                      className="text-base sm:text-lg font-bold"
                      style={{ color: isDark ? '#F5C678' : '#5A2D0C' }}
                    >
                      {event.currency || '₦'}
                      {event.amount.toLocaleString()}
                    </span>
                  ) : (
                    <span
                      className="text-xs font-bold"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      Documented
                    </span>
                  )}
                  <span
                    className="text-xs font-medium mt-0.5 flex items-center gap-1"
                    style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(event.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};

