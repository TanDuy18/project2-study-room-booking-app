import { Room, TimeSlot, Reservation } from '../types';

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', startTime: '07:30', endTime: '09:30', label: '07:30 – 09:30' },
  { id: 'slot-2', startTime: '09:30', endTime: '11:30', label: '09:30 – 11:30' },
  { id: 'slot-3', startTime: '13:00', endTime: '15:00', label: '13:00 – 15:00' },
  { id: 'slot-4', startTime: '15:00', endTime: '17:00', label: '15:00 – 17:00' },
  { id: 'slot-5', startTime: '17:30', endTime: '19:30', label: '17:30 – 19:30' },
  { id: 'slot-6', startTime: '19:30', endTime: '21:30', label: '19:30 – 21:30' },
];

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-b302',
    name: 'B.302 AI & Cloud Computing Lab',
    building: 'B',
    floor: 3,
    capacity: 16,
    equipment: ['High-spec PC', 'Projector', 'AC', 'Whiteboard'],
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    description: 'Equipped with 16 RTX-powered workstations, dual 4K laser projectors, and high-speed campus fiber link. Ideal for machine learning models and capstone team collaboration.',
    locationDetails: 'Building B - Tech Wing, 3rd Floor East',
  },
  {
    id: 'room-a101',
    name: 'A.101 Smart Seminar Room',
    building: 'A',
    floor: 1,
    capacity: 12,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: 'Modern conference room with ergonomic executive seating, surround acoustic insulation, and interactive smart podium.',
    locationDetails: 'Building A - Admin Block, Ground Floor',
  },
  {
    id: 'room-v201',
    name: 'V.201 Global Video Conference Hall',
    building: 'V',
    floor: 2,
    capacity: 18,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    description: 'Vietnam - Korea Cultural Library multimedia suite. Features telepresence multi-camera setup, dual translation booths, and climate control.',
    locationDetails: 'Building V - Friendship Library, 2nd Floor',
  },
  {
    id: 'room-c105',
    name: 'C.105 Robotics & IoT Prototyping Hub',
    building: 'C',
    floor: 1,
    capacity: 10,
    equipment: ['High-spec PC', 'Projector', 'AC', 'Whiteboard'],
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Hardware workbench area with oscilloscopes, test benches, and dedicated GPU workstation for embedded computer vision.',
    locationDetails: 'Building C - Innovation Hub, 1st Floor',
  },
  {
    id: 'room-b201',
    name: 'B.201 Agile Scrum Pod',
    building: 'B',
    floor: 2,
    capacity: 4,
    equipment: ['Whiteboard', 'AC'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'Compact, sound-damped sprint planning pod with full floor-to-ceiling magnetic dry-erase walls and ultra-quiet ventilation.',
    locationDetails: 'Building B - Tech Wing, 2nd Floor West',
  },
  {
    id: 'room-v305',
    name: 'V.305 Multimedia & UX Design Suite',
    building: 'V',
    floor: 3,
    capacity: 8,
    equipment: ['High-spec PC', 'Projector', 'AC'],
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    description: 'Calibrated color-accurate displays, drawing tablets, and quiet acoustic zoning for UX usability testing and demo recordings.',
    locationDetails: 'Building V - Friendship Library, 3rd Floor',
  },
  {
    id: 'room-c308',
    name: 'C.308 Deep Focus Study Pod',
    building: 'C',
    floor: 3,
    capacity: 2,
    equipment: ['Whiteboard', 'AC'],
    image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=800&q=80',
    description: 'Pair study alcove designed for intensive coding sprint, algorithm review, or paper drafting without campus distractions.',
    locationDetails: 'Building C - Innovation Hub, 3rd Floor',
  },
  {
    id: 'room-a204',
    name: 'A.204 Capstone Defense Lab',
    building: 'A',
    floor: 2,
    capacity: 20,
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    description: 'Tiered presentation auditorium with dual widescreen beamers, wireless lavalier microphones, and full digital recording equipment.',
    locationDetails: 'Building A - Admin Block, 2nd Floor',
  },
];

// Utility to get format YYYY-MM-DD for today and offsets
export const getDayString = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'VKU-2026-8812',
    roomId: 'room-b302',
    roomName: 'B.302 AI & Cloud Computing Lab',
    building: 'B',
    floor: 3,
    date: getDayString(0), // Today
    slotId: 'slot-3',      // 13:00 – 15:00
    timeRange: '13:00 – 15:00',
    studentId: '21IT089',
    studentName: 'Nguyen Van An',
    groupPurpose: 'Deep Learning Capstone Model Training & GPU Benchmarking',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VKU-2026-7241',
    roomId: 'room-a101',
    roomName: 'A.101 Smart Seminar Room',
    building: 'A',
    floor: 1,
    date: getDayString(0), // Today
    slotId: 'slot-2',      // 09:30 – 11:30
    timeRange: '09:30 – 11:30',
    studentId: '20IT142',
    studentName: 'Tran Minh Khoa',
    groupPurpose: 'VKU ACM-ICPC Team Practice',
    status: 'checked_in',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VKU-2026-4490',
    roomId: 'room-v201',
    roomName: 'V.201 Global Video Conference Hall',
    building: 'V',
    floor: 2,
    date: getDayString(1), // Tomorrow
    slotId: 'slot-4',      // 15:00 – 17:00
    timeRange: '15:00 – 17:00',
    studentId: '21IT089',
    studentName: 'Nguyen Van An',
    groupPurpose: 'Korea Exchange Partner University Pitch & Demo',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];
