/**
 * Notification Store for Hut4Devs Members
 * Manages member notifications for feedback status changes, acknowledgments,
 * clarifications, and community events.
 */

export type NotificationTargetWorkspace =
  | 'room-captain'
  | 'coordinator'
  | 'accommodation-admin'
  | 'welfare-workspace'
  | 'member-home';

export interface MemberNotification {
  id: string;
  memberId: string;
  title: string;
  message: string;
  feedbackId?: string;
  targetWorkspace?: NotificationTargetWorkspace;
  targetContextId?: string;
  targetContextType?:
    | 'DELEGATION'
    | 'CLARIFICATION'
    | 'RESPONSIBILITY'
    | 'WELFARE'
    | 'ROOM_ACTION'
    | 'MEMBERSHIP_REQUEST'
    | 'FEEDBACK';
  createdAt: string;
  read: boolean;
  type?:
    | 'FEEDBACK_ACKNOWLEDGED'
    | 'CLARIFICATION_REQUESTED'
    | 'STATUS_CHANGED'
    | 'RESOLVED'
    | 'DELEGATED_TASK'
    | 'ROOM_NOTICE'
    | 'WELFARE_ALERT'
    | 'FINANCIAL_UPDATE'
    | 'SYSTEM';
}

function getSeedNotificationsForMember(memberId: string): MemberNotification[] {
  const now = new Date();
  const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  if (memberId === 'member-chinedu-captain' || memberId === 'member-emmanuel-fellow') {
    return [
      {
        id: `notif-rc-del-${memberId}`,
        memberId,
        title: 'Room 304 Occupancy Verification Delegated',
        message: 'Coordinator Zainab Aliyu delegated room occupancy verification for David Adeleke (Room 304).',
        type: 'DELEGATED_TASK',
        targetWorkspace: 'room-captain',
        targetContextId: 'req-2026-003',
        targetContextType: 'DELEGATION',
        createdAt: tenMinsAgo,
        read: false,
      },
      {
        id: `notif-rc-commons-${memberId}`,
        memberId,
        title: 'Room Commons: Study Hours Reminder',
        message: 'Reminder: Shared quiet hours in Room 304 begin at 10:00 PM tonight.',
        type: 'ROOM_NOTICE',
        targetWorkspace: 'room-captain',
        targetContextType: 'ROOM_ACTION',
        createdAt: oneHourAgo,
        read: false,
      },
      {
        id: `notif-rc-prev-${memberId}`,
        memberId,
        title: 'Room Occupancy Confirmed',
        message: 'Emmanuel Ukom assigned bed space verification was recorded in Room 304 history.',
        type: 'ROOM_NOTICE',
        targetWorkspace: 'room-captain',
        createdAt: yesterday,
        read: true,
      },
    ];
  }

  if (memberId === 'member-zainab-coordinator') {
    return [
      {
        id: `notif-coord-req-1`,
        memberId,
        title: 'New Accommodation Request: Blessing Nwosu',
        message: 'A new applicant submitted a residency request for Infinite Grace Apartment (Room 304).',
        type: 'SYSTEM',
        targetWorkspace: 'coordinator',
        targetContextId: 'req-2026-001',
        targetContextType: 'MEMBERSHIP_REQUEST',
        createdAt: tenMinsAgo,
        read: false,
      },
      {
        id: `notif-coord-puz-1`,
        memberId,
        title: 'Missing Puzzle: Community Triage Required',
        message: 'Community report logged for room Wi-Fi stability in Infinite Grace Apartment.',
        type: 'CLARIFICATION_REQUESTED',
        targetWorkspace: 'coordinator',
        feedbackId: 'rep-demo-01',
        targetContextType: 'FEEDBACK',
        createdAt: oneHourAgo,
        read: false,
      },
    ];
  }

  if (memberId === 'member-admin-financial') {
    return [
      {
        id: `notif-fin-recon-1`,
        memberId,
        title: 'Payment Responsibility Attention: Emmanuel Ukom',
        message: '₦46,000 verified for September 2026; ₦20,000 balance remaining requires review.',
        type: 'FINANCIAL_UPDATE',
        targetWorkspace: 'accommodation-admin',
        targetContextId: 'resp-infinite-grace-2026-09',
        targetContextType: 'RESPONSIBILITY',
        createdAt: tenMinsAgo,
        read: false,
      },
    ];
  }

  // Default Fellow notifications
  return [
    {
      id: `notif-fellow-welcome-${memberId}`,
      memberId,
      title: 'Welcome to Hut4Devs Living Space',
      message: 'Your active accommodation responsibility is tracked in your Fellow home workspace.',
      type: 'SYSTEM',
      targetWorkspace: 'member-home',
      createdAt: yesterday,
      read: false,
    },
  ];
}

class NotificationStore {
  private notifications: Map<string, MemberNotification[]> = new Map();
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadAll();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private getStorageKey(memberId: string): string {
    return `h4d_notifications_${memberId}`;
  }

  private loadForMember(memberId: string): MemberNotification[] {
    if (this.notifications.has(memberId)) {
      return this.notifications.get(memberId)!;
    }
    let loaded: MemberNotification[] = [];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.getStorageKey(memberId));
        if (raw) {
          loaded = JSON.parse(raw);
        }
      }
    } catch {
      // Fallback to empty memory list
    }
    if (!loaded || loaded.length === 0) {
      loaded = getSeedNotificationsForMember(memberId);
      this.saveForMember(memberId, loaded);
    }
    this.notifications.set(memberId, loaded);
    return loaded;
  }

  private saveForMember(memberId: string, customList?: MemberNotification[]): void {
    const list = customList || this.notifications.get(memberId) || [];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.getStorageKey(memberId), JSON.stringify(list));
      }
    } catch {
      // Ignore write errors
    }
  }

  private loadAll(): void {
    // Lazy loaded per member
  }

  public getNotificationsForMember(memberId: string): MemberNotification[] {
    return [...this.loadForMember(memberId)];
  }

  public getUnreadCount(memberId: string): number {
    return this.loadForMember(memberId).filter((n) => !n.read).length;
  }

  public markAsRead(notificationId: string, memberId?: string): void {
    let changed = false;
    for (const [mId, list] of this.notifications.entries()) {
      if (memberId && mId !== memberId) continue;
      const target = list.find((n) => n.id === notificationId);
      if (target && !target.read) {
        target.read = true;
        this.saveForMember(mId);
        changed = true;
      }
    }
    if (changed) this.notify();
  }

  public markAllAsRead(memberId: string): void {
    const list = this.loadForMember(memberId);
    let changed = false;
    for (const n of list) {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    }
    if (changed) {
      this.saveForMember(memberId);
      this.notify();
    }
  }

  public addNotification(
    data: Omit<MemberNotification, 'id' | 'createdAt' | 'read'> & { read?: boolean }
  ): MemberNotification {
    const newNotif: MemberNotification = {
      ...data,
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: data.read ?? false,
      type: data.type ?? 'SYSTEM',
    };

    const list = this.loadForMember(data.memberId);
    list.unshift(newNotif);
    this.saveForMember(data.memberId);
    this.notify();
    return newNotif;
  }

  public resetForTesting(): void {
    this.notifications.clear();
    this.listeners = [];
  }

  public clearAll(): void {
    this.resetForTesting();
  }
}

export const notificationStore = new NotificationStore();
