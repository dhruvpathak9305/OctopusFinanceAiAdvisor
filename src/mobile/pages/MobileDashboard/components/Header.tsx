import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
  title: string;
  subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
    lineHeight: 22,
    opacity: 0.9,
  },
});

export default Header; 