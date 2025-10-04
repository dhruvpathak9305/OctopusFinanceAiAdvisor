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
  daysUntilDeparture?: number; // Show green pill like reference when provided
  badges?: {
    icon: string;
    count: number;
  }[];
}

interface TripCardProps {
  trip: TripData;
  onPress?: (trip: TripData) => void;
  onInvitePress?: (trip: TripData) => void;
  index?: number; // 1-based list index for badge
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  onPress,
  onInvitePress,
  index,
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
      {typeof index === "number" && (
        <View style={styles.indexBadgeOuter}>
          <Text style={styles.indexOuterText}>{index}</Text>
        </View>
      )}
      <Image source={{ uri: trip.image }} style={styles.image} />

      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Top row: index badge + countdown + badges */}
        <View style={styles.topRow}>
          {/* Top Badges / Countdown pill */}
          {typeof trip.daysUntilDeparture === "number" && (
            <View style={styles.countdownPill}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <Text style={styles.countdownText}>
                {trip.daysUntilDeparture} days until departure
              </Text>
            </View>
          )}
          {trip.badges?.map((badge, i) => (
            <View key={i} style={styles.badge}>
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

        {/* Action Buttons Bar */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionsBarItem}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.actionsDivider} />
          <TouchableOpacity style={styles.actionsBarItem}>
            <Ionicons name="cash-outline" size={20} color="#F59E0B" />
          </TouchableOpacity>
          <View style={styles.actionsDivider} />
          <TouchableOpacity style={styles.actionsBarItem}>
            <Ionicons
              name={
                trip.isCompleted
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={20}
              color={trip.isCompleted ? "#10B981" : theme.textSecondary}
            />
          </TouchableOpacity>
          <View style={styles.actionsDivider} />
          <TouchableOpacity style={styles.actionsBarItem}>
            <Ionicons name="camera-outline" size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <View style={styles.actionsDivider} />
          <TouchableOpacity style={styles.actionsBarItem}>
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
      borderRadius: 18,
      overflow: "visible",
      marginHorizontal: 0,
      marginBottom: 24,
      marginTop: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.08,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme.border,
    },
    indexBadgeOuter: {
      position: "absolute",
      top: -12,
      left: -12,
      zIndex: 30,
      backgroundColor: theme.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 3,
      borderColor: theme.background,
    },
    indexOuterText: { color: "#fff", fontWeight: "900", fontSize: 15 },
    image: {
      width: "100%",
      height: 220,
      resizeMode: "cover",
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 220,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      justifyContent: "space-between",
      padding: 16,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
    },
    topRow: { flexDirection: "row", gap: 8, alignItems: "center" },

    countdownPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#10B981",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
      gap: 6,
    },
    countdownText: { color: "#fff", fontWeight: "700", fontSize: 12 },
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
      backgroundColor: theme.card,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      overflow: "hidden",
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
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
    actionsBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    actionsBarItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    actionsDivider: {
      width: 1,
      height: 18,
      backgroundColor: theme.border,
    },
  });

export default TripCard;
