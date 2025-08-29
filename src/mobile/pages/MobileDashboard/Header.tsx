import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";
import { ViewToggleButton } from "../../components/FinancialSummary";

interface HeaderProps {
  className?: string;
  isExpandedView?: boolean;
  onToggleView?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  className = "",
  isExpandedView = true,
  onToggleView,
}) => {
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
      }
    : {
        text: "#111827",
        textSecondary: "#6B7280",
      };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          Financial Dashboard
        </Text>
        {onToggleView && (
          <View style={styles.toggleButtonContainer}>
            <ViewToggleButton
              isExpanded={isExpandedView}
              onToggle={onToggleView}
            />
          </View>
        )}
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Track, analyze, and optimize your finances in one place
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  toggleButtonContainer: {
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.8,
  },
});

export default Header;
