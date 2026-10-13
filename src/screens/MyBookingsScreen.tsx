import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBookingStore } from '../store/useBookingStore';
import { Reservation } from '../types';
import { QRPassModal } from '../components/QRPassModal';

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const reservations = useBookingStore((s) => s.reservations);
  const cancelReservation = useBookingStore((s) => s.cancelReservation);
  const checkInReservation = useBookingStore((s) => s.checkInReservation);

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedPass, setSelectedPass] = useState<Reservation | null>(null);
  const [passModalVisible, setPassModalVisible] = useState<boolean>(false);

  const activeReservations = reservations.filter(
    (r) => r.status === 'confirmed' || r.status === 'checked_in'
  );
  const historyReservations = reservations.filter((r) => r.status === 'cancelled');

  const displayedList = activeTab === 'active' ? activeReservations : historyReservations;

  const handleOpenQR = (res: Reservation) => {
    setSelectedPass(res);
    setPassModalVisible(true);
  };

  const handleCancelPress = (res: Reservation) => {
    Alert.alert(
      'Cancel Reservation?',
      `Are you sure you want to release ${res.roomName} on ${res.date} (${res.timeRange})? The slot will become available for other VKU students immediately and your reminder alert will be removed.`,
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            await cancelReservation(res.id);
          },
        },
      ]
    );
  };

  const renderReservationCard = ({ item }: { item: Reservation }) => {
    const isCheckedIn = item.status === 'checked_in';
    const isCancelled = item.status === 'cancelled';

    return (
      <View style={styles.card}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View style={styles.roomInfoCol}>
            <Text style={styles.roomName}>{item.roomName}</Text>
            <Text style={styles.passCodeTag}>PASS ID: {item.id}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isCheckedIn
                ? styles.statusCheckedIn
                : isCancelled
                ? styles.statusCancelled
                : styles.statusConfirmed,
            ]}
          >
            <Ionicons
              name={
                isCheckedIn
                  ? 'checkmark-circle'
                  : isCancelled
                  ? 'close-circle'
                  : 'timer'
              }
              size={12}
              color={
                isCheckedIn
                  ? '#065F46'
                  : isCancelled
                  ? '#991B1B'
                  : '#1E40AF'
              }
            />
            <Text
              style={[
                styles.statusBadgeText,
                isCheckedIn
                  ? styles.statusTextCheckedIn
                  : isCancelled
                  ? styles.statusTextCancelled
                  : styles.statusTextConfirmed,
              ]}
            >
              {isCheckedIn
                ? 'Checked In'
                : isCancelled
                ? 'Cancelled'
                : 'Confirmed'}
            </Text>
          </View>
        </View>

        {/* Date and Slot Grid */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>{item.timeRange}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="business-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>Bldg {item.building}-F{item.floor}</Text>
          </View>
        </View>

        {/* Purpose */}
        <View style={styles.purposeContainer}>
          <Text style={styles.purposeLabel}>Group Topic:</Text>
          <Text style={styles.purposeText} numberOfLines={1}>
            {item.groupPurpose}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {!isCancelled && (
            <TouchableOpacity
              style={styles.qrBtn}
              onPress={() => handleOpenQR(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={16} color="#0F52BA" />
              <Text style={styles.qrBtnText}>QR Check-in Pass</Text>
            </TouchableOpacity>
          )}

          {!isCancelled && !isCheckedIn && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancelPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>My Reservations</Text>
        <Text style={styles.screenSubtitle}>
          Manage active study room passes & check-in access
        </Text>
      </View>

      {/* Segmented Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'active' && styles.tabBtnTextActive,
            ]}
          >
            Active Passes ({activeReservations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'history' && styles.tabBtnTextActive,
            ]}
          >
            Cancelled ({historyReservations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reservation Feed */}
      <FlatList
        data={displayedList}
        renderItem={renderReservationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Ionicons
              name={activeTab === 'active' ? 'calendar-outline' : 'archive-outline'}
              size={54}
              color="#CBD5E1"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active'
                ? 'No active room reservations'
                : 'No cancelled bookings'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'active'
                ? 'Reserve a study room or lab to collaborate with your team.'
                : 'Any cancelled passes will appear here.'}
            </Text>

            {activeTab === 'active' && (
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('RoomsTab')}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={16} color="#FFFFFF" />
                <Text style={styles.browseBtnText}>Browse Available Rooms</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Interactive QR Check-in Pass Modal */}
      <QRPassModal
        visible={passModalVisible}
        reservation={selectedPass}
        onClose={() => setPassModalVisible(false)}
        onCheckIn={(id) => {
          checkInReservation(id);
          if (selectedPass) {
            setSelectedPass({ ...selectedPass, status: 'checked_in' });
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#0F52BA',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  roomInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  passCodeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  statusConfirmed: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusCheckedIn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusCancelled: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextConfirmed: {
    color: '#1E40AF',
  },
  statusTextCheckedIn: {
    color: '#065F46',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  purposeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  purposeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 4,
  },
  purposeText: {
    fontSize: 12,
    color: '#0F172A',
    fontStyle: 'italic',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  qrBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F52BA',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
    maxWidth: 260,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F52BA',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    gap: 6,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
