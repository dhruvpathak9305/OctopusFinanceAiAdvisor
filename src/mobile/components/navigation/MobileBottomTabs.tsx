import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

// Import your screens here
import HomeScreen from "../../screens/HomeScreen";
import TransactionsScreen from "../../screens/TransactionsScreen";
import BudgetScreen from "../../screens/BudgetScreen";
import ProfileScreen from "../../screens/ProfileScreen";
import FinancialRelationshipsScreen from "../../screens/FinancialRelationshipsScreen";

const Tab = createBottomTabNavigator();

const MobileBottomTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Transactions") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Budget") {
            iconName = focused ? "pie-chart" : "pie-chart-outline";
          } else if (route.name === "Relationships") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: colors.card,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen
        name="Relationships"
        component={FinancialRelationshipsScreen}
        options={{
          title: "Financial Relationships",
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MobileBottomTabs;
