import React, { useState } from 'react';
import {
  AccommodationResponsibility,
  AccommodationPaymentIntent,
  FulfilmentType,
  calculateRemainingAmount,
  formatNaira,
  getStatusLabel,
} from '../domain/accommodation';
import { ExternalPaymentProposal } from '../domain/payments';
import { Hut4DevsLogo } from './Hut4DevsLogo';
import { ThemeToggle } from './ThemeToggle';
import { ArrowLeft, Building2, MapPin, Layers, DoorClosed } from 'lucide-react';
import { FulfilmentFlow } from './FulfilmentFlow';

interface ResponsibilityDetailViewProps {
  responsibility: AccommodationResponsibility;
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToHome: () => void;
  preparedIntents?: AccommodationPaymentIntent[];
  onIntentPrepared?: (intent: AccommodationPaymentIntent) => void;
  paymentProposals?: ExternalPaymentProposal[];
  onProposalCreated?: (proposal: ExternalPaymentProposal) => void;
}

export const ResponsibilityDetailView: React.FC<ResponsibilityDetailViewProps> = ({
  responsibility,
  isDark,
  onToggleTheme,
  onBackToHome,
  preparedIntents = [],
  onIntentPrepared,
  paymentProposals = [],
  onProposalCreated,
}) => {
  const [isFulfilmentOpen, setIsFulfilmentOpen] = useState(false);
  const remainingAmount = calculateRemainingAmount(responsibility);
  const statusLabel = getStatusLabel(responsibility.status);

  const handleIntentPrepared = (intent: AccommodationPaymentIntent) => {
    onIntentPrepared?.(intent);
  };

  const latestProposal =
    paymentProposals && paymentProposals.length > 0
      ? paymentProposals[paymentProposals.length - 1]
      : null;


  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
      }`}
    >
      {/* Shell Header */}
      <header
        className="sticky top-0 z-30 w-full border-b transition-colors duration-200"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          backgroundColor: isDark ? 'rgba(47, 23, 7, 0.92)' : 'rgba(247, 241, 231, 0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer"
            title="Back to Home"
          >
            <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
          </button>

          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <button
              type="button"
              id="back-to-home-header-btn"
              onClick={onBackToHome}
              aria-label="Back to Home"
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                isDark
                  ? 'text-[#E5D3BA] hover:text-[#FFF9EE] hover:bg-[#3E200C]'
                  : 'text-[#6D4223] hover:text-[#5A2D0C] hover:bg-[#EFE5D5]'
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation Breadcrumb / Action */}
        <div className="mb-6">
          <button
            type="button"
            id="back-to-home-nav-btn"
            onClick={onBackToHome}
            className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
              isDark
                ? 'text-[#C88D3A] hover:bg-[#3E200C] hover:text-[#E2AB5D]'
                : 'text-[#B77620] hover:bg-[#FFF9EE] hover:text-[#5A2D0C]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Detail Article Card */}
        <article
          id="responsibility-detail-card"
          className="rounded-2xl p-6 sm:p-10 border transition-all duration-200 shadow-md backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
          }}
        >
          {/* Section Header */}
          <div className="border-b pb-6 mb-8" style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)' }}>
            <span
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider block mb-2"
              style={{ color: isDark ? '#C88D3A' : '#B77620' }}
            >
              Accommodation Responsibility
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <span className="text-xs block text-stone-500 mb-0.5">Responsibility:</span>
                <h1
                  className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  {responsibility.title}
                </h1>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                <span className="text-xs block text-stone-500 mb-0.5">Status:</span>
                <span
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                    color: isDark ? '#E2AB5D' : '#B77620',
                    border: `1px solid ${isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)'}`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: isDark ? '#C88D3A' : '#B77620' }}
                    aria-hidden="true"
                  />
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Location Structure Grid */}
          <div className="mb-8">
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}
            >
              Accommodation Context
            </h2>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 rounded-xl border backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              {/* Property */}
              <div className="flex items-start gap-3">
                <Building2
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                  aria-hidden="true"
                />
                <div>
                  <span className="text-xs block" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                    Property:
                  </span>
                  <span className="text-sm font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    {responsibility.accommodationContext.property.name}
                  </span>
                </div>
              </div>

              {/* Floor */}
              <div className="flex items-start gap-3">
                <Layers
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                  aria-hidden="true"
                />
                <div>
                  <span className="text-xs block" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                    Floor:
                  </span>
                  <span className="text-sm font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    {responsibility.accommodationContext.floor.name}
                  </span>
                </div>
              </div>

              {/* Room */}
              <div className="flex items-start gap-3">
                <DoorClosed
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: isDark ? '#C88D3A' : '#B77620' }}
                  aria-hidden="true"
                />
                <div>
                  <span className="text-xs block" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                    Room:
                  </span>
                  <span className="text-sm font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    {responsibility.accommodationContext.room.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Section */}
          <div className="mb-10">
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}
            >
              Responsibility Breakdown
            </h2>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              {/* Required */}
              <div className="border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 sm:pr-4"
                style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)' }}
              >
                <span className="text-xs block mb-1" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                  Required:
                </span>
                <p
                  className="text-xl sm:text-2xl font-semibold"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  {formatNaira(responsibility.requiredAmount)}
                </p>
              </div>

              {/* Verified */}
              <div className="border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 sm:pr-4"
                style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)' }}
              >
                <span className="text-xs block mb-1" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                  Verified:
                </span>
                <p
                  className="text-xl sm:text-2xl font-medium"
                  style={{ color: isDark ? '#D9C4AC' : '#704728' }}
                >
                  {formatNaira(responsibility.verifiedAmount)}
                </p>
              </div>

              {/* Remaining */}
              <div>
                <span className="text-xs block mb-1 font-medium" style={{ color: isDark ? '#C88D3A' : '#B77620' }}>
                  Remaining:
                </span>
                <p
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: isDark ? '#E2AB5D' : '#B77620' }}
                >
                  {formatNaira(remainingAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Prepared Fulfilment Intent Display (if exists) */}
          {preparedIntents && preparedIntents.length > 0 && (
            <div
              id="prepared-intent-summary"
              className="mb-6 p-5 rounded-xl border space-y-2.5 transition-colors backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm" aria-hidden="true">🛖</span>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#C88D3A' : '#B77620' }}>
                    Prepared Intent
                  </span>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider font-mono shadow-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                    color: isDark ? '#C88D3A' : '#B77620',
                    border: `1px solid ${isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.15)'}`,
                  }}
                >
                  Prepared — Not Verified
                </span>
              </div>
              <p className="text-sm">
                Amount:{' '}
                <strong className="font-mono text-base font-bold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  {formatNaira(preparedIntents[preparedIntents.length - 1].amount)}
                </strong>{' '}
                <span className="text-xs text-stone-500">
                  ({preparedIntents[preparedIntents.length - 1].fulfilmentType === FulfilmentType.FULL ? 'Full' : 'Partial'})
                </span>
              </p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Payment execution is not connected in this build. Verified accommodation balance remains unchanged until execution and verification.
              </p>
            </div>
          )}

          {/* Proposal Summary Card (if exists) */}
          {latestProposal && (
            <div
              id="bmoni-proposal-summary"
              className="mb-8 p-5 rounded-xl border space-y-2.5 transition-colors backdrop-blur-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
              }}
            >
              {latestProposal.isSimulated || latestProposal.provider === 'SIMULATED' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                      SIMULATED PROVIDER
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border"
                      style={{
                        backgroundColor: isDark ? '#3A2810' : '#FEF3C7',
                        borderColor: isDark ? '#6B4C1B' : '#FCD34D',
                        color: isDark ? '#F59E0B' : '#B45309',
                      }}
                    >
                      Proposal: Simulated
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: isDark ? '#E5D3BA' : '#5A2D0C' }}>
                    No request was sent to BMONI.
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    No money has moved yet. Your accommodation responsibility remains unverified.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                      BMONI
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border"
                      style={{
                        backgroundColor: isDark ? '#382210' : '#EFF6FF',
                        borderColor: isDark ? '#5C381A' : '#BFDBFE',
                        color: isDark ? '#E2AB5D' : '#1D4ED8',
                      }}
                    >
                      Proposal: Created
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Provider Status:</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold font-mono border"
                      style={{
                        backgroundColor: isDark ? '#3A2810' : '#FEF3C7',
                        borderColor: isDark ? '#6B4C1B' : '#FCD34D',
                        color: isDark ? '#F59E0B' : '#B45309',
                      }}
                    >
                      {latestProposal.providerStatus || 'Pending Approval'}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Provider Proposal Reference: </span>
                    <span className="font-mono font-medium" style={{ color: isDark ? '#E5D3BA' : '#5A2D0C' }}>
                      {latestProposal.providerProposalId}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    No money has moved yet. Your accommodation responsibility remains unverified.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Action Footer: [ Fulfil Responsibility ] and [ Back to Home ] */}
          <div className="pt-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
            style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="fulfil-responsibility-btn"
                onClick={() => setIsFulfilmentOpen(true)}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#2F1707] hover:bg-[#DDA250] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#3E200C]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#FFF9EE]'
                }`}
              >
                <span>Fulfil Responsibility</span>
              </button>

              <button
                type="button"
                id="back-to-home-main-btn"
                onClick={onBackToHome}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer border ${
                  isDark
                    ? 'border-[#623416] text-[#E5D3BA] hover:bg-[#2F1707]'
                    : 'border-[#EAE0D0] text-[#6D4223] hover:bg-[#F2E8D8]'
                }`}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Back to Home</span>
              </button>
            </div>

            <p className="text-xs text-stone-500 italic">
              * Payment intent preparation only. No money moves in this sequence.
            </p>
          </div>
        </article>

        {/* Focused Fulfilment Flow Modal */}
        {isFulfilmentOpen && (
          <FulfilmentFlow
            responsibility={responsibility}
            isDark={isDark}
            onClose={() => setIsFulfilmentOpen(false)}
            onIntentPrepared={handleIntentPrepared}
            onProposalCreated={onProposalCreated}
          />
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
        <p>Hut4Devs Accommodation Structure &bull; Canonical Foundation</p>
      </footer>
    </div>
  );
};
