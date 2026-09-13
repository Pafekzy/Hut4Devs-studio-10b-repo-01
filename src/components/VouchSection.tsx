import React, { useState } from 'react';
import { PeerVouch } from '../domain/peerSupport';
import { Member } from '../domain/auth';
import { Shield, Plus, CheckCircle2, AlertCircle, Info, Calendar, ShieldCheck } from 'lucide-react';
import { VouchModal } from './VouchModal';

interface VouchSectionProps {
  vouches: PeerVouch[];
  availableMembers: Member[];
  currentMember: Member;
  isDark?: boolean;
  onAddVouch: (
    targetMemberId: string,
    targetMemberName: string,
    context: string,
    confidence: 'high' | 'moderate' | 'cautious',
    scope: string,
    notes: string
  ) => void;
}

export const VouchSection: React.FC<VouchSectionProps> = ({
  vouches,
  availableMembers,
  currentMember,
  isDark = false,
  onAddVouch,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getMember = (id: string, nameFallback: string) => {
    return availableMembers.find((m) => m.id === id) || {
      id,
      displayName: nameFallback,
      email: '',
      role: 'FELLOW',
      h4dMemberId: 'H4D-MEMBER',
      createdAt: '',
    };
  };

  const getConfidenceBadge = (confidence: PeerVouch['confidence']) => {
    switch (confidence) {
      case 'high':
        return (
          <span className="relative inline-flex group select-none">
            {/* 3D Underlay Backplate - Solid Dark Chocolate (#5A2D0C) for tactile physical base in Light Mode */}
            <span
              aria-hidden="true"
              className="absolute inset-0 translate-y-[3px] rounded-full bg-[#5A2D0C] dark:hidden"
            />
            {/* Top Badge */}
            <span
              className="relative z-1 animate-badge-shine inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-gradient-to-r from-[#D7F3E9] via-[#E8F8F2] to-[#D7F3E9] text-[#0C3829] border-[#227B5D] dark:from-[#3F8F76]/40 dark:via-[#5CA98C]/45 dark:to-[#78C2A4]/35 dark:text-[#C1F5E8] dark:border-[#5CA98C]/70 dark:shadow-[#3F8F76]/30 dark:shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0C3829] dark:text-[#C1F5E8] shrink-0" strokeWidth={2.5} />
              <span className="font-bold tracking-tight">High Confidence</span>
            </span>
          </span>
        );
      case 'moderate':
        return (
          <span className="relative inline-flex group select-none">
            {/* 3D Underlay Backplate - Solid Dark Chocolate (#5A2D0C) for tactile physical base in Light Mode */}
            <span
              aria-hidden="true"
              className="absolute inset-0 translate-y-[3px] rounded-full bg-[#5A2D0C] dark:hidden"
            />
            {/* Top Badge */}
            <span
              className="relative z-1 animate-badge-shine inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-gradient-to-r from-[#DFE6F9] via-[#EDF2FC] to-[#DFE6F9] text-[#192750] border-[#465BA0] dark:from-[#6F7FBF]/40 dark:via-[#8190CF]/45 dark:to-[#9AA5DE]/35 dark:text-[#D8E0FF] dark:border-[#8190CF]/70 dark:shadow-[#6F7FBF]/30 dark:shadow-xs"
            >
              <Info className="w-3.5 h-3.5 text-[#192750] dark:text-[#D8E0FF] shrink-0" strokeWidth={2.5} />
              <span className="font-bold tracking-tight">Moderate Confidence</span>
            </span>
          </span>
        );
      case 'cautious':
        return (
          <span className="relative inline-flex group select-none">
            {/* 3D Underlay Backplate - Solid Dark Chocolate (#5A2D0C) for tactile physical base in Light Mode */}
            <span
              aria-hidden="true"
              className="absolute inset-0 translate-y-[3px] rounded-full bg-[#5A2D0C] dark:hidden"
            />
            {/* Top Badge */}
            <span
              className="relative z-1 animate-badge-shine inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-gradient-to-r from-[#FDE68A]/60 via-[#FEF3C7] to-[#FDE68A]/60 text-[#712B07] border-[#C25E00] dark:from-[#D97706]/40 dark:via-[#F59E0B]/45 dark:to-[#FBBF24]/35 dark:text-[#FDE68A] dark:border-[#F59E0B]/70 dark:shadow-[#D97706]/30 dark:shadow-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 text-[#712B07] dark:text-[#FDE68A] shrink-0" strokeWidth={2.5} />
              <span className="font-bold tracking-tight">Cautious / Bounded</span>
            </span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Vouching Philosophy Banner */}
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
                Distributed Peer Confidence
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
              >
                &bull; Contextual &bull; No Universal Scores
              </span>
            </div>
            <h1
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Contextual Vouching Matrix
            </h1>
            <p
              className="text-xs mt-1.5 max-w-2xl leading-relaxed"
              style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
            >
              When a fellow needs context before lending or coordinating, they consult trusted peers.
              A vouch is never a blank check: it states who vouches for whom, in what specific domain,
              at what confidence level, with zero automatic guarantor liability.
            </p>
          </div>

          <button
            type="button"
            id="btn-issue-vouch"
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-b-3 active:border-b active:translate-y-[1px] shadow-sm shrink-0 ${
              isDark
                ? 'bg-[#C88D3A] text-[#241104] hover:bg-[#DDA250] border-[#915B15] focus-visible:ring-[#C88D3A] focus-visible:ring-offset-[#261205]'
                : 'bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#432108] border-[#381B07] focus-visible:ring-[#5A2D0C] focus-visible:ring-offset-[#FFF9EE]'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Issue Contextual Vouch</span>
          </button>
        </div>

        <div
          className="mt-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs shadow-xs"
          style={{
            backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
            borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
            color: isDark ? '#EAD6C0' : '#5A2D0C',
          }}
        >
          <span className="text-sm shrink-0 mt-0.5" aria-hidden="true">🛖</span>
          <p className="leading-relaxed">
            <strong>Hut4Devs Vouching Invariant:</strong> A vouch means "Fellow A vouches for Fellow B in domain X with confidence Y for scope Z". It does NOT create financial guarantor liability or universal reputation points. Declining to vouch ("No") is always legitimate and non-punitive.
          </p>
        </div>
      </section>

      {/* Vouches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vouches.map((vouch) => {
          const voucher = getMember(vouch.voucherMemberId, vouch.voucherMemberName);
          const target = getMember(vouch.targetMemberId, vouch.targetMemberName);

          return (
            <article
              key={vouch.id}
              id={`vouch-card-${vouch.id}`}
              className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md flex flex-col justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
              }}
            >
              <div>
                <div
                  className="flex items-start justify-between gap-2 pb-3.5 border-b-2"
                  style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center border shadow-xs"
                      style={{
                        backgroundColor: isDark ? '#C88D3A' : '#5A2D0C',
                        color: isDark ? '#241104' : '#FFF9EE',
                        borderColor: isDark ? '#F5C678' : '#C88D3A',
                      }}
                    >
                      {target.displayName.charAt(0)}
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider block"
                        style={{ color: isDark ? '#E5A955' : '#B77620' }}
                      >
                        Vouch For Fellow
                      </span>
                      <h3
                        className="font-serif font-bold text-base sm:text-lg leading-tight"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {target.displayName}
                      </h3>
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                      >
                        {target.h4dMemberId || 'H4D-MEMBER'}
                      </span>
                    </div>
                  </div>
                  {getConfidenceBadge(vouch.confidence)}
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div>
                    <span
                      className="text-[11px] font-medium block"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      Domain Context:
                    </span>
                    <p
                      className="font-bold text-sm mt-0.5"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      {vouch.context}
                    </p>
                  </div>

                  <div>
                    <span
                      className="text-[11px] font-medium block"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      Commitment Scope:
                    </span>
                    <p
                      className="font-mono text-xs font-semibold mt-0.5"
                      style={{ color: isDark ? '#F5C678' : '#B77620' }}
                    >
                      {vouch.commitmentScope}
                    </p>
                  </div>

                  <div>
                    <span
                      className="text-[11px] font-medium block"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      Voucher Statement:
                    </span>
                    <p
                      className="italic p-3 rounded-xl border mt-1 leading-relaxed text-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                        color: isDark ? '#EAD6C0' : '#5A2D0C',
                      }}
                    >
                      "{vouch.notes}"
                    </p>
                  </div>

                  {vouch.disclaimer && (
                    <div
                      className="text-[11px] flex items-center gap-1.5 mt-2 font-medium"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{vouch.disclaimer}</span>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="mt-5 pt-3.5 border-t-2 flex items-center justify-between text-xs font-medium"
                style={{
                  borderColor: isDark ? '#421E06' : '#EAE0D0',
                  color: isDark ? '#C49B75' : '#8A5D3B',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      backgroundColor: isDark ? '#C88D3A' : '#5A2D0C',
                      color: isDark ? '#241104' : '#FFF9EE',
                    }}
                  >
                    {voucher.displayName.charAt(0)}
                  </div>
                  <span>Vouched by <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{voucher.displayName}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {vouch.createdAt.split('T')[0]}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {isModalOpen && (
        <VouchModal
          availableMembers={availableMembers}
          currentMember={currentMember}
          isDark={isDark}
          onClose={() => setIsModalOpen(false)}
          onSubmitVouch={(targetId, targetName, context, confidence, scope, notes) => {
            onAddVouch(targetId, targetName, context, confidence, scope, notes);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
