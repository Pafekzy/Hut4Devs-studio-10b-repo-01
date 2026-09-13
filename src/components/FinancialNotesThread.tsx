import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, ResponsibilityMessage, formatActionAttribution } from '../domain/membership';
import { membershipStore } from '../services/membershipStore';
import { MessageSquare, Send, ShieldCheck, User, Clock } from 'lucide-react';

interface FinancialNotesThreadProps {
  responsibilityId: string;
  currentMember: Member;
  activeMode: ActiveMode;
  isDark?: boolean;
}

export const FinancialNotesThread: React.FC<FinancialNotesThreadProps> = ({
  responsibilityId,
  currentMember,
  activeMode,
  isDark = false,
}) => {
  const [, setTick] = useState(0);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    return membershipStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const messages: ResponsibilityMessage[] = membershipStore.getMessagesForResponsibility(responsibilityId);
  const attribution = formatActionAttribution(currentMember, activeMode);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    membershipStore.addMessage({
      responsibilityId,
      fellowId: currentMember.id,
      sender: currentMember,
      activeMode,
      content: newNote.trim(),
    });

    setNewNote('');
  };

  return (
    <div
      id={`notes-thread-${responsibilityId}`}
      className={`rounded-xl border p-4 sm:p-5 transition-colors duration-200 ${
        isDark ? 'bg-[#3E200C] border-[#623416]' : 'bg-[#FFF9EE] border-[#C88D3A]/30'
      }`}
    >
      <div className="flex items-center justify-between border-b pb-3 mb-4 border-[#5A2D0C]/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#C88D3A]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A2D0C]">
            Accommodation Financial Notes &amp; Clarifications
          </h3>
        </div>
        <span className="text-[10px] text-[#5A2D0C]/60 font-mono">
          Contextual to this Month's Responsibility
        </span>
      </div>

      {/* Messages List */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#5A2D0C]/50 italic">
            No notes on this accommodation responsibility yet.
          </div>
        ) : (
          messages.map((msg: ResponsibilityMessage) => {
            const isSelf = msg.senderId === currentMember.id;
            const isStaff = Boolean(
              msg.actingCapacity?.includes('Coordinator') || msg.actingCapacity?.includes('Admin')
            );

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isStaff
                    ? 'bg-[#F7F1E7] border-[#C88D3A]/30'
                    : 'bg-white border-[#5A2D0C]/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#5A2D0C]">
                    {isStaff ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C88D3A]" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#5A2D0C]/60" />
                    )}
                    <span>{msg.senderName}</span>
                    {isSelf && (
                      <span className="text-[10px] text-[#B77620] font-normal">(You)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#5A2D0C]/50">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#B77620] mb-1">
                  Capacity: {msg.actingCapacity}
                </div>

                <p className="text-xs text-[#5A2D0C]/90 mt-1 whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Note Composition Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={`Add a note as ${attribution.actingCapacity}...`}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#5A2D0C]/20 bg-white text-[#5A2D0C] placeholder-[#5A2D0C]/40 focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
        />
        <button
          type="submit"
          disabled={!newNote.trim()}
          className="px-3 py-2 bg-[#5A2D0C] text-[#FFF9EE] disabled:opacity-40 hover:bg-[#432108] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Send Note</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
