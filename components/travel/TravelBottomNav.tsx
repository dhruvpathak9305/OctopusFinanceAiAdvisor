import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

const TravelBottomNav: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="person" size={24} color="#10b981" />
        <Text style={[styles.navText, styles.activeNavText]}>You</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="compass-outline" size={24} color="#9CA3AF" />
        <Text style={styles.navText}>Discover</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="card-outline" size={24} color="#9CA3AF" />
        <Text style={styles.navText}>eSIM</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="gift-outline" size={24} color="#9CA3AF" />
        <Text style={styles.navText}>Rewards</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    bottomNav: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      backgroundColor: theme.tabBar,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: theme.tabBarBorder,
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 18,
      zIndex: 15,
    },
    navButton: {
      alignItems: "center",
    },
    navText: {
      color: "#9CA3AF",
      fontSize: 12,
      marginTop: 4,
    },
    activeNavText: {
      color: "#10b981",
      fontWeight: "600",
    },
    addButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: -26,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
    },
  });

export default TravelBottomNav;
