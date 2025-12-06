/**
 * =============================================================================
 * BANK CONNECTION SETTINGS - UI Component
 * =============================================================================
 * 
 * Complete UI for managing bank account connections via Setu Account Aggregator.
 * Users can connect banks, sync transactions, and manage their linked accounts.
 * 
 * Features:
 * - List all connected bank accounts
 * - Connect new bank accounts
 * - Manual sync transactions
 * - View sync status and statistics
 * - Disconnect accounts
 * =============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { supabase } from '../../../lib/supabase/client';
import BankAggregationService, { useBankAggregation } from '../../../services/bankAggregationService';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

interface BankConnection {
  id: string;
  institution_name?: string;
  masked_account_number?: string;
  account_type?: string;
  status: string;
  last_synced_at?: string;
  created_at: string;
}

interface SyncStats {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  total_transactions_imported: number;
  success_rate: number;
}

export default function BankConnectionSettings() {
  const [user, setUser] = useState<any>(null);
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Load connections and stats
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (connectionsError) throw connectionsError;
      setConnections(connectionsData || []);

      // Load sync stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_bank_sync_stats', {
          p_user_id: user.id,
          p_days: 30,
        });

      if (statsError) throw statsError;
      setSyncStats(statsData[0] || null);
    } catch (error: any) {
      console.error('Failed to load bank connections:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load connections',
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleConnectBank = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Create consent request
      const consent = await BankAggregationService.createConsentRequest(user.id, {
        fiTypes: ['DEPOSIT'], // Bank accounts
      });

      // Open consent URL
      const canOpen = await Linking.canOpenURL(consent.url);
      if (canOpen) {
        await Linking.openURL(consent.url);
        
        Toast.show({
          type: 'info',
          text1: 'Approve Bank Connection',
          text2: 'Complete the approval in your browser',
        });

        // Poll for consent approval
        pollConsentStatus(consent.id);
      } else {
        throw new Error('Cannot open consent URL');
      }
    } catch (error: any) {
      console.error('Failed to connect bank:', error);
      Alert.alert('Connection Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const pollConsentStatus = async (consentId: string) => {
    // Poll every 5 seconds for up to 5 minutes
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes

    const interval = setInterval(async () => {
      attempts++;

      try {
        const status = await BankAggregationService.checkConsentStatus(consentId);

        if (status.status === 'ACTIVE') {
          clearInterval(interval);
          Toast.show({
            type: 'success',
            text1: 'Bank Connected!',
            text2: `Connected ${status.accounts.length} account(s)`,
          });
          loadData(); // Refresh connections list
        } else if (status.status === 'REJECTED') {
          clearInterval(interval);
          Toast.show({
            type: 'error',
            text1: 'Connection Rejected',
            text2: 'You rejected the bank connection',
          });
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          Toast.show({
            type: 'info',
            text1: 'Consent Pending',
            text2: 'Please complete the approval process',
          });
        }
      } catch (error) {
        console.error('Failed to check consent status:', error);
      }
    }, 5000);
  };

  const handleSyncConnection = async (connectionId: string) => {
    if (!user) return;

    setIsSyncing(connectionId);
    try {
      const result = await BankAggregationService.syncBankAccount(connectionId, user.id);

      Toast.show({
        type: 'success',
        text1: 'Sync Complete',
        text2: `Imported ${result.imported} transactions, skipped ${result.skipped}`,
      });

      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Failed to sync:', error);
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: error.message,
      });
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDisconnect = async (connectionId: string, institutionName?: string) => {
    if (!user) return;

    Alert.alert(
      'Disconnect Bank Account',
      `Are you sure you want to disconnect ${institutionName || 'this account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await BankAggregationService.disconnectBankAccount(connectionId, user.id);
              
              Toast.show({
                type: 'info',
                text1: 'Bank Disconnected',
                text2: 'Account has been disconnected',
              });

              await loadData();
            } catch (error: any) {
              Alert.alert('Failed to disconnect', error.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34a853';
      case 'pending':
        return '#fbbc04';
      case 'expired':
      case 'revoked':
      case 'error':
        return '#ea4335';
      default:
        return '#999';
    }
  };

  const getAccountTypeIcon = (accountType?: string) => {
    const type = accountType?.toLowerCase();
    if (type === 'savings') return 'wallet-outline';
    if (type === 'current') return 'business-outline';
    if (type === 'credit_card') return 'card-outline';
    return 'bank-outline';
  };

  if (isLoading && connections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
        <Text style={styles.loadingText}>Loading bank connections...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="business-outline" size={32} color="#4285f4" />
        <Text style={styles.title}>Bank Connections</Text>
        <Text style={styles.subtitle}>
          Connect your bank accounts to automatically import transactions
        </Text>
      </View>

      {/* Statistics Card */}
      {syncStats && connections.length > 0 && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Sync Statistics (Last 30 Days)</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{syncStats.total_transactions_imported}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#34a853' }]}>
                {syncStats.success_rate.toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      )}

      {/* Connected Banks List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Accounts ({connections.length})</Text>

        {connections.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No banks connected yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect your bank to start importing transactions automatically
            </Text>
          </View>
        ) : (
          connections.map((connection) => (
            <View key={connection.id} style={styles.connectionCard}>
              <View style={styles.connectionHeader}>
                <View style={styles.connectionIcon}>
                  <Ionicons
                    name={getAccountTypeIcon(connection.account_type)}
                    size={24}
                    color="#4285f4"
                  />
                </View>
                
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>
                    {connection.institution_name || 'Bank Account'}
                  </Text>
                  <Text style={styles.connectionAccount}>
                    {connection.masked_account_number || 'XXXX'}
                  </Text>
                  <Text style={styles.connectionType}>
                    {connection.account_type || 'Account'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(connection.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(connection.status) },
                    ]}
                  >
                    {connection.status}
                  </Text>
                </View>
              </View>

              <View style={styles.connectionDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Last synced: {formatDate(connection.last_synced_at)}
                  </Text>
                </View>
              </View>

              <View style={styles.connectionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSyncConnection(connection.id)}
                  disabled={isSyncing === connection.id || connection.status !== 'active'}
                >
                  {isSyncing === connection.id ? (
                    <ActivityIndicator size="small" color="#4285f4" />
                  ) : (
                    <>
                      <Ionicons name="sync-outline" size={20} color="#4285f4" />
                      <Text style={styles.actionButtonText}>Sync Now</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.disconnectButton]}
                  onPress={() => handleDisconnect(connection.id, connection.institution_name)}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#ea4335" />
                  <Text style={[styles.actionButtonText, styles.disconnectText]}>
                    Disconnect
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Connect New Bank Button */}
      <TouchableOpacity
        style={styles.connectButton}
        onPress={handleConnectBank}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.connectButtonText}>Connect New Bank</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How It Works</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>1</Text>
          <Text style={styles.infoText}>
            Click "Connect New Bank" and select your bank
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>2</Text>
          <Text style={styles.infoText}>
            Login with your net banking credentials
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>3</Text>
          <Text style={styles.infoText}>
            Approve the consent to link your account
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>4</Text>
          <Text style={styles.infoText}>
            Transactions will be imported automatically
          </Text>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color="#34a853" />
          <Text style={styles.securityText}>
            Secure connection via RBI-approved Account Aggregator. We never see your bank password.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  statsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  connectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  connectionAccount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  connectionType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  connectionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4285f4',
    marginLeft: 8,
  },
  disconnectButton: {
    backgroundColor: '#ffebee',
  },
  disconnectText: {
    color: '#ea4335',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285f4',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285f4',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  securityNote: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#34a853',
    marginLeft: 8,
    lineHeight: 18,
  },
});

