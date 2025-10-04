import { useState, useCallback, useRef } from "react";
import { Alert } from "react-native";
import MapView, { Region } from "react-native-maps";
import { TravelMarker, MapState, MapError } from "../types/map";

export const useTravelMap = () => {
  const mapRef = useRef<MapView>(null);
  const [mapState, setMapState] = useState<MapState>({
    isLoading: false,
    error: null,
    userLocation: null,
    currentRegion: null,
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

  // Handle marker press with customizable behavior
  const handleMarkerPress = useCallback(
    (marker: TravelMarker, customHandler?: (marker: TravelMarker) => void) => {
      try {
        if (customHandler) {
          customHandler(marker);
        } else {
          Alert.alert(marker.name, marker.description || "Travel destination", [
            { text: "Cancel", style: "cancel" },
            {
              text: "View Details",
              onPress: () => console.log("View details for:", marker.name),
            },
          ]);
        }
      } catch (error) {
        handleError(error, "handleMarkerPress");
      }
    },
    [handleError]
  );

  // Handle region change
  const handleRegionChange = useCallback(
    (region: Region) => {
      try {
        setMapState((prev) => ({ ...prev, currentRegion: region }));
      } catch (error) {
        handleError(error, "handleRegionChange");
      }
    },
    [handleError]
  );

  // Focus on specific coordinates
  const focusOnLocation = useCallback(
    (
      latitude: number,
      longitude: number,
      latitudeDelta: number = 0.05,
      longitudeDelta: number = 0.05
    ) => {
      try {
        if (mapRef.current) {
          const region = {
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta,
          };
          mapRef.current.animateToRegion(region, 1000);
        }
      } catch (error) {
        handleError(error, "focusOnLocation");
      }
    },
    [handleError]
  );

  // Focus on all markers
  const focusOnAllMarkers = useCallback(
    (markers: TravelMarker[]) => {
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
    },
    [handleError]
  );

  // Filter markers by type
  const filterMarkersByType = useCallback(
    (markers: TravelMarker[], type: TravelMarker["type"]) => {
      return markers.filter((marker) => marker.type === type);
    },
    []
  );

  // Get marker statistics
  const getMarkerStats = useCallback((markers: TravelMarker[]) => {
    const stats = {
      total: markers.length,
      visited: markers.filter((m) => m.type === "visited").length,
      planned: markers.filter((m) => m.type === "planned").length,
      destinations: markers.filter((m) => m.type === "destination").length,
      current: markers.filter((m) => m.type === "current").length,
    };
    return stats;
  }, []);

  // Reset map state
  const resetMapState = useCallback(() => {
    setMapState({
      isLoading: false,
      error: null,
      userLocation: null,
      currentRegion: null,
    });
  }, []);

  return {
    mapRef,
    mapState,
    setMapState,
    handleError,
    handleMarkerPress,
    handleRegionChange,
    focusOnLocation,
    focusOnAllMarkers,
    filterMarkersByType,
    getMarkerStats,
    resetMapState,
  };
};
