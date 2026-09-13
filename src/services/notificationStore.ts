/**
 * Notification Store for Hut4Devs Members
 * Manages member notifications for feedback status changes, acknowledgments,
 * clarifications, and community events.
 */

export interface MemberNotification {
  id: string;
  memberId: string;
  title: string;
  message: string;
  feedbackId?: string;
  createdAt: string;
  read: boolean;
  type?:
    | 'FEEDBACK_ACKNOWLEDGED'
    | 'CLARIFICATION_REQUESTED'
    | 'STATUS_CHANGED'
    | 'RESOLVED'
    | 'SYSTEM';
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
    this.notifications.set(memberId, loaded);
    return loaded;
  }

  private saveForMember(memberId: string): void {
    const list = this.notifications.get(memberId) || [];
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
