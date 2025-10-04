import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

type TabKey = "trips" | "places";

export interface TravelTabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  style?: any;
}

const TravelTabs: React.FC<TravelTabsProps> = ({
  activeTab,
  onChange,
  style,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  return (
    <View style={[styles.tabsContainer, style]}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onChange("trips")}
        activeOpacity={0.75}
      >
        <Ionicons
          name="map-outline"
          size={20}
          color={activeTab === "trips" ? theme.primary : theme.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "trips" && styles.activeTabText,
          ]}
        >
          Trips
        </Text>
        {activeTab === "trips" && <View style={[styles.indicator]} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onChange("places")}
        activeOpacity={0.75}
      >
        <Ionicons
          name="location-outline"
          size={20}
          color={activeTab === "places" ? theme.primary : theme.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "places" && styles.activeTabText,
          ]}
        >
          Places
        </Text>
        {activeTab === "places" && <View style={[styles.indicator]} />}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginBottom: 16,
      paddingHorizontal: 0,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      position: "relative",
    },
    tabText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    activeTabText: {
      color: theme.primary,
    },
    indicator: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: -1, // sits over the container bottom border
      height: 3,
      backgroundColor: theme.primary,
    },
  });

export default TravelTabs;
