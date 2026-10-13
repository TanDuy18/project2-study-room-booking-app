import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleLogo } from '../components/GoogleLogo';
import { useGoogleAuth } from '../auth/useGoogleAuth';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import { colors, radius } from '../theme';

export const LoginScreen: React.FC = () => {
  const { signIn, loading, error } = useGoogleAuth();
  const setAuthUser = useAuthStore((s) => s.setAuthUser);
  const userSession = useBookingStore((s) => s.userSession);

  const continueAsDemo = () =>
    setAuthUser({
      id: 'demo',
      name: userSession.name,
      email: userSession.email,
      picture: undefined,
      provider: 'demo',
    });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Ionicons name="school" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.brand}>VKU SMART CAMPUS</Text>
        <Text style={styles.title}>Study Room Booking</Text>
        <Text style={styles.subtitle}>
          Find a room, book a slot and unlock the door with a QR pass.
        </Text>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Welcome</Text>
        <Text style={styles.sheetDesc}>Sign in to book rooms with your own account.</Text>

        <TouchableOpacity
          style={[styles.googleBtn, loading && { opacity: 0.7 }]}
          onPress={signIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <GoogleLogo size={22} />
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.demoBtn} onPress={continueAsDemo} activeOpacity={0.8}>
          <Text style={styles.demoText}>Continue as demo student</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          We only read your name, email and profile photo from Google.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  brand: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 6 },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
    lineHeight: 20,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  sheetDesc: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  googleText: { fontSize: 15, fontWeight: '700', color: colors.text },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 12,
  },
  errorText: { flex: 1, fontSize: 12, color: colors.danger, lineHeight: 17 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  demoBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  legal: { fontSize: 11, color: colors.textFaint, textAlign: 'center', marginTop: 16 },
});
