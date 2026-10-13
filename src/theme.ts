import { Ionicons } from '@expo/vector-icons';

export const colors = {
  primary: '#6C4DF6',
  primaryDark: '#2E1F7A',
  primarySoft: '#EFEBFF',
  primaryBorder: '#D9D0FF',
  accent: '#FF8A3D',
  accentSoft: '#FFF1E6',
  bg: '#F6F5FB',
  surface: '#FFFFFF',
  border: '#E6E3F2',
  text: '#1B1730',
  textMuted: '#6B6785',
  textFaint: '#A19DB8',
  success: '#12A66B',
  successSoft: '#E3F7EE',
  successBorder: '#BDEBD6',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  dangerBorder: '#F7C9CB',
  bookedSoft: '#F1F0F7',
};

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#2E1F7A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
};

export const equipmentIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  Projector: 'videocam-outline',
  Whiteboard: 'create-outline',
  'High-spec PC': 'desktop-outline',
  AC: 'snow-outline',
};

export const statusMeta = {
  confirmed: {
    label: 'Confirmed',
    icon: 'time',
    fg: colors.primary,
    bg: colors.primarySoft,
    border: colors.primaryBorder,
  },
  checked_in: {
    label: 'Checked in',
    icon: 'checkmark-circle',
    fg: colors.success,
    bg: colors.successSoft,
    border: colors.successBorder,
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'close-circle',
    fg: colors.danger,
    bg: colors.dangerSoft,
    border: colors.dangerBorder,
  },
} as const;
