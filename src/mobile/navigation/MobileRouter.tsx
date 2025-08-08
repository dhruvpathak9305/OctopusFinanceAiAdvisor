import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import MobileHeader from '../components/navigation/MobileHeader';
import MobileRequireAuth from '../../../components/auth/MobileRequireAuth';
import { useTheme, darkTheme, lightTheme } from '../../../contexts/ThemeContext';
import TransactionsErrorBoundary from '../pages/MobileTransactions/TransactionsErrorBoundary';

// Import mobile pages that exist and work
import MobileHome from '../pages/MobileHome';
import MobileDashboard from '../pages/MobileDashboard';
import MobileTransactions from '../pages/MobileTransactions';
import MobilePortfolio from '../pages/MobilePortfolio';
import MobileGoals from '../pages/MobileGoals';
import MobileSettings from '../pages/MobileSettings';
import MobileAuth from '../pages/MobileAuth';

// Navigation Types
export type MobileTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Portfolio: undefined;
  Goals: undefined;
  Settings: undefined;
};

export type MobileStackParamList = {
  Main: undefined;
  Auth: undefined;
  DashboardMain: undefined;
  Transactions: undefined;
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
      <Stack.Screen 
        name="DashboardMain" 
        component={MobileDashboard}
      />
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

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Disable all React Navigation headers
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      >
        {() => (
          <ScreenWithHeader showSignIn={true}>
            <MobileHome />
          </ScreenWithHeader>
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Dashboard" 
        options={{
          title: 'Dashboard',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      >
        {() => (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <DashboardStack />
            </MobileRequireAuth>
          </ScreenWithHeader>
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Portfolio" 
        options={{
          title: 'Portfolio',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📈</Text>,
        }}
      >
        {() => (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <MobilePortfolio />
            </MobileRequireAuth>
          </ScreenWithHeader>
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Goals" 
        options={{
          title: 'Goals',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎯</Text>,
        }}
      >
        {() => (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <MobileGoals />
            </MobileRequireAuth>
          </ScreenWithHeader>
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Settings" 
        options={{
          title: 'Settings',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      >
        {() => (
          <ScreenWithHeader>
            <MobileRequireAuth>
              <MobileSettings />
            </MobileRequireAuth>
          </ScreenWithHeader>
        )}
      </Tab.Screen>
    </Tab.Navigator>
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
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator}
      />
      <Stack.Screen 
        name="Auth" 
        component={MobileAuth}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Account Access',
          headerStyle: {
            backgroundColor: '#0B1426',
          },
          headerTintColor: '#10B981',
          headerTitleStyle: {
            color: '#FFFFFF',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default MobileRouter; 