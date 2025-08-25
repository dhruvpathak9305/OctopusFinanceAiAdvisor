import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDemoMode } from '../../../../contexts/DemoModeContext';
import { addAccount } from '../../../../services/accountsService';
import { Account } from '../../../../contexts/AccountsContext';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountAdded: (account: Account) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ 
  visible, 
  onClose, 
  onAccountAdded
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    danger: '#EF4444',
  } : {
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    danger: '#EF4444',
  };

  const accountTypes = [
    { id: 'checking', label: 'Checking Account', icon: 'card-outline' },
    { id: 'savings', label: 'Savings Account', icon: 'wallet-outline' },
    { id: 'investment', label: 'Investment Account', icon: 'trending-up-outline' },
    { id: 'business', label: 'Business Account', icon: 'business-outline' },
    { id: 'credit_union', label: 'Credit Union', icon: 'people-outline' },
    { id: 'other', label: 'Other', icon: 'ellipse-outline' },
  ];

  const popularInstitutions = [
    'Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank',
    'Capital One', 'US Bank', 'PNC Bank', 'TD Bank',
    'Ally Bank', 'Charles Schwab', 'Fidelity', 'Vanguard',
    'American Express', 'Discover', 'Barclays', 'HSBC'
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    if (!institution.trim()) {
      Alert.alert('Error', 'Please enter the financial institution');
      return;
    }

    if (!balance.trim() || isNaN(parseFloat(balance))) {
      Alert.alert('Error', 'Please enter a valid balance');
      return;
    }

    setLoading(true);
    try {
      const newAccount: Account = {
        id: 'temp-' + Date.now(), // Temporary ID that will be replaced by the service
        name: name.trim(),
        type,
        balance: parseFloat(balance),
        institution: institution.trim(),
        account_number: accountNumber.trim() || undefined,
      };

      const createdAccount = await addAccount(newAccount, isDemo);
      
      onAccountAdded(createdAccount);
      handleClose();
      
      Alert.alert('Success', 'Bank account added successfully!');
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to add bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setType('checking');
    setBalance('');
    setInstitution('');
    setAccountNumber('');
    setRoutingNumber('');
    onClose();
  };

  const formatAccountNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Limit to 17 digits (typical max for account numbers)
    const limited = cleaned.substring(0, 17);
    // Add spaces every 4 digits for readability
    return limited.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatRoutingNumber = (text: string) => {
    // Remove all non-numeric characters and limit to 9 digits
    const cleaned = text.replace(/\D/g, '').substring(0, 9);
    return cleaned;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Add Bank Account
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Account Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="My Checking Account"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Account Type and Institution Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Account Type</Text>
              <TouchableOpacity 
                style={[styles.selectButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowTypePicker(true)}
              >
                <View style={styles.selectContent}>
                  <Ionicons 
                    name={accountTypes.find(t => t.id === type)?.icon as any} 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text style={[styles.selectText, { color: colors.text }]} numberOfLines={1}>
                    {accountTypes.find(t => t.id === type)?.label || 'Select type'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Institution <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={[styles.selectButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowInstitutionPicker(true)}
              >
                <Text style={[styles.selectText, { color: institution ? colors.text : colors.textSecondary }]} numberOfLines={1}>
                  {institution || 'Select bank'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Current Balance */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Current Balance <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={balance}
                onChangeText={(text) => {
                  // Allow negative balances for checking accounts
                  const cleanedValue = text.replace(/[^0-9.-]/g, '');
                  const parts = cleanedValue.split('.');
                  if (parts.length > 2) {
                    setBalance(parts[0] + '.' + parts.slice(1).join(''));
                  } else {
                    setBalance(cleanedValue);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Account Details Section */}
          <View style={[styles.sectionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Account Details (Optional)
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              This information is encrypted and stored securely
            </Text>

            {/* Account Number */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Account Number</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="••••••••••••1234"
                placeholderTextColor={colors.textSecondary}
                value={accountNumber}
                onChangeText={(text) => setAccountNumber(formatAccountNumber(text))}
                keyboardType="numeric"
                secureTextEntry
                maxLength={20}
              />
            </View>

            {/* Routing Number */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Routing Number</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="123456789"
                placeholderTextColor={colors.textSecondary}
                value={routingNumber}
                onChangeText={(text) => setRoutingNumber(formatRoutingNumber(text))}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Adding...' : 'Add Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Account Type Picker Modal */}
        <Modal visible={showTypePicker} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setShowTypePicker(false)}>
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
                  <View style={[styles.pickerHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                      <Text style={[styles.pickerButton, { color: colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Account Type</Text>
                    <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                      <Text style={[styles.pickerButton, { color: colors.primary }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {accountTypes.map((accountType, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          setType(accountType.id);
                          setShowTypePicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          <Ionicons 
                            name={accountType.icon as any} 
                            size={20} 
                            color={colors.textSecondary} 
                          />
                          <Text style={[styles.pickerItemText, { color: colors.text }]}>
                            {accountType.label}
                          </Text>
                        </View>
                        {type === accountType.id && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Institution Picker Modal */}
        <Modal visible={showInstitutionPicker} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setShowInstitutionPicker(false)}>
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
                  <View style={[styles.pickerHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => setShowInstitutionPicker(false)}>
                      <Text style={[styles.pickerButton, { color: colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Institution</Text>
                    <TouchableOpacity onPress={() => setShowInstitutionPicker(false)}>
                      <Text style={[styles.pickerButton, { color: colors.primary }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {popularInstitutions.map((bank, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          setInstitution(bank);
                          setShowInstitutionPicker(false);
                        }}
                      >
                        <Text style={[styles.pickerItemText, { color: colors.text }]}>
                          {bank}
                        </Text>
                        {institution === bank && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  // Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContent: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerItemText: {
    fontSize: 16,
    flex: 1,
  },
  sectionContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 32,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AddAccountModal;
