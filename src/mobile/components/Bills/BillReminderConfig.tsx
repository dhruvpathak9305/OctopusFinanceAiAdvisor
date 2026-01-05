import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';

interface BillReminderConfigProps {
  reminderDaysBefore: number[] | null;
  reminderEnabled: boolean | null;
  onUpdate: (daysBefore: number[], enabled: boolean) => void;
}

const DEFAULT_REMINDER_DAYS = [7, 3, 1];

export const BillReminderConfig: React.FC<BillReminderConfigProps> = ({
  reminderDaysBefore,
  reminderEnabled,
  onUpdate,
}) => {
  const { isDark } = useTheme();
  const [enabled, setEnabled] = useState(reminderEnabled ?? true);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    reminderDaysBefore || DEFAULT_REMINDER_DAYS
  );

  const colors = isDark
    ? {
        background: '#1F2937',
        card: '#1F2937',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        border: '#374151',
        primary: '#3B82F6',
        success: '#10B981',
      }
    : {
        background: '#FFFFFF',
        card: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        primary: '#3B82F6',
        success: '#10B981',
      };

  const availableDays = [1, 2, 3, 5, 7, 14, 30];

  useEffect(() => {
    onUpdate(selectedDays, enabled);
  }, [selectedDays, enabled]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  const formatDayLabel = (day: number) => {
    if (day === 1) return '1 day before';
    if (day === 7) return '1 week before';
    if (day === 14) return '2 weeks before';
    if (day === 30) return '1 month before';
    return `${day} days before`;
  };

  return (
    <View style={styles.container}>
      {/* Enable/Disable Toggle */}
      <View style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIconContainer, { backgroundColor: enabled ? '#10B98120' : '#6B728020' }]}>
              <Ionicons
                name="notifications"
                size={20}
                color={enabled ? colors.success : colors.textSecondary}
              />
            </View>
            <View>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Enable Reminders</Text>
              <Text style={[styles.toggleSubtext, { color: colors.textSecondary }]}>
                Get notified before bills are due
              </Text>
            </View>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: colors.border, true: colors.success + '80' }}
            thumbColor={enabled ? colors.success : colors.textSecondary}
          />
        </View>
      </View>

      {/* Reminder Days Selection */}
      {enabled && (
        <View style={styles.daysContainer}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Remind me before due date
          </Text>
          <View style={styles.daysGrid}>
            {availableDays.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.dayButtonText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {formatDayLabel(day)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedDays.length === 0 && (
            <Text style={[styles.warningText, { color: '#F59E0B' }]}>
              Select at least one reminder day
            </Text>
          )}
        </View>
      )}

      {/* Preview */}
      {enabled && selectedDays.length > 0 && (
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.previewLabel, { color: colors.text }]}>Reminder Schedule</Text>
          <View style={styles.previewList}>
            {selectedDays.map((day) => (
              <View key={day} style={styles.previewItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  {formatDayLabel(day)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toggleCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
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
  toggleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 13,
  },
  daysContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  previewCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  previewList: {
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 13,
    marginLeft: 8,
  },
});

