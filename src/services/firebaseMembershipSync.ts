import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  FirebaseUser,
} from './firebase';
import {
  Member,
  MemberRole,
} from '../domain/auth';
import {
  AccommodationMembershipRequest,
  AccommodationAssignment,
  ScopedRoleAssignment,
  ResponsibilityMessage,
  ActiveMode,
  formatActionAttribution,
} from '../domain/membership';
import {
  DEMO_MEMBERS,
  DEMO_MEMBERSHIP_REQUESTS,
  DEMO_ACCOMMODATION_ASSIGNMENTS,
  DEMO_SCOPED_ROLE_ASSIGNMENTS,
  DEMO_RESPONSIBILITY_MESSAGES,
} from '../data/demoMembership';

export interface AuthIdentityRecord {
  firebaseUid: string;
  memberId: string;
  email: string;
  displayName: string;
  providerTypes: string[];
  createdAt: string;
  lastAuthenticatedAt: string;
}

export interface UserSessionState {
  firebaseUser: FirebaseUser | { uid: string; email?: string | null; displayName?: string | null; providerData?: any[] } | null;
  authIdentity: AuthIdentityRecord | null;
  member: Member | null;
  activeAssignment: AccommodationAssignment | null;
  scopedRoleAssignments: ScopedRoleAssignment[];
  membershipRequest: AccommodationMembershipRequest | null;
  isPendingVerification: boolean;
}

class FirebaseMembershipSync {
  private isSeeded = false;
  private inMemoryRequests: AccommodationMembershipRequest[] = [];
  private inMemoryAuthIdentities: Record<string, AuthIdentityRecord> = {};

  /**
   * Reset local state for testing
   */
  resetToInitial(): void {
    this.isSeeded = false;
    this.inMemoryRequests = [];
    this.inMemoryAuthIdentities = {};
  }

  /**
   * Ensure Firestore collections have the initial DEMO data on first run
   */
  async ensureDemoSeeded(): Promise<void> {
    if (this.isSeeded) return;
    try {
      const membersRef = collection(db, 'members');
      const snap = await getDocs(membersRef);

      if (snap.empty) {
        console.log('[Firestore] Bootstrapping initial DEMO datasets...');

        // Seed Members
        for (const m of DEMO_MEMBERS) {
          await setDoc(doc(db, 'members', m.id), m);
        }

        // Seed Membership Requests
        for (const req of DEMO_MEMBERSHIP_REQUESTS) {
          await setDoc(doc(db, 'membershipRequests', req.id), req);
        }

        // Seed Accommodation Assignments
        for (const ass of DEMO_ACCOMMODATION_ASSIGNMENTS) {
          await setDoc(doc(db, 'accommodationAssignments', ass.id), ass);
        }

        // Seed Scoped Role Assignments
        for (const sra of DEMO_SCOPED_ROLE_ASSIGNMENTS) {
          await setDoc(doc(db, 'scopedRoleAssignments', sra.id), sra);
        }

        // Seed Responsibility Messages
        for (const msg of DEMO_RESPONSIBILITY_MESSAGES) {
          await setDoc(doc(db, 'responsibilityMessages', msg.id), msg);
        }

        console.log('[Firestore] Initial DEMO dataset seeded successfully.');
      }
      this.isSeeded = true;
    } catch (err) {
      // Offline/read fallback for DEMO seeding in testing
    }
  }

  /**
   * Resolves or provisions a Hut4Devs Member for an authenticated Firebase user
   */
  async resolveSessionForFirebaseUser(firebaseUser: FirebaseUser | { uid: string; email?: string | null; displayName?: string | null; providerData?: any[] }): Promise<UserSessionState> {
    await this.ensureDemoSeeded();

    const userEmail = (firebaseUser.email || '').toLowerCase().trim();
    const uid = firebaseUser.uid;
    const providerIds = (firebaseUser.providerData || []).map((p: any) => p.providerId);

    // 1. Check if authIdentity already exists for this Firebase UID
    let authIdentityDoc: AuthIdentityRecord | null = this.inMemoryAuthIdentities[uid] || null;
    try {
      const idDocRef = doc(db, 'authIdentities', uid);
      const idSnap = await getDoc(idDocRef);

      if (idSnap.exists()) {
        authIdentityDoc = idSnap.data() as AuthIdentityRecord;
        // Update lastAuthenticatedAt
        await updateDoc(idDocRef, {
          lastAuthenticatedAt: new Date().toISOString(),
          providerTypes: Array.from(new Set([...authIdentityDoc.providerTypes, ...providerIds])),
        }).catch(() => {});
      }
    } catch (e) {
      // Fallback to in-memory/demo cache
    }

    // 2. If no direct UID link, check if email matches an existing known member (e.g. seeded demo accounts or returning fellow)
    let member: Member | null = null;
    let memberId = authIdentityDoc?.memberId || null;

    if (!memberId && userEmail) {
      // Look up member by email in Firestore or Demo Data
      try {
        const membersQuery = query(collection(db, 'members'), where('email', '==', userEmail));
        const memberSnaps = await getDocs(membersQuery);
        if (!memberSnaps.empty) {
          member = memberSnaps.docs[0].data() as Member;
          memberId = member.id;
        }
      } catch (e) {
        // Fallback to local demo list
      }

      if (!member) {
        // Check local demo members
        const demoMatch = DEMO_MEMBERS.find((m) => m.email && m.email.toLowerCase() === userEmail);
        if (demoMatch) {
          member = demoMatch;
          memberId = demoMatch.id;
        }
      }
    } else if (memberId) {
      try {
        const memSnap = await getDoc(doc(db, 'members', memberId));
        if (memSnap.exists()) {
          member = memSnap.data() as Member;
        }
      } catch (e) {
        // Fallback
      }

      if (!member) {
        member = DEMO_MEMBERS.find((m) => m.id === memberId) || null;
      }
    }

    // 3. If member is still null, check if there's a pending or submitted Membership Request for this email or UID
    let membershipRequest: AccommodationMembershipRequest | null = null;
    try {
      const reqQuery = query(
        collection(db, 'membershipRequests'),
        where('email', '==', userEmail)
      );
      const reqSnaps = await getDocs(reqQuery);
      if (!reqSnaps.empty) {
        membershipRequest = reqSnaps.docs[reqSnaps.docs.length - 1].data() as AccommodationMembershipRequest;
      }
    } catch (e) {
      // Fallback
    }

    if (!membershipRequest) {
      const inMemMatch = this.inMemoryRequests.find((r) => r.email.toLowerCase() === userEmail);
      if (inMemMatch) {
        membershipRequest = inMemMatch;
      }
    }

    if (!membershipRequest) {
      const localReq = DEMO_MEMBERSHIP_REQUESTS.find((r) => r.email.toLowerCase() === userEmail);
      if (localReq) {
        membershipRequest = localReq;
      }
    }

    // 4. If this is a completely brand new user (no member, no membership request)
    if (!authIdentityDoc) {
      authIdentityDoc = {
        firebaseUid: uid,
        memberId: memberId || `member-${uid.slice(0, 8)}`,
        email: userEmail,
        displayName: firebaseUser.displayName || userEmail.split('@')[0] || 'Fellow Candidate',
        providerTypes: providerIds.length > 0 ? providerIds : ['password'],
        createdAt: new Date().toISOString(),
        lastAuthenticatedAt: new Date().toISOString(),
      };
      this.inMemoryAuthIdentities[uid] = authIdentityDoc;

      try {
        await setDoc(doc(db, 'authIdentities', uid), authIdentityDoc);
      } catch (e) {
        // Fallback
      }
    }

    // 5. Load Active Accommodation Assignment and Scoped Roles
    let activeAssignment: AccommodationAssignment | null = null;
    let scopedRoleAssignments: ScopedRoleAssignment[] = [];

    if (member) {
      try {
        // Load assignment
        const assQuery = query(
          collection(db, 'accommodationAssignments'),
          where('memberId', '==', member.id),
          where('status', '==', 'ACTIVE')
        );
        const assSnaps = await getDocs(assQuery);
        if (!assSnaps.empty) {
          activeAssignment = assSnaps.docs[0].data() as AccommodationAssignment;
        }
      } catch (e) {
        // Fallback
      }

      if (!activeAssignment) {
        activeAssignment =
          DEMO_ACCOMMODATION_ASSIGNMENTS.find(
            (a) => a.memberId === member!.id && a.status === 'ACTIVE'
          ) || null;
      }

      try {
        // Load scoped roles
        const sraQuery = query(
          collection(db, 'scopedRoleAssignments'),
          where('memberId', '==', member.id)
        );
        const sraSnaps = await getDocs(sraQuery);
        scopedRoleAssignments = sraSnaps.docs
          .map((d) => d.data() as ScopedRoleAssignment)
          .filter((a) => !a.revokedAt);
      } catch (e) {
        // Fallback
      }

      if (scopedRoleAssignments.length === 0) {
        scopedRoleAssignments = DEMO_SCOPED_ROLE_ASSIGNMENTS.filter(
          (a) => a.memberId === member!.id && !a.revokedAt
        );
      }
    }

    // 6. Determine pending state:
    const isPendingVerification = !member || (!activeAssignment && membershipRequest?.status !== 'APPROVED');

    return {
      firebaseUser,
      authIdentity: authIdentityDoc,
      member,
      activeAssignment,
      scopedRoleAssignments,
      membershipRequest,
      isPendingVerification,
    };
  }

  /**
   * Submit a new Membership Request from an authenticated user
   */
  async submitMembershipRequest(params: {
    firebaseUser?: FirebaseUser | { uid: string; email?: string | null; displayName?: string | null };
    fullName: string;
    email: string;
    phone?: string;
    githubHandle?: string;
    programCommunity: string;
    propertyId: string;
    propertyName?: string;
    floorName?: string;
    roomName: string;
    monthlyCommitment?: number;
  }): Promise<AccommodationMembershipRequest> {
    await this.ensureDemoSeeded();

    const normalizedEmail = params.email.toLowerCase().trim();
    const requestId = `req-${Date.now()}`;

    // Check for existing fellow match to preserve identity
    let existingMemberId: string | undefined;
    let isExistingFellowRecognized = false;
    let previousAccommodation: AccommodationMembershipRequest['previousAccommodation'];

    const demoExisting = DEMO_MEMBERS.find((m) => m.email && m.email.toLowerCase() === normalizedEmail);
    if (demoExisting) {
      existingMemberId = demoExisting.id;
      isExistingFellowRecognized = true;
      const pastAss = DEMO_ACCOMMODATION_ASSIGNMENTS.find((a) => a.memberId === demoExisting.id);
      if (pastAss) {
        previousAccommodation = {
          propertyName: pastAss.propertyName,
          roomName: pastAss.roomName,
          period: pastAss.period,
        };
      }
    }

    const newRequest: AccommodationMembershipRequest = {
      id: requestId,
      memberId: existingMemberId,
      fullName: params.fullName.trim(),
      email: normalizedEmail,
      phone: params.phone,
      githubHandle: params.githubHandle,
      programCommunity: params.programCommunity.trim(),
      propertyId: params.propertyId,
      propertyName: params.propertyName || (params.propertyId === 'prop-bedrock-hostel' ? 'BedRock Hostel' : 'Infinite Grace Apartment'),
      floorName: params.floorName,
      roomName: params.roomName.trim(),
      monthlyCommitment: params.monthlyCommitment || 66000,
      status: 'SUBMITTED',
      isExistingFellowRecognized,
      previousAccommodation,
      submittedAt: new Date().toISOString(),
    };

    this.inMemoryRequests.push(newRequest);

    try {
      await setDoc(doc(db, 'membershipRequests', requestId), newRequest);
    } catch (e) {
      // Fallback in-memory cached
    }

    return newRequest;
  }
}

export const firebaseMembershipSync = new FirebaseMembershipSync();
