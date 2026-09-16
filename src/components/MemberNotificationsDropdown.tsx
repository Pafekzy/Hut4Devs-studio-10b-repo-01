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
          <div
            className="p-3.5 border-b flex items-center justify-between"
            style={{
              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
            }}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#B77620] dark:text-[#C88D3A]" />
              <span
                className="font-serif font-bold text-sm"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: isDark ? 'rgba(200, 141, 58, 0.25)' : '#FFFDF8',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.40)' : 'rgba(90, 45, 12, 0.20)',
                    color: isDark ? '#FCD34D' : '#5A2D0C',
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                id="notifications-mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                style={{ color: isDark ? '#C88D3A' : '#B77620' }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div
            className="max-h-80 overflow-y-auto divide-y"
            style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.15)' : 'rgba(90, 45, 12, 0.10)' }}
          >
            {sortedNotifications.length === 0 ? (
              <div
                className="p-6 text-center text-xs font-medium"
                style={{ color: isDark ? '#D9C4AC' : '#704728' }}
              >
                No notifications yet. You&apos;re up to date!
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
                          : 'bg-[#F7F1E7] hover:bg-[#EFE5D5]'
                        : isDark
                        ? 'hover:bg-[#231206]'
                        : 'hover:bg-[#FAF4EB]'
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      {!n.read ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B77620] dark:bg-[#C88D3A] ring-2 ring-[#C88D3A]/30" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-stone-400/50" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-bold text-xs truncate"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {n.title}
                        </span>
                        <span
                          className="text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded border"
                          style={{
                            color: isDark ? '#FCD34D' : '#5A2D0C',
                            backgroundColor: isDark ? 'rgba(42, 34, 28, 0.9)' : '#FFFDF8',
                            borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
                          }}
                        >
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: isDark ? '#E5D6C5' : '#5A2D0C' }}
                      >
                        {n.message}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        {wsLabel && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded border"
                            style={{
                              backgroundColor: isDark ? 'rgba(200, 141, 58, 0.20)' : '#FFFDF8',
                              color: isDark ? '#FCD34D' : '#5A2D0C',
                              borderColor: isDark ? 'rgba(200, 141, 58, 0.40)' : 'rgba(90, 45, 12, 0.20)',
                            }}
                          >
                            {wsLabel} <ArrowUpRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {n.feedbackId && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded border"
                            style={{
                              backgroundColor: isDark ? 'rgba(42, 34, 28, 0.85)' : '#FFFDF8',
                              color: isDark ? '#E5D3BA' : '#5A2D0C',
                              borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.20)',
                            }}
                          >
                            Missing Puzzle #{n.feedbackId} &rarr;
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
                        className="p-1 rounded-lg border transition-colors shrink-0 cursor-pointer"
                        style={{
                          borderColor: isDark ? 'rgba(200, 141, 58, 0.30)' : 'rgba(90, 45, 12, 0.20)',
                          backgroundColor: isDark ? 'rgba(42, 34, 28, 0.8)' : '#FFFDF8',
                          color: isDark ? '#FCD34D' : '#5A2D0C',
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Transparency */}
          <div
            className="p-2.5 border-t text-[10px] text-center font-mono font-semibold"
            style={{
              borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)',
              backgroundColor: isDark ? 'rgba(20, 10, 3, 0.6)' : 'rgba(247, 241, 231, 0.8)',
              color: isDark ? '#C88D3A' : '#704728',
            }}
          >
            Local browser persistence for this member session
          </div>
        </div>
      )}
    </div>
  );
};

