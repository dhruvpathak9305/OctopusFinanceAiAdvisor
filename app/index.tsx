import React from 'react';
import { Platform } from 'react-native';
import { MobilePageLayout } from '../components/layout/MobilePageLayout';
import { WebPageLayout } from '../components/layout/WebPageLayout';
import { MobileHomeContent } from '../components/pages/MobileHomeContent';
import { WebHomeContent } from '../components/pages/WebHomeContent';

export default function HomePage() {
  // Use different layouts for mobile vs web
  if (Platform.OS === 'web') {
    return (
      <WebPageLayout>
        <WebHomeContent />
      </WebPageLayout>
    );
  }

  return (
    <MobilePageLayout>
      <MobileHomeContent />
    </MobilePageLayout>
  );
} 