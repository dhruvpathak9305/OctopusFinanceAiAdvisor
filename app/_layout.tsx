import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We'll handle headers in our own layouts
        gestureEnabled: Platform.OS === 'ios',
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(dashboard)" />
      <Stack.Screen name="web" />
      <Stack.Screen name="mobile" />
      <Stack.Screen name="ios" />
      <Stack.Screen name="android" />
    </Stack>
  );
} 