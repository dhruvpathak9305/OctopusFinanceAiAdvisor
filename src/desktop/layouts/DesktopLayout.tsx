import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DesktopHeader from '../components/navigation/DesktopHeader';
import DesktopSidebar from '../components/navigation/DesktopSidebar';
import DesktopRouter from '../navigation/DesktopRouter';

const DesktopLayout: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Fixed Header */}
      <DesktopHeader />
      
      {/* Main Layout with Sidebar */}
      <View style={styles.mainLayout}>
        {/* Fixed Sidebar */}
        <DesktopSidebar />
        
        {/* Main Content Area */}
        <View style={styles.content}>
          <DesktopRouter />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
});

export default DesktopLayout; 