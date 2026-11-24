/**
 * Edzy Consumer Design System
 * Unicorn-grade dual-theme system (Light Default Airbnb / Linear Dark)
 */

import { Platform, ViewStyle, TextStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  mode: 'light' as const,
  // Canvas & Surfaces
  background: '#F5F7FA',       // Soft cool off-white canvas
  surface: '#FFFFFF',          // Pure white card surface
  surfaceBorder: '#EBEBEB',    // Subtle card border
  surfaceHover: '#F0F2F5',     // Hover / pressed state
  divider: '#F0F0F0',         // Thin dividers

  // Shadows (use with StyleSheet)
  shadow: {
    color: '#000000',
    opacity: 0.05,
    radius: 10,
    offset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Primary Brand (Royal Indigo)
  brand: {
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primaryLight: '#6366F1',
    tint: '#EEF2FF',
    tintBorder: '#C7D2FE',
  },

  // Student Persona
  student: {
    primary: '#4F46E5',
    primaryLight: '#6366F1',
    secondary: '#06B6D4',
    secondaryLight: '#22D3EE',
    glow: 'rgba(79, 70, 229, 0.10)',
    cardBg: '#EEF2FF',
    border: '#C7D2FE',
    accent: '#8B5CF6',
  },

  // Parent ERP Persona
  parent: {
    primary: '#059669',
    primaryLight: '#10B981',
    secondary: '#D97706',
    secondaryLight: '#F59E0B',
    glow: 'rgba(5, 150, 105, 0.10)',
    cardBg: '#ECFDF5',
    border: '#A7F3D0',
    accent: '#EC4899',
  },

  // Spatial AR Engine
  spatial: {
    telemetryBg: 'rgba(6, 182, 212, 0.12)',
    telemetryBorder: '#06B6D4',
    nodeActive: '#38BDF8',
    nodeInactive: '#94A3B8',
    gridLine: 'rgba(79, 70, 229, 0.15)',
    accentRed: '#EF4444',
    accentGreen: '#10B981',
    viewportBg: '#111827',
  },

  // Typography Hierarchy
  text: {
    primary: '#111827',
    secondary: '#717171',
    muted: '#9CA3AF',
    disabled: '#D1D5DB',
    inverse: '#FFFFFF',
    brand: '#4F46E5',
    ink: '#222222',          // Airbnb deep ink
    secondaryInk: '#717171', // Airbnb secondary neutral
    airbnbDivider: '#F0F0F0',
  },

  // Status & Badges
  status: {
    success: '#059669',
    successBg: '#ECFDF5',
    successBorder: '#A7F3D0',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    error: '#DC2626',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    info: '#2563EB',
    infoBg: '#EFF6FF',
    infoBorder: '#BFDBFE',
  },

  // Payment & Receipts
  payment: {
    upi: '#7C3AED',
    upiBg: '#F5F3FF',
    cash: '#059669',
    cashBg: '#ECFDF5',
    cheque: '#0284C7',
    chequeBg: '#F0F9FF',
    due: '#DC2626',
    dueBg: '#FEF2F2',
  },

  // Streak & Energy
  streak: {
    primary: '#EA580C',
    tint: '#FFF7ED',
    border: '#FED7AA',
  },

  // Tab Bar
  tabBar: {
    background: '#FFFFFF',
    border: '#EAECEF',
    active: '#4F46E5',
    inactive: '#9CA3AF',
    pillOverlay: 'rgba(15, 23, 42, 0.78)',
    pillBorder: 'rgba(255, 255, 255, 0.16)',
  },

  // Legacy compat
  bentoCard: '#FFFFFF',
  bentoCardHover: '#F0F2F5',
  cardBorder: '#EBEBEB',
  cardBorderLight: '#E5E7EB',
};

export const darkTheme = {
  mode: 'dark' as const,
  // Canvas & Surfaces
  background: '#0E1117',       // Linear/Airbnb deep obsidian canvas
  surface: '#161B22',          // Card surface
  surfaceBorder: '#262C36',    // Card border
  surfaceHover: '#1F242C',     // Hover / pressed state
  divider: '#262C36',         // Thin dividers

  // Shadows
  shadow: {
    color: '#000000',
    opacity: 0.35,
    radius: 12,
    offset: { width: 0, height: 4 },
    elevation: 3,
  },

  // Primary Brand (Indigo Tinted for Dark)
  brand: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    tint: 'rgba(99, 102, 241, 0.16)',
    tintBorder: 'rgba(99, 102, 241, 0.32)',
  },

  // Student Persona
  student: {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    secondary: '#22D3EE',
    secondaryLight: '#38BDF8',
    glow: 'rgba(99, 102, 241, 0.20)',
    cardBg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.28)',
    accent: '#A78BFA',
  },

  // Parent ERP Persona
  parent: {
    primary: '#34D399',
    primaryLight: '#6EE7B7',
    secondary: '#FBBF24',
    secondaryLight: '#FCD34D',
    glow: 'rgba(52, 211, 153, 0.20)',
    cardBg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.28)',
    accent: '#F472B6',
  },

  // Spatial AR Engine
  spatial: {
    telemetryBg: 'rgba(6, 182, 212, 0.16)',
    telemetryBorder: '#06B6D4',
    nodeActive: '#38BDF8',
    nodeInactive: '#64748B',
    gridLine: 'rgba(99, 102, 241, 0.25)',
    accentRed: '#F87171',
    accentGreen: '#34D399',
    viewportBg: '#090D14',
  },

  // Typography Hierarchy
  text: {
    primary: '#F3F4F6',      // Crisp light gray
    secondary: '#9CA3AF',    // Muted gray
    muted: '#6B7280',
    disabled: '#4B5563',
    inverse: '#111827',
    brand: '#818CF8',
    ink: '#F3F4F6',          // Dark mode ink
    secondaryInk: '#9CA3AF',
    airbnbDivider: '#262C36',
  },

  // Status & Badges
  status: {
    success: '#34D399',
    successBg: 'rgba(52, 211, 153, 0.14)',
    successBorder: 'rgba(52, 211, 153, 0.28)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.14)',
    warningBorder: 'rgba(251, 191, 36, 0.28)',
    error: '#F87171',
    errorBg: 'rgba(248, 113, 113, 0.14)',
    errorBorder: 'rgba(248, 113, 113, 0.28)',
    info: '#60A5FA',
    infoBg: 'rgba(96, 165, 250, 0.14)',
    infoBorder: 'rgba(96, 165, 250, 0.28)',
  },

  // Payment & Receipts
  payment: {
    upi: '#A78BFA',
    upiBg: 'rgba(167, 139, 250, 0.14)',
    cash: '#34D399',
    cashBg: 'rgba(52, 211, 153, 0.14)',
    cheque: '#38BDF8',
    chequeBg: 'rgba(56, 189, 248, 0.14)',
    due: '#F87171',
    dueBg: 'rgba(248, 113, 113, 0.14)',
  },

  // Streak & Energy
  streak: {
    primary: '#FB923C',
    tint: 'rgba(251, 146, 60, 0.14)',
    border: 'rgba(251, 146, 60, 0.28)',
  },

  // Tab Bar
  tabBar: {
    background: '#161B22',
    border: '#262C36',
    active: '#818CF8',
    inactive: '#6B7280',
    pillOverlay: 'rgba(28, 33, 43, 0.86)',
    pillBorder: 'rgba(255, 255, 255, 0.14)',
  },

  // Legacy compat
  bentoCard: '#161B22',
  bentoCardHover: '#1F242C',
  cardBorder: '#262C36',
  cardBorderLight: '#1F242C',
};

// Default export matches lightTheme for backward compatibility
export const colors = lightTheme;
export type ColorTheme = typeof lightTheme;

export function getTheme(mode: ThemeMode = 'light'): typeof lightTheme | typeof darkTheme {
  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Airbnb Card Standard Helper
 */
export const airbnbCardStyle: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#EBEBEB',
  ...Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
  }),
};

export const getAirbnbCardStyle = (mode: ThemeMode = 'light'): ViewStyle => {
  const isDark = mode === 'dark';
  return {
    backgroundColor: isDark ? darkTheme.surface : lightTheme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? darkTheme.surfaceBorder : lightTheme.surfaceBorder,
    ...Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.35 : 0.06,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.35 : 0.06,
        shadowRadius: 16,
      },
    }),
  };
};

/**
 * Airbnb Typography Standard
 */
export const airbnbTypography = {
  displayTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: '#222222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    color: '#222222',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: '#222222',
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#717171',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#717171',
  },
  divider: '#F0F0F0',
  ink: '#222222',
  secondaryInk: '#717171',
};
