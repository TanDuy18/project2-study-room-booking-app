export type BuildingId = 'A' | 'B' | 'C' | 'V';

export type EquipmentItem = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';

export interface Room {
  id: string;
  name: string;
  building: BuildingId;
  floor: number;
  capacity: number;
  equipment: EquipmentItem[];
  image: string;
  description: string;
  locationDetails: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  label: string;     // e.g. "07:30 – 09:30"
}

export type ReservationStatus = 'confirmed' | 'checked_in' | 'cancelled';

export interface Reservation {
  id: string; // e.g. "VKU-2026-9812"
  roomId: string;
  roomName: string;
  building: BuildingId;
  floor: number;
  date: string; // YYYY-MM-DD
  slotId: string;
  timeRange: string;
  studentId: string;
  studentName: string;
  groupPurpose: string;
  status: ReservationStatus;
  notificationId?: string;
  createdAt: string;
}

export interface UserSession {
  studentId: string;
  name: string;
  email: string;
  department: string;
  year: string;
  avatar: string;
}

export interface FilterState {
  searchQuery: string;
  building: BuildingId | 'All';
  capacityRange: 'All' | '2-4' | '5-8' | '9-20';
  selectedEquipment: EquipmentItem[];
}
