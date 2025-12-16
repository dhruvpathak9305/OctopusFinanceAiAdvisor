/**
 * =============================================================================
 * OFFLINE AUTH SERVICE - USER IDENTITY MANAGEMENT
 * =============================================================================
 * 
 * Manages user identity for both offline (free) and online (premium) users.
 * Provides unified user ID access regardless of authentication state.
 */

import { supabase } from '../../lib/supabase/client';
import { getOrCreateOfflineUserId, clearOfflineUserId } from '../offlineIdentity';
import subscriptionService from '../subscription/subscriptionService';

export interface UserIdentity {
  userId: string;
  isPremium: boolean;
  isAuthenticated: boolean;
  isOffline: boolean;
  email?: string | null;
}

class OfflineAuthService {
  private static instance: OfflineAuthService;

  private constructor() {}

  static getInstance(): OfflineAuthService {
    if (!OfflineAuthService.instance) {
      OfflineAuthService.instance = new OfflineAuthService();
    }
    return OfflineAuthService.instance;
  }

  /**
   * Get user ID - returns Supabase user ID if premium/authenticated, otherwise offline ID
   */
  async getUserId(): Promise<string> {
    const status = await subscriptionService.checkSubscriptionStatus();
    
    if (status.isPremium && status.isAuthenticated) {
      // Premium user - use Supabase user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        return session.user.id;
      }
    }
    
    // Free/offline user - use persistent local ID
    return await getOrCreateOfflineUserId();
  }

  /**
   * Get complete user identity information
   */
  async getUserIdentity(): Promise<UserIdentity> {
    const status = await subscriptionService.checkSubscriptionStatus();
    const { data: { session } } = await supabase.auth.getSession();
    
    const isAuthenticated = !!session?.user;
    const isPremium = status.isPremium;
    
    if (isPremium && isAuthenticated && session?.user?.id) {
      return {
        userId: session.user.id,
        isPremium: true,
        isAuthenticated: true,
        isOffline: false,
        email: session.user.email || null,
      };
    }
    
    // Offline/free user
    const offlineUserId = await getOrCreateOfflineUserId();
    return {
      userId: offlineUserId,
      isPremium: false,
      isAuthenticated: false,
      isOffline: true,
      email: null,
    };
  }

  /**
   * Check if current user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  }

  /**
   * Check if current user is premium
   */
  async isPremium(): Promise<boolean> {
    const status = await subscriptionService.checkSubscriptionStatus();
    return status.isPremium;
  }

  /**
   * Check if current user can sync
   */
  async canSync(): Promise<boolean> {
    return await subscriptionService.canSync();
  }

  /**
   * Get user email (if authenticated)
   */
  async getUserEmail(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email || null;
  }

  /**
   * Clear offline identity (when user logs out or upgrades to premium)
   */
  async clearOfflineIdentity(): Promise<void> {
    await clearOfflineUserId();
  }

  /**
   * Migrate from offline to authenticated user
   * This is called when a free user upgrades to premium and logs in
   */
  async migrateToAuthenticated(supabaseUserId: string): Promise<void> {
    // Clear offline ID since we now have a real user ID
    await this.clearOfflineIdentity();
    
    // Clear subscription cache to force refresh
    await subscriptionService.clearCache();
  }
}

export default OfflineAuthService.getInstance();

