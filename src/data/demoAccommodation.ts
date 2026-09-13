import {
  Property,
  Floor,
  Room,
  Fellow,
  AccommodationResponsibility,
  ResponsibilityStatus,
} from '../domain/accommodation';

/**
 * Deterministic Demo Accommodation Data
 * 
 * NOTE: This is deterministic demonstration data used for H4D-FUNC-002.
 * It is kept isolated from reusable domain models and components.
 */

export const DEMO_PROPERTY: Property = {
  id: 'prop-infinite-grace',
  name: 'Infinite Grace Apartments',
};

export const DEMO_FLOOR: Floor = {
  id: 'floor-3',
  propertyId: DEMO_PROPERTY.id,
  name: 'Floor 3',
  levelNumber: 3,
};

export const DEMO_ROOM: Room = {
  id: 'room-3b',
  floorId: DEMO_FLOOR.id,
  name: 'Room 3B',
};

export const DEMO_FELLOW: Fellow = {
  id: 'fellow-current',
  name: 'Current Fellow',
  roomId: DEMO_ROOM.id,
};

export const DEMO_ACCOMMODATION_RESPONSIBILITY: AccommodationResponsibility = {
  id: 'resp-sept-2026',
  fellowId: DEMO_FELLOW.id,
  fellow: DEMO_FELLOW,
  title: 'September Accommodation',
  accommodationContext: {
    property: DEMO_PROPERTY,
    floor: DEMO_FLOOR,
    room: DEMO_ROOM,
  },
  requiredAmount: 66000,
  verifiedAmount: 0,
  status: ResponsibilityStatus.OUTSTANDING,
  period: 'September 2026',
  currency: 'NGN',
};
