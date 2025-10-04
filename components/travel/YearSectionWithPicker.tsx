import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";
import { TripData } from "../ui/TripCard";
import { splitTripDates } from "../../utils/travelDate";

interface YearSectionWithPickerProps {
  trips: TripData[];
  selectedYear: number | null; // Allow null for "all years"
  selectedMonth: number | null; // null means all months
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: number | null) => void;
}

const { width: screenWidth } = Dimensions.get("window");

const YearSectionWithPicker: React.FC<YearSectionWithPickerProps> = ({
  trips,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme, isDark);

  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Generate years from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1899 },
    (_, i) => 1900 + i
  ).reverse();

  // Filter trips based on selected year and month
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Parse with robust parser
      const { start, end } = splitTripDates(trip.dates);
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      const startMonth = start.getMonth();
      const endMonth = end.getMonth();

      // Year filter: show trip if selectedYear is null OR if the trip overlaps with selectedYear
      let yearMatch = false;
      if (selectedYear === null) {
        yearMatch = true; // Show all years
      } else {
        // Trip matches if either start year or end year matches, or if selectedYear is between start and end
        yearMatch =
          startYear === selectedYear ||
          endYear === selectedYear ||
          (startYear < selectedYear && endYear > selectedYear);
      }

      // Month filter: show trip if selectedMonth is null OR if the trip overlaps with selectedMonth
      let monthMatch = false;
      if (selectedMonth === null) {
        monthMatch = true; // Show all months
      } else {
        // For trips within the same year, check if month overlaps
        if (startYear === endYear) {
          monthMatch = startMonth <= selectedMonth && selectedMonth <= endMonth;
        } else {
          // For cross-year trips, check if selectedMonth is in start year or end year
          monthMatch =
            (selectedYear === startYear && startMonth <= selectedMonth) ||
            (selectedYear === endYear && selectedMonth <= endMonth);
        }
      }

      return yearMatch && monthMatch;
    });
  }, [trips, selectedYear, selectedMonth]);

  const handleYearSelect = (year: number | null) => {
    onYearChange(year);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (month: number | null) => {
    onMonthChange(month);
    setShowMonthPicker(false);
  };

  const getDisplayText = () => {
    if (selectedMonth !== null) {
      const yearText =
        selectedYear === null ? "All Years" : selectedYear.toString();
      return `${shortMonths[selectedMonth]} ${yearText}`;
    }
    return selectedYear === null ? "All Years" : selectedYear.toString();
  };

  return (
    <View style={styles.container}>
      {/* Trip Count pill */}
      <View style={styles.countPillRow}>
        <View style={styles.countPill}>
          <Ionicons name="airplane-outline" size={14} color={theme.background} />
          <Text style={styles.countPillText}>
            {filteredTrips.length} Trip{filteredTrips.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
      {/* Year/Month Selector */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setShowYearPicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          <Text style={styles.selectorText}>{getDisplayText()}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Month Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedMonth !== null && styles.filterButtonActive,
          ]}
          onPress={() => {
            if (selectedMonth !== null) {
              // If a month is selected, reset to show all months
              onMonthChange(null);
            } else {
              // If showing all months, open picker to select a specific month
              setShowMonthPicker(true);
            }
          }}
        >
          <Ionicons
            name={selectedMonth !== null ? "close-outline" : "filter-outline"}
            size={16}
            color={
              selectedMonth !== null ? theme.background : theme.textSecondary
            }
          />
          <Text
            style={[
              styles.filterText,
              selectedMonth !== null && styles.filterTextActive,
            ]}
          >
            {selectedMonth !== null ? shortMonths[selectedMonth] : "All"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trip Count moved to pill above */}

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedYear === null && styles.pickerItemSelected,
                ]}
                onPress={() => handleYearSelect(null)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedYear === null && styles.pickerItemTextSelected,
                  ]}
                >
                  All Years
                </Text>
              </TouchableOpacity>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    year === selectedYear && styles.pickerItemSelected,
                  ]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      year === selectedYear && styles.pickerItemTextSelected,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedMonth === null && styles.pickerItemSelected,
                ]}
                onPress={() => handleMonthSelect(null)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedMonth === null && styles.pickerItemTextSelected,
                  ]}
                >
                  All Months
                </Text>
              </TouchableOpacity>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerItem,
                    index === selectedMonth && styles.pickerItemSelected,
                  ]}
                  onPress={() => handleMonthSelect(index)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      index === selectedMonth && styles.pickerItemTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingVertical: 4,
    },
    selectorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    countPillRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: 8,
    },
    countPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 6,
    },
    countPillText: {
      color: theme.background,
      fontWeight: "800",
      fontSize: 12,
    },
    selectorButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 8,
      flex: 1,
      marginRight: 12,
      minHeight: 48,
    },
    selectorText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      flex: 1,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 4,
      minHeight: 48,
      minWidth: 80,
      justifyContent: "center",
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    filterTextActive: {
      color: theme.background,
    },
    tripCount: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      textAlign: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    pickerContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      width: screenWidth * 0.8,
      maxHeight: 400,
      overflow: "hidden",
    },
    pickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    pickerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    pickerScrollView: {
      maxHeight: 300,
    },
    pickerItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    pickerItemSelected: {
      backgroundColor: theme.primary + "20",
    },
    pickerItemText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
    },
    pickerItemTextSelected: {
      color: theme.primary,
      fontWeight: "700",
    },
  });

export default YearSectionWithPicker;
