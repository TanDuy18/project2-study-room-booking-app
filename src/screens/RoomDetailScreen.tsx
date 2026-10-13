import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBookingStore } from '../store/useBookingStore';
import { TIME_SLOTS } from '../data/mockRooms';
import { Reservation, TimeSlot } from '../types';
import { QRPassModal } from '../components/QRPassModal';
import { colors, radius, equipmentIcon } from '../theme';

const generateNext7Days = () => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      dateString: d.toISOString().split('T')[0],
      dayOfWeek: i === 0 ? 'Today' : dayNames[d.getDay()],
      dayNumber: d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return days;
};

const PURPOSE_SUGGESTIONS = ['Group study', 'Capstone project', 'Club meeting', 'Exam prep'];

const StepTitle: React.FC<{ n: number; title: string; right?: string }> = ({ n, title, right }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{n}</Text>
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
    {right ? <Text style={styles.stepRight}>{right}</Text> : null}
  </View>
);

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roomId } = route.params;

  const rooms = useBookingStore((s) => s.rooms);
  const isSlotBooked = useBookingStore((s) => s.isSlotBooked);
  const createReservation = useBookingStore((s) => s.createReservation);
  const checkInReservation = useBookingStore((s) => s.checkInReservation);
  useBookingStore((s) => s.reservations); // re-render slots when bookings change

  const room = rooms.find((r) => r.id === roomId);

  const sevenDays = useMemo(() => generateNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState<string>(sevenDays[0].dateString);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [passModalVisible, setPassModalVisible] = useState<boolean>(false);
  const [generatedPass, setGeneratedPass] = useState<Reservation | null>(null);

  if (!room) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>Room not found</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>Back to rooms</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const selectedDay = sevenDays.find((d) => d.dateString === selectedDate);
  const selectedSlot = TIME_SLOTS.find((s) => s.id === selectedSlotId);
  const dayLabel = selectedDay
    ? `${selectedDay.dayOfWeek} ${selectedDay.dayNumber} ${selectedDay.month}`
    : selectedDate;

  const handleSlotSelect = (slot: TimeSlot) => {
    if (isSlotBooked(room.id, selectedDate, slot.id)) {
      Alert.alert('Slot unavailable', `${slot.label} on ${selectedDate} is already booked.`);
      return;
    }
    setSelectedSlotId(slot.id);
  };

  const handleBookPress = async () => {
    if (!selectedSlotId) return;
    setIsSubmitting(true);
    const result = await createReservation({
      roomId: room.id,
      date: selectedDate,
      slotId: selectedSlotId,
      groupPurpose: purpose.trim() || 'Collaborative Study Session',
    });
    setIsSubmitting(false);

    if (result.success && result.reservation) {
      setGeneratedPass(result.reservation);
      setPassModalVisible(true);
    } else {
      Alert.alert('Booking error', result.error || 'Failed to reserve the room.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: room.image }} style={styles.heroImg} />
          <View style={styles.heroOverlay} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroInfo}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>
                BUILDING {room.building} · FLOOR {room.floor}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{room.name}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Quick facts */}
          <View style={styles.factsRow}>
            <View style={styles.fact}>
              <Ionicons name="people" size={18} color={colors.primary} />
              <Text style={styles.factValue}>{room.capacity}</Text>
              <Text style={styles.factLabel}>seats</Text>
            </View>
            <View style={styles.fact}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={styles.factValue}>2h</Text>
              <Text style={styles.factLabel}>per slot</Text>
            </View>
            <View style={styles.fact}>
              <Ionicons name="qr-code" size={18} color={colors.primary} />
              <Text style={styles.factValue}>QR</Text>
              <Text style={styles.factLabel}>door access</Text>
            </View>
          </View>

          <Text style={styles.desc}>{room.description}</Text>
          <Text style={styles.loc}>
            <Ionicons name="navigate-circle-outline" size={14} color={colors.textMuted} />{' '}
            {room.locationDetails}
          </Text>

          <View style={styles.equipRow}>
            {room.equipment.map((eq) => (
              <View key={eq} style={styles.equipChip}>
                <Ionicons
                  name={equipmentIcon[eq] || 'hardware-chip-outline'}
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.equipText}>{eq}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Step 1: date */}
          <StepTitle n={1} title="Pick a day" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {sevenDays.map((d) => {
              const active = selectedDate === d.dateString;
              return (
                <TouchableOpacity
                  key={d.dateString}
                  style={[styles.dateChip, active && styles.dateChipActive]}
                  onPress={() => {
                    setSelectedDate(d.dateString);
                    setSelectedSlotId(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDay, active && styles.onActive]}>{d.dayOfWeek}</Text>
                  <Text style={[styles.dateNum, active && styles.onActive]}>{d.dayNumber}</Text>
                  <Text style={[styles.dateMonth, active && styles.onActive]}>{d.month}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Step 2: time */}
          <StepTitle n={2} title="Pick a time" right="2-hour blocks" />
          <View style={styles.slotGrid}>
            {TIME_SLOTS.map((slot) => {
              const booked = isSlotBooked(room.id, selectedDate, slot.id);
              const active = selectedSlotId === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slot,
                    booked && styles.slotBooked,
                    active && styles.slotActive,
                  ]}
                  disabled={booked}
                  onPress={() => handleSlotSelect(slot)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.slotTime,
                      booked && styles.slotTimeBooked,
                      active && styles.onActive,
                    ]}
                  >
                    {slot.label}
                  </Text>
                  <View style={styles.slotStateRow}>
                    <Ionicons
                      name={booked ? 'lock-closed' : active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={12}
                      color={booked ? colors.textFaint : active ? '#FFFFFF' : colors.success}
                    />
                    <Text
                      style={[
                        styles.slotState,
                        { color: booked ? colors.textFaint : active ? '#FFFFFF' : colors.success },
                      ]}
                    >
                      {booked ? 'Taken' : active ? 'Selected' : 'Open'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Step 3: purpose */}
          <StepTitle n={3} title="What are you working on?" right="optional" />
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="e.g. AI capstone, ACM practice..."
              placeholderTextColor={colors.textFaint}
              value={purpose}
              onChangeText={setPurpose}
              maxLength={100}
            />
          </View>
          <View style={styles.suggestRow}>
            {PURPOSE_SUGGESTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.suggest, purpose === p && styles.suggestActive]}
                onPress={() => setPurpose(p)}
                activeOpacity={0.8}
              >
                <Text style={[styles.suggestText, purpose === p && styles.onActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.notice}>
            <Ionicons name="notifications-outline" size={16} color={colors.primary} />
            <Text style={styles.noticeText}>
              You'll get a reminder 15 minutes before your session starts.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky booking bar */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sumLabel}>{selectedSlot ? 'Your booking' : 'Choose a time slot'}</Text>
          <Text style={styles.sumValue} numberOfLines={1}>
            {selectedSlot ? `${dayLabel} · ${selectedSlot.label}` : room.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, !selectedSlotId && styles.bookBtnDisabled]}
          disabled={!selectedSlotId || isSubmitting}
          onPress={handleBookPress}
          activeOpacity={0.88}
        >
          <Text style={styles.bookBtnText}>{isSubmitting ? 'Booking...' : 'Book now'}</Text>
          {!isSubmitting && <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>

      <QRPassModal
        visible={passModalVisible}
        reservation={generatedPass}
        onClose={() => {
          setPassModalVisible(false);
          navigation.navigate('MyBookingsTab');
        }}
        onCheckIn={(id) => {
          checkInReservation(id);
          if (generatedPass) setGeneratedPass({ ...generatedPass, status: 'checked_in' });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  notFoundText: { fontSize: 16, color: colors.textMuted, marginBottom: 16 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: radius.md,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800' },
  hero: { height: 240 },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(46, 31, 122, 0.55)' },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 23, 48, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: { position: 'absolute', left: 16, right: 16, bottom: 28 },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 6,
    marginBottom: 8,
  },
  heroTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  body: {
    marginTop: -18,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 16,
  },
  factsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  fact: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  factValue: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginTop: 2 },
  factLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  desc: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  loc: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  equipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  equipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  equipText: { fontSize: 12, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.text },
  stepRight: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  dateRow: { gap: 8, paddingBottom: 4, marginBottom: 20 },
  dateChip: {
    minWidth: 62,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  dateNum: { fontSize: 20, fontWeight: '800', color: colors.text, marginVertical: 1 },
  dateMonth: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  onActive: { color: '#FFFFFF' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  slot: {
    width: '48%',
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  slotBooked: { backgroundColor: colors.bookedSoft },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotTime: { fontSize: 14, fontWeight: '800', color: colors.text },
  slotTimeBooked: { color: colors.textFaint, textDecorationLine: 'line-through' },
  slotStateRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  slotState: { fontSize: 12, fontWeight: '700' },
  inputBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
  },
  input: { fontSize: 14, color: colors.text },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 16 },
  suggest: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  suggestActive: { backgroundColor: colors.primary },
  suggestText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: 12,
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.text, lineHeight: 17 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sumLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  sumValue: { fontSize: 14, color: colors.text, fontWeight: '800', marginTop: 2 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: radius.md,
  },
  bookBtnDisabled: { backgroundColor: colors.textFaint },
  bookBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
