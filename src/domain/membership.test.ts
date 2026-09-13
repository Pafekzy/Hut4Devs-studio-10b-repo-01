import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatActionAttribution,
  getAvailableModesForMember,
  getDefaultModeForMember,
  ACCOMMODATION_PROPERTIES,
} from './membership';
import { Member, MemberRole } from './auth';
import { MembershipStore } from '../services/membershipStore';

describe('H4D-DEMO-001: Membership, Scoped Delegation, and Mode Attribution', () => {
  let store: MembershipStore;

  beforeEach(() => {
    store = new MembershipStore();
  });

  describe('Core Product Principle: Registration vs Membership vs Authority', () => {
    it('creates a membership request without assigning authority', () => {
      const req = store.submitMembershipRequest({
        fullName: 'Amina Yusuf',
        email: 'amina@interns.local',
        phone: '+234 809 111 2233',
        programCommunity: 'L2E Dev Cohort',
        propertyId: 'prop-infinite-grace',
        roomName: 'Room 304',
      });

      expect(req.id).toBeDefined();
      expect(req.status).toBe('SUBMITTED');
      expect(req.isExistingFellowRecognized).toBe(false);
      expect(req.monthlyCommitment).toBe(66000);
    });

    it('recognizes existing Fellow on transfer request', () => {
      // Existing fellow in demo store: Emmanuel Ukom (emmanuel@infinitegrace.local)
      const transferReq = store.submitMembershipRequest({
        fullName: 'Emmanuel Ukom',
        email: 'emmanuel@infinitegrace.local',
        programCommunity: 'L2E Dev Cohort',
        propertyId: 'prop-bedrock-hostel',
        roomName: 'Room 101',
      });

      expect(transferReq.isExistingFellowRecognized).toBe(true);
      expect(transferReq.status).toBe('TRANSFER_RECOGNIZED');
      expect(transferReq.h4dMemberId).toBe('H4D-00012');
      expect(transferReq.monthlyCommitment).toBe(77000); // BedRock commitment
    });
  });

  describe('Coordinator Delegation to Room Captain', () => {
    it('allows Coordinator to delegate room occupancy verification', () => {
      const requests = store.getRequests();
      const targetReq = requests[0];

      const updatedReq = store.delegateRoomVerification({
        requestId: targetReq.id,
        delegatedBy: 'L2E Accommodation Fellows Coordinator (Zainab Aliyu)',
        captainMemberId: 'member-chinedu-captain',
      });

      expect(updatedReq.delegation).toBeDefined();
      expect(updatedReq.delegation?.status).toBe('PENDING');
      expect(updatedReq.delegation?.delegatedToMemberId).toBe('member-chinedu-captain');
      expect(updatedReq.status).toBe('DELEGATED');
    });

    it('allows Room Captain to confirm room verification', () => {
      const requests = store.getRequests();
      const targetReq = requests[0];

      store.delegateRoomVerification({
        requestId: targetReq.id,
        delegatedBy: 'L2E Accommodation Fellows Coordinator',
        captainMemberId: 'member-chinedu-captain',
      });

      const updated = store.resolveDelegation({
        requestId: targetReq.id,
        status: 'CONFIRMED',
        note: 'Space verified, fellow is in room.',
      });

      expect(updated.delegation?.status).toBe('CONFIRMED');
      expect(updated.delegation?.captainNote).toBe('Space verified, fellow is in room.');
    });
  });

  describe('Approval establishes Membership and active assignment', () => {
    it('approving a request activates assignment and marks previous as TRANSFERRED', () => {
      // Existing fellow with past assignment
      const transferReq = store.submitMembershipRequest({
        fullName: 'Emmanuel Ukom',
        email: 'emmanuel@infinitegrace.local',
        programCommunity: 'L2E Dev Cohort',
        propertyId: 'prop-bedrock-hostel',
        roomName: 'Room 101',
      });

      const approved = store.approveMembershipRequest({
        requestId: transferReq.id,
        reviewedBy: 'L2E Accommodation Fellows Coordinator (Zainab Aliyu)',
      });

      expect(approved.status).toBe('APPROVED');

      // Check assignment in store
      const activeAssignment = store.getActiveAssignmentForMember(approved.memberId!);
      expect(activeAssignment).toBeDefined();
      expect(activeAssignment?.propertyName).toBe('BedRock Hostel');
      expect(activeAssignment?.status).toBe('ACTIVE');
    });
  });

  describe('Action Attribution: Capacity is not universal authority', () => {
    const multiRoleMember: Member = {
      id: 'member-emmanuel',
      h4dMemberId: 'H4D-00012',
      displayName: 'Emmanuel Ukom',
      email: 'emmanuel@infinitegrace.local',
      roles: [MemberRole.FELLOW, MemberRole.ROOM_CAPTAIN, MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR],
      createdAt: '2026-06-01T00:00:00Z',
    };

    it('derives available modes from scoped roles without merging identities', () => {
      const modes = getAvailableModesForMember(multiRoleMember);
      expect(modes).toContain('FELLOW');
      expect(modes).toContain('ROOM_CAPTAIN');
      expect(modes).toContain('COORDINATOR');
      expect(modes).toContain('CAPTAIN_COVERAGE');
      expect(modes).toContain('FINANCIAL_COVERAGE');
    });

    it('formats attribution accurately for FELLOW mode', () => {
      const attr = formatActionAttribution(multiRoleMember, 'FELLOW');
      expect(attr.actingCapacity).toBe('Fellow');
      expect(attr.displayLabel).toBe('Emmanuel Ukom');
      expect(attr.isCoverage).toBe(false);
    });

    it('formats attribution accurately for ROOM_CAPTAIN mode with scope', () => {
      const attr = formatActionAttribution(multiRoleMember, 'ROOM_CAPTAIN', 'Room 304 (Infinite Grace)');
      expect(attr.actingCapacity).toBe('Room Captain — Room 304 (Infinite Grace)');
      expect(attr.isCoverage).toBe(false);
    });

    it('formats attribution accurately for CAPTAIN_COVERAGE mode', () => {
      const attr = formatActionAttribution(multiRoleMember, 'CAPTAIN_COVERAGE', 'Room 202');
      expect(attr.actingCapacity).toContain('Room Captain Coverage');
      expect(attr.isCoverage).toBe(true);
    });

    it('formats attribution accurately for FINANCIAL_COVERAGE mode', () => {
      const attr = formatActionAttribution(multiRoleMember, 'FINANCIAL_COVERAGE');
      expect(attr.actingCapacity).toContain('Financial Admin Coverage');
      expect(attr.isCoverage).toBe(true);
    });
  });

  describe('Multi-Property Architecture', () => {
    it('preserves distinct rates for accredited properties', () => {
      const infiniteGrace = ACCOMMODATION_PROPERTIES.find((p) => p.id === 'prop-infinite-grace');
      const bedRock = ACCOMMODATION_PROPERTIES.find((p) => p.id === 'prop-bedrock-hostel');
      const mainBase = ACCOMMODATION_PROPERTIES.find((p) => p.id === 'prop-mainbase-apt');
      const tangerine = ACCOMMODATION_PROPERTIES.find((p) => p.id === 'prop-tangerine-hotel');

      expect(infiniteGrace?.monthlyCommitment).toBe(66000);
      expect(bedRock?.monthlyCommitment).toBe(77000);
      expect(mainBase?.monthlyCommitment).toBe(70000);
      expect(tangerine?.monthlyCommitment).toBe(140000);
    });
  });

  describe('Scoped Responsibilities and Mode Visibility Rules', () => {
    const normalFellow: Member = {
      id: 'member-normal',
      h4dMemberId: 'H4D-00099',
      displayName: 'Normal Fellow',
      email: 'fellow@infinitegrace.local',
      roles: [MemberRole.FELLOW],
      createdAt: '2026-06-01T00:00:00Z',
    };

    const captainFellow: Member = {
      id: 'member-chinedu-captain',
      h4dMemberId: 'H4D-00003',
      displayName: 'Chinedu Okeke',
      email: 'chinedu@infinitegrace.local',
      roles: [MemberRole.FELLOW, MemberRole.ROOM_CAPTAIN],
      createdAt: '2026-06-01T00:00:00Z',
    };

    const coordinatorFellow: Member = {
      id: 'member-zainab-coord',
      h4dMemberId: 'H4D-00002',
      displayName: 'Zainab Aliyu',
      email: 'zainab@infinitegrace.local',
      roles: [MemberRole.FELLOW, MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR],
      createdAt: '2026-06-01T00:00:00Z',
    };

    const financialAdminMember: Member = {
      id: 'member-admin',
      h4dMemberId: 'H4D-00001',
      displayName: 'Accommodation Financial Admin',
      email: 'admin@infinitegrace.local',
      roles: [MemberRole.ACCOMMODATION_ADMIN, MemberRole.ACCOMMODATION_FINANCIAL_ADMIN],
      createdAt: '2026-06-01T00:00:00Z',
    };

    it('Normal Fellow sees FELLOW workspace only (no switcher required)', () => {
      const modes = getAvailableModesForMember(normalFellow);
      expect(modes).toEqual(['FELLOW']);
      expect(modes).not.toContain('ROOM_CAPTAIN');
      expect(modes).not.toContain('COORDINATOR');
      expect(modes).not.toContain('FINANCIAL_ADMIN');
    });

    it('Room Captain sees FELLOW and ROOM_CAPTAIN modes', () => {
      const modes = getAvailableModesForMember(captainFellow);
      expect(modes).toContain('FELLOW');
      expect(modes).toContain('ROOM_CAPTAIN');
      expect(modes).not.toContain('COORDINATOR');
      expect(modes).not.toContain('FINANCIAL_ADMIN');
    });

    it('Coordinator sees FELLOW, COORDINATOR, CAPTAIN_COVERAGE, and FINANCIAL_COVERAGE', () => {
      const modes = getAvailableModesForMember(coordinatorFellow);
      expect(modes).toContain('FELLOW');
      expect(modes).toContain('COORDINATOR');
      expect(modes).toContain('CAPTAIN_COVERAGE');
      expect(modes).toContain('FINANCIAL_COVERAGE');
      expect(modes).not.toContain('FINANCIAL_ADMIN');
    });

    it('Financial Admin lands directly in FINANCIAL_ADMIN with no multi-mode switcher', () => {
      const modes = getAvailableModesForMember(financialAdminMember);
      expect(modes).toEqual(['FINANCIAL_ADMIN']);
    });
  });

  describe('Coordinator Review Actions: Clarification and Rejection', () => {
    it('Coordinator can request clarification on a membership request', () => {
      const req = store.submitMembershipRequest({
        fullName: 'Kelechi Nwosu',
        email: 'kelechi@cohort.local',
        programCommunity: 'L2E Dev Cohort',
        propertyId: 'prop-infinite-grace',
        roomName: 'Room 201',
      });

      const updated = store.requestClarification({
        requestId: req.id,
        reviewedBy: 'L2E Accommodation Fellows Coordinator (Zainab Aliyu)',
        note: 'Please upload or confirm your sponsor verification letter.',
      });

      expect(updated.status).toBe('NEEDS_CLARIFICATION');
      expect(updated.clarificationNote).toBe('Please upload or confirm your sponsor verification letter.');
    });

    it('Coordinator can reject a membership request with reason without labeling the human permanently', () => {
      const req = store.submitMembershipRequest({
        fullName: 'Unverified Candidate',
        email: 'unverified@unknown.local',
        programCommunity: 'External',
        propertyId: 'prop-tangerine-hotel',
        roomName: 'Room 999',
      });

      const updated = store.rejectMembershipRequest({
        requestId: req.id,
        reviewedBy: 'L2E Accommodation Fellows Coordinator',
        reason: 'Accommodation cohort capacity reached for this semester.',
      });

      expect(updated.status).toBe('REJECTED');
      expect(updated.rejectionReason).toBe('Accommodation cohort capacity reached for this semester.');
    });
  });

  describe('Financial Notes: Contextual Responsibility Communication', () => {
    it('allows Admin/Coordinator to send a note and Fellow to reply on a specific responsibility', () => {
      const respId = 'h4d-resp-2026-09-emmanuel';
      const fellowMember: Member = {
        id: 'member-emmanuel',
        h4dMemberId: 'H4D-00012',
        displayName: 'Emmanuel Ukom',
        email: 'emmanuel@infinitegrace.local',
        roles: [MemberRole.FELLOW],
        createdAt: '2026-06-01T00:00:00Z',
      };
      const adminMember: Member = {
        id: 'member-admin',
        h4dMemberId: 'H4D-00001',
        displayName: 'Financial Admin',
        email: 'admin@infinitegrace.local',
        roles: [MemberRole.ACCOMMODATION_ADMIN],
        createdAt: '2026-06-01T00:00:00Z',
      };

      // Admin sends note
      store.addMessage({
        responsibilityId: respId,
        fellowId: fellowMember.id,
        sender: adminMember,
        activeMode: 'FINANCIAL_ADMIN',
        content: 'Your September accommodation record currently shows ₦37,000 remaining.',
      });

      // Fellow replies
      store.addMessage({
        responsibilityId: respId,
        fellowId: fellowMember.id,
        sender: fellowMember,
        activeMode: 'FELLOW',
        content: 'I made the remaining payment this afternoon via bank transfer.',
      });

      const messages = store.getMessagesForResponsibility(respId);
      expect(messages.length).toBe(2);
      expect(messages[0].content).toContain('₦37,000 remaining');
      expect(messages[0].actingCapacity).toBe('Accommodation Financial Admin');
      expect(messages[1].content).toContain('made the remaining payment');
      expect(messages[1].actingCapacity).toBe('Fellow');
    });

    it('attributes Coordinator in Financial Coverage mode to Coordinator, not Financial Admin', () => {
      const respId = 'h4d-resp-2026-09-emmanuel';
      const coordMember: Member = {
        id: 'member-zainab',
        h4dMemberId: 'H4D-00002',
        displayName: 'Zainab Aliyu',
        email: 'zainab@infinitegrace.local',
        roles: [MemberRole.FELLOW, MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR],
        createdAt: '2026-06-01T00:00:00Z',
      };

      store.addMessage({
        responsibilityId: respId,
        fellowId: 'member-emmanuel',
        sender: coordMember,
        activeMode: 'FINANCIAL_COVERAGE',
        content: 'Coverage notice: verification in progress.',
      });

      const messages = store.getMessagesForResponsibility(respId);
      const lastMsg = messages[messages.length - 1];
      expect(lastMsg.actingCapacity).toBe('L2E Accommodation Fellows Coordinator (Financial Admin Coverage)');
      expect(lastMsg.actingCapacity).not.toBe('Accommodation Financial Admin');
    });
  });
});
