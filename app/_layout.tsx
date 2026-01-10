import 'react-native-get-random-values'; // Must be imported before any uuid usage
import React from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { SecurityProvider } from "../contexts/SecurityContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
      <SecurityProvider>
        <StatusBar style="light" />
        <Stack
        screenOptions={{
          headerShown: true, // Allow headers to show
          headerStyle: {
            backgroundColor: "#0B1426",
          },
          headerTintColor: "#10B981",
          headerTitleStyle: {
            fontWeight: "700",
            color: "#FFFFFF",
          },
          gestureEnabled: Platform.OS === "ios",
          animation: Platform.OS === "ios" ? "default" : "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false, // Hide header for index as it has its own navigation
            title: "Home",
          }}
        />
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="web" />
        <Stack.Screen
          name="mobile"
          options={{
            headerShown: false, // Hide header for mobile as it has its own navigation
            title: "Mobile App",
          }}
        />
        <Stack.Screen name="ios" />
        <Stack.Screen name="android" />
      </Stack>
      </SecurityProvider>
  );
}
