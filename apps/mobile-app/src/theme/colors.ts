/**
 * Edzy Light-First Consumer Design System
 * Unicorn-grade palette inspired by Zomato, Blinkit, Groww, Duolingo, Airbnb
 */

import { Platform, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Canvas & Surfaces
  background: '#F5F7FA',       // Soft cool off-white canvas
  surface: '#FFFFFF',          // Pure white card surface
  surfaceBorder: '#EAECEF',    // Subtle card border
  surfaceHover: '#F0F2F5',     // Hover / pressed state
  divider: '#E5E7EB',         // Thin dividers

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

  // Student Persona (keep contract keys so store references compile)
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

  // Spatial AR Engine (dark viewport only)
  spatial: {
    telemetryBg: 'rgba(6, 182, 212, 0.12)',
    telemetryBorder: '#06B6D4',
    nodeActive: '#38BDF8',
    nodeInactive: '#94A3B8',
    gridLine: 'rgba(79, 70, 229, 0.15)',
    accentRed: '#EF4444',
    accentGreen: '#10B981',
    viewportBg: '#111827',  // Dark charcoal for 3D viewport only
  },

  // Typography Hierarchy
  text: {
    primary: '#111827',      // Deep charcoal (never pure black)
    secondary: '#6B7280',    // Clean neutral gray
    muted: '#9CA3AF',        // Light muted
    disabled: '#D1D5DB',     // Very light
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
  },

  // Legacy compat (old dark theme references)
  bentoCard: '#FFFFFF',
  bentoCardHover: '#F0F2F5',
  cardBorder: '#EAECEF',
  cardBorderLight: '#E5E7EB',
} as const;

export type ColorTheme = typeof colors;

/**
 * Airbnb Card Standard
 * Pure white tactile surface with subtle border and cross-platform diffused elevation
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

/**
 * Airbnb Typography Standard
 * Tight tracking display titles and human-centered text hierarchy
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
