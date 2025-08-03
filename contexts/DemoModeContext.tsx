import React, { createContext, useContext, useState, useEffect } from 'react';

type DemoModeContextType = {
  isDemo: boolean;
  setIsDemo: (value: boolean) => void;
  toggleDemoMode: () => void;
};

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemo, setIsDemo] = useState<boolean>(true); // Default to true since users start with demo mode

  // Toggle the demo mode
  const toggleDemoMode = () => {
    setIsDemo(prevState => !prevState);
  };

  // Save demo mode state to localStorage
  useEffect(() => {
    localStorage.setItem('octopus-finance-demo-mode', JSON.stringify(isDemo));
  }, [isDemo]);

  // Load demo mode state from localStorage on init
  useEffect(() => {
    const savedDemoMode = localStorage.getItem('octopus-finance-demo-mode');
    if (savedDemoMode !== null) {
      setIsDemo(JSON.parse(savedDemoMode));
    }
  }, []);

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