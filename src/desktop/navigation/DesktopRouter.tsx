import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import desktop pages
import DesktopHome from '../pages/DesktopHome';
import DesktopDashboard from '../pages/DesktopDashboard';
import DesktopTransactions from '../pages/DesktopTransactions';
import DesktopPortfolio from '../pages/DesktopPortfolio';
import DesktopGoals from '../pages/DesktopGoals';
import DesktopTravel from '../pages/DesktopTravel';
import DesktopSettings from '../pages/DesktopSettings';
import DesktopAuth from '../pages/DesktopAuth';
import DesktopMoney from '../pages/DesktopMoney';
import DesktopReports from '../pages/DesktopReports';

// Navigation Types
export type DesktopStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Transactions: undefined;
  Portfolio: undefined;
  Goals: undefined;
  Travel: undefined;
  Money: undefined;
  Reports: undefined;
  Settings: undefined;
  Auth: undefined;
};

const Stack = createStackNavigator<DesktopStackParamList>();

const DesktopRouter: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#0B1426' }
        }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Home" component={DesktopHome} />
        <Stack.Screen name="Dashboard" component={DesktopDashboard} />
        <Stack.Screen name="Transactions" component={DesktopTransactions} />
        <Stack.Screen name="Portfolio" component={DesktopPortfolio} />
        <Stack.Screen name="Goals" component={DesktopGoals} />
        <Stack.Screen name="Travel" component={DesktopTravel} />
        <Stack.Screen name="Money" component={DesktopMoney} />
        <Stack.Screen name="Reports" component={DesktopReports} />
        <Stack.Screen name="Settings" component={DesktopSettings} />
        <Stack.Screen name="Auth" component={DesktopAuth} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default DesktopRouter; 