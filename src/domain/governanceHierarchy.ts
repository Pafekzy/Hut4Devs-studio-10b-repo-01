/**
 * Hut4Devs Governance, Institution, Campus & Responsibility Scopes (H4D-GOV-001)
 *
 * Architecture Principles:
 * - A Fellow is the BASE MEMBER IDENTITY.
 * - Fellow is NOT an operational role category sitting beside Room Captain / Coordinator / Admin.
 * - Scoped authority is organized strictly hierarchically:
 *   INSTITUTION -> CAMPUS -> RESPONSIBILITY CATEGORY -> ASSIGNED PERSON / ROOM -> DEV PREVIEW
 * - Authority is scoped, never universal.
 * - Emmanuel Ukom is Lagos Yaba Coordinator ONLY.
 * - Semicolon has its own campuses including JUNO accommodation.
 * - Decagon & GoMyCode have independent scopes.
 */

import { MemberRole } from './auth';

export interface Institution {
  id: string;
  name: string;
  code: string;
  tagline: string;
  description: string;
  campusesCount: number;
  logoBadge?: string;
  isPrimary?: boolean;
}

export interface Campus {
  id: string;
  institutionId: string;
  name: string;
  stateOrRegion: string;
  description: string;
  accommodationSpacesCount: number;
  activeCaptainsCount: number;
  coordinatorAssigned: boolean;
}

export interface AccommodationSpace {
  id: string;
  campusId: string;
  institutionId: string;
  name: string;
  monthlyCommitment: number;
  address: string;
  floorsCount: number;
  roomsCount: number;
}

export interface RoomCaptainAssignment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  institutionId: string;
  campusId: string;
  campusName: string;
  accommodationSpaceId: string;
  accommodationSpaceName: string;
  roomNumber: string;
  floor: string;
  delegatedBy: string;
  status: 'ACTIVE' | 'DELEGATED' | 'TEMPORARY_COVERAGE';
  assignedAt: string;
}

export interface CoordinatorAssignment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  institutionId: string;
  campusId: string;
  campusName: string;
  title: string;
  scopeDescription: string;
  status: 'ACTIVE' | 'UNASSIGNED';
  assignedAt?: string;
}

export interface AdministrationAssignment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  institutionId: string;
  campusId: string;
  campusName: string;
  responsibilityType: 'FINANCIAL_ADMIN' | 'WELFARE_MEDIATION_OFFICER';
  roleTitle: string;
  description: string;
  status: 'ACTIVE' | 'UNASSIGNED';
}

/* ============================================================
 * 1. INSTITUTIONS SEED
 * ============================================================ */
export const INSTITUTIONS_SEED: Institution[] = [
  {
    id: 'inst-learn2earn',
    name: 'Learn2Earn',
    code: 'L2E',
    tagline: 'Developer Fellowship & Residency Program',
    description: 'Tech skill acceleration and community-governed residency ecosystem.',
    campusesCount: 7,
    logoBadge: 'L2E',
    isPrimary: true,
  },
  {
    id: 'inst-semicolon',
    name: 'Semicolon',
    code: 'SC',
    tagline: 'Software Engineering & Enterprise Village',
    description: 'Immersive engineering village with dedicated residential spaces including JUNO.',
    campusesCount: 3,
    logoBadge: 'SC',
  },
  {
    id: 'inst-decagon',
    name: 'Decagon',
    code: 'DEC',
    tagline: 'Elite Software Engineering Institute',
    description: 'Intensive software development institute with dedicated accommodation clusters.',
    campusesCount: 3,
    logoBadge: 'DEC',
  },
  {
    id: 'inst-gomycode',
    name: 'GoMyCode',
    code: 'GMC',
    tagline: 'Digital Skills & Tech Academy Hub',
    description: 'Interactive digital academy with collaborative residency spaces across West Africa.',
    campusesCount: 3,
    logoBadge: 'GMC',
  },
];

/* ============================================================
 * 2. CAMPUSES SEED
 * Learn2Earn has exactly 7 independent campuses:
 * - Lagos Yaba
 * - Lagos Ikeja
 * - Otukpo
 * - Port Harcourt
 * - Abuja
 * - Ilorin
 * - Kwara
 * ============================================================ */
export const CAMPUSES_SEED: Record<string, Campus[]> = {
  'inst-learn2earn': [
    {
      id: 'campus-l2e-lagos-yaba',
      institutionId: 'inst-learn2earn',
      name: 'Lagos Yaba',
      stateOrRegion: 'Lagos State',
      description: 'Primary tech corridor hub & developer accommodation cluster in Yaba.',
      accommodationSpacesCount: 4,
      activeCaptainsCount: 4,
      coordinatorAssigned: true,
    },
    {
      id: 'campus-l2e-lagos-ikeja',
      institutionId: 'inst-learn2earn',
      name: 'Lagos Ikeja',
      stateOrRegion: 'Lagos State',
      description: 'Mainland enterprise campus & senior fellow residency.',
      accommodationSpacesCount: 2,
      activeCaptainsCount: 2,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-l2e-otukpo',
      institutionId: 'inst-learn2earn',
      name: 'Otukpo',
      stateOrRegion: 'Benue State',
      description: 'North-Central tech acceleration & rural innovation residency.',
      accommodationSpacesCount: 2,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-l2e-port-harcourt',
      institutionId: 'inst-learn2earn',
      name: 'Port Harcourt',
      stateOrRegion: 'Rivers State',
      description: 'South-South technology & cloud infrastructure fellowship center.',
      accommodationSpacesCount: 2,
      activeCaptainsCount: 2,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-l2e-abuja',
      institutionId: 'inst-learn2earn',
      name: 'Abuja',
      stateOrRegion: 'FCT Abuja',
      description: 'Federal capital innovation hub & public sector tech residency.',
      accommodationSpacesCount: 2,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-l2e-ilorin',
      institutionId: 'inst-learn2earn',
      name: 'Ilorin',
      stateOrRegion: 'Kwara State',
      description: 'University town technology ecosystem & residential learning cluster.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-l2e-kwara',
      institutionId: 'inst-learn2earn',
      name: 'Kwara',
      stateOrRegion: 'Kwara State',
      description: 'Regional distributed developers cluster & extended residency hub.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
  ],
  'inst-semicolon': [
    {
      id: 'campus-sc-yaba-juno',
      institutionId: 'inst-semicolon',
      name: 'Semicolon Village (JUNO Residence)',
      stateOrRegion: 'Lagos State',
      description: 'Flagship tech village with dedicated JUNO residential facility.',
      accommodationSpacesCount: 3,
      activeCaptainsCount: 3,
      coordinatorAssigned: true,
    },
    {
      id: 'campus-sc-lekki',
      institutionId: 'inst-semicolon',
      name: 'Lagos Lekki Innovation Hub',
      stateOrRegion: 'Lagos State',
      description: 'Island enterprise campus and engineering residential labs.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-sc-abuja',
      institutionId: 'inst-semicolon',
      name: 'Abuja Capital Hub',
      stateOrRegion: 'FCT Abuja',
      description: 'Northern enterprise training & fellow accommodation suites.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 0,
      coordinatorAssigned: false,
    },
  ],
  'inst-decagon': [
    {
      id: 'campus-dec-sangotedo',
      institutionId: 'inst-decagon',
      name: 'Sangotedo Campus (Lagos)',
      stateOrRegion: 'Lagos State',
      description: 'Comprehensive software engineering residential campus with hostel blocks.',
      accommodationSpacesCount: 3,
      activeCaptainsCount: 3,
      coordinatorAssigned: true,
    },
    {
      id: 'campus-dec-benin',
      institutionId: 'inst-decagon',
      name: 'Benin City Campus',
      stateOrRegion: 'Edo State',
      description: 'Edo state tech cluster & developer residency hall.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-dec-enugu',
      institutionId: 'inst-decagon',
      name: 'Enugu Innovation Hub',
      stateOrRegion: 'Enugu State',
      description: 'South-East software engineering cluster with residential suites.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
  ],
  'inst-gomycode': [
    {
      id: 'campus-gmc-lagos',
      institutionId: 'inst-gomycode',
      name: 'Lagos Hackerspace (Yaba)',
      stateOrRegion: 'Lagos State',
      description: 'Central digital development academy & student residence.',
      accommodationSpacesCount: 2,
      activeCaptainsCount: 2,
      coordinatorAssigned: true,
    },
    {
      id: 'campus-gmc-abuja',
      institutionId: 'inst-gomycode',
      name: 'Abuja City Hub',
      stateOrRegion: 'FCT Abuja',
      description: 'Federal capital skills lab and co-living units.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 1,
      coordinatorAssigned: false,
    },
    {
      id: 'campus-gmc-ibadan',
      institutionId: 'inst-gomycode',
      name: 'Ibadan Tech Hub',
      stateOrRegion: 'Oyo State',
      description: 'South-West digital talent center & student apartments.',
      accommodationSpacesCount: 1,
      activeCaptainsCount: 0,
      coordinatorAssigned: false,
    },
  ],
};

/* ============================================================
 * 3. ACCOMMODATION SPACES (BUILDINGS/PROPERTIES)
 * ============================================================ */
export const ACCOMMODATION_SPACES_SEED: Record<string, AccommodationSpace[]> = {
  'campus-l2e-lagos-yaba': [
    {
      id: 'space-ig',
      campusId: 'campus-l2e-lagos-yaba',
      institutionId: 'inst-learn2earn',
      name: 'Infinite Grace Apartment',
      monthlyCommitment: 66000,
      address: 'Plot 4, Tech Innovation Hub Way, Yaba, Lagos',
      floorsCount: 3,
      roomsCount: 12,
    },
    {
      id: 'space-br',
      campusId: 'campus-l2e-lagos-yaba',
      institutionId: 'inst-learn2earn',
      name: 'BedRock Hostel',
      monthlyCommitment: 77000,
      address: 'Block B, Academic Heights, Yaba, Lagos',
      floorsCount: 4,
      roomsCount: 16,
    },
    {
      id: 'space-mb',
      campusId: 'campus-l2e-lagos-yaba',
      institutionId: 'inst-learn2earn',
      name: 'MainBase Apartment',
      monthlyCommitment: 70000,
      address: '12 MainBase Avenue, Yaba, Lagos',
      floorsCount: 2,
      roomsCount: 8,
    },
    {
      id: 'space-th',
      campusId: 'campus-l2e-lagos-yaba',
      institutionId: 'inst-learn2earn',
      name: 'Tangerine Hotel',
      monthlyCommitment: 140000,
      address: 'Tangerine Residency Boulevard, Yaba, Lagos',
      floorsCount: 4,
      roomsCount: 20,
    },
  ],
  'campus-sc-yaba-juno': [
    {
      id: 'space-juno-residence',
      campusId: 'campus-sc-yaba-juno',
      institutionId: 'inst-semicolon',
      name: 'JUNO Residence (Semicolon Village)',
      monthlyCommitment: 85000,
      address: 'Semicolon Innovation Way, 312 Herbert Macaulay, Yaba',
      floorsCount: 4,
      roomsCount: 24,
    },
    {
      id: 'space-sc-annex',
      campusId: 'campus-sc-yaba-juno',
      institutionId: 'inst-semicolon',
      name: 'Alpha Engineering Quarters',
      monthlyCommitment: 75000,
      address: 'Commercial Avenue, Yaba',
      floorsCount: 2,
      roomsCount: 10,
    },
  ],
};

/* ============================================================
 * 4. LAGOS YABA: ROOM CAPTAINS SEED
 * ============================================================ */
export const ROOM_CAPTAINS_SEED: Record<string, RoomCaptainAssignment[]> = {
  'campus-l2e-lagos-yaba': [
    {
      id: 'rc-l2e-yaba-01',
      memberId: 'member-chinedu-captain',
      memberName: 'Chinedu Okeke',
      memberEmail: 'chinedu@infinitegrace.local',
      institutionId: 'inst-learn2earn',
      campusId: 'campus-l2e-lagos-yaba',
      campusName: 'Lagos Yaba',
      accommodationSpaceId: 'space-ig',
      accommodationSpaceName: 'Infinite Grace Apartment',
      roomNumber: 'Room 304',
      floor: 'Floor 3',
      delegatedBy: 'L2E Accommodation Fellows Coordinator (Emmanuel Ukom)',
      status: 'ACTIVE',
      assignedAt: '2026-08-01',
    },
    {
      id: 'rc-l2e-yaba-02',
      memberId: 'member-favour-captain',
      memberName: 'Favour Adebayo',
      memberEmail: 'favour.adebayo@infinitegrace.local',
      institutionId: 'inst-learn2earn',
      campusId: 'campus-l2e-lagos-yaba',
      campusName: 'Lagos Yaba',
      accommodationSpaceId: 'space-ig',
      accommodationSpaceName: 'Infinite Grace Apartment',
      roomNumber: 'Room 3B',
      floor: 'Floor 3',
      delegatedBy: 'L2E Accommodation Fellows Coordinator (Emmanuel Ukom)',
      status: 'ACTIVE',
      assignedAt: '2026-08-15',
    },
    {
      id: 'rc-l2e-yaba-03',
      memberId: 'member-nonso-captain',
      memberName: 'Nonso Okafor',
      memberEmail: 'nonso.okafor@bedrock.local',
      institutionId: 'inst-learn2earn',
      campusId: 'campus-l2e-lagos-yaba',
      campusName: 'Lagos Yaba',
      accommodationSpaceId: 'space-br',
      accommodationSpaceName: 'BedRock Hostel',
      roomNumber: 'Room 201',
      floor: 'Floor 2',
      delegatedBy: 'L2E Accommodation Fellows Coordinator (Emmanuel Ukom)',
      status: 'ACTIVE',
      assignedAt: '2026-08-10',
    },
    {
      id: 'rc-l2e-yaba-04',
      memberId: 'member-babatunde-captain',
      memberName: 'Babatunde Adeleke',
      memberEmail: 'babatunde.adeleke@mainbase.local',
      institutionId: 'inst-learn2earn',
      campusId: 'campus-l2e-lagos-yaba',
      campusName: 'Lagos Yaba',
      accommodationSpaceId: 'space-mb',
      accommodationSpaceName: 'MainBase Apartment',
      roomNumber: 'Room 12',
      floor: 'Floor 1',
      delegatedBy: 'L2E Accommodation Fellows Coordinator (Emmanuel Ukom)',
      status: 'ACTIVE',
      assignedAt: '2026-08-12',
    },
  ],
  'campus-sc-yaba-juno': [
    {
      id: 'rc-sc-juno-01',
      memberId: 'member-sc-captain-01',
      memberName: 'Ibrahim Danladi',
      memberEmail: 'ibrahim@semicolon.africa',
      institutionId: 'inst-semicolon',
      campusId: 'campus-sc-yaba-juno',
      campusName: 'Semicolon Village (JUNO)',
      accommodationSpaceId: 'space-juno-residence',
      accommodationSpaceName: 'JUNO Residence',
      roomNumber: 'Room J-204',
      floor: 'Floor 2',
      delegatedBy: 'Semicolon Village Coordinator',
      status: 'ACTIVE',
      assignedAt: '2026-07-01',
    },
    {
      id: 'rc-sc-juno-02',
      memberId: 'member-sc-captain-02',
      memberName: 'Zainab Bello',
      memberEmail: 'zainab@semicolon.africa',
      institutionId: 'inst-semicolon',
      campusId: 'campus-sc-yaba-juno',
      campusName: 'Semicolon Village (JUNO)',
      accommodationSpaceId: 'space-juno-residence',
      accommodationSpaceName: 'JUNO Residence',
      roomNumber: 'Room J-310',
      floor: 'Floor 3',
      delegatedBy: 'Semicolon Village Coordinator',
      status: 'ACTIVE',
      assignedAt: '2026-07-15',
    },
  ],
};

/* ============================================================
 * 5. COORDINATOR ASSIGNMENTS SEED
 * Important Invariant: Emmanuel Ukom is Lagos Yaba Coordinator ONLY.
 * Other campuses have independent assignments or "Not Assigned".
 * ============================================================ */
export const COORDINATOR_ASSIGNMENTS_SEED: Record<string, CoordinatorAssignment | null> = {
  'campus-l2e-lagos-yaba': {
    id: 'coord-l2e-yaba',
    memberId: 'member-coordinator-current',
    memberName: 'Emmanuel Ukom',
    memberEmail: 'coordinator@hut4devs.local',
    institutionId: 'inst-learn2earn',
    campusId: 'campus-l2e-lagos-yaba',
    campusName: 'Lagos Yaba',
    title: 'Fellow Accommodation Coordinator',
    scopeDescription: 'Coordination, room captain delegations & resident onboarding for Lagos Yaba.',
    status: 'ACTIVE',
    assignedAt: '2026-06-01',
  },
  'campus-l2e-lagos-ikeja': null,
  'campus-l2e-otukpo': null,
  'campus-l2e-port-harcourt': null,
  'campus-l2e-abuja': null,
  'campus-l2e-ilorin': null,
  'campus-l2e-kwara': null,
  'campus-sc-yaba-juno': {
    id: 'coord-sc-juno',
    memberId: 'member-sc-coordinator',
    memberName: 'Olamide Bakare',
    memberEmail: 'olamide@semicolon.africa',
    institutionId: 'inst-semicolon',
    campusId: 'campus-sc-yaba-juno',
    campusName: 'Semicolon Village (JUNO Residence)',
    title: 'Fellow Accommodation Coordinator',
    scopeDescription: 'Overseeing JUNO residential village, onboarding cohorts, & room governance.',
    status: 'ACTIVE',
    assignedAt: '2026-05-15',
  },
  'campus-dec-sangotedo': {
    id: 'coord-dec-sangotedo',
    memberId: 'member-dec-coordinator',
    memberName: 'Chukwuma Eze',
    memberEmail: 'c.eze@decagon.institute',
    institutionId: 'inst-decagon',
    campusId: 'campus-dec-sangotedo',
    campusName: 'Sangotedo Campus (Lagos)',
    title: 'Fellow Accommodation Coordinator',
    scopeDescription: 'Decagon software engineering residential blocks coordination.',
    status: 'ACTIVE',
    assignedAt: '2026-04-10',
  },
  'campus-gmc-lagos': {
    id: 'coord-gmc-lagos',
    memberId: 'member-gmc-coordinator',
    memberName: 'Khadijah Sanusi',
    memberEmail: 'khadijah@gomycode.co',
    institutionId: 'inst-gomycode',
    campusId: 'campus-gmc-lagos',
    campusName: 'Lagos Hackerspace (Yaba)',
    title: 'Fellow Accommodation Coordinator',
    scopeDescription: 'GoMyCode Lagos hacker living units and peer accountability.',
    status: 'ACTIVE',
    assignedAt: '2026-06-20',
  },
};

/* ============================================================
 * 6. ACCOMMODATION ADMINISTRATION SEED
 * Contains:
 * 1. Financial Admin (Monthly accommodation financial accountability)
 * 2. Accommodation Welfare & Mediation Officer (Welfare, mediation, facility advocacy)
 * ============================================================ */
export const ADMINISTRATION_ASSIGNMENTS_SEED: Record<string, AdministrationAssignment[]> = {
  'campus-l2e-lagos-yaba': [
    {
      id: 'admin-l2e-financial',
      memberId: 'member-admin-current',
      memberName: 'Amara Nwosu',
      memberEmail: 'admin@infinitegrace.local',
      institutionId: 'inst-learn2earn',
      campusId: 'campus-l2e-lagos-yaba',
      campusName: 'Lagos Yaba',
      responsibilityType: 'FINANCIAL_ADMIN',
      roleTitle: 'Accommodation Financial Admin',
      description:
        'Financial accountability authority: monthly commitments, payment reconciliation, BMONI verification, and contextual financial communication.',
      status: 'ACTIVE',
    },
    {
      id: 'admin-l2e-welfare-mediation',
      memberId: 'member-welfare-mediation-officer',
      memberName: 'Arc. Olumide Adeleke',
      memberEmail: 'mediation@hut4devs.local',
      institutionId: 'inst-learn2earn',
      campusId: 'campus-l2e-lagos-yaba',
      campusName: 'Lagos Yaba',
      responsibilityType: 'WELFARE_MEDIATION_OFFICER',
      roleTitle: 'Accommodation Welfare & Mediation Officer',
      description:
        'Receives accommodation welfare concerns, mediates resident disputes, surfaces quality-of-living issues to facility stakeholders, and leads restorative mediation distinct from financial administration.',
      status: 'ACTIVE',
    },
  ],
  'campus-sc-yaba-juno': [
    {
      id: 'admin-sc-financial',
      memberId: 'member-sc-finance',
      memberName: 'Folake Adeleke',
      memberEmail: 'finance@semicolon.africa',
      institutionId: 'inst-semicolon',
      campusId: 'campus-sc-yaba-juno',
      campusName: 'Semicolon Village (JUNO Residence)',
      responsibilityType: 'FINANCIAL_ADMIN',
      roleTitle: 'Accommodation Financial Admin',
      description: 'Financial administration for JUNO and Semicolon residential quarters.',
      status: 'ACTIVE',
    },
    {
      id: 'admin-sc-welfare',
      memberId: 'member-sc-welfare',
      memberName: 'Dr. Kehinde Adeyemi',
      memberEmail: 'welfare@semicolon.africa',
      institutionId: 'inst-semicolon',
      campusId: 'campus-sc-yaba-juno',
      campusName: 'Semicolon Village (JUNO Residence)',
      responsibilityType: 'WELFARE_MEDIATION_OFFICER',
      roleTitle: 'Accommodation Welfare & Mediation Officer',
      description: 'Resident student wellbeing and facility mediation officer.',
      status: 'ACTIVE',
    },
  ],
};
