import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BuildingId, EquipmentItem } from '../types';
import { colors, radius, equipmentIcon } from '../theme';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedBuilding: BuildingId | 'All';
  onBuildingSelect: (building: BuildingId | 'All') => void;
  selectedCapacity: 'All' | '2-4' | '5-8' | '9-20';
  onCapacitySelect: (capacity: 'All' | '2-4' | '5-8' | '9-20') => void;
  selectedEquipment: EquipmentItem[];
  onEquipmentToggle: (item: EquipmentItem) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

const BUILDINGS: (BuildingId | 'All')[] = ['All', 'A', 'B', 'C', 'V'];
const CAPACITIES: ('All' | '2-4' | '5-8' | '9-20')[] = ['All', '2-4', '5-8', '9-20'];
const EQUIPMENT_LIST: EquipmentItem[] = ['Projector', 'Whiteboard', 'High-spec PC', 'AC'];

const Chip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}> = ({ label, active, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {icon && (
      <Ionicons name={icon} size={14} color={active ? '#FFFFFF' : colors.textMuted} />
    )}
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedBuilding,
  onBuildingSelect,
  selectedCapacity,
  onCapacitySelect,
  selectedEquipment,
  onEquipmentToggle,
  onResetFilters,
  activeFilterCount,
}) => {
  const [open, setOpen] = useState(false);
  const advancedCount =
    (selectedCapacity !== 'All' ? 1 : 0) + selectedEquipment.length;

  return (
    <View style={styles.container}>
      {/* Search + advanced filter toggle */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Room, lab, equipment..."
            placeholderTextColor={colors.textFaint}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, (open || advancedCount > 0) && styles.filterBtnActive]}
          onPress={() => setOpen((o) => !o)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={open || advancedCount > 0 ? '#FFFFFF' : colors.primary}
          />
          {advancedCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{advancedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Building chips: always visible (most used filter) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {BUILDINGS.map((b) => (
          <Chip
            key={b}
            label={b === 'All' ? 'All buildings' : `Building ${b}`}
            active={selectedBuilding === b}
            onPress={() => onBuildingSelect(b)}
          />
        ))}
      </ScrollView>

      {/* Advanced panel: capacity + equipment */}
      {open && (
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Group size</Text>
          <View style={styles.wrapRow}>
            {CAPACITIES.map((c) => (
              <Chip
                key={c}
                label={c === 'All' ? 'Any size' : `${c} people`}
                icon="people-outline"
                active={selectedCapacity === c}
                onPress={() => onCapacitySelect(c)}
              />
            ))}
          </View>

          <Text style={styles.panelLabel}>Equipment</Text>
          <View style={styles.wrapRow}>
            {EQUIPMENT_LIST.map((eq) => (
              <Chip
                key={eq}
                label={eq}
                icon={equipmentIcon[eq]}
                active={selectedEquipment.includes(eq)}
                onPress={() => onEquipmentToggle(eq)}
              />
            ))}
          </View>

          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={onResetFilters}>
              <Ionicons name="refresh" size={14} color={colors.danger} />
              <Text style={styles.clearText}>Clear all filters ({activeFilterCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.primary },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#FFFFFF' },
  panel: { paddingHorizontal: 16, paddingTop: 12 },
  panelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginTop: 4,
  },
  clearText: { fontSize: 13, fontWeight: '700', color: colors.danger },
});
