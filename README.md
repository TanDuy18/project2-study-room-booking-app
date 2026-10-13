# MINI-PROJECT SHORT TECHNICAL REPORT

**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** VKU Real-Time Study Room & Lab Booking App  
**Team / Student Name:** Nguyễn Tấn Duy
**Submission Date:** 13/10/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS

- **Student:** Nguyễn Tấn Duy — Student ID: 23IT.B029 — Role: Individual Developer — Contribution: 100%
- **Live Demo URL:** [Expo Go URL / APK Download Link]
- **GitHub Repository:** [https://github.com/TanDuy18/Project2_Study-Room-Booking-App]
- **Video Demo (Optional):** [https://youtu.be/vUJXgYN7Zyg]

The application is a mobile-first Expo and React Native prototype for discovering VKU study rooms, checking availability, booking a time slot, and presenting a QR access pass.

## 2. FEATURE IMPLEMENTATION CHECKLIST

|  #  | Required Feature                             |  Status  | Implementation Details & Acceptance Level                                                                                                                       |
| :-: | -------------------------------------------- | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Room discovery and multi-parameter filtering | Complete | Displays 8 mock rooms in buildings A, B, C, and V. Users can search by room information and filter by building, capacity, and equipment.                        |
|  2  | Real-time room availability indicator        | Complete | Room cards calculate the current active slot and show `Available Now` or `Occupied` based on non-cancelled reservations.                                        |
|  3  | Seven-day date and time-slot booking         | Complete | The detail screen provides a seven-day selector and six fixed two-hour slots: 07:30-09:30, 09:30-11:30, 13:00-15:00, 15:00-17:00, 17:30-19:30, and 19:30-21:30. |
|  4  | Conflict prevention                          | Complete | The UI disables booked slots and the Zustand store performs a second conflict check before creating a reservation.                                              |
|  5  | Digital booking pass and QR check-in         | Complete | Creates a unique pass in the format `VKU-YYMMDD-XXXX`, renders a QR payload, and provides a simulated smart-door check-in action.                               |
|  6  | Local persistence                            | Complete | Zustand `persist` middleware stores rooms, filters, user session, and reservations through AsyncStorage.                                                        |
|  7  | Local booking reminders                      | Complete | `expo-notifications` schedules a reminder 15 minutes before a reservation and cancels it when the reservation is cancelled.                                     |

> **Scope note:** This version uses seeded mock data and local persistence. It does not implement a remote backend or automatic background synchronization.

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1 Technology stack

- Expo SDK 57, React 19, React Native 0.86, and TypeScript in strict mode.
- React Navigation Native Stack and Bottom Tabs for application navigation.
- Zustand for session, filters, room data, and reservation state.
- `@react-native-async-storage/async-storage` for local persistence.
- `expo-notifications` for local reminders and `react-native-qrcode-svg` for booking passes.

### 3.2 Project structure

```text
VKU Study Room Booking App/
├── App.tsx                         # Stack and bottom-tab navigation
├── app.json                        # Expo application configuration
├── src/
│   ├── components/
│   │   ├── FilterBar.tsx           # Search and multi-parameter filters
│   │   ├── QRPassModal.tsx         # QR pass and simulated check-in
│   │   └── RoomCard.tsx            # Room summary and live status
│   ├── data/mockRooms.ts           # Mock rooms, slots, and seed reservations
│   ├── screens/
│   │   ├── RoomListScreen.tsx      # Room discovery feed
│   │   ├── RoomDetailScreen.tsx    # Date, slot, and booking flow
│   │   ├── MyBookingsScreen.tsx    # Active and historical reservations
│   │   └── ProfileScreen.tsx       # Student ID, statistics, and diagnostics
│   ├── store/useBookingStore.ts    # Zustand store and conflict engine
│   ├── types/index.ts              # Domain types and reservation statuses
│   └── utils/notifications.ts      # Permission and reminder handling
└── assets/                         # Application icons and images
```

### 3.3 State and exception handling

The UI reads and updates a single Zustand store. A booking request validates the room and slot, checks for an existing non-cancelled reservation, schedules a local reminder, and then persists the new reservation. Cancellation first attempts to remove the scheduled notification and marks the reservation as cancelled. Notification initialization and scheduling are wrapped in `try/catch`, so unavailable permissions or notification capabilities do not crash the booking flow.

The room list uses `FlatList`, `React.memo`, `getItemLayout`, and bounded rendering options to reduce unnecessary work on mobile devices.

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

Insert 3-4 screenshots captured from an emulator or physical device. Recommended evidence:

1. **Room discovery:** search bar, filter chips, room cards, and availability badges.
2. **Booking flow:** seven-day date selector, available slots, and a disabled booked slot.
3. **Digital pass:** generated QR code, booking details, and the simulated check-in button.
4. **My Bookings / Student ID:** reservation status, statistics, and notification test action.

Suggested caption format: `Figure 1. Room discovery and multi-parameter filtering on Android emulator.`

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Challenge 1: Preventing duplicate reservations

Because the prototype allows users to interact with the booking screen repeatedly, checking only the visual state is insufficient. The solution was to centralize conflict detection in `useBookingStore.isSlotBooked`. The detail screen uses it to disable or reject booked slots, while `createReservation` checks the same condition again before writing state. Cancelled reservations do not block a slot.

### Challenge 2: Making local notifications non-blocking

Notification permissions and native notification capabilities may vary between Expo Go, emulators, and production builds. Notification setup and scheduling are therefore isolated in `src/utils/notifications.ts` and guarded with `try/catch`. The booking can still be stored if notification permission is unavailable, while the profile screen provides a short test notification flow for demonstration.

### Challenge 3: Keeping the room feed responsive

Room images and several filter controls can cause unnecessary list work on a mobile device. The implementation uses `FlatList` virtualization, `getItemLayout`, limited batch rendering, clipped Android subviews, and a memoized `RoomCard` that re-renders when its room or availability status changes.

## 6. RUNNING THE PROJECT

```bash
npm install
npm run start
```

Open the generated QR code with Expo Go, or use the Android/iOS scripts from `package.json`.
