import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TravelTabs, { TravelTabsProps } from "./TravelTabs";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

interface Props extends TravelTabsProps {}

const TravelStickyHeader: React.FC<Props> = ({ activeTab, onChange }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.leftRow}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.avatar as any}
          />
          <View>
            <Text style={styles.name}>DHRUV PATHAK</Text>
            <Text style={styles.handle}>@dhruvpathak9305</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <TravelTabs activeTab={activeTab} onChange={onChange} />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    leftRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: theme.card,
    },
    name: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    handle: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    iconBtn: { padding: 6 },
  });

export default TravelStickyHeader;
