import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OpenAIService from '../services/openaiService';
import { ParsedTransaction } from '../src/mobile/types/bankStatement';

const OpenAIDemo: React.FC = () => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [parsingResult, setParsingResult] = useState<string>('');

  const sampleCSV = `Date,Description,Amount,Type
2024-01-15,Salary Deposit,5000.00,Credit
2024-01-16,Grocery Store,-120.50,Debit
2024-01-17,Gas Station,-45.00,Debit
2024-01-18,Online Purchase,-89.99,Debit
2024-01-19,Interest Credit,12.45,Credit`;

  const handleLoadSample = () => {
    setCsvContent(sampleCSV);
  };

  const handleParse = async () => {
    if (!csvContent.trim()) {
      Alert.alert('Error', 'Please enter CSV content to parse');
      return;
    }

    setIsParsing(true);
    setParsedTransactions([]);
    setParsingResult('');

    try {
      const openaiService = OpenAIService.getInstance();
      
      // Check service status
      const status = openaiService.getStatus();
      console.log('OpenAI Service Status:', status);

      if (!status.available) {
        setParsingResult('OpenAI service not available. Check configuration.');
        return;
      }

      const result = await openaiService.parseCSVWithAI(csvContent, 'demo_statement.csv');
      
      if (result.success) {
        setParsedTransactions(result.transactions);
        setParsingResult(`✅ Successfully parsed ${result.transactions.length} transactions using AI!`);
      } else {
        setParsingResult(`❌ AI parsing failed: ${result.error}\n🔄 Fallback used: ${result.fallbackUsed}`);
      }
    } catch (error) {
      console.error('Parsing error:', error);
      setParsingResult(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleClear = () => {
    setCsvContent('');
    setParsedTransactions([]);
    setParsingResult('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={32} color="#007AFF" />
        <Text style={styles.title}>OpenAI Integration Demo</Text>
        <Text style={styles.subtitle}>
          Test AI-powered CSV parsing for bank statements
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CSV Content</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={8}
          placeholder="Enter CSV content here..."
          value={csvContent}
          onChangeText={setCsvContent}
          textAlignVertical="top"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleLoadSample}>
            <Ionicons name="document-outline" size={16} color="white" />
            <Text style={styles.buttonText}>Load Sample</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleClear}>
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.parseButton, isParsing && styles.parseButtonDisabled]}
          onPress={handleParse}
          disabled={isParsing}
        >
          {isParsing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="rocket-outline" size={20} color="white" />
          )}
          <Text style={styles.parseButtonText}>
            {isParsing ? 'Parsing...' : 'Parse with AI'}
          </Text>
        </TouchableOpacity>
      </View>

      {parsingResult && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Parsing Result</Text>
          <Text style={styles.resultText}>{parsingResult}</Text>
        </View>
      )}

      {parsedTransactions.length > 0 && (
        <View style={styles.transactionsSection}>
          <Text style={styles.transactionsTitle}>
            Parsed Transactions ({parsedTransactions.length})
          </Text>
          {parsedTransactions.map((transaction, index) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionIndex}>#{index + 1}</Text>
                <Text style={[
                  styles.transactionType,
                  { color: transaction.type === 'credit' ? '#28a745' : '#dc3545' }
                ]}>
                  {transaction.type.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.transactionDescription}>
                {transaction.description}
              </Text>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDate}>
                  {transaction.date.toDateString()}
                </Text>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'credit' ? '#28a745' : '#dc3545' }
                ]}>
                  ${transaction.amount.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.transactionCategory}>
                Category: {transaction.category}
              </Text>
              {transaction.merchant && (
                <Text style={styles.transactionMerchant}>
                  Merchant: {transaction.merchant}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ How it works</Text>
        <Text style={styles.infoText}>
          1. Enter CSV content in the text area above{'\n'}
          2. Click "Parse with AI" to send to OpenAI{'\n'}
          3. AI analyzes the content and extracts transactions{'\n'}
          4. Results are displayed with automatic categorization{'\n'}
          5. If AI fails, traditional parsing is used as fallback
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  section: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  parseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  parseButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  parseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  transactionsSection: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  transactionItem: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  transactionType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  transactionMerchant: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoSection: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

export default OpenAIDemo;

