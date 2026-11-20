/**
 * Edzy Dark-First Bento Grid Design System Palette
 * B2B K-12 Educational SaaS & Spatial Computing Platform
 */

export const colors = {
  // Base Obsidian & Background
  background: '#090D16', // Deep Obsidian canvas
  surface: '#0F172A', // Secondary dark surface
  bentoCard: '#131B2E', // Primary Bento tile surface
  bentoCardHover: '#1A243D',
  cardBorder: '#1E293B', // Subtle slate border
  cardBorderLight: '#334155',

  // Student Persona Palette (Cyber Indigo & Spatial Cyan)
  student: {
    primary: '#6366F1', // Indigo 500
    primaryLight: '#818CF8',
    secondary: '#06B6D4', // Cyan 500
    secondaryLight: '#22D3EE',
    glow: 'rgba(99, 102, 241, 0.25)',
    cardBg: '#131936',
    border: '#2A3362',
    accent: '#A855F7', // Violet
  },

  // Parent ERP Palette (Emerald Security & Amber Alerts)
  parent: {
    primary: '#10B981', // Emerald 500
    primaryLight: '#34D399',
    secondary: '#F59E0B', // Amber 500
    secondaryLight: '#FBBF24',
    glow: 'rgba(16, 185, 129, 0.25)',
    cardBg: '#112224',
    border: '#1B4332',
    accent: '#EC4899', // Pink accent
  },

  // Spatial AR Engine
  spatial: {
    telemetryBg: 'rgba(6, 182, 212, 0.12)',
    telemetryBorder: '#06B6D4',
    nodeActive: '#38BDF8',
    nodeInactive: '#64748B',
    gridLine: 'rgba(99, 102, 241, 0.15)',
    accentRed: '#EF4444',
    accentGreen: '#10B981',
  },

  // Typography
  text: {
    primary: '#F8FAFC', // Slate 50
    secondary: '#94A3B8', // Slate 400
    muted: '#64748B', // Slate 500
    disabled: '#475569', // Slate 600
    inverse: '#090D16',
    brand: '#38BDF8',
  },

  // Status & Badges
  status: {
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.15)',
  },

  // Payment & Receipts
  payment: {
    upi: '#8B5CF6',
    cash: '#10B981',
    cheque: '#0EA5E9',
    due: '#F43F5E',
  },
} as const;

export type ColorTheme = typeof colors;
