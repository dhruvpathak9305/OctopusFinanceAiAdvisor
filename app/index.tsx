import React from 'react';
import { Platform } from 'react-native';
import { WebPageLayout } from '../components/layout/WebPageLayout';
import { WebHomeContent } from '../components/pages/WebHomeContent';
import MobileApp from '../src/mobile/MobileApp';

export default function HomePage() {
  // Use different apps for mobile vs web
  if (Platform.OS === 'web') {
    return (
      <WebPageLayout>
        <WebHomeContent />
      </WebPageLayout>
    );
  }

  // Use the complete mobile app with React Navigation
  return <MobileApp />;
} 