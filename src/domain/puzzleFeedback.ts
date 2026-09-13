/**
 * Domain types and models for H4D-DEMO-005 Shared Missing-Puzzle Feedback
 * and Community Triage.
 *
 * Operational persistence: Firestore
 * Invariant: Financial authority remains strictly PostgreSQL;
 * feedback records are NEVER mixed into financial tables.
 */

export type FeedbackStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'IMPLEMENTED'
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'CLOSED';

export type MissingPuzzleInvolvement =
  | 'JUST_LOG'
  | 'CONTACT_ME'
  | 'HELP_TEST'
  | 'CONTRIBUTE_FIX'
  | 'CONSULT_DESIGN';

export type FeedbackEventType =
  | 'FEEDBACK_CREATED'
  | 'FEEDBACK_ACKNOWLEDGED'
  | 'STATUS_CHANGED'
  | 'CLARIFICATION_REQUESTED'
  | 'MEMBER_REPLIED'
  | 'TESTING_VOLUNTEERED'
  | 'CONTRIBUTION_VOLUNTEERED'
  | 'RESOLVED'
  | 'CLOSED';

export type PersistenceClassification =
  | 'SHARED_OPERATIONAL_PERSISTENCE'
  | 'DEMO_LOCAL_FALLBACK';

export interface FeedbackEvent {
  eventId: string;
  feedbackId: string;
  actorMemberId: string;
  actorDisplayName: string;
  actorCapacity?: string;
  eventType: FeedbackEventType;
  timestamp: string;
  message?: string;
  details?: Record<string, any>;
}

export interface SharedMissingPuzzleReport {
  id: string;
  reporterMemberId: string;
  reporterDisplayName: string;
  reporterEmail?: string;
  createdAt: string;
  updatedAt: string;
  pageContext: string;
  routeContext?: string;
  category: string;
  title: string;
  description: string;
  puzzleCompleted: boolean;
  involvementPreference: MissingPuzzleInvolvement;
  status: FeedbackStatus;
  events: FeedbackEvent[];
  persistenceClassification: PersistenceClassification;

  // Backwards compatibility properties for existing UI and tests
  loggedBy: {
    id: string;
    displayName: string;
    h4dMemberId: string;
    email?: string;
  };
  timestamp: string;
  locationContext?: string;
  involvement?: MissingPuzzleInvolvement;
}

export interface CreateFeedbackInput {
  title: string;
  description: string;
  category: string;
  pageContext?: string;
  routeContext?: string;
  locationContext?: string;
  puzzleCompleted?: boolean;
  involvementPreference?: MissingPuzzleInvolvement;
  reporterMemberId: string;
  reporterDisplayName: string;
  reporterEmail?: string;
  h4dMemberId?: string;
}
