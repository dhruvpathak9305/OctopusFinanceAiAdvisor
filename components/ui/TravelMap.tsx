import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
  MapPressEvent,
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  TravelMapProps,
  TravelMarker,
  MapError,
  MapState,
} from "../../types/map";
import { defaultRegion } from "../../assets/data/travelMarkers";
import { useTheme, lightTheme, darkTheme } from "../../contexts/ThemeContext";

// Dark map style for Google Maps
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#212121",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#212121",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#181818",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1b1b1b",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#2c2c2c",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8a8a8a",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#373737",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#3c3c3c",
      },
    ],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#4e4e4e",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#000000",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3d3d3d",
      },
    ],
  },
];

const TravelMap: React.FC<TravelMapProps> = ({
  markers = [],
  initialRegion = defaultRegion,
  onMarkerPress,
  onRegionChange,
  showUserLocation = true,
  showMyLocationButton = true,
  style,
  mapType = "standard",
  animateToUserLocation = false,
}) => {
  const mapRef = useRef<MapView>(null);

  // Theme context
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createMapStyles(theme, isDark);

  const [mapState, setMapState] = useState<MapState>({
    isLoading: true,
    error: null,
    userLocation: null,
    currentRegion: initialRegion,
  });

  // Error handling function
  const handleError = useCallback((error: any, context: string) => {
    console.error(`TravelMap Error (${context}):`, error);
    const mapError: MapError = {
      code: error.code || "UNKNOWN_ERROR",
      message: error.message || `An error occurred in ${context}`,
      details: error,
    };
    setMapState((prev) => ({ ...prev, error: mapError, isLoading: false }));
  }, []);

  // Request location permissions and get user location
  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMapState((prev) => ({ ...prev, userLocation }));

      if (animateToUserLocation && mapRef.current) {
        const userRegion = {
          ...userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        mapRef.current.animateToRegion(userRegion, 1000);
      }
    } catch (error) {
      handleError(error, "getUserLocation");
    }
  }, [animateToUserLocation, handleError]);

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setMapState((prev) => ({ ...prev, isLoading: true, error: null }));

        if (showUserLocation) {
          await getUserLocation();
        }

        setMapState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        handleError(error, "initializeMap");
      }
    };

    initializeMap();
  }, [showUserLocation, getUserLocation, handleError]);

  // Handle marker press
  const handleMarkerPress = useCallback(
    (marker: TravelMarker) => {
      try {
        if (onMarkerPress) {
          onMarkerPress(marker);
        } else {
          Alert.alert(marker.name, marker.description || "Travel destination", [
            { text: "OK" },
          ]);
        }
      } catch (error) {
        handleError(error, "handleMarkerPress");
      }
    },
    [onMarkerPress, handleError]
  );

  // Handle region change
  const handleRegionChange = useCallback(
    (region: Region) => {
      try {
        setMapState((prev) => ({ ...prev, currentRegion: region }));
        if (onRegionChange) {
          onRegionChange(region);
        }
      } catch (error) {
        handleError(error, "handleRegionChange");
      }
    },
    [onRegionChange, handleError]
  );

  // Focus on user location
  const focusOnUserLocation = useCallback(async () => {
    try {
      if (mapState.userLocation && mapRef.current) {
        const userRegion = {
          ...mapState.userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        mapRef.current.animateToRegion(userRegion, 1000);
      } else {
        await getUserLocation();
      }
    } catch (error) {
      handleError(error, "focusOnUserLocation");
    }
  }, [mapState.userLocation, getUserLocation, handleError]);

  // Zoom in function
  const zoomIn = useCallback(() => {
    try {
      if (mapRef.current && mapState.currentRegion) {
        // Use stored region for more reliable zoom functionality
        const currentRegion = mapState.currentRegion;
        const newRegion = {
          latitude: currentRegion.latitude,
          longitude: currentRegion.longitude,
          latitudeDelta: Math.max(currentRegion.latitudeDelta * 0.5, 0.01),
          longitudeDelta: Math.max(currentRegion.longitudeDelta * 0.5, 0.01),
        };

        console.log("Zooming in from:", currentRegion, "to:", newRegion);
        mapRef.current.animateToRegion(newRegion, 300);
        setMapState((prev) => ({ ...prev, currentRegion: newRegion }));
      }
    } catch (error) {
      handleError(error, "zoomIn");
    }
  }, [mapState.currentRegion, handleError]);

  // Zoom out function
  const zoomOut = useCallback(() => {
    try {
      if (mapRef.current && mapState.currentRegion) {
        // Use stored region for more reliable zoom functionality
        const currentRegion = mapState.currentRegion;
        const newRegion = {
          latitude: currentRegion.latitude,
          longitude: currentRegion.longitude,
          latitudeDelta: Math.min(currentRegion.latitudeDelta * 2, 180),
          longitudeDelta: Math.min(currentRegion.longitudeDelta * 2, 360),
        };

        console.log("Zooming out from:", currentRegion, "to:", newRegion);
        mapRef.current.animateToRegion(newRegion, 300);
        setMapState((prev) => ({ ...prev, currentRegion: newRegion }));
      }
    } catch (error) {
      handleError(error, "zoomOut");
    }
  }, [mapState.currentRegion, handleError]);

  // Reset to world view
  const resetToWorldView = useCallback(() => {
    try {
      if (mapRef.current) {
        const worldRegion = {
          latitude: 20.0,
          longitude: 0.0,
          latitudeDelta: 120.0,
          longitudeDelta: 120.0,
        };
        console.log("Resetting to world view:", worldRegion);
        mapRef.current.animateToRegion(worldRegion, 1000);
        setMapState((prev) => ({ ...prev, currentRegion: worldRegion }));
      }
    } catch (error) {
      handleError(error, "resetToWorldView");
    }
  }, [handleError]);

  // Focus on all markers
  const focusOnAllMarkers = useCallback(() => {
    try {
      if (markers.length > 0 && mapRef.current) {
        const coordinates = markers.map((marker) => ({
          latitude: marker.latitude,
          longitude: marker.longitude,
        }));

        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      handleError(error, "focusOnAllMarkers");
    }
  }, [markers, handleError]);

  // Get marker color based on type
  const getMarkerColor = (type: TravelMarker["type"]) => {
    switch (type) {
      case "visited":
        return "#10B981"; // Green
      case "planned":
        return "#F59E0B"; // Yellow
      case "current":
        return "#EF4444"; // Red
      default:
        return "#3B82F6"; // Blue
    }
  };

  // Retry function for error recovery
  const retryInitialization = useCallback(() => {
    setMapState((prev) => ({ ...prev, error: null, isLoading: true }));
    getUserLocation();
  }, [getUserLocation]);

  // Error fallback UI
  if (mapState.error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Map Error</Text>
          <Text style={styles.errorMessage}>{mapState.error.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={retryInitialization}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading UI
  if (mapState.isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_GOOGLE}
        mapType={mapType}
        onRegionChangeComplete={handleRegionChange}
        customMapStyle={isDark ? darkMapStyle : undefined}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.name}
            description={marker.description}
            onPress={() => handleMarkerPress(marker)}
            pinColor={getMarkerColor(marker.type)}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
                {marker.description && (
                  <Text style={styles.calloutDescription}>
                    {marker.description}
                  </Text>
                )}
                {marker.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{marker.rating}</Text>
                  </View>
                )}
                {marker.visitDate && (
                  <Text style={styles.visitDate}>
                    Visited: {marker.visitDate}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
            <Ionicons name="add" size={20} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
            <Ionicons name="remove" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Other Controls */}
        <View style={styles.otherControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetToWorldView}
          >
            <Ionicons name="globe-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>

          {showMyLocationButton && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={focusOnUserLocation}
            >
              <Ionicons name="locate" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}

          {markers.length > 0 && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={focusOnAllMarkers}
            >
              <Ionicons name="resize" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const createMapStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    errorContainer: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.surface,
    },
    errorContent: {
      alignItems: "center",
      padding: 20,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 12,
      marginBottom: 8,
    },
    errorMessage: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.surface,
    },
    loadingText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 12,
    },
    controlsContainer: {
      position: "absolute",
      top: 20,
      right: 20,
      flexDirection: "column",
      gap: 15,
    },
    zoomControls: {
      flexDirection: "column",
      gap: 8,
    },
    otherControls: {
      flexDirection: "column",
      gap: 8,
    },
    controlButton: {
      backgroundColor: theme.card,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme.border,
    },
    calloutContainer: {
      padding: 10,
      minWidth: 150,
      maxWidth: 200,
      backgroundColor: theme.card,
      borderRadius: 8,
    },
    calloutTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    calloutDescription: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 6,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    ratingText: {
      fontSize: 12,
      color: theme.text,
      marginLeft: 4,
    },
    visitDate: {
      fontSize: 11,
      color: theme.success,
      fontStyle: "italic",
    },
  });

export default TravelMap;
