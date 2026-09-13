import React from 'react';
import {
  AccommodationResponsibility,
  calculateRemainingAmount,
  formatNaira,
  getStatusLabel,
} from '../domain/accommodation';
import { Building2, ArrowRight } from 'lucide-react';

interface AccommodationResponsibilityCardProps {
  responsibility: AccommodationResponsibility;
  isDark: boolean;
  onViewDetails: (responsibilityId: string) => void;
}

export const AccommodationResponsibilityCard: React.FC<AccommodationResponsibilityCardProps> = ({
  responsibility,
  isDark,
  onViewDetails,
}) => {
  const remainingAmount = calculateRemainingAmount(responsibility);
  const statusLabel = getStatusLabel(responsibility.status);

  return (
    <article
      id={`responsibility-card-${responsibility.id}`}
      aria-labelledby={`responsibility-title-${responsibility.id}`}
      className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
      style={{
        backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
        borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
      }}
    >
      {/* Header: Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-wider block mb-1"
            style={{ color: isDark ? '#E5A955' : '#B77620' }}
          >
            Accommodation Responsibility
          </span>
          <h2
            id={`responsibility-title-${responsibility.id}`}
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            {responsibility.title}
          </h2>
        </div>

        {/* Status indicator */}
        <div className="self-start sm:self-auto">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs border"
            style={{
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
              color: isDark ? '#F5C678' : '#8C4D11',
              borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full mr-2 shadow-xs"
              style={{ backgroundColor: isDark ? '#C88D3A' : '#B77620' }}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Location Hierarchy: Property → Floor → Room */}
      <div
        className="rounded-xl p-3.5 sm:p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm border shadow-xs backdrop-blur-xs"
        style={{
          backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
          color: isDark ? '#EAD6C0' : '#5A2D0C',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
        }}
      >
        <div className="flex items-center gap-2 font-bold">
          <Building2
            className="w-4 h-4 shrink-0"
            style={{ color: isDark ? '#E5A955' : '#B77620' }}
            aria-hidden="true"
          />
          <span>{responsibility.accommodationContext.property.name}</span>
        </div>
        <div className="hidden sm:inline text-stone-400" aria-hidden="true">&bull;</div>
        <div className="flex items-center gap-3">
          <span>{responsibility.accommodationContext.floor.name}</span>
          <span aria-hidden="true">&bull;</span>
          <span className="font-semibold">{responsibility.accommodationContext.room.name}</span>
        </div>
      </div>

      {/* Financial State Breakdown: Required, Verified, Remaining */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-4 border-t-2 border-b-2 mb-5"
        style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
      >
        {/* Required Amount */}
        <div className="min-w-0">
          <span
            className="text-[11px] sm:text-xs block mb-1 truncate font-medium"
            style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
          >
            Required Amount
          </span>
          <p
            className="text-sm sm:text-base md:text-lg font-bold truncate"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            {formatNaira(responsibility.requiredAmount)}
          </p>
        </div>

        {/* Verified Amount */}
        <div className="min-w-0">
          <span
            className="text-[11px] sm:text-xs block mb-1 truncate font-medium"
            style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
          >
            Verified Amount
          </span>
          <p
            className="text-sm sm:text-base md:text-lg font-semibold truncate"
            style={{ color: isDark ? '#EAD6C0' : '#704728' }}
          >
            {formatNaira(responsibility.verifiedAmount)}
          </p>
        </div>

        {/* Remaining Amount (Derived) */}
        <div className="min-w-0">
          <span
            className="text-[11px] sm:text-xs block mb-1 truncate font-bold"
            style={{ color: isDark ? '#F5C678' : '#B77620' }}
          >
            Remaining Amount
          </span>
          <p
            className="text-sm sm:text-base md:text-lg font-extrabold truncate"
            style={{ color: isDark ? '#F5C678' : '#B77620' }}
          >
            {formatNaira(remainingAmount)}
          </p>
        </div>
      </div>

      {/* Action Footer: "View Responsibility" */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          id={`view-responsibility-${responsibility.id}-btn`}
          onClick={() => onViewDetails(responsibility.id)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-b-3 active:border-b active:translate-y-[1px] shadow-sm ${
            isDark
              ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#261205]'
              : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#FFF9EE]'
          }`}
        >
          <span>View Responsibility</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};
