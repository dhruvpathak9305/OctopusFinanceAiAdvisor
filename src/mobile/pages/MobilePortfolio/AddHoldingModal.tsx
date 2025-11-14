/**
 * Add Holding Modal
 * Form to manually add stocks, mutual funds, ETFs to portfolio
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { PortfolioService } from '../../../../services/portfolioService';

interface AddHoldingModalProps {
  visible: boolean;
  onClose: () => void;
  portfolioId: string;
  onSuccess: () => void;
}

type AssetType = 'stock' | 'mutual_fund' | 'etf' | 'bond';

export default function AddHoldingModal({
  visible,
  onClose,
  portfolioId,
  onSuccess,
}: AddHoldingModalProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  // Form state
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [symbol, setSymbol] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');

  // Theme colors
  const colors = {
    background: isDark ? '#0B1426' : '#FFFFFF',
    card: isDark ? '#1F2937' : '#F9FAFB',
    cardBorder: isDark ? '#374151' : '#E5E7EB',
    text: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    primary: '#10B981',
    inputBg: isDark ? '#374151' : '#F3F4F6',
    error: '#EF4444',
  };

  const handleSubmit = async () => {
    // Validation
    if (!symbol.trim()) {
      Alert.alert('Error', 'Please enter a symbol/ticker');
      return;
    }
    if (!assetName.trim()) {
      Alert.alert('Error', 'Please enter asset name');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter valid quantity');
      return;
    }
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      Alert.alert('Error', 'Please enter valid purchase price');
      return;
    }

    setLoading(true);
    try {
      await PortfolioService.addHolding({
        portfolio_id: portfolioId,
        asset_type: assetType,
        symbol: symbol.toUpperCase(),
        asset_name: assetName,
        quantity: parseFloat(quantity),
        avg_purchase_price: parseFloat(purchasePrice),
        purchase_date: purchaseDate || new Date().toISOString().split('T')[0],
        notes: notes || null,
      });

      Alert.alert('Success', 'Holding added successfully!');
      
      // Reset form
      setSymbol('');
      setAssetName('');
      setQuantity('');
      setPurchasePrice('');
      setPurchaseDate('');
      setNotes('');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding holding:', error);
      Alert.alert('Error', 'Failed to add holding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles(colors).overlay}>
        <View style={styles(colors).container}>
          {/* Header */}
          <View style={styles(colors).header}>
            <Text style={styles(colors).title}>Add Holding</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles(colors).closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles(colors).scrollView}>
            {/* Asset Type Selector */}
            <Text style={styles(colors).label}>Asset Type</Text>
            <View style={styles(colors).assetTypeRow}>
              {(['stock', 'mutual_fund', 'etf', 'bond'] as AssetType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles(colors).assetTypeButton,
                    assetType === type && styles(colors).assetTypeButtonActive,
                  ]}
                  onPress={() => setAssetType(type)}
                >
                  <Text
                    style={[
                      styles(colors).assetTypeText,
                      assetType === type && styles(colors).assetTypeTextActive,
                    ]}
                  >
                    {type === 'mutual_fund' ? 'Mutual Fund' : type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Symbol */}
            <Text style={styles(colors).label}>
              Symbol/Ticker {assetType === 'mutual_fund' ? '(Scheme Code)' : ''}*
            </Text>
            <TextInput
              style={styles(colors).input}
              placeholder={
                assetType === 'stock'
                  ? 'e.g., RELIANCE, TCS'
                  : assetType === 'mutual_fund'
                  ? 'e.g., 119551'
                  : 'e.g., NIFTYBEES'
              }
              placeholderTextColor={colors.textSecondary}
              value={symbol}
              onChangeText={setSymbol}
              autoCapitalize="characters"
            />

            {/* Asset Name */}
            <Text style={styles(colors).label}>Name*</Text>
            <TextInput
              style={styles(colors).input}
              placeholder="Full name of the asset"
              placeholderTextColor={colors.textSecondary}
              value={assetName}
              onChangeText={setAssetName}
            />

            {/* Quantity */}
            <Text style={styles(colors).label}>Quantity*</Text>
            <TextInput
              style={styles(colors).input}
              placeholder="Number of shares/units"
              placeholderTextColor={colors.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />

            {/* Purchase Price */}
            <Text style={styles(colors).label}>
              Purchase Price* (₹ per {assetType === 'mutual_fund' ? 'unit' : 'share'})
            </Text>
            <TextInput
              style={styles(colors).input}
              placeholder="Average purchase price"
              placeholderTextColor={colors.textSecondary}
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
            />

            {/* Purchase Date */}
            <Text style={styles(colors).label}>Purchase Date (Optional)</Text>
            <TextInput
              style={styles(colors).input}
              placeholder="YYYY-MM-DD (defaults to today)"
              placeholderTextColor={colors.textSecondary}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
            />

            {/* Notes */}
            <Text style={styles(colors).label}>Notes (Optional)</Text>
            <TextInput
              style={[styles(colors).input, styles(colors).textArea]}
              placeholder="Any additional notes"
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Calculated Values */}
            {quantity && purchasePrice && (
              <View style={styles(colors).calculatedBox}>
                <Text style={styles(colors).calculatedLabel}>Total Investment:</Text>
                <Text style={styles(colors).calculatedValue}>
                  ₹{(parseFloat(quantity) * parseFloat(purchasePrice)).toFixed(2)}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles(colors).buttonRow}>
              <TouchableOpacity
                style={styles(colors).cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles(colors).cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles(colors).submitButton,
                  loading && styles(colors).submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles(colors).submitButtonText}>
                  {loading ? 'Adding...' : 'Add Holding'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: colors.textSecondary,
    },
    scrollView: {
      padding: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    assetTypeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    assetTypeButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    assetTypeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    assetTypeText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    assetTypeTextActive: {
      color: '#FFFFFF',
    },
    calculatedBox: {
      backgroundColor: colors.primary + '15',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    calculatedLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    calculatedValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
      marginBottom: 20,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    submitButton: {
      flex: 1,
      paddingVertical: 14,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

