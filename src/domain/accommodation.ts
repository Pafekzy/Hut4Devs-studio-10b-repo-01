/**
 * Accommodation Domain Models
 * 
 * Relationships:
 * Property has Floors
 * Floor belongs to Property, has Rooms
 * Room belongs to Floor
 * Fellow may be allocated to Room
 * AccommodationResponsibility belongs to Fellow and has accommodation context
 */

export enum ResponsibilityStatus {
  OUTSTANDING = 'OUTSTANDING',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  FULFILLED = 'FULFILLED',
}

export interface Property {
  id: string;
  name: string;
  address?: string;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  propertyId: string;
  name: string; // e.g. "Floor 3"
  levelNumber?: number;
  rooms?: Room[];
}

export interface Room {
  id: string;
  floorId: string;
  name: string; // e.g. "Room 3B"
  code?: string;
}

export interface Fellow {
  id: string;
  name: string; // e.g. "Current Fellow"
  email?: string;
  roomId?: string;
}

export interface AccommodationContext {
  property: Property;
  floor: Floor;
  room: Room;
}

export interface AccommodationResponsibility {
  id: string;
  fellowId: string;
  fellow: Fellow;
  title: string; // e.g. "September Accommodation"
  accommodationContext: AccommodationContext;
  requiredAmount: number;
  verifiedAmount: number;
  status: ResponsibilityStatus;
  period?: string;
  currency?: string;
}

/**
 * Derives the remaining amount from required and verified amounts.
 * remainingAmount = requiredAmount - verifiedAmount
 */
export function calculateRemainingAmount(
  responsibility: Pick<AccommodationResponsibility, 'requiredAmount' | 'verifiedAmount'>
): number {
  return Math.max(0, responsibility.requiredAmount - responsibility.verifiedAmount);
}

/**
 * Format currency in Nigerian Naira (₦)
 */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/**
 * Human-readable status label
 */
export function getStatusLabel(status: ResponsibilityStatus): string {
  switch (status) {
    case ResponsibilityStatus.OUTSTANDING:
      return 'Outstanding';
    case ResponsibilityStatus.PARTIALLY_FULFILLED:
      return 'Partially Fulfilled';
    case ResponsibilityStatus.FULFILLED:
      return 'Fulfilled';
    default:
      return status;
  }
}

/**
 * Derived Operational Summary for Accommodation Administration
 */
export interface AccommodationOperationalSummary {
  propertiesCount: number;
  roomsRepresentedCount: number;
  fellowsRepresentedCount: number;
  outstandingResponsibilitiesCount: number;
}

/**
 * Derives operational statistics from a list of accommodation responsibilities
 */
export function deriveAccommodationOperationalSummary(
  responsibilities: AccommodationResponsibility[]
): AccommodationOperationalSummary {
  const propertyIds = new Set<string>();
  const roomIds = new Set<string>();
  const fellowIds = new Set<string>();
  let outstandingResponsibilitiesCount = 0;

  for (const resp of responsibilities) {
    if (resp.accommodationContext?.property?.id) {
      propertyIds.add(resp.accommodationContext.property.id);
    }
    if (resp.accommodationContext?.room?.id) {
      roomIds.add(resp.accommodationContext.room.id);
    }
    if (resp.fellow?.id || resp.fellowId) {
      fellowIds.add(resp.fellow?.id || resp.fellowId);
    }
    if (resp.status === ResponsibilityStatus.OUTSTANDING) {
      outstandingResponsibilitiesCount++;
    }
  }

  return {
    propertiesCount: propertyIds.size,
    roomsRepresentedCount: roomIds.size,
    fellowsRepresentedCount: fellowIds.size,
    outstandingResponsibilitiesCount,
  };
}

/**
 * Accommodation Fulfilment Intent Types
 */
export enum FulfilmentType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

export enum PaymentIntentStatus {
  PREPARED = 'PREPARED',
}

export interface AccommodationPaymentIntent {
  id: string;
  responsibilityId: string;
  amount: number;
  fulfilmentType: FulfilmentType;
  status: PaymentIntentStatus;
  createdAt: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a proposed fulfilment amount against remaining responsibility
 */
export function validateFulfilmentAmount(
  amount: number,
  remainingAmount: number
): ValidationResult {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      valid: false,
      error: `Enter an amount up to your remaining responsibility of ${formatNaira(remainingAmount)}.`,
    };
  }
  if (amount <= 0) {
    return {
      valid: false,
      error: `Enter an amount up to your remaining responsibility of ${formatNaira(remainingAmount)}.`,
    };
  }
  if (amount > remainingAmount) {
    return {
      valid: false,
      error: `Enter an amount up to your remaining responsibility of ${formatNaira(remainingAmount)}.`,
    };
  }
  return { valid: true };
}
