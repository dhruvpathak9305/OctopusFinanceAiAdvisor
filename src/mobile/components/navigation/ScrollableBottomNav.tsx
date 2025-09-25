import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";

interface NavItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  isFixed?: boolean; // For Settings which should stay fixed
}

interface ScrollableBottomNavProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  navigation: any;
}

const ScrollableBottomNav: React.FC<ScrollableBottomNavProps> = ({
  activeTab,
  onTabPress,
  navigation,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

  const screenWidth = Dimensions.get("window").width;

  // Navigation items
  const navItems: NavItem[] = [
    {
      id: "Home",
      title: "Home",
      icon: "home",
      color: colors.primary,
      onPress: () => onTabPress("Home"),
    },
    {
      id: "Dashboard",
      title: "Dashboard",
      icon: "analytics",
      color: colors.primary,
      onPress: () => onTabPress("Dashboard"),
    },
    {
      id: "Relationships",
      title: "Money Ties",
      icon: "cash-outline",
      color: colors.primary,
      onPress: () => onTabPress("Relationships"),
    },
    {
      id: "Portfolio",
      title: "Portfolio",
      icon: "trending-up",
      color: colors.primary,
      onPress: () => onTabPress("Portfolio"),
    },
    {
      id: "Goals",
      title: "Goals",
      icon: "flag",
      color: colors.primary,
      onPress: () => onTabPress("Goals"),
    },
    {
      id: "Travel",
      title: "Travel",
      icon: "airplane",
      color: "#8B5CF6",
      onPress: () => onTabPress("Travel"),
    },
    {
      id: "Date",
      title: "Date",
      icon: "calendar",
      color: "#F59E0B",
      onPress: () => navigation.navigate("MobileDateFilter"),
    },
    {
      id: "Analytics",
      title: "Analytics",
      icon: "bar-chart",
      color: "#06B6D4",
      onPress: () => navigation.navigate("MobileAnalytics"),
    },
    {
      id: "Reports",
      title: "Reports",
      icon: "document-text",
      color: "#EF4444",
      onPress: () => navigation.navigate("MobileReports"),
    },
  ];

  // Fixed Settings item
  const settingsItem: NavItem = {
    id: "Settings",
    title: "Settings",
    icon: "settings",
    color: colors.textSecondary,
    onPress: () => onTabPress("Settings"),
    isFixed: true,
  };

  // Initialize animated values
  useEffect(() => {
    [...navItems, settingsItem].forEach((item) => {
      if (!animatedValues.current[item.id]) {
        animatedValues.current[item.id] = new Animated.Value(
          activeTab === item.id ? 1 : 0
        );
      }
    });
  }, []);

  // Animate tab changes
  useEffect(() => {
    [...navItems, settingsItem].forEach((item) => {
      const animatedValue = animatedValues.current[item.id];
      if (animatedValue) {
        Animated.spring(animatedValue, {
          toValue: activeTab === item.id ? 1 : 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
    });
  }, [activeTab]);

  const renderNavItem = (item: NavItem, index?: number) => {
    const animatedValue = animatedValues.current[item.id];
    const isActive = activeTab === item.id;

    const animatedScale = animatedValue?.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    const animatedColor = animatedValue?.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textSecondary, item.color],
    });

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.navItem,
          item.isFixed && styles.fixedNavItem,
          index === navItems.length - 1 && { marginRight: 20 }, // Add margin to last scrollable item
        ]}
        onPress={() => {
          item.onPress();
          // Add haptic feedback
          // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: animatedScale || 1 }],
              backgroundColor: isActive ? `${item.color}20` : "transparent",
            },
          ]}
        >
          <Animated.Text
            style={{ color: animatedColor || colors.textSecondary }}
          >
            <Ionicons name={item.icon as any} size={22} />
          </Animated.Text>
        </Animated.View>
        <Text
          style={[
            styles.navLabel,
            {
              color: isActive ? item.color : colors.textSecondary,
              fontWeight: isActive ? "600" : "500",
            },
          ]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder },
      ]}
    >
      <View style={styles.navContent}>
        {/* Scrollable navigation items */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollableNav}
        >
          {navItems.map((item, index) => renderNavItem(item, index))}
        </ScrollView>

        {/* Fixed Settings item */}
        <View style={styles.fixedContainer}>{renderNavItem(settingsItem)}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: 25,
    paddingTop: 10,
    height: 90,
  },
  navContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  scrollableNav: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: "center",
    minWidth: "100%",
  },
  fixedContainer: {
    paddingRight: 20,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.1)",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
    minWidth: 60,
  },
  fixedNavItem: {
    minWidth: 60,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default ScrollableBottomNav;
