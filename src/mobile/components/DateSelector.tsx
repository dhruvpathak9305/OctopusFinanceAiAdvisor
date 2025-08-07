import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface DateSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const DateSelector: React.FC<DateSelectorProps> = ({ 
  value, 
  onValueChange, 
  placeholder = "Select month" 
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const colors = isDark ? {
    background: '#0B1426',
    card: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    filterBackground: '#374151',
    accent: '#10B981',
    accentLight: '#10B98120',
  } : {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    filterBackground: '#F3F4F6',
    accent: '#10B981',
    accentLight: '#10B98120',
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleConfirm = () => {
    const newValue = `${shortMonths[selectedMonth]} ${selectedYear}`;
    onValueChange(newValue);
    setIsVisible(false);
    console.log('DateSelector: Selected', newValue);
  };

  const handleOpen = () => {
    // Parse current value to set initial selection
    if (value) {
      const parts = value.split(' ');
      if (parts.length === 2) {
        const monthIndex = shortMonths.findIndex(m => m === parts[0]);
        if (monthIndex !== -1) setSelectedMonth(monthIndex);
        const year = parseInt(parts[1]);
        if (!isNaN(year)) setSelectedYear(year);
      }
    }
    console.log('DateSelector: Opening modal');
    setIsVisible(true);
  };

  const handleClose = () => {
    console.log('DateSelector: Closing modal');
    setIsVisible(false);
  };

  const MonthYearPicker = () => (
    <View style={styles.pickerContainer}>
      {/* Month Picker */}
      <View style={styles.pickerColumn}>
        <Text style={[styles.pickerLabel, { color: colors.text }]}>Month</Text>
        <ScrollView 
          style={styles.picker}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pickerContent}
        >
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pickerItem,
                { backgroundColor: selectedMonth === index ? colors.accentLight : 'transparent' }
              ]}
              onPress={() => setSelectedMonth(index)}
            >
              <Text style={[
                styles.pickerItemText,
                { 
                  color: selectedMonth === index ? colors.accent : colors.text,
                  fontWeight: selectedMonth === index ? '600' : '400'
                }
              ]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Year Picker */}
      <View style={styles.pickerColumn}>
        <Text style={[styles.pickerLabel, { color: colors.text }]}>Year</Text>
        <ScrollView 
          style={styles.picker}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pickerContent}
        >
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.pickerItem,
                { backgroundColor: selectedYear === year ? colors.accentLight : 'transparent' }
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[
                styles.pickerItemText,
                { 
                  color: selectedYear === year ? colors.accent : colors.text,
                  fontWeight: selectedYear === year ? '600' : '400'
                }
              ]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}
        onPress={handleOpen}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.buttonIcon, { color: colors.accent }]}>📅</Text>
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {value || placeholder}
          </Text>
        </View>
        <Text style={[styles.arrow, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>Select Date</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Selected Date Display */}
            <View style={[styles.selectedDateContainer, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.selectedDateText, { color: colors.accent }]}>
                {months[selectedMonth]} {selectedYear}
              </Text>
            </View>

            {/* Date Picker */}
            <MonthYearPicker />

            {/* Action Buttons */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton, { backgroundColor: colors.accent }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  selectedDateContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '700',
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  picker: {
    maxHeight: 200,
  },
  pickerContent: {
    paddingVertical: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DateSelector; 