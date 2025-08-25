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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDemoMode } from '../../../../contexts/DemoModeContext';
import { addCreditCard, CreditCard } from '../../../../services/creditCardService';

interface AddCreditCardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreditCardAdded: (creditCard: CreditCard) => void;
}

const AddCreditCardModal: React.FC<AddCreditCardModalProps> = ({ 
  visible, 
  onClose, 
  onCreditCardAdded
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();
  
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [billingCycle, setBillingCycle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [showBillingCyclePicker, setShowBillingCyclePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const creditCardProviders = [
    'Visa', 'Mastercard', 'American Express', 'Discover',
    'Chase', 'Capital One', 'Citi', 'Bank of America',
    'Wells Fargo', 'US Bank', 'Barclays', 'Other'
  ];

  const billingCycles = [
    '1st of month', '15th of month', '28th of month',
    'Every 30 days', 'Custom'
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }

    if (!institution.trim()) {
      Alert.alert('Error', 'Please select or enter the card issuer');
      return;
    }

    if (!lastFourDigits.trim() || lastFourDigits.length !== 4 || isNaN(Number(lastFourDigits))) {
      Alert.alert('Error', 'Please enter the last 4 digits of your card');
      return;
    }

    if (!creditLimit.trim() || isNaN(parseFloat(creditLimit)) || parseFloat(creditLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid credit limit');
      return;
    }

    if (!currentBalance.trim() || isNaN(parseFloat(currentBalance))) {
      Alert.alert('Error', 'Please enter a valid current balance');
      return;
    }

    if (parseFloat(currentBalance) > parseFloat(creditLimit)) {
      Alert.alert('Error', 'Current balance cannot exceed credit limit');
      return;
    }

    setLoading(true);
    try {
      const newCreditCard: Omit<CreditCard, 'id'> = {
        name: name.trim(),
        institution: institution.trim(),
        lastFourDigits: Number(lastFourDigits),
        creditLimit: parseFloat(creditLimit),
        currentBalance: parseFloat(currentBalance),
        dueDate: dueDate.toISOString().split('T')[0],
        billingCycle: billingCycle.trim() || undefined,
      };

      const createdCreditCard = await addCreditCard(newCreditCard, isDemo);
      
      onCreditCardAdded(createdCreditCard);
      handleClose();
      
      Alert.alert('Success', 'Credit card added successfully!');
    } catch (error) {
      console.error('Error creating credit card:', error);
      Alert.alert('Error', 'Failed to add credit card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setInstitution('');
    setLastFourDigits('');
    setCreditLimit('');
    setCurrentBalance('');
    setDueDate(new Date());
    setBillingCycle('');
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatLastFourDigits = (text: string) => {
    // Remove all non-numeric characters and limit to 4 digits
    const cleaned = text.replace(/\D/g, '').substring(0, 4);
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
            Add Credit Card
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Card Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Card Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="My Rewards Card"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Card Issuer/Institution */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Card Issuer <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.selectButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowInstitutionPicker(true)}
            >
              <Text style={[styles.selectText, { color: institution ? colors.text : colors.textSecondary }]} numberOfLines={1}>
                {institution || 'Select card issuer'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Last Four Digits */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Last 4 Digits <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.cardNumberContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardNumberPrefix, { color: colors.textSecondary }]}>•••• •••• •••• </Text>
              <TextInput
                style={[styles.cardNumberInput, { color: colors.text }]}
                placeholder="1234"
                placeholderTextColor={colors.textSecondary}
                value={lastFourDigits}
                onChangeText={(text) => setLastFourDigits(formatLastFourDigits(text))}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Credit Limit and Current Balance */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Credit Limit <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  placeholder="5000"
                  placeholderTextColor={colors.textSecondary}
                  value={creditLimit}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    const parts = numericValue.split('.');
                    if (parts.length > 2) {
                      setCreditLimit(parts[0] + '.' + parts.slice(1).join(''));
                    } else {
                      setCreditLimit(numericValue);
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Current Balance <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={currentBalance}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    const parts = numericValue.split('.');
                    if (parts.length > 2) {
                      setCurrentBalance(parts[0] + '.' + parts.slice(1).join(''));
                    } else {
                      setCurrentBalance(numericValue);
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Next Due Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Billing Cycle */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Billing Cycle</Text>
            <TouchableOpacity 
              style={[styles.selectButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowBillingCyclePicker(true)}
            >
              <Text style={[styles.selectText, { color: billingCycle ? colors.text : colors.textSecondary }]} numberOfLines={1}>
                {billingCycle || 'Select billing cycle'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Utilization Info */}
          {creditLimit && currentBalance && (
            <View style={[styles.utilizationContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.utilizationTitle, { color: colors.text }]}>Credit Utilization</Text>
              <View style={styles.utilizationRow}>
                <Text style={[styles.utilizationLabel, { color: colors.textSecondary }]}>
                  {((parseFloat(currentBalance) / parseFloat(creditLimit)) * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.utilizationAmount, { color: colors.text }]}>
                  ${currentBalance} / ${creditLimit}
                </Text>
              </View>
              <View style={[styles.utilizationBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.utilizationFill, 
                    { 
                      backgroundColor: ((parseFloat(currentBalance) / parseFloat(creditLimit)) * 100) > 30 ? colors.danger : colors.primary,
                      width: `${Math.min(100, (parseFloat(currentBalance) / parseFloat(creditLimit)) * 100)}%`
                    }
                  ]} 
                />
              </View>
            </View>
          )}

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
                {loading ? 'Adding...' : 'Add Credit Card'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

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
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Card Issuer</Text>
                    <TouchableOpacity onPress={() => setShowInstitutionPicker(false)}>
                      <Text style={[styles.pickerButton, { color: colors.primary }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {creditCardProviders.map((provider, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          setInstitution(provider);
                          setShowInstitutionPicker(false);
                        }}
                      >
                        <Text style={[styles.pickerItemText, { color: colors.text }]}>
                          {provider}
                        </Text>
                        {institution === provider && (
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

        {/* Billing Cycle Picker Modal */}
        <Modal visible={showBillingCyclePicker} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setShowBillingCyclePicker(false)}>
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
                  <View style={[styles.pickerHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => setShowBillingCyclePicker(false)}>
                      <Text style={[styles.pickerButton, { color: colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Billing Cycle</Text>
                    <TouchableOpacity onPress={() => setShowBillingCyclePicker(false)}>
                      <Text style={[styles.pickerButton, { color: colors.primary }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {billingCycles.map((cycle, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          setBillingCycle(cycle);
                          setShowBillingCyclePicker(false);
                        }}
                      >
                        <Text style={[styles.pickerItemText, { color: colors.text }]}>
                          {cycle}
                        </Text>
                        {billingCycle === cycle && (
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardNumberPrefix: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardNumberInput: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    minWidth: 60,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },

  utilizationContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  utilizationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  utilizationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  utilizationAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  utilizationBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 3,
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
  pickerItemText: {
    fontSize: 16,
    flex: 1,
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
  selectText: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
});

export default AddCreditCardModal;
