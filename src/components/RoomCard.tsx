import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { colors, radius, shadow, equipmentIcon } from '../theme';

interface RoomCardProps {
  room: Room;
  isAvailableNow: boolean;
  onPress: (room: Room) => void;
  compact?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = React.memo(
  ({ room, isAvailableNow, onPress, compact }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => onPress(room)}
        accessibilityRole="button"
        accessibilityLabel={`${room.name}, Building ${room.building}, Floor ${room.floor}, ${
          isAvailableNow ? 'Available now' : 'In use'
        }`}
      >
        <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
          <Image source={{ uri: room.image }} style={styles.image} resizeMode="cover" />

          <View
            style={[
              styles.statusPill,
              { backgroundColor: isAvailableNow ? colors.successSoft : colors.dangerSoft },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: isAvailableNow ? colors.success : colors.danger },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isAvailableNow ? colors.success : colors.danger },
              ]}
            >
              {isAvailableNow ? 'Free now' : 'In use'}
            </Text>
          </View>

          <View style={styles.locTag}>
            <Text style={styles.locTagText}>
              {room.building}.{room.floor}
            </Text>
          </View>
        </View>

        <View style={[styles.content, compact && styles.contentCompact]}>
          <Text style={styles.title} numberOfLines={1}>
            {room.name}
          </Text>

          <View style={styles.metaLine}>
            <Ionicons name="people-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>Up to {room.capacity}</Text>
            <Text style={styles.metaSep}>•</Text>
            <Ionicons name="location-outline" size={15} color={colors.textMuted} />
            <Text style={[styles.metaText, { flex: 1 }]} numberOfLines={1}>
              Bldg {room.building}, Floor {room.floor}
            </Text>
          </View>

          <View style={styles.equipRow}>
            {room.equipment.map((eq) => (
              <View key={eq} style={styles.equipChip}>
                <Ionicons
                  name={equipmentIcon[eq] || 'hardware-chip-outline'}
                  size={13}
                  color={colors.primary}
                />
                <Text style={styles.equipText}>{eq}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cta}>
            <Text style={styles.ctaText}>Choose a time</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.room.id === next.room.id &&
    prev.isAvailableNow === next.isAvailableNow &&
    prev.compact === next.compact
);

RoomCard.displayName = 'RoomCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    margin: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  imageWrap: { height: 150, backgroundColor: colors.primarySoft },
  imageWrapCompact: { height: 120 },
  image: { width: '100%', height: '100%' },
  statusPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '800' },
  locTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.primaryDark,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  locTagText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  content: { padding: 14 },
  contentCompact: { padding: 12 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  metaText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  metaSep: { color: colors.textFaint, marginHorizontal: 2 },
  equipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  equipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primarySoft,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
  },
  equipText: { fontSize: 11, fontWeight: '600', color: colors.primaryDark },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 11,
    marginTop: 14,
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
