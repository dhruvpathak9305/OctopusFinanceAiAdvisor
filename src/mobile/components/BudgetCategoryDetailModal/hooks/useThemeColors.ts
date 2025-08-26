import { useTheme } from "../../../../../contexts/ThemeContext";

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
  shadow: string;
  overlay: string;
}

/**
 * Theme colors matching Quick Actions design system exactly
 */
export const useThemeColors = (): ThemeColors => {
  const { isDark } = useTheme();

  return isDark
    ? {
        // Quick Actions theme colors - Dark Mode
        background: "#0B1426", // Deep navy background (matches MobileDashboard)
        card: "#1F2937", // Dark gray cards (matches FinancialSummaryCard)
        text: "#FFFFFF", // Pure white text
        textSecondary: "#9CA3AF", // Softer gray for subtitles
        border: "#374151", // Card borders (matches FinancialSummaryCard)
        primary: "#10B981", // Vibrant green (matches Quick Actions)
        success: "#10B981", // Same vibrant green for success
        warning: "#F59E0B", // Amber warning
        error: "#EF4444", // Red error
        shadow: "#000000", // Black shadows
        overlay: "rgba(0, 0, 0, 0.6)",
      }
    : {
        // Light mode (unchanged for now, keeping existing)
        background: "#FFFFFF",
        card: "#F9FAFB",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        primary: "#10B981",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        shadow: "#000000",
        overlay: "rgba(0, 0, 0, 0.3)",
      };
};
