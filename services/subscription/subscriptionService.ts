/**
 * =============================================================================
 * SUBSCRIPTION SERVICE - PREMIUM STATUS MANAGEMENT
 * =============================================================================
 * 
 * Manages subscription status checking and caching for offline access.
 * Determines if user is premium and can sync data.
 */

import { supabase } from '../../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUBSCRIPTION_CACHE_KEY = 'octopus_subscription_status';
const SUBSCRIPTION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface SubscriptionStatus {
  isPremium: boolean;
  isAuthenticated: boolean;
  canSync: boolean;
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
  expiresAt?: string | null;
  cachedAt?: number;
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private cachedStatus: SubscriptionStatus | null = null;
  private cacheExpiry: number = 0;

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Get storage adapter (AsyncStorage for mobile, localStorage for web)
   */
  private getStorage() {
    if (Platform.OS === 'web') {
      return {
        getItem: async (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: async (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch {
            // Ignore
          }
        },
      };
    }
    return AsyncStorage;
  }

  /**
   * Check subscription status from Supabase
   */
  async checkSubscriptionStatus(forceRefresh: boolean = false): Promise<SubscriptionStatus> {
    // Return cached status if still valid and not forcing refresh
    if (!forceRefresh && this.cachedStatus && Date.now() < this.cacheExpiry) {
      return this.cachedStatus;
    }

    // Try to load from local cache first
    if (!forceRefresh) {
      const cached = await this.loadCachedStatus();
      if (cached && Date.now() < (cached.cachedAt || 0) + SUBSCRIPTION_CACHE_TTL) {
        this.cachedStatus = cached;
        this.cacheExpiry = (cached.cachedAt || 0) + SUBSCRIPTION_CACHE_TTL;
        return cached;
      }
    }

    // Check authentication first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.user;

    if (!isAuthenticated) {
      const status: SubscriptionStatus = {
        isPremium: false,
        isAuthenticated: false,
        canSync: false,
        subscriptionTier: 'free',
        cachedAt: Date.now(),
      };
      await this.cacheStatus(status);
      return status;
    }

    // Check subscription status from user metadata or subscription table
    try {
      // Option 1: Check user metadata
      const userMetadata = session?.user?.user_metadata;
      const isPremiumFromMetadata = userMetadata?.subscription_tier === 'premium' || 
                                    userMetadata?.is_premium === true;

      // Option 2: Check subscription table (if exists)
      let isPremiumFromTable = false;
      try {
        const { data: subscriptionData, error: subError } = await supabase
          .from('subscriptions')
          .select('tier, expires_at')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();

        if (!subError && subscriptionData) {
          isPremiumFromTable = subscriptionData.tier === 'premium' || 
                               subscriptionData.tier === 'enterprise';
        }
      } catch (error) {
        // Subscription table might not exist, use metadata only
        console.log('Subscription table check failed, using metadata:', error);
      }

      const isPremium = isPremiumFromMetadata || isPremiumFromTable;
      const canSync = isPremium && isAuthenticated;

      const status: SubscriptionStatus = {
        isPremium,
        isAuthenticated: true,
        canSync,
        subscriptionTier: isPremium ? 'premium' : 'free',
        cachedAt: Date.now(),
      };

      await this.cacheStatus(status);
      this.cachedStatus = status;
      this.cacheExpiry = Date.now() + SUBSCRIPTION_CACHE_TTL;

      return status;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      
      // Fallback to cached status or default to free
      const cached = await this.loadCachedStatus();
      if (cached) {
        return cached;
      }

      return {
        isPremium: false,
        isAuthenticated: isAuthenticated,
        canSync: false,
        subscriptionTier: 'free',
        cachedAt: Date.now(),
      };
    }
  }

  /**
   * Cache subscription status locally
   */
  private async cacheStatus(status: SubscriptionStatus): Promise<void> {
    try {
      const storage = this.getStorage();
      await storage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error caching subscription status:', error);
    }
  }

  /**
   * Load cached subscription status
   */
  private async loadCachedStatus(): Promise<SubscriptionStatus | null> {
    try {
      const storage = this.getStorage();
      const cached = await storage.getItem(SUBSCRIPTION_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error loading cached subscription status:', error);
    }
    return null;
  }

  /**
   * Clear cached subscription status
   */
  async clearCache(): Promise<void> {
    try {
      const storage = this.getStorage();
      await storage.removeItem(SUBSCRIPTION_CACHE_KEY);
      this.cachedStatus = null;
      this.cacheExpiry = 0;
    } catch (error) {
      console.error('Error clearing subscription cache:', error);
    }
  }

  /**
   * Check if user can sync (premium + authenticated)
   */
  async canSync(): Promise<boolean> {
    const status = await this.checkSubscriptionStatus();
    return status.canSync;
  }

  /**
   * Get current subscription tier
   */
  async getSubscriptionTier(): Promise<'free' | 'premium' | 'enterprise'> {
    const status = await this.checkSubscriptionStatus();
    return status.subscriptionTier || 'free';
  }
}

export default SubscriptionService.getInstance();

