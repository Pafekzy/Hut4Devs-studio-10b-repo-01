import React, { useState } from 'react';
import {
  AccommodationResponsibility,
  AccommodationPaymentIntent,
  FulfilmentType,
  PaymentIntentStatus,
  calculateRemainingAmount,
  formatNaira,
  validateFulfilmentAmount,
} from '../domain/accommodation';
import { ExternalPaymentProposal } from '../domain/payments';
import { requestBmoniProposal } from '../services/paymentClient';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface FulfilmentFlowProps {
  responsibility: AccommodationResponsibility;
  isDark: boolean;
  onClose: () => void;
  onIntentPrepared: (intent: AccommodationPaymentIntent) => void;
  onProposalCreated?: (proposal: ExternalPaymentProposal) => void;
}

type FlowStep = 'select' | 'review' | 'prepared' | 'bmoni-proposal-created';

export const FulfilmentFlow: React.FC<FulfilmentFlowProps> = ({
  responsibility,
  isDark,
  onClose,
  onIntentPrepared,
  onProposalCreated,
}) => {
  const currentRemaining = calculateRemainingAmount(responsibility);
  const [step, setStep] = useState<FlowStep>('select');
  const [fulfilmentType, setFulfilmentType] = useState<FulfilmentType>(FulfilmentType.FULL);
  const [partialAmountInput, setPartialAmountInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preparedIntent, setPreparedIntent] = useState<AccommodationPaymentIntent | null>(null);

  // BMONI proposal state
  const [isBmoniLoading, setIsBmoniLoading] = useState(false);
  const [bmoniError, setBmoniError] = useState<string | null>(null);
  const [isNotConfigured, setIsNotConfigured] = useState(false);
  const [isAmbiguousError, setIsAmbiguousError] = useState(false);
  const [createdProposal, setCreatedProposal] = useState<ExternalPaymentProposal | null>(null);

  // Selected amount based on current type
  const targetAmount =
    fulfilmentType === FulfilmentType.FULL
      ? currentRemaining
      : parseFloat(partialAmountInput) || 0;

  // Expected remaining if payment is eventually verified
  const expectedRemaining = Math.max(0, currentRemaining - targetAmount);

  // Quick preset amounts for partial selection
  const presetAmounts = [10000, 25000, 40000].filter((amt) => amt < currentRemaining);

  const handleSelectType = (type: FulfilmentType) => {
    setFulfilmentType(type);
    setErrorMessage(null);
    if (type === FulfilmentType.PARTIAL && !partialAmountInput) {
      setPartialAmountInput('10000');
    }
  };

  const handlePartialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d]/g, '');
    setPartialAmountInput(rawVal);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleApplyPreset = (amount: number) => {
    setFulfilmentType(FulfilmentType.PARTIAL);
    setPartialAmountInput(amount.toString());
    setErrorMessage(null);
  };

  const handleProceedToReview = () => {
    if (fulfilmentType === FulfilmentType.FULL) {
      setErrorMessage(null);
      setStep('review');
      return;
    }

    // Validate partial amount
    const parsed = parseFloat(partialAmountInput);
    const validation = validateFulfilmentAmount(parsed, currentRemaining);

    if (!validation.valid) {
      setErrorMessage(
        validation.error ||
          `Enter an amount up to your remaining responsibility of ${formatNaira(currentRemaining)}.`
      );
      return;
    }

    setErrorMessage(null);
    setStep('review');
  };

  const handleConfirmPreparation = () => {
    const finalAmount =
      fulfilmentType === FulfilmentType.FULL
        ? currentRemaining
        : parseFloat(partialAmountInput);

    const newIntent: AccommodationPaymentIntent = {
      id: `intent-${Date.now()}`,
      responsibilityId: responsibility.id,
      amount: finalAmount,
      fulfilmentType,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };

    setPreparedIntent(newIntent);
    onIntentPrepared?.(newIntent);
    setStep('prepared');
  };

  const handleContinueWithBmoni = async () => {
    if (!preparedIntent) return;

    setIsBmoniLoading(true);
    setBmoniError(null);
    setIsNotConfigured(false);
    setIsAmbiguousError(false);

    try {
      const res = await requestBmoniProposal(preparedIntent);

      if (res.notConfigured || res.requiresCredentials) {
        setIsNotConfigured(true);
        setIsBmoniLoading(false);
        return;
      }

      if (res.success && res.proposal) {
        setCreatedProposal(res.proposal);
        onProposalCreated?.(res.proposal);
        setStep('bmoni-proposal-created');
      } else {
        if (res.isAmbiguousError) {
          setIsAmbiguousError(true);
        } else {
          setBmoniError(
            res.error ||
              "We couldn't prepare this payment with BMONI. No payment has been executed. Your accommodation balance has not changed."
          );
        }
      }
    } catch {
      setIsAmbiguousError(true);
    } finally {
      setIsBmoniLoading(false);
    }
  };


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fulfilment-flow-title"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'rgba(18, 9, 3, 0.75)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl p-6 sm:p-8 border-2 shadow-2xl transition-colors duration-200 relative animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: isDark ? '#3E200C' : '#FFF9EE',
          borderColor: isDark ? '#C88D3A' : '#5A2D0C',
          color: isDark ? '#FFF9EE' : '#5A2D0C',
        }}
      >
        {/* STEP 1: CHOOSE FULFILMENT */}
        {step === 'select' && (
          <div>
            {/* Header / Subtitle */}
            <div className="border-b pb-4 mb-6" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
              <span
                className="text-xs font-semibold uppercase tracking-wider block mb-1"
                style={{ color: isDark ? '#C88D3A' : '#B77620' }}
              >
                Fulfilment Preparation
              </span>
              <h2
                id="fulfilment-flow-title"
                className="font-serif text-2xl font-semibold tracking-tight"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                {responsibility.title}
              </h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xs" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                  Remaining:
                </span>
                <span
                  className="font-bold text-lg sm:text-xl font-mono"
                  style={{ color: isDark ? '#E2AB5D' : '#B77620' }}
                >
                  {formatNaira(currentRemaining)}
                </span>
              </div>
            </div>

            {/* Selection Options */}
            <div className="space-y-4 mb-6">
              <label
                className="text-xs font-semibold uppercase tracking-wider block"
                style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}
              >
                Choose fulfilment:
              </label>

              {/* Option 1: Full Amount */}
              <button
                type="button"
                id="option-full-amount"
                onClick={() => handleSelectType(FulfilmentType.FULL)}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                  fulfilmentType === FulfilmentType.FULL
                    ? isDark
                      ? 'bg-[#4B2710] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                      : 'bg-[#F4E8D6] border-[#B77620] ring-1 ring-[#B77620]'
                    : isDark
                      ? 'bg-[#2F1707] border-[#4B2710] hover:border-[#623416]'
                      : 'bg-[#F7F1E7] border-[#E7D6C1] hover:border-[#D0BA9D]'
                }`}
              >
                <div>
                  <span className="font-semibold text-sm sm:text-base block" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    Full Amount — {formatNaira(currentRemaining)}
                  </span>
                  <span className="text-xs" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                    Prepares complete fulfilment for this cycle
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    fulfilmentType === FulfilmentType.FULL
                      ? 'border-[#C88D3A] bg-[#C88D3A]'
                      : 'border-stone-400'
                  }`}
                >
                  {fulfilmentType === FulfilmentType.FULL && (
                    <div className="w-2 h-2 rounded-full bg-[#2F1707]" />
                  )}
                </div>
              </button>

              {/* Option 2: Partial Amount */}
              <button
                type="button"
                id="option-partial-amount"
                onClick={() => handleSelectType(FulfilmentType.PARTIAL)}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                  fulfilmentType === FulfilmentType.PARTIAL
                    ? isDark
                      ? 'bg-[#4B2710] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                      : 'bg-[#F4E8D6] border-[#B77620] ring-1 ring-[#B77620]'
                    : isDark
                      ? 'bg-[#2F1707] border-[#4B2710] hover:border-[#623416]'
                      : 'bg-[#F7F1E7] border-[#E7D6C1] hover:border-[#D0BA9D]'
                }`}
              >
                <div>
                  <span className="font-semibold text-sm sm:text-base block" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                    Partial Amount
                  </span>
                  <span className="text-xs" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                    Specify a custom portion to prepare
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    fulfilmentType === FulfilmentType.PARTIAL
                      ? 'border-[#C88D3A] bg-[#C88D3A]'
                      : 'border-stone-400'
                  }`}
                >
                  {fulfilmentType === FulfilmentType.PARTIAL && (
                    <div className="w-2 h-2 rounded-full bg-[#2F1707]" />
                  )}
                </div>
              </button>
            </div>

            {/* Partial Input Section */}
            {fulfilmentType === FulfilmentType.PARTIAL && (
              <div
                className="p-4 sm:p-5 rounded-xl border mb-6 space-y-3 transition-colors"
                style={{
                  backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                  borderColor: isDark ? '#4B2710' : '#E7D6C1',
                }}
              >
                <label
                  htmlFor="partial-amount-input"
                  className="text-xs font-semibold uppercase tracking-wider block"
                  style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}
                >
                  Enter Partial Amount:
                </label>

                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="font-semibold font-mono" style={{ color: isDark ? '#C88D3A' : '#B77620' }}>
                      ₦
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="partial-amount-input"
                    aria-label="Partial Amount"
                    value={partialAmountInput}
                    onChange={handlePartialAmountChange}
                    placeholder="e.g. 20000"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border text-base sm:text-lg font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#C88D3A] transition-colors"
                    style={{
                      backgroundColor: isDark ? '#3E200C' : '#FFF9EE',
                      borderColor: errorMessage ? '#DC2626' : isDark ? '#623416' : '#D0BA9D',
                      color: isDark ? '#FFF9EE' : '#5A2D0C',
                    }}
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px]" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                    Examples:
                  </span>
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleApplyPreset(amt)}
                      className="px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: isDark ? '#3E200C' : '#FFF9EE',
                        borderColor: isDark ? '#623416' : '#EAE0D0',
                        color: isDark ? '#C88D3A' : '#B77620',
                      }}
                    >
                      {formatNaira(amt)}
                    </button>
                  ))}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div
                    role="alert"
                    id="fulfilment-error-message"
                    className="flex items-center gap-2 text-xs font-medium text-red-500 pt-1"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
              <button
                type="button"
                id="cancel-fulfilment-btn"
                onClick={onClose}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isDark ? 'text-[#E5D3BA] hover:bg-[#2F1707]' : 'text-[#6D4223] hover:bg-[#F2E8D8]'
                }`}
              >
                Back to Responsibility
              </button>

              <button
                type="button"
                id="continue-to-review-btn"
                onClick={handleProceedToReview}
                className={`inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#2F1707] hover:bg-[#DDA250] focus-visible:ring-[#C88D3A]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] focus-visible:ring-[#5A2D0C]'
                }`}
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW FULFILMENT */}
        {step === 'review' && (
          <div>
            <div className="border-b pb-4 mb-6" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
              <span
                className="text-xs font-semibold uppercase tracking-wider block mb-1"
                style={{ color: isDark ? '#C88D3A' : '#B77620' }}
              >
                Step 2 of 2
              </span>
              <h2
                id="review-fulfilment-heading"
                className="font-serif text-2xl font-semibold tracking-tight"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                REVIEW FULFILMENT
              </h2>
            </div>

            {/* Review Details Table */}
            <div
              className="p-5 rounded-xl border mb-6 space-y-3.5 text-sm"
              style={{
                backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                borderColor: isDark ? '#4B2710' : '#E7D6C1',
              }}
            >
              {/* Responsibility */}
              <div className="flex justify-between items-center">
                <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Responsibility:</span>
                <span className="font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  {responsibility.title}
                </span>
              </div>

              {/* Fulfilment Type */}
              <div className="flex justify-between items-center">
                <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Fulfilment Type:</span>
                <span className="font-semibold" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  {fulfilmentType === FulfilmentType.FULL ? 'Full' : 'Partial'}
                </span>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
                <span className="font-medium" style={{ color: isDark ? '#C88D3A' : '#B77620' }}>
                  Amount:
                </span>
                <span className="font-mono font-bold text-lg" style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                  {formatNaira(targetAmount)}
                </span>
              </div>

              {/* Current Verified */}
              <div className="flex justify-between items-center">
                <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Current Verified:</span>
                <span className="font-mono" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                  {formatNaira(responsibility.verifiedAmount)}
                </span>
              </div>

              {/* Current Remaining */}
              <div className="flex justify-between items-center">
                <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Current Remaining:</span>
                <span className="font-mono font-medium" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  {formatNaira(currentRemaining)}
                </span>
              </div>

              {/* Expected Remaining IF payment is eventually verified */}
              <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
                <span className="text-xs sm:text-sm" style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>
                  Expected Remaining IF payment is eventually verified:
                </span>
                <span className="font-mono font-bold" style={{ color: isDark ? '#C88D3A' : '#B77620' }}>
                  {formatNaira(expectedRemaining)}
                </span>
              </div>
            </div>

            {/* Required Invariant Notice */}
            <div
              className="p-4 rounded-xl border mb-6 text-xs leading-relaxed space-y-1.5"
              style={{
                backgroundColor: isDark ? '#3A1E0B' : '#F2E8D8',
                borderColor: isDark ? '#4B2710' : '#E7D6C1',
                color: isDark ? '#D9C4AC' : '#704728',
              }}
            >
              <div className="flex items-center gap-1.5 font-semibold" style={{ color: isDark ? '#E2AB5D' : '#5A2D0C' }}>
                <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Notice</span>
              </div>
              <p className="font-medium">
                Payment execution is not connected in this build.
              </p>
              <p>
                Preparing this fulfilment does not mark your responsibility as paid or verified.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
              <button
                type="button"
                id="review-back-btn"
                onClick={() => setStep('select')}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isDark ? 'text-[#E5D3BA] hover:bg-[#2F1707]' : 'text-[#6D4223] hover:bg-[#F2E8D8]'
                }`}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </button>

              <button
                type="button"
                id="confirm-preparation-btn"
                onClick={handleConfirmPreparation}
                className={`inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isDark
                    ? 'bg-[#C88D3A] text-[#2F1707] hover:bg-[#DDA250] focus-visible:ring-[#C88D3A]'
                    : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] focus-visible:ring-[#5A2D0C]'
                }`}
              >
                <span>Confirm Preparation</span>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FULFILMENT PREPARED */}
        {step === 'prepared' && preparedIntent && (
          <div className="text-center py-2">
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                borderColor: isDark ? '#C88D3A' : '#B77620',
                color: isDark ? '#C88D3A' : '#B77620',
              }}
            >
              <span className="text-2xl" aria-hidden="true">🛖</span>
            </div>

            <h2
              id="fulfilment-prepared-title"
              className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mb-4"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              FULFILMENT PREPARED
            </h2>

            {/* Prepared Details Box */}
            <div
              className="p-5 rounded-xl border mb-6 max-w-md mx-auto text-left space-y-2.5 text-sm"
              style={{
                backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                borderColor: isDark ? '#4B2710' : '#E7D6C1',
              }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Amount:</span>
                <span className="font-mono font-bold text-lg" style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                  {formatNaira(preparedIntent.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Status:</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border font-mono"
                  style={{
                    backgroundColor: isDark ? '#4B2710' : '#FFF9EE',
                    borderColor: isDark ? '#623416' : '#EAE0D0',
                    color: isDark ? '#C88D3A' : '#B77620',
                  }}
                >
                  Prepared
                </span>
              </div>
            </div>

            {/* Supporting Text */}
            <div
              className="mb-6 text-xs sm:text-sm leading-relaxed max-w-md mx-auto space-y-2"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              <p className="font-medium">
                No payment has been executed yet.
              </p>
              <p>
                Your verified accommodation balance will only change after a payment is successfully executed and verified.
              </p>
            </div>

            {/* STATE B — BMONI NOT CONFIGURED */}
            {isNotConfigured && (
              <div
                role="alert"
                id="bmoni-not-configured-notice"
                className="p-4 rounded-xl border mb-6 text-left text-xs max-w-md mx-auto space-y-2"
                style={{
                  backgroundColor: isDark ? '#3A1E0B' : '#FFF3E0',
                  borderColor: isDark ? '#623416' : '#FFCC80',
                }}
              >
                <div className="flex items-center gap-2 font-bold text-sm" style={{ color: isDark ? '#FFE082' : '#B45309' }}>
                  <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>BMONI Sandbox Not Configured</span>
                </div>
                <p className="font-semibold text-xs" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  No request was sent.
                </p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Your accommodation balance has not changed.
                </p>
              </div>
            )}

            {/* STATE D — DEFINITIVE FAILURE */}
            {bmoniError && (
              <div
                role="alert"
                id="bmoni-error-notice"
                className="p-4 rounded-xl border mb-6 text-left text-xs max-w-md mx-auto space-y-1.5"
                style={{
                  backgroundColor: isDark ? '#3A1515' : '#FEE2E2',
                  borderColor: isDark ? '#7F1D1D' : '#FCA5A5',
                }}
              >
                <div className="flex items-center gap-2 font-semibold text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>We couldn't prepare this payment with BMONI.</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: isDark ? '#D9C4AC' : '#704728' }}>
                  No payment has been executed.
                </p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Your accommodation balance has not changed.
                </p>
              </div>
            )}

            {/* AMBIGUOUS NETWORK FAILURE */}
            {isAmbiguousError && (
              <div
                role="alert"
                id="bmoni-ambiguous-notice"
                className="p-4 rounded-xl border mb-6 text-left text-xs max-w-md mx-auto space-y-2"
                style={{
                  backgroundColor: isDark ? '#2D1F0A' : '#FEF3C7',
                  borderColor: isDark ? '#6B4C1B' : '#FCD34D',
                }}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: isDark ? '#F59E0B' : '#B45309' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Unresolved Proposal Attempt</span>
                </div>
                <p className="font-semibold text-xs leading-relaxed" style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>
                  A network timeout or connection failure occurred while contacting BMONI. It is unknown whether BMONI accepted the proposal.
                </p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Investigation or reconciliation is required before retrying. Automatic retries are disabled to prevent duplicate proposals. Your accommodation balance has not changed.
                </p>
              </div>
            )}

            {/* Actions: [ Continue with BMONI ] and [ Back to Responsibility ] */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                id="continue-with-bmoni-btn"
                disabled={isBmoniLoading}
                onClick={handleContinueWithBmoni}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl text-sm font-bold border-b-4 shadow-md transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isDark
                    ? 'bg-[#2563EB] text-white border-[#1E3A8A] hover:bg-[#3B82F6] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] hover:-translate-y-[2px] active:translate-y-[1px] active:border-b-0 active:shadow-xs focus-visible:ring-[#3B82F6]'
                    : 'bg-[#1D4ED8] text-white border-[#172554] hover:bg-[#2563EB] hover:shadow-[0_8px_25px_rgba(37,99,235,0.45)] hover:-translate-y-[2px] active:translate-y-[1px] active:border-b-0 active:shadow-xs focus-visible:ring-[#1D4ED8]'
                } ${isBmoniLoading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
              >
                {isBmoniLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                    <span>Connecting to BMONI...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with BMONI</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </>
                )}
              </button>

              <button
                type="button"
                id="back-to-responsibility-btn"
                onClick={onClose}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                  isDark
                    ? 'border-[#623416] text-[#E5D3BA] hover:bg-[#2F1707]'
                    : 'border-[#EAE0D0] text-[#6D4223] hover:bg-[#F2E8D8]'
                }`}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Back to Responsibility</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT PREPARATION */}
        {step === 'bmoni-proposal-created' && preparedIntent && (
          <div className="text-center py-2">
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                borderColor: isDark ? '#C88D3A' : '#B77620',
                color: isDark ? '#C88D3A' : '#B77620',
              }}
            >
              <span className="text-2xl" aria-hidden="true">🛖</span>
            </div>

            <h2
              id="payment-preparation-title"
              className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mb-6"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              PAYMENT PREPARATION
            </h2>

            {/* Preparation Details Table */}
            <div
              className="p-5 rounded-xl border mb-6 max-w-md mx-auto text-left space-y-3.5 text-sm"
              style={{
                backgroundColor: isDark ? '#2F1707' : '#F7F1E7',
                borderColor: isDark ? '#4B2710' : '#E7D6C1',
              }}
            >
              {/* STATE A — SIMULATION */}
              {createdProposal?.isSimulated || createdProposal?.provider === 'SIMULATED' ? (
                <>
                  <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
                    <span className="font-bold text-xs uppercase tracking-wider" style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                      SIMULATED PROVIDER
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider font-mono border"
                      style={{
                        backgroundColor: isDark ? '#3A2810' : '#FEF3C7',
                        borderColor: isDark ? '#6B4C1B' : '#FCD34D',
                        color: isDark ? '#F59E0B' : '#B45309',
                      }}
                    >
                      Proposal: Simulated
                    </span>
                  </div>

                  <div
                    className="p-3 rounded-lg text-xs font-medium border"
                    style={{
                      backgroundColor: isDark ? '#261407' : '#FFF9EE',
                      borderColor: isDark ? '#4B2710' : '#E7D6C1',
                      color: isDark ? '#D9C4AC' : '#704728',
                    }}
                  >
                    No request was sent to BMONI.
                  </div>
                </>
              ) : (
                /* STATE C — REAL BMONI PROPOSAL CREATED */
                <>
                  <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
                    <span className="font-bold text-xs uppercase tracking-wider" style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                      BMONI
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider font-mono border"
                      style={{
                        backgroundColor: isDark ? '#382210' : '#EFF6FF',
                        borderColor: isDark ? '#5C381A' : '#BFDBFE',
                        color: isDark ? '#E2AB5D' : '#1D4ED8',
                      }}
                    >
                      Proposal: Created
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Provider Status:</span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border"
                      style={{
                        backgroundColor: isDark ? '#3A2810' : '#FEF3C7',
                        borderColor: isDark ? '#6B4C1B' : '#FCD34D',
                        color: isDark ? '#F59E0B' : '#B45309',
                      }}
                    >
                      {createdProposal?.providerStatus || 'Pending Approval'}
                    </span>
                  </div>

                  {createdProposal?.providerProposalId && (
                    <div className="flex justify-between items-center text-xs">
                      <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Provider Proposal Reference:</span>
                      <span className="font-mono text-xs font-medium" style={{ color: isDark ? '#E5D3BA' : '#5A2D0C' }}>
                        {createdProposal.providerProposalId}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Amount */}
              <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: isDark ? '#4B2710' : '#EAE0D0' }}>
                <span style={{ color: isDark ? '#A67B54' : '#8A5D3B' }}>Amount:</span>
                <span className="font-mono font-bold text-lg" style={{ color: isDark ? '#E2AB5D' : '#B77620' }}>
                  {formatNaira(createdProposal?.amount || preparedIntent.amount)}
                </span>
              </div>
            </div>

            {/* Invariant Messages */}
            <div
              className="mb-8 text-xs sm:text-sm leading-relaxed max-w-md mx-auto space-y-2 text-center"
              style={{ color: isDark ? '#D9C4AC' : '#704728' }}
            >
              <p className="font-medium">
                No money has moved yet.
              </p>
              <p>
                Your accommodation responsibility remains unverified.
              </p>
            </div>

            {/* Return Action */}
            <button
              type="button"
              id="back-to-responsibility-after-bmoni-btn"
              onClick={onClose}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isDark
                  ? 'bg-[#C88D3A] text-[#2F1707] hover:bg-[#DDA250] focus-visible:ring-[#C88D3A]'
                  : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] focus-visible:ring-[#5A2D0C]'
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Back to Responsibility</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
