import { Member, MemberRole } from './auth';

/**
 * ============================================================
 * HUT4DEVS — MEMBERSHIP, SCOPED ROLES & DELEGATIONS DOMAIN
 * ============================================================
 *
 * Core Product Principle:
 * "REGISTRATION IS NOT ROLE SELECTION."
 * Registration establishes: IDENTITY
 * Approval establishes: MEMBERSHIP
 * Delegation establishes: AUTHORITY / RESPONSIBILITY
 *
 * "One Member Identity, Multiple Historical Accommodation Assignments."
 */

export interface AccommodationProperty {
  id: string;
  name: string;
  monthlyCommitment: number;
  floorsCount: number;
  roomsCount: number;
  description: string;
  location: string;
}

export const ACCOMMODATION_PROPERTIES: AccommodationProperty[] = [
  {
    id: 'prop-infinite-grace',
    name: 'Infinite Grace Apartment',
    monthlyCommitment: 66000,
    floorsCount: 3,
    roomsCount: 12,
    description: 'Accredited developer co-living hub, Infinite Grace Apartment.',
    location: 'Plot 4, Tech Innovation Hub Way',
  },
  {
    id: 'prop-bedrock-hostel',
    name: 'BedRock Hostel',
    monthlyCommitment: 77000,
    floorsCount: 4,
    roomsCount: 16,
    description: 'Full-service developer accommodation with backup power.',
    location: 'Block B, Academic Heights',
  },
  {
    id: 'prop-mainbase-apt',
    name: 'MainBase Apartment',
    monthlyCommitment: 70000,
    floorsCount: 2,
    roomsCount: 8,
    description: 'Quiet study & residency cluster for senior interns & fellows.',
    location: '12 MainBase Avenue',
  },
  {
    id: 'prop-tangerine-hotel',
    name: 'Tangerine Hotel',
    monthlyCommitment: 140000,
    floorsCount: 4,
    roomsCount: 20,
    description: 'Executive serviced apartment & residency suites.',
    location: 'Tangerine Residency Boulevard',
  },
];

export interface AccommodationAssignment {
  id: string;
  memberId: string;
  propertyId: string;
  propertyName: string;
  floorId?: string;
  floorName?: string;
  roomId: string;
  roomName: string;
  monthlyCommitment: number;
  status: 'ACTIVE' | 'PREVIOUS' | 'TRANSFERRED';
  period: string; // e.g. "Sep 2026 – Nov 2026"
  startDate: string;
  endDate?: string;
}

export interface ScopedRoleAssignment {
  id: string;
  memberId: string;
  role: MemberRole;
  scope: {
    propertyId?: string;
    propertyName?: string;
    floorId?: string;
    floorName?: string;
    roomId?: string;
    roomName?: string;
    programCommunity?: string;
  };
  delegatedBy?: string; // e.g. "L2E Accommodation Fellows Coordinator"
  delegatedByName?: string;
  assignedBy?: string;
  assignedAt?: string;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  revokedAt?: string;
}

export type MembershipRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DELEGATED'
  | 'ROOM_VERIFICATION_DELEGATED'
  | 'NEEDS_CLARIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'TRANSFER_RECOGNIZED';

export interface RoomVerificationDelegation {
  id: string;
  membershipRequestId: string;
  delegatedBy: string; // "L2E Accommodation Fellows Coordinator"
  delegatedToMemberId: string; // e.g. "member-chinedu-captain"
  delegatedToName: string; // "Chinedu Okeke"
  responsibility: string; // "Verify Room 304 Occupancy / Assignment"
  scope: {
    propertyId: string;
    propertyName: string;
    roomId: string;
    roomName: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'CANNOT_CONFIRM' | 'NOTE_SENT';
  captainNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AccommodationMembershipRequest {
  id: string;
  memberId?: string; // Set when an existing Fellow is recognized
  h4dMemberId?: string; // e.g. "H4D-00021"
  fullName: string;
  email: string;
  phone?: string;
  githubHandle?: string;
  programCommunity: string; // e.g. "L2E (Learn to Earn) Dev Cohort"
  propertyId: string;
  propertyName: string;
  floorName?: string;
  roomName: string;
  monthlyCommitment: number;
  status: MembershipRequestStatus;
  isExistingFellowRecognized: boolean;
  previousAccommodation?: {
    propertyName: string;
    roomName: string;
    period: string;
  };
  delegation?: RoomVerificationDelegation;
  delegatedCaptainId?: string;
  delegatedCaptainName?: string;
  clarificationNote?: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ResponsibilityMessage {
  id: string;
  responsibilityId: string;
  fellowId: string;
  senderId: string;
  senderName: string;
  senderRole: string; // "Accommodation Financial Admin", "Fellow", or "L2E Accommodation Fellows Coordinator"
  actingCapacity?: string; // e.g. "L2E Accommodation Fellows Coordinator (Financial Coverage)"
  content: string;
  createdAt: string;
}

export type ActiveMode =
  | 'FELLOW'
  | 'ROOM_CAPTAIN'
  | 'COORDINATOR'
  | 'CAPTAIN_COVERAGE'
  | 'FINANCIAL_COVERAGE'
  | 'FINANCIAL_ADMIN'
  | 'WELFARE_OFFICER';

/**
 * Derives available modes from: member roles + scoped assignments.
 * NEVER hardcoded by name or email.
 */
export function getAvailableModesForMember(
  member: Member | null,
  roleAssignments: ScopedRoleAssignment[] = []
): ActiveMode[] {
  if (!member) return [];

  // Welfare & Mediation Officer lands directly in Welfare & Mediation workspace with NO Coordinator authority
  if (member.roles.includes(MemberRole.ACCOMMODATION_WELFARE_OFFICER)) {
    return ['WELFARE_OFFICER'];
  }

  // Financial Admin role lands directly in Financial Admin workspace with NO mode switcher
  if (
    member.roles.includes(MemberRole.ACCOMMODATION_ADMIN) ||
    member.roles.includes(MemberRole.ACCOMMODATION_FINANCIAL_ADMIN)
  ) {
    return ['FINANCIAL_ADMIN'];
  }

  const modes: ActiveMode[] = ['FELLOW'];

  // Accommodation Fellows Coordinator has multi-mode operational capacities
  if (member.roles.includes(MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR)) {
    modes.push('COORDINATOR', 'CAPTAIN_COVERAGE', 'FINANCIAL_COVERAGE');
  }

  // Room Captain check (from roles or scoped assignments)
  const isCaptain =
    member.roles.includes(MemberRole.ROOM_CAPTAIN) ||
    roleAssignments.some(
      (a) => a.memberId === member.id && a.role === MemberRole.ROOM_CAPTAIN && !a.revokedAt
    );

  if (isCaptain && !modes.includes('ROOM_CAPTAIN')) {
    modes.push('ROOM_CAPTAIN');
  }

  return modes;
}

export interface FormattedAttribution {
  actorName: string;
  displayLabel: string;
  actingCapacity: string;
  isCoverage: boolean;
}

/**
 * Formats visible attribution for actions according to active mode and member.
 * Preserves truth: actions done during coverage are visibly attributed to the actual actor.
 */
export function formatActionAttribution(
  member: Member,
  activeMode: ActiveMode,
  contextScope?: string
): FormattedAttribution {
  if (activeMode === 'FINANCIAL_COVERAGE') {
    return {
      actorName: member.displayName,
      displayLabel: `${member.displayName} (L2E Accommodation Fellows Coordinator)`,
      actingCapacity: 'L2E Accommodation Fellows Coordinator (Financial Admin Coverage)',
      isCoverage: true,
    };
  }

  if (activeMode === 'CAPTAIN_COVERAGE') {
    return {
      actorName: member.displayName,
      displayLabel: `${member.displayName} (L2E Accommodation Fellows Coordinator)`,
      actingCapacity: `L2E Accommodation Fellows Coordinator (Room Captain Coverage${contextScope ? ` — ${contextScope}` : ''})`,
      isCoverage: true,
    };
  }

  if (activeMode === 'ROOM_CAPTAIN') {
    return {
      actorName: member.displayName,
      displayLabel: `${member.displayName} (Room Captain)`,
      actingCapacity: `Room Captain${contextScope ? ` — ${contextScope}` : ''}`,
      isCoverage: false,
    };
  }

  if (activeMode === 'COORDINATOR') {
    return {
      actorName: member.displayName,
      displayLabel: `${member.displayName} (L2E Accommodation Fellows Coordinator)`,
      actingCapacity: 'L2E Accommodation Fellows Coordinator',
      isCoverage: false,
    };
  }

  if (activeMode === 'FINANCIAL_ADMIN') {
    return {
      actorName: member.displayName,
      displayLabel: `${member.displayName} (Accommodation Financial Admin)`,
      actingCapacity: 'Accommodation Financial Admin',
      isCoverage: false,
    };
  }

  if (activeMode === 'WELFARE_OFFICER') {
    return {
      actorName: member.displayName,
      displayLabel: `${member.displayName} (Accommodation Welfare & Mediation Officer)`,
      actingCapacity: 'Accommodation Welfare & Mediation Officer',
      isCoverage: false,
    };
  }

  return {
    actorName: member.displayName,
    displayLabel: member.displayName,
    actingCapacity: 'Fellow',
    isCoverage: false,
  };
}

export function getDefaultModeForMember(member: Member): ActiveMode {
  const modes = getAvailableModesForMember(member);
  return modes[0] || 'FELLOW';
}

