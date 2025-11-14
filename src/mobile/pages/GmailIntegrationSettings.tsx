/**
 * =============================================================================
 * GMAIL INTEGRATION SETTINGS SCREEN
 * =============================================================================
 * 
 * This screen allows users to connect, manage, and monitor their Gmail
 * integration for automatic bank transaction imports.
 * 
 * Features:
 * - Connect/Disconnect Gmail
 * - Manual email sync
 * - View import statistics
 * - View recent imports
 * - Configure notification preferences
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as Linking from 'expo-linking';
import GmailIntegrationService, { useGmailIntegration } from '../../../services/gmailIntegrationService';
import { supabase } from '../../../lib/supabase/client';
import Toast from 'react-native-toast-message';

interface GmailStats {
  total_emails: number;
  successful_imports: number;
  failed_imports: number;
  duplicate_emails: number;
  total_amount_imported: number;
  import_success_rate: number;
  most_common_bank: string;
}

interface RecentImport {
  email_subject: string;
  email_from: string;
  status: string;
  parsed_amount: number;
  parsed_category: string;
  created_at: string;
}

export default function GmailIntegrationSettings() {
  const { isConnected, isLoading, disconnectGmail, syncEmails } = useGmailIntegration();
  
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<GmailStats | null>(null);
  const [recentImports, setRecentImports] = useState<RecentImport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Fetch user data
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Load statistics and recent imports
  useEffect(() => {
    if (isConnected && user) {
      loadData();
    }
  }, [isConnected, user]);

  // Handle OAuth redirect
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const { queryParams } = Linking.parse(event.url);
      
      if (event.url.includes('auth/callback')) {
        const code = queryParams.code as string;
        const error = queryParams.error as string;
        
        if (error) {
          Alert.alert('Connection Failed', `Error: ${error}`);
          return;
        }
        
        if (code) {
          try {
            // Exchange code for tokens
            const tokens = await GmailIntegrationService.exchangeAuthCode(code);
            
            // Set up push notifications
            const topicName = process.env.EXPO_PUBLIC_GMAIL_PUBSUB_TOPIC!;
            await GmailIntegrationService.setupPushNotifications(topicName);
            
            // Save integration to database
            if (user) {
              await supabase.from('user_integrations').upsert({
                user_id: user.id,
                gmail_enabled: true,
                gmail_email: user.email,
                gmail_access_token: tokens.accessToken,
                gmail_refresh_token: tokens.refreshToken,
                gmail_token_expiry: new Date(tokens.expiryTime).toISOString(),
              });
            }
            
            Toast.show({
              type: 'success',
              text1: 'Gmail Connected',
              text2: 'Your bank emails will now be imported automatically',
            });
            
            // Trigger initial sync
            handleSync();
          } catch (error: any) {
            Alert.alert('Connection Failed', error.message);
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    
    return () => {
      subscription.remove();
    };
  }, [user]);

  const loadData = async () => {
    try {
      // Load statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_email_import_stats', { 
          p_user_id: user!.id,
          p_days: 30 
        });

      if (statsError) throw statsError;
      setStats(statsData[0] || null);

      // Load recent imports
      const { data: importsData, error: importsError } = await supabase
        .rpc('get_recent_email_imports', { 
          p_user_id: user!.id,
          p_limit: 10 
        });

      if (importsError) throw importsError;
      setRecentImports(importsData || []);
    } catch (error: any) {
      console.error('Failed to load Gmail data:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const authUrl = GmailIntegrationService.getAuthUrl();
      await Linking.openURL(authUrl);
    } catch (error: any) {
      Alert.alert('Error', `Failed to open Gmail authorization: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Gmail',
      'Are you sure you want to disconnect Gmail? You will no longer receive automatic transaction imports.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectGmail();
              
              // Update database
              if (user) {
                await supabase
                  .from('user_integrations')
                  .update({ gmail_enabled: false })
                  .eq('user_id', user.id);
              }
              
              Toast.show({
                type: 'info',
                text1: 'Gmail Disconnected',
                text2: 'Automatic imports have been stopped',
              });
              
              // Clear local data
              setStats(null);
              setRecentImports([]);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      const count = await syncEmails(user.id);
      
      Toast.show({
        type: 'success',
        text1: 'Sync Complete',
        text2: `Imported ${count} new transactions`,
      });
      
      // Reload data
      await loadData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: error.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gmail Integration</Text>
        <Text style={styles.subtitle}>
          Automatically import bank transactions from your email
        </Text>
      </View>

      {/* Connection Status */}
      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <Text style={styles.cardTitle}>Connection Status</Text>
          <View style={[styles.statusBadge, isConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
            <Text style={styles.statusText}>
              {isConnected ? '✓ Connected' : '✗ Not Connected'}
            </Text>
          </View>
        </View>

        {isConnected ? (
          <>
            <Text style={styles.connectedEmail}>{user?.email}</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.syncButton]}
                onPress={handleSync}
                disabled={syncing || isLoading}
              >
                {syncing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sync Now</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.disconnectButton]}
                onPress={handleDisconnect}
                disabled={isLoading}
              >
                <Text style={styles.buttonTextDanger}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Connect your Gmail to automatically import bank transaction emails. 
              We support all major Indian banks including HDFC, ICICI, SBI, Axis, and more.
            </Text>
            
            <TouchableOpacity
              style={[styles.button, styles.connectButton]}
              onPress={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Connect Gmail</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Statistics */}
      {isConnected && stats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import Statistics (Last 30 Days)</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_emails}</Text>
              <Text style={styles.statLabel}>Total Emails</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.successColor]}>
                {stats.successful_imports}
              </Text>
              <Text style={styles.statLabel}>Imported</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.errorColor]}>
                {stats.failed_imports}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.warningColor]}>
                {stats.duplicate_emails}
              </Text>
              <Text style={styles.statLabel}>Duplicates</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Success Rate</Text>
            <Text style={[styles.summaryValue, styles.successColor]}>
              {stats.import_success_rate.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount Imported</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(stats.total_amount_imported)}
            </Text>
          </View>

          {stats.most_common_bank && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Most Common Bank</Text>
              <Text style={styles.summaryValue}>{stats.most_common_bank}</Text>
            </View>
          )}
        </View>
      )}

      {/* Recent Imports */}
      {isConnected && recentImports.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Imports</Text>
          
          {recentImports.map((item, index) => (
            <View key={index} style={styles.importItem}>
              <View style={styles.importHeader}>
                <Text style={styles.importSubject} numberOfLines={1}>
                  {item.email_subject}
                </Text>
                <View style={[
                  styles.statusBadge,
                  styles.smallBadge,
                  item.status === 'success' ? styles.successBadge : 
                  item.status === 'failed' ? styles.errorBadge : 
                  styles.warningBadge
                ]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              
              <Text style={styles.importFrom} numberOfLines={1}>
                From: {item.email_from}
              </Text>
              
              {item.status === 'success' && (
                <View style={styles.importDetails}>
                  <Text style={styles.importAmount}>
                    {formatCurrency(item.parsed_amount)}
                  </Text>
                  <Text style={styles.importCategory}>{item.parsed_category}</Text>
                </View>
              )}
              
              <Text style={styles.importDate}>
                {formatDate(item.created_at)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Help Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>How It Works</Text>
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>1.</Text>
          <Text style={styles.helpText}>
            Connect your Gmail account securely using Google OAuth
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>2.</Text>
          <Text style={styles.helpText}>
            We watch for new emails from known banks and payment services
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>3.</Text>
          <Text style={styles.helpText}>
            AI parses transaction details (amount, category, merchant)
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>4.</Text>
          <Text style={styles.helpText}>
            Transactions appear automatically in your app within seconds
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 Your email content is processed securely and never stored. 
          Only transaction details are saved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectedBadge: {
    backgroundColor: '#e8f5e9',
  },
  disconnectedBadge: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectedEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    backgroundColor: '#4285f4',
  },
  syncButton: {
    backgroundColor: '#34a853',
  },
  disconnectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ea4335',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDanger: {
    color: '#ea4335',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  successColor: {
    color: '#34a853',
  },
  errorColor: {
    color: '#ea4335',
  },
  warningColor: {
    color: '#fbbc04',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  importItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  importHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  importSubject: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  importFrom: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  importDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  importAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  importCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  importDate: {
    fontSize: 11,
    color: '#999',
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  successBadge: {
    backgroundColor: '#e8f5e9',
  },
  errorBadge: {
    backgroundColor: '#ffebee',
  },
  warningBadge: {
    backgroundColor: '#fff8e1',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  helpNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285f4',
    marginRight: 12,
    width: 24,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

