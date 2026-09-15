/**
 * Room Commons and Room Trail Store
 * Manages room-scoped notices, append-only trail events, and room-scoped communication.
 *
 * Persistence honesty: Local browser storage / in-memory fallback.
 * Scope: Strictly room-scoped. No cross-room or institutional authority.
 */

export interface RoomNotice {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  content: string;
  postedBy: string;
  postedAt: string;
  category: 'GUIDELINE' | 'SCHEDULE' | 'FACILITY' | 'ANNOUNCEMENT';
}

export type RoomTrailEventType =
  | 'OCCUPANCY_DELEGATED'
  | 'OCCUPANCY_CONFIRMED'
  | 'CANNOT_CONFIRM'
  | 'NOTE_RECORDED'
  | 'NOTICE_POSTED'
  | 'WELFARE_ESCALATED'
  | 'PUZZLE_LOGGED'
  | 'DECISION_MADE';

export interface RoomTrailEvent {
  id: string;
  roomId: string;
  roomName: string;
  eventType: RoomTrailEventType;
  actorName: string;
  actorCapacity: string;
  title: string;
  description: string;
  timestamp: string;
}

export type RoomCommunicationChannel =
  | 'ROOM_MEMBERS'
  | 'COORDINATOR_DISPATCH'
  | 'WELFARE_ESCALATION';

export interface RoomMessage {
  id: string;
  roomId: string;
  channel: RoomCommunicationChannel;
  senderId: string;
  senderName: string;
  senderCapacity: string;
  content: string;
  createdAt: string;
}

const INITIAL_NOTICES: RoomNotice[] = [
  {
    id: 'notice-1',
    roomId: 'room-304',
    roomName: 'Room 304',
    title: 'Study Hours & Common Quiet Period (10:00 PM – 7:00 AM)',
    content:
      'Please preserve quiet hours in Room 304 for fellow interns resting or on late-night deep work cohorts. Use headphones for audio calls.',
    postedBy: 'Chinedu Okeke (Room Captain)',
    postedAt: '2026-09-05T14:00:00Z',
    category: 'GUIDELINE',
  },
  {
    id: 'notice-2',
    roomId: 'room-304',
    roomName: 'Room 304',
    title: 'Inverter Charging & Power Protocol',
    content:
      'Laptops and power banks should be charged during the primary generator and solar window (8:00 AM – 1:00 PM and 6:00 PM – 11:00 PM).',
    postedBy: 'Zainab Aliyu (Accommodation Coordinator)',
    postedAt: '2026-09-06T09:30:00Z',
    category: 'SCHEDULE',
  },
  {
    id: 'notice-3',
    roomId: 'room-304',
    roomName: 'Room 304',
    title: 'Weekly Living Space Sanitation',
    content:
      'Common room cleaning and bin evacuation takes place every Saturday morning at 10:00 AM before weekly sync.',
    postedBy: 'Chinedu Okeke (Room Captain)',
    postedAt: '2026-09-07T11:15:00Z',
    category: 'ANNOUNCEMENT',
  },
];

const INITIAL_TRAIL: RoomTrailEvent[] = [
  {
    id: 'trail-1',
    roomId: 'room-304',
    roomName: 'Room 304',
    eventType: 'OCCUPANCY_CONFIRMED',
    actorName: 'Chinedu Okeke',
    actorCapacity: 'Room Captain — Room 304',
    title: 'Bed Space 1 Occupancy Confirmed',
    description: 'Chinedu Okeke checked in and verified Room 304 Bed 1.',
    timestamp: '2026-05-15T08:30:00Z',
  },
  {
    id: 'trail-2',
    roomId: 'room-304',
    roomName: 'Room 304',
    eventType: 'OCCUPANCY_CONFIRMED',
    actorName: 'Chinedu Okeke',
    actorCapacity: 'Room Captain — Room 304',
    title: 'Bed Space 2 Occupancy Confirmed',
    description: 'Emmanuel Ukom transferred to Room 304; verified in-person occupancy.',
    timestamp: '2026-06-01T09:00:00Z',
  },
  {
    id: 'trail-3',
    roomId: 'room-304',
    roomName: 'Room 304',
    eventType: 'NOTICE_POSTED',
    actorName: 'Chinedu Okeke',
    actorCapacity: 'Room Captain — Room 304',
    title: 'Room Guidelines Updated',
    description: 'Posted Study Hours & Common Quiet Period notice.',
    timestamp: '2026-09-05T14:00:00Z',
  },
  {
    id: 'trail-4',
    roomId: 'room-304',
    roomName: 'Room 304',
    eventType: 'OCCUPANCY_DELEGATED',
    actorName: 'Zainab Aliyu',
    actorCapacity: 'L2E Accommodation Fellows Coordinator',
    title: 'Room Verification Delegated: David Adeleke',
    description: 'Coordinator delegated in-person verification for David Adeleke (Bed Space 3).',
    timestamp: '2026-09-07T09:30:00Z',
  },
];

const INITIAL_MESSAGES: RoomMessage[] = [
  {
    id: 'rmsg-1',
    roomId: 'room-304',
    channel: 'ROOM_MEMBERS',
    senderId: 'member-chinedu-captain',
    senderName: 'Chinedu Okeke',
    senderCapacity: 'Room Captain',
    content: 'Good morning guys, just a reminder to leave the door locked when leaving for the hub.',
    createdAt: '2026-09-08T08:30:00Z',
  },
  {
    id: 'rmsg-2',
    roomId: 'room-304',
    channel: 'ROOM_MEMBERS',
    senderId: 'member-emmanuel-fellow',
    senderName: 'Emmanuel Ukom',
    senderCapacity: 'Fellow',
    content: 'Noted Chinedu. I have the spare key with me.',
    createdAt: '2026-09-08T08:45:00Z',
  },
  {
    id: 'rmsg-3',
    roomId: 'room-304',
    channel: 'COORDINATOR_DISPATCH',
    senderId: 'member-chinedu-captain',
    senderName: 'Chinedu Okeke',
    senderCapacity: 'Room Captain',
    content: 'Coordinator Zainab, confirming that Room 304 has two active occupants and one open bunk ready for verification.',
    createdAt: '2026-09-08T10:00:00Z',
  },
];

class RoomCommonsStore {
  private notices: RoomNotice[] = [];
  private trail: RoomTrailEvent[] = [];
  private messages: RoomMessage[] = [];
  private listeners: Array<() => void> = [];
  private initialized = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (this.initialized) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const rawNotices = window.localStorage.getItem('h4d_room_notices');
        const rawTrail = window.localStorage.getItem('h4d_room_trail');
        const rawMessages = window.localStorage.getItem('h4d_room_messages');
        this.notices = rawNotices ? JSON.parse(rawNotices) : [...INITIAL_NOTICES];
        this.trail = rawTrail ? JSON.parse(rawTrail) : [...INITIAL_TRAIL];
        this.messages = rawMessages ? JSON.parse(rawMessages) : [...INITIAL_MESSAGES];
      } else {
        this.notices = [...INITIAL_NOTICES];
        this.trail = [...INITIAL_TRAIL];
        this.messages = [...INITIAL_MESSAGES];
      }
    } catch {
      this.notices = [...INITIAL_NOTICES];
      this.trail = [...INITIAL_TRAIL];
      this.messages = [...INITIAL_MESSAGES];
    }
    this.initialized = true;
  }

  private saveState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('h4d_room_notices', JSON.stringify(this.notices));
        window.localStorage.setItem('h4d_room_trail', JSON.stringify(this.trail));
        window.localStorage.setItem('h4d_room_messages', JSON.stringify(this.messages));
      }
    } catch {
      // Ignore write errors
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  getNotices(roomId: string): RoomNotice[] {
    this.loadState();
    return this.notices.filter(
      (n) => n.roomId.toLowerCase() === roomId.toLowerCase() || roomId === 'all'
    );
  }

  addNotice(params: {
    roomId: string;
    roomName: string;
    title: string;
    content: string;
    postedBy: string;
    category?: RoomNotice['category'];
  }): RoomNotice {
    const notice: RoomNotice = {
      id: `notice-${Date.now()}`,
      roomId: params.roomId,
      roomName: params.roomName,
      title: params.title,
      content: params.content,
      postedBy: params.postedBy,
      postedAt: new Date().toISOString(),
      category: params.category || 'ANNOUNCEMENT',
    };
    this.notices.unshift(notice);
    this.addTrailEvent({
      roomId: params.roomId,
      roomName: params.roomName,
      eventType: 'NOTICE_POSTED',
      actorName: params.postedBy,
      actorCapacity: 'Room Notice Issuer',
      title: `Notice: ${params.title}`,
      description: params.content.slice(0, 100),
    });
    this.saveState();
    this.notify();
    return notice;
  }

  getTrail(roomId: string): RoomTrailEvent[] {
    this.loadState();
    return this.trail.filter(
      (t) => t.roomId.toLowerCase() === roomId.toLowerCase() || roomId === 'all'
    );
  }

  addTrailEvent(params: {
    roomId: string;
    roomName: string;
    eventType: RoomTrailEventType;
    actorName: string;
    actorCapacity: string;
    title: string;
    description: string;
  }): RoomTrailEvent {
    const event: RoomTrailEvent = {
      id: `trail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      roomId: params.roomId,
      roomName: params.roomName,
      eventType: params.eventType,
      actorName: params.actorName,
      actorCapacity: params.actorCapacity,
      title: params.title,
      description: params.description,
      timestamp: new Date().toISOString(),
    };
    this.trail.unshift(event);
    this.saveState();
    this.notify();
    return event;
  }

  getMessages(roomId: string, channel: RoomCommunicationChannel): RoomMessage[] {
    this.loadState();
    return this.messages.filter(
      (m) =>
        (m.roomId.toLowerCase() === roomId.toLowerCase() || roomId === 'all') &&
        m.channel === channel
    );
  }

  addMessage(params: {
    roomId: string;
    channel: RoomCommunicationChannel;
    senderId: string;
    senderName: string;
    senderCapacity: string;
    content: string;
  }): RoomMessage {
    const msg: RoomMessage = {
      id: `rmsg-${Date.now()}`,
      roomId: params.roomId,
      channel: params.channel,
      senderId: params.senderId,
      senderName: params.senderName,
      senderCapacity: params.senderCapacity,
      content: params.content,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(msg);

    if (params.channel === 'WELFARE_ESCALATION') {
      this.addTrailEvent({
        roomId: params.roomId,
        roomName: 'Room Scope',
        eventType: 'WELFARE_ESCALATED',
        actorName: params.senderName,
        actorCapacity: params.senderCapacity,
        title: 'Welfare Concern Escalated to Mediation Officer',
        description: 'Contextual notification dispatched without disclosing sensitive notes.',
      });
    }

    this.saveState();
    this.notify();
    return msg;
  }

  resetForTesting() {
    this.notices = [...INITIAL_NOTICES];
    this.trail = [...INITIAL_TRAIL];
    this.messages = [...INITIAL_MESSAGES];
    this.listeners = [];
    this.initialized = true;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('h4d_room_notices');
        window.localStorage.removeItem('h4d_room_trail');
        window.localStorage.removeItem('h4d_room_messages');
      }
    } catch {}
  }
}

export const roomCommonsStore = new RoomCommonsStore();
