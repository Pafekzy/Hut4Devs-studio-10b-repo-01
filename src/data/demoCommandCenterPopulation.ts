import {
  AccommodationResponsibility,
  ResponsibilityStatus,
} from '../domain/accommodation';
import { AdminProviderEventDisplay } from '../components/AccommodationAdminView';

export interface CommandCenterFellowInfo {
  id: string;
  name: string;
  email: string;
  property: string;
  floor: string;
  room: string;
}

/**
 * Believable 24 Fellows Population for Accommodation Admin Command Center (H4D-DEMO-003)
 * Exactly 24 unique Fellows across 4 Accredited Properties:
 * - Infinite Grace Apartments (₦66,000/mo) - 8 Fellows
 * - BedRock Hostel (₦77,000/mo) - 6 Fellows
 * - MainBase Apartment (₦70,000/mo) - 6 Fellows
 * - Tangerine Hotel (₦140,000/mo) - 4 Fellows
 *
 * Base Distribution:
 * - FULFILLED: 17 Fellows
 * - OUTSTANDING: 4 Fellows
 * - PARTIALLY FULFILLED: 3 Fellows
 * Total = 24 unique Fellows
 *
 * Attention Overlays (mutually compatible with Outstanding / Partially Fulfilled, never Fulfilled):
 * - AWAITING RECONCILIATION: 4 Fellows / events
 * - MISMATCH / REQUIRES REVIEW: 3 Fellows / events
 */
export const DEMO_COMMAND_CENTER_FELLOWS: CommandCenterFellowInfo[] = [
  // 1. OUTSTANDING + AWAITING RECONCILIATION (Fellow A)
  {
    id: 'fellow-ig-01',
    name: 'Emmanuel Ukom',
    email: 'emmanuel.ukom@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 3',
    room: 'Room 304',
  },
  // 2. OUTSTANDING + AWAITING RECONCILIATION
  {
    id: 'fellow-br-01',
    name: 'Nonso Okafor',
    email: 'nonso.okafor@bedrock.local',
    property: 'BedRock Hostel',
    floor: 'Floor 2',
    room: 'Room 201',
  },
  // 3. OUTSTANDING + MISMATCH / REQUIRES REVIEW
  {
    id: 'fellow-mb-01',
    name: 'Babatunde Adeleke',
    email: 'babatunde.adeleke@mainbase.local',
    property: 'MainBase Apartment',
    floor: 'Floor 1',
    room: 'Room 12',
  },
  // 4. OUTSTANDING (Purely overdue / outstanding commitment)
  {
    id: 'fellow-th-01',
    name: 'Osita Ibe',
    email: 'osita.ibe@tangerine.local',
    property: 'Tangerine Hotel',
    floor: 'Floor 4',
    room: 'Suite 402',
  },

  // 5. PARTIALLY FULFILLED + AWAITING RECONCILIATION
  {
    id: 'fellow-ig-02',
    name: 'Kenechukwu Obi',
    email: 'kenechukwu.obi@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 2',
    room: 'Room 202',
  },
  // 6. PARTIALLY FULFILLED + MISMATCH / REQUIRES REVIEW (Fellow B)
  {
    id: 'fellow-th-02',
    name: 'Amaka Eze',
    email: 'amaka.eze@tangerine.local',
    property: 'Tangerine Hotel',
    floor: 'Floor 2',
    room: 'Suite 205',
  },
  // 7. PARTIALLY FULFILLED + AWAITING RECONCILIATION + MISMATCH (Fellow C)
  {
    id: 'fellow-br-02',
    name: 'Ibrahim Musa',
    email: 'ibrahim.musa@bedrock.local',
    property: 'BedRock Hostel',
    floor: 'Floor 1',
    room: 'Room 105',
  },

  // 8-24. FULFILLED (17 Fellows)
  // Infinite Grace (6 Fulfilled)
  {
    id: 'fellow-ig-03',
    name: 'Chinedu Okeke',
    email: 'chinedu.okeke@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 1',
    room: 'Room 101',
  },
  {
    id: 'fellow-ig-04',
    name: 'Damilola Adebayo',
    email: 'damilola.adebayo@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 1',
    room: 'Room 102',
  },
  {
    id: 'fellow-ig-05',
    name: 'Somtochukwu Nwosu',
    email: 'somtochukwu.nwosu@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 2',
    room: 'Room 201',
  },
  {
    id: 'fellow-ig-06',
    name: 'Blessing Nnamdi',
    email: 'blessing.nnamdi@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 2',
    room: 'Room 203',
  },
  {
    id: 'fellow-ig-07',
    name: 'Precious Danjuma',
    email: 'precious.danjuma@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 3',
    room: 'Room 301',
  },
  {
    id: 'fellow-ig-08',
    name: 'Victor Chukwu',
    email: 'victor.chukwu@infinitegrace.local',
    property: 'Infinite Grace Apartments',
    floor: 'Floor 3',
    room: 'Room 302',
  },

  // BedRock Hostel (4 Fulfilled)
  {
    id: 'fellow-br-03',
    name: 'Fatima Bello',
    email: 'fatima.bello@bedrock.local',
    property: 'BedRock Hostel',
    floor: 'Floor 1',
    room: 'Room 101',
  },
  {
    id: 'fellow-br-04',
    name: 'Emeka Anyanwu',
    email: 'emeka.anyanwu@bedrock.local',
    property: 'BedRock Hostel',
    floor: 'Floor 1',
    room: 'Room 102',
  },
  {
    id: 'fellow-br-05',
    name: 'Halima Abubakar',
    email: 'halima.abubakar@bedrock.local',
    property: 'BedRock Hostel',
    floor: 'Floor 2',
    room: 'Room 202',
  },
  {
    id: 'fellow-br-06',
    name: 'Kayode Williams',
    email: 'kayode.williams@bedrock.local',
    property: 'BedRock Hostel',
    floor: 'Floor 2',
    room: 'Room 204',
  },

  // MainBase Apartment (5 Fulfilled)
  {
    id: 'fellow-mb-02',
    name: 'Aisha Mohammed',
    email: 'aisha.mohammed@mainbase.local',
    property: 'MainBase Apartment',
    floor: 'Floor 1',
    room: 'Room 11',
  },
  {
    id: 'fellow-mb-03',
    name: 'Samuel Ogundipe',
    email: 'samuel.ogundipe@mainbase.local',
    property: 'MainBase Apartment',
    floor: 'Floor 1',
    room: 'Room 14',
  },
  {
    id: 'fellow-mb-04',
    name: 'Ngozi Ezeh',
    email: 'ngozi.ezeh@mainbase.local',
    property: 'MainBase Apartment',
    floor: 'Floor 2',
    room: 'Room 21',
  },
  {
    id: 'fellow-mb-05',
    name: 'Tariq Sanusi',
    email: 'tariq.sanusi@mainbase.local',
    property: 'MainBase Apartment',
    floor: 'Floor 2',
    room: 'Room 22',
  },
  {
    id: 'fellow-mb-06',
    name: 'Kehinde Balogun',
    email: 'kehinde.balogun@mainbase.local',
    property: 'MainBase Apartment',
    floor: 'Floor 2',
    room: 'Room 25',
  },

  // Tangerine Hotel (2 Fulfilled)
  {
    id: 'fellow-th-03',
    name: 'Chiamaka Nnaji',
    email: 'chiamaka.nnaji@tangerine.local',
    property: 'Tangerine Hotel',
    floor: 'Floor 1',
    room: 'Suite 101',
  },
  {
    id: 'fellow-th-04',
    name: 'Oluwaseun Bakare',
    email: 'oluwaseun.bakare@tangerine.local',
    property: 'Tangerine Hotel',
    floor: 'Floor 3',
    room: 'Suite 301',
  },
];

// Helper to build a complete AccommodationResponsibility object
function buildResp(
  id: string,
  fellowId: string,
  fellowName: string,
  fellowEmail: string,
  propId: string,
  propName: string,
  propAddress: string,
  floorId: string,
  floorName: string,
  roomId: string,
  roomName: string,
  roomCode: string,
  requiredAmount: number,
  verifiedAmount: number,
  status: ResponsibilityStatus
): AccommodationResponsibility {
  return {
    id,
    fellowId,
    fellow: {
      id: fellowId,
      name: fellowName,
      email: fellowEmail,
      roomId,
    },
    title: 'September 2026 Accommodation',
    accommodationContext: {
      property: {
        id: propId,
        name: propName,
        address: propAddress,
      },
      floor: {
        id: floorId,
        propertyId: propId,
        name: floorName,
      },
      room: {
        id: roomId,
        floorId,
        name: roomName,
        code: roomCode,
      },
    },
    requiredAmount,
    verifiedAmount,
    status,
    period: 'September 2026',
    currency: 'NGN',
  };
}

/**
 * Authoritative Accommodation Responsibilities for the 24 Fellows
 * Exactly enforces financial invariants:
 * - 0 <= verifiedAmount <= requiredAmount
 * - remainingAmount = requiredAmount - verifiedAmount
 * - verifiedAmount == 0 => OUTSTANDING
 * - 0 < verifiedAmount < requiredAmount => PARTIALLY_FULFILLED
 * - verifiedAmount == requiredAmount => FULFILLED
 */
export const DEMO_COMMAND_CENTER_RESPONSIBILITIES: AccommodationResponsibility[] = [
  // 1. OUTSTANDING (Infinite Grace: ₦66,000)
  buildResp(
    'resp-ig-01',
    'fellow-ig-01',
    'Emmanuel Ukom',
    'emmanuel.ukom@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-3',
    'Floor 3',
    'room-ig-304',
    'Room 304',
    'IG-304',
    66000,
    0,
    ResponsibilityStatus.OUTSTANDING
  ),
  // 2. OUTSTANDING (BedRock Hostel: ₦77,000)
  buildResp(
    'resp-br-01',
    'fellow-br-01',
    'Nonso Okafor',
    'nonso.okafor@bedrock.local',
    'prop-bedrock-hostel',
    'BedRock Hostel',
    'Block B, Academic Heights',
    'floor-br-2',
    'Floor 2',
    'room-br-201',
    'Room 201',
    'BR-201',
    77000,
    0,
    ResponsibilityStatus.OUTSTANDING
  ),
  // 3. OUTSTANDING (MainBase Apartment: ₦70,000)
  buildResp(
    'resp-mb-01',
    'fellow-mb-01',
    'Babatunde Adeleke',
    'babatunde.adeleke@mainbase.local',
    'prop-mainbase-apt',
    'MainBase Apartment',
    '12 MainBase Avenue',
    'floor-mb-1',
    'Floor 1',
    'room-mb-12',
    'Room 12',
    'MB-012',
    70000,
    0,
    ResponsibilityStatus.OUTSTANDING
  ),
  // 4. OUTSTANDING (Tangerine Hotel: ₦140,000)
  buildResp(
    'resp-th-01',
    'fellow-th-01',
    'Osita Ibe',
    'osita.ibe@tangerine.local',
    'prop-tangerine-hotel',
    'Tangerine Hotel',
    'Tangerine Residency Boulevard',
    'floor-th-4',
    'Floor 4',
    'room-th-402',
    'Suite 402',
    'TH-402',
    140000,
    0,
    ResponsibilityStatus.OUTSTANDING
  ),

  // 5. PARTIALLY FULFILLED (Infinite Grace: ₦66,000, verified ₦20,000, remaining ₦46,000)
  buildResp(
    'resp-ig-02',
    'fellow-ig-02',
    'Kenechukwu Obi',
    'kenechukwu.obi@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-2',
    'Floor 2',
    'room-ig-202',
    'Room 202',
    'IG-202',
    66000,
    20000,
    ResponsibilityStatus.PARTIALLY_FULFILLED
  ),
  // 6. PARTIALLY FULFILLED (Tangerine Hotel: ₦140,000, verified ₦95,000, remaining ₦45,000)
  buildResp(
    'resp-th-02',
    'fellow-th-02',
    'Amaka Eze',
    'amaka.eze@tangerine.local',
    'prop-tangerine-hotel',
    'Tangerine Hotel',
    'Tangerine Residency Boulevard',
    'floor-th-2',
    'Floor 2',
    'room-th-205',
    'Suite 205',
    'TH-205',
    140000,
    95000,
    ResponsibilityStatus.PARTIALLY_FULFILLED
  ),
  // 7. PARTIALLY FULFILLED (BedRock Hostel: ₦77,000, verified ₦40,000, remaining ₦37,000)
  buildResp(
    'resp-br-02',
    'fellow-br-02',
    'Ibrahim Musa',
    'ibrahim.musa@bedrock.local',
    'prop-bedrock-hostel',
    'BedRock Hostel',
    'Block B, Academic Heights',
    'floor-br-1',
    'Floor 1',
    'room-br-105',
    'Room 105',
    'BR-105',
    77000,
    40000,
    ResponsibilityStatus.PARTIALLY_FULFILLED
  ),

  // 8-13. FULFILLED (Infinite Grace: 6 Fellows at ₦66,000 each)
  buildResp(
    'resp-ig-03',
    'fellow-ig-03',
    'Chinedu Okeke',
    'chinedu.okeke@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-1',
    'Floor 1',
    'room-ig-101',
    'Room 101',
    'IG-101',
    66000,
    66000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-ig-04',
    'fellow-ig-04',
    'Damilola Adebayo',
    'damilola.adebayo@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-1',
    'Floor 1',
    'room-ig-102',
    'Room 102',
    'IG-102',
    66000,
    66000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-ig-05',
    'fellow-ig-05',
    'Somtochukwu Nwosu',
    'somtochukwu.nwosu@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-2',
    'Floor 2',
    'room-ig-201',
    'Room 201',
    'IG-201',
    66000,
    66000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-ig-06',
    'fellow-ig-06',
    'Blessing Nnamdi',
    'blessing.nnamdi@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-2',
    'Floor 2',
    'room-ig-203',
    'Room 203',
    'IG-203',
    66000,
    66000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-ig-07',
    'fellow-ig-07',
    'Precious Danjuma',
    'precious.danjuma@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-3',
    'Floor 3',
    'room-ig-301',
    'Room 301',
    'IG-301',
    66000,
    66000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-ig-08',
    'fellow-ig-08',
    'Victor Chukwu',
    'victor.chukwu@infinitegrace.local',
    'prop-infinite-grace-apt',
    'Infinite Grace Apartments',
    '14 Community Way, Tech Enclave',
    'floor-ig-3',
    'Floor 3',
    'room-ig-302',
    'Room 302',
    'IG-302',
    66000,
    66000,
    ResponsibilityStatus.FULFILLED
  ),

  // 14-17. FULFILLED (BedRock Hostel: 4 Fellows at ₦77,000 each)
  buildResp(
    'resp-br-03',
    'fellow-br-03',
    'Fatima Bello',
    'fatima.bello@bedrock.local',
    'prop-bedrock-hostel',
    'BedRock Hostel',
    'Block B, Academic Heights',
    'floor-br-1',
    'Floor 1',
    'room-br-101',
    'Room 101',
    'BR-101',
    77000,
    77000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-br-04',
    'fellow-br-04',
    'Emeka Anyanwu',
    'emeka.anyanwu@bedrock.local',
    'prop-bedrock-hostel',
    'BedRock Hostel',
    'Block B, Academic Heights',
    'floor-br-1',
    'Floor 1',
    'room-br-102',
    'Room 102',
    'BR-102',
    77000,
    77000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-br-05',
    'fellow-br-05',
    'Halima Abubakar',
    'halima.abubakar@bedrock.local',
    'prop-bedrock-hostel',
    'BedRock Hostel',
    'Block B, Academic Heights',
    'floor-br-2',
    'Floor 2',
    'room-br-202',
    'Room 202',
    'BR-202',
    77000,
    77000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-br-06',
    'fellow-br-06',
    'Kayode Williams',
    'kayode.williams@bedrock.local',
    'prop-bedrock-hostel',
    'BedRock Hostel',
    'Block B, Academic Heights',
    'floor-br-2',
    'Floor 2',
    'room-br-204',
    'Room 204',
    'BR-204',
    77000,
    77000,
    ResponsibilityStatus.FULFILLED
  ),

  // 18-22. FULFILLED (MainBase Apartment: 5 Fellows at ₦70,000 each)
  buildResp(
    'resp-mb-02',
    'fellow-mb-02',
    'Aisha Mohammed',
    'aisha.mohammed@mainbase.local',
    'prop-mainbase-apt',
    'MainBase Apartment',
    '12 MainBase Avenue',
    'floor-mb-1',
    'Floor 1',
    'room-mb-11',
    'Room 11',
    'MB-011',
    70000,
    70000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-mb-03',
    'fellow-mb-03',
    'Samuel Ogundipe',
    'samuel.ogundipe@mainbase.local',
    'prop-mainbase-apt',
    'MainBase Apartment',
    '12 MainBase Avenue',
    'floor-mb-1',
    'Floor 1',
    'room-mb-14',
    'Room 14',
    'MB-014',
    70000,
    70000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-mb-04',
    'fellow-mb-04',
    'Ngozi Ezeh',
    'ngozi.ezeh@mainbase.local',
    'prop-mainbase-apt',
    'MainBase Apartment',
    '12 MainBase Avenue',
    'floor-mb-2',
    'Floor 2',
    'room-mb-21',
    'Room 21',
    'MB-021',
    70000,
    70000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-mb-05',
    'fellow-mb-05',
    'Tariq Sanusi',
    'tariq.sanusi@mainbase.local',
    'prop-mainbase-apt',
    'MainBase Apartment',
    '12 MainBase Avenue',
    'floor-mb-2',
    'Floor 2',
    'room-mb-22',
    'Room 22',
    'MB-022',
    70000,
    70000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-mb-06',
    'fellow-mb-06',
    'Kehinde Balogun',
    'kehinde.balogun@mainbase.local',
    'prop-mainbase-apt',
    'MainBase Apartment',
    '12 MainBase Avenue',
    'floor-mb-2',
    'Floor 2',
    'room-mb-25',
    'Room 25',
    'MB-025',
    70000,
    70000,
    ResponsibilityStatus.FULFILLED
  ),

  // 23-24. FULFILLED (Tangerine Hotel: 2 Fellows at ₦140,000 each)
  buildResp(
    'resp-th-03',
    'fellow-th-03',
    'Chiamaka Nnaji',
    'chiamaka.nnaji@tangerine.local',
    'prop-tangerine-hotel',
    'Tangerine Hotel',
    'Tangerine Residency Boulevard',
    'floor-th-1',
    'Floor 1',
    'room-th-101',
    'Suite 101',
    'TH-101',
    140000,
    140000,
    ResponsibilityStatus.FULFILLED
  ),
  buildResp(
    'resp-th-04',
    'fellow-th-04',
    'Oluwaseun Bakare',
    'oluwaseun.bakare@tangerine.local',
    'prop-tangerine-hotel',
    'Tangerine Hotel',
    'Tangerine Residency Boulevard',
    'floor-th-3',
    'Floor 3',
    'room-th-301',
    'Suite 301',
    'TH-301',
    140000,
    140000,
    ResponsibilityStatus.FULFILLED
  ),
];

/**
 * Provider Events for Command Center Overlays
 * Exactly 4 events awaiting reconciliation:
 * - 2 for Outstanding (resp-ig-01, resp-br-01)
 * - 2 for Partially Fulfilled (resp-ig-02, resp-br-02)
 */
export const DEMO_COMMAND_CENTER_PROVIDER_EVENTS: AdminProviderEventDisplay[] = [
  {
    id: 'pevt_ar_01',
    provider: 'BMONI',
    providerEventId: 'bmoni_evt_ar_001',
    eventType: 'payment.completed',
    providerStatus: 'COMPLETED',
    providerProposalId: 'resp-ig-01',
    statusLabel: 'Received — Awaiting Reconciliation',
    notice: 'Payment received from Emmanuel Ukom via BMONI. Awaiting reconciliation verification.',
    receivedAt: '2026-09-10T11:20:00Z',
  },
  {
    id: 'pevt_ar_02',
    provider: 'BMONI',
    providerEventId: 'bmoni_evt_ar_002',
    eventType: 'payment.completed',
    providerStatus: 'COMPLETED',
    providerProposalId: 'resp-br-01',
    statusLabel: 'Received — Awaiting Reconciliation',
    notice: 'Payment received from Nonso Okafor via BMONI. Awaiting reconciliation verification.',
    receivedAt: '2026-09-10T12:05:00Z',
  },
  {
    id: 'pevt_ar_03',
    provider: 'BMONI',
    providerEventId: 'bmoni_evt_ar_003',
    eventType: 'payment.completed',
    providerStatus: 'COMPLETED',
    providerProposalId: 'resp-ig-02',
    statusLabel: 'Received — Awaiting Reconciliation',
    notice: 'Partial installment payment received from Kenechukwu Obi via BMONI. Awaiting reconciliation.',
    receivedAt: '2026-09-10T14:45:00Z',
  },
  {
    id: 'pevt_ar_04',
    provider: 'BMONI',
    providerEventId: 'bmoni_evt_ar_004',
    eventType: 'payment.completed',
    providerStatus: 'COMPLETED',
    providerProposalId: 'resp-br-02',
    statusLabel: 'Received — Awaiting Reconciliation',
    notice: 'Second installment received from Ibrahim Musa via BMONI. Awaiting reconciliation.',
    receivedAt: '2026-09-10T16:10:00Z',
  },
];

/**
 * Reconciliations with MISMATCH status for Command Center Overlays
 * Exactly 3 events with MISMATCH / Requires Review:
 * - 1 for Outstanding (resp-mb-01 Babatunde Adeleke)
 * - 1 for Partially Fulfilled (resp-th-02 Amaka Eze)
 * - 1 for Partially Fulfilled (resp-br-02 Ibrahim Musa)
 */
export const DEMO_COMMAND_CENTER_RECONCILIATIONS = [
  {
    id: 'rec_mis_01',
    responsibilityId: 'resp-mb-01',
    providerEventId: 'bmoni_evt_mis_001',
    reconciliationStatus: 'MISMATCH',
    reason: 'Payment reference mismatch: metadata references non-existent commitment record.',
    reconciledAt: '2026-09-09T09:15:00Z',
  },
  {
    id: 'rec_mis_02',
    responsibilityId: 'resp-th-02',
    providerEventId: 'bmoni_evt_mis_002',
    reconciliationStatus: 'MISMATCH',
    reason: 'Amount mismatch: provider event amount (₦50,000) exceeds current outstanding balance (₦45,000).',
    reconciledAt: '2026-09-09T13:40:00Z',
  },
  {
    id: 'rec_mis_03',
    responsibilityId: 'resp-br-02',
    providerEventId: 'bmoni_evt_mis_003',
    reconciliationStatus: 'MISMATCH',
    reason: 'Duplicate intent reference detected on third-party provider payload. Requires financial audit.',
    reconciledAt: '2026-09-10T08:30:00Z',
  },
];
