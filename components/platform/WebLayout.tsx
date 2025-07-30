import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface WebLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  maxWidth?: number;
}

export const WebLayout: React.FC<WebLayoutProps> = ({
  children,
  showSidebar = false,
  maxWidth = 1200,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {showSidebar && (
        <View style={styles.sidebar}>
          {/* Sidebar content can be added here */}
        </View>
      )}
      
      <ScrollView 
        style={styles.main} 
        contentContainerStyle={[
          styles.content,
          { maxWidth }
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 20,
  },
  main: {
    flex: 1,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
}); 