import {
  CampusRoom,
  CandidateAssignment,
  DelegatedCandidateChoice,
} from '../domain/roomOperations';
import {
  DEMO_PENDING_ASSIGNMENTS,
  INITIAL_CAMPUS_ROOMS,
  INITIAL_DELEGATED_CHOICES,
} from '../data/demoPendingAssignments';
import { roomCommonsStore } from './roomCommonsStore';
import { notificationStore } from './notificationStore';

class RoomOperationsStore {
  private rooms: CampusRoom[] = [];
  private candidates: CandidateAssignment[] = [];
  private delegatedChoices: DelegatedCandidateChoice[] = [];
  private listeners: Array<() => void> = [];
  private initialized = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (this.initialized) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const rawRooms = window.localStorage.getItem('h4d_campus_rooms');
        const rawCandidates = window.localStorage.getItem('h4d_demo_candidates');
        const rawChoices = window.localStorage.getItem('h4d_delegated_choices');

        this.rooms = rawRooms ? JSON.parse(rawRooms) : JSON.parse(JSON.stringify(INITIAL_CAMPUS_ROOMS));
        this.candidates = rawCandidates ? JSON.parse(rawCandidates) : JSON.parse(JSON.stringify(DEMO_PENDING_ASSIGNMENTS));
        this.delegatedChoices = rawChoices ? JSON.parse(rawChoices) : JSON.parse(JSON.stringify(INITIAL_DELEGATED_CHOICES));
      } else {
        this.rooms = JSON.parse(JSON.stringify(INITIAL_CAMPUS_ROOMS));
        this.candidates = JSON.parse(JSON.stringify(DEMO_PENDING_ASSIGNMENTS));
        this.delegatedChoices = JSON.parse(JSON.stringify(INITIAL_DELEGATED_CHOICES));
      }
    } catch {
      this.rooms = JSON.parse(JSON.stringify(INITIAL_CAMPUS_ROOMS));
      this.candidates = JSON.parse(JSON.stringify(DEMO_PENDING_ASSIGNMENTS));
      this.delegatedChoices = JSON.parse(JSON.stringify(INITIAL_DELEGATED_CHOICES));
    }
    this.initialized = true;
  }

  private saveState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('h4d_campus_rooms', JSON.stringify(this.rooms));
        window.localStorage.setItem('h4d_demo_candidates', JSON.stringify(this.candidates));
        window.localStorage.setItem('h4d_delegated_choices', JSON.stringify(this.delegatedChoices));
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
    this.saveState();
    for (const listener of this.listeners) {
      listener();
    }
  }

  // Rooms
  getRooms(): CampusRoom[] {
    this.loadState();
    return this.rooms;
  }

  getRoomById(id: string): CampusRoom | undefined {
    this.loadState();
    return this.rooms.find((r) => r.id.toLowerCase() === id.toLowerCase());
  }

  // Candidates (13 Fixture Candidates)
  getCandidates(): CandidateAssignment[] {
    this.loadState();
    return this.candidates;
  }

  getCandidateById(id: string): CandidateAssignment | undefined {
    this.loadState();
    return this.candidates.find((c) => c.id === id);
  }

  getPendingCandidates(): CandidateAssignment[] {
    this.loadState();
    return this.candidates.filter((c) => c.status === 'PENDING_ASSIGNMENT');
  }

  // Delegated Choices
  getDelegatedChoices(): DelegatedCandidateChoice[] {
    this.loadState();
    return this.delegatedChoices;
  }

  getDelegatedChoicesForRoom(roomId: string): DelegatedCandidateChoice[] {
    this.loadState();
    return this.delegatedChoices.filter(
      (dc) => dc.roomId.toLowerCase() === roomId.toLowerCase()
    );
  }

  getPendingChoiceForRoom(roomId: string): DelegatedCandidateChoice | undefined {
    this.loadState();
    return this.delegatedChoices.find(
      (dc) => dc.roomId.toLowerCase() === roomId.toLowerCase() && dc.status === 'PENDING'
    );
  }

  /**
   * Coordinator explicitly delegates candidate choice for a specific room bed to Room Captain.
   * Supplies an explicit, bounded candidate list.
   */
  delegateCandidateChoice(params: {
    roomId: string;
    bedId: string;
    candidateIds: string[];
    instructions?: string;
    coordinatorAttribution: string;
    captainMemberId: string;
    captainName: string;
  }): DelegatedCandidateChoice {
    const room = this.getRoomById(params.roomId);
    if (!room) throw new Error(`Room ${params.roomId} not found`);

    const bed = room.beds.find((b) => b.id === params.bedId);
    if (!bed) throw new Error(`Bed ${params.bedId} not found in room`);

    const newChoiceId = `del-choice-${Date.now()}`;

    // Update bed
    bed.status = 'DELEGATED_CHOICE';
    bed.occupantName = `Delegated to ${params.captainName}`;

    // Update candidates
    for (const cId of params.candidateIds) {
      const cand = this.candidates.find((c) => c.id === cId);
      if (cand) {
        cand.status = 'DELEGATED_TO_CAPTAIN';
        cand.delegatedToCaptainId = params.captainMemberId;
        cand.delegatedToCaptainName = params.captainName;
        cand.delegatedToRoomId = room.id;
        cand.delegatedToRoomName = room.roomNumber;
        cand.delegationId = newChoiceId;
      }
    }

    const newChoice: DelegatedCandidateChoice = {
      id: newChoiceId,
      roomId: room.id,
      roomName: room.roomNumber,
      propertyId: room.propertyId,
      propertyName: room.propertyName,
      bedId: bed.id,
      bedLabel: bed.bedLabel,
      candidateIds: [...params.candidateIds],
      delegatedBy: params.coordinatorAttribution,
      delegatedToMemberId: params.captainMemberId,
      delegatedToName: params.captainName,
      instructions: params.instructions || 'Review candidates for bunk availability and shared living alignment.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.delegatedChoices = [newChoice, ...this.delegatedChoices];

    // Append to Room Trail
    roomCommonsStore.addTrailEvent({
      roomId: room.id,
      roomName: room.roomNumber,
      eventType: 'OCCUPANCY_DELEGATED',
      actorName: params.coordinatorAttribution.split('(')[0].trim(),
      actorCapacity: params.coordinatorAttribution,
      title: `Delegated Candidate Choice: ${bed.bedLabel}`,
      description: `Coordinator explicitly delegated candidate selection for ${bed.bedLabel} to Room Captain ${params.captainName} (${params.candidateIds.length} candidates provided).`,
    });

    // Notify Captain
    notificationStore.addNotification({
      memberId: params.captainMemberId,
      title: `Candidate Selection Delegated: ${room.roomNumber}`,
      message: `${params.coordinatorAttribution} delegated candidate selection for ${bed.bedLabel}. Choose from ${params.candidateIds.length} prospective fellows.`,
      type: 'DELEGATED_TASK',
      targetWorkspace: 'room-captain',
      targetContextId: newChoiceId,
      targetContextType: 'MEMBERSHIP_REQUEST',
    });

    this.notify();
    return newChoice;
  }

  /**
   * Room Captain selects a candidate from the explicitly delegated candidate list.
   */
  resolveCandidateChoice(params: {
    delegationId?: string;
    choiceId?: string;
    selectedCandidateId: string;
    captainNote?: string;
    note?: string;
    captainAttribution: string;
    captainMemberId: string;
  }): DelegatedCandidateChoice {
    const id = params.delegationId || params.choiceId;
    const choice = this.delegatedChoices.find((dc) => dc.id === id);
    if (!choice) throw new Error(`Delegation ${id} not found`);

    if (!choice.candidateIds.includes(params.selectedCandidateId)) {
      throw new Error(`Candidate ${params.selectedCandidateId} is not part of the delegated candidate pool.`);
    }

    const selectedCand = this.candidates.find((c) => c.id === params.selectedCandidateId);
    if (!selectedCand) throw new Error(`Candidate not found`);

    const room = this.getRoomById(choice.roomId);
    if (!room) throw new Error(`Room ${choice.roomId} not found`);

    const bed = room.beds.find((b) => b.id === choice.bedId);
    if (!bed) throw new Error(`Bed not found`);

    // Mark choice resolved
    choice.status = 'SELECTED';
    choice.selectedCandidateId = selectedCand.id;
    choice.selectedCandidateName = selectedCand.fullName;
    choice.captainNote = params.captainNote || 'Selected after peer living space check.';
    choice.selectedAt = new Date().toISOString();

    // Update selected candidate
    selectedCand.status = 'ASSIGNED';
    selectedCand.assignedRoomId = room.id;
    selectedCand.assignedRoomName = room.roomNumber;
    selectedCand.assignedBedLabel = bed.bedLabel;
    selectedCand.assignedAt = new Date().toISOString();
    selectedCand.assignedBy = params.captainAttribution;

    // Return unselected candidates to PENDING_ASSIGNMENT
    for (const otherId of choice.candidateIds) {
      if (otherId !== selectedCand.id) {
        const other = this.candidates.find((c) => c.id === otherId);
        if (other && other.status === 'DELEGATED_TO_CAPTAIN') {
          other.status = 'PENDING_ASSIGNMENT';
          other.delegationId = undefined;
          other.delegatedToCaptainId = undefined;
          other.delegatedToCaptainName = undefined;
          other.delegatedToRoomId = undefined;
          other.delegatedToRoomName = undefined;
        }
      }
    }

    // Update bed
    bed.status = 'OCCUPIED';
    bed.occupantName = selectedCand.fullName;
    bed.occupantTrack = selectedCand.track;
    bed.occupantH4dId = selectedCand.admissionNumber;

    // Recalculate occupied beds
    room.occupiedBeds = room.beds.filter((b) => b.status === 'OCCUPIED').length;
    if (room.occupiedBeds >= room.totalBeds) {
      room.status = 'FULL';
    } else {
      room.status = 'GOOD_ORDER';
    }
    room.attentionReason = undefined;

    // Append to Room Trail
    roomCommonsStore.addTrailEvent({
      roomId: room.id,
      roomName: room.roomNumber,
      eventType: 'DECISION_MADE',
      actorName: params.captainAttribution.split('(')[0].trim(),
      actorCapacity: params.captainAttribution,
      title: `Candidate Selected by Room Captain: ${selectedCand.fullName}`,
      description: `Room Captain selected ${selectedCand.fullName} (${selectedCand.track}) for ${bed.bedLabel}. Note: "${choice.captainNote}"`,
    });

    // Notify Coordinator
    notificationStore.addNotification({
      memberId: 'member-zainab-coordinator',
      title: `Room ${room.roomNumber} Candidate Selected: ${selectedCand.fullName}`,
      message: `Room Captain ${choice.delegatedToName} confirmed selection for ${bed.bedLabel}: ${selectedCand.fullName}.`,
      type: 'DELEGATED_TASK',
      targetWorkspace: 'coordinator',
      targetContextId: choice.id,
      targetContextType: 'MEMBERSHIP_REQUEST',
    });

    this.notify();
    return choice;
  }

  /**
   * Coordinator directly assigns candidate to a vacant bed.
   */
  assignCandidateDirectly(params: {
    candidateId: string;
    roomId: string;
    bedId: string;
    coordinatorAttribution: string;
  }): CandidateAssignment {
    const candidate = this.getCandidateById(params.candidateId);
    if (!candidate) throw new Error(`Candidate not found`);

    const room = this.getRoomById(params.roomId);
    if (!room) throw new Error(`Room not found`);

    const bed = room.beds.find((b) => b.id === params.bedId);
    if (!bed) throw new Error(`Bed not found`);

    bed.status = 'OCCUPIED';
    bed.occupantName = candidate.fullName;
    bed.occupantTrack = candidate.track;
    bed.occupantH4dId = candidate.admissionNumber;

    candidate.status = 'ASSIGNED';
    candidate.assignedRoomId = room.id;
    candidate.assignedRoomName = room.roomNumber;
    candidate.assignedBedLabel = bed.bedLabel;
    candidate.assignedAt = new Date().toISOString();
    candidate.assignedBy = params.coordinatorAttribution;

    room.occupiedBeds = room.beds.filter((b) => b.status === 'OCCUPIED').length;
    if (room.occupiedBeds >= room.totalBeds) {
      room.status = 'FULL';
    }

    roomCommonsStore.addTrailEvent({
      roomId: room.id,
      roomName: room.roomNumber,
      eventType: 'OCCUPANCY_CONFIRMED',
      actorName: params.coordinatorAttribution.split('(')[0].trim(),
      actorCapacity: params.coordinatorAttribution,
      title: `Direct Assignment: ${candidate.fullName}`,
      description: `Coordinator assigned ${candidate.fullName} to ${bed.bedLabel} in ${room.roomNumber} (${room.propertyName}).`,
    });

    this.notify();
    return candidate;
  }

  /**
   * Reset store state for testing
   */
  resetForTesting() {
    this.rooms = JSON.parse(JSON.stringify(INITIAL_CAMPUS_ROOMS));
    this.candidates = JSON.parse(JSON.stringify(DEMO_PENDING_ASSIGNMENTS));
    this.delegatedChoices = JSON.parse(JSON.stringify(INITIAL_DELEGATED_CHOICES));
    this.listeners = [];
    this.initialized = true;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('h4d_campus_rooms');
        window.localStorage.removeItem('h4d_pending_candidates');
        window.localStorage.removeItem('h4d_delegated_choices');
      }
    } catch {
      // Ignore
    }
  }
}

export const roomOperationsStore = new RoomOperationsStore();
