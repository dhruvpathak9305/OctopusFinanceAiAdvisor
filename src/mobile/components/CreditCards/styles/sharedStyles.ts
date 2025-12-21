/**
 * Shared Style Constants for Credit Cards Page
 * Based on the Cred-inspired design system
 */

import { StyleSheet } from 'react-native';

// Color Palette (matching globals.css CSS variables)
export const COLORS = {
  // Base colors
  background: '#050505', // 0 0% 2%
  foreground: '#FAFAFA', // 0 0% 98%
  card: '#0D0D0D', // 0 0% 5%
  
  // Accent colors
  primary: '#FF8C32', // 32 95% 55% - Orange
  primaryMuted: '#CC6F28',
  gold: '#F5A623', // 45 90% 55%
  goldMuted: '#B8841A', // 45 70% 40%
  
  // Neutral colors
  muted: '#1F1F1F', // 0 0% 12%
  mutedForeground: '#737373', // 0 0% 45%
  border: '#262626', // 0 0% 15%
  
  // Semantic colors
  destructive: '#EF4444', // 0 84% 60%
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Glass effect overlays
  glassLight: 'rgba(255, 255, 255, 0.06)',
  glassLighter: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(255, 255, 255, 0.02)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderStrong: 'rgba(255, 255, 255, 0.12)',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.6)',
  shadowLight: 'rgba(0, 0, 0, 0.4)',
};

// Reusable Style Utilities
export const SHARED_STYLES = StyleSheet.create({
  // Glass effect (matching .glass-effect)
  glassEffect: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  
  // Strong glass effect (matching .glass-effect-strong)
  glassEffectStrong: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: COLORS.glassBorderStrong,
  },
  
  // Card shadow (matching .card-shadow)
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20, // Android
  },
  
  // Elevated shadow
  elevatedShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Subtle shadow
  subtleShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  
  // Glow ring (matching .glow-ring)
  glowRing: {
    shadowColor: COLORS.foreground,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
});

// Animation Timings
export const TIMINGS = {
  fast: 200,
  medium: 300,
  slow: 500,
  verySlow: 1000,
  
  // Specific animations
  shimmer: 3000,
  cardShine: 4000,
  pulseGlow: 2000,
  particleFloat: 15000,
};

// Spacing System
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Typography
export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 44,
  },
  
  weights: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },
};

// Helper function to create gradient array for LinearGradient
export const createGradient = (colors: string[], locations?: number[]) => ({
  colors,
  locations: locations || colors.map((_, i) => i / (colors.length - 1)),
});

// Common gradients
export const GRADIENTS = {
  glass: createGradient([
    'rgba(255, 255, 255, 0.1)',
    'rgba(255, 255, 255, 0.04)',
  ]),
  
  primary: createGradient([
    '#FF8C32',
    '#F5A623',
  ]),
  
  gold: createGradient([
    '#F5A623',
    '#FF8C32',
  ]),
  
  amazonCard: createGradient([
    '#18181B', // zinc-900
    '#27272A', // zinc-800
    '#18181B',
  ]),
  
  hdfcCard: createGradient([
    '#FB923C', // orange-400
    '#F97316', // orange-500
    '#EF4444', // red-500
  ]),
  
  axisCard: createGradient([
    '#27272A', // zinc-800
    '#3F3F46', // zinc-700
    '#27272A',
  ]),
};

