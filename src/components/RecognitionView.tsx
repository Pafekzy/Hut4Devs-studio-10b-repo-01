import React from 'react';
import { CommunityRecognition } from '../domain/peerSupport';
import { Member } from '../domain/auth';
import { Award, ShieldAlert, Heart, Calendar, UserCheck, Sparkles } from 'lucide-react';

interface RecognitionViewProps {
  recognitions: CommunityRecognition[];
  availableMembers: Member[];
  currentMember: Member;
  isDark?: boolean;
}

export const RecognitionView: React.FC<RecognitionViewProps> = ({
  recognitions,
  availableMembers,
  currentMember,
  isDark = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Anti-Scoring Philosophy Banner */}
      <section
        className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold uppercase tracking-wider block"
            style={{ color: isDark ? '#E5A955' : '#B77620' }}
          >
            Human Dignity First
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
          >
            &bull; No Universal Scores &bull; No Humiliation Registries
          </span>
        </div>
        <h1
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
        >
          Recognition Without Human Scoring
        </h1>
        <p
          className="text-xs mt-1.5 max-w-3xl leading-relaxed"
          style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
        >
          Recognition should say: <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>"We noticed what you repeatedly demonstrated here."</strong>{' '}
          It should never pretend to say: <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>"We have calculated who you are."</strong>{' '}
          Hut4Devs explicitly bans universal credit scores, popularity leaderboards, wealth rankings,
          and permanent negative scarlet letters.
        </p>

        {/* Anti-Credit Bureau Callout */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t-2 text-xs"
          style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
        >
          <div
            className="p-4 rounded-xl border shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(45, 20, 20, 0.4)' : 'rgba(255, 243, 243, 0.65)',
              borderColor: isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.25)',
            }}
          >
            <div
              className="font-bold flex items-center gap-2 mb-2 text-xs sm:text-sm"
              style={{ color: isDark ? '#FDA4AF' : '#9F1239' }}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>What Hut4Devs Will Never Build</span>
            </div>
            <ul
              className="space-y-1.5 text-xs font-medium list-disc list-inside leading-relaxed"
              style={{ color: isDark ? '#FECDD3' : '#881337' }}
            >
              <li>No 0–100 universal trust credit scores</li>
              <li>No public debt walls or shaming registries</li>
              <li>No popularity or wealth competition leaderboards</li>
              <li>No permanent labels: past mistakes are repairable</li>
            </ul>
          </div>

          <div
            className="p-4 rounded-xl border shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(16, 37, 24, 0.4)' : 'rgba(240, 253, 244, 0.65)',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
            }}
          >
            <div
              className="font-bold flex items-center gap-2 mb-2 text-xs sm:text-sm"
              style={{ color: isDark ? '#6EE7B7' : '#065F46' }}
            >
              <span className="text-base shrink-0" aria-hidden="true">🛖</span>
              <span>What Hut4Devs Recognizes</span>
            </div>
            <ul
              className="space-y-1.5 text-xs font-medium list-disc list-inside leading-relaxed"
              style={{ color: isDark ? '#A7F3D0' : '#064E3B' }}
            >
              <li>Honoured shared accommodation commitments</li>
              <li>Proactive, honest communication when stipend is late</li>
              <li>Generous peer support and Debt-to-Gift forgiveness</li>
              <li>Measured, responsible contextual vouching for peers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recognitions Grid */}
      <section
        className="rounded-2xl p-5 sm:p-7 border-2 border-b-4 transition-all duration-200 shadow-md backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
        }}
      >
        <div className="mb-6">
          <span
            className="text-xs font-bold uppercase tracking-wider block mb-1"
            style={{ color: isDark ? '#E5A955' : '#B77620' }}
          >
            Verifiable Cooperative Milestones
          </span>
          <h2
            className="font-serif font-bold text-xl sm:text-2xl tracking-tight"
            style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
          >
            Demonstrated Community Recognitions
          </h2>
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
          >
            Contextual statements derived from verifiable cooperative actions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recognitions.map((badge) => {
            const isCurrent = badge.memberId === currentMember.id;

            return (
              <article
                key={badge.id}
                id={`badge-card-${badge.id}`}
                className="rounded-2xl p-5 sm:p-6 border-2 border-b-4 transition-all duration-200 shadow-md flex flex-col justify-between"
                style={{
                  backgroundColor: isCurrent
                    ? isDark
                      ? 'rgba(42, 34, 28, 0.65)'
                      : 'rgba(255, 250, 240, 0.85)'
                    : isDark
                    ? 'rgba(23, 21, 19, 0.55)'
                    : 'rgba(255, 253, 248, 0.65)',
                  borderColor: isCurrent
                    ? isDark
                      ? 'rgba(200, 141, 58, 0.65)'
                      : 'rgba(183, 118, 32, 0.55)'
                    : isDark
                    ? 'rgba(200, 141, 58, 0.35)'
                    : 'rgba(90, 45, 12, 0.25)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    }}
                  >
                    {badge.symbol}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3
                        className="font-serif font-bold text-base sm:text-lg truncate"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {badge.title}
                      </h3>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-xs"
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
                        {badge.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div
                      className="text-xs font-medium"
                      style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                    >
                      Earned by <strong style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}>{badge.memberName}</strong>
                    </div>

                    <p
                      className="text-xs mt-2.5 leading-relaxed p-3 rounded-xl border italic"
                      style={{
                        backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                        color: isDark ? '#EAD6C0' : '#5A2D0C',
                      }}
                    >
                      "{badge.description}"
                    </p>

                    <div
                      className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t-2"
                      style={{ borderColor: isDark ? '#421E06' : '#EAE0D0' }}
                    >
                      <span
                        className="italic text-[11px] font-medium"
                        style={{ color: isDark ? '#C49B75' : '#8A5D3B' }}
                      >
                        {badge.principle}
                      </span>
                      <span
                        className="flex items-center gap-1 font-mono text-[11px] font-semibold"
                        style={{ color: isDark ? '#F5C678' : '#B77620' }}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {badge.earnedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

