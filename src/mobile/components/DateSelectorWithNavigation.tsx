import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../contexts/ThemeContext";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";

interface DateSelectorWithNavigationProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showNavigationButtons?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

const DateSelectorWithNavigation: React.FC<DateSelectorWithNavigationProps> = ({
  value,
  onValueChange,
  placeholder = "Select month",
  showNavigationButtons = true,
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayValue, setDisplayValue] = useState<string>(value);
  const [pickerMode, setPickerMode] = useState<"date" | "month" | "year">("month");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const colors = isDark
    ? {
        background: "#0B1426",
        card: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        filterBackground: "#374151",
        accent: "#10B981",
        accentLight: "#10B98120",
      }
    : {
        background: "#FFFFFF",
        card: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        filterBackground: "#F3F4F6",
        accent: "#10B981",
        accentLight: "#10B98120",
      };

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

  // Parse the date when component mounts or value changes
  useEffect(() => {
    if (value) {
      const parts = value.split(" ");
      
      // Handle three formats:
      // - "Oct 8 2025" (specific date, 3 parts)
      // - "Oct 2025" (specific month, 2 parts)
      // - "2025" (entire year, 1 part)
      if (parts.length === 3) {
        const monthIndex = shortMonths.findIndex((m) => m === parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
          const newDate = new Date(year, monthIndex, day);
          setSelectedDate(newDate);
          setSelectedDay(day);
          setSelectedMonth(monthIndex);
          setSelectedYear(year);
        }
      } else if (parts.length === 2) {
        const monthIndex = shortMonths.findIndex((m) => m === parts[0]);
        const year = parseInt(parts[1]);
        if (monthIndex !== -1 && !isNaN(year)) {
          const newDate = new Date(year, monthIndex, 1);
          setSelectedDate(newDate);
          setSelectedMonth(monthIndex);
          setSelectedYear(year);
        }
      } else if (parts.length === 1) {
        const year = parseInt(parts[0]);
        if (!isNaN(year)) {
          const newDate = new Date(year, 0, 1); // January 1st of the year
          setSelectedDate(newDate);
          setSelectedYear(year);
        }
      }
      
      setDisplayValue(value);
    }
  }, [value]);


  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setIsVisible(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
        const month = shortMonths[date.getMonth()];
        const year = date.getFullYear();
        const newValue = `${month} ${year}`;
        onValueChange(newValue);
        setDisplayValue(newValue);
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    // Update selectedDate with the current picker values
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    setSelectedDate(newDate);
    
    const month = shortMonths[selectedMonth];
    const year = selectedYear;
    
    // Return format based on picker mode:
    // - Date mode: "Oct 8 2025" (specific date)
    // - Month mode: "Oct 2025" (specific month)
    // - Year mode: "2025" (entire year)
    let newValue: string;
    if (pickerMode === "date") {
      newValue = `${month} ${selectedDay} ${year}`;
    } else if (pickerMode === "month") {
      newValue = `${month} ${year}`;
    } else {
      // Year mode
      newValue = `${year}`;
    }
    
    onValueChange(newValue);
    setDisplayValue(newValue);
    setIsVisible(false);
  };

  const handleOpen = () => {
    const today = new Date();
    
    // Parse current value to set initial selection, or use current date as default
    if (value) {
      const parts = value.split(" ");
      
      // Handle three formats:
      // - "Oct 8 2025" (specific date, 3 parts)
      // - "Oct 2025" (specific month, 2 parts)
      // - "2025" (entire year, 1 part)
      if (parts.length === 3) {
        // Format: "Oct 8 2025"
        const monthIndex = shortMonths.findIndex((m) => m === parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
          setSelectedMonth(monthIndex);
          setSelectedDay(day);
          setSelectedYear(year);
          const newDate = new Date(year, monthIndex, day);
          setSelectedDate(newDate);
        }
      } else if (parts.length === 2) {
        // Format: "Oct 2025"
        const monthIndex = shortMonths.findIndex((m) => m === parts[0]);
        const year = parseInt(parts[1]);
        if (monthIndex !== -1 && !isNaN(year)) {
          setSelectedMonth(monthIndex);
          setSelectedYear(year);
          // Set day to current day for display
          setSelectedDay(today.getDate());
          const newDate = new Date(year, monthIndex, today.getDate());
          setSelectedDate(newDate);
        }
      } else if (parts.length === 1) {
        // Format: "2025" (year only)
        const year = parseInt(parts[0]);
        if (!isNaN(year)) {
          setSelectedYear(year);
          // Set month and day to current for display
          setSelectedMonth(today.getMonth());
          setSelectedDay(today.getDate());
          const newDate = new Date(year, today.getMonth(), today.getDate());
          setSelectedDate(newDate);
        }
      }
    } else {
      // Default to current date
      setSelectedDate(today);
      setSelectedDay(today.getDate());
      setSelectedMonth(today.getMonth());
      setSelectedYear(today.getFullYear());
    }
    
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleModeChange = (mode: "date" | "month" | "year") => {
    setPickerMode(mode);
  };

  const navigateToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    
    setSelectedDate(newDate);

    const month = shortMonths[newDate.getMonth()];
    const year = newDate.getFullYear();
    const newValue = `${month} ${year}`;
    onValueChange(newValue);
    setDisplayValue(newValue);
  };

  const navigateToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    
    setSelectedDate(newDate);

    const month = shortMonths[newDate.getMonth()];
    const year = newDate.getFullYear();
    const newValue = `${month} ${year}`;
    onValueChange(newValue);
    setDisplayValue(newValue);
  };

  // Modern grid-based picker component
  const CustomPicker = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const currentYear = new Date().getFullYear();
    
    // Generate array of years (20 years before and after current year)
    const yearRange = 40;
    const startYear = currentYear - Math.floor(yearRange / 2);
    const years = Array.from({ length: yearRange }, (_, i) => startYear + i);

    // Calendar grid for Date mode
    const renderCalendar = () => {
      const weeks = [];
      const daysArray = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        daysArray.push(day);
      }
      
      // Pad the last week with empty cells to ensure proper grid alignment
      const remainingCells = daysArray.length % 7;
      if (remainingCells !== 0) {
        for (let i = 0; i < (7 - remainingCells); i++) {
          daysArray.push(null);
        }
      }
      
      // Split into weeks (rows of 7)
      for (let i = 0; i < daysArray.length; i += 7) {
        weeks.push(daysArray.slice(i, i + 7));
      }
      
      return (
        <View style={styles.calendarContainer}>
          {/* Month and Year Header with Navigation - Click to change mode */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => {
                const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
                const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
                setSelectedMonth(newMonth);
                setSelectedYear(newYear);
              }}
            >
              <Text style={[styles.calendarNavButtonText, { color: colors.accent }]}>‹</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.calendarHeaderTouchable}
              onPress={() => setPickerMode("month")}
            >
              <Text style={[styles.calendarHeaderText, { color: colors.text }]}>
                {months[selectedMonth]} {selectedYear}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => {
                const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
                const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
                setSelectedMonth(newMonth);
                setSelectedYear(newYear);
              }}
            >
              <Text style={[styles.calendarNavButtonText, { color: colors.accent }]}>›</Text>
            </TouchableOpacity>
          </View>
          
          {/* Day labels */}
          <View style={styles.weekDaysRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={[styles.weekDayLabel, { color: colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>
          
          {/* Calendar grid */}
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.calendarWeek}>
              {week.map((day, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.calendarDay,
                    day === selectedDay && {
                      backgroundColor: colors.accent,
                    },
                  ]}
                  onPress={() => day && setSelectedDay(day)}
                  disabled={!day}
                >
                  {day && (
                    <Text
                      style={[
                        styles.calendarDayText,
                        {
                          color: day === selectedDay ? "#FFFFFF" : colors.text,
                          fontWeight: day === selectedDay ? "700" : "400",
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      );
    };

    // Month grid (3 columns x 4 rows)
    const renderMonthGrid = () => {
      const monthChunks = [];
      for (let i = 0; i < months.length; i += 3) {
        monthChunks.push(months.slice(i, i + 3));
      }
      
      return (
        <View style={styles.gridContainer}>
          {/* Year Header with Navigation - Click to go to Year mode */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => setSelectedYear(selectedYear - 1)}
            >
              <Text style={[styles.calendarNavButtonText, { color: colors.accent }]}>‹</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.calendarHeaderTouchable}
              onPress={() => setPickerMode("year")}
            >
              <Text style={[styles.calendarHeaderText, { color: colors.text }]}>
                {selectedYear}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.calendarNavButton}
              onPress={() => setSelectedYear(selectedYear + 1)}
            >
              <Text style={[styles.calendarNavButtonText, { color: colors.accent }]}>›</Text>
            </TouchableOpacity>
          </View>
          
          {monthChunks.map((chunk, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {chunk.map((month, colIndex) => {
                const monthIndex = rowIndex * 3 + colIndex;
                return (
                  <TouchableOpacity
                    key={monthIndex}
                    style={[
                      styles.gridItem,
                      { borderColor: colors.border },
                      selectedMonth === monthIndex && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ]}
                    onPress={() => {
                      setSelectedMonth(monthIndex);
                      // Auto-return to Date mode after selecting month
                      setPickerMode("date");
                    }}
                  >
                    <Text
                      style={[
                        styles.gridItemText,
                        {
                          color: selectedMonth === monthIndex ? "#FFFFFF" : colors.text,
                          fontWeight: selectedMonth === monthIndex ? "700" : "500",
                        },
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      );
    };

    // Year grid (4 columns x 5 rows, showing 20 years at a time)
    const renderYearGrid = () => {
      const yearChunks = [];
      for (let i = 0; i < years.length; i += 4) {
        yearChunks.push(years.slice(i, i + 4));
      }
      
      return (
        <ScrollView 
          style={styles.yearScrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.yearScrollContent}
        >
          <View style={styles.gridContainer}>
            {yearChunks.map((chunk, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {chunk.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.gridItem,
                      { borderColor: colors.border },
                      selectedYear === year && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ]}
                    onPress={() => {
                      setSelectedYear(year);
                      // Auto-return to Month mode after selecting year
                      setPickerMode("month");
                    }}
                  >
                    <Text
                      style={[
                        styles.gridItemText,
                        {
                          color: selectedYear === year ? "#FFFFFF" : colors.text,
                          fontWeight: selectedYear === year ? "700" : "500",
                        },
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    };

    return (
      <View style={styles.pickerContentContainer}>
        {pickerMode === "date" && renderCalendar()}
        {pickerMode === "month" && renderMonthGrid()}
        {pickerMode === "year" && renderYearGrid()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showNavigationButtons ? (
        <View style={styles.dateNavigationContainer}>
          <TouchableOpacity
            style={[
              styles.navigationButton,
              {
                backgroundColor: colors.filterBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={navigateToPreviousMonth}
          >
            <ChevronLeft size={16} color={colors.accent} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.filterBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={handleOpen}
          >
            <View style={styles.buttonContent}>
              <Calendar
                size={14}
                color={colors.accent}
                style={styles.calendarIcon}
              />
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {displayValue || placeholder}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navigationButton,
              {
                backgroundColor: colors.filterBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={navigateToNextMonth}
          >
            <ChevronRight size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.filterBackground,
              borderColor: colors.border,
            },
          ]}
          onPress={handleOpen}
        >
          <View style={styles.buttonContent}>
            <Calendar
              size={14}
              color={colors.accent}
              style={styles.calendarIcon}
            />
            <Text style={[styles.buttonText, { color: colors.text }]}>
              {displayValue || placeholder}
            </Text>
          </View>
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>▼</Text>
        </TouchableOpacity>
      )}

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
              <TouchableOpacity onPress={handleClose}>
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>
                Select Date
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text
                  style={[styles.actionButtonText, { color: colors.accent }]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode Toggle Buttons */}
            <View style={styles.modeToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  pickerMode === "date" && [
                    styles.modeToggleButtonActive,
                    { backgroundColor: colors.accent },
                  ],
                  { borderColor: colors.border },
                ]}
                onPress={() => handleModeChange("date")}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    { color: pickerMode === "date" ? "#FFFFFF" : colors.text },
                  ]}
                >
                  Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  pickerMode === "month" && [
                    styles.modeToggleButtonActive,
                    { backgroundColor: colors.accent },
                  ],
                  { borderColor: colors.border },
                ]}
                onPress={() => handleModeChange("month")}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    { color: pickerMode === "month" ? "#FFFFFF" : colors.text },
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  pickerMode === "year" && [
                    styles.modeToggleButtonActive,
                    { backgroundColor: colors.accent },
                  ],
                  { borderColor: colors.border },
                ]}
                onPress={() => handleModeChange("year")}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    { color: pickerMode === "year" ? "#FFFFFF" : colors.text },
                  ]}
                >
                  Year
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Date Picker with mode-based column visibility */}
            <CustomPicker />

          </View>
        </View>
      </Modal>

      {/* Android DatePicker */}
      {Platform.OS === "android" && isVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 6,
    minHeight: 36,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  calendarIcon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  datePicker: {
    width: "100%",
    height: 260,
  },
  modeToggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    justifyContent: "space-between",
  },
  modeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  modeToggleButtonActive: {
    borderWidth: 2,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Grid-based picker container
  pickerContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 300,
  },
  // Calendar grid styles (for Date mode)
  calendarContainer: {
    width: "100%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarHeaderTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: "700",
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarNavButtonText: {
    fontSize: 28,
    fontWeight: "400",
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  weekDayLabel: {
    width: "14.28%", // 100% / 7 days
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
  },
  calendarDay: {
    width: "14.28%", // 100% / 7 days
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 16,
  },
  // Grid styles (for Month and Year modes)
  gridContainer: {
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  gridItem: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 56,
  },
  gridItemText: {
    fontSize: 15,
    textAlign: "center",
  },
  // Year scroll container
  yearScrollContainer: {
    maxHeight: 320,
  },
  yearScrollContent: {
    paddingBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DateSelectorWithNavigation;
