import { StyleSheet } from "react-native";

/**
 * Enhanced design system with improved aesthetics and baseline grid alignment
 * Focus on clean, modern mobile-first design
 */
export const designSystem = {
  // Baseline grid spacing (8px base)
  spacing: {
    xs: 4, // 0.5 units
    sm: 8, // 1 unit
    md: 12, // 1.5 units
    lg: 16, // 2 units
    xl: 24, // 3 units
    xxl: 32, // 4 units
    xxxl: 48, // 6 units
  },

  // Consistent border radius system
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 100,
  },

  // Enhanced typography with better hierarchy
  typography: {
    title: {
      fontSize: 20,
      fontWeight: "700",
      lineHeight: 24,
      letterSpacing: -0.2,
    },
    heading: {
      fontSize: 18,
      fontWeight: "700",
      lineHeight: 22,
      letterSpacing: -0.1,
    },
    subheading: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 20,
    },
    body: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20, // Better line height for readability
    },
    caption: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 16,
    },
    small: {
      fontSize: 10,
      fontWeight: "500",
      lineHeight: 14,
      letterSpacing: 0.1,
    },
  },

  // Enhanced shadow system for depth
  shadows: {
    subtle: {
      elevation: 1,
      shadowColor: "#1C2128",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 1,
    },
    small: {
      elevation: 2,
      shadowColor: "#1C2128",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    medium: {
      elevation: 4,
      shadowColor: "#1C2128",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    large: {
      elevation: 8,
      shadowColor: "#1C2128",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
    },
  },

  // Quick Actions vibrant progress color system
  progressColors: {
    safe: "#10B981", // Vibrant green (matches Quick Actions primary)
    caution: "#3B82F6", // Vibrant blue (matches Quick Actions secondary)
    warning: "#F59E0B", // Vibrant amber (matches Quick Actions accent)
    danger: "#EF4444", // Vibrant red (matches Quick Actions error)
  },

  // Animation values for smooth interactions
  animation: {
    micro: 100,
    fast: 200,
    normal: 300,
    slow: 400,
  },

  // Interactive feedback
  interaction: {
    scale: 0.96,
    opacity: 0.8,
    duration: 150,
  },
};

/**
 * Common component styles following the design system
 */
export const commonStyles = StyleSheet.create({
  // Container styles
  fullScreenModal: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 50, // Account for status bar
  },

  // Card styles
  card: {
    borderRadius: designSystem.borderRadius.lg,
    borderWidth: 1,
    padding: designSystem.spacing.lg,
  },
  cardWithShadow: {
    borderRadius: designSystem.borderRadius.lg,
    borderWidth: 1,
    padding: designSystem.spacing.lg,
    ...designSystem.shadows.medium,
  },

  // Button styles
  primaryButton: {
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.xl,
    borderRadius: designSystem.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // iOS accessibility guidelines
  },
  secondaryButton: {
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.xl,
    borderRadius: designSystem.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 44,
  },
  iconButton: {
    padding: designSystem.spacing.sm,
    borderRadius: designSystem.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },

  // Input styles
  textInput: {
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.borderRadius.md,
    borderWidth: 1,
    fontSize: 16, // Prevent zoom on iOS
    minHeight: 44,
  },

  // Layout styles
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowSpaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Spacing utilities
  marginTopSm: { marginTop: designSystem.spacing.sm },
  marginTopMd: { marginTop: designSystem.spacing.md },
  marginTopLg: { marginTop: designSystem.spacing.lg },
  marginTopXl: { marginTop: designSystem.spacing.xl },

  marginBottomSm: { marginBottom: designSystem.spacing.sm },
  marginBottomMd: { marginBottom: designSystem.spacing.md },
  marginBottomLg: { marginBottom: designSystem.spacing.lg },
  marginBottomXl: { marginBottom: designSystem.spacing.xl },

  paddingHorizontalSm: { paddingHorizontal: designSystem.spacing.sm },
  paddingHorizontalMd: { paddingHorizontal: designSystem.spacing.md },
  paddingHorizontalLg: { paddingHorizontal: designSystem.spacing.lg },
  paddingHorizontalXl: { paddingHorizontal: designSystem.spacing.xl },

  paddingVerticalSm: { paddingVertical: designSystem.spacing.sm },
  paddingVerticalMd: { paddingVertical: designSystem.spacing.md },
  paddingVerticalLg: { paddingVertical: designSystem.spacing.lg },
  paddingVerticalXl: { paddingVertical: designSystem.spacing.xl },

  // Accessibility helpers
  accessibleTouchTarget: {
    minWidth: 44,
    minHeight: 44,
  },

  // Visual feedback
  pressable: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },

  // Progress indicators
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  // Grid layouts
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designSystem.spacing.sm,
  },

  // Overlay styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownOverlay: {
    position: "absolute",
    zIndex: 1000,
    borderRadius: designSystem.borderRadius.md,
    borderWidth: 1,
    ...designSystem.shadows.large,
  },
});

/**
 * Utility function to create consistent color styles
 */
export const createColorStyles = (colors: any) => ({
  background: { backgroundColor: colors.background },
  card: { backgroundColor: colors.card },
  text: { color: colors.text },
  textSecondary: { color: colors.textSecondary },
  border: { borderColor: colors.border },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: colors.primary },
  success: { backgroundColor: colors.success },
  successText: { color: colors.success },
  warning: { backgroundColor: colors.warning },
  warningText: { color: colors.warning },
  error: { backgroundColor: colors.error },
  errorText: { color: colors.error },
});

/**
 * Animation presets for consistent motion
 */
export const animations = {
  slideInFromRight: {
    transform: [{ translateX: 300 }],
  },
  slideInFromLeft: {
    transform: [{ translateX: -300 }],
  },
  fadeIn: {
    opacity: 0,
  },
  scaleIn: {
    transform: [{ scale: 0.8 }],
    opacity: 0,
  },
};
