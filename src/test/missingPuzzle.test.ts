import { describe, it, expect, beforeEach } from 'vitest';
import {
  puzzleFeedbackStore,
  SharedMissingPuzzleReport,
} from '../services/puzzleFeedbackStore';
import { notificationStore } from '../services/notificationStore';
import { Member, MemberRole } from '../domain/auth';

describe('H4D-DEMO-005: Shared Missing-Puzzle Feedback & Community Triage', () => {
  const fellowMember: Member = {
    id: 'fellow-tobi-01',
    email: 'tobi@hut4devs.org',
    displayName: 'Tobi Adebayo',
    h4dMemberId: 'H4D-00101',
    roles: [MemberRole.FELLOW],
    createdAt: new Date().toISOString(),
  };

  const coordinatorMember: Member = {
    id: 'coord-amara-01',
    email: 'amara@hut4devs.org',
    displayName: 'Amara Okafor',
    h4dMemberId: 'H4D-00002',
    roles: [MemberRole.FELLOW, MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR],
    createdAt: new Date().toISOString(),
  };

  const otherFellowMember: Member = {
    id: 'fellow-kalu-02',
    email: 'kalu@hut4devs.org',
    displayName: 'Kalu Uche',
    h4dMemberId: 'H4D-00102',
    roles: [MemberRole.FELLOW],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    notificationStore.clearAll();
  });

  it('1. retrieves seeded reports with backward compatibility', () => {
    const reports = puzzleFeedbackStore.getReports();
    expect(reports.length).toBeGreaterThanOrEqual(2);
    expect(reports.some((r) => r.category === 'Accommodation Flow')).toBe(true);
    expect(reports.some((r) => r.category === 'Visual / UI Glitch')).toBe(true);
  });

  it('2. creates new feedback report with append-only event and honest persistence classification', async () => {
    const { report, persistence } = await puzzleFeedbackStore.createFeedback(
      {
        title: 'BedRock wifi router drops connection during evening peak',
        description: 'Room 302 frequently experiences 5-minute disconnects around 8pm.',
        category: 'Performance / Speed',
        pageContext: 'BedRock Room 302',
        reporterMemberId: fellowMember.id,
        reporterDisplayName: fellowMember.displayName,
        reporterEmail: fellowMember.email,
        h4dMemberId: fellowMember.h4dMemberId,
        puzzleCompleted: true,
        involvementPreference: 'HELP_TEST',
      },
      fellowMember
    );

    expect(report.id).toBeDefined();
    expect(report.title).toBe('BedRock wifi router drops connection during evening peak');
    expect(['PENDING_REVIEW', 'OPEN']).toContain(report.status);
    expect(report.events).toHaveLength(1);
    expect(report.events[0].eventType).toBe('FEEDBACK_CREATED');
    expect(report.events[0].actorMemberId).toBe(fellowMember.id);
    expect(report.involvementPreference).toBe('HELP_TEST');
    expect(['SHARED_OPERATIONAL_PERSISTENCE', 'DEMO_LOCAL_FALLBACK']).toContain(persistence);

    // Verify it is queryable in store
    const inStore = puzzleFeedbackStore.getReportById(report.id);
    expect(inStore).toBeDefined();
    expect(inStore?.id).toBe(report.id);
  });

  it('3. rejects unauthorized non-coordinator attempts to acknowledge or resolve feedback', async () => {
    const { report } = await puzzleFeedbackStore.createFeedback(
      {
        title: 'Stray border highlight in dark mode receipt view',
        description: 'Borders show high opacity cyan instead of caramel gold.',
        category: 'Visual / UI Glitch',
        reporterMemberId: fellowMember.id,
        reporterDisplayName: fellowMember.displayName,
      },
      fellowMember
    );

    // Fellow attempts coordinator action -> must be rejected
    await expect(
      puzzleFeedbackStore.acknowledgeFeedback(
        report.id,
        otherFellowMember,
        'I am not a coordinator but trying to acknowledge.'
      )
    ).rejects.toThrow(/Authorization denied/);

    await expect(
      puzzleFeedbackStore.resolveFeedback(
        report.id,
        otherFellowMember,
        'Trying to resolve without authority.'
      )
    ).rejects.toThrow(/Authorization denied/);
  });

  it('4. coordinator can acknowledge feedback, appending event and notifying reporter', async () => {
    const { report } = await puzzleFeedbackStore.createFeedback(
      {
        title: 'Chamber keycard tap delay at Infinite Grace gate',
        description: 'Scanner takes 4 seconds to register contactless card.',
        category: 'Accommodation Flow',
        reporterMemberId: fellowMember.id,
        reporterDisplayName: fellowMember.displayName,
      },
      fellowMember
    );

    const acknowledged = await puzzleFeedbackStore.acknowledgeFeedback(
      report.id,
      coordinatorMember,
      'Acknowledged by Accommodation Coordinator. Testing hardware reader tomorrow.'
    );

    expect(['UNDER_REVIEW', 'ACKNOWLEDGED']).toContain(acknowledged.status);
    expect(acknowledged.events.length).toBe(2);
    expect(acknowledged.events[1].eventType).toBe('FEEDBACK_ACKNOWLEDGED');
    expect(acknowledged.events[1].actorMemberId).toBe(coordinatorMember.id);
    expect(acknowledged.events[1].actorCapacity).toBe('L2E Accommodation Fellows Coordinator');

    // Verify reporter was notified
    const reporterNotifications = notificationStore.getNotificationsForMember(fellowMember.id);
    expect(reporterNotifications.length).toBeGreaterThanOrEqual(1);
    expect(reporterNotifications.some((n) => n.title.includes('Acknowledged') || n.title.includes('Review'))).toBe(true);
  });

  it('5. coordinator can request clarification and reporter can reply directly', async () => {
    const { report } = await puzzleFeedbackStore.createFeedback(
      {
        title: 'Peer support repayment calculation rounding issue',
        description: 'Split contribution showed 1 kobo variance on test agreement.',
        category: 'Peer Support',
        reporterMemberId: fellowMember.id,
        reporterDisplayName: fellowMember.displayName,
      },
      fellowMember
    );

    // Coordinator requests clarification
    const withClarification = await puzzleFeedbackStore.requestClarification(
      report.id,
      coordinatorMember,
      'Could you specify the exact agreement ID and contribution amount?'
    );

    expect(withClarification.events.some((e) => e.eventType === 'CLARIFICATION_REQUESTED')).toBe(true);

    // Reporter received notification
    const notifications = notificationStore.getNotificationsForMember(fellowMember.id);
    expect(notifications.some((n) => n.title.includes('Clarification Requested'))).toBe(true);

    // Reporter replies
    const withReply = await puzzleFeedbackStore.replyToClarification(
      report.id,
      fellowMember,
      'It occurred on Agreement PSA-004 with ₦15,000 partial contribution.'
    );

    expect(withReply.events.some((e) => e.eventType === 'MEMBER_REPLIED')).toBe(true);
    const lastEvent = withReply.events[withReply.events.length - 1];
    expect(lastEvent.actorMemberId).toBe(fellowMember.id);
    expect(lastEvent.message).toContain('PSA-004');
  });

  it('6. advances status through PENDING_REVIEW -> UNDER_REVIEW -> IN_PROGRESS -> IMPLEMENTED', async () => {
    const { report } = await puzzleFeedbackStore.createFeedback(
      {
        title: 'Mobile keypad hides submit button on loan request form',
        description: 'Virtual keyboard pushes modal container off screen on small viewports.',
        category: 'Visual / UI Glitch',
        reporterMemberId: fellowMember.id,
        reporterDisplayName: fellowMember.displayName,
      },
      fellowMember
    );

    expect(['PENDING_REVIEW', 'OPEN']).toContain(report.status);

    // Transition to UNDER_REVIEW
    const underReview = await puzzleFeedbackStore.updateStatus(
      report.id,
      coordinatorMember,
      'UNDER_REVIEW',
      'Evaluating UX impact on smaller screens.'
    );
    expect(underReview.status).toBe('UNDER_REVIEW');

    // Transition to IN_PROGRESS
    const inProgress = await puzzleFeedbackStore.updateStatus(
      report.id,
      coordinatorMember,
      'IN_PROGRESS',
      'Fix assigned to community contributor.'
    );
    expect(inProgress.status).toBe('IN_PROGRESS');

    // Transition to IMPLEMENTED
    const resolved = await puzzleFeedbackStore.resolveFeedback(
      report.id,
      coordinatorMember,
      'Adjusted container to use interactive-widget=resizes-content viewport and safe-area padding.'
    );
    expect(['IMPLEMENTED', 'RESOLVED']).toContain(resolved.status);

    // Verify all events are present in chronological order
    const eventTypes = resolved.events.map((e) => e.eventType);
    expect(eventTypes).toContain('FEEDBACK_CREATED');
    expect(eventTypes).toContain('STATUS_CHANGED');
    expect(eventTypes).toContain('RESOLVED');

    // Reporter notified of resolution
    const reporterNotifs = notificationStore.getNotificationsForMember(fellowMember.id);
    expect(reporterNotifs.some((n) => n.title.includes('Resolved') || n.title.includes('Implemented'))).toBe(true);
  });

  it('7. member can update involvement preference and notification read/unread state persists', async () => {
    const { report } = await puzzleFeedbackStore.createFeedback(
      {
        title: 'MainBase water tank level indicator sensor lag',
        description: 'Chamber dashboard takes 15 minutes to reflect tank refilling.',
        category: 'Accommodation Flow',
        reporterMemberId: fellowMember.id,
        reporterDisplayName: fellowMember.displayName,
        involvementPreference: 'JUST_LOG',
      },
      fellowMember
    );

    // Update involvement preference
    const updated = await puzzleFeedbackStore.updateInvolvementForMember(
      report.id,
      fellowMember,
      'CONTRIBUTE_FIX'
    );
    expect(updated.involvementPreference).toBe('CONTRIBUTE_FIX');
    expect(updated.events.some((e) => e.eventType === 'CONTRIBUTION_VOLUNTEERED')).toBe(true);

    // Test notification read/unread persistence
    notificationStore.addNotification({
      memberId: fellowMember.id,
      title: 'Status Update',
      message: 'Your report is being reviewed.',
      feedbackId: report.id,
      read: false,
    });

    expect(notificationStore.getUnreadCount(fellowMember.id)).toBeGreaterThan(0);
    const unreadList = notificationStore.getNotificationsForMember(fellowMember.id);
    const targetNotif = unreadList[0];

    notificationStore.markAsRead(targetNotif.id, fellowMember.id);
    expect(notificationStore.getUnreadCount(fellowMember.id)).toBe(unreadList.length - 1);

    notificationStore.markAllAsRead(fellowMember.id);
    expect(notificationStore.getUnreadCount(fellowMember.id)).toBe(0);
  });
});
