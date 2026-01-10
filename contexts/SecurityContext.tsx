import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as SecureStore from "expo-secure-store";
import { 
  authenticateUser, 
  checkBiometricSupport, 
  enablePrivacyScreen, 
  disablePrivacyScreen 
} from "../services/security/biometricService";
import AppLockScreen from "../src/mobile/components/AppLockScreen";

interface SecurityContextType {
  isLocked: boolean;
  isAppLockEnabled: boolean;
  setAppLockEnabled: (enabled: boolean) => Promise<void>;
  lockApp: () => void;
  unlockApp: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const APP_LOCK_ENABLED_KEY = "octopus_app_lock_enabled";
const LOCK_TIMEOUT_MS = 1000 * 30; // 30 seconds grace period

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isAppLockEnabled, setIsAppLockEnabledState] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      // Check hardware support
      const supported = await checkBiometricSupport();
      setIsBiometricSupported(supported);

      // Load setting
      const enabled = await SecureStore.getItemAsync(APP_LOCK_ENABLED_KEY);
      if (enabled === "true" && supported) {
        setIsAppLockEnabledState(true);
        // Initial lock on startup if enabled
        setIsLocked(true);
      }
    };
    init();
  }, []);

  // Handle App State Changes (Background/Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isAppLockEnabled]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      // App coming to foreground
      disablePrivacyScreen(); 

      if (isAppLockEnabled && backgroundTime.current) {
        const timeInBackground = Date.now() - backgroundTime.current;
        if (timeInBackground > LOCK_TIMEOUT_MS) {
          setIsLocked(true);
        }
        backgroundTime.current = null;
      }
    } else if (nextAppState.match(/inactive|background/)) {
      // App going to background
      enablePrivacyScreen();
      backgroundTime.current = Date.now();
    }

    appState.current = nextAppState;
  };

  const setAppLockEnabled = async (enabled: boolean) => {
    setIsAppLockEnabledState(enabled);
    await SecureStore.setItemAsync(APP_LOCK_ENABLED_KEY, String(enabled));
    if (enabled && !isLocked) {
        // Optional: lock immediately when enabling? No, annoying.
    }
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  const unlockApp = async () => {
    const success = await authenticateUser();
    if (success) {
      setIsLocked(false);
    }
    return success;
  };

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        isAppLockEnabled,
        setAppLockEnabled,
        lockApp,
        unlockApp,
      }}
    >
      {children}
      {isLocked && isAppLockEnabled && (
        <AppLockScreen 
          onUnlock={unlockApp} 
          isBiometricAvailable={isBiometricSupported} 
        />
      )}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};
