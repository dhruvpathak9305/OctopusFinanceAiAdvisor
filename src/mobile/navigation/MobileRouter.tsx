import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MobileHeader from '../components/navigation/MobileHeader';

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
  Transactions: undefined;
  Settings: undefined;
};

export type MobileStackParamList = {
  Main: undefined;
  Auth: undefined;
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

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Disable all React Navigation headers
        tabBarStyle: {
          backgroundColor: '#0B1426',
          borderTopColor: '#1F2937',
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
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
            <MobileDashboard />
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
            <MobilePortfolio />
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
            <MobileGoals />
          </ScreenWithHeader>
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Transactions" 
        options={{
          title: 'Transactions',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💳</Text>,
        }}
      >
        {() => (
          <ScreenWithHeader>
            <MobileTransactions />
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
            <MobileSettings />
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