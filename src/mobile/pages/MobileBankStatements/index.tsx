import React, { useState, ErrorInfo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BankStatementUploader from '../../components/BankStatementUploader';
import BankStatementErrorBoundary from '../../components/BankStatementUploader/BankStatementErrorBoundary';
import ParsedStatementViewer from '../../components/ParsedStatementViewer';
import { ParsedTransaction, ParsingOptions } from '../../types/bankStatement';
import BankStatementParserService, { DatabaseTransaction, DatabaseTransactionResult } from '../../../../services/bankStatementParserService';

const MobileBankStatements: React.FC = () => {
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [databaseTransactions, setDatabaseTransactions] = useState<DatabaseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsingStatus, setParsingStatus] = useState<string>('');
  const [isAIParsing, setIsAIParsing] = useState(false);
  const [parsingOptions, setParsingOptions] = useState<ParsingOptions>({
    autoCategorize: true,
    detectRecurring: false,
    mergeDuplicates: true,
    validateAmounts: true,
    useAI: true, // Enable AI parsing by default
  });
  
  // Mock user ID and account ID for demo purposes
  const mockUserId = 'demo-user-123';
  const mockSourceAccountId = 'demo-account-456';

  const handleFileUpload = async () => {
    try {
      setIsLoading(true);
      setUploadError(null);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file size (10MB limit)
      if (file.size && file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit. Please choose a smaller file.');
      }
      
      setUploadedFileName(file.name);
      
      // Parse the file using the parser service
      const parserService = BankStatementParserService.getInstance();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      let fileContent: string;
      
      try {
        fileContent = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } catch (readError) {
        throw new Error('Failed to read file. The file may be corrupted or in an unsupported format.');
      }
      
      // Check if it's a CSV file for AI parsing
      if (fileExtension === 'csv' && parsingOptions.useAI) {
        setIsAIParsing(true);
        setParsingStatus('🤖 AI is analyzing your CSV file...\nThis may take a few seconds.');
        
        // Parse with database format
        const databaseResult = await parserService.parseCSVForDatabase(
          fileContent,
          mockUserId,
          mockSourceAccountId,
          'bank',
          parsingOptions
        );
        
        if (databaseResult.success) {
          setDatabaseTransactions(databaseResult.transactions);
          setParsedData(databaseResult.transactions.map(txn => ({
            id: txn.id,
            date: txn.date,
            description: txn.name,
            amount: txn.amount,
            type: txn.type === 'income' ? 'credit' : 'debit',
            category: txn.metadata?.category || 'uncategorized',
            account: txn.source_account_name,
            merchant: txn.metadata?.merchant,
            reference: txn.metadata?.reference,
            balance: undefined
          })));
          
          setParsingStatus(`✅ AI successfully parsed ${databaseResult.transactions.length} transactions!`);
          
          Alert.alert(
            'AI Parse Successful', 
            `🤖 AI successfully extracted ${databaseResult.transactions.length} transactions from ${file.name}!\n\nAI provided intelligent categorization and merchant detection.`,
            [{ text: 'OK' }]
          );
        } else {
          throw new Error(databaseResult.errors?.join(', ') || 'Failed to parse the file with AI. Please check the format and try again.');
        }
      } else {
        // Use traditional parsing for non-CSV files or when AI is disabled
        setParsingStatus('📄 Parsing document...');
        
        const parsingResult = await parserService.parseStatement(
          fileContent,
          fileExtension,
          parsingOptions
        );
        
        if (parsingResult.success) {
          setParsedData(parsingResult.transactions);
          setParsingStatus(`✅ Successfully parsed ${parsingResult.transactions.length} transactions!`);
          
          Alert.alert(
            'Success', 
            `Successfully parsed ${parsingResult.transactions.length} transactions!`,
            [{ text: 'OK' }]
          );
        } else {
          throw new Error(parsingResult.errors?.join(', ') || 'Failed to parse the file. Please check the format and try again.');
        }
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload and parse the file. Please try again.';
      setUploadError(errorMessage);
      Alert.alert('Upload Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorBoundaryError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Error boundary caught error:', error, errorInfo);
    setUploadError(error.message);
  };

  const handleRetry = () => {
    setUploadError(null);
    setParsedData([]);
    setDatabaseTransactions([]);
    setUploadedFileName('');
    setParsingStatus('');
    setIsAIParsing(false);
  };

  const handleSaveTransactions = () => {
    if (databaseTransactions.length > 0) {
      Alert.alert(
        'Database Ready', 
        `🗄️ ${databaseTransactions.length} transactions are ready to save to your database!\n\n` +
        `These transactions are formatted according to your database schema and include:\n` +
        `• AI-powered categorization\n` +
        `• Proper data types and constraints\n` +
        `• Metadata for tracking\n` +
        `• Source account information`
      );
    } else {
      Alert.alert('Success', `${parsedData.length} transactions ready to save!`);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all parsed data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setParsedData([]);
            setDatabaseTransactions([]);
            setUploadedFileName('');
            setUploadError(null);
            setParsingStatus('');
            setIsAIParsing(false);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Bank Statements</Text>
          <Text style={styles.subtitle}>Upload and parse your bank statements</Text>
        </View>

        <BankStatementErrorBoundary onError={handleErrorBoundaryError}>
          <BankStatementUploader
            onUpload={handleFileUpload}
            isLoading={isLoading}
            fileName={uploadedFileName}
            showPlusIcons={true}
          />
        </BankStatementErrorBoundary>

        {/* AI Parsing Options */}
        <View style={styles.aiOptionsContainer}>
          <View style={styles.aiOptionsHeader}>
            <Ionicons name="sparkles-outline" size={20} color="#007AFF" />
            <Text style={styles.aiOptionsTitle}>AI-Powered Parsing</Text>
          </View>
          <View style={styles.aiOptionsContent}>
            <Text style={styles.aiOptionsDescription}>
              Use AI to intelligently parse and categorize your transactions
            </Text>
            <View style={styles.aiToggleContainer}>
              <Text style={styles.aiToggleLabel}>Enable AI Parsing</Text>
              <TouchableOpacity
                style={[
                  styles.aiToggle,
                  parsingOptions.useAI ? styles.aiToggleEnabled : styles.aiToggleDisabled
                ]}
                onPress={() => setParsingOptions(prev => ({ ...prev, useAI: !prev.useAI }))}
              >
                <View style={[
                  styles.aiToggleThumb,
                  parsingOptions.useAI ? styles.aiToggleThumbEnabled : styles.aiToggleThumbDisabled
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Parsing Status */}
        {parsingStatus && (
          <View style={styles.parsingStatusContainer}>
            <View style={styles.parsingStatusHeader}>
              {isAIParsing ? (
                <Ionicons name="sparkles" size={20} color="#007AFF" />
              ) : (
                <Ionicons name="information-circle" size={20} color="#6c757d" />
              )}
              <Text style={styles.parsingStatusTitle}>
                {isAIParsing ? 'AI Processing' : 'Parsing Status'}
              </Text>
            </View>
            <Text style={styles.parsingStatusText}>{parsingStatus}</Text>
          </View>
        )}

        {uploadError && (
          <View style={styles.errorContainer}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle-outline" size={24} color="#dc3545" />
              <Text style={styles.errorText}>{uploadError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Ionicons name="refresh-outline" size={16} color="white" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Parsing your statement...</Text>
          </View>
        )}

        {parsedData.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Parsed Transactions</Text>
              <Text style={styles.resultsCount}>{parsedData.length} transactions found</Text>
              
              <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
                <Ionicons name="trash-outline" size={16} color="#dc3545" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            <ParsedStatementViewer transactions={parsedData} />
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveTransactions}
            >
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Transactions</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    margin: 20,
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 8,
    padding: 16,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: '#721c24',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dc3545',
    gap: 4,
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // AI Options Styles
  aiOptionsContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  aiOptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  aiOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  aiOptionsContent: {
    gap: 12,
  },
  aiOptionsDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  aiToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  aiToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  aiToggleEnabled: {
    backgroundColor: '#007AFF',
  },
  aiToggleDisabled: {
    backgroundColor: '#e9ecef',
  },
  aiToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  aiToggleThumbEnabled: {
    backgroundColor: 'white',
    transform: [{ translateX: 22 }],
  },
  aiToggleThumbDisabled: {
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  
  // Parsing Status Styles
  parsingStatusContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  parsingStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  parsingStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  parsingStatusText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

export default MobileBankStatements;
