import React from "react";
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
import MobilePortfolio from "../pages/MobilePortfolio";
import MobileGoals from "../pages/MobileGoals";
import MobileSettings from "../pages/MobileSettings/index";
import MobileAuth from "../pages/MobileAuth";
import MobileNetWorth from "../pages/MobileNetWorth";
import MobileAccounts from "../pages/MobileAccounts";
import MobileCredit from "../pages/MobileCredit";
import MobileTravel from "../pages/MobileTravel";
import MobileDateFilter from "../pages/MobileDateFilter";
import ScrollableBottomNav from "../components/navigation/ScrollableBottomNav";

// Navigation Types
export type MobileTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Portfolio: undefined;
  Goals: undefined;
  Settings: undefined;
  Travel: undefined;
};

export type MobileStackParamList = {
  Main: undefined;
  Auth: undefined;
  DashboardMain: undefined;
  Transactions: undefined;
  MobileNetWorth: { showAddAssetModal?: boolean } | undefined;
  MobileAccounts: undefined;
  MobileCredit: undefined;
  MobileTravel: undefined;
  MobileDateFilter: undefined;
};

const Tab = createBottomTabNavigator<MobileTabParamList>();
const Stack = createStackNavigator<MobileStackParamList>();

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
    </Stack.Navigator>
  );
};

// Custom Tab Navigator with Scrollable Bottom Nav
const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("Dashboard");
  const navigation = useNavigation();

  const renderActiveScreen = () => {
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

  return (
    <View style={{ flex: 1 }}>
      {renderActiveScreen()}
      <ScrollableBottomNav
        activeTab={activeTab}
        onTabPress={setActiveTab}
        navigation={navigation}
      />
    </View>
  );
};

// Root Stack Navigator
const MobileRouter: React.FC = () => {
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
        component={MobileDateFilter}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MobileRouter;
