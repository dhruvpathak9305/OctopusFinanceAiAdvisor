import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

const actions = [
  {
    key: "you",
    icon: "person",
    label: "You",
    subtitle: "Profile and preferences",
    color: "#10B981",
  },
  {
    key: "discover",
    icon: "compass-outline",
    label: "Discover",
    subtitle: "Explore destinations",
    color: "#8B5CF6",
  },
  {
    key: "esim",
    icon: "card-outline",
    label: "eSIM",
    subtitle: "Manage your eSIM",
    color: "#60A5FA",
  },
  {
    key: "rewards",
    icon: "gift-outline",
    label: "Rewards",
    subtitle: "Perks and benefits",
    color: "#F59E0B",
  },
  {
    key: "add",
    icon: "add",
    label: "Add",
    subtitle: "Create or invite",
    color: "#EF4444",
  },
];

const TravelFab: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Quick Actions</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setOpen(false)}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.grid}>
                {actions.map((a) => (
                  <TouchableOpacity
                    key={a.key}
                    style={styles.card}
                    onPress={() => setOpen(false)}
                  >
                    <View
                      style={[
                        styles.cardIconWrap,
                        { backgroundColor: a.color + "22" },
                      ]}
                    >
                      <Ionicons
                        name={a.icon as any}
                        size={28}
                        color={a.color}
                      />
                    </View>
                    <Text style={styles.cardLabel}>{a.label}</Text>
                    <Text style={styles.cardSubtitle}>{a.subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      right: 20,
      bottom: 28,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
      maxHeight: "70%",
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sheetTitle: { fontSize: 18, fontWeight: "700", color: theme.text },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: "48%",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    cardIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    cardLabel: {
      color: theme.text,
      fontWeight: "700",
      marginTop: 6,
      fontSize: 16,
    },
    cardSubtitle: { color: theme.textSecondary, marginTop: 4, fontSize: 12 },
  });

export default TravelFab;
