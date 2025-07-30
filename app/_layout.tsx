import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// import '../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Octopus Finance AI Advisor',
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="web" 
          options={{ 
            title: 'Web Platform',
            headerStyle: { backgroundColor: '#10b981' },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="mobile" 
          options={{ 
            title: 'Mobile Platform',
            headerStyle: { backgroundColor: '#f59e0b' },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="ios" 
          options={{ 
            title: 'iOS Platform',
            headerStyle: { backgroundColor: '#8b5cf6' },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="android" 
          options={{ 
            title: 'Android Platform',
            headerStyle: { backgroundColor: '#ef4444' },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </>
  );
} 