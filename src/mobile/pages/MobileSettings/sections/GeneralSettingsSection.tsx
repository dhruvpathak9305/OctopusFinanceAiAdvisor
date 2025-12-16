import React, { useState, useEffect } from "react";
import { Alert, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
  SettingsSwitch,
} from "../components";
import { ThemeColors, SettingsHandlers, SettingsState } from "../types";
import syncEngine from "../../../../../services/sync/syncEngine";
import { syncSupabaseToLocal } from "../../../../../services/testing/syncSupabaseToLocal";
import { useUnifiedAuth } from "../../../../../contexts/UnifiedAuthContext";
import networkMonitor from "../../../../../services/sync/networkMonitor";
import { getLocalDb } from "../../../../../services/localDb";

interface GeneralSettingsSectionProps {
  colors: ThemeColors;
  theme: string;
  handlers: SettingsHandlers;
  settingsState: SettingsState;
  setNotificationsEnabled: (value: boolean) => void;
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago", "1 hour ago")
 */
function formatTimeSince(timestamp: number | null | undefined): string {
  if (!timestamp) return "Never";
  
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return "Just now";
}

/**
 * Format timestamp to readable date/time
 */
function formatDateTime(timestamp: number | null | undefined): string {
  if (!timestamp) return "Never";
  
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (date >= today) {
    return `Today at ${timeStr}`;
  } else if (date >= yesterday) {
    return `Yesterday at ${timeStr}`;
  } else {
    return `${dateStr} at ${timeStr}`;
  }
}

const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  colors,
  theme,
  handlers,
  settingsState,
  setNotificationsEnabled,
}) => {
  const { user } = useUnifiedAuth();
  const [syncingLocalToSupabase, setSyncingLocalToSupabase] = useState(false);
  const [syncingSupabaseToLocal, setSyncingSupabaseToLocal] = useState(false);
  const [lastPushTime, setLastPushTime] = useState<number | null>(null);
  const [lastPullTime, setLastPullTime] = useState<number | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fetch sync metadata on mount and after syncs
  useEffect(() => {
    const fetchSyncMetadata = async () => {
      try {
        const db = await getLocalDb();
        
        // Get last push time (from any table's sync_metadata)
        const pushResult = await db.getFirstAsync<{ last_pushed_at: number | null }>(
          `SELECT MAX(last_pushed_at) as last_pushed_at FROM sync_metadata WHERE last_pushed_at IS NOT NULL`
        );
        setLastPushTime(pushResult?.last_pushed_at || null);
        
        // Get last pull time
        const pullResult = await db.getFirstAsync<{ last_pulled_at: number | null }>(
          `SELECT MAX(last_pulled_at) as last_pulled_at FROM sync_metadata WHERE last_pulled_at IS NOT NULL`
        );
        setLastPullTime(pullResult?.last_pulled_at || null);
      } catch (error) {
        console.error('Error fetching sync metadata:', error);
      }
    };

    fetchSyncMetadata();
    
    // Refresh every 30 seconds to update "time since"
    const interval = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshCounter]);

  const handleSyncLocalToSupabase = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please sign in to sync data");
      return;
    }

    const isOnline = networkMonitor.isCurrentlyOnline();
    if (!isOnline) {
      Alert.alert("Offline", "Please connect to the internet to sync data");
      return;
    }

    setSyncingLocalToSupabase(true);
    try {
      const result = await syncEngine.sync(user.id);
      if (result.success) {
        // Refresh sync metadata to get updated last_pushed_at
        const db = await getLocalDb();
        const pushResult = await db.getFirstAsync<{ last_pushed_at: number | null }>(
          `SELECT MAX(last_pushed_at) as last_pushed_at FROM sync_metadata WHERE last_pushed_at IS NOT NULL`
        );
        setLastPushTime(pushResult?.last_pushed_at || Date.now());
        
        Alert.alert(
          "Sync Complete",
          `Successfully synced ${result.pushed} items to Supabase`
        );
      } else {
        Alert.alert(
          "Sync Failed",
          `Errors: ${result.errors.join(", ")}`
        );
      }
    } catch (error: any) {
      Alert.alert("Sync Error", error.message || "Failed to sync data");
    } finally {
      setSyncingLocalToSupabase(false);
    }
  };

  const handleSyncSupabaseToLocal = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please sign in to sync data");
      return;
    }

    const isOnline = networkMonitor.isCurrentlyOnline();
    if (!isOnline) {
      Alert.alert("Offline", "Please connect to the internet to sync data");
      return;
    }

    setSyncingSupabaseToLocal(true);
    try {
      const result = await syncSupabaseToLocal({ userId: user.id });
      
      // Refresh sync metadata to get updated last_pulled_at
      const db = await getLocalDb();
      const pullResult = await db.getFirstAsync<{ last_pulled_at: number | null }>(
        `SELECT MAX(last_pulled_at) as last_pulled_at FROM sync_metadata WHERE last_pulled_at IS NOT NULL`
      );
      setLastPullTime(pullResult?.last_pulled_at || Date.now());
      
      const totalSynced = Object.values(result.synced).reduce((sum, count) => sum + count, 0);
      if (result.errors.length > 0) {
        Alert.alert(
          "Sync Complete with Errors",
          `Synced ${totalSynced} records. Errors: ${result.errors.join(", ")}`
        );
      } else {
        Alert.alert(
          "Sync Complete",
          `Successfully synced ${totalSynced} records from Supabase to local database`
        );
      }
    } catch (error: any) {
      Alert.alert("Sync Error", error.message || "Failed to sync data");
    } finally {
      setSyncingSupabaseToLocal(false);
    }
  };

  // Format sync status subtitles
  const getPushSubtitle = () => {
    if (syncingLocalToSupabase) return "Syncing...";
    const baseSubtitle = "Upload local changes to cloud";
    if (lastPushTime) {
      return `${baseSubtitle}\nLast sync: ${formatDateTime(lastPushTime)} (${formatTimeSince(lastPushTime)})`;
    }
    return baseSubtitle;
  };

  const getPullSubtitle = () => {
    if (syncingSupabaseToLocal) return "Syncing...";
    const baseSubtitle = "Download cloud data to device";
    if (lastPullTime) {
      return `${baseSubtitle}\nLast sync: ${formatDateTime(lastPullTime)} (${formatTimeSince(lastPullTime)})`;
    }
    return baseSubtitle;
  };

  return (
    <SettingsSection title="Settings" colors={colors}>
      <SettingsItem
        icon="cloud-upload"
        title="Backup"
        subtitle="Export, Import, A complete reset"
        colors={colors}
        onPress={handlers.handleBackup}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="cloud-upload-outline"
        title="Sync Local to Supabase"
        subtitle={getPushSubtitle()}
        colors={colors}
        onPress={handleSyncLocalToSupabase}
        rightComponent={
          syncingLocalToSupabase ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="cloud-download-outline"
        title="Sync Supabase to Local"
        subtitle={getPullSubtitle()}
        colors={colors}
        onPress={handleSyncSupabaseToLocal}
        rightComponent={
          syncingSupabaseToLocal ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="list-outline"
        title="Sync Queue"
        subtitle="View pending and failed sync jobs"
        colors={colors}
        onPress={() => {
          if (handlers.handleSyncQueue) {
            handlers.handleSyncQueue();
          } else {
            Alert.alert("Error", "Sync queue navigation not available");
          }
        }}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="lock-closed"
        title="Passcode"
        colors={colors}
        rightComponent={
          <View style={styles.passcodeIndicator}>
            <Text style={[styles.passcodeText, { color: colors.error }]}>
              ON
            </Text>
          </View>
        }
        onPress={() => Alert.alert("Passcode", "Passcode settings coming soon")}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="cash"
        title="Main Currency Setting"
        subtitle="INR(₹)"
        colors={colors}
        onPress={() => Alert.alert("Currency", "Currency settings coming soon")}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="card"
        title="Sub Currency Setting"
        colors={colors}
        onPress={() =>
          Alert.alert("Sub Currency", "Sub currency settings coming soon")
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="notifications"
        title="Alarm Setting"
        colors={colors}
        rightComponent={
          <SettingsSwitch
            value={settingsState.notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            colors={colors}
          />
        }
        showArrow={false}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="color-palette"
        title="Style"
        subtitle={`${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`}
        colors={colors}
        onPress={handlers.handleThemeChange}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="apps"
        title="Application Icon"
        colors={colors}
        onPress={() =>
          Alert.alert("App Icon", "App icon customization coming soon")
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="language"
        title="Language Setting"
        colors={colors}
        onPress={() => Alert.alert("Language", "Language settings coming soon")}
      />
    </SettingsSection>
  );
};

const styles = StyleSheet.create({
  passcodeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  passcodeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default GeneralSettingsSection;
