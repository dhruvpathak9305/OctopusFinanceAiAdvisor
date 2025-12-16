/**
 * =============================================================================
 * MIGRATION WIZARD - UI FOR FREE TO PREMIUM DATA MIGRATION
 * =============================================================================
 * 
 * Provides a user-friendly interface for choosing migration strategy
 * and previewing data before migration.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import dataMigrationService, {
  MigrationStrategy,
  MigrationPreview,
  MigrationResult,
} from '../../services/migration/dataMigrationService';
import offlineAuth from '../../services/auth/offlineAuth';

interface MigrationWizardProps {
  onComplete?: (result: MigrationResult) => void;
  onCancel?: () => void;
}

export const MigrationWizard: React.FC<MigrationWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const { user } = useUnifiedAuth();
  const { isPremium } = useSubscription();
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<MigrationStrategy>('merge');
  const [selectedData, setSelectedData] = useState<{
    accounts?: string[];
    transactions?: string[];
    budgets?: string[];
    netWorth?: string[];
  }>({});

  useEffect(() => {
    loadPreview();
  }, []);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const userId = await offlineAuth.getUserId();
      const previewData = await dataMigrationService.getMigrationPreview(userId);
      setPreview(previewData);
    } catch (error: any) {
      console.error('Error loading migration preview:', error);
      Alert.alert('Error', 'Failed to load migration preview');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User must be authenticated');
      return;
    }

    if (!isPremium) {
      Alert.alert('Error', 'Premium subscription required for migration');
      return;
    }

    setMigrating(true);

    try {
      const userId = await offlineAuth.getUserId();
      const result = await dataMigrationService.migrateToPremium(userId, {
        strategy: selectedStrategy,
        selectedData: selectedStrategy === 'selective' ? selectedData : undefined,
      });

      if (result.success) {
        Alert.alert(
          'Migration Complete',
          `Successfully migrated:\n- ${result.migrated.accounts} accounts\n- ${result.migrated.transactions} transactions\n- ${result.migrated.budgets} budgets\n- ${result.migrated.netWorth} net worth entries`,
          [
            {
              text: 'OK',
              onPress: () => {
                onComplete?.(result);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Migration Failed',
          `Errors occurred:\n${result.errors.join('\n')}`
        );
      }
    } catch (error: any) {
      Alert.alert('Error', `Migration failed: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading migration preview...</Text>
      </View>
    );
  }

  if (!preview) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load preview</Text>
        <TouchableOpacity style={styles.button} onPress={loadPreview}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Migrate Your Data</Text>
      <Text style={styles.subtitle}>
        Choose how to migrate your local data to your premium account
      </Text>

      {/* Preview Section */}
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Data Preview</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Accounts:</Text>
          <Text style={styles.previewValue}>{preview.accounts.count}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Transactions:</Text>
          <Text style={styles.previewValue}>{preview.transactions.count}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Budgets:</Text>
          <Text style={styles.previewValue}>{preview.budgets.count}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Net Worth Entries:</Text>
          <Text style={styles.previewValue}>{preview.netWorth.count}</Text>
        </View>
        {preview.serverDataExists && (
          <Text style={styles.warningText}>
            ⚠️ You already have data on the server. Choose merge to combine data.
          </Text>
        )}
      </View>

      {/* Strategy Selection */}
      <View style={styles.strategySection}>
        <Text style={styles.sectionTitle}>Migration Strategy</Text>
        
        <TouchableOpacity
          style={[
            styles.strategyOption,
            selectedStrategy === 'merge' && styles.strategyOptionSelected,
          ]}
          onPress={() => setSelectedStrategy('merge')}
        >
          <Text style={styles.strategyTitle}>Merge</Text>
          <Text style={styles.strategyDescription}>
            Combine your local data with existing server data. Duplicates will be updated.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.strategyOption,
            selectedStrategy === 'replace' && styles.strategyOptionSelected,
          ]}
          onPress={() => setSelectedStrategy('replace')}
        >
          <Text style={styles.strategyTitle}>Replace</Text>
          <Text style={styles.strategyDescription}>
            Replace all server data with your local data. Existing server data will be deleted.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.strategyOption,
            selectedStrategy === 'selective' && styles.strategyOptionSelected,
          ]}
          onPress={() => setSelectedStrategy('selective')}
        >
          <Text style={styles.strategyTitle}>Selective</Text>
          <Text style={styles.strategyDescription}>
            Choose specific accounts, transactions, and budgets to migrate.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={migrating}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.migrateButton]}
          onPress={handleMigrate}
          disabled={migrating}
        >
          {migrating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.migrateButtonText}>Start Migration</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  previewSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    marginTop: 12,
    fontSize: 14,
    color: '#f59e0b',
  },
  strategySection: {
    marginBottom: 24,
  },
  strategyOption: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  strategyOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  migrateButton: {
    backgroundColor: '#3b82f6',
  },
  migrateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

