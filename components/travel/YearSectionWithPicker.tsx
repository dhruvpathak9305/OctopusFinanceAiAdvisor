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

export type SortOption =
  | "latest"
  | "oldest"
  | "alphabetical"
  | "longest"
  | "shortest";

interface YearSectionWithPickerProps {
  trips: TripData[];
  selectedYear: number | null; // Allow null for "all years"
  selectedMonth: number | null; // null means all months
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: number | null) => void;
  selectedSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const { width: screenWidth } = Dimensions.get("window");

const YearSectionWithPicker: React.FC<YearSectionWithPickerProps> = ({
  trips,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  selectedSort = "latest",
  onSortChange,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme, isDark);

  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);

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
      {/* All Filters in One Row */}
      <View style={styles.allFiltersRow}>
        {/* Year Selector */}
        <TouchableOpacity
          style={styles.yearButton}
          onPress={() => setShowYearPicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.primary} />
          <Text style={styles.yearButtonText}>{getDisplayText()}</Text>
          <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Month Filter */}
        <TouchableOpacity
          style={[
            styles.monthButton,
            selectedMonth !== null && styles.monthButtonActive,
          ]}
          onPress={() => {
            if (selectedMonth !== null) {
              onMonthChange(null);
            } else {
              setShowMonthPicker(true);
            }
          }}
        >
          <Ionicons
            name={selectedMonth !== null ? "close-outline" : "funnel-outline"}
            size={14}
            color={
              selectedMonth !== null ? theme.background : theme.textSecondary
            }
          />
          <Text
            style={[
              styles.monthButtonText,
              selectedMonth !== null && styles.monthButtonTextActive,
            ]}
          >
            {selectedMonth !== null ? shortMonths[selectedMonth] : "All"}
          </Text>
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButtonCompact}
          onPress={() => setShowSortPicker(true)}
        >
          <Ionicons name="swap-vertical" size={16} color={theme.primary} />
          <Text style={styles.sortButtonCompactText}>
            {selectedSort === "latest" && "Latest"}
            {selectedSort === "oldest" && "Oldest"}
            {selectedSort === "alphabetical" && "A-Z"}
            {selectedSort === "longest" && "Long"}
            {selectedSort === "shortest" && "Short"}
          </Text>
          <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
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

      {/* Sort Picker Modal */}
      <Modal
        visible={showSortPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedSort === "latest" && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  if (onSortChange) {
                    onSortChange("latest");
                    setShowSortPicker(false);
                  }
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={
                    selectedSort === "latest"
                      ? theme.primary
                      : theme.textSecondary
                  }
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedSort === "latest" && styles.pickerItemTextSelected,
                  ]}
                >
                  Latest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedSort === "oldest" && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  if (onSortChange) {
                    onSortChange("oldest");
                    setShowSortPicker(false);
                  }
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={
                    selectedSort === "oldest"
                      ? theme.primary
                      : theme.textSecondary
                  }
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedSort === "oldest" && styles.pickerItemTextSelected,
                  ]}
                >
                  Oldest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedSort === "alphabetical" && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  if (onSortChange) {
                    onSortChange("alphabetical");
                    setShowSortPicker(false);
                  }
                }}
              >
                <Ionicons
                  name="text-outline"
                  size={20}
                  color={
                    selectedSort === "alphabetical"
                      ? theme.primary
                      : theme.textSecondary
                  }
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedSort === "alphabetical" &&
                      styles.pickerItemTextSelected,
                  ]}
                >
                  Alphabetical (A-Z)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedSort === "longest" && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  if (onSortChange) {
                    onSortChange("longest");
                    setShowSortPicker(false);
                  }
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={
                    selectedSort === "longest"
                      ? theme.primary
                      : theme.textSecondary
                  }
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedSort === "longest" && styles.pickerItemTextSelected,
                  ]}
                >
                  Longest Duration
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedSort === "shortest" && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  if (onSortChange) {
                    onSortChange("shortest");
                    setShowSortPicker(false);
                  }
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={
                    selectedSort === "shortest"
                      ? theme.primary
                      : theme.textSecondary
                  }
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedSort === "shortest" &&
                      styles.pickerItemTextSelected,
                  ]}
                >
                  Shortest Duration
                </Text>
              </TouchableOpacity>
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
    allFiltersRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    yearButton: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
      minHeight: 44,
    },
    yearButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
      flex: 1,
    },
    monthButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 4,
      minHeight: 44,
    },
    monthButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    monthButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    monthButtonTextActive: {
      color: theme.background,
    },
    sortButtonCompact: {
      flex: 1.5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 4,
      minHeight: 44,
    },
    sortButtonCompactText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
    },
    tripCount: { display: "none" },
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
      flexDirection: "row",
      alignItems: "center",
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
