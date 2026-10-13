import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Room,
  Reservation,
  UserSession,
  FilterState,
  BuildingId,
  EquipmentItem,
} from '../types';
import { MOCK_ROOMS, TIME_SLOTS, INITIAL_SEED_RESERVATIONS, getDayString } from '../data/mockRooms';
import { scheduleCheckInReminder, cancelBookingReminder } from '../utils/notifications';

interface BookingStoreState {
  // Session
  userSession: UserSession;
  
  // Data
  rooms: Room[];
  reservations: Reservation[];
  
  // Filter state
  filters: FilterState;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setBuildingFilter: (building: BuildingId | 'All') => void;
  setCapacityFilter: (capacity: 'All' | '2-4' | '5-8' | '9-20') => void;
  toggleEquipmentFilter: (equipment: EquipmentItem) => void;
  resetFilters: () => void;
  
  // Reservation Actions & Conflict Engine
  isSlotBooked: (roomId: string, date: string, slotId: string) => boolean;
  createReservation: (params: {
    roomId: string;
    date: string;
    slotId: string;
    groupPurpose: string;
  }) => Promise<{ success: boolean; reservation?: Reservation; error?: string }>;
  cancelReservation: (reservationId: string) => Promise<void>;
  checkInReservation: (reservationId: string) => void;
  
  // Real-time status
  isRoomAvailableNow: (roomId: string) => boolean;
  getActiveSlotForTime: (timeString?: string) => string | null;
  
  // State reset for demo / grading
  resetToMockData: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  building: 'All',
  capacityRange: 'All',
  selectedEquipment: [],
};

const DEFAULT_USER_SESSION: UserSession = {
  studentId: '23IT.B029',
  name: 'Nguyen Tan Duy',
  email: 'annv.21it@vku.udn.vn',
  department: 'Faculty of Computer Science',
  year: '4th Year (VKU K21)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
};

export const useBookingStore = create<BookingStoreState>()(
  persist(
    (set, get) => ({
      userSession: DEFAULT_USER_SESSION,
      rooms: MOCK_ROOMS,
      reservations: INITIAL_SEED_RESERVATIONS,
      filters: DEFAULT_FILTERS,

      setSearchQuery: (query: string) =>
        set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

      setBuildingFilter: (building) =>
        set((state) => ({ filters: { ...state.filters, building } })),

      setCapacityFilter: (capacityRange) =>
        set((state) => ({ filters: { ...state.filters, capacityRange } })),

      toggleEquipmentFilter: (equipment) =>
        set((state) => {
          const current = state.filters.selectedEquipment;
          const exists = current.includes(equipment);
          const updated = exists
            ? current.filter((item) => item !== equipment)
            : [...current, equipment];
          return { filters: { ...state.filters, selectedEquipment: updated } };
        }),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Conflict Check: Returns true if slot already has an active reservation
      isSlotBooked: (roomId: string, date: string, slotId: string) => {
        const reservations = get().reservations;
        return reservations.some(
          (r) =>
            r.roomId === roomId &&
            r.date === date &&
            r.slotId === slotId &&
            r.status !== 'cancelled'
        );
      },

      // Conflict-safe reservation creator
      createReservation: async ({ roomId, date, slotId, groupPurpose }) => {
        const state = get();
        const room = state.rooms.find((r) => r.id === roomId);
        const slot = TIME_SLOTS.find((s) => s.id === slotId);

        if (!room || !slot) {
          return { success: false, error: 'Invalid room or time slot selected.' };
        }

        // Conflict check
        const conflict = state.isSlotBooked(roomId, date, slotId);
        if (conflict) {
          return {
            success: false,
            error: 'Conflict detected: This time slot is already reserved by another study group.',
          };
        }

        // Generate unique booking pass ID
        const passSuffix = Math.floor(1000 + Math.random() * 9000);
        const uniquePassId = `VKU-${date.replace(/-/g, '').slice(2)}-${passSuffix}`;

        const newReservationData = {
          roomId: room.id,
          roomName: room.name,
          building: room.building,
          floor: room.floor,
          date,
          slotId: slot.id,
          timeRange: slot.label,
          studentId: state.userSession.studentId,
          studentName: state.userSession.name,
          groupPurpose: groupPurpose.trim() || 'General Academic Study Session',
        };

        // Schedule local push notification 15 min prior
        const notificationId = await scheduleCheckInReminder(newReservationData, slot);

        const newReservation: Reservation = {
          ...newReservationData,
          id: uniquePassId,
          status: 'confirmed',
          notificationId,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          reservations: [newReservation, ...s.reservations],
        }));

        return { success: true, reservation: newReservation };
      },

      cancelReservation: async (reservationId: string) => {
        const res = get().reservations.find((r) => r.id === reservationId);
        if (res?.notificationId) {
          await cancelBookingReminder(res.notificationId);
        }

        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
          ),
        }));
      },

      checkInReservation: (reservationId: string) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'checked_in' as const } : r
          ),
        }));
      },

      // Helper to identify which discrete slot corresponds to a time (HH:mm)
      getActiveSlotForTime: (timeString?: string) => {
        const now = new Date();
        const currentHM = timeString || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        for (const slot of TIME_SLOTS) {
          if (currentHM >= slot.startTime && currentHM < slot.endTime) {
            return slot.id;
          }
        }
        return null;
      },

      // Real-time room availability status right now
      isRoomAvailableNow: (roomId: string) => {
        const todayStr = getDayString(0);
        const activeSlotId = get().getActiveSlotForTime();
        
        // If outside normal study hours, it is available for booking
        if (!activeSlotId) {
          return true;
        }

        const isBookedNow = get().isSlotBooked(roomId, todayStr, activeSlotId);
        return !isBookedNow;
      },

      resetToMockData: () => {
        set({
          rooms: MOCK_ROOMS,
          reservations: INITIAL_SEED_RESERVATIONS,
          filters: DEFAULT_FILTERS,
        });
      },
    }),
    {
      name: 'vku-booking-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userSession: state.userSession,
        reservations: state.reservations,
      }),
    }
  )
);
