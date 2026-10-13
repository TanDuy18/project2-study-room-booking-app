import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '../types';
import { colors, radius, statusMeta } from '../theme';

interface QRPassModalProps {
  visible: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onCheckIn: (id: string) => void;
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

export const QRPassModal: React.FC<QRPassModalProps> = ({
  visible,
  reservation,
  onClose,
  onCheckIn,
}) => {
  if (!reservation) return null;

  const meta = statusMeta[reservation.status];
  const isCheckedIn = reservation.status === 'checked_in';
  const isCancelled = reservation.status === 'cancelled';

  const qrDataPayload = JSON.stringify({
    passId: reservation.id,
    roomId: reservation.roomId,
    date: reservation.date,
    slotId: reservation.slotId,
    studentId: reservation.studentId,
    timestamp: reservation.createdAt,
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Ticket header */}
          <View style={styles.top}>
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>VKU CAMPUS PASS</Text>
              <Text style={styles.roomName} numberOfLines={2}>
                {reservation.roomName}
              </Text>
              <Text style={styles.when}>
                {reservation.date} · {reservation.timeRange}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <View style={[styles.statusPill, { backgroundColor: meta.bg, borderColor: meta.border }]}>
              <Ionicons name={meta.icon} size={16} color={meta.fg} />
              <Text style={[styles.statusText, { color: meta.fg }]}>
                {isCheckedIn
                  ? 'Checked in · Access granted'
                  : isCancelled
                  ? 'Reservation cancelled'
                  : 'Ready to scan at the door'}
              </Text>
            </View>

            <View style={styles.qrFrame}>
              <QRCode
                value={qrDataPayload}
                size={190}
                color={isCancelled ? colors.textFaint : colors.primaryDark}
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.passCode}>{reservation.id}</Text>

            {/* Ticket tear line */}
            <View style={styles.tear}>
              <View style={[styles.notch, { left: -30 }]} />
              <View style={styles.tearLine} />
              <View style={[styles.notch, { right: -30 }]} />
            </View>

            <View style={styles.details}>
              <Row label="Student" value={`${reservation.studentName} (${reservation.studentId})`} />
              <Row label="Location" value={`Building ${reservation.building}, Floor ${reservation.floor}`} />
              <Row label="Purpose" value={reservation.groupPurpose} />
            </View>

            {!isCheckedIn && !isCancelled && (
              <TouchableOpacity
                style={styles.checkInBtn}
                onPress={() => onCheckIn(reservation.id)}
                activeOpacity={0.88}
              >
                <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
                <Text style={styles.checkInText}>Simulate door check-in</Text>
              </TouchableOpacity>
            )}

            {isCheckedIn && (
              <View style={styles.note}>
                <Ionicons name="checkmark-done" size={18} color={colors.success} />
                <Text style={styles.noteText}>
                  You're in! Please leave the room before your slot ends.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 23, 48, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryDark,
    padding: 18,
    gap: 12,
  },
  badge: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  roomName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 4 },
  when: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, fontWeight: '600' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 20, alignItems: 'center' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  qrFrame: {
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    backgroundColor: '#FFFFFF',
  },
  passCode: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.text,
  },
  tear: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    marginVertical: 12,
  },
  tearLine: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  notch: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 23, 48, 0.7)',
  },
  details: { width: '100%', gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: 20,
  },
  checkInText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 20,
  },
  noteText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.success },
});
