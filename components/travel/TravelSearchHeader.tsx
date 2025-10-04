import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

interface TravelSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tripsCount: number;
}

const TravelSearchHeader: React.FC<TravelSearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  tripsCount,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips, locations..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {searchQuery.trim() !== "" && (
        <Text style={styles.resultCount}>
          {tripsCount} result{tripsCount !== 1 ? "s" : ""} found
        </Text>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      padding: 0,
    },
    resultCount: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 8,
      fontWeight: "600",
    },
  });

export default TravelSearchHeader;
