/**
 * =============================================================================
 * NETWORK MONITOR - CONNECTIVITY DETECTION
 * =============================================================================
 * 
 * Monitors network connectivity and triggers sync when online.
 * Uses NetInfo for React Native and navigator.onLine for web.
 */

import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

export interface NetworkMonitorCallbacks {
  onOnline?: () => void;
  onOffline?: () => void;
  onStatusChange?: (status: NetworkStatus) => void;
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline: boolean = false;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Initialize network monitoring
   */
  private async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      // Web: Use navigator.onLine
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.setOnline(true);
      });
      
      window.addEventListener('offline', () => {
        this.setOnline(false);
      });
    } else {
      // React Native: Use NetInfo
      try {
        const state = await NetInfo.fetch();
        this.isOnline = state.isConnected ?? false;
        
        this.unsubscribe = NetInfo.addEventListener((state) => {
          this.setOnline(state.isConnected ?? false);
        });
      } catch (error) {
        console.error('Error initializing NetInfo:', error);
        this.isOnline = false;
      }
    }
  }

  /**
   * Set online status and notify listeners
   */
  private setOnline(status: boolean): void {
    if (this.isOnline !== status) {
      this.isOnline = status;
      const networkStatus: NetworkStatus = status ? 'online' : 'offline';
      
      // Notify all listeners
      this.listeners.forEach((listener) => {
        try {
          listener(networkStatus);
        } catch (error) {
          console.error('Error in network status listener:', error);
        }
      });
    }
  }

  /**
   * Get current network status
   */
  async getStatus(): Promise<NetworkStatus> {
    if (Platform.OS === 'web') {
      return navigator.onLine ? 'online' : 'offline';
    } else {
      try {
        const state = await NetInfo.fetch();
        return state.isConnected ? 'online' : 'offline';
      } catch (error) {
        console.error('Error getting network status:', error);
        return 'unknown';
      }
    }
  }

  /**
   * Check if currently online
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add a listener for network status changes
   */
  addListener(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Remove all listeners and cleanup
   */
  cleanup(): void {
    this.listeners.clear();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Wait for network to come online (with timeout)
   */
  async waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
    if (this.isOnline) {
      return true;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeoutMs);

      const unsubscribe = this.addListener((status) => {
        if (status === 'online') {
          clearTimeout(timeout);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

export default NetworkMonitor.getInstance();

