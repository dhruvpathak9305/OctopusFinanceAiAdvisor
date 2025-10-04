import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

export interface TripData {
  id: string;
  title: string;
  location: string;
  dates: string;
  image: string;
  nights: number;
  places: number;
  isCompleted?: boolean;
  badges?: {
    icon: string;
    count: number;
  }[];
}

interface TripCardProps {
  trip: TripData;
  onPress?: (trip: TripData) => void;
  onInvitePress?: (trip: TripData) => void;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  onPress,
  onInvitePress,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme, isDark);

  const handlePress = () => {
    if (onPress) {
      onPress(trip);
    }
  };

  const handleInvitePress = () => {
    if (onInvitePress) {
      onInvitePress(trip);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: trip.image }} style={styles.image} />

      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Top Badges */}
        <View style={styles.badgesContainer}>
          {trip.badges?.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Ionicons name={badge.icon as any} size={14} color="#fff" />
              <Text style={styles.badgeText}>{badge.count}</Text>
            </View>
          ))}
        </View>

        {/* Invite Button */}
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInvitePress}
        >
          <Ionicons name="person-add" size={14} color="#fff" />
          <Text style={styles.inviteText}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.title}>{trip.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={styles.location}>{trip.location}</Text>
        </View>
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={styles.dates}>{trip.dates}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="cash-outline" size={20} color="#F59E0B" />
          </TouchableOpacity>
          {trip.isCompleted && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#10B981"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="camera-outline" size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: "hidden",
      marginHorizontal: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    image: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "space-between",
      padding: 16,
    },
    badgesContainer: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    badgeText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "500",
    },
    inviteButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: "flex-end",
      gap: 6,
    },
    inviteText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },
    infoSection: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      gap: 4,
    },
    location: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 4,
    },
    dates: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    actionButton: {
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
  });

export default TripCard;
