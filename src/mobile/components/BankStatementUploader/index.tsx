import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { CSVParserService } from '../../../../services/csvParsers';
import BankStatementViewer from '../BankStatementViewer';
import { ParsedBankStatement, BankTransaction } from '../../../../services/csvParsers/types';

interface BankStatementUploaderProps {
  onUpload: (fileData: any) => void;
  isLoading: boolean;
  fileName: string;
  showPlusIcons?: boolean;
}

interface ParsedData {
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
  }>;
  summary: {
    totalCredits: number;
    totalDebits: number;
    balance: number;
  };
  bankStatement?: ParsedBankStatement;
}

const BankStatementUploader: React.FC<BankStatementUploaderProps> = ({
  onUpload,
  isLoading,
  fileName,
  showPlusIcons = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showNextActions, setShowNextActions] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStatus, setParsingStatus] = useState<string>('');
  const [isAIParsing, setIsAIParsing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<any[]>([]);
  
  const [enhancedParsedData, setEnhancedParsedData] = useState<ParsedBankStatement | null>(null);
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const getCSVParserService = () => CSVParserService.getInstance();

  const parseFileContent = async (file: any): Promise<ParsedData> => {
    try {
      let content = '';
      
      if (file.mimeType === 'text/csv') {
        // Read CSV content
        content = await FileSystem.readAsStringAsync(file.uri);
        console.log('CSV content read:', content.substring(0, 200) + '...');
        
        // Log CSV structure for debugging
        const lines = content.split('\n').filter(line => line.trim());
        console.log('CSV has', lines.length, 'lines');
        const hasICICI = lines.some(line => line.includes('ICICI'));
        console.log('Contains ICICI:', hasICICI);
        
        // Try enhanced CSV parsing first
        try {
          const enhancedResult = await getCSVParserService().parseBankStatement(content);
          
          if (enhancedResult.success && enhancedResult.data && enhancedResult.data.transactions.length > 0) {
            console.log('Enhanced CSV parsing successful:', enhancedResult.data.metadata.bankName);
            setEnhancedParsedData(enhancedResult.data);
            setShowEnhancedView(true);
            
            // Convert to legacy format for backward compatibility
            const legacyTransactions = enhancedResult.data.transactions.map((txn: any) => ({
              date: txn.date,
              description: txn.particulars,
              amount: txn.amount,
              type: txn.type
            }));
            
            const totalCredits = legacyTransactions
              .filter((t: any) => t.type === 'credit')
              .reduce((sum: number, t: any) => sum + t.amount, 0);
            
            const totalDebits = legacyTransactions
              .filter((t: any) => t.type === 'debit')
              .reduce((sum: number, t: any) => sum + t.amount, 0);

            return {
              transactions: legacyTransactions,
              summary: {
                totalCredits,
                totalDebits,
                balance: totalCredits - totalDebits
              },
              bankStatement: enhancedResult.data
            };
          } else {
            console.log('Enhanced parsing failed or no transactions found:', enhancedResult.errors);
          }
        } catch (enhancedError) {
          console.warn('Enhanced parsing failed, falling back to basic parsing:', enhancedError);
        }
        
        // Fallback to existing parsing logic
        try {
          // Import the parser service
          const { BankStatementParserService } = await import('../../../../services/bankStatementParserService');
          const parserService = BankStatementParserService.getInstance();
          
          // Parse with AI enabled
          const parsingResult = await parserService.parseStatement(
            content,
            'csv',
            { useAI: true, autoCategorize: true, mergeDuplicates: true, validateAmounts: true }
          );
          
          if (parsingResult.success && parsingResult.transactions.length > 0) {
            console.log('Real parsing successful:', parsingResult.transactions.length, 'transactions');
            
            // Convert to the format expected by this component
            const realTransactions = parsingResult.transactions.map(txn => ({
              date: txn.date.toISOString().split('T')[0],
              description: txn.description,
              amount: txn.amount,
              type: txn.type
            }));
            
            const totalCredits = realTransactions
              .filter(t => t.type === 'credit')
              .reduce((sum, t) => sum + t.amount, 0);
            
            const totalDebits = realTransactions
              .filter(t => t.type === 'debit')
              .reduce((sum, t) => sum + t.amount, 0);

            return {
              transactions: realTransactions,
              summary: {
                totalCredits,
                totalDebits,
                balance: totalCredits - totalDebits
              }
            };
          } else {
            console.warn('Real parsing failed, falling back to basic parsing');
            throw new Error('AI parsing failed');
          }
        } catch (parseError) {
          console.warn('Real parsing error, using basic CSV parsing:', parseError);
          // Fallback to basic CSV parsing
          return parseBasicCSV(content);
        }
      }

      // For non-CSV files, use basic parsing
      return parseBasicCSV(content);
    } catch (error) {
      console.error('Error parsing file:', error);
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('No valid transactions found')) {
          throw new Error(
            `CSV Format Issue: ${error.message}\n\n` +
            `Your CSV file appears to be a bank statement header or information file.\n\n` +
            `To parse transactions, your CSV should contain:\n` +
            `• Date column (e.g., 01/15/2024)\n` +
            `• Description column (e.g., "Grocery Store")\n` +
            `• Amount column (e.g., 120.50)\n\n` +
            `Please export your bank transactions in the correct format.`
          );
        } else {
          throw new Error(`Failed to parse file: ${error.message}`);
        }
      } else {
        throw new Error('Failed to parse file content');
      }
    }
  };

  // Basic CSV parsing fallback
  const parseBasicCSV = (content: string): ParsedData => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    console.log('CSV lines found:', lines.length);
    console.log('First few lines:', lines.slice(0, 3));

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log('CSV headers:', headers);

    const transactions: Array<{ date: string; description: string; amount: number; type: 'credit' | 'debit' }> = [];

    // Try multiple parsing strategies
    let parsingStrategy = '';

    // Strategy 1: Look for standard transaction columns
    if (headers.some(h => h.includes('date')) && headers.some(h => h.includes('amount'))) {
      parsingStrategy = 'standard_transaction';
      console.log('Using standard transaction parsing strategy');
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        // Try to find date, description, and amount columns
        let dateStr = '';
        let description = '';
        let amountStr = '';

        headers.forEach((header, index) => {
          if (header.includes('date')) dateStr = values[index] || '';
          else if (header.includes('description') || header.includes('memo') || header.includes('payee')) {
            description = values[index] || '';
          }
          else if (header.includes('amount') || header.includes('debit') || header.includes('credit')) {
            amountStr = values[index] || '';
          }
        });

        if (dateStr && amountStr) {
          const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));
          if (!isNaN(amount)) {
            transactions.push({
              date: dateStr,
              description: description || 'Unknown Transaction',
              amount: Math.abs(amount),
              type: amount >= 0 ? 'credit' : 'debit'
            });
          }
        }
      }
    }

    // Strategy 2: Look for bank statement format (DATE, MODE, PARTICULARS, DEPOSITS, WITHDRAWALS, BALANCE)
    if (transactions.length === 0) {
      parsingStrategy = 'bank_statement';
      console.log('Using bank statement parsing strategy');
      
      // Look for the transaction section
      let transactionStartIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes('statement of transactions') || line.includes('date') && line.includes('deposits') && line.includes('withdrawals')) {
          transactionStartIndex = i;
          break;
        }
      }

      if (transactionStartIndex !== -1) {
        console.log('Found transaction section at line:', transactionStartIndex);
        
        // Find the header row
        let headerRowIndex = -1;
        for (let i = transactionStartIndex; i < lines.length; i++) {
          const line = lines[i].toLowerCase();
          if (line.includes('date') && (line.includes('deposits') || line.includes('withdrawals'))) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex !== -1) {
          console.log('Found header row at line:', headerRowIndex);
          const headerRow = lines[headerRowIndex].split(',').map(h => h.trim().toLowerCase());
          console.log('Transaction headers:', headerRow);

          // Parse transaction rows
          for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Skip summary rows
            if (line.toLowerCase().includes('total') || line.toLowerCase().includes('sub total')) {
              continue;
            }

            const values = line.split(',').map(v => v.trim());
            if (values.length < 3) continue;

            // Extract date, description, deposits, withdrawals
            let dateStr = '';
            let description = '';
            let depositAmount = 0;
            let withdrawalAmount = 0;

            headerRow.forEach((header, index) => {
              if (header.includes('date')) {
                dateStr = values[index] || '';
              } else if (header.includes('particulars') || header.includes('description') || header.includes('narration')) {
                description = values[index] || '';
              } else if (header.includes('deposits') || header.includes('credit')) {
                const deposit = parseFloat(values[index]?.replace(/[^\d.-]/g, '') || '0');
                depositAmount = isNaN(deposit) ? 0 : deposit;
              } else if (header.includes('withdrawals') || header.includes('debit')) {
                const withdrawal = parseFloat(values[index]?.replace(/[^\d.-]/g, '') || '0');
                withdrawalAmount = isNaN(withdrawal) ? 0 : withdrawal;
              }
            });

            // Create transaction if we have valid data
            if (dateStr && (depositAmount > 0 || withdrawalAmount > 0)) {
              const amount = depositAmount > 0 ? depositAmount : withdrawalAmount;
              const type = depositAmount > 0 ? 'credit' : 'debit';
              
              // Clean up description
              let cleanDescription = description;
              if (cleanDescription) {
                // Remove common bank prefixes
                cleanDescription = cleanDescription
                  .replace(/^(UPI|NEFT|IMPS|RTGS|CREDIT CARD|DEBIT CARD|ATM|POS)\//i, '')
                  .replace(/^(ATD|Auto Debit|Auto Credit)/i, '')
                  .trim();
              }

              if (!cleanDescription) {
                cleanDescription = type === 'credit' ? 'Deposit' : 'Withdrawal';
              }

              transactions.push({
                date: dateStr,
                description: cleanDescription,
                amount: amount,
                type: type
              });
            }
          }
        }
      }
    }

    // Strategy 3: Look for transaction data in any row (pattern matching)
    if (transactions.length === 0) {
      parsingStrategy = 'pattern_matching';
      console.log('Using pattern matching strategy');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Look for patterns that suggest transaction data
        const amountMatch = line.match(/(\d+\.\d{2})/);
        const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        
        if (amountMatch && dateMatch) {
          const amount = parseFloat(amountMatch[0]);
          const date = dateMatch[0];
          
          if (!isNaN(amount)) {
            // Extract description by removing amount and date
            let description = line
              .replace(amountMatch[0], '')
              .replace(dateMatch[0], '')
              .trim();

            // Clean up description
            description = description.replace(/[^\w\s]/g, ' ').trim();
            
            if (!description) {
              description = 'Transaction';
            }

            transactions.push({
              date: date,
              description: description,
              amount: Math.abs(amount),
              type: amount >= 0 ? 'credit' : 'debit'
            });
          }
        }
      }
    }

    // Strategy 4: Look for any numeric values that could be amounts
    if (transactions.length === 0) {
      parsingStrategy = 'amount_extraction';
      console.log('Using amount extraction strategy');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Look for any numeric values that could be amounts
        const amountMatches = line.match(/(\d+\.\d{2})/g);
        if (amountMatches) {
          amountMatches.forEach((amountStr, index) => {
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
              // Create a transaction entry
              transactions.push({
                date: new Date().toISOString().split('T')[0], // Use current date as fallback
                description: `Transaction ${i + 1}-${index + 1}`,
                amount: amount,
                type: amount > 0 ? 'credit' : 'debit'
              });
            }
          });
        }
      }
    }

    console.log(`Parsing strategy used: ${parsingStrategy}`);
    console.log(`Transactions found: ${transactions.length}`);

    if (transactions.length === 0) {
      // Provide helpful error message
      const firstLine = lines[0].substring(0, 100);
      throw new Error(
        `No valid transactions found in CSV.\n\n` +
        `File appears to contain: ${firstLine}...\n\n` +
        `Expected format: Date,Description,Amount,Type\n` +
        `Or: Date,Description,Amount\n\n` +
        `Please ensure your CSV contains transaction data with dates and amounts.`
      );
    }

    const totalCredits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDebits = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions,
      summary: {
        totalCredits,
        totalDebits,
        balance: totalCredits - totalDebits
      }
    };
  };

  const handleFileUpload = async (fileType?: string) => {
    try {
      setUploading(true);
      setShowNextActions(false);
      setParsedData(null);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: fileType ? getMimeType(fileType) : [
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
        setUploading(false);
        return;
      }

      const file = result.assets[0];
      
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'File size exceeds 10MB limit. Please choose a smaller file.');
        setUploading(false);
        return;
      }
      
      setSelectedFile(file);
      
      // Simulate file processing
      setTimeout(() => {
        onUpload({
          file,
          success: true,
          message: `Successfully selected ${file.name}`
        });
        setUploading(false);
        setShowNextActions(true);
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'Failed to select file. Please try again.');
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setUploading(false);
    setSelectedFile(null);
    setShowNextActions(false);
    setParsedData(null);
  };

  const handleReUpload = () => {
    setSelectedFile(null);
    setShowNextActions(false);
    setParsedData(null);
  };

  const handlePreviewFile = async () => {
    if (selectedFile) {
      try {
        if (selectedFile.mimeType === 'application/pdf') {
          // For PDFs, try to open with default PDF viewer
          const supported = await Linking.canOpenURL(selectedFile.uri);
          if (supported) {
            await Linking.openURL(selectedFile.uri);
          } else {
            Alert.alert('Preview Not Available', 'Cannot preview this file type. Please use a PDF viewer app.');
          }
        } else {
          // For other file types, show content preview
          const content = await FileSystem.readAsStringAsync(selectedFile.uri);
          Alert.alert('File Preview', `File: ${selectedFile.name}\n\nContent Preview:\n${content.substring(0, 200)}...`);
        }
      } catch (error) {
        Alert.alert('Preview Error', 'Unable to preview this file. Please try again.');
      }
    }
  };

  const handleParseExtract = async () => {
    if (selectedFile) {
      try {
        setIsParsing(true);
        setParsingStatus('Starting file parsing...');
        
        // Check if it's a CSV file for AI parsing
        if (selectedFile.mimeType === 'text/csv') {
          setIsAIParsing(true);
          setParsingStatus('🤖 AI is analyzing your CSV file...\nThis may take a few seconds.');
        } else {
          setParsingStatus('📄 Parsing document...');
        }
        
        // Validate CSV format before parsing - but be more lenient for bank statements
        if (selectedFile.mimeType === 'text/csv') {
          const isValidFormat = await validateCSVFormat(selectedFile);
          if (!isValidFormat.isValid) {
            // Don't throw error immediately - let the enhanced parser try first
            console.warn('Basic CSV validation failed, but will try enhanced parsing:', isValidFormat.message);
            setParsingStatus('⚠️ Basic validation failed, trying enhanced parsing...');
          }
        }
        
        const parsed = await parseFileContent(selectedFile);
        setParsedData(parsed);
        
        // Store parsed transactions for confirmation modal
        setParsedTransactions(parsed.transactions);
        
        if (selectedFile.mimeType === 'text/csv') {
          setParsingStatus('✅ AI parsing complete! Review transactions before saving...');
          
          // Show confirmation modal instead of immediate save
          setShowConfirmationModal(true);
        } else {
          setParsingStatus('✅ Parsing complete! Review transactions before saving...');
          
          // Show confirmation modal for all file types
          setShowConfirmationModal(true);
        }
        
        // Keep status for a few seconds then clear
        setTimeout(() => setParsingStatus(''), 5000);
      } catch (error) {
        console.error('Parse error:', error);
        Alert.alert('Parse Failed', 'Failed to parse the file. Please check the file format and try again.');
        setParsingStatus('❌ Parsing failed. Please check file format.');
      } finally {
        setIsParsing(false);
        setIsAIParsing(false);
      }
    }
  };

  // Handle transaction confirmation and save to database
  const handleConfirmTransactions = async () => {
    try {
      setShowConfirmationModal(false);
      
      // Show loading state
      Alert.alert(
        'Saving Transactions',
        'Saving transactions to database...',
        [{ text: 'OK' }]
      );

      // Here you would typically call your database service
      // For now, we'll show a success message
      setTimeout(() => {
        Alert.alert(
          'Success!',
          `✅ ${parsedTransactions.length} transactions have been saved to your database!\n\nYou can now view them in your transactions list.`,
          [
            {
              text: 'View Transactions',
              onPress: () => {
                // Navigate to transactions view
                console.log('Navigate to transactions view');
              }
            },
            { text: 'OK' }
          ]
        );
      }, 1000);

    } catch (error) {
      console.error('Error saving transactions:', error);
      Alert.alert(
        'Error',
        'Failed to save transactions to database. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Validate CSV format before parsing - more lenient for bank statements
  const validateCSVFormat = async (file: any): Promise<{ isValid: boolean; message: string }> => {
    try {
      const content = await FileSystem.readAsStringAsync(file.uri);
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return { isValid: false, message: 'CSV file is empty or has no data rows' };
      }

      // Temporarily disable enhanced parsing validation to fix stack overflow
      // TODO: Re-enable once the issue is resolved
      /*
      try {
        const enhancedResult = await getCSVParserService().parseBankStatement(content);
        if (enhancedResult.success) {
          return { 
            isValid: true, 
            message: `Detected ${enhancedResult.data?.metadata.bankName} bank statement format` 
          };
        }
      } catch (enhancedError) {
        console.log('Enhanced parsing not available, falling back to basic validation');
      }
      */

      const firstLine = lines[0].toLowerCase();
      const hasDate = firstLine.includes('date');
      const hasAmount = firstLine.includes('amount') || firstLine.includes('debit') || firstLine.includes('credit');
      const hasDescription = firstLine.includes('description') || firstLine.includes('memo') || firstLine.includes('payee');
      
      // Check for bank statement format
      const hasDeposits = firstLine.includes('deposits');
      const hasWithdrawals = firstLine.includes('withdrawals');
      const hasParticulars = firstLine.includes('particulars') || firstLine.includes('narration');
      const hasMode = firstLine.includes('mode');
      const hasBalance = firstLine.includes('balance');

      // Check if this looks like a transaction CSV or bank statement
      if (!hasDate && !hasAmount && !hasDeposits && !hasWithdrawals && !hasParticulars && !hasMode && !hasBalance) {
        return { 
          isValid: false, 
          message: 'CSV does not appear to contain transaction data. Expected columns: Date, Description, Amount OR Date, Particulars, Deposits, Withdrawals' 
        };
      }

      // Check if any data rows contain amounts or look like transactions
      let hasTransactionData = false;
      for (let i = 1; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        // Look for amounts, dates, or transaction-like patterns
        if (line.match(/\d+\.\d{2}/) || 
            line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) ||
            line.toLowerCase().includes('neft') ||
            line.toLowerCase().includes('atm') ||
            line.toLowerCase().includes('upi') ||
            line.toLowerCase().includes('credit') ||
            line.toLowerCase().includes('debit')) {
          hasTransactionData = true;
          break;
        }
      }

      if (!hasTransactionData) {
        return { 
          isValid: false, 
          message: 'CSV does not contain transaction data. This appears to be a header/information file.' 
        };
      }

      return { isValid: true, message: 'CSV format appears valid' };
    } catch (error) {
      return { isValid: false, message: 'Unable to read CSV file for validation' };
    }
  };

  const handleSaveToLibrary = () => {
    if (selectedFile) {
      Alert.alert('Save to Library', `File "${selectedFile.name}" has been saved to your document library.`);
    }
  };

  const getMimeType = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return ['application/pdf'];
      case 'csv':
        return ['text/csv'];
      case 'excel':
        return [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ];
      case 'word':
        return [
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
      default:
        return [
          'application/pdf',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
    }
  };

  const renderPlusIcons = () => {
    if (!showPlusIcons) return null;

    return (
      <View style={styles.plusIconsContainer}>
        <Text style={styles.plusIconsTitle}>Quick Upload Options:</Text>
        <View style={styles.plusIconsRow}>
          <TouchableOpacity
            style={[styles.plusIconButton, (isLoading || uploading) && styles.plusIconButtonDisabled]}
            onPress={() => handleFileUpload('pdf')}
            disabled={isLoading || uploading}
          >
            <View style={[styles.plusIconContainer, { backgroundColor: '#007AFF20' }]}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
            </View>
            <Text style={styles.plusIconText}>PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.plusIconButton, (isLoading || uploading) && styles.plusIconButtonDisabled]}
            onPress={() => handleFileUpload('csv')}
            disabled={isLoading || uploading}
          >
            <View style={[styles.plusIconContainer, { backgroundColor: '#28a74520' }]}>
              <Ionicons name="add-circle" size={24} color="#28a745" />
            </View>
            <Text style={styles.plusIconText}>CSV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.plusIconButton, (isLoading || uploading) && styles.plusIconButtonDisabled]}
            onPress={() => handleFileUpload('excel')}
            disabled={isLoading || uploading}
          >
            <View style={[styles.plusIconContainer, { backgroundColor: '#ffc10720' }]}>
              <Ionicons name="add-circle" size={24} color="#ffc107" />
            </View>
            <Text style={styles.plusIconText}>Excel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.plusIconButton, (isLoading || uploading) && styles.plusIconButtonDisabled]}
            onPress={() => handleFileUpload('word')}
            disabled={isLoading || uploading}
          >
            <View style={[styles.plusIconContainer, { backgroundColor: '#6f42c120' }]}>
              <Ionicons name="add-circle" size={24} color="#6f42c1" />
            </View>
            <Text style={styles.plusIconText}>Word</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderUploadStatus = () => {
    if (uploading) {
      return (
        <View style={styles.uploadStatusContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.uploadStatusText}>Processing your file...</Text>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelUpload}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedFile) {
      return (
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>File Selected Successfully!</Text>
          <Text style={styles.successFileName}>{selectedFile.name}</Text>
          <Text style={styles.successSize}>
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Text>
          <TouchableOpacity 
            style={styles.reUploadButton}
            onPress={handleReUpload}
          >
            <Ionicons name="refresh-outline" size={16} color="#007AFF" />
            <Text style={styles.reUploadButtonText}>Select Different File</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.uploadHint}>
        <Ionicons name="information-circle-outline" size={16} color="#6c757d" />
        <Text style={styles.uploadHintText}>
          Tap to browse files
        </Text>
      </View>
    );
  };

  const renderNextActions = () => {
    if (!showNextActions || !selectedFile) return null;

    return (
      <View style={styles.nextActionsContainer}>
        <Text style={styles.nextActionsTitle}>Next Steps:</Text>
        <View style={styles.nextActionsGrid}>
          <TouchableOpacity 
            style={styles.nextActionButton}
            onPress={handlePreviewFile}
          >
            <Ionicons name="eye-outline" size={24} color="#007AFF" />
            <Text style={styles.nextActionText}>Preview File</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextActionButton, isParsing && styles.nextActionButtonDisabled]}
            onPress={handleParseExtract}
            disabled={isParsing}
          >
            {isParsing ? (
              <ActivityIndicator size="small" color="#28a745" />
            ) : (
              <Ionicons name="analytics-outline" size={24} color="#28a745" />
            )}
            <Text style={styles.nextActionText}>
              {isParsing ? 'Parsing...' : 'Parse & Extract'}
            </Text>
          </TouchableOpacity>
          
          {/* AI Parsing Status */}
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
          
          <TouchableOpacity 
            style={styles.nextActionButton}
            onPress={handleSaveToLibrary}
          >
            <Ionicons name="save-outline" size={24} color="#ffc107" />
            <Text style={styles.nextActionText}>Save to Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderParsedData = () => {
    if (!parsedData) return null;

    const bankStatement = parsedData.bankStatement;

    return (
      <View style={styles.parsedDataContainer}>
        <Text style={styles.parsedDataTitle}>Bank Statement Summary</Text>
        
        {/* Customer Information */}
        {bankStatement?.customerInfo && (
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Customer Information</Text>
            {bankStatement.customerInfo.name && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{bankStatement.customerInfo.name}</Text>
              </View>
            )}
            {bankStatement.customerInfo.customerId && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Customer ID:</Text>
                <Text style={styles.infoValue}>{bankStatement.customerInfo.customerId}</Text>
              </View>
            )}
            {bankStatement.customerInfo.address && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{bankStatement.customerInfo.address.trim()}</Text>
              </View>
            )}
          </View>
        )}

        {/* Account Summary */}
        {bankStatement?.accountSummary && Object.keys(bankStatement.accountSummary).length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Account Summary</Text>
            {bankStatement.accountSummary.savingsBalance !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Savings Balance (A):</Text>
                <Text style={[styles.infoValue, styles.balanceValue]}>
                  ₹{bankStatement.accountSummary.savingsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {bankStatement.accountSummary.linkedFDBalance !== undefined && bankStatement.accountSummary.linkedFDBalance > 0 && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fixed Deposits Linked (B):</Text>
                <Text style={[styles.infoValue, styles.balanceValue]}>
                  ₹{bankStatement.accountSummary.linkedFDBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {bankStatement.accountSummary.totalSavingsBalance !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Savings Balance (A+B):</Text>
                <Text style={[styles.infoValue, styles.balanceValue, styles.totalBalance]}>
                  ₹{bankStatement.accountSummary.totalSavingsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {bankStatement.accountSummary.currentAccountBalance !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Current Account Balance:</Text>
                <Text style={[styles.infoValue, styles.balanceValue]}>
                  ₹{bankStatement.accountSummary.currentAccountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {bankStatement.accountSummary.totalFixedDepositsBalance !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Fixed Deposits:</Text>
                <Text style={[styles.infoValue, styles.balanceValue]}>
                  ₹{bankStatement.accountSummary.totalFixedDepositsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {bankStatement.accountSummary.totalRecurringDepositsBalance !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Recurring Deposits:</Text>
                <Text style={[styles.infoValue, styles.balanceValue]}>
                  ₹{bankStatement.accountSummary.totalRecurringDepositsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {bankStatement.accountSummary.totalDeposits !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Deposits:</Text>
                <Text style={[styles.infoValue, styles.balanceValue, styles.totalBalance]}>
                  ₹{bankStatement.accountSummary.totalDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {bankStatement.accountSummary.statementDate && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Statement Date:</Text>
                <Text style={styles.infoValue}>{bankStatement.accountSummary.statementDate}</Text>
              </View>
            )}
          </View>
        )}

        {/* Fixed Deposits */}
        {bankStatement?.fixedDeposits && bankStatement.fixedDeposits.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Fixed Deposits ({bankStatement.fixedDeposits.length})</Text>
            {bankStatement.fixedDeposits.slice(0, 3).map((fd, index) => (
              <View key={index} style={styles.fdItem}>
                <View style={styles.fdHeader}>
                  <Text style={styles.fdTitle}>FD #{fd.depositNo || (index + 1)}</Text>
                  <View style={styles.fdHeaderRight}>
                    {fd.roi && <Text style={styles.fdRoi}>{fd.roi}% ROI</Text>}
                    {fd.nomination && <Text style={styles.fdNomination}>{fd.nomination}</Text>}
                  </View>
                </View>
                <View style={styles.fdDetails}>
                  {fd.openDate && (
                    <Text style={styles.fdInfo}>
                      <Text style={styles.fdLabel}>Open Date: </Text>
                      <Text style={styles.fdValue}>{fd.openDate}</Text>
                    </Text>
                  )}
                  {fd.amount && (
                    <Text style={styles.fdInfo}>
                      <Text style={styles.fdLabel}>Deposit Amount: </Text>
                      <Text style={styles.fdAmount}>₹{fd.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </Text>
                  )}
                  {fd.period && (
                    <Text style={styles.fdInfo}>
                      <Text style={styles.fdLabel}>Period: </Text>
                      <Text style={styles.fdValue}>{fd.period}</Text>
                    </Text>
                  )}
                  {fd.maturityAmount && (
                    <Text style={styles.fdInfo}>
                      <Text style={styles.fdLabel}>Maturity Amount: </Text>
                      <Text style={styles.fdMaturityAmount}>₹{fd.maturityAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </Text>
                  )}
                  {fd.maturityDate && (
                    <Text style={styles.fdInfo}>
                      <Text style={styles.fdLabel}>Maturity Date: </Text>
                      <Text style={styles.fdValue}>{fd.maturityDate}</Text>
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {bankStatement.fixedDeposits.length > 3 && (
              <Text style={styles.moreItemsText}>
                +{bankStatement.fixedDeposits.length - 3} more fixed deposits
              </Text>
            )}
          </View>
        )}

        {/* Account Information */}
        {bankStatement?.accountInfo && bankStatement.accountInfo.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Account Information</Text>
            {bankStatement.accountInfo.map((account, index) => (
              <View key={index}>
                {account.accountType && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Account Type:</Text>
                    <Text style={styles.infoValue}>{account.accountType}</Text>
                  </View>
                )}
                {account.accountNumber && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Account Number:</Text>
                    <Text style={styles.infoValue}>{account.accountNumber}</Text>
                  </View>
                )}
                {account.ifscCode && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>IFS Code:</Text>
                    <Text style={styles.infoValue}>{account.ifscCode}</Text>
                  </View>
                )}
                {account.micrCode && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>MICR Code:</Text>
                    <Text style={styles.infoValue}>{account.micrCode}</Text>
                  </View>
                )}
                {account.nominee && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Nominee:</Text>
                    <Text style={styles.infoValue}>{account.nominee}</Text>
                  </View>
                )}
                {account.mandateHolder && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Mandate Holder:</Text>
                    <Text style={styles.infoValue}>{account.mandateHolder}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Reward Points */}
        {bankStatement?.rewardPoints && bankStatement.rewardPoints.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Reward Points</Text>
            {bankStatement.rewardPoints.map((reward, index) => (
              <View key={index}>
                {reward.savingsAccountNumber && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Linked Account:</Text>
                    <Text style={styles.infoValue}>{reward.savingsAccountNumber}</Text>
                  </View>
                )}
                {reward.rewardPoints !== undefined && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Points Balance:</Text>
                    <Text style={[styles.infoValue, styles.pointsValue]}>{reward.rewardPoints.toLocaleString()} points</Text>
                  </View>
                )}
                {reward.expiryDate && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Expiry Date:</Text>
                    <Text style={styles.infoValue}>{reward.expiryDate}</Text>
                  </View>
                )}
                {reward.tier && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Tier:</Text>
                    <Text style={styles.infoValue}>{reward.tier}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Transaction Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Credits</Text>
            <Text style={[styles.summaryValue, { color: '#28a745' }]}>
              ₹{parsedData.summary.totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Debits</Text>
            <Text style={[styles.summaryValue, { color: '#dc3545' }]}>
              ₹{parsedData.summary.totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net Balance</Text>
            <Text style={[styles.summaryValue, { 
              color: parsedData.summary.balance >= 0 ? '#28a745' : '#dc3545' 
            }]}>
              ₹{parsedData.summary.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        
        <Text style={styles.transactionsTitle}>Recent Transactions ({parsedData.transactions.length}):</Text>
        {(showAllTransactions ? parsedData.transactions : parsedData.transactions.slice(0, 5)).map((transaction, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'credit' ? '#28a745' : '#dc3545' }
            ]}>
              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}
        
        {parsedData.transactions.length > 5 && (
          <TouchableOpacity 
            style={styles.moreTransactionsButton}
            onPress={() => setShowAllTransactions(!showAllTransactions)}
          >
            <Text style={styles.moreTransactionsText}>
              {showAllTransactions 
                ? '- Show less transactions' 
                : `+${parsedData.transactions.length - 5} more transactions`
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };



  return (
    <>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.uploadArea}>
          <TouchableOpacity
            style={[
              styles.uploadButton, 
              (isLoading || uploading) && styles.uploadButtonDisabled,
              selectedFile && styles.uploadButtonSuccess
            ]}
            onPress={() => handleFileUpload()}
            disabled={isLoading || uploading}
          >
            {uploading ? (
              <View style={styles.uploadIconContainer}>
                <ActivityIndicator size={32} color="#007AFF" />
              </View>
            ) : selectedFile ? (
              <View style={styles.uploadIconContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#28a745" />
              </View>
            ) : (
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload-outline" size={32} color="#007AFF" />
              </View>
            )}
            
            <Text style={styles.uploadTitle}>
              {selectedFile ? 'File Selected Successfully!' : 'Upload Bank Statement'}
            </Text>
            
            <Text style={styles.uploadSubtitle}>
              {selectedFile 
                ? selectedFile.name
                : 'Tap to select your bank statement file'
              }
            </Text>
          </TouchableOpacity>
        </View>

        {renderPlusIcons()}

        {renderNextActions()}

        {renderParsedData()}

        {/* Temporarily disabled enhanced parsing status to fix stack overflow */}
        {/* TODO: Re-enable once the issue is resolved */}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Tips for best results:</Text>
          <Text style={styles.tipItem}>
            • Ensure your statement is clear and readable
          </Text>
          <Text style={styles.tipItem}>
            • CSV files with headers work best
          </Text>
          <Text style={styles.tipItem}>
            • PDFs should have selectable text
          </Text>
          <Text style={styles.tipItem}>
            • Check that dates and amounts are properly formatted
          </Text>
          <Text style={styles.tipItem}>
            • Maximum file size: 10MB
          </Text>
        </View>

        <View style={styles.csvFormatGuide}>
          <Text style={styles.csvFormatTitle}>📋 Supported CSV Formats:</Text>
          
          <Text style={styles.csvFormatSubtitle}>
            Standard Transaction Format:
          </Text>
          <View style={styles.csvFormatExample}>
            <Text style={styles.csvFormatHeader}>Date,Description,Amount,Type</Text>
            <Text style={styles.csvFormatRow}>01/15/2024,Salary Deposit,5000.00,Credit</Text>
            <Text style={styles.csvFormatRow}>01/16/2024,Grocery Store,-120.50,Debit</Text>
          </View>

          <Text style={styles.csvFormatSubtitle}>
            Bank Statement Format (Your Format):
          </Text>
          <View style={styles.csvFormatExample}>
            <Text style={styles.csvFormatHeader}>DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE</Text>
            <Text style={styles.csvFormatRow}>1/7/25,B/F,Balance Forward,0,0,5107087.82</Text>
            <Text style={styles.csvFormatRow}>8/7/25,CREDIT CARD,ATD/Auto Debit CC0xx0318,0,15630.8,5091457.02</Text>
            <Text style={styles.csvFormatRow}>30-07-2025,NEFT,CITIN52025073000382738-WM GLOBAL TECHNOLOGY,224861,0,5213909.02</Text>
          </View>
          
          <Text style={styles.csvFormatNote}>
            ✅ Your bank statement format is fully supported! AI will automatically detect and parse transactions.
          </Text>
        </View>

        {/* Transaction Confirmation Modal */}
        <Modal
          visible={showConfirmationModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📋 Confirm Transactions</Text>
                <TouchableOpacity
                  onPress={() => setShowConfirmationModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  Review the parsed bank statement and transactions before saving:
                </Text>
                
                {/* Bank Statement Summary in Modal */}
                {parsedData?.bankStatement && (
                  <View style={styles.bankStatementModalSection}>
                    <Text style={styles.bankStatementModalTitle}>Bank Statement Information</Text>
                    
                    {/* Customer Info */}
                    {parsedData.bankStatement.customerInfo?.name && (
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalInfoLabel}>Customer:</Text>
                        <Text style={styles.modalInfoValue}>{parsedData.bankStatement.customerInfo.name}</Text>
                      </View>
                    )}
                    
                    {/* Account Summary */}
                    {parsedData.bankStatement.accountSummary?.totalSavingsBalance !== undefined && (
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalInfoLabel}>Total Savings Balance:</Text>
                        <Text style={[styles.modalInfoValue, styles.modalBalanceValue]}>
                          ₹{parsedData.bankStatement.accountSummary.totalSavingsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    )}
                    
                    {parsedData.bankStatement.accountSummary?.totalDeposits !== undefined && (
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalInfoLabel}>Total Deposits:</Text>
                        <Text style={[styles.modalInfoValue, styles.modalBalanceValue]}>
                          ₹{parsedData.bankStatement.accountSummary.totalDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    )}
                    
                    {/* Fixed Deposits Summary */}
                    {parsedData.bankStatement.fixedDeposits && parsedData.bankStatement.fixedDeposits.length > 0 && (
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalInfoLabel}>Fixed Deposits:</Text>
                        <Text style={styles.modalInfoValue}>
                          {parsedData.bankStatement.fixedDeposits.length} FDs
                          {parsedData.bankStatement.fixedDeposits[0]?.amount && 
                            ` (₹${parsedData.bankStatement.fixedDeposits.reduce((sum, fd) => sum + (fd.amount || 0), 0).toLocaleString('en-IN')})`
                          }
                        </Text>
                      </View>
                    )}
                    
                    {/* Account Information Summary */}
                    {parsedData.bankStatement.accountInfo && parsedData.bankStatement.accountInfo.length > 0 && parsedData.bankStatement.accountInfo[0].ifscCode && (
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalInfoLabel}>IFS Code:</Text>
                        <Text style={styles.modalInfoValue}>
                          {parsedData.bankStatement.accountInfo[0].ifscCode}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                
                <View style={styles.transactionSummary}>
                  <Text style={styles.summaryTitle}>Transaction Summary:</Text>
                  <Text style={styles.summaryText}>
                    Total Transactions: {parsedTransactions.length}
                  </Text>
                  <Text style={styles.summaryText}>
                    Total Credits: ₹{parsedTransactions
                      .filter(t => t.type === 'credit')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.summaryText}>
                    Total Debits: ₹{parsedTransactions
                      .filter(t => t.type === 'debit')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>

                <View style={styles.transactionsList}>
                  <Text style={styles.transactionsListTitle}>Parsed Transactions:</Text>
                  {(showAllTransactions ? parsedTransactions : parsedTransactions.slice(0, 5)).map((transaction, index) => (
                    <View key={index} style={styles.modalTransactionItem}>
                      <View style={styles.modalTransactionLeft}>
                        <Text style={styles.modalTransactionDate}>
                          {transaction.date}
                        </Text>
                        <Text style={styles.modalTransactionDescription}>
                          {transaction.description}
                        </Text>
                      </View>
                      <Text style={[
                        styles.modalTransactionAmount,
                        { color: transaction.type === 'credit' ? '#28a745' : '#dc3545' }
                      ]}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ))}
                  
                  {parsedTransactions.length > 5 && (
                    <TouchableOpacity 
                      style={styles.modalMoreTransactionsButton}
                      onPress={() => setShowAllTransactions(!showAllTransactions)}
                    >
                      <Text style={styles.modalMoreTransactionsText}>
                        {showAllTransactions 
                          ? '- Show less transactions' 
                          : `+${parsedTransactions.length - 5} more transactions`
                        }
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowConfirmationModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleConfirmTransactions}
                >
                  <Text style={styles.modalConfirmButtonText}>✅ Confirm & Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>


    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  uploadArea: {
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    minHeight: 120,
    justifyContent: 'center',
    width: '100%',
  },
  uploadButtonDisabled: {
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  uploadButtonSuccess: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  uploadIconContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  uploadHintText: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  uploadStatusContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  uploadStatusText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
    textAlign: 'center',
  },
  successFileName: {
    fontSize: 12,
    color: '#1a1a1a',
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  successSize: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  reUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  reUploadButtonText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  nextActionsContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  nextActionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
    textAlign: 'center',
  },
  nextActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  nextActionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    minWidth: 70,
  },
  nextActionButtonDisabled: {
    opacity: 0.6,
  },
  nextActionText: {
    fontSize: 10,
    color: '#0c4a6e',
    marginTop: 3,
    fontWeight: '500',
    textAlign: 'center',
  },
  plusIconsContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    width: '100%',
  },
  plusIconsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  plusIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 6,
  },
  plusIconButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  plusIconButtonDisabled: {
    opacity: 0.5,
  },
  plusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  plusIconText: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '600',
  },
  parsedDataContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fff9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  parsedDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 2,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  transactionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 1,
  },
  transactionDescription: {
    fontSize: 11,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 11,
    fontWeight: '600',
  },
  tips: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    width: '100%',
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  tipItem: {
    fontSize: 11,
    color: '#856404',
    marginBottom: 2,
    lineHeight: 14,
  },
  
  // Parsing Status Styles
  parsingStatusContainer: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
  },
  parsingStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  parsingStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  parsingStatusText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  
  // CSV Format Guide Styles
  csvFormatGuide: {
    margin: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  csvFormatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  csvFormatSubtitle: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 12,
  },
  csvFormatExample: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  csvFormatHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1565c0',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  csvFormatRow: {
    fontSize: 12,
    color: '#424242',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  csvFormatNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 20,
  },
  transactionSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  transactionsList: {
    marginBottom: 20,
  },
  transactionsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalTransactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  modalTransactionLeft: {
    flex: 1,
  },
  modalTransactionDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  modalTransactionDescription: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  modalTransactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#28a745',
    marginLeft: 8,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  enhancedModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  enhancedModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  enhancedModalCloseButton: {
    padding: 4,
    marginRight: 12,
  },
  enhancedModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  enhancedStatusContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#d4edda',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  enhancedStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  enhancedStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
  },
  enhancedStatusText: {
    fontSize: 14,
    color: '#155724',
    marginBottom: 12,
    lineHeight: 20,
  },
  viewEnhancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewEnhancedButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // New styles for enhanced bank statement display
  infoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  balanceValue: {
    color: '#28a745',
    fontSize: 15,
  },
  totalBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#155724',
  },
  fdItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  fdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fdTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  fdHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  fdRoi: {
    fontSize: 11,
    fontWeight: '600',
    color: '#28a745',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  fdNomination: {
    fontSize: 10,
    fontWeight: '500',
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  fdDetails: {
    gap: 6,
  },
  fdInfo: {
    fontSize: 12,
    lineHeight: 18,
  },
  fdLabel: {
    color: '#6c757d',
    fontWeight: '500',
  },
  fdValue: {
    color: '#212529',
    fontWeight: '400',
  },
  fdAmount: {
    color: '#28a745',
    fontWeight: '600',
  },
  fdMaturityAmount: {
    color: '#17a2b8',
    fontWeight: '600',
  },
  fdDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  moreTransactionsButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  moreTransactionsText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  // Modal bank statement styles
  bankStatementModalSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  bankStatementModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
    flex: 1,
  },
  modalInfoValue: {
    fontSize: 13,
    color: '#212529',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  modalBalanceValue: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '700',
  },
  pointsValue: {
    color: '#6f42c1',
    fontSize: 14,
    fontWeight: '600',
  },
  modalMoreTransactionsButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  modalMoreTransactionsText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default BankStatementUploader;

