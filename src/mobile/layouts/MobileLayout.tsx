import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MobileHeader from '../components/navigation/MobileHeader';
import MobileBottomNav from '../components/navigation/MobileBottomNav';
import MobileRouter from '../navigation/MobileRouter';

const MobileLayout: React.FC = () => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Fixed Header */}
        <MobileHeader />
        
        {/* Main Content Area */}
        <View style={styles.content}>
          <MobileRouter />
        </View>
        
        {/* Fixed Bottom Navigation */}
        <MobileBottomNav />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  content: {
    flex: 1,
  },
});

export default MobileLayout; 