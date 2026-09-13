import {
  AccommodationProperty,
  AccommodationAssignment,
  ScopedRoleAssignment,
  AccommodationMembershipRequest,
  ResponsibilityMessage,
  ACCOMMODATION_PROPERTIES,
} from '../domain/membership';
import { AccommodationResponsibility, ResponsibilityStatus } from '../domain/accommodation';
import { Member, MemberRole } from '../domain/auth';

/**
 * Demo Members representing canonical identities in the Hut4Devs intern community.
 */
export const DEMO_MEMBERS: Member[] = [
  // 1. Emmanuel Ukom (Fellow with Room Captain role and Coordinator coverage assignment)
  {
    id: 'member-emmanuel-fellow',
    h4dMemberId: 'H4D-00012',
    displayName: 'Emmanuel Ukom',
    email: 'emmanuel@infinitegrace.local',
    roles: [MemberRole.FELLOW, MemberRole.ROOM_CAPTAIN, MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR],
    createdAt: '2026-06-01T09:00:00Z',
  },
  // 2. Chinedu Okeke (Fellow + Room Captain for Infinite Grace, Room 304)
  {
    id: 'member-chinedu-captain',
    h4dMemberId: 'H4D-00008',
    displayName: 'Chinedu Okeke',
    email: 'chinedu.captain@infinitegrace.local',
    roles: [MemberRole.FELLOW, MemberRole.ROOM_CAPTAIN],
    createdAt: '2026-05-15T08:30:00Z',
  },
  // 3. Zainab Aliyu (L2E Accommodation Fellows Coordinator)
  {
    id: 'member-zainab-coordinator',
    h4dMemberId: 'H4D-00003',
    displayName: 'Zainab Aliyu',
    email: 'coordinator@l2e.local',
    roles: [MemberRole.FELLOW, MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR],
    createdAt: '2026-04-10T10:00:00Z',
  },
  // 4. Accommodation Financial Admin (Chief Financial Admin)
  {
    id: 'member-admin-financial',
    h4dMemberId: 'H4D-00001',
    displayName: 'Adebayo Ogunlesi',
    email: 'admin@hut4devs.local',
    roles: [MemberRole.ACCOMMODATION_ADMIN],
    createdAt: '2026-01-01T00:00:00Z',
  },
  // 5. Nonso Okafor (Existing Fellow applying for transfer)
  {
    id: 'member-nonso-transfer',
    h4dMemberId: 'H4D-00021',
    displayName: 'Nonso Okafor',
    email: 'nonso@devs.local',
    roles: [MemberRole.FELLOW],
    createdAt: '2026-07-10T11:00:00Z',
  },
];

/**
 * Historical and Active Accommodation Assignments
 * Shows "One Member Identity, Multiple Historical Accommodation Assignments"
 */
export const DEMO_ASSIGNMENTS: AccommodationAssignment[] = [
  // Emmanuel Ukom: Past in BedRock, Current in Infinite Grace
  {
    id: 'assign-emmanuel-01',
    memberId: 'member-emmanuel-fellow',
    propertyId: 'prop-bedrock-hostel',
    propertyName: 'BedRock Hostel',
    floorName: 'Floor 2',
    roomId: 'room-201',
    roomName: 'Room 201',
    monthlyCommitment: 77000,
    status: 'PREVIOUS',
    period: 'Jan 2026 – May 2026',
    startDate: '2026-01-05T00:00:00Z',
    endDate: '2026-05-31T00:00:00Z',
  },
  {
    id: 'assign-emmanuel-02',
    memberId: 'member-emmanuel-fellow',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 3',
    roomId: 'room-304',
    roomName: 'Room 304',
    monthlyCommitment: 66000,
    status: 'ACTIVE',
    period: 'Jun 2026 – Present',
    startDate: '2026-06-01T00:00:00Z',
  },
  // Chinedu Okeke: Room Captain in Room 304
  {
    id: 'assign-chinedu-01',
    memberId: 'member-chinedu-captain',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 3',
    roomId: 'room-304',
    roomName: 'Room 304',
    monthlyCommitment: 66000,
    status: 'ACTIVE',
    period: 'May 2026 – Present',
    startDate: '2026-05-15T00:00:00Z',
  },
  // Nonso Okafor: Current in BedRock, transferring to Infinite Grace
  {
    id: 'assign-nonso-01',
    memberId: 'member-nonso-transfer',
    propertyId: 'prop-bedrock-hostel',
    propertyName: 'BedRock Hostel',
    floorName: 'Floor 1',
    roomId: 'room-104',
    roomName: 'Room 104',
    monthlyCommitment: 77000,
    status: 'ACTIVE',
    period: 'Jul 2026 – Present',
    startDate: '2026-07-10T00:00:00Z',
  },
];

/**
 * Scoped Role Assignments
 * Authority delegated through specific scopes.
 */
export const DEMO_SCOPED_ROLES: ScopedRoleAssignment[] = [
  // Chinedu Okeke is Room Captain for Infinite Grace Room 304
  {
    id: 'role-chinedu-rc-304',
    memberId: 'member-chinedu-captain',
    role: MemberRole.ROOM_CAPTAIN,
    scope: {
      propertyId: 'prop-infinite-grace',
      propertyName: 'Infinite Grace Apartment',
      floorName: 'Floor 3',
      roomId: 'room-304',
      roomName: 'Room 304',
    },
    assignedBy: 'L2E Accommodation Fellows Coordinator (Zainab Aliyu)',
    assignedAt: '2026-05-16T09:00:00Z',
    isActive: true,
  },
  // Emmanuel Ukom has Room Captain authorization for Infinite Grace Room 304
  {
    id: 'role-emmanuel-rc-304',
    memberId: 'member-emmanuel-fellow',
    role: MemberRole.ROOM_CAPTAIN,
    scope: {
      propertyId: 'prop-infinite-grace',
      propertyName: 'Infinite Grace Apartment',
      floorName: 'Floor 3',
      roomId: 'room-304',
      roomName: 'Room 304',
    },
    assignedBy: 'L2E Accommodation Fellows Coordinator (Zainab Aliyu)',
    assignedAt: '2026-06-05T10:00:00Z',
    isActive: true,
  },
  // Zainab Aliyu is Accommodation Fellows Coordinator for the L2E cohort
  {
    id: 'role-zainab-coord',
    memberId: 'member-zainab-coordinator',
    role: MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR,
    scope: {
      propertyId: 'prop-infinite-grace',
      propertyName: 'Infinite Grace & Cohort Properties',
      programCommunity: 'L2E Developer Cohort',
    },
    assignedBy: 'Hut4Devs Steering Council',
    assignedAt: '2026-04-10T10:00:00Z',
    isActive: true,
  },
  // Emmanuel Ukom also has Coordinator Coverage role for L2E
  {
    id: 'role-emmanuel-coord-coverage',
    memberId: 'member-emmanuel-fellow',
    role: MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR,
    scope: {
      propertyId: 'prop-infinite-grace',
      propertyName: 'Infinite Grace Apartment',
      programCommunity: 'L2E Developer Cohort',
    },
    assignedBy: 'L2E Accommodation Fellows Coordinator (Zainab Aliyu)',
    assignedAt: '2026-08-01T10:00:00Z',
    isActive: true,
  },
  // Adebayo Ogunlesi is Accommodation Financial Admin
  {
    id: 'role-adebayo-fin-admin',
    memberId: 'member-admin-financial',
    role: MemberRole.ACCOMMODATION_ADMIN,
    scope: {
      propertyId: 'ALL',
      propertyName: 'All Accredited Properties',
    },
    assignedBy: 'Hut4Devs Core Foundation',
    assignedAt: '2026-01-01T00:00:00Z',
    isActive: true,
  },
];

/**
 * Initial Accommodation Membership Requests for Demo
 */
export const DEMO_MEMBERSHIP_REQUESTS: AccommodationMembershipRequest[] = [
  // 1. New Applicant awaiting Coordinator review
  {
    id: 'req-2026-001',
    fullName: 'Blessing Nwosu',
    email: 'blessing.nwosu@gmail.com',
    phone: '+234 803 123 4567',
    githubHandle: 'blessingnwosu',
    programCommunity: 'L2E (Learn to Earn) Dev Cohort',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 3',
    roomName: 'Room 304',
    monthlyCommitment: 66000,
    status: 'SUBMITTED',
    isExistingFellowRecognized: false,
    submittedAt: '2026-09-08T14:20:00Z',
  },
  // 2. Existing Fellow requesting accommodation transfer
  {
    id: 'req-2026-002',
    memberId: 'member-nonso-transfer',
    h4dMemberId: 'H4D-00021',
    fullName: 'Nonso Okafor',
    email: 'nonso@devs.local',
    phone: '+234 812 987 6543',
    githubHandle: 'nonso-codes',
    programCommunity: 'L2E (Learn to Earn) Dev Cohort',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 2',
    roomName: 'Room 201',
    monthlyCommitment: 66000,
    status: 'TRANSFER_RECOGNIZED',
    isExistingFellowRecognized: true,
    previousAccommodation: {
      propertyName: 'BedRock Hostel',
      roomName: 'Room 104',
      period: 'Jul 2026 – Present',
    },
    submittedAt: '2026-09-09T10:15:00Z',
  },
  // 3. Request delegated to Room Captain Chinedu for verification
  {
    id: 'req-2026-003',
    fullName: 'David Adeleke',
    email: 'david.adeleke@gmail.com',
    phone: '+234 701 456 7890',
    githubHandle: 'davidadeleke',
    programCommunity: 'L2E (Learn to Earn) Dev Cohort',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 3',
    roomName: 'Room 304',
    monthlyCommitment: 66000,
    status: 'ROOM_VERIFICATION_DELEGATED',
    isExistingFellowRecognized: false,
    delegatedCaptainId: 'member-chinedu-captain',
    delegatedCaptainName: 'Chinedu Okeke',
    submittedAt: '2026-09-07T09:30:00Z',
  },
];

/**
 * Multi-property Demo Accommodation Responsibilities for Attention-First Dashboard
 */
export const MULTI_PROPERTY_RESPONSIBILITIES: AccommodationResponsibility[] = [
  // 1. Outstanding Fellow (Infinite Grace - ₦66,000)
  {
    id: 'resp-infinite-grace-2026-09',
    fellowId: 'member-fellow-current',
    title: 'September 2026 Accommodation',
    requiredAmount: 66000,
    verifiedAmount: 0,
    status: ResponsibilityStatus.OUTSTANDING,
    period: 'September 2026',
    currency: 'NGN',
    fellow: {
      id: 'member-fellow-current',
      name: 'Emmanuel (Fellow)',
      email: 'fellow@infinitegrace.local',
    },
    accommodationContext: {
      property: {
        id: 'prop-infinite-grace',
        name: 'Infinite Grace Apartment',
        address: 'Plot 4, Tech Innovation Hub Way',
      },
      floor: {
        id: 'floor-3',
        propertyId: 'prop-infinite-grace',
        name: 'Floor 3',
        levelNumber: 3,
      },
      room: {
        id: 'room-304',
        floorId: 'floor-3',
        name: 'Room 304',
        code: 'IG-304',
      },
    },
  },
  // 2. Partially Fulfilled Fellow (Infinite Grace - ₦66,000)
  {
    id: 'resp-infinite-grace-kenechukwu-2026-09',
    fellowId: 'member-kenechukwu',
    title: 'September 2026 Accommodation',
    requiredAmount: 66000,
    verifiedAmount: 20000,
    status: ResponsibilityStatus.PARTIALLY_FULFILLED,
    period: 'September 2026',
    currency: 'NGN',
    fellow: {
      id: 'member-kenechukwu',
      name: 'Kenechukwu Obi',
      email: 'kene@infinitegrace.local',
    },
    accommodationContext: {
      property: {
        id: 'prop-infinite-grace',
        name: 'Infinite Grace Apartment',
        address: 'Plot 4, Tech Innovation Hub Way',
      },
      floor: {
        id: 'floor-2',
        propertyId: 'prop-infinite-grace',
        name: 'Floor 2',
        levelNumber: 2,
      },
      room: {
        id: 'room-202',
        floorId: 'floor-2',
        name: 'Room 202',
        code: 'IG-202',
      },
    },
  },
  // 3. Fulfilled Fellow (BedRock Hostel - ₦77,000)
  {
    id: 'resp-bedrock-fatima-2026-09',
    fellowId: 'member-fatima',
    title: 'September 2026 Accommodation',
    requiredAmount: 77000,
    verifiedAmount: 77000,
    status: ResponsibilityStatus.FULFILLED,
    period: 'September 2026',
    currency: 'NGN',
    fellow: {
      id: 'member-fatima',
      name: 'Fatima Bello',
      email: 'fatima@bedrock.local',
    },
    accommodationContext: {
      property: {
        id: 'prop-bedrock-hostel',
        name: 'BedRock Hostel',
        address: 'Block B, Academic Heights',
      },
      floor: {
        id: 'floor-1',
        propertyId: 'prop-bedrock-hostel',
        name: 'Floor 1',
        levelNumber: 1,
      },
      room: {
        id: 'room-101',
        floorId: 'floor-1',
        name: 'Room 101',
        code: 'BR-101',
      },
    },
  },
  // 4. Awaiting Reconciliation Fellow (MainBase Apartment - ₦70,000)
  {
    id: 'resp-mainbase-tunde-2026-09',
    fellowId: 'member-tunde',
    title: 'September 2026 Accommodation',
    requiredAmount: 70000,
    verifiedAmount: 0,
    status: ResponsibilityStatus.OUTSTANDING,
    period: 'September 2026',
    currency: 'NGN',
    fellow: {
      id: 'member-tunde',
      name: 'Babatunde Adeleke',
      email: 'tunde.adeleke@mainbase.local',
    },
    accommodationContext: {
      property: {
        id: 'prop-mainbase-apt',
        name: 'MainBase Apartment',
        address: '12 MainBase Avenue',
      },
      floor: {
        id: 'floor-1',
        propertyId: 'prop-mainbase-apt',
        name: 'Floor 1',
        levelNumber: 1,
      },
      room: {
        id: 'room-12',
        floorId: 'floor-1',
        name: 'Room 12',
        code: 'MB-012',
      },
    },
  },
  // 5. Mismatch / Requires Review Fellow (Tangerine Hotel - ₦140,000)
  {
    id: 'resp-tangerine-osita-2026-09',
    fellowId: 'member-osita',
    title: 'September 2026 Accommodation',
    requiredAmount: 140000,
    verifiedAmount: 0,
    status: ResponsibilityStatus.OUTSTANDING,
    period: 'September 2026',
    currency: 'NGN',
    fellow: {
      id: 'member-osita',
      name: 'Osita Ibe',
      email: 'osita.ibe@tangerine.local',
    },
    accommodationContext: {
      property: {
        id: 'prop-tangerine-hotel',
        name: 'Tangerine Hotel',
        address: 'Tangerine Residency Boulevard',
      },
      floor: {
        id: 'floor-4',
        propertyId: 'prop-tangerine-hotel',
        name: 'Floor 4',
        levelNumber: 4,
      },
      room: {
        id: 'room-402',
        floorId: 'floor-4',
        name: 'Suite 402',
        code: 'TH-402',
      },
    },
  },
];

export const INITIAL_MEMBERS = DEMO_MEMBERS;
export const INITIAL_ASSIGNMENTS = DEMO_ASSIGNMENTS;
export const INITIAL_SCOPED_ROLES = DEMO_SCOPED_ROLES;
export const INITIAL_MEMBERSHIP_REQUESTS = DEMO_MEMBERSHIP_REQUESTS;

export const DEMO_ACCOMMODATION_ASSIGNMENTS = DEMO_ASSIGNMENTS;
export const DEMO_SCOPED_ROLE_ASSIGNMENTS = DEMO_SCOPED_ROLES;

export const INITIAL_RESPONSIBILITY_MESSAGES: ResponsibilityMessage[] = [
  // Responsibility: resp-infinite-grace-2026-09
  {
    id: 'msg-01',
    responsibilityId: 'resp-infinite-grace-2026-09',
    fellowId: 'member-emmanuel-fellow',
    senderId: 'member-chinedu-captain',
    senderName: 'Chinedu Okeke (Room Captain)',
    senderRole: 'Room Captain',
    actingCapacity: 'Room Captain — Room 304 (Infinite Grace)',
    content: 'Hi Emmanuel, please remember to notify us once you submit your September transfer so we can confirm with the Coordinator.',
    createdAt: '2026-09-08T11:00:00Z',
  },
  {
    id: 'msg-02',
    responsibilityId: 'resp-infinite-grace-2026-09',
    fellowId: 'member-emmanuel-fellow',
    senderId: 'member-adebayo-admin',
    senderName: 'Adebayo Ogunlesi (Accommodation Financial Admin)',
    senderRole: 'Financial Admin',
    actingCapacity: 'Accommodation Financial Admin',
    content: 'Your latest payment evidence has been received. ₦46,000 is verified, with ₦20,000 remaining.',
    createdAt: '2026-09-09T09:15:00Z',
  },
  {
    id: 'msg-03',
    responsibilityId: 'resp-infinite-grace-2026-09',
    fellowId: 'member-emmanuel-fellow',
    senderId: 'member-emmanuel-fellow',
    senderName: 'Emmanuel Ukom',
    senderRole: 'Fellow',
    actingCapacity: 'Fellow',
    content: 'Thank you. I’ll complete the remaining amount tomorrow.',
    createdAt: '2026-09-09T09:45:00Z',
  },

  // Responsibility: resp-sept-2026 (Fellow workspace default)
  {
    id: 'msg-sept-01',
    responsibilityId: 'resp-sept-2026',
    fellowId: 'mem-1',
    senderId: 'mem-adebayo',
    senderName: 'Adebayo Ogunlesi (Accommodation Financial Admin)',
    senderRole: 'Financial Admin',
    actingCapacity: 'Accommodation Financial Admin',
    content: 'Your latest payment evidence has been received. ₦46,000 is verified, with ₦20,000 remaining.',
    createdAt: '2026-09-09T09:15:00Z',
  },
  {
    id: 'msg-sept-02',
    responsibilityId: 'resp-sept-2026',
    fellowId: 'mem-1',
    senderId: 'mem-1',
    senderName: 'Emmanuel Ukom',
    senderRole: 'Fellow',
    actingCapacity: 'Fellow',
    content: 'Thank you. I’ll complete the remaining amount tomorrow.',
    createdAt: '2026-09-09T09:45:00Z',
  },

  // Responsibility: resp-ig-01 (Command Center Emmanuel Ukom)
  {
    id: 'msg-ig01-01',
    responsibilityId: 'resp-ig-01',
    fellowId: 'mem-01',
    senderId: 'mem-adebayo',
    senderName: 'Adebayo Ogunlesi (Accommodation Financial Admin)',
    senderRole: 'Financial Admin',
    actingCapacity: 'Accommodation Financial Admin',
    content: 'Your latest payment evidence has been received. ₦46,000 is verified, with ₦20,000 remaining.',
    createdAt: '2026-09-09T09:15:00Z',
  },
  {
    id: 'msg-ig01-02',
    responsibilityId: 'resp-ig-01',
    fellowId: 'mem-01',
    senderId: 'mem-01',
    senderName: 'Emmanuel Ukom',
    senderRole: 'Fellow',
    actingCapacity: 'Fellow',
    content: 'Thank you. I’ll complete the remaining amount tomorrow.',
    createdAt: '2026-09-09T09:45:00Z',
  },
];

export const DEMO_RESPONSIBILITY_MESSAGES = INITIAL_RESPONSIBILITY_MESSAGES;

