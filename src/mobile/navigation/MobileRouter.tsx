import React, { createContext, useContext } from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import MobileHeader from "../components/navigation/MobileHeader";
import MobileRequireAuth from "../../../components/auth/MobileRequireAuth";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../contexts/ThemeContext";
import TransactionsErrorBoundary from "../pages/MobileTransactions/TransactionsErrorBoundary";

// Import mobile pages that exist and work
import MobileHome from "../pages/MobileHome";
import MobileDashboard from "../pages/MobileDashboard";
import MobileTransactions from "../pages/MobileTransactions";
import MobileBills from "../pages/MobileBills";
import MobilePortfolio from "../pages/MobilePortfolio";
import MobileStockBrowser from "../pages/MobileStockBrowser";
import MobileGoals from "../pages/MobileGoals";
import MobileSettings from "../pages/MobileSettings/index";
import MobileAuth from "../pages/MobileAuth";
import MobileNetWorth from "../pages/MobileNetWorth";
import MobileAccounts from "../pages/MobileAccounts";
import MobileCredit from "../pages/MobileCredit";
import MoneyPage from "../pages/Money";
import MobileTravel from "../pages/MobileTravel";
import MobileDateFilter from "../pages/MobileDateFilter";
import MobileAnalytics from "../pages/MobileAnalytics";
import MobileReports from "../pages/MobileReports";
import FinancialRelationshipsScreen from "../screens/FinancialRelationshipsScreen";
import ScrollableBottomNav from "../components/navigation/ScrollableBottomNav";
import { SyncQueueView } from "../../../components/sync/SyncQueueView";
import { PerformanceDashboard } from "../../../components/performance/PerformanceDashboard";

// Context for tab switching
type TabSwitchContextType = {
  switchToTab: (tab: string) => void;
};

const TabSwitchContext = createContext<TabSwitchContextType | null>(null);

export const useTabSwitch = () => {
  const context = useContext(TabSwitchContext);
  if (!context) {
    // Return a no-op function if context is not available
    console.warn("⚠️ TabSwitchContext not available - returning no-op function");
    return { 
      switchToTab: () => {
        console.warn("TabSwitchContext not available - switchToTab called but context is null");
      },
      isAvailable: false 
    };
  }
  return { ...context, isAvailable: true };
};

// Navigation Types
export type MobileTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Relationships: undefined;
  Portfolio: undefined;
  Goals: undefined;
  Settings: undefined;
  Travel: undefined;
};

export type MobileStackParamList = {
  Main: { initialTab?: string } | undefined;
  Auth: undefined;
  DashboardMain: undefined;
  Transactions: undefined;
  Bills: undefined;
  Money: { initialTab?: 'accounts' | 'credit' | 'net'; showAddAssetModal?: boolean } | undefined;
  MobileNetWorth: { showAddAssetModal?: boolean } | undefined;
  MobileAccounts: undefined;
  MobileCredit: undefined;
  MobileTravel: undefined;
  MobileDateFilter: undefined;
  MobileAnalytics: undefined;
  MobileReports: undefined;
  MobileStockBrowser: undefined;
  SyncQueue: undefined;
  PerformanceDashboard: undefined;
};

const Tab = createBottomTabNavigator<MobileTabParamList>();
const Stack = createStackNavigator<MobileStackParamList>();

// Wrapper components to avoid inline functions
const MobileDateFilterWrapper: React.FC = () => (
  <MobileRequireAuth>
    <MobileDateFilter />
  </MobileRequireAuth>
);

const MobileAnalyticsWrapper: React.FC = () => (
  <MobileRequireAuth>
    <MobileAnalytics />
  </MobileRequireAuth>
);

const MobileReportsWrapper: React.FC = () => (
  <MobileRequireAuth>
    <MobileReports />
  </MobileRequireAuth>
);

// Wrapper component that adds header to screens
const ScreenWithHeader: React.FC<{
  children: React.ReactNode;
  showSignIn?: boolean;
}> = ({ children, showSignIn = true }) => {
  return (
    <View style={{ flex: 1 }}>
      <MobileHeader showSignIn={showSignIn} />
      {children}
    </View>
  );
};

// Dashboard Stack Navigator
const DashboardStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardMain" component={MobileDashboard} />
      <Stack.Screen
        name="Transactions"
        component={() => (
          <TransactionsErrorBoundary>
            <MobileTransactions />
          </TransactionsErrorBoundary>
        )}
      />
      <Stack.Screen
        name="Bills"
        component={MobileBills}
      />
    </Stack.Navigator>
  );
};

// Custom Tab Navigator with Scrollable Bottom Nav
const MainTabNavigator: React.FC = () => {
  const navigation = useNavigation();
  // Get initial tab from navigation state, default to Home
  const routeState = navigation.getState();
  const currentRoute = routeState?.routes?.[routeState?.index || 0];
  const initialTab = (currentRoute?.params as any)?.initialTab || "Home";
  const [activeTab, setActiveTab] = React.useState(initialTab);
  
  // Log when activeTab changes for debugging
  React.useEffect(() => {
    console.log("📱 MainTabNavigator: activeTab changed to:", activeTab);
  }, [activeTab]);
  
  // Update activeTab when navigation state or params change
  React.useEffect(() => {
    const updateTabFromParams = () => {
      const state = navigation.getState();
      const route = state?.routes?.[state?.index || 0];
      if (route && (route.params as any)?.initialTab) {
        const newTab = (route.params as any).initialTab;
        console.log("📱 MainTabNavigator: Updating tab from params to:", newTab);
        setActiveTab(newTab);
      }
    };

    // Listen to state changes
    const unsubscribeState = navigation.addListener('state', updateTabFromParams);
    
    // Also listen to focus events which fire when params change
    const unsubscribeFocus = navigation.addListener('focus', updateTabFromParams);
    
    // Initial check
    updateTabFromParams();
    
    return () => {
      unsubscribeState();
      unsubscribeFocus();
    };
  }, [navigation]);

  const renderActiveScreen = () => {
    console.log("🖼️ renderActiveScreen called with activeTab:", activeTab);
    switch (activeTab) {
      case "Home":
        return (
          <ScreenWithHeader showSignIn={true}>
            <MobileHome />
          </ScreenWithHeader>
        );
      case "Dashboard":
        return (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <DashboardStack />
            </MobileRequireAuth>
          </ScreenWithHeader>
        );
      case "Relationships":
        return (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <FinancialRelationshipsScreen />
            </MobileRequireAuth>
          </ScreenWithHeader>
        );
      case "Portfolio":
        return (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <MobilePortfolio />
            </MobileRequireAuth>
          </ScreenWithHeader>
        );
      case "Goals":
        return (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <MobileGoals />
            </MobileRequireAuth>
          </ScreenWithHeader>
        );
      case "Settings":
        return (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <MobileSettings />
            </MobileRequireAuth>
          </ScreenWithHeader>
        );
      case "Travel":
        return (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <MobileTravel />
            </MobileRequireAuth>
          </ScreenWithHeader>
        );
      default:
        return (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <DashboardStack />
            </MobileRequireAuth>
          </ScreenWithHeader>
        );
    }
  };

  // Get root navigation for stack screens
  const rootNavigation = navigation.getParent() || navigation;

  // Provide tab switching context
  // Use functional update to ensure we always get the latest state
  const switchToTab = React.useCallback((tab: string) => {
    console.log("🔄 TabSwitchContext: Switching to tab:", tab);
    setActiveTab((currentTab: string) => {
      if (currentTab !== tab) {
        console.log("✅ TabSwitchContext: State updating from", currentTab, "to", tab);
        return tab;
      } else {
        console.log("ℹ️ TabSwitchContext: Already on tab", tab);
        return currentTab;
      }
    });
  }, []);

  return (
    <TabSwitchContext.Provider value={{ switchToTab }}>
    <View style={{ flex: 1 }}>
      {renderActiveScreen()}
      <ScrollableBottomNav
        activeTab={activeTab}
        onTabPress={setActiveTab}
          navigation={rootNavigation}
      />
    </View>
    </TabSwitchContext.Provider>
  );
};

// Root Stack Navigator
const RootStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="Auth"
        component={MobileAuth}
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "Account Access",
          headerStyle: {
            backgroundColor: "#0B1426",
          },
          headerTintColor: "#10B981",
          headerTitleStyle: {
            color: "#FFFFFF",
          },
        }}
      />
      <Stack.Screen
        name="Money"
        component={MoneyPage}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileNetWorth"
        component={MobileNetWorth}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileAccounts"
        component={MobileAccounts}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileCredit"
        component={MobileCredit}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileTravel"
        component={MobileTravel}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileDateFilter"
        component={MobileDateFilterWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileAnalytics"
        component={MobileAnalyticsWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileReports"
        component={MobileReportsWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MobileStockBrowser"
        component={MobileStockBrowser}
        options={{
          headerShown: true,
          headerTitle: "Browse Stocks & Funds",
          headerStyle: {
            backgroundColor: "#0B1426",
          },
          headerTintColor: "#10B981",
          headerTitleStyle: {
            color: "#FFFFFF",
          },
        }}
      />
      <Stack.Screen
        name="SyncQueue"
        component={SyncQueueView}
        options={{
          headerShown: true,
          headerTitle: "Sync Queue",
          headerStyle: {
            backgroundColor: "#0B1426",
          },
          headerTintColor: "#10B981",
          headerTitleStyle: {
            color: "#FFFFFF",
          },
        }}
      />
      <Stack.Screen
        name="PerformanceDashboard"
        component={PerformanceDashboard}
        options={{
          headerShown: true,
          headerTitle: "Performance Metrics",
          headerStyle: {
            backgroundColor: "#0B1426",
          },
          headerTintColor: "#10B981",
          headerTitleStyle: {
            color: "#FFFFFF",
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Mobile Router - Expo Router already provides NavigationContainer
const MobileRouter: React.FC = () => {
  return <RootStackNavigator />;
};

export default MobileRouter;
