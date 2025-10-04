import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

export interface PlaceData {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  visited: boolean;
  visitDate?: string;
}

interface PlaceCardProps {
  place: PlaceData;
  onPress?: (place: PlaceData) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme, isDark);

  const handlePress = () => {
    if (onPress) {
      onPress(place);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: place.image }} style={styles.image} />

      {/* Status Badge */}
      {place.visited && (
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.textSecondary}
          />
          <Text style={styles.location} numberOfLines={1}>
            {place.location}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{place.rating}</Text>
          </View>

          {place.visited && place.visitDate && (
            <Text style={styles.visitDate}>Visited: {place.visitDate}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      overflow: "hidden",
      marginHorizontal: 10,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      width: 160,
    },
    image: {
      width: "100%",
      height: 120,
      resizeMode: "cover",
    },
    statusBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: 12,
      padding: 4,
    },
    content: {
      padding: 12,
    },
    name: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 4,
    },
    location: {
      fontSize: 12,
      color: theme.textSecondary,
      flex: 1,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    rating: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
    },
    visitDate: {
      fontSize: 10,
      color: "#10B981",
      fontWeight: "500",
    },
  });

export default PlaceCard;
