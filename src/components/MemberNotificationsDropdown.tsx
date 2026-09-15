import React, { useState, useEffect, useRef } from 'react';
import {
  notificationStore,
  MemberNotification,
  NotificationTargetWorkspace,
} from '../services/notificationStore';
import { Bell, Check, CheckCheck, MessageSquare, Info, X, ArrowUpRight } from 'lucide-react';

export interface MemberNotificationsDropdownProps {
  memberId: string;
  isDark?: boolean;
  onOpenFeedbackReport?: (feedbackId?: string) => void;
  onNavigate?: (notif: MemberNotification) => void;
  buttonId?: string;
}

export const MemberNotificationsDropdown: React.FC<MemberNotificationsDropdownProps> = ({
  memberId,
  isDark = false,
  onOpenFeedbackReport,
  onNavigate,
  buttonId = 'header-notifications-btn',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateFromStore = () => {
    setNotifications(notificationStore.getNotificationsForMember(memberId));
    setUnreadCount(notificationStore.getUnreadCount(memberId));
  };

  useEffect(() => {
    updateFromStore();
    return notificationStore.subscribe(() => {
      updateFromStore();
    });
  }, [memberId]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    notificationStore.markAsRead(id, memberId);
  };

  const handleMarkAllAsRead = () => {
    notificationStore.markAllAsRead(memberId);
  };

  const handleNotificationClick = (notif: MemberNotification) => {
    if (!notif.read) {
      notificationStore.markAsRead(notif.id, memberId);
    }
    setIsOpen(false);

    if (onNavigate) {
      onNavigate(notif);
    } else if (notif.feedbackId && onOpenFeedbackReport) {
      onOpenFeedbackReport(notif.feedbackId);
    }
  };

  // Sort unread notifications to the top, then by timestamp desc
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read === b.read) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.read ? 1 : -1;
  });

  const getWorkspaceLabel = (ws?: NotificationTargetWorkspace) => {
    switch (ws) {
      case 'room-captain':
        return 'Room Captain Workspace';
      case 'coordinator':
        return 'Coordinator Workspace';
      case 'accommodation-admin':
        return 'Financial Admin';
      case 'welfare-workspace':
        return 'Welfare & Mediation';
      case 'member-home':
        return 'Fellow Home';
      default:
        return undefined;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={buttonId}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
            : 'Notifications (no unread)'
        }
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 min-h-[44px] min-w-[44px] relative flex items-center justify-center rounded-xl text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
          isDark
            ? 'text-[#E5D3BA] hover:text-[#FFF9EE] hover:bg-[#3E200C]'
            : 'text-[#6D4223] hover:text-[#5A2D0C] hover:bg-[#EFE5D5]'
        }`}
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            id="notification-unread-badge"
            className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#C88D3A] text-[#FFF9EE] text-[9px] font-bold flex items-center justify-center animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="header-notifications-panel"
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-xl z-50 overflow-hidden transition-all ${
            isDark
              ? 'bg-[#2F1707] border-[#C88D3A]/40 text-[#FFF9EE]'
              : 'bg-[#FFF9EE] border-[#C88D3A]/40 text-[#5A2D0C]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-[#C88D3A]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C88D3A]" />
              <span className="font-serif font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#C88D3A]/20 text-[#C88D3A]">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                id="notifications-mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-[#C88D3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#C88D3A]/10">
            {sortedNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs opacity-60">
                No notifications yet. You're up to date!
              </div>
            ) : (
              sortedNotifications.map((n) => {
                const wsLabel = getWorkspaceLabel(n.targetWorkspace);
                return (
                  <div
                    key={n.id}
                    id={`notification-item-${n.id}`}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 text-xs transition-colors cursor-pointer flex items-start gap-2.5 ${
                      !n.read
                        ? isDark
                          ? 'bg-[#3E1F0B]/80 hover:bg-[#3E1F0B]'
                          : 'bg-[#F7F1E7] hover:bg-[#F2E8D8]'
                        : isDark
                        ? 'hover:bg-[#1E0E04]'
                        : 'hover:bg-[#FFF9EE]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {!n.read ? (
                        <div className="w-2 h-2 rounded-full bg-[#C88D3A]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-stone-400/40" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="font-bold text-[11px] text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center justify-between gap-1">
                        <span className="truncate">{n.title}</span>
                        <span className="text-[10px] opacity-60 font-normal shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 line-clamp-2 leading-relaxed">{n.message}</p>

                      <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
                        {wsLabel && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#C88D3A] bg-[#C88D3A]/10 px-1.5 py-0.5 rounded">
                            {wsLabel} <ArrowUpRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {n.feedbackId && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#8A5D3B] dark:text-[#E5D3BA] bg-[#5A2D0C]/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
                            Missing Puzzle #{n.feedbackId} →
                          </span>
                        )}
                      </div>
                    </div>

                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        title="Mark as read"
                        aria-label="Mark notification as read"
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 shrink-0 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Transparency */}
          <div className="p-2.5 bg-black/5 dark:bg-white/5 border-t border-[#C88D3A]/20 text-[10px] opacity-60 text-center font-mono">
            Local browser persistence for this member session
          </div>
        </div>
      )}
    </div>
  );
};

