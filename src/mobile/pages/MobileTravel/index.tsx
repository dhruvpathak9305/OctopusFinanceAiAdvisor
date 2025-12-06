import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Modal,
  Alert,
  ScrollView,
  FlatList,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import TravelMap from "../../../../components/ui/TravelMap";
import FloatingAvatar from "../../../../components/travel/FloatingAvatar";
import TravelStickyHeader from "../../../../components/travel/TravelStickyHeader";
import TravelSearchHeader from "../../../../components/travel/TravelSearchHeader";
import TravelTabs from "../../../../components/travel/TravelTabs";
import TravelFab from "../../../../components/travel/TravelFab";
import TripCard, { TripData } from "../../../../components/ui/TripCard";
import PlaceCard, { PlaceData } from "../../../../components/ui/PlaceCard";
import YearSectionWithPicker from "../../../../components/travel/YearSectionWithPicker";
import { travelMarkers } from "../../../../assets/data/travelMarkers";
import { sampleTrips, samplePlaces } from "../../../../assets/data/travelData";
import { TravelMarker } from "../../../../types/map";
import { splitTripDates } from "../../../../utils/travelDate";
import {
  useTheme,
  lightTheme,
  darkTheme,
} from "../../../../contexts/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

type ScreenType = "home" | "profile" | "tripDetail";

const MobileTravel: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("home");
  const [activeTab, setActiveTab] = useState<"trips" | "places">("trips");
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [mapType, setMapType] = useState<
    "standard" | "satellite" | "hybrid" | "terrain"
  >("terrain");
  const [isScrollExpanded, setIsScrollExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // Start with "All Years"
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState<
    "latest" | "oldest" | "alphabetical" | "longest" | "shortest"
  >("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Debug state changes
  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: number | null) => {
    setSelectedMonth(month);
  };

  // Theme context
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme, isDark);

  // Handle map marker press
  const handleMarkerPress = (marker: TravelMarker) => {
    console.log("Marker pressed:", marker.name);
    // You can add more functionality here, like showing a modal or navigating
  };

  // Handle map type selection
  const handleMapTypeSelect = (
    type: "standard" | "satellite" | "hybrid" | "terrain"
  ) => {
    setMapType(type);
    setShowMapOptions(false);
  };

  // Handle trip card press
  const handleTripPress = (trip: TripData) => {
    console.log("Trip pressed:", trip.title);
    setActiveScreen("tripDetail");
  };

  // Handle trip invite press
  const handleTripInvitePress = (trip: TripData) => {
    Alert.alert("Invite Friends", `Invite friends to join ${trip.title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Invite",
        onPress: () => console.log("Inviting friends to", trip.title),
      },
    ]);
  };

  // Handle place card press
  const handlePlacePress = (place: PlaceData) => {
    console.log("Place pressed:", place.name);
    // Navigate to place detail or show modal
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(null); // Show all years
  };

  // Track when the list is at the very top while expanded
  const readyToCollapseRef = useRef(false);

  // Memoize filtered and sorted trips
  const filteredTrips = useMemo(() => {
    const filtered = sampleTrips.filter((trip) => {
      // Parse with robust parser
      const { start, end } = splitTripDates(trip.dates);
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      const startMonth = start.getMonth();
      const endMonth = end.getMonth();

      // Search filter: match trip name, location, or country
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          trip.title.toLowerCase().includes(query) ||
          trip.location.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

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

    // Apply sorting
    return filtered.sort((a, b) => {
      const { start: aStart } = splitTripDates(a.dates);
      const { start: bStart } = splitTripDates(b.dates);

      switch (selectedSort) {
        case "latest":
          return bStart.getTime() - aStart.getTime(); // Newest first
        case "oldest":
          return aStart.getTime() - bStart.getTime(); // Oldest first
        case "alphabetical":
          return a.title.localeCompare(b.title); // A-Z
        case "longest":
          return b.nights - a.nights; // Most nights first
        case "shortest":
          return a.nights - b.nights; // Fewest nights first
        default:
          return 0;
      }
    });
  }, [selectedYear, selectedMonth, selectedSort, searchQuery]);

  // Handle scroll to expand/collapse view
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    // Expand once list is scrolled down a bit
    if (!isScrollExpanded && y > 30) {
      setIsScrollExpanded(true);
      return;
    }
    // When expanded: first allow user to reach the top; only collapse on a second pull
    if (isScrollExpanded) {
      if (y <= 0) {
        // At top of list
        readyToCollapseRef.current = true;
      } else {
        // Scrolled down again, require another top reach before collapsing
        readyToCollapseRef.current = false;
      }

      // Collapse only if user pulls beyond threshold and we've confirmed list is at top
      if (readyToCollapseRef.current && y < -40) {
        readyToCollapseRef.current = false;
        setIsScrollExpanded(false);
      }
    }
  };

  // Home Screen - Map View
  const renderHomeScreen = () => {
    return (
      <View style={styles.container}>
        {/* Map Container - Optimized for World View */}
        <View
          style={[
            styles.mapContainer,
            isScrollExpanded && styles.mapContainerCollapsed,
          ]}
        >
          <TravelMap
            markers={travelMarkers}
            onMarkerPress={handleMarkerPress}
            showUserLocation={true}
            showMyLocationButton={true}
            animateToUserLocation={false}
            mapType={mapType}
            style={styles.map}
          />
        </View>

        {/* Overlay Header Buttons - Hide when expanded */}
        {!isScrollExpanded && (
          <View style={styles.overlayHeader} pointerEvents="box-none">
            <View style={styles.leftHeaderButtons}>
              <TouchableOpacity
                style={styles.scratchButton}
                onPress={() => setShowMapOptions(true)}
              >
                <Ionicons name="globe-outline" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  setIsScrollExpanded(true);
                  // Focus will be on inline search bar
                }}
              >
                <Ionicons name="search" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Map Options Modal */}
        <Modal
          visible={showMapOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMapOptions(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMapOptions(false)}
          >
            <View style={styles.mapOptionsContainer}>
              <Text style={styles.mapOptionsTitle}>Map Type</Text>

              <TouchableOpacity
                style={[
                  styles.mapOption,
                  mapType === "standard" && styles.selectedMapOption,
                ]}
                onPress={() => handleMapTypeSelect("standard")}
              >
                <Ionicons
                  name="map-outline"
                  size={20}
                  color={mapType === "standard" ? "#10b981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.mapOptionText,
                    mapType === "standard" && styles.selectedMapOptionText,
                  ]}
                >
                  Standard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mapOption,
                  mapType === "satellite" && styles.selectedMapOption,
                ]}
                onPress={() => handleMapTypeSelect("satellite")}
              >
                <Ionicons
                  name="earth-outline"
                  size={20}
                  color={mapType === "satellite" ? "#10b981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.mapOptionText,
                    mapType === "satellite" && styles.selectedMapOptionText,
                  ]}
                >
                  Satellite
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mapOption,
                  mapType === "hybrid" && styles.selectedMapOption,
                ]}
                onPress={() => handleMapTypeSelect("hybrid")}
              >
                <Ionicons
                  name="layers-outline"
                  size={20}
                  color={mapType === "hybrid" ? "#10b981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.mapOptionText,
                    mapType === "hybrid" && styles.selectedMapOptionText,
                  ]}
                >
                  Hybrid
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mapOption,
                  mapType === "terrain" && styles.selectedMapOption,
                ]}
                onPress={() => handleMapTypeSelect("terrain")}
              >
                <Ionicons
                  name="triangle-outline"
                  size={20}
                  color={mapType === "terrain" ? "#10b981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.mapOptionText,
                    mapType === "terrain" && styles.selectedMapOptionText,
                  ]}
                >
                  Terrain
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Floating Profile Avatar - Overlaps map and card when not expanded */}
        {!isScrollExpanded && (
          <FloatingAvatar onPress={() => setActiveScreen("profile")} />
        )}

        {/* Bottom Profile Section */}
        <ScrollView
          style={[
            styles.bottomSection,
            isScrollExpanded && styles.bottomSectionExpanded,
            { paddingTop: isScrollExpanded ? 0 : 60 },
          ]}
          showsVerticalScrollIndicator={true}
          indicatorStyle={isDark ? "white" : "black"}
          stickyHeaderIndices={isScrollExpanded ? [0] : undefined}
          bounces={true}
          contentContainerStyle={{ paddingBottom: 28 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Sticky header (only in full view): compact header + tabs + search */}
          {isScrollExpanded && (
            <View>
              <TravelStickyHeader
                activeTab={activeTab}
                onChange={setActiveTab}
                tripsCount={filteredTrips.length}
                placesCount={samplePlaces.length}
                showSearchBar={showSearchBar}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchToggle={() => {
                  setShowSearchBar(!showSearchBar);
                  if (showSearchBar) {
                    setSearchQuery(""); // Clear search when closing
                  }
                }}
              />
            </View>
          )}

          {/* Profile Section with Avatar and Icons */}
          <View style={styles.profileSection}>
            {false && (
              <TouchableOpacity
                style={[
                  styles.profileImageContainer,
                  styles.profileImageContainerExpanded,
                ]}
                onPress={() => setActiveScreen("profile")}
              >
                <Image
                  source={require("../../../../assets/icon.png")}
                  style={styles.profileImage as any}
                />
              </TouchableOpacity>
            )}

            {/* Settings and Share Icons positioned to the right of avatar */}
            {!isScrollExpanded && (
              <View
                style={[styles.profileActions, styles.profileActionsTopRight]}
              >
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => setShowSearchBar(!showSearchBar)}
                >
                  <Ionicons
                    name="search"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!isScrollExpanded && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Countries</Text>
              </View>
            </View>
          )}

          {/* Profile Info */}
          {!isScrollExpanded && (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>DHRUV PATHAK</Text>
              <Text style={styles.profileUsername}>@dhruvpathak9305</Text>
            </View>
          )}

          {/* Tabs (non-sticky) only when not expanded; expanded uses sticky header above */}
          {!isScrollExpanded && (
            <View>
              <TravelTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tripsCount={filteredTrips.length}
                placesCount={samplePlaces.length}
              />
            </View>
          )}

          {/* Year Section with Picker */}
          <View style={{ paddingHorizontal: 8 }}>
            <YearSectionWithPicker
              trips={sampleTrips}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={handleYearChange}
              onMonthChange={handleMonthChange}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
            />
          </View>

          {/* Content based on active tab */}
          {activeTab === "trips" ? (
            <View
              style={styles.tripsContainer}
              key={`trips-${selectedYear}-${selectedMonth}`}
            >
              {filteredTrips.map((trip, idx) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onPress={handleTripPress}
                  onInvitePress={handleTripInvitePress}
                  index={idx + 1}
                />
              ))}
            </View>
          ) : (
            <View style={styles.placesContainer}>
              {samplePlaces.map((place, index) => {
                if (index % 2 === 0) {
                  const nextPlace = samplePlaces[index + 1];
                  return (
                    <View key={`row-${index}`} style={styles.placesRow}>
                      <PlaceCard place={place} onPress={handlePlacePress} />
                      {nextPlace && (
                        <PlaceCard
                          place={nextPlace}
                          onPress={handlePlacePress}
                        />
                      )}
                    </View>
                  );
                }
                return null;
              })}
            </View>
          )}

          {/* Bottom spacer minimized - list should naturally fill */}
          <View style={{ height: 0 }} />
        </ScrollView>

        {/* Floating Quick Actions Button */}
        <TravelFab />
      </View>
    );
  };

  // Profile Screen
  const renderProfileScreen = () => {
    return (
      <View style={styles.container}>
        {/* Header with smaller globe */}
        <View style={styles.profileHeaderContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.scratchButton}>
              <Ionicons name="globe-outline" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="search" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Smaller Globe */}
          <View style={styles.smallGlobeContainer}>
            <View style={styles.smallGlobe}>
              {/* Africa */}
              <View style={[styles.smallContinent, styles.smallAfrica]} />
              {/* Europe */}
              <View style={[styles.smallContinent, styles.smallEurope]} />
              {/* Asia */}
              <View style={[styles.smallContinent, styles.smallAsia]} />
              {/* North America */}
              <View style={[styles.smallContinent, styles.smallNorthAmerica]} />
              {/* South America */}
              <View style={[styles.smallContinent, styles.smallSouthAmerica]} />
              {/* Small orange dot */}
              <View style={styles.smallLocationDot} />
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfoSection}>
          <View style={styles.profileImageContainer2}>
            <Image
              source={require("../../../../assets/icon.png")}
              style={styles.profileImage2 as any}
            />
          </View>

          <View style={styles.statsContainer2}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
          </View>

          <Text style={styles.profileName}>DHRUV PATHAK</Text>
          <Text style={styles.profileUsername}>@dhruvpathak9305</Text>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.profileActionButton}>
              <Ionicons name="settings-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileActionButton}>
              <Ionicons name="share-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "trips" && styles.activeTab]}
            onPress={() => setActiveTab("trips")}
          >
            <Ionicons name="map-outline" size={18} color="#10b981" />
            <Text style={[styles.tabText, styles.activeTabText]}>Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "places" && styles.activeTab]}
            onPress={() => setActiveTab("places")}
          >
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.tabText}>Places</Text>
          </TouchableOpacity>
        </View>

        {/* Year Section */}
        <View style={styles.yearSection}>
          <Text style={styles.yearText}>2025</Text>
          <Text style={styles.tripCount}>1 Trip</Text>
        </View>

        {/* Trip Card */}
        <TouchableOpacity
          style={styles.tripCard}
          onPress={() => setActiveScreen("tripDetail")}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000",
            }}
            style={styles.tripImage}
          />

          <View style={styles.tripOverlay}>
            <View style={styles.tripBadges}>
              <View style={styles.badge}>
                <Ionicons name="color-wand-outline" size={14} color="#fff" />
              </View>
              <View style={styles.badge}>
                <Ionicons name="moon" size={14} color="#fff" />
                <Text style={styles.badgeText}>1</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="location" size={14} color="#fff" />
                <Text style={styles.badgeText}>5</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
              </View>
            </View>

            <TouchableOpacity style={styles.inviteButton}>
              <Ionicons name="person-add" size={14} color="#fff" />
              <Text style={styles.inviteText}>Invite</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Floating Quick Actions Button */}
        <TravelFab />
      </View>
    );
  };

  // Trip Detail Screen
  const renderTripDetailScreen = () => {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.tripDetailHeader}>
          <TouchableOpacity onPress={() => setActiveScreen("profile")}>
            <Image
              source={require("../../../../assets/icon.png")}
              style={styles.headerProfileImage as any}
            />
          </TouchableOpacity>
          <Text style={styles.headerProfileName}>DHRUV PATHAK</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Ionicons name="map-outline" size={18} color="#10b981" />
            <Text style={[styles.tabText, styles.activeTabText]}>Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.tabText}>Places</Text>
          </TouchableOpacity>
        </View>

        {/* Year Section */}
        <View style={styles.yearSection}>
          <Text style={styles.yearText}>2025</Text>
          <Text style={styles.tripCount}>1 Trip</Text>
        </View>

        {/* Trip Detail Card */}
        <View style={styles.tripDetailCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000",
            }}
            style={styles.tripDetailImage as any}
          />

          <View style={styles.tripOverlay}>
            <View style={styles.tripBadges}>
              <View style={styles.badge}>
                <Ionicons name="color-wand-outline" size={14} color="#fff" />
              </View>
              <View style={styles.badge}>
                <Ionicons name="moon" size={14} color="#fff" />
                <Text style={styles.badgeText}>1</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="location" size={14} color="#fff" />
                <Text style={styles.badgeText}>5</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
              </View>
            </View>

            <TouchableOpacity style={styles.inviteButton}>
              <Ionicons name="person-add" size={14} color="#fff" />
              <Text style={styles.inviteText}>Invite</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tripInfo}>
            <Text style={styles.tripLocation}>Sikkim</Text>
            <View style={styles.tripDateRow}>
              <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
              <Text style={styles.tripDate}>02 Apr 2025 - 03 Apr 2025</Text>
            </View>
          </View>

          <View style={styles.tripActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar-outline" size={22} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="cash-outline" size={22} color="#f59e0b" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#ec4899"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="camera-outline" size={22} color="#8b5cf6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Quick Actions Button */}
        <TravelFab />
      </View>
    );
  };

  const renderContent = () => {
    switch (activeScreen) {
      case "home":
        return renderHomeScreen();
      case "profile":
        return renderProfileScreen();
      case "tripDetail":
        return renderTripDetailScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#C7E7F0" />
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#C7E7F0",
  },
  container: {
    flex: 1,
    backgroundColor: "#C7E7F0",
  },

  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  scratchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#B8D4E3",
    justifyContent: "center",
    alignItems: "center",
  },

  // Map styles
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%", // Increased from 50% for better world view
    zIndex: 1,
  },
  map: {
    flex: 1,
  },

  // Overlay header styles
  overlayHeader: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },

  leftHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Small globe for profile screen
  smallGlobeContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  smallGlobe: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: (SCREEN_WIDTH * 0.55) / 2,
    backgroundColor: "#7DD3FC",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  smallContinent: {
    position: "absolute",
    backgroundColor: "#86EFAC",
    borderRadius: 6,
  },
  smallAfrica: {
    width: 30,
    height: 45,
    top: "35%",
    left: "48%",
    backgroundColor: "#BBF7D0",
  },
  smallEurope: {
    width: 18,
    height: 22,
    top: "25%",
    left: "50%",
    backgroundColor: "#86EFAC",
  },
  smallAsia: {
    width: 40,
    height: 35,
    top: "20%",
    right: "25%",
    backgroundColor: "#BBF7D0",
  },
  smallNorthAmerica: {
    width: 35,
    height: 40,
    top: "15%",
    left: "15%",
    backgroundColor: "#86EFAC",
  },
  smallSouthAmerica: {
    width: 20,
    height: 35,
    top: "50%",
    left: "25%",
    backgroundColor: "#BBF7D0",
  },
  smallLocationDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#f59e0b",
    top: "30%",
    right: "35%",
  },

  // Bottom section styles
  bottomSection: {
    position: "absolute",
    top: "60%", // Updated to match map height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: -35,
    marginBottom: 15,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },

  // Profile screen styles
  profileHeaderContainer: {
    backgroundColor: "#C7E7F0",
  },
  profileInfoSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingHorizontal: 20,
    marginTop: -15,
    position: "relative",
  },
  profileImageContainer2: {
    alignItems: "center",
    marginTop: -35,
    marginBottom: 12,
  },
  profileImage2: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#fff",
  },
  statsContainer2: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 15,
  },
  profileActions: {
    flexDirection: "row",
    position: "absolute",
    right: 15,
    top: 15,
    gap: 8,
  },
  profileActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Tabs styles
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 25,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 5,
  },
  activeTabText: {
    color: "#10b981",
  },

  // Year section
  yearSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 18,
  },
  yearText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  tripCount: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },

  // Trip card styles
  tripCard: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 15,
  },
  tripImage: {
    width: "100%",
    height: 180,
  },
  tripOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
  },
  tripBadges: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 3,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inviteText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 3,
  },

  // Trip detail screen
  tripDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#C7E7F0",
  },
  headerProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerProfileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  tripDetailCard: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 15,
  },
  tripDetailImage: {
    width: "100%",
    height: 200,
  },
  tripInfo: {
    padding: 14,
  },
  tripLocation: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  tripDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  tripActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // Bottom navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 18,
    zIndex: 15,
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  navText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 3,
  },
  activeNavText: {
    color: "#10b981",
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapOptionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapOptionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  mapOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedMapOption: {
    backgroundColor: "#F0FDF4",
  },
  mapOptionText: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 12,
  },
  selectedMapOptionText: {
    color: "#10b981",
    fontWeight: "600",
  },
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.surface,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
    scratchButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerButtons: {
      flexDirection: "row",
      gap: 8,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.card,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 3,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme.border,
    },
    mapContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "60%", // This will be overridden by animation
      zIndex: 1,
    },
    mapContainerCollapsed: {
      height: 0,
      opacity: 0,
    },
    map: {
      flex: 1,
    },
    overlayHeader: {
      position: "absolute",
      top: 20,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 20,
      zIndex: 10,
    },
    leftHeaderButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bottomSection: {
      position: "absolute",
      top: "60%", // This will be overridden by animation
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.card,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingTop: 15,
      paddingBottom: 20,
      paddingHorizontal: 5,
      zIndex: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      minHeight: 300, // Ensure minimum height for content visibility
    },
    bottomSectionExpanded: {
      top: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      paddingTop: 0,
    },
    // Floating avatar that overlaps map and profile card
    floatingAvatarContainer: {
      position: "absolute",
      top: "60%",
      left: 0,
      right: 0,
      alignItems: "center",
      marginTop: -45, // half of avatar size to overlap
      zIndex: 20,
      pointerEvents: "box-none",
    },
    floatingProfileImageContainer: {
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 20,
    },
    floatingProfileImage: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 4,
      borderColor: "#ffffff", // circular white boundary like screenshot
      backgroundColor: "#f0f0f0",
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "flex-start", // Changed from "center" to prevent cutoff
      justifyContent: "space-between",
      paddingHorizontal: 8,
      marginBottom: 15,
      paddingTop: 10, // Add padding to prevent cutoff
    },
    profileImageContainer: {
      alignItems: "center",
      marginTop: -40, // Reduced from -50 to prevent cutoff
      marginBottom: 0,
      overflow: "visible",
      zIndex: 15,
    },
    profileImageContainerExpanded: {
      marginTop: 0,
      marginBottom: 20,
    },
    expandedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
      zIndex: 12,
    },
    expandedHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: theme.card,
      backgroundColor: "#f0f0f0",
    },
    headerName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    headerHandle: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    expandedHeaderActions: {
      flexDirection: "row",
      gap: 12,
    },
    expandedHeaderButton: {
      padding: 6,
    },
    profileImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 3,
      borderColor: theme.card,
      overflow: "hidden",
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 8,
    },
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    bottomNav: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      backgroundColor: theme.tabBar,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: theme.tabBarBorder,
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 18,
      zIndex: 15,
    },
    navButton: {
      alignItems: "center",
      paddingVertical: 6,
    },
    navText: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 3,
    },
    activeNavText: {
      color: theme.primary,
    },
    addButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: -26,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 3,
      elevation: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    mapOptionsContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      minWidth: 200,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme.border,
    },
    mapOptionsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
      textAlign: "center",
    },
    mapOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    selectedMapOption: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#F0FDF4",
    },
    mapOptionText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginLeft: 12,
    },
    selectedMapOptionText: {
      color: theme.primary,
      fontWeight: "600",
    },
    profileInfo: {
      alignItems: "center",
      marginBottom: 16,
    },
    profileName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 2,
    },
    profileUsername: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    profileActions: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      marginTop: 0,
      paddingTop: 0,
    },
    profileActionsTopRight: {
      position: "absolute",
      right: -15,
      top: -25,
    },
    settingsButton: {
      padding: 8,
    },
    shareButton: {
      padding: 8,
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
      gap: 8,
    },
    activeTab: {
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    activeTabText: {
      color: theme.primary,
      fontWeight: "600",
    },
    yearSection: {
      alignItems: "center",
      marginBottom: 20,
    },
    yearText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    tripCount: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    contentScrollView: {
      flex: 1,
    },
    tripsContainer: {
      paddingBottom: 20,
      paddingHorizontal: 8,
    },
    placesContainer: {
      paddingHorizontal: 10,
    },
    placesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    bottomPadding: {
      height: 100,
    },
    // Add other styles as needed for profile and trip detail screens
    profileHeaderContainer: {
      backgroundColor: theme.surface,
      paddingBottom: 20,
    },
    smallGlobeContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 30,
    },
    smallGlobe: {
      width: SCREEN_WIDTH * 0.4,
      height: SCREEN_WIDTH * 0.4,
      borderRadius: (SCREEN_WIDTH * 0.4) / 2,
      backgroundColor: isDark ? theme.surface : "#7DD3FC",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 4,
      position: "relative",
      overflow: "hidden",
    },
    smallContinent: {
      position: "absolute",
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    smallAfrica: {
      width: 20,
      height: 30,
      top: "40%",
      left: "48%",
      backgroundColor: isDark ? "#34D399" : "#BBF7D0",
    },
    smallEurope: {
      width: 12,
      height: 15,
      top: "30%",
      left: "50%",
      backgroundColor: theme.primary,
    },
    smallAsia: {
      width: 25,
      height: 20,
      top: "25%",
      right: "30%",
      backgroundColor: isDark ? "#34D399" : "#BBF7D0",
    },
    smallNorthAmerica: {
      width: 20,
      height: 25,
      top: "20%",
      left: "20%",
      backgroundColor: theme.primary,
    },
    smallSouthAmerica: {
      width: 12,
      height: 20,
      top: "55%",
      left: "30%",
      backgroundColor: isDark ? "#34D399" : "#BBF7D0",
    },
    smallAustralia: {
      width: 8,
      height: 6,
      bottom: "25%",
      right: "35%",
      backgroundColor: theme.primary,
    },
    smallLocationDot: {
      position: "absolute",
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.warning,
      top: "30%",
      right: "35%",
    },
    profileInfoSection: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingTop: 30,
      paddingHorizontal: 20,
      marginTop: -15,
    },
    profileImageContainer2: {
      alignItems: "center",
      marginTop: -45,
      marginBottom: 20,
    },
    profileImage2: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 4,
      borderColor: theme.card,
    },
    statsContainer2: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    profileBio: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
    },
    profileActionButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      minWidth: 100,
      alignItems: "center",
    },
    profileActionButtonSecondary: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.border,
    },
    profileActionText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    profileActionTextSecondary: {
      color: theme.text,
    },
    tripDetailHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.card,
    },
    headerProfileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    headerProfileName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      flex: 1,
    },
    tripCard: {
      backgroundColor: theme.card,
      margin: 20,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    tripDetailCard: {
      backgroundColor: theme.card,
      margin: 20,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    tripImage: {
      width: "100%",
      height: 200,
    },
    tripDetailImage: {
      width: "100%",
      height: 250,
    },
    tripOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "space-between",
      padding: 16,
    },
    tripBadges: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    badgeText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "500",
    },
    inviteButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: "flex-end",
      gap: 6,
    },
    inviteText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },
    tripInfo: {
      padding: 16,
    },
    tripTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    tripDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    tripActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    actionButton: {
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    tripLocation: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    tripDateRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    tripDate: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 4,
    },
  });

export default MobileTravel;
