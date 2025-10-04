import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TravelTabs, { TravelTabsProps } from "./TravelTabs";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

interface Props extends TravelTabsProps {
  showSearchBar?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchToggle?: () => void;
}

const TravelStickyHeader: React.FC<Props> = ({
  activeTab,
  onChange,
  tripsCount,
  placesCount,
  showSearchBar = false,
  searchQuery = "",
  onSearchChange,
  onSearchToggle,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  return (
    <View>
      <View style={styles.headerRow}>
        {!showSearchBar ? (
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
        ) : (
          <View style={styles.searchBarExpanded}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search trips, locations..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus={true}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange?.("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
        <TouchableOpacity style={styles.iconBtn} onPress={onSearchToggle}>
          <Ionicons
            name={showSearchBar ? "close" : "search"}
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TravelTabs
        activeTab={activeTab}
        onChange={onChange}
        tripsCount={tripsCount}
        placesCount={placesCount}
      />
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
    searchBarExpanded: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 10,
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      padding: 0,
    },
  });

export default TravelStickyHeader;
