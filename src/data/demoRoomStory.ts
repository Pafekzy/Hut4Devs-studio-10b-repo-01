/**
 * DEMO SEED FIXTURES — ROOM IDENTITY, HISTORY & ALUMNI DATA
 *
 * Distinctly isolated demo data fixtures for Room 304 (Infinite Grace Apartment, Lagos Yaba)
 * and fellow co-living communities.
 *
 * Strict Privacy Rules:
 * - NO full date of birth (only Day/Month e.g. "14 March" if explicitly opted in).
 * - NO phone numbers or emails.
 * - NO financial debt or payment responsibility amounts.
 * - NO private welfare notes or administrative flags.
 * - NO sensitive identity markers.
 */

export interface RoommatePublicProfile {
  memberId: string;
  displayName: string;
  roomRole?: 'Room Captain' | 'Fellow';
  bedLabel: string;
  cohort: string;
  track: string;
  bio: string;
  skills: string[];
  interests: string[];
  publicBirthday?: string; // DAY/MONTH ONLY (e.g. '22 October'). NEVER full DOB, NEVER birth year.
  avatarInitials: string;
  avatarBgColor: string;
  isCurrentUser?: boolean;
}

export type RoomStoryCategory =
  | 'FOUNDING'
  | 'PEOPLE'
  | 'SHARED_CONTRIBUTIONS'
  | 'CARE_REPAIR'
  | 'COMMUNITY_MOMENTS'
  | 'ROOM_EVOLUTION';

export interface RoomStoryFact {
  id: string;
  roomId: string;
  category: RoomStoryCategory;
  title: string;
  dateOrPeriod: string;
  summary: string;
  details?: string;
  attributedTo?: string;
  badgeLabel?: string;
}

export interface RoomAlumniRecord {
  id: string;
  roomId: string;
  fullName: string;
  avatarInitials: string;
  avatarBgColor: string;
  cohort: string;
  residencyPeriod: string; // e.g., 'January 2025 – August 2025'
  publicTrackAndRole: string;
  currentStatus: string;
  skills: string[];
  publicNote?: string;
}

export interface RoomCultureGuide {
  roomId: string;
  roomNumber: string;
  quietHours: {
    weekdays: string;
    weekends: string;
    guideline: string;
  };
  cleaningRhythm: {
    schedule: string;
    areas: string[];
    notes: string;
  };
  powerAndInverterProtocol: {
    summary: string;
    guideline: string;
  };
  sharedTraditions: Array<{
    title: string;
    description: string;
    cadence: string;
  }>;
  communityPledge: string;
}

/**
 * Public Roommate Profiles for Room 304
 * (DEMO SEED FIXTURES)
 */
export const DEMO_ROOM_304_ROOMMATES: RoommatePublicProfile[] = [
  {
    memberId: 'member-chinedu-captain',
    displayName: 'Chinedu Okeke',
    roomRole: 'Room Captain',
    bedLabel: 'Bunk 1 (Lower)',
    cohort: 'Learn2Earn · Cohort 3',
    track: 'Frontend Systems & Accessibility',
    bio: 'Passionate about accessible web architecture, design tokens, and smooth component interactions. Serving as Room Captain for Floor 3.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'WCAG AA'],
    interests: ['UI Engineering', 'Table Tennis', 'Hiplife Music'],
    publicBirthday: '22 October', // Safe day/month only
    avatarInitials: 'CO',
    avatarBgColor: 'bg-amber-600 text-amber-50',
    isCurrentUser: false,
  },
  {
    memberId: 'member-emmanuel-fellow',
    displayName: 'Emmanuel Ukom',
    roomRole: 'Fellow',
    bedLabel: 'Bunk 2 (Upper)',
    cohort: 'Learn2Earn · Cohort 4',
    track: 'Full Stack & Distributed Systems',
    bio: 'Focused on transactional outboxes, resilient offline state, and relational databases. Learning community stewardship at Hut4Devs.',
    skills: ['Node.js', 'PostgreSQL', 'React', 'TypeScript', 'Docker'],
    interests: ['System Design', 'Chess', 'Gospel Jazz'],
    publicBirthday: '15 August', // Safe day/month only
    avatarInitials: 'EU',
    avatarBgColor: 'bg-emerald-600 text-emerald-50',
    isCurrentUser: true,
  },
  {
    memberId: 'member-blessing-nwosu',
    displayName: 'Blessing Nwosu',
    roomRole: 'Fellow',
    bedLabel: 'Bunk 3 (Lower)',
    cohort: 'Learn2Earn · Cohort 4',
    track: 'Mobile Engineering & Offline UI',
    bio: 'Building offline-first mobile utilities. Passionate about community mentorship, study sprints, and clean state machines.',
    skills: ['React Native', 'TypeScript', 'GraphQL', 'Tailwind'],
    interests: ['Mobile UX', 'Podcasts', 'Baking'],
    publicBirthday: '04 May', // Safe day/month only
    avatarInitials: 'BN',
    avatarBgColor: 'bg-purple-600 text-purple-50',
    isCurrentUser: false,
  },
];

/**
 * Historical Room Story Facts for Room 304
 * (DEMO SEED FIXTURES — Grounded in healthy community milestones)
 */
export const DEMO_ROOM_304_STORY: RoomStoryFact[] = [
  {
    id: 'story-304-01',
    roomId: 'room-304',
    category: 'FOUNDING',
    title: 'First Inhabitation of Room 304',
    dateOrPeriod: 'January 2025',
    summary: 'Room 304 officially entered Hut4Devs residency records during the inaugural launch of Learn2Earn Cohort 1 at Infinite Grace Apartment.',
    details: 'Configured with 4 sturdy bunk spaces, dedicated reading desks, and dual electrical circuiting intended for quiet evening study.',
    attributedTo: 'Hut4Devs Accommodation Board',
    badgeLabel: 'Founding Milestone',
  },
  {
    id: 'story-304-02',
    roomId: 'room-304',
    category: 'SHARED_CONTRIBUTIONS',
    title: 'Communal Anti-Glare Study Desk Setup',
    dateOrPeriod: 'June 2025',
    summary: 'Residents pooled room contributions with partial alumni sponsorship to install an ergonomic wide study bench.',
    details: 'Permits two fellows to pair-program simultaneously late into the evening without disturbing bunk rest zones.',
    attributedTo: 'Cohort 2 Residents Collective',
    badgeLabel: 'Room Improvement',
  },
  {
    id: 'story-304-03',
    roomId: 'room-304',
    category: 'CARE_REPAIR',
    title: 'Inverter Sub-Line Isolation & LED Upgrade',
    dateOrPeriod: 'November 2025',
    summary: 'Estate facilities technicians and Room 304 fellows separated desk sockets onto the dedicated 5kVA solar inverter backup.',
    details: 'Eliminated voltage flickers during city grid outages, preserving active development builds and battery longevity.',
    attributedTo: 'Estate Facilities & Room 304',
    badgeLabel: 'Maintenance Milestone',
  },
  {
    id: 'story-304-04',
    roomId: 'room-304',
    category: 'COMMUNITY_MOMENTS',
    title: 'Zero-Dropout Capstone Sprint Celebration',
    dateOrPeriod: 'February 2026',
    summary: 'All four occupants of Room 304 successfully completed and shipped their full-stack capstone projects within the same week.',
    details: 'The room celebrated with a joint dinner in the Infinite Grace courtyard, establishing the tradition of peer project reviews before submission.',
    attributedTo: 'Cohort 3 Fellowship Collective',
    badgeLabel: 'Academic Milestone',
  },
  {
    id: 'story-304-05',
    roomId: 'room-304',
    category: 'ROOM_EVOLUTION',
    title: 'Delegated Candidate Selection Protocol Enacted',
    dateOrPeriod: 'September 2026',
    summary: 'Accommodation Coordinator Zainab Aliyu established the room-scoped delegated candidate choice protocol for Room 304.',
    details: 'Empowers Room Captain Chinedu Okeke to evaluate peer study rhythms and in-person fit from a vetted candidate pool.',
    attributedTo: 'Lagos Yaba Accommodation Office',
    badgeLabel: 'Governance Evolution',
  },
];

/**
 * Room Alumni Memory Records for Room 304
 * (DEMO SEED FIXTURES — Celebrating previous occupants)
 */
export const DEMO_ROOM_304_ALUMNI: RoomAlumniRecord[] = [
  {
    id: 'alumni-304-01',
    roomId: 'room-304',
    fullName: 'Babajide Adekunle',
    avatarInitials: 'BA',
    avatarBgColor: 'bg-blue-600 text-blue-50',
    cohort: 'Cohort 1 (2025)',
    residencyPeriod: 'January 2025 – August 2025',
    publicTrackAndRole: 'Former Room Captain & Backend Engineer',
    currentStatus: 'Senior Backend Engineer @ Kuda Bank',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'Docker'],
    publicNote: 'Established the original "dim lights after 10:30 PM" rhythm that keeps Room 304 productive. Always glad to mentor fellows here.',
  },
  {
    id: 'alumni-304-02',
    roomId: 'room-304',
    fullName: 'Chioma Okoli',
    avatarInitials: 'CO',
    avatarBgColor: 'bg-rose-600 text-rose-50',
    cohort: 'Cohort 2 (2025)',
    residencyPeriod: 'August 2025 – February 2026',
    publicTrackAndRole: 'Frontend & Design System Engineer',
    currentStatus: 'UI Architect @ Flutterwave',
    skills: ['React', 'TypeScript', 'Web Accessibility', 'Figma'],
    publicNote: 'Designed the shared wall shelving unit near Bunk 4. Keep shipping clean code and looking out for one another!',
  },
  {
    id: 'alumni-304-03',
    roomId: 'room-304',
    fullName: 'Tunde Bakare',
    avatarInitials: 'TB',
    avatarBgColor: 'bg-teal-600 text-teal-50',
    cohort: 'Cohort 2 (2025)',
    residencyPeriod: 'June 2025 – January 2026',
    publicTrackAndRole: 'Cloud & Infrastructure Engineer',
    currentStatus: 'DevOps Specialist @ Interswitch',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Linux'],
    publicNote: 'Room 304 is the best spot for deep work in Infinite Grace. Treat the inverter line with respect and keep your git commits atomic.',
  },
];

/**
 * Room Culture & Shared Living Guidelines for Room 304
 * (DEMO SEED FIXTURES)
 */
export const DEMO_ROOM_304_CULTURE: RoomCultureGuide = {
  roomId: 'room-304',
  roomNumber: 'Room 304',
  quietHours: {
    weekdays: '10:30 PM – 7:00 AM',
    weekends: '11:30 PM – 8:00 AM',
    guideline: 'Main overhead lights dim at 10:30 PM. Personal desk lamps permitted. Headphones mandatory for calls, coding music, and video courses.',
  },
  cleaningRhythm: {
    schedule: 'Weekly Rotation & Saturday Morning Sprint (9:00 AM – 10:00 AM)',
    areas: [
      'Study desk surface sanitizer wipe-down',
      'Shoe rack sorting and corridor clearance',
      'Shared trash bin bag replacement & courtyard disposal',
      'Window mesh ventilation check & AC filter dusting',
    ],
    notes: 'Rotate chore responsibility weekly among all occupied bunk spaces.',
  },
  powerAndInverterProtocol: {
    summary: 'Dedicated 5kVA Solar Inverter Line',
    guideline: 'Inverter wall sockets are reserved strictly for laptops, development monitors, and phone charging. High-current appliances (electric kettles, irons, hot plates) must use the primary estate grid circuit in the floor pantry.',
  },
  sharedTraditions: [
    {
      title: 'Friday Evening Retrospective',
      description: 'A 20-minute casual gathering before dinner to share technical breakthroughs, upcoming project deadlines, and any living rhythm adjustments.',
      cadence: 'Weekly on Friday, 7:00 PM',
    },
    {
      title: 'Alumni Notebook Note',
      description: 'Each departing fellow writes a short reflection and advice note in the physical Room 304 notebook kept on the shared bookshelf.',
      cadence: 'On Cohort Completion',
    },
    {
      title: 'Courtyard Pairing Hour',
      description: 'Optional joint debugging hour in the shaded courtyard whenever multiple fellows face difficult algorithmic blockers.',
      cadence: 'Bi-weekly on Wednesdays',
    },
  ],
  communityPledge:
    'We treat Room 304 not merely as a bed space, but as a calm sanctuary for technical mastery, mutual respect, rest, and lasting fellowship.',
};

/**
 * Safe Public Profile Sanitizer
 * Ensures no private dates of birth, financial notes, phone numbers, or emails leak into public roommate cards.
 */
export function sanitizeRoommateProfile(profile: RoommatePublicProfile): RoommatePublicProfile {
  return {
    ...profile,
    // Explicitly guarantee privacy boundaries:
    publicBirthday: profile.publicBirthday, // day/month only, no birth year
  };
}

/**
 * Accessor functions
 */
export function getRoommatesForRoom(roomId: string, currentMemberId?: string): RoommatePublicProfile[] {
  if (roomId === 'room-304') {
    return DEMO_ROOM_304_ROOMMATES.map((r) => ({
      ...r,
      isCurrentUser: currentMemberId ? r.memberId === currentMemberId : r.isCurrentUser,
    }));
  }

  // Generic fallback for other rooms
  return [
    {
      memberId: 'generic-captain',
      displayName: 'Room Captain',
      roomRole: 'Room Captain',
      bedLabel: 'Bunk 1',
      cohort: 'Learn2Earn · Cohort 4',
      track: 'Full Stack Engineering',
      bio: 'Fellow community resident and peer study steward.',
      skills: ['TypeScript', 'React', 'Node.js'],
      interests: ['Web Development', 'Community Building'],
      avatarInitials: 'RC',
      avatarBgColor: 'bg-amber-600 text-amber-50',
      isCurrentUser: false,
    },
  ];
}

export function getStoryFactsForRoom(roomId: string): RoomStoryFact[] {
  if (roomId === 'room-304') {
    return DEMO_ROOM_304_STORY;
  }
  return [
    {
      id: `story-${roomId}-01`,
      roomId,
      category: 'FOUNDING',
      title: 'Room Commissioning',
      dateOrPeriod: 'January 2025',
      summary: 'Commissioned under the accredited Lagos Yaba accommodation program.',
      attributedTo: 'Accommodation Operations',
      badgeLabel: 'Residency Milestone',
    },
  ];
}

export function getAlumniForRoom(roomId: string): RoomAlumniRecord[] {
  if (roomId === 'room-304') {
    return DEMO_ROOM_304_ALUMNI;
  }
  return [
    {
      id: `alumni-${roomId}-01`,
      roomId,
      fullName: 'Oluwaseun Ajayi',
      avatarInitials: 'OA',
      avatarBgColor: 'bg-blue-600 text-blue-50',
      cohort: 'Cohort 1 (2025)',
      residencyPeriod: '2025',
      publicTrackAndRole: 'Alumni Fellow · Software Engineer',
      currentStatus: 'Software Engineer @ Tech Hub',
      skills: ['React', 'TypeScript'],
      publicNote: 'Proud former occupant. Cherish the community!',
    },
  ];
}

export function getCultureForRoom(roomId: string): RoomCultureGuide {
  if (roomId === 'room-304') {
    return DEMO_ROOM_304_CULTURE;
  }
  return {
    roomId,
    roomNumber: 'Campus Room',
    quietHours: {
      weekdays: '10:30 PM – 7:00 AM',
      weekends: '11:30 PM – 8:00 AM',
      guideline: 'Quiet hours observed for peer study and sleep. Headphones required for media.',
    },
    cleaningRhythm: {
      schedule: 'Weekly Rotation',
      areas: ['Desk cleaning', 'Floor sweeping', 'Trash disposal'],
      notes: 'Equal participation expected.',
    },
    powerAndInverterProtocol: {
      summary: 'Inverter Backup Circuit',
      guideline: 'Desks wired to inverter for continuous study. Avoid high-draw appliances.',
    },
    sharedTraditions: [
      {
        title: 'Weekly Sync',
        description: 'Casual catch-up on study goals and living space comfort.',
        cadence: 'Weekly',
      },
    ],
    communityPledge: 'Committed to mutual respect, shared responsibility, and peer support.',
  };
}
