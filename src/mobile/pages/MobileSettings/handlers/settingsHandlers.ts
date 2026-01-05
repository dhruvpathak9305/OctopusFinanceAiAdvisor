import { Alert, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Theme } from "../../../../contexts/ThemeContext";
import { SettingsHandlers } from "../types";
import { MobileStackParamList } from "../../../navigation/MobileRouter";

interface CreateSettingsHandlersParams {
  signOut: () => void;
  setTheme: (theme: Theme) => void;
  supportEmail: string;
  navigation?: StackNavigationProp<MobileStackParamList>;
}

/**
 * Factory function to create settings handlers
 */
export const createSettingsHandlers = ({
  signOut,
  setTheme,
  supportEmail,
  navigation,
}: CreateSettingsHandlersParams): SettingsHandlers => {
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Await signOut to ensure it completes
            // Navigation will be handled automatically by auth state listener
            await signOut();
          } catch (error) {
            // Error is already handled by UnifiedAuthContext
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  const handleThemeChange = () => {
    Alert.alert("Theme Settings", "Choose your preferred theme", [
      { text: "Light", onPress: () => setTheme("light") },
      { text: "Dark", onPress: () => setTheme("dark") },
      { text: "System", onPress: () => setTheme("system") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleBackup = () => {
    Alert.alert("Backup Options", "Choose backup action", [
      {
        text: "Export Data",
        onPress: () =>
          Alert.alert("Export", "Export functionality coming soon"),
      },
      {
        text: "Import Data",
        onPress: () =>
          Alert.alert("Import", "Import functionality coming soon"),
      },
      {
        text: "Complete Reset",
        style: "destructive",
        onPress: () => Alert.alert("Reset", "Reset functionality coming soon"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleFeedback = () => {
    Alert.alert("Feedback", "How would you like to provide feedback?", [
      {
        text: "Email",
        onPress: () => Linking.openURL(`mailto:${supportEmail}`),
      },
      {
        text: "Rate App",
        onPress: () => Alert.alert("Rate", "App store rating coming soon"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleHelp = () => {
    Alert.alert("Help", "Help documentation coming soon");
  };

  const handlePCManager = () => {
    Alert.alert("PC Manager", "PC Manager functionality coming soon");
  };

  const handleCalcBox = () => {
    Alert.alert(
      "Financial Calculator",
      "Access loan calculators, investment projections, and budget planning tools."
    );
  };

  const handleDemoMode = () => {
    Alert.alert("Demo Mode", "Switch between real and demo data", [
      {
        text: "Use Real Data",
        onPress: () =>
          Alert.alert("Real Data", "Switched to real financial data"),
      },
      {
        text: "Use Demo Data",
        onPress: () =>
          Alert.alert("Demo Data", "Switched to demo data for testing"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDataExport = () => {
    Alert.alert("Export Data", "Choose export format", [
      {
        text: "Export as CSV",
        onPress: () => Alert.alert("CSV Export", "Exporting data as CSV..."),
      },
      {
        text: "Export as JSON",
        onPress: () => Alert.alert("JSON Export", "Exporting data as JSON..."),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDashboardSettings = () => {
    Alert.alert("Dashboard Settings", "Choose what to customize", [
      {
        text: "Card Layout",
        onPress: () =>
          Alert.alert(
            "Card Layout",
            "Configure which financial cards to display and their order."
          ),
      },
      {
        text: "Default View",
        onPress: () =>
          Alert.alert(
            "Default View",
            "Set default dashboard view: Compact or Expanded."
          ),
      },
      {
        text: "Refresh Settings",
        onPress: () =>
          Alert.alert(
            "Refresh",
            "Configure auto-refresh intervals for real-time data."
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleAnalyticsSettings = () => {
    Alert.alert("Analytics Settings", "Choose analytics preferences", [
      {
        text: "Chart Types",
        onPress: () =>
          Alert.alert(
            "Chart Types",
            "Set preferred chart types: Line, Bar, Pie, or Area charts."
          ),
      },
      {
        text: "Time Periods",
        onPress: () =>
          Alert.alert(
            "Time Periods",
            "Configure default time periods: Weekly, Monthly, Quarterly, Yearly."
          ),
      },
      {
        text: "Data Points",
        onPress: () =>
          Alert.alert(
            "Data Points",
            "Choose which metrics to display in analytics."
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleGoalsSettings = () => {
    Alert.alert("Goals Settings", "Configure goal tracking", [
      {
        text: "Progress Notifications",
        onPress: () =>
          Alert.alert(
            "Notifications",
            "Set up progress milestone notifications and reminders."
          ),
      },
      {
        text: "Goal Categories",
        onPress: () =>
          Alert.alert(
            "Categories",
            "Customize goal categories: Savings, Debt, Investment, etc."
          ),
      },
      {
        text: "Visualization",
        onPress: () =>
          Alert.alert(
            "Visualization",
            "Choose how to display goal progress: Charts, Progress bars, etc."
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSyncQueue = () => {
    if (navigation) {
      navigation.navigate("SyncQueue" as never);
    } else {
      Alert.alert("Navigation Error", "Navigation not available");
    }
  };

  const handlePerformanceMetrics = () => {
    if (navigation) {
      navigation.navigate("PerformanceDashboard" as never);
    } else {
      Alert.alert("Navigation Error", "Navigation not available");
    }
  };

  return {
    handleSignOut,
    handleThemeChange,
    handleBackup,
    handleFeedback,
    handleHelp,
    handlePCManager,
    handleCalcBox,
    handleDemoMode,
    handleDataExport,
    handleDashboardSettings,
    handleAnalyticsSettings,
    handleGoalsSettings,
    handleSyncQueue,
    handlePerformanceMetrics,
  };
};
