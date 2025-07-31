import React from 'react';
import { View } from 'react-native';
import MobileRouter from '../src/mobile/navigation/MobileRouter';

export default function MobilePage() {
  return (
    <View style={{ flex: 1 }}>
      <MobileRouter />
    </View>
  );
} 