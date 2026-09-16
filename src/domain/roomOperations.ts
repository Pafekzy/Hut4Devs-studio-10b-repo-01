/**
 * Room Operations & Delegated Candidate Selection Domain
 * 
 * Defines the domain model for:
 * - Campus Room inventory (Lagos Yaba campus)
 * - Beds & Occupancy state
 * - Delegated Candidate Choice (Coordinator explicitly delegates candidate choice to Room Captain)
 * - Candidate Assignment Records (13 candidates fixture)
 */

export type RoomOperationalStatus = 'GOOD_ORDER' | 'ATTENTION_REQUIRED' | 'FULL' | 'VACANT';

export interface RoomBed {
  id: string;
  bedLabel: string; // e.g. "Bunk 1 (Lower)", "Bunk 2 (Upper)"
  status: 'OCCUPIED' | 'VACANT' | 'RESERVED' | 'DELEGATED_CHOICE';
  occupantName?: string;
  occupantMemberId?: string;
  occupantTrack?: string;
  occupantH4dId?: string;
}

export interface CampusRoom {
  id: string;
  roomNumber: string; // e.g. "Room 304"
  propertyId: string;
  propertyName: string;
  floorName: string;
  campus: string; // "Lagos Yaba"
  totalBeds: number;
  occupiedBeds: number;
  captainMemberId?: string;
  captainName?: string;
  monthlyCommitment: number;
  status: RoomOperationalStatus;
  beds: RoomBed[];
  attentionReason?: string;
  lastActivityTime?: string;
}

export type CandidateAssignmentStatus =
  | 'PENDING_ASSIGNMENT'
  | 'DELEGATED_TO_CAPTAIN'
  | 'ASSIGNED'
  | 'UNDER_REVIEW';

export interface CandidateAssignment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  githubHandle: string;
  track: string;
  campus: string;
  cohort: string;
  admissionNumber: string;
  preferredPropertyId: string;
  preferredPropertyName: string;
  preferredRoomName?: string;
  status: CandidateAssignmentStatus;
  delegatedToCaptainId?: string;
  delegatedToCaptainName?: string;
  delegatedToRoomId?: string;
  delegatedToRoomName?: string;
  delegationId?: string;
  assignedRoomId?: string;
  assignedRoomName?: string;
  assignedBedLabel?: string;
  assignedAt?: string;
  assignedBy?: string;
  candidateBio: string;
  submittedAt: string;
}

export interface DelegatedCandidateChoice {
  id: string;
  roomId: string;
  roomName: string;
  propertyId: string;
  propertyName: string;
  bedId: string;
  bedLabel: string;
  candidateIds: string[];
  delegatedBy: string; // e.g. "Zainab Aliyu (L2E Accommodation Fellows Coordinator)"
  delegatedToMemberId: string; // e.g. "member-chinedu-captain"
  delegatedToName: string; // e.g. "Chinedu Okeke"
  instructions?: string;
  status: 'PENDING' | 'SELECTED' | 'CANCELLED';
  selectedCandidateId?: string;
  selectedCandidateName?: string;
  captainNote?: string;
  createdAt: string;
  selectedAt?: string;
}
