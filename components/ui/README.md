# TravelMap Component

A reusable, feature-rich map component for travel applications built with React Native Maps.

## Features

- 🗺️ Interactive map with custom markers
- 📍 Location-based services with user location
- 🎯 Marker categorization (visited, planned, destination, current)
- 🔍 Map controls (focus on user location, fit all markers)
- ⚠️ Comprehensive error handling and fallback UI
- 📱 Cross-platform support (iOS/Android)
- 🎨 Customizable styling and theming
- 🔧 TypeScript support with full type safety

## Installation

Make sure you have the required dependencies installed:

```bash
npx expo install react-native-maps expo-location
```

## Basic Usage

```tsx
import TravelMap from "../components/ui/TravelMap";
import { travelMarkers } from "../assets/data/travelMarkers";

function MyTravelScreen() {
  const handleMarkerPress = (marker) => {
    console.log("Marker pressed:", marker.name);
  };

  return (
    <TravelMap
      markers={travelMarkers}
      onMarkerPress={handleMarkerPress}
      showUserLocation={true}
      showMyLocationButton={true}
    />
  );
}
```

## Props

| Prop                    | Type                                                 | Default         | Description                           |
| ----------------------- | ---------------------------------------------------- | --------------- | ------------------------------------- |
| `markers`               | `TravelMarker[]`                                     | `[]`            | Array of travel markers to display    |
| `initialRegion`         | `MapRegion`                                          | `defaultRegion` | Initial map region                    |
| `onMarkerPress`         | `(marker: TravelMarker) => void`                     | `undefined`     | Callback when marker is pressed       |
| `onRegionChange`        | `(region: Region) => void`                           | `undefined`     | Callback when map region changes      |
| `showUserLocation`      | `boolean`                                            | `true`          | Show user's current location          |
| `showMyLocationButton`  | `boolean`                                            | `true`          | Show location button                  |
| `style`                 | `ViewStyle`                                          | `undefined`     | Custom container style                |
| `mapType`               | `'standard' \| 'satellite' \| 'hybrid' \| 'terrain'` | `'standard'`    | Map display type                      |
| `animateToUserLocation` | `boolean`                                            | `false`         | Auto-animate to user location on load |

## Marker Types

The component supports different marker types with color coding:

- **`destination`** - Blue markers for general destinations
- **`visited`** - Green markers for places you've been
- **`planned`** - Yellow markers for planned trips
- **`current`** - Red markers for current location

## Error Handling

The component includes comprehensive error handling:

- **Location Permission Errors**: Graceful handling when location access is denied
- **Map Loading Errors**: Fallback UI with retry functionality
- **Network Errors**: Proper error messages and recovery options
- **Invalid Data Errors**: Validation and safe rendering

## Custom Hook Usage

Use the `useTravelMap` hook for advanced functionality:

```tsx
import { useTravelMap } from "../hooks/useTravelMap";

function AdvancedTravelScreen() {
  const {
    mapRef,
    mapState,
    handleMarkerPress,
    focusOnLocation,
    focusOnAllMarkers,
    getMarkerStats,
  } = useTravelMap();

  const stats = getMarkerStats(travelMarkers);

  return (
    <View>
      <Text>Visited: {stats.visited} places</Text>
      <TravelMap
        ref={mapRef}
        markers={travelMarkers}
        onMarkerPress={(marker) => handleMarkerPress(marker, customHandler)}
      />
    </View>
  );
}
```

## Data Structure

### TravelMarker

```typescript
interface TravelMarker {
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
```

### MapRegion

```typescript
interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
```

## Customization

### Styling

Override default styles by passing custom styles:

```tsx
<TravelMap style={{ borderRadius: 15, margin: 10 }} markers={markers} />
```

### Custom Marker Handler

Implement custom behavior for marker interactions:

```tsx
const handleCustomMarkerPress = (marker: TravelMarker) => {
  // Navigate to detail screen
  navigation.navigate("TravelDetail", { markerId: marker.id });

  // Show custom modal
  setSelectedMarker(marker);
  setModalVisible(true);

  // Track analytics
  analytics.track("marker_pressed", { location: marker.name });
};
```

## Performance Tips

1. **Limit Markers**: For better performance, limit the number of markers displayed
2. **Lazy Loading**: Load markers based on map region
3. **Clustering**: Consider marker clustering for dense areas
4. **Image Optimization**: Optimize marker images for faster loading

## Troubleshooting

### Common Issues

1. **Map not showing**: Ensure proper API keys are configured
2. **Location not working**: Check location permissions
3. **Markers not appearing**: Verify marker data structure
4. **Performance issues**: Reduce number of markers or implement clustering

### Platform-Specific Notes

- **iOS**: Requires location usage description in Info.plist
- **Android**: Requires Google Maps API key configuration
- **Web**: Limited functionality, consider alternative solutions

## Examples

Check the `src/mobile/pages/MobileTravel/index.tsx` file for a complete implementation example.

---

# TripCard Component

A reusable card component for displaying trip information with rich visuals and interactive elements.

## Usage

```tsx
import TripCard from "./TripCard";

<TripCard
  trip={tripData}
  onPress={handleTripPress}
  onInvitePress={handleInvitePress}
/>;
```

## Props

| Prop            | Type                       | Description                                     |
| --------------- | -------------------------- | ----------------------------------------------- |
| `trip`          | `TripData`                 | Trip data object                                |
| `onPress`       | `(trip: TripData) => void` | Optional callback when card is pressed          |
| `onInvitePress` | `(trip: TripData) => void` | Optional callback when invite button is pressed |

## TripData Interface

```tsx
interface TripData {
  id: string;
  title: string;
  location: string;
  dates: string;
  image: string;
  nights: number;
  places: number;
  isCompleted?: boolean;
  badges?: {
    icon: string;
    count: number;
  }[];
}
```

---

# PlaceCard Component

A compact card component for displaying place information in a grid layout.

## Usage

```tsx
import PlaceCard from "./PlaceCard";

<PlaceCard place={placeData} onPress={handlePlacePress} />;
```

## Props

| Prop      | Type                         | Description                            |
| --------- | ---------------------------- | -------------------------------------- |
| `place`   | `PlaceData`                  | Place data object                      |
| `onPress` | `(place: PlaceData) => void` | Optional callback when card is pressed |

## PlaceData Interface

```tsx
interface PlaceData {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  visited: boolean;
  visitDate?: string;
}
```

## Features

- **Theme Support**: All components automatically adapt to light/dark themes
- **Responsive Design**: Components work on various screen sizes
- **Accessibility**: Proper touch targets and screen reader support
- **Extensible**: Easy to extend with additional props and functionality
- **Type Safety**: Full TypeScript support with proper interfaces
