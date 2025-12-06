import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface MobileLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
  padding?: number;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showTabBar = false,
  padding = 16,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView 
        style={styles.main}
        contentContainerStyle={[
          styles.content,
          { padding }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      
      {showTabBar && (
        <View style={styles.tabBar}>
          {/* Tab bar content can be added here */}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  main: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  tabBar: {
    height: 80,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
}); 