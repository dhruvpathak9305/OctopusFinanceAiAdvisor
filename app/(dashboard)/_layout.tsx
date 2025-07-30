import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: Platform.select({
          web: {
            height: 60,
            paddingBottom: 10,
          },
          default: {
            height: 80,
            paddingBottom: 20,
          },
        }),
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarLabel: 'Dashboard',
          headerTitle: 'Financial Overview',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarLabel: 'Analytics',
          headerTitle: 'Market Analytics',
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'AI Insights',
          tabBarLabel: 'Insights',
          headerTitle: 'AI-Powered Insights',
        }}
      />
    </Tabs>
  );
} 