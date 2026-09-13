import { Member, MemberRole } from '../domain/auth';
import {
  AccommodationProperty,
  ACCOMMODATION_PROPERTIES,
  AccommodationAssignment,
  ScopedRoleAssignment,
  AccommodationMembershipRequest,
  ResponsibilityMessage,
  ActiveMode,
  getAvailableModesForMember,
  formatActionAttribution,
  RoomVerificationDelegation,
} from '../domain/membership';
import {
  DEMO_MEMBERS,
  DEMO_SCOPED_ROLES,
  DEMO_ASSIGNMENTS,
  INITIAL_MEMBERSHIP_REQUESTS,
  INITIAL_RESPONSIBILITY_MESSAGES,
} from '../data/demoMembership';

/**
 * In-memory state store for Demo Membership, Scoped Roles, Delegations & Messages.
 * Emits change events so React components update reactively.
 */
export class MembershipStore {
  private properties: AccommodationProperty[] = [...ACCOMMODATION_PROPERTIES];
  private members: Member[] = [...DEMO_MEMBERS];
  private scopedRoles: ScopedRoleAssignment[] = [...DEMO_SCOPED_ROLES];
  private assignments: AccommodationAssignment[] = [...DEMO_ASSIGNMENTS];
  private requests: AccommodationMembershipRequest[] = [...INITIAL_MEMBERSHIP_REQUESTS];
  private messages: ResponsibilityMessage[] = [...INITIAL_RESPONSIBILITY_MESSAGES];
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void): () => void {
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

  // Properties
  getProperties(): AccommodationProperty[] {
    return this.properties;
  }

  getPropertyById(id: string): AccommodationProperty | undefined {
    return this.properties.find((p) => p.id === id);
  }

  // Members
  getMembers(): Member[] {
    return this.members;
  }

  getMemberById(id: string): Member | undefined {
    return this.members.find((m) => m.id === id);
  }

  // Scoped Roles
  getScopedRoles(): ScopedRoleAssignment[] {
    return this.scopedRoles;
  }

  getScopedRolesForMember(memberId: string): ScopedRoleAssignment[] {
    return this.scopedRoles.filter((r) => r.memberId === memberId && !r.revokedAt);
  }

  // Assignments
  getAssignments(): AccommodationAssignment[] {
    return this.assignments;
  }

  getAssignmentsForMember(memberId: string): AccommodationAssignment[] {
    return this.assignments.filter((a) => a.memberId === memberId);
  }

  getActiveAssignmentForMember(memberId: string): AccommodationAssignment | undefined {
    return this.assignments.find((a) => a.memberId === memberId && a.status === 'ACTIVE');
  }

  // Membership Requests
  getRequests(): AccommodationMembershipRequest[] {
    return this.requests;
  }

  getRequestById(id: string): AccommodationMembershipRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  /**
   * Submits a new Membership Request.
   * STRICT PRODUCT RULE: Registration is identity only. NO role selection.
   */
  submitMembershipRequest(params: {
    fullName: string;
    email: string;
    phone?: string;
    githubHandle?: string;
    programCommunity: string;
    propertyId: string;
    floorName?: string;
    roomName: string;
  }): AccommodationMembershipRequest {
    const property = this.getPropertyById(params.propertyId);
    if (!property) {
      throw new Error(`Property ${params.propertyId} not found.`);
    }

    // Check for existing fellow recognition
    const existing = this.members.find(
      (m) => m.email?.toLowerCase() === params.email.toLowerCase()
    );
    const existingAssignment = existing ? this.getActiveAssignmentForMember(existing.id) : undefined;

    const isTransfer = Boolean(existing && existingAssignment);

    const newRequest: AccommodationMembershipRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      memberId: existing?.id,
      h4dMemberId: existing?.h4dMemberId,
      fullName: params.fullName.trim(),
      email: params.email.trim(),
      phone: params.phone,
      githubHandle: params.githubHandle,
      programCommunity: params.programCommunity.trim(),
      propertyId: property.id,
      propertyName: property.name,
      floorName: params.floorName || 'Floor 1',
      roomName: params.roomName.trim(),
      monthlyCommitment: property.monthlyCommitment,
      status: isTransfer ? 'TRANSFER_RECOGNIZED' : 'SUBMITTED',
      isExistingFellowRecognized: Boolean(existing),
      previousAccommodation: existingAssignment
        ? {
            propertyName: existingAssignment.propertyName,
            roomName: existingAssignment.roomName,
            period: existingAssignment.period,
          }
        : undefined,
      submittedAt: new Date().toISOString(),
    };

    this.requests = [newRequest, ...this.requests];
    this.notify();
    return newRequest;
  }

  /**
   * Coordinator delegates room verification to Room Captain
   */
  delegateRoomVerification(params: {
    requestId: string;
    delegatedBy: string; // e.g. "L2E Accommodation Fellows Coordinator"
    captainMemberId: string;
  }): AccommodationMembershipRequest {
    const req = this.getRequestById(params.requestId);
    if (!req) {
      throw new Error(`Request ${params.requestId} not found.`);
    }

    const captain = this.getMemberById(params.captainMemberId);
    if (!captain) {
      throw new Error(`Captain ${params.captainMemberId} not found.`);
    }

    const delegation: RoomVerificationDelegation = {
      id: `del-${Date.now()}`,
      membershipRequestId: req.id,
      delegatedBy: params.delegatedBy,
      delegatedToMemberId: captain.id,
      delegatedToName: captain.displayName,
      responsibility: `Verify ${req.roomName} Occupancy / Assignment`,
      scope: {
        propertyId: req.propertyId,
        propertyName: req.propertyName,
        roomId: `room-${req.roomName.toLowerCase().replace(/\s+/g, '-')}`,
        roomName: req.roomName,
      },
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    req.status = 'DELEGATED';
    req.delegation = delegation;
    this.notify();
    return req;
  }

  /**
   * Room Captain resolves or updates delegated verification
   */
  resolveDelegation(params: {
    requestId: string;
    status: 'CONFIRMED' | 'CANNOT_CONFIRM';
    note?: string;
  }): AccommodationMembershipRequest {
    const req = this.getRequestById(params.requestId);
    if (!req || !req.delegation) {
      throw new Error(`Request or delegation not found.`);
    }

    req.delegation.status = params.status;
    req.delegation.captainNote = params.note;
    req.delegation.resolvedAt = new Date().toISOString();

    if (params.status === 'CONFIRMED') {
      req.status = 'UNDER_REVIEW'; // Ready for final Coordinator approval
    }
    this.notify();
    return req;
  }

  /**
   * Coordinator requests clarification
   */
  requestClarification(params: {
    requestId: string;
    note: string;
    reviewedBy: string;
  }): AccommodationMembershipRequest {
    const req = this.getRequestById(params.requestId);
    if (!req) throw new Error('Request not found.');

    req.status = 'NEEDS_CLARIFICATION';
    req.clarificationNote = params.note;
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = params.reviewedBy;
    this.notify();
    return req;
  }

  /**
   * Coordinator rejects membership request with reason (non-punitive)
   */
  rejectMembershipRequest(params: {
    requestId: string;
    reason: string;
    reviewedBy: string;
  }): AccommodationMembershipRequest {
    const req = this.getRequestById(params.requestId);
    if (!req) throw new Error('Request not found.');

    req.status = 'REJECTED';
    req.rejectionReason = params.reason;
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = params.reviewedBy;
    this.notify();
    return req;
  }

  /**
   * Coordinator approves membership request
   */
  approveMembershipRequest(params: {
    requestId: string;
    reviewedBy: string;
  }): AccommodationMembershipRequest {
    const req = this.getRequestById(params.requestId);
    if (!req) throw new Error('Request not found.');

    req.status = 'APPROVED';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = params.reviewedBy;

    // Check if member already exists; if not, create member identity with FELLOW role (NOT chosen by registrant)
    let member = req.memberId ? this.getMemberById(req.memberId) : undefined;
    if (!member) {
      const newId = `member-${Date.now()}`;
      const newH4dId = `H4D-${String(this.members.length + 22).padStart(5, '0')}`;
      member = {
        id: newId,
        h4dMemberId: newH4dId,
        displayName: req.fullName,
        email: req.email,
        roles: [MemberRole.FELLOW],
        createdAt: new Date().toISOString(),
      };
      this.members.push(member);
      req.memberId = member.id;
      req.h4dMemberId = member.h4dMemberId;
    }

    // Mark previous assignment as TRANSFERRED if applicable
    const activeAssignments = this.assignments.filter(
      (a) => a.memberId === member!.id && a.status === 'ACTIVE'
    );
    for (const a of activeAssignments) {
      a.status = 'TRANSFERRED';
      a.endDate = new Date().toISOString();
    }

    // Create new active assignment
    const newAssignment: AccommodationAssignment = {
      id: `assign-${Date.now()}`,
      memberId: member.id,
      propertyId: req.propertyId,
      propertyName: req.propertyName,
      floorName: req.floorName || 'Floor 1',
      roomId: `room-${req.roomName.toLowerCase().replace(/\s+/g, '-')}`,
      roomName: req.roomName,
      monthlyCommitment: req.monthlyCommitment,
      status: 'ACTIVE',
      period: 'Sep 2026 – Present',
      startDate: new Date().toISOString(),
    };
    this.assignments.push(newAssignment);

    this.notify();
    return req;
  }

  // Responsibility Messages / Notes
  getMessagesForResponsibility(responsibilityId: string): ResponsibilityMessage[] {
    return this.messages.filter((m) => m.responsibilityId === responsibilityId);
  }

  addMessage(params: {
    responsibilityId: string;
    fellowId: string;
    sender: Member;
    activeMode: ActiveMode;
    content: string;
  }): ResponsibilityMessage {
    const attribution = formatActionAttribution(params.sender, params.activeMode);

    const newMsg: ResponsibilityMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      responsibilityId: params.responsibilityId,
      fellowId: params.fellowId,
      senderId: params.sender.id,
      senderName: attribution.displayLabel,
      senderRole: attribution.actingCapacity,
      actingCapacity: attribution.actingCapacity,
      content: params.content.trim(),
      createdAt: new Date().toISOString(),
    };

    this.messages.push(newMsg);
    this.notify();
    return newMsg;
  }
}

export const membershipStore = new MembershipStore();
