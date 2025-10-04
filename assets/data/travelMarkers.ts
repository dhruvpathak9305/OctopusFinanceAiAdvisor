import { TravelMarker } from "../../types/map";

export const travelMarkers: TravelMarker[] = [
  // Popular Travel Destinations
  {
    id: "paris-france",
    latitude: 48.8566,
    longitude: 2.3522,
    name: "Paris, France",
    description: "City of Light and Love",
    type: "destination",
    image:
      "https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1000",
    rating: 4.8,
  },
  {
    id: "tokyo-japan",
    latitude: 35.6762,
    longitude: 139.6503,
    name: "Tokyo, Japan",
    description: "Modern metropolis with ancient traditions",
    type: "destination",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000",
    rating: 4.7,
  },
  {
    id: "new-york-usa",
    latitude: 40.7128,
    longitude: -74.006,
    name: "New York, USA",
    description: "The Big Apple",
    type: "visited",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000",
    rating: 4.6,
    visitDate: "2023-08-15",
  },
  {
    id: "london-uk",
    latitude: 51.5074,
    longitude: -0.1278,
    name: "London, UK",
    description: "Historic capital with royal heritage",
    type: "planned",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000",
    rating: 4.5,
  },
  {
    id: "sydney-australia",
    latitude: -33.8688,
    longitude: 151.2093,
    name: "Sydney, Australia",
    description: "Harbor city with iconic Opera House",
    type: "destination",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000",
    rating: 4.7,
  },
  {
    id: "bali-indonesia",
    latitude: -8.3405,
    longitude: 115.092,
    name: "Bali, Indonesia",
    description: "Tropical paradise with rich culture",
    type: "visited",
    image:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=1000",
    rating: 4.8,
    visitDate: "2023-12-10",
  },
  {
    id: "dubai-uae",
    latitude: 25.2048,
    longitude: 55.2708,
    name: "Dubai, UAE",
    description: "Futuristic city in the desert",
    type: "planned",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
    rating: 4.4,
  },
  {
    id: "rome-italy",
    latitude: 41.9028,
    longitude: 12.4964,
    name: "Rome, Italy",
    description: "Eternal city with ancient wonders",
    type: "destination",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000",
    rating: 4.6,
  },
];

export const defaultRegion = {
  latitude: 20.0,
  longitude: 0.0,
  latitudeDelta: 120.0,
  longitudeDelta: 120.0,
};

export const getMarkersByType = (type: TravelMarker["type"]) => {
  return travelMarkers.filter((marker) => marker.type === type);
};

export const getMarkerById = (id: string) => {
  return travelMarkers.find((marker) => marker.id === id);
};
