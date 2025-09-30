import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";

interface DateRange {
  id: string;
  title: string;
  subtitle: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

const MobileDateFilter: React.FC = () => {
  const { isDark } = useTheme();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [selectedRange, setSelectedRange] = useState<string>("this-month");
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Predefined date ranges
  const dateRanges: DateRange[] = [
    {
      id: "today",
      title: "Today",
      subtitle: "Transactions from today",
      startDate: new Date(),
      endDate: new Date(),
      color: "#10B981",
    },
    {
      id: "yesterday",
      title: "Yesterday",
      subtitle: "Transactions from yesterday",
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      color: "#3B82F6",
    },
    {
      id: "this-week",
      title: "This Week",
      subtitle: "Last 7 days",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      color: "#8B5CF6",
    },
    {
      id: "this-month",
      title: "This Month",
      subtitle: "Current month transactions",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      color: "#F59E0B",
    },
    {
      id: "last-month",
      title: "Last Month",
      subtitle: "Previous month transactions",
      startDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        1
      ),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      color: "#EF4444",
    },
    {
      id: "last-3-months",
      title: "Last 3 Months",
      subtitle: "Quarterly view",
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      color: "#06B6D4",
    },
    {
      id: "this-year",
      title: "This Year",
      subtitle: "Year to date",
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
      color: "#84CC16",
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDateRangeSelect = (rangeId: string) => {
    setSelectedRange(rangeId);
    // Here you would typically apply the filter to your data
  };

  const handleCustomDateChange = (
    event: any,
    selectedDate: Date | undefined,
    type: "start" | "end"
  ) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }

    if (selectedDate) {
      if (type === "start") {
        setCustomStartDate(selectedDate);
      } else {
        setCustomEndDate(selectedDate);
      }
      setSelectedRange("custom");
    }
  };

  const renderDateRangeItem = (range: DateRange) => (
    <TouchableOpacity
      key={range.id}
      style={[
        styles.rangeCard,
        {
          backgroundColor: colors.card,
          borderColor: selectedRange === range.id ? range.color : colors.border,
          borderWidth: selectedRange === range.id ? 2 : 1,
        },
      ]}
      onPress={() => handleDateRangeSelect(range.id)}
    >
      <View style={styles.rangeContent}>
        <View
          style={[styles.rangeIcon, { backgroundColor: `${range.color}20` }]}
        >
          <Ionicons name="calendar" size={24} color={range.color} />
        </View>
        <View style={styles.rangeDetails}>
          <Text style={[styles.rangeTitle, { color: colors.text }]}>
            {range.title}
          </Text>
          <Text style={[styles.rangeSubtitle, { color: colors.textSecondary }]}>
            {range.subtitle}
          </Text>
          <Text style={[styles.rangeDates, { color: colors.textSecondary }]}>
            {formatDate(range.startDate)} - {formatDate(range.endDate)}
          </Text>
        </View>
        {selectedRange === range.id && (
          <View
            style={[styles.selectedIndicator, { backgroundColor: range.color }]}
          >
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Date Filter
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Filter transactions by date range
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Date Ranges */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Ranges
          </Text>
          {dateRanges.map(renderDateRangeItem)}
        </View>

        {/* Custom Date Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Custom Range
          </Text>

          <View
            style={[
              styles.customRangeCard,
              {
                backgroundColor: colors.card,
                borderColor:
                  selectedRange === "custom" ? colors.primary : colors.border,
                borderWidth: selectedRange === "custom" ? 2 : 1,
              },
            ]}
          >
            <View style={styles.customRangeHeader}>
              <Text style={[styles.customRangeTitle, { color: colors.text }]}>
                Custom Date Range
              </Text>
              {selectedRange === "custom" && (
                <View
                  style={[
                    styles.selectedIndicator,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </View>

            {/* Start Date */}
            <TouchableOpacity
              style={[
                styles.dateInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                From
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formatDate(customStartDate)}
              </Text>
              <Ionicons
                name="calendar"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* End Date */}
            <TouchableOpacity
              style={[
                styles.dateInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                To
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formatDate(customEndDate)}
              </Text>
              <Ionicons
                name="calendar"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Apply Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.applyButtonText}>Apply Date Filter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={customStartDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) =>
            handleCustomDateChange(event, date, "start")
          }
          maximumDate={new Date()}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={customEndDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => handleCustomDateChange(event, date, "end")}
          maximumDate={new Date()}
          minimumDate={customStartDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  rangeCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  rangeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  rangeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rangeDetails: {
    flex: 1,
  },
  rangeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  rangeSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  rangeDates: {
    fontSize: 12,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  customRangeCard: {
    borderRadius: 12,
    padding: 16,
  },
  customRangeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  customRangeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 40,
  },
  dateValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  applyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MobileDateFilter;
