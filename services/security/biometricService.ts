import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import * as SecureStore from "expo-secure-store";
import { Platform } from 'react-native';

const BIOMETRIC_CREDENTIALS_KEY = "octopus_biometric_credentials";

/**
 * Biometric & Privacy Service
 * Handles App Lock and Screen Privacy
 */

export const checkBiometricSupport = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

export const authenticateUser = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Octopus Finance',
      fallbackLabel: 'Use Passcode',
    });
    if (!result.success) {
        console.log("Biometric auth failed result:", result);
    }
    return result.success;
  } catch (error) {
    console.error('Biometric auth error:', error);
    return false;
  }
};

export const saveBiometricCredentials = async (email: string, password: string) => {
  try {
    // We store as a JSON string
    const credentials = JSON.stringify({ email, password });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    return true;
  } catch (e) {
    console.error("Failed to save credentials", e);
    return false;
  }
};

export const getBiometricCredentials = async () => {
  try {
    const json = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!json) return null;
    return JSON.parse(json) as { email: string, password: string };
  } catch (e) {
    console.error("Failed to get credentials", e);
    return null;
  }
};

export const clearBiometricCredentials = async () => {
    try {
        await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    } catch (e) {
        console.error("Failed to clear credentials", e);
    }
};

export const hasStoredCredentials = async () => {
    const creds = await getBiometricCredentials();
    return !!creds;
};

export const enablePrivacyScreen = async () => {
  if (Platform.OS === 'android') {
    // Prevents content from being visible in multitasking view (and screenshots)
    await ScreenCapture.preventScreenCaptureAsync(); 
  }
  // iOS automatically blurs in multitasking if configured in AppDelegate, 
  // but expo-screen-capture can also be used for more aggressive protection if needed.
};

export const disablePrivacyScreen = async () => {
  if (Platform.OS === 'android') {
    await ScreenCapture.allowScreenCaptureAsync();
  }
};
