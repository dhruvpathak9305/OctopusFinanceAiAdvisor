import { Region } from "react-native-maps";

export interface TravelMarker {
  id: string;
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  name: string;
  description?: string;
  type: "destination" | "visited" | "planned" | "current";
  image?: string;
  rating?: number;
  visitDate?: string;
}

export interface MapRegion extends Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface TravelMapProps {
  markers?: TravelMarker[];
  initialRegion?: MapRegion;
  onMarkerPress?: (marker: TravelMarker) => void;
  onRegionChange?: (region: Region) => void;
  showUserLocation?: boolean;
  showMyLocationButton?: boolean;
  style?: any;
  mapType?: "standard" | "satellite" | "hybrid" | "terrain";
  animateToUserLocation?: boolean;
}

export interface MapError {
  code: string;
  message: string;
  details?: any;
}

export interface MapState {
  isLoading: boolean;
  error: MapError | null;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  currentRegion: MapRegion | null;
}
