import React from 'react';
import { Platform } from 'react-native';
import { WebPageLayout } from '../components/layout/WebPageLayout';
import { WebHomeContent } from '../components/pages/WebHomeContent';
import MobileApp from '../src/mobile/MobileApp';
import { UnifiedAuthProvider } from '../contexts/UnifiedAuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function HomePage() {
  // Use different apps for mobile vs web
  if (Platform.OS === 'web') {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <UnifiedAuthProvider>
            <WebPageLayout>
              <WebHomeContent />
            </WebPageLayout>
          </UnifiedAuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Use the complete mobile app with React Navigation
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnifiedAuthProvider>
          <MobileApp />
        </UnifiedAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
} 