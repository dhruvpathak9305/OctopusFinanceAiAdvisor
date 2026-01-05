import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useNavigationState,
  CommonActions,
} from "@react-navigation/native";
import { useTabSwitch } from "../../navigation/MobileRouter";
import { useUnifiedAuth } from "../../../../contexts/UnifiedAuthContext";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { Logo } from "../../../../components/common/Logo";
import networkMonitor, { NetworkStatus } from "../../../../services/sync/networkMonitor";
import { supabase } from "../../../../lib/supabase/client";
import { format, startOfDay, addDays } from "date-fns";
import { getTableMap } from "../../../../utils/tableMapping";
import { useDemoMode } from "../../../../contexts/DemoModeContext";

interface MobileHeaderProps {
  title?: string;
  showSignIn?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "Octopus Organizer",
  showSignIn = true,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isAuthenticated, signOut } = useUnifiedAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isDemo } = useDemoMode();
  const theme = isDark ? darkTheme : lightTheme;
  
  // Network status state
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
  const [forceOffline, setForceOffline] = useState(false);
  
  // Notifications state
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationBills, setNotificationBills] = useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  // Calculate bills due today or tomorrow for notifications
  useEffect(() => {
    const calculateBillNotifications = async () => {
      if (!isAuthenticated) {
        setNotificationCount(0);
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNotificationCount(0);
          return;
        }

        // Calculate date range for today and tomorrow
        const today = startOfDay(new Date());
        const tomorrow = addDays(today, 1);

        // Format dates for SQL query (YYYY-MM-DD)
        const todayStr = format(today, 'yyyy-MM-dd');
        const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

        // Get table mapping based on demo mode
        // This ensures we query the same table that the UI is using
        const tableMap = getTableMap(isDemo);
        const billsTable = tableMap.upcoming_bills;
        
        console.log('🔔 Notification query:', { billsTable, userId: user.id, isDemo, todayStr, tomorrowStr });

        // Query bills due today or tomorrow (including overdue bills)
        // We query bills with due_date <= tomorrow (to include overdue and today/tomorrow bills)
        const { data: bills, error } = await (supabase as any)
          .from(billsTable)
          .select('id, due_date, status, name, amount, description')
          .eq('user_id', user.id)
          .lte('due_date', tomorrowStr) // Include overdue, today, and tomorrow
          .limit(100);

        if (error) {
          console.error('Error fetching bills for notifications:', error);
          setNotificationCount(0);
          return;
        }

        // Filter bills to only include those due today or tomorrow
        // and exclude inactive statuses
        const activeBillsDue = (bills || []).filter(
          (bill: any) => {
            // Filter out paused, paid, cancelled, or ended bills
            const inactiveStatuses = ['paused', 'paid', 'cancelled', 'ended'];
            if (inactiveStatuses.includes(bill.status)) {
              return false;
            }

            // Check if bill is due today or tomorrow
            const billDueDate = new Date(bill.due_date);
            const billDueDateStr = format(startOfDay(billDueDate), 'yyyy-MM-dd');
            
            // Include bills due today or tomorrow
            return billDueDateStr === todayStr || billDueDateStr === tomorrowStr;
          }
        );

        // Debug logging
        console.log('📊 Notification calculation:', {
          totalBills: bills?.length || 0,
          activeBillsDue: activeBillsDue.length,
          todayStr,
          tomorrowStr,
          billsDue: activeBillsDue.map((b: any) => ({ id: b.id, due_date: b.due_date, status: b.status })),
          allBills: bills?.map((b: any) => ({ id: b.id, due_date: b.due_date, status: b.status })) || []
        });

        // Set notification count and bills - ensure it's a number
        const count = activeBillsDue.length || 0;
        console.log('🔔 Setting notification count to:', count);
        setNotificationCount(count);
        setNotificationBills(activeBillsDue);
      } catch (error) {
        console.error('Error calculating bill notifications:', error);
        // Don't show error to user, just set count to 0
        setNotificationCount(0);
      }
    };

    // Calculate immediately
    calculateBillNotifications();

    // Refresh every minute to update notification count
    const interval = setInterval(calculateBillNotifications, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isDemo]);

  // Get navigation state to determine if we can go back
  const navigationState = useNavigationState((state) => state);
  const canGoBack = navigation.canGoBack() && navigationState.index > 0;

  // Monitor network status
  useEffect(() => {
    // Get initial status
    networkMonitor.getStatus().then((status) => {
      setNetworkStatus(status);
    });

    // Listen for status changes
    const unsubscribe = networkMonitor.addListener((status) => {
      setNetworkStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Determine display status (force offline takes precedence)
  const displayStatus = forceOffline ? 'offline' : networkStatus;

  // Get page title and icon based on current route
  const getPageInfo = () => {
    switch (route.name) {
      case "Dashboard":
        return { title: "Financial Dashboard", icon: "📊" };
      case "Portfolio":
        return { title: "My Portfolio", icon: "📈" };
      case "Goals":
        return { title: "Financial Goals", icon: "🎯" };
      case "Transactions":
        return { title: "Recent Transactions", icon: "💳" };
      case "Settings":
        return { title: "App Settings", icon: "⚙️" };
      case "Home":
        return { title: "Octopus Organizer", icon: "🏠" };
      default:
        return { title: "Octopus Organizer", icon: "📈" };
    }
  };

  const pageInfo = getPageInfo();
  const currentTitle = title || pageInfo.title;

  const handleSignIn = () => {
    // Navigate to Auth screen or show auth modal
    navigation.navigate("Auth" as never);
  };

  const handleSignUp = () => {
    // Navigate to Auth screen with signup mode
    navigation.navigate("Auth" as never);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Await signOut to ensure it completes
            // Navigation will be handled automatically by auth state listener
            await signOut();
          } catch (error) {
            // Error is already handled by UnifiedAuthContext
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  const handleBackPress = () => {
    if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleLogoPress = () => {
    // Logo press handler - can be used for future features
    // Navigation is handled by the bottom tab navigator
    // No action needed for now
  };

  const handleNetworkToggle = () => {
    // Toggle force offline mode
    const newForceOffline = !forceOffline;
    setForceOffline(newForceOffline);
    
    // Show alert to inform user
    Alert.alert(
      newForceOffline ? "Offline Mode Enabled" : "Online Mode Enabled",
      newForceOffline 
        ? "App will work in offline mode. Data will be synced when you go back online."
        : "App will sync with server when network is available.",
      [{ text: "OK" }]
    );
  };

  const tabSwitchContext = useTabSwitch();

  const handleNotificationsPress = () => {
    console.log("🔔 Notification icon clicked, count:", notificationCount);
    
    // Open notifications modal
    if (notificationCount > 0) {
      setShowNotificationsModal(true);
    } else {
      Alert.alert("Notifications", "No bills due today or tomorrow", [{ text: "OK" }]);
    }
  };

  const handleCloseNotificationsModal = () => {
    setShowNotificationsModal(false);
  };

  const handleViewBill = (bill: any) => {
    // Close modal and navigate to Dashboard
    setShowNotificationsModal(false);
    // Switch to Dashboard tab
    if ((tabSwitchContext as any).isAvailable) {
      tabSwitchContext.switchToTab("Dashboard");
    }
  };

  const getNetworkIcon = () => {
    if (displayStatus === 'online') {
      return 'wifi';
    } else if (displayStatus === 'offline') {
      return 'cloud-offline';
    } else {
      return 'help-circle';
    }
  };

  const getNetworkColor = () => {
    if (displayStatus === 'online') {
      return '#10b981'; // green
    } else if (displayStatus === 'offline') {
      return '#ef4444'; // red
    } else {
      return '#6b7280'; // gray
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.background,
              borderBottomWidth: 0, // Remove bottom border to reduce visual separation
            },
          ]}
        >
          {/* Left side - Back Button + Logo and Title */}
          <View style={styles.leftSection}>
            {canGoBack && (
              <TouchableOpacity
                style={[
                  styles.backButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={handleBackPress}
              >
                <Text style={[styles.backArrow, { color: theme.primary }]}>
                  ←
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.logoSection}
              onPress={handleLogoPress}
            >
              <Logo size={28} animated={true} />
              <Text
                style={[styles.title, { color: theme.primary }]}
                numberOfLines={1}
              >
                {currentTitle}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right side - Actions */}
          <View style={styles.rightSection}>
            {/* Network Toggle */}
            <TouchableOpacity
              style={[
                styles.themeToggle,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={handleNetworkToggle}
            >
              <Ionicons 
                name={getNetworkIcon()} 
                size={14} 
                color={getNetworkColor()} 
              />
            </TouchableOpacity>

            {/* Notifications Icon */}
            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={handleNotificationsPress}
            >
              <Ionicons 
                name="notifications-outline" 
                size={16} 
                color={theme.textSecondary} 
              />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: '#EF4444', borderColor: theme.background }]}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 9 ? '9+' : String(notificationCount)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Theme Toggle */}
            <TouchableOpacity
              style={[
                styles.themeToggle,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={toggleTheme}
            >
              <Text style={styles.themeIcon}>{isDark ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>

            {isAuthenticated ? (
              <TouchableOpacity
                style={[
                  styles.signOutButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={handleSignOut}
              >
                <Ionicons 
                  name="log-out-outline" 
                  size={16} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            ) : (
              showSignIn && (
                <View style={styles.authButtons}>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleSignIn}
                  >
                    <Text
                      style={[styles.loginText, { color: theme.textSecondary }]}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={handleSignUp}
                  >
                    <Text style={[styles.signupText, { color: theme.text }]}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseNotificationsModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseNotificationsModal}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Bills Due Soon
              </Text>
              <TouchableOpacity
                onPress={handleCloseNotificationsModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {notificationBills.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color={theme.textSecondary} />
                  <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                    No bills due today or tomorrow
                  </Text>
                </View>
              ) : (
                notificationBills.map((bill) => {
                  const billDate = new Date(bill.due_date);
                  const isToday = format(startOfDay(billDate), 'yyyy-MM-dd') === format(startOfDay(new Date()), 'yyyy-MM-dd');
                  const isTomorrow = format(startOfDay(billDate), 'yyyy-MM-dd') === format(startOfDay(addDays(new Date(), 1)), 'yyyy-MM-dd');
                  
                  return (
                    <TouchableOpacity
                      key={bill.id}
                      style={[styles.billItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleViewBill(bill)}
                    >
                      <View style={styles.billItemContent}>
                        <View style={styles.billItemHeader}>
                          <Text style={[styles.billName, { color: theme.text }]} numberOfLines={1}>
                            {bill.name || bill.description || 'Unnamed Bill'}
                          </Text>
                          {bill.amount && (
                            <Text style={[styles.billAmount, { color: theme.text }]}>
                              ${parseFloat(bill.amount || '0').toFixed(2)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.billItemFooter}>
                          <View style={[
                            styles.billDateBadge,
                            { backgroundColor: isToday ? '#EF444415' : '#10B98115' }
                          ]}>
                            <Ionicons
                              name={isToday ? "time" : "calendar-outline"}
                              size={12}
                              color={isToday ? "#EF4444" : "#10B981"}
                            />
                            <Text style={[
                              styles.billDateText,
                              { color: isToday ? "#EF4444" : "#10B981" }
                            ]}>
                              {isToday ? 'Due Today' : isTomorrow ? 'Due Tomorrow' : format(billDate, 'MMM dd, yyyy')}
                            </Text>
                          </View>
                          {bill.status && (
                            <View style={[
                              styles.billStatusBadge,
                              { backgroundColor: theme.border }
                            ]}>
                              <Text style={[styles.billStatusText, { color: theme.textSecondary }]}>
                                {bill.status}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {notificationBills.length > 0 && (
              <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.viewAllButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    handleCloseNotificationsModal();
                    if ((tabSwitchContext as any).isAvailable) {
                      tabSwitchContext.switchToTab("Dashboard");
                    }
                  }}
                >
                  <Text style={styles.viewAllButtonText}>View All Bills</Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // backgroundColor will be set dynamically
  },
  header: {
    // backgroundColor and borderBottomColor will be set dynamically
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6, // Further reduced vertical padding
    borderBottomWidth: 0, // Removed border to eliminate visual separation
    elevation: 0, // Removed elevation shadow
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  backArrow: {
    fontSize: 18,
    // color will be set dynamically
    fontWeight: "600",
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    // color will be set dynamically
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 12,
  },
  notificationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  signOutButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  authButtons: {
    flexDirection: "row",
    gap: 6,
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  loginText: {
    fontSize: 12,
    // color will be set dynamically
    fontWeight: "600",
  },
  signupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#10B981", // Keep primary color consistent
  },
  signupText: {
    fontSize: 12,
    // color will be set dynamically
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  billItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  billItemContent: {
    flex: 1,
    marginRight: 12,
  },
  billItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  billItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  billDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  billDateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  billStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  billStatusText: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  viewAllButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  viewAllButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default MobileHeader;
