import { Platform } from 'react-native';
import { PlatformType } from '../types';

export const usePlatform = () => {
  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isNative = isIOS || isAndroid;
  
  const platformType: PlatformType = isWeb ? 'web' : Platform.OS as PlatformType;
  
  const getStyleForPlatform = (styles: {
    web?: any;
    ios?: any;
    android?: any;
    native?: any;
    default?: any;
  }) => {
    if (isWeb && styles.web) return styles.web;
    if (isIOS && styles.ios) return styles.ios;
    if (isAndroid && styles.android) return styles.android;
    if (isNative && styles.native) return styles.native;
    return styles.default || {};
  };
  
  const isLargeScreen = () => {
    if (!isWeb) return false;
    // @ts-ignore - Web-only
    return window.innerWidth >= 1024;
  };
  
  const isMediumScreen = () => {
    if (!isWeb) return false;
    // @ts-ignore - Web-only
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  };
  
  const isSmallScreen = () => {
    if (!isWeb) return true;
    // @ts-ignore - Web-only
    return window.innerWidth < 768;
  };
  
  return {
    isWeb,
    isIOS,
    isAndroid,
    isNative,
    platformType,
    getStyleForPlatform,
    isLargeScreen,
    isMediumScreen,
    isSmallScreen,
  };
}; 