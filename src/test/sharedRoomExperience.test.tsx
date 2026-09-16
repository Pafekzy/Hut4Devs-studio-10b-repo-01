import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SharedRoomWorkspace } from '../components/room/SharedRoomWorkspace';
import { RoommateCards } from '../components/room/RoommateCards';
import { RoomStorySection } from '../components/room/RoomStorySection';
import { RoomAlumniSection } from '../components/room/RoomAlumniSection';
import { RoomCultureSection } from '../components/room/RoomCultureSection';
import { MemberHomeView } from '../components/MemberHomeView';
import {
  DEMO_ROOM_304_ROOMMATES,
  DEMO_ROOM_304_STORY,
  DEMO_ROOM_304_ALUMNI,
  DEMO_ROOM_304_CULTURE,
} from '../data/demoRoomStory';
import { roomOperationsStore } from '../services/roomOperationsStore';
import { Member, MemberRole } from '../domain/auth';

const mockResponsibility: any = {
  id: 'resp-1',
  fellowId: 'mem-1',
  fellowName: 'Emmanuel Ukom',
  roomNumber: 'Room 304',
  propertyName: 'Infinite Grace Apartment',
  monthlyContribution: 45000,
  currentStatus: 'UP_TO_DATE',
  lastPaymentDate: '2026-09-01',
  nextDueDate: '2026-10-01',
  balanceDue: 0,
  requiredAmount: 45000,
  verifiedAmount: 45000,
  remainingAmount: 0,
  status: 'CURRENT',
  accommodationContext: {
    property: { id: 'prop-1', name: 'Infinite Grace Apartment' },
    floor: { id: 'fl-3', name: 'Floor 3' },
    room: { id: 'room-304', name: 'Room 304' },
    bed: { id: 'bed-1', name: 'Bunk 1' },
  },
  paymentHistory: [],
};

const mockFellow: Member = {
  id: 'member-emmanuel-fellow',
  displayName: 'Emmanuel Ukom',
  roles: [],
  h4dMemberId: 'H4D-00021',
  createdAt: '2026-01-10T08:00:00Z',
};

const mockCaptain: Member = {
  id: 'member-chinedu-captain',
  displayName: 'Chinedu Okeke',
  roles: [MemberRole.ROOM_CAPTAIN],
  h4dMemberId: 'H4D-00004',
  createdAt: '2025-11-01T08:00:00Z',
};

describe('🛖 Shared Room Experience & Belonging Hub', () => {
  const room304 = roomOperationsStore.getRoomById('room-304')!;

  it('renders SharedRoomWorkspace in FELLOW mode with appropriate public tabs and without unauthorized actions', () => {
    render(
      <SharedRoomWorkspace
        room={room304}
        viewerRole="FELLOW"
        currentMember={mockFellow}
        isDark={false}
      />
    );

    // Context & scope indicator
    expect(screen.getByText('Resident Fellow')).toBeInTheDocument();
    expect(screen.getAllByText(/Room 304/).length).toBeGreaterThan(0);

    // Standard public/community tabs
    expect(screen.getByText('Overview & Bunks')).toBeInTheDocument();
    expect(screen.getByText('Roommates')).toBeInTheDocument();
    expect(screen.getByText('Room Story')).toBeInTheDocument();
    expect(screen.getByText('Room Alumni')).toBeInTheDocument();
    expect(screen.getByText('Room Culture')).toBeInTheDocument();
    expect(screen.getByText('Room Commons')).toBeInTheDocument();
    expect(screen.getByText('Room Trail')).toBeInTheDocument();

    // Authority boundary: FELLOW does NOT see administrative actions or private dispatch
    expect(screen.queryByText('Captain Actions')).not.toBeInTheDocument();
    expect(screen.queryByText('Room Actions')).not.toBeInTheDocument();
  });

  it('renders SharedRoomWorkspace in ROOM_CAPTAIN mode with delegated authority and actions', () => {
    render(
      <SharedRoomWorkspace
        room={room304}
        viewerRole="ROOM_CAPTAIN"
        currentMember={mockCaptain}
        isDark={false}
      />
    );

    // Authority badge
    expect(screen.getByText('Delegated Captain Scope')).toBeInTheDocument();

    // Includes Captain Actions
    expect(screen.getByText('Captain Actions')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
  });

  it('displays roommate public profiles with safe birthdays and opens public detail modal', () => {
    render(
      <RoommateCards
        roommates={DEMO_ROOM_304_ROOMMATES}
        isDark={false}
      />
    );

    // Roommate names
    expect(screen.getByText('Emmanuel Ukom')).toBeInTheDocument();
    expect(screen.getByText('Chinedu Okeke')).toBeInTheDocument();
    expect(screen.getByText('Blessing Nwosu')).toBeInTheDocument();

    // Safe birthday celebration format without year
    expect(screen.getByText(/15 August/)).toBeInTheDocument();
    expect(screen.getByText(/22 October/)).toBeInTheDocument();

    // Privacy check: ensure full birth dates with years (e.g. 1998, 2001) are not shown
    expect(screen.queryByText(/1998/)).not.toBeInTheDocument();
    expect(screen.queryByText(/2001/)).not.toBeInTheDocument();

    // Click to view public profile
    const viewButtons = screen.getAllByText(/View Profile/);
    fireEvent.click(viewButtons[0]);

    // Modal opens with public bio and project
    expect(screen.getByText('Public Bio')).toBeInTheDocument();
    expect(screen.getAllByText(/Passionate about accessible web architecture/).length).toBe(2);

    // Close modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('Public Bio')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Passionate about accessible web architecture/).length).toBe(1);
  });

  it('renders Room Story facts with category filter', () => {
    render(
      <RoomStorySection
        storyFacts={DEMO_ROOM_304_STORY}
        roomNumber="Room 304"
        isDark={false}
      />
    );

    expect(screen.getByText(/Our Room Story/)).toBeInTheDocument();
    expect(screen.getByText('First Inhabitation of Room 304')).toBeInTheDocument();
    expect(screen.getByText('Zero-Dropout Capstone Sprint Celebration')).toBeInTheDocument();

    // Filter by Community Moments
    fireEvent.click(screen.getByRole('button', { name: /Community Moments/i }));
    expect(screen.getByText('Zero-Dropout Capstone Sprint Celebration')).toBeInTheDocument();
    expect(screen.queryByText('First Inhabitation of Room 304')).not.toBeInTheDocument();
  });

  it('renders Room Alumni with continuum memory and residency periods', () => {
    render(
      <RoomAlumniSection
        alumniRecords={DEMO_ROOM_304_ALUMNI}
        roomNumber="Room 304"
        isDark={false}
      />
    );

    expect(screen.getByText(/Room Alumni Memory/)).toBeInTheDocument();
    expect(screen.getByText('Babajide Adekunle')).toBeInTheDocument();
    expect(screen.getByText(/January 2025 – August 2025/)).toBeInTheDocument();
    expect(screen.getByText('Chioma Okoli')).toBeInTheDocument();
    expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
  });

  it('renders Room Culture with quiet hours, cleaning rhythms, and traditions', () => {
    render(
      <RoomCultureSection
        cultureGuide={DEMO_ROOM_304_CULTURE}
        isDark={false}
      />
    );

    expect(screen.getByText(/Room Culture & Shared Life/)).toBeInTheDocument();
    expect(screen.getByText(/We treat Room 304 not merely as a bed space/)).toBeInTheDocument();
    expect(screen.getByText('Quiet Hours & Rest')).toBeInTheDocument();
    expect(screen.getByText('Cleaning & Chore Roster')).toBeInTheDocument();
    expect(screen.getByText('Inverter Power Protocol')).toBeInTheDocument();
    expect(screen.getByText('Room 304 Living Traditions')).toBeInTheDocument();
  });

  it('allows a Fellow in MemberHomeView to enter My Room and exit back cleanly', () => {
    const mockMember: Member = {
      id: 'mem-1',
      displayName: 'Emmanuel Ukom',
      roles: [],
      h4dMemberId: 'H4D-00021',
      createdAt: '2026-01-10T08:00:00Z',
    };

    render(
      <MemberHomeView
        isDark={false}
        responsibility={mockResponsibility}
        member={mockMember}
        onToggleTheme={vi.fn()}
        onExitToLanding={vi.fn()}
        onViewResponsibilityDetails={vi.fn()}
      />
    );

    // My Room action card is visible before notes
    expect(screen.getByText('My Room')).toBeInTheDocument();
    expect(screen.getByText(/Your Living Space/)).toBeInTheDocument();

    // Click My Room
    fireEvent.click(screen.getByRole('button', { name: /My Room/i }));

    // Shared Room Workspace is now presented
    expect(screen.getByText(/Back to Fellow Accommodation/)).toBeInTheDocument();
    expect(screen.getByText('Overview & Bunks')).toBeInTheDocument();

    // Click Roommates tab
    fireEvent.click(screen.getByRole('button', { name: /Roommates/i }));
    expect(screen.getByText('Current Roommates')).toBeInTheDocument();

    // Return to main view
    fireEvent.click(screen.getByRole('button', { name: /Back to Fellow Accommodation/i }));

    // Back to overview
    expect(screen.getByText('My Room')).toBeInTheDocument();
    expect(screen.queryByText(/Back to Fellow Accommodation/)).not.toBeInTheDocument();
  });
});
