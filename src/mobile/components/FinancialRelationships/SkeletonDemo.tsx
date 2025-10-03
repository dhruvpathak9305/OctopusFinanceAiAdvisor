/**
 * DEVELOPMENT/TESTING COMPONENT ONLY
 *
 * This component is for development and testing purposes to showcase
 * the FinancialDashboardSkeleton component with theme switching.
 *
 * DO NOT USE IN PRODUCTION - Use FinancialDashboardSkeleton directly
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FinancialDashboardSkeleton from "./FinancialDashboardSkeleton";

interface SkeletonDemoProps {
  onClose?: () => void;
}

const SkeletonDemo: React.FC<SkeletonDemoProps> = ({ onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colors = {
    background: isDarkMode ? "#111827" : "#F9FAFB",
    card: isDarkMode ? "#1F2937" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#111827",
    primary: "#10B981",
    border: isDarkMode ? "#374151" : "#E5E7EB",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Demo Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Financial Dashboard Skeleton
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.themeToggle,
                { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <Ionicons
                name={isDarkMode ? "sunny" : "moon"}
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.themeText, { color: colors.primary }]}>
                {isDarkMode ? "Light" : "Dark"}
              </Text>
            </TouchableOpacity>
            {onClose && (
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.border }]}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Skeleton Demo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FinancialDashboardSkeleton isDark={isDarkMode} />

        {/* Info Section */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            🎨 Skeleton Features
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              • 📱 Pixel-perfect match to actual UI layout
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              • 🌙 Full light/dark theme support
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              • 🎯 Matches actual component structure
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              • 🔄 Smooth loading state transitions
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              • 🎨 Themed colors and opacity
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              • 📊 All sections: Summary, Actions, Activity
            </Text>
          </View>
        </View>

        {/* Usage Instructions */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            💻 Usage
          </Text>
          <View
            style={[
              styles.codeBlock,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.codeText, { color: colors.primary }]}>
              {`// In FinancialDashboard.tsx
if (loading) {
  return <FinancialDashboardSkeleton isDark={isDark} />;
}`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  themeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontSize: 12,
    fontFamily: "monospace",
    lineHeight: 18,
  },
});

export default SkeletonDemo;
