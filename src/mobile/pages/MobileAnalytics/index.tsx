import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, darkTheme, lightTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MobileAnalytics() {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="bar-chart" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Market Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Coming Soon</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Advanced market analytics and portfolio performance insights will be available here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});

