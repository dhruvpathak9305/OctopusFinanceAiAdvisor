import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DemoModeContextType = {
  isDemo: boolean;
  setIsDemo: (value: boolean) => void;
  toggleDemoMode: () => void;
};

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

// Helper function to get storage based on platform
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch (error) {
          console.error('Error accessing localStorage:', error);
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          console.error('Error setting localStorage:', error);
          return Promise.resolve();
        }
      }
    };
  } else {
    return AsyncStorage;
  }
};

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemo, setIsDemo] = useState<boolean>(false); // Default to false to use real data from accounts_real table
  const storage = getStorage();

  // Toggle the demo mode
  const toggleDemoMode = () => {
    setIsDemo(prevState => !prevState);
  };

  // Save demo mode state to storage
  useEffect(() => {
    const saveDemoMode = async () => {
      try {
        await storage.setItem('octopus-finance-demo-mode', JSON.stringify(isDemo));
      } catch (error) {
        console.error('Error saving demo mode:', error);
      }
    };
    saveDemoMode();
  }, [isDemo, storage]);

  // Load demo mode state from storage on init
  useEffect(() => {
    const loadDemoMode = async () => {
      try {
        const savedDemoMode = await storage.getItem('octopus-finance-demo-mode');
        if (savedDemoMode !== null) {
          setIsDemo(JSON.parse(savedDemoMode));
        }
      } catch (error) {
        console.error('Error loading demo mode:', error);
        // Keep default value (false) if there's an error
      }
    };
    loadDemoMode();
  }, [storage]);

  return (
    <DemoModeContext.Provider value={{ isDemo, setIsDemo, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = (): DemoModeContextType => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}; 