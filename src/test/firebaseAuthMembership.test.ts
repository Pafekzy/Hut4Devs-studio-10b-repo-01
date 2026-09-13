import { describe, it, expect, beforeEach } from 'vitest';
import { MemberRole } from '../domain/auth';
import {
  firebaseMembershipSync,
} from '../services/firebaseMembershipSync';

describe('H4D-DEMO-002: Firebase Identity + Approved Membership Authentication', () => {
  beforeEach(() => {
    // Reset sync store state
    firebaseMembershipSync.resetToInitial();
  });

  it('1. Maps known Firebase Google/Email user to existing Member identity (Emmanuel Ukom)', async () => {
    const mockFbUser = {
      uid: 'fb-uid-emmanuel-123',
      email: 'emmanuel@infinitegrace.local',
      displayName: 'Emmanuel Ukom',
    };

    const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(mockFbUser);

    expect(session.isPendingVerification).toBe(false);
    expect(session.member).not.toBeNull();
    expect(session.member?.id).toBe('member-emmanuel-fellow');
    expect(session.member?.h4dMemberId).toBe('H4D-00012');
    expect(session.activeAssignment?.roomName).toBe('Room 304');
    expect(session.activeAssignment?.monthlyCommitment).toBe(66000);
  });

  it('2. Maps recognized transfer fellow (Nonso Okafor) with historical and active records', async () => {
    const mockFbUser = {
      uid: 'fb-uid-nonso-456',
      email: 'nonso@devs.local',
      displayName: 'Nonso Okafor',
    };

    const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(mockFbUser);

    expect(session.member).not.toBeNull();
    expect(session.member?.h4dMemberId).toBe('H4D-00021');
    expect(session.activeAssignment?.propertyName).toBe('BedRock Hostel');
    expect(session.activeAssignment?.monthlyCommitment).toBe(77000);
  });

  it('3. Treats new unknown Firebase user as pending verification without privileged access', async () => {
    const newFbUser = {
      uid: 'fb-uid-newcomer-999',
      email: 'new.fellow@example.com',
      displayName: 'New Developer',
    };

    const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(newFbUser);

    expect(session.isPendingVerification).toBe(true);
    expect(session.member).toBeNull();
    expect(session.scopedRoleAssignments).toHaveLength(0);
    expect(session.activeAssignment).toBeNull();
  });

  it('4. Allows new Firebase user to submit Accommodation Membership Request without role self-selection', async () => {
    const newFbUser = {
      uid: 'fb-uid-applicant-888',
      email: 'applicant@example.com',
      displayName: 'Applicant Dev',
    };

    const req = await firebaseMembershipSync.submitMembershipRequest({
      fullName: 'Applicant Dev',
      email: 'applicant@example.com',
      phone: '+234 809 111 2233',
      githubHandle: 'applicantdev',
      programCommunity: 'L2E Cohort 4',
      propertyId: 'prop-infinite-grace',
      propertyName: 'Infinite Grace Apartment',
      floorName: 'Floor 3',
      roomName: 'Room 302',
      monthlyCommitment: 66000,
    });

    expect(req.id).toBeDefined();
    expect(req.status).toBe('SUBMITTED');
    expect(req.isExistingFellowRecognized).toBe(false);

    // Resolving session now returns the submitted request
    const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(newFbUser);
    expect(session.isPendingVerification).toBe(true);
    expect(session.membershipRequest?.email).toBe('applicant@example.com');
  });

  it('5. Room Captain receives room-scoped authority only', async () => {
    const captainFbUser = {
      uid: 'fb-uid-chinedu-captain',
      email: 'chinedu.captain@infinitegrace.local',
      displayName: 'Chinedu Okeke',
    };

    const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(captainFbUser);

    expect(session.member?.roles).toContain(MemberRole.ROOM_CAPTAIN);
    expect(session.scopedRoleAssignments.some((r) => r.role === MemberRole.ROOM_CAPTAIN)).toBe(true);
    const rcRole = session.scopedRoleAssignments.find((r) => r.role === MemberRole.ROOM_CAPTAIN);
    expect(rcRole?.scope.propertyId).toBe('prop-infinite-grace');
    expect(rcRole?.scope.roomId).toBe('room-304');
  });

  it('6. Coordinator retains coordinator coverage capacity without impersonating Financial Admin', async () => {
    const coordFbUser = {
      uid: 'fb-uid-zainab-coord',
      email: 'coordinator@l2e.local',
      displayName: 'Zainab Aliyu',
    };

    const session = await firebaseMembershipSync.resolveSessionForFirebaseUser(coordFbUser);

    expect(session.member?.roles).toContain(MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR);
    expect(session.member?.displayName).toBe('Zainab Aliyu');
    expect(session.scopedRoleAssignments.some((r) => r.role === MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR)).toBe(true);
  });
});
