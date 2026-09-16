import { describe, it, expect, beforeEach } from 'vitest';
import { roomOperationsStore } from '../services/roomOperationsStore';
import { roomCommonsStore } from '../services/roomCommonsStore';
import { notificationStore } from '../services/notificationStore';
import { DEMO_PENDING_ASSIGNMENTS } from '../data/demoPendingAssignments';

describe('H4D-ROOM-OPS: Room Captain Coverage & Delegated Candidate Choice', () => {
  beforeEach(() => {
    roomOperationsStore.resetForTesting();
    roomCommonsStore.resetForTesting();
    notificationStore.resetForTesting();
  });

  it('1. Loads Lagos Yaba campus rooms and the 13 demo candidates fixture', () => {
    const rooms = roomOperationsStore.getRooms();
    const candidates = roomOperationsStore.getCandidates();

    expect(rooms.length).toBeGreaterThanOrEqual(10);
    expect(candidates.length).toBe(13);

    // Verify 13 candidates are loaded as specified in the demo requirements
    expect(candidates).toHaveLength(13);
    expect(candidates[0].fullName).toBe('Blessing Nwosu');
    expect(candidates[12].fullName).toBe('Zubairu Mohammed');

    // Verify Room 304 exists with captain Chinedu Okeke
    const room304 = roomOperationsStore.getRoomById('room-304');
    expect(room304).toBeDefined();
    expect(room304?.captainName).toBe('Chinedu Okeke');
    expect(room304?.totalBeds).toBe(4);
  });

  it('2. Coordinator explicitly delegates candidate choice to Room Captain for Room 304 Bed 3', () => {
    const candidatePool = ['cand-001', 'cand-002'];

    const choice = roomOperationsStore.delegateCandidateChoice({
      roomId: 'room-304',
      bedId: 'bed-304-3',
      candidateIds: candidatePool,
      instructions: 'Evaluate peer study habits and living compatibility.',
      coordinatorAttribution: 'Zainab Aliyu (L2E Accommodation Fellows Coordinator)',
      captainMemberId: 'member-chinedu-captain',
      captainName: 'Chinedu Okeke',
    });

    expect(choice.id).toBeDefined();
    expect(choice.status).toBe('PENDING');
    expect(choice.candidateIds).toEqual(candidatePool);

    // Verify Room 304 status is now ATTENTION_REQUIRED
    const updatedRoom = roomOperationsStore.getRoomById('room-304');
    expect(updatedRoom?.status).toBe('ATTENTION_REQUIRED');
    expect(updatedRoom?.attentionReason).toContain('Candidate Choice');

    // Verify Bed 3 status is DELEGATED_CHOICE
    const bed3 = updatedRoom?.beds.find((b) => b.id === 'bed-304-3');
    expect(bed3?.status).toBe('DELEGATED_CHOICE');

    // Verify candidates are marked as DELEGATED_TO_CAPTAIN
    const cand1 = roomOperationsStore.getCandidateById('cand-001');
    const cand2 = roomOperationsStore.getCandidateById('cand-002');
    expect(cand1?.status).toBe('DELEGATED_TO_CAPTAIN');
    expect(cand2?.status).toBe('DELEGATED_TO_CAPTAIN');

    // Verify notification sent to Room Captain Chinedu Okeke
    const notifs = notificationStore.getNotificationsForMember('member-chinedu-captain');
    expect(notifs.some((n) => n.title.includes('Candidate Selection Delegated'))).toBe(true);

    // Verify event in Room Trail
    const trail = roomCommonsStore.getTrail('room-304');
    expect(trail.some((e) => e.eventType === 'OCCUPANCY_DELEGATED')).toBe(true);
  });

  it('3. Room Captain resolves choice within the delegated candidate pool', () => {
    // 1. Coordinator delegates
    const choice = roomOperationsStore.delegateCandidateChoice({
      roomId: 'room-304',
      bedId: 'bed-304-3',
      candidateIds: ['cand-001', 'cand-002'],
      instructions: 'Verify hub presence and shared living fit.',
      coordinatorAttribution: 'Zainab Aliyu (L2E Accommodation Fellows Coordinator)',
      captainMemberId: 'member-chinedu-captain',
      captainName: 'Chinedu Okeke',
    });

    // 2. Captain attempts to choose candidate NOT in the pool -> should throw
    expect(() => {
      roomOperationsStore.resolveCandidateChoice({
        choiceId: choice.id,
        selectedCandidateId: 'cand-009', // Not in pool
        captainMemberId: 'member-chinedu-captain',
        captainAttribution: 'Chinedu Okeke (Room Captain — Room 304)',
        note: 'Invalid candidate selection',
      });
    }).toThrow(/Candidate cand-009 is not part of the delegated candidate pool/);

    // 3. Captain selects candidate IN the pool (cand-001: Blessing Nwosu)
    roomOperationsStore.resolveCandidateChoice({
      choiceId: choice.id,
      selectedCandidateId: 'cand-001',
      captainMemberId: 'member-chinedu-captain',
      captainAttribution: 'Chinedu Okeke (Room Captain — Room 304)',
      note: 'Verified in-person presence; compatible study schedule.',
    });

    // Verify choice status is SELECTED
    const choices = roomOperationsStore.getDelegatedChoicesForRoom('room-304');
    const resolved = choices.find((c) => c.id === choice.id);
    expect(resolved?.status).toBe('SELECTED');
    expect(resolved?.selectedCandidateId).toBe('cand-001');

    // Verify cand-001 is ASSIGNED
    const cand1 = roomOperationsStore.getCandidateById('cand-001');
    expect(cand1?.status).toBe('ASSIGNED');
    expect(cand1?.assignedRoomId).toBe('room-304');
    expect(cand1?.assignedBedLabel).toBe('Bunk 3 (Lower)');

    // Verify non-selected cand-002 returned to PENDING_ASSIGNMENT
    const cand2 = roomOperationsStore.getCandidateById('cand-002');
    expect(cand2?.status).toBe('PENDING_ASSIGNMENT');

    // Verify bed-304-3 is now OCCUPIED with Blessing Nwosu
    const room = roomOperationsStore.getRoomById('room-304');
    const bed3 = room?.beds.find((b) => b.id === 'bed-304-3');
    expect(bed3?.status).toBe('OCCUPIED');
    expect(bed3?.occupantName).toBe('Blessing Nwosu');

    // Verify Room 304 occupiedBeds increased
    expect(room?.occupiedBeds).toBe(3);

    // Verify DECISION_MADE event in Room Trail
    const trail = roomCommonsStore.getTrail('room-304');
    expect(trail.some((e) => e.eventType === 'DECISION_MADE')).toBe(true);
  });

  it('4. Coordinator can directly assign a pending fellow to a vacant bed', () => {
    roomOperationsStore.assignCandidateDirectly({
      candidateId: 'cand-003', // Amina Yusuf
      roomId: 'room-304',
      bedId: 'bed-304-4',
      coordinatorAttribution: 'Zainab Aliyu (L2E Accommodation Fellows Coordinator)',
    });

    const cand3 = roomOperationsStore.getCandidateById('cand-003');
    expect(cand3?.status).toBe('ASSIGNED');
    expect(cand3?.assignedRoomId).toBe('room-304');

    const room = roomOperationsStore.getRoomById('room-304');
    const bed4 = room?.beds.find((b) => b.id === 'bed-304-4');
    expect(bed4?.status).toBe('OCCUPIED');
    expect(bed4?.occupantName).toBe('Amina Yusuf');
  });

  it('5. Room Commons guidelines can be posted and retrieved', () => {
    const notice = roomCommonsStore.addNotice({
      roomId: 'room-304',
      roomName: 'Room 304',
      title: 'Night Rhythms & Inverter Protocols',
      content: 'Quiet hours begin 10:00 PM. Main lights dim, desk lamps permitted.',
      postedBy: 'Chinedu Okeke (Room Captain)',
      category: 'GUIDELINE',
    });

    expect(notice.id).toBeDefined();

    const notices = roomCommonsStore.getNotices('room-304');
    expect(notices.some((n) => n.title === 'Night Rhythms & Inverter Protocols')).toBe(true);
  });

  it('6. Room Communication handles audited channels with explicit sender role attribution', () => {
    const msg = roomCommonsStore.addMessage({
      roomId: 'room-304',
      channel: 'COORDINATOR_DISPATCH',
      senderId: 'member-chinedu-captain',
      senderName: 'Chinedu Okeke',
      senderCapacity: 'Room Captain — Room 304',
      content: 'Bed 3 candidate choice completed. Moving in this evening.',
    });

    expect(msg.id).toBeDefined();

    const messages = roomCommonsStore.getMessages('room-304', 'COORDINATOR_DISPATCH');
    expect(messages.some((m) => m.content.includes('Bed 3 candidate choice completed'))).toBe(true);
  });
});
