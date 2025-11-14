/**
 * Import CSV Modal
 * Bulk import holdings from CSV file
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../../contexts/ThemeContext';
import { PortfolioService } from '../../../../services/portfolioService';

interface ImportCSVModalProps {
  visible: boolean;
  onClose: () => void;
  portfolioId: string;
  onSuccess: () => void;
}

interface ParsedHolding {
  asset_type: string;
  symbol: string;
  asset_name: string;
  quantity: number;
  avg_purchase_price: number;
  purchase_date?: string;
  notes?: string;
}

export default function ImportCSVModal({
  visible,
  onClose,
  portfolioId,
  onSuccess,
}: ImportCSVModalProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedHolding[]>([]);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'select' | 'preview' | 'importing'>('select');

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
    success: '#10B981',
  };

  const parseCSV = (csvText: string): ParsedHolding[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required columns
    const requiredColumns = ['asset_type', 'symbol', 'name', 'quantity', 'purchase_price'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Parse data rows
    const holdings: ParsedHolding[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',').map(v => v.trim());
      if (values.length !== header.length) {
        throw new Error(`Row ${i}: Invalid number of columns`);
      }

      const row: any = {};
      header.forEach((col, index) => {
        row[col] = values[index];
      });

      // Validate asset type
      const validTypes = ['stock', 'mutual_fund', 'etf', 'bond'];
      if (!validTypes.includes(row.asset_type.toLowerCase())) {
        throw new Error(`Row ${i}: Invalid asset_type "${row.asset_type}". Must be: ${validTypes.join(', ')}`);
      }

      // Validate numeric fields
      const quantity = parseFloat(row.quantity);
      const purchasePrice = parseFloat(row.purchase_price);
      
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Row ${i}: Invalid quantity "${row.quantity}"`);
      }
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        throw new Error(`Row ${i}: Invalid purchase_price "${row.purchase_price}"`);
      }

      holdings.push({
        asset_type: row.asset_type.toLowerCase(),
        symbol: row.symbol.toUpperCase(),
        asset_name: row.name,
        quantity: quantity,
        avg_purchase_price: purchasePrice,
        purchase_date: row.purchase_date || row.date || new Date().toISOString().split('T')[0],
        notes: row.notes || null,
      });
    }

    return holdings;
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setLoading(true);
      setFileName(result.assets[0].name);

      // Read file content
      const response = await fetch(result.assets[0].uri);
      const csvText = await response.text();

      // Parse CSV
      try {
        const parsed = parseCSV(csvText);
        setParsedData(parsed);
        setStep('preview');
      } catch (parseError: any) {
        Alert.alert('CSV Parse Error', parseError.message);
        console.error('Parse error:', parseError);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to read file');
      console.error('Document picker error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      Alert.alert('Error', 'No data to import');
      return;
    }

    setStep('importing');
    setLoading(true);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < parsedData.length; i++) {
      const holding = parsedData[i];
      try {
        await PortfolioService.addHolding({
          portfolio_id: portfolioId,
          ...holding,
        });
        successCount++;
      } catch (error: any) {
        failCount++;
        errors.push(`${holding.symbol}: ${error.message}`);
        console.error(`Error importing ${holding.symbol}:`, error);
      }
    }

    setLoading(false);

    // Show result
    if (failCount === 0) {
      Alert.alert(
        'Success',
        `✅ Successfully imported ${successCount} holdings!`,
        [{ text: 'OK', onPress: () => {
          onSuccess();
          handleClose();
        }}]
      );
    } else {
      Alert.alert(
        'Import Complete',
        `✅ Imported: ${successCount}\n❌ Failed: ${failCount}\n\nErrors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`,
        [{ text: 'OK', onPress: () => {
          onSuccess();
          handleClose();
        }}]
      );
    }
  };

  const handleClose = () => {
    setStep('select');
    setParsedData([]);
    setFileName('');
    setLoading(false);
    onClose();
  };

  const renderSelectStep = () => (
    <View style={styles(colors).stepContainer}>
      <Text style={styles(colors).instructionTitle}>📄 Import Holdings from CSV</Text>
      
      <View style={styles(colors).instructionBox}>
        <Text style={styles(colors).instructionText}>
          Upload a CSV file with your holdings data.
        </Text>
      </View>

      <Text style={styles(colors).formatTitle}>Required CSV Format:</Text>
      <View style={styles(colors).codeBlock}>
        <Text style={styles(colors).codeText}>
          asset_type,symbol,name,quantity,purchase_price,purchase_date,notes
        </Text>
      </View>

      <Text style={styles(colors).exampleTitle}>Example Rows:</Text>
      <View style={styles(colors).codeBlock}>
        <Text style={styles(colors).codeText}>
          stock,RELIANCE,Reliance Industries,10,2400,2024-01-15,Long term{'\n'}
          stock,TCS,Tata Consultancy,5,3500,2023-11-20,{'\n'}
          mutual_fund,119551,HDFC Top 100,100,650.50,2023-06-01,SIP
        </Text>
      </View>

      <Text style={styles(colors).noteText}>
        📝 Note: purchase_date and notes are optional
      </Text>

      <TouchableOpacity
        style={styles(colors).pickButton}
        onPress={handlePickDocument}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles(colors).pickButtonText}>📂 Select CSV File</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles(colors).downloadButton}
        onPress={() => Alert.alert('Template', 'Download template feature coming soon!')}
      >
        <Text style={styles(colors).downloadButtonText}>⬇️ Download Template</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreviewStep = () => (
    <View style={styles(colors).stepContainer}>
      <Text style={styles(colors).instructionTitle}>📋 Preview Import</Text>
      
      <View style={styles(colors).fileInfo}>
        <Text style={styles(colors).fileInfoText}>
          File: {fileName}
        </Text>
        <Text style={styles(colors).fileInfoText}>
          Holdings: {parsedData.length}
        </Text>
      </View>

      <ScrollView style={styles(colors).previewList}>
        {parsedData.map((holding, index) => (
          <View key={index} style={styles(colors).previewItem}>
            <View style={styles(colors).previewHeader}>
              <Text style={styles(colors).previewSymbol}>{holding.symbol}</Text>
              <Text style={styles(colors).previewType}>{holding.asset_type.toUpperCase()}</Text>
            </View>
            <Text style={styles(colors).previewName}>{holding.asset_name}</Text>
            <Text style={styles(colors).previewDetails}>
              {holding.quantity} × ₹{holding.avg_purchase_price.toFixed(2)} = ₹{(holding.quantity * holding.avg_purchase_price).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles(colors).buttonRow}>
        <TouchableOpacity
          style={styles(colors).backButton}
          onPress={() => {
            setStep('select');
            setParsedData([]);
          }}
        >
          <Text style={styles(colors).backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(colors).importButton}
          onPress={handleImport}
          disabled={loading}
        >
          <Text style={styles(colors).importButtonText}>
            Import {parsedData.length} Holdings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImportingStep = () => (
    <View style={styles(colors).importingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles(colors).importingText}>Importing holdings...</Text>
      <Text style={styles(colors).importingSubText}>Please wait</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles(colors).overlay}>
        <View style={styles(colors).container}>
          {/* Header */}
          <View style={styles(colors).header}>
            <Text style={styles(colors).title}>Import from CSV</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Text style={styles(colors).closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content based on step */}
          {step === 'select' && renderSelectStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
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
    stepContainer: {
      padding: 20,
    },
    instructionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    instructionBox: {
      backgroundColor: colors.inputBg,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    instructionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    formatTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    codeBlock: {
      backgroundColor: '#1E293B',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    codeText: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#10B981',
    },
    exampleTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    noteText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    pickButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    pickButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    downloadButton: {
      backgroundColor: colors.inputBg,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    downloadButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    fileInfo: {
      backgroundColor: colors.primary + '15',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    fileInfoText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    previewList: {
      maxHeight: 300,
      marginBottom: 16,
    },
    previewItem: {
      backgroundColor: colors.inputBg,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    previewSymbol: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    previewType: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    previewName: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    previewDetails: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    backButton: {
      flex: 1,
      paddingVertical: 14,
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    importButton: {
      flex: 2,
      paddingVertical: 14,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
    },
    importButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    importingContainer: {
      padding: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    importingText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
    },
    importingSubText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

