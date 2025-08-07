import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { isDark } = useTheme();
  
  const colors = isDark ? {
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
  } : {
    text: '#111827',
    textSecondary: '#6B7280',
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Financial Dashboard
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Track, analyze, and optimize your finances in one place
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20, // Reduced from 24
    fontWeight: '700',
    marginBottom: 4, // Reduced from 8
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13, // Reduced from 16
    textAlign: 'center',
    lineHeight: 18, // Reduced from 22
    opacity: 0.8,
  },
});

export default Header; 