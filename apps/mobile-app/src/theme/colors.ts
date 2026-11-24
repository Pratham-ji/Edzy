/**
 * Edzy Consumer Design System
 * Unicorn-grade dual-theme system (Light Default / Linear Dark)
 */

import { Platform, ViewStyle, TextStyle } from 'react-native';
import { useEdzyStore } from '../store/useEdzyStore';

export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  mode: 'light' | 'dark';
  // Core Surface & Canvas
  canvas: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  border: string;
  borderSubtle: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Brand Palette
  brand: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    tint: string;
    tintBorder: string;
  };
  brandPrimary: string;
  brandDark: string;
  brandTint: string;
  brandBorder: string;

  // Functional Accents
  success: string;
  successTint: string;
  warning: string;
  warningTint: string;
  danger: string;
  dangerTint: string;
  streak: {
    primary: string;
    tint: string;
    border: string;
  };
  streakPrimary: string;
  streakTint: string;

  // Shadows
  shadow: {
    color: string;
    opacity: number;
    radius: number;
    offset: { width: number; height: number };
    elevation: number;
  };

  // Legacy & Nested Token Compatibility
  background: string;
  surfaceBorder: string;
  surfaceHover: string;
  divider: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    disabled: string;
    inverse: string;
    brand: string;
    ink: string;
    secondaryInk: string;
    airbnbDivider: string;
  };
  brandObj: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    tint: string;
    tintBorder: string;
  };
  student: {
    primary: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;
    glow: string;
    cardBg: string;
    border: string;
    accent: string;
  };
  parent: {
    primary: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;
    glow: string;
    cardBg: string;
    border: string;
    accent: string;
  };
  spatial: {
    telemetryBg: string;
    telemetryBorder: string;
    nodeActive: string;
    nodeInactive: string;
    gridLine: string;
    accentRed: string;
    accentGreen: string;
    viewportBg: string;
  };
  status: {
    success: string;
    successBg: string;
    successBorder: string;
    warning: string;
    warningBg: string;
    warningBorder: string;
    error: string;
    errorBg: string;
    errorBorder: string;
    info: string;
    infoBg: string;
    infoBorder: string;
  };
  payment: {
    upi: string;
    upiBg: string;
    cash: string;
    cashBg: string;
    cheque: string;
    chequeBg: string;
    due: string;
    dueBg: string;
  };
  streakObj: {
    primary: string;
    tint: string;
    border: string;
  };
  tabBar: {
    background: string;
    border: string;
    active: string;
    inactive: string;
    pillOverlay: string;
    pillBorder: string;
  };
  bentoCard: string;
  bentoCardHover: string;
  cardBorder: string;
  cardBorderLight: string;
}

export const lightTheme: ThemeTokens = {
  mode: 'light',
  canvas: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E5E9F2',
  borderSubtle: '#F1F5F9',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  brand: {
    primary: '#4F46E5',
    primaryDark: '#3730A3',
    primaryLight: '#6366F1',
    tint: '#EEF2FF',
    tintBorder: '#C7D2FE',
  },
  brandPrimary: '#4F46E5',
  brandDark: '#3730A3',
  brandTint: '#EEF2FF',
  brandBorder: '#C7D2FE',

  success: '#059669',
  successTint: '#ECFDF5',
  warning: '#D97706',
  warningTint: '#FFFBEB',
  danger: '#DC2626',
  dangerTint: '#FEF2F2',
  streak: {
    primary: '#EA580C',
    tint: '#FFF7ED',
    border: '#FED7AA',
  },
  streakPrimary: '#EA580C',
  streakTint: '#FFF7ED',

  shadow: {
    color: '#000000',
    opacity: 0.05,
    radius: 10,
    offset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Compatibility aliases
  background: '#F6F8FC',
  surfaceBorder: '#E5E9F2',
  surfaceHover: '#F1F5F9',
  divider: '#E5E9F2',

  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
    brand: '#4F46E5',
    ink: '#0F172A',
    secondaryInk: '#475569',
    airbnbDivider: '#E5E9F2',
  },

  brandObj: {
    primary: '#4F46E5',
    primaryDark: '#3730A3',
    primaryLight: '#6366F1',
    tint: '#EEF2FF',
    tintBorder: '#C7D2FE',
  },

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

  streakObj: {
    primary: '#EA580C',
    tint: '#FFF7ED',
    border: '#FED7AA',
  },

  tabBar: {
    background: '#FFFFFF',
    border: '#E5E9F2',
    active: '#4F46E5',
    inactive: '#94A3B8',
    pillOverlay: 'rgba(15, 23, 42, 0.86)',
    pillBorder: 'rgba(255, 255, 255, 0.14)',
  },

  bentoCard: '#FFFFFF',
  bentoCardHover: '#F1F5F9',
  cardBorder: '#E5E9F2',
  cardBorderLight: '#F1F5F9',
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  canvas: '#090D16',
  surface: '#121826',
  surfaceElevated: '#192234',
  surfaceSubtle: '#1A2336',
  border: '#232E44',
  borderSubtle: '#1B2438',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  brand: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    tint: 'rgba(99, 102, 241, 0.16)',
    tintBorder: 'rgba(99, 102, 241, 0.32)',
  },
  brandPrimary: '#6366F1',
  brandDark: '#4F46E5',
  brandTint: 'rgba(99, 102, 241, 0.16)',
  brandBorder: 'rgba(99, 102, 241, 0.32)',

  success: '#34D399',
  successTint: 'rgba(16, 185, 129, 0.14)',
  warning: '#FBBF24',
  warningTint: 'rgba(245, 158, 11, 0.14)',
  danger: '#F87171',
  dangerTint: 'rgba(239, 68, 68, 0.14)',
  streak: {
    primary: '#FB923C',
    tint: 'rgba(251, 146, 60, 0.14)',
    border: 'rgba(251, 146, 60, 0.28)',
  },
  streakPrimary: '#FB923C',
  streakTint: 'rgba(251, 146, 60, 0.14)',

  shadow: {
    color: '#000000',
    opacity: 0.35,
    radius: 12,
    offset: { width: 0, height: 3 },
    elevation: 1,
  },

  // Compatibility aliases
  background: '#090D16',
  surfaceBorder: '#232E44',
  surfaceHover: '#1A2336',
  divider: '#232E44',

  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    disabled: '#334155',
    inverse: '#090D16',
    brand: '#818CF8',
    ink: '#F8FAFC',
    secondaryInk: '#94A3B8',
    airbnbDivider: '#232E44',
  },

  brandObj: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    tint: 'rgba(99, 102, 241, 0.16)',
    tintBorder: 'rgba(99, 102, 241, 0.32)',
  },

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

  streakObj: {
    primary: '#FB923C',
    tint: 'rgba(251, 146, 60, 0.14)',
    border: 'rgba(251, 146, 60, 0.28)',
  },

  tabBar: {
    background: '#121826',
    border: '#232E44',
    active: '#818CF8',
    inactive: '#64748B',
    pillOverlay: 'rgba(28, 37, 56, 0.90)',
    pillBorder: 'rgba(255, 255, 255, 0.16)',
  },

  bentoCard: '#121826',
  bentoCardHover: '#1A2336',
  cardBorder: '#232E44',
  cardBorderLight: '#1B2438',
};

// Default export matches lightTheme for backward compatibility
export const colors = lightTheme;
export type ColorTheme = ThemeTokens;

export function getTheme(mode: ThemeMode = 'light'): ThemeTokens {
  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Global Hook to consume current active theme
 */
export function useAppTheme() {
  const themeMode = useEdzyStore((state) => state.themeMode || 'light');
  const toggleThemeMode = useEdzyStore((state) => state.toggleThemeMode);
  const setThemeMode = useEdzyStore((state) => state.setThemeMode);
  const isDark = themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return {
    theme,
    isDark,
    themeMode,
    toggleThemeMode,
    setThemeMode,
  };
}

/**
 * Cross-platform card shadow helper
 */
export function getCardShadow(isDark: boolean): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.05,
      shadowRadius: isDark ? 12 : 10,
    },
    android: {
      elevation: isDark ? 1 : 2,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.05,
      shadowRadius: isDark ? 12 : 10,
    },
  }) || {};
}

/**
 * Airbnb Card Standard Helper
 */
export const airbnbCardStyle: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#E5E9F2',
  ...Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
    },
  }),
};

export const getAirbnbCardStyle = (mode: ThemeMode = 'light'): ViewStyle => {
  const isDark = mode === 'dark';
  const t = isDark ? darkTheme : lightTheme;
  return {
    backgroundColor: t.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.border,
    ...getCardShadow(isDark),
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
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    color: '#0F172A',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: '#0F172A',
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#475569',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#94A3B8',
  },
  divider: '#E5E9F2',
  ink: '#0F172A',
  secondaryInk: '#475569',
};
