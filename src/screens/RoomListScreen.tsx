import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Room } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { RoomCard } from '../components/RoomCard';
import { FilterBar } from '../components/FilterBar';
import { colors, radius } from '../theme';

export const RoomListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [refreshing, setRefreshing] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const { width } = useWindowDimensions();
  // Responsive grid: 1 column on phones, 2 on tablets/narrow web, 3 on wide web
  const numColumns = width >= 1000 ? 3 : width >= 640 ? 2 : 1;

  const rooms = useBookingStore((s) => s.rooms);
  const reservations = useBookingStore((s) => s.reservations); // re-render when bookings change
  const filters = useBookingStore((s) => s.filters);
  const isRoomAvailableNow = useBookingStore((s) => s.isRoomAvailableNow);
  const userSession = useBookingStore((s) => s.userSession);
  const setSearchQuery = useBookingStore((s) => s.setSearchQuery);
  const setBuildingFilter = useBookingStore((s) => s.setBuildingFilter);
  const setCapacityFilter = useBookingStore((s) => s.setCapacityFilter);
  const toggleEquipmentFilter = useBookingStore((s) => s.toggleEquipmentFilter);
  const resetFilters = useBookingStore((s) => s.resetFilters);

  const firstName = userSession.name.split(' ').pop() || userSession.name;

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const hit =
          room.name.toLowerCase().includes(q) ||
          room.description.toLowerCase().includes(q) ||
          room.locationDetails.toLowerCase().includes(q) ||
          room.equipment.some((eq) => eq.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (filters.building !== 'All' && room.building !== filters.building) return false;

      if (filters.capacityRange === '2-4' && (room.capacity < 2 || room.capacity > 4)) return false;
      if (filters.capacityRange === '5-8' && (room.capacity < 5 || room.capacity > 8)) return false;
      if (filters.capacityRange === '9-20' && room.capacity < 9) return false;

      if (
        filters.selectedEquipment.length > 0 &&
        !filters.selectedEquipment.every((eq) => room.equipment.includes(eq))
      ) {
        return false;
      }

      if (onlyFree && !isRoomAvailableNow(room.id)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, filters, onlyFree, reservations, isRoomAvailableNow]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.building !== 'All') count++;
    if (filters.capacityRange !== 'All') count++;
    count += filters.selectedEquipment.length;
    if (filters.searchQuery.trim().length > 0) count++;
    return count;
  }, [filters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleRoomPress = useCallback(
    (room: Room) => navigation.navigate('RoomDetail', { roomId: room.id }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => (
      // flex: 1/n keeps a lone last tile the same width as the others
      <View style={{ flex: 1 / numColumns }}>
        <RoomCard
          room={item}
          isAvailableNow={isRoomAvailableNow(item.id)}
          onPress={handleRoomPress}
          compact={numColumns > 1}
        />
      </View>
    ),
    // reservations in deps so "Free now" refreshes after a booking
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRoomAvailableNow, handleRoomPress, reservations, numColumns]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Dark header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hi, {firstName}</Text>
          <Text style={styles.title}>Find a study room</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <FilterBar
          searchQuery={filters.searchQuery}
          onSearchChange={setSearchQuery}
          selectedBuilding={filters.building}
          onBuildingSelect={setBuildingFilter}
          selectedCapacity={filters.capacityRange}
          onCapacitySelect={setCapacityFilter}
          selectedEquipment={filters.selectedEquipment}
          onEquipmentToggle={toggleEquipmentFilter}
          onResetFilters={resetFilters}
          activeFilterCount={activeFilterCount}
        />

        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            <Text style={styles.counterBold}>{filteredRooms.length}</Text>{' '}
            {filteredRooms.length === 1 ? 'room' : 'rooms'} found
          </Text>

          <TouchableOpacity
            style={[styles.freeChip, onlyFree && styles.freeChipActive]}
            onPress={() => setOnlyFree((v) => !v)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.freeDot,
                { backgroundColor: onlyFree ? '#FFFFFF' : colors.success },
              ]}
            />
            <Text style={[styles.freeText, onlyFree && { color: '#FFFFFF' }]}>
              Free now
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          key={numColumns}
          numColumns={numColumns}
          data={filteredRooms}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={reservations}
          initialNumToRender={5}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={[styles.listContent, styles.listMax]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No rooms match</Text>
              <Text style={styles.emptyDesc}>
                Try another building, group size or equipment.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => {
                  resetFilters();
                  setOnlyFree(false);
                }}
              >
                <Text style={styles.emptyBtnText}>Clear filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  hello: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  sheet: { flex: 1, backgroundColor: colors.bg },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  counterText: { fontSize: 13, color: colors.textMuted },
  counterBold: { fontWeight: '800', color: colors.text },
  freeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  freeChipActive: { backgroundColor: colors.success, borderColor: colors.success },
  freeDot: { width: 8, height: 8, borderRadius: 4 },
  freeText: { fontSize: 12, fontWeight: '700', color: colors.success },
  listContent: { paddingBottom: 24, paddingHorizontal: 8 },
  listMax: { width: '100%', maxWidth: 1280, alignSelf: 'center' },
  empty: { alignItems: 'center', padding: 32, marginTop: 24 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 14 },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    maxWidth: 260,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: radius.md,
  },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
