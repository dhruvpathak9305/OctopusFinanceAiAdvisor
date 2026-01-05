import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { format, addMonths, addYears } from 'date-fns';

interface RecurrencePatternEditorProps {
  frequency: string;
  recurrencePattern: any;
  recurrenceCount: number | null;
  recurrenceEndDate: string | null;
  dueDate: string;
  onUpdate: (pattern: {
    frequency: string;
    recurrencePattern: any;
    recurrenceCount: number | null;
    recurrenceEndDate: string | null;
    nextDueDate: string | null;
  }) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-time', icon: 'calendar-outline' },
  { value: 'daily', label: 'Daily', icon: 'today-outline' },
  { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { value: 'bi-weekly', label: 'Bi-weekly', icon: 'calendar-outline' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
  { value: 'quarterly', label: 'Quarterly', icon: 'calendar-outline' },
  { value: 'semi-annually', label: 'Semi-annually', icon: 'calendar-outline' },
  { value: 'yearly', label: 'Yearly', icon: 'calendar-outline' },
];

export const RecurrencePatternEditor: React.FC<RecurrencePatternEditorProps> = ({
  frequency: initialFrequency,
  recurrencePattern: initialPattern,
  recurrenceCount: initialCount,
  recurrenceEndDate: initialEndDate,
  dueDate,
  onUpdate,
}) => {
  const { isDark } = useTheme();
  const [frequency, setFrequency] = useState(initialFrequency || 'one-time');
  const [hasEndDate, setHasEndDate] = useState(!!initialEndDate);
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [hasCount, setHasCount] = useState(!!initialCount);
  const [count, setCount] = useState(initialCount?.toString() || '');

  const colors = isDark
    ? {
        background: '#1F2937',
        card: '#1F2937',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        border: '#374151',
        primary: '#3B82F6',
        inputBg: '#374151',
      }
    : {
        background: '#FFFFFF',
        card: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        primary: '#3B82F6',
        inputBg: '#F3F4F6',
      };

  useEffect(() => {
    calculateNextDueDate();
  }, [frequency, dueDate, endDate, count]);

  const calculateNextDueDate = () => {
    if (frequency === 'one-time') {
      onUpdate({
        frequency,
        recurrencePattern: null,
        recurrenceCount: null,
        recurrenceEndDate: null,
        nextDueDate: null,
      });
      return;
    }

    let nextDueDate: string | null = null;
    try {
      const due = new Date(dueDate);
      switch (frequency) {
        case 'daily':
          nextDueDate = format(new Date(due.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
          break;
        case 'weekly':
          nextDueDate = format(new Date(due.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
          break;
        case 'bi-weekly':
          nextDueDate = format(new Date(due.getTime() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
          break;
        case 'monthly':
          nextDueDate = format(addMonths(due, 1), 'yyyy-MM-dd');
          break;
        case 'quarterly':
          nextDueDate = format(addMonths(due, 3), 'yyyy-MM-dd');
          break;
        case 'semi-annually':
          nextDueDate = format(addMonths(due, 6), 'yyyy-MM-dd');
          break;
        case 'yearly':
          nextDueDate = format(addYears(due, 1), 'yyyy-MM-dd');
          break;
      }
    } catch (e) {
      // Invalid date
    }

    onUpdate({
      frequency,
      recurrencePattern: null, // Can be extended for complex patterns
      recurrenceCount: hasCount && count ? parseInt(count, 10) : null,
      recurrenceEndDate: hasEndDate && endDate ? endDate : null,
      nextDueDate,
    });
  };

  const handleFrequencyChange = (newFrequency: string) => {
    setFrequency(newFrequency);
    if (newFrequency === 'one-time') {
      setHasEndDate(false);
      setHasCount(false);
      setEndDate('');
      setCount('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Frequency Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Recurrence Frequency</Text>
        <View style={styles.frequencyGrid}>
          {FREQUENCY_OPTIONS.map((option) => {
            const isSelected = frequency === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyButton,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => handleFrequencyChange(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.frequencyButtonText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* End Date Configuration */}
      {frequency !== 'one-time' && (
        <>
          <View style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Set end date
                </Text>
              </View>
              <Switch
                value={hasEndDate}
                onValueChange={setHasEndDate}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={hasEndDate ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>

          {hasEndDate && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>End Date</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>
          )}

          {/* Count Configuration */}
          <View style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Ionicons name="repeat" size={18} color={colors.textSecondary} />
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Set number of occurrences
                </Text>
              </View>
              <Switch
                value={hasCount}
                onValueChange={setHasCount}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={hasCount ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>

          {hasCount && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Number of Occurrences</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., 12"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={count}
                  onChangeText={setCount}
                />
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  frequencyButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  toggleCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
});

