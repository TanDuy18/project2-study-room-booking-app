import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleLogo } from '../components/GoogleLogo';
import { colors, radius, shadow } from '../theme';

export const ProfileScreen: React.FC = () => {
  const userSession = useBookingStore((s) => s.userSession);
  const reservations = useBookingStore((s) => s.reservations);
  const resetToMockData = useBookingStore((s) => s.resetToMockData);
  const authUser = useAuthStore((s) => s.authUser);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () =>
    Alert.alert('Sign out?', 'You can sign in again at any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);

  const totalBookings = reservations.length;
  const checkedInCount = reservations.filter((r) => r.status === 'checked_in').length;
  const totalHours = reservations.filter((r) => r.status !== 'cancelled').length * 2;

  const handleTestNotification = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notification permission',
          'Please enable notifications in system settings to receive check-in alerts.'
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'VKU Study Room Alert (Test)',
          body: 'Your reserved slot in B.302 AI Lab begins in 15 minutes! Tap to show your QR pass.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });

      Alert.alert('Notification scheduled', 'A test alert will appear in 2 seconds.');
    } catch (err: any) {
      Alert.alert('Notification notice', err?.message || 'Notification test finished.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset demo data?',
      'This restores the default rooms and bookings for grading or testing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToMockData();
            Alert.alert('Done', 'Default rooms and bookings restored.');
          },
        },
      ]
    );
  };

  const stats = [
    { icon: 'calendar' as const, value: String(totalBookings), label: 'Bookings' },
    { icon: 'time' as const, value: `${totalHours}h`, label: 'Study time' },
    { icon: 'checkmark-done-circle' as const, value: String(checkedInCount), label: 'Check-ins' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>

        {/* Student ID card */}
        <View style={styles.idCard}>
          <View style={styles.idTop}>
            <View style={styles.logo}>
              <Ionicons name="school" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uni}>VIETNAM - KOREA UNIVERSITY</Text>
              <Text style={styles.uniSub}>Campus smart access</Text>
            </View>
          </View>

          <View style={styles.idMain}>
            {authUser?.picture ? (
              <Image source={{ uri: authUser.picture }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userSession.name.charAt(0)}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{userSession.name}</Text>
              <Text style={styles.sid}>{userSession.studentId}</Text>
              <Text style={styles.dept}>
                {userSession.department} · {userSession.year}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Account */}
        {authUser && (
          <View style={styles.accountCard}>
            {authUser.provider === 'google' ? (
              <GoogleLogo size={22} />
            ) : (
              <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.accountTitle}>
                {authUser.provider === 'google' ? 'Signed in with Google' : 'Demo account'}
              </Text>
              <Text style={styles.accountEmail} numberOfLines={1}>
                {authUser.email}
              </Text>
            </View>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tools */}
        <Text style={styles.sectionTitle}>Demo tools</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleTestNotification} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="notifications" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Test reminder</Text>
              <Text style={styles.actionDesc}>Send a sample check-in alert in 2 seconds</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleResetData} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: colors.dangerSoft }]}>
              <Ionicons name="refresh" size={18} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: colors.danger }]}>Reset demo data</Text>
              <Text style={styles.actionDesc}>Restore default rooms and bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* Rules */}
        <Text style={styles.sectionTitle}>Room rules</Text>
        <View style={[styles.card, { padding: 14, gap: 12 }]}>
          {[
            { icon: 'time-outline' as const, bold: '15-minute grace period', text: 'Check in with your QR pass within 15 minutes of the slot start.' },
            { icon: 'shield-checkmark-outline' as const, bold: 'No double booking', text: 'Overlapping reservations are blocked automatically.' },
            { icon: 'sparkles-outline' as const, bold: 'Leave it tidy', text: 'Power down projectors and workstations when you leave.' },
          ].map((r) => (
            <View key={r.bold} style={styles.rule}>
              <View style={styles.ruleIcon}>
                <Ionicons name={r.icon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.ruleText}>
                <Text style={styles.ruleBold}>{r.bold}. </Text>
                {r.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 14 },
  idCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 14,
    ...shadow.card,
  },
  idTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uni: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  uniSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  idMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  avatarImg: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.accent },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 22,
  },
  accountTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  accountEmail: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  signOutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  signOutText: { fontSize: 13, fontWeight: '800', color: colors.danger },
  name: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  sid: { color: colors.accent, fontSize: 14, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
  dept: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 6 },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 22,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  actionDesc: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },
  rule: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleText: { flex: 1, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  ruleBold: { fontWeight: '800', color: colors.text },
});
