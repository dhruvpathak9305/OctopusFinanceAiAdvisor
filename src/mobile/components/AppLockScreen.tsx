import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";

interface AppLockScreenProps {
  onUnlock: () => void;
  isBiometricAvailable: boolean;
}

const AppLockScreen: React.FC<AppLockScreenProps> = ({
  onUnlock,
  isBiometricAvailable,
}) => {


  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color="#10B981" />
        </View>
        
        <Text style={styles.title}>Octopus Finance</Text>
        <Text style={styles.subtitle}>Locked for your security</Text>

        <TouchableOpacity 
          style={styles.unlockButton} 
          onPress={onUnlock}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isBiometricAvailable ? "finger-print" : "keypad"} 
            size={24} 
            color="#FFFFFF" 
            style={{ marginRight: 10 }}
          />
          <Text style={styles.unlockText}>
            {isBiometricAvailable ? "Unlock with Face ID" : "Unlock App"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B1426", // App background color
    zIndex: 9999, // Ensure it's on top
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 48,
  },
  unlockButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AppLockScreen;
