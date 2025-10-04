import { TripData } from "../../components/ui/TripCard";

export const sampleTrips: TripData[] = [
  {
    id: "sikkim-2025",
    title: "Sikkim",
    location: "India",
    dates: "02 Apr 2025 - 03 Apr 2025",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000",
    nights: 1,
    places: 5,
    isCompleted: false,
    badges: [
      { icon: "flash", count: 1 },
      { icon: "sunny", count: 2 },
      { icon: "moon", count: 1 },
      { icon: "location", count: 5 },
      { icon: "checkmark-circle", count: 0 },
    ],
  },
  {
    id: "paris-2025",
    title: "Paris Adventure",
    location: "France",
    dates: "15 Dec 2025 - 22 Dec 2025",
    image:
      "https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1000",
    nights: 7,
    places: 12,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 3 },
      { icon: "sunny", count: 8 },
      { icon: "moon", count: 7 },
      { icon: "location", count: 12 },
      { icon: "checkmark-circle", count: 12 },
    ],
  },
  {
    id: "tokyo-2025",
    title: "Tokyo Discovery",
    location: "Japan",
    dates: "10 Jun 2025 - 18 Jun 2025",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000",
    nights: 8,
    places: 15,
    isCompleted: false,
    badges: [
      { icon: "flash", count: 2 },
      { icon: "sunny", count: 9 },
      { icon: "moon", count: 8 },
      { icon: "location", count: 15 },
      { icon: "checkmark-circle", count: 0 },
    ],
  },
  {
    id: "bali-2025",
    title: "Bali Retreat",
    location: "Indonesia",
    dates: "05 Oct 2025 - 12 Oct 2025",
    image:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=1000",
    nights: 7,
    places: 8,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 4 },
      { icon: "sunny", count: 8 },
      { icon: "moon", count: 7 },
      { icon: "location", count: 8 },
      { icon: "checkmark-circle", count: 8 },
    ],
  },
  {
    id: "iceland-2025",
    title: "Iceland Northern Lights",
    location: "Iceland",
    dates: "20 Feb 2025 - 28 Feb 2025",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000",
    nights: 8,
    places: 10,
    isCompleted: false,
    badges: [
      { icon: "flash", count: 2 },
      { icon: "sunny", count: 9 },
      { icon: "moon", count: 8 },
      { icon: "location", count: 10 },
      { icon: "checkmark-circle", count: 0 },
    ],
  },
  {
    id: "thailand-2025",
    title: "Thailand Beach Hopping",
    location: "Thailand",
    dates: "08 Nov 2025 - 20 Nov 2025",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000",
    nights: 12,
    places: 6,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 5 },
      { icon: "sunny", count: 13 },
      { icon: "moon", count: 12 },
      { icon: "location", count: 6 },
      { icon: "checkmark-circle", count: 6 },
    ],
  },
  // Add some 2024 trips for better filtering testing
  {
    id: "morocco-2024",
    title: "Morocco Desert Safari",
    location: "Morocco",
    dates: "15 Mar 2024 - 25 Mar 2024",
    image:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1000",
    nights: 10,
    places: 8,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 3 },
      { icon: "sunny", count: 11 },
      { icon: "moon", count: 10 },
      { icon: "location", count: 8 },
      { icon: "checkmark-circle", count: 8 },
    ],
  },
  {
    id: "italy-2024",
    title: "Italian Countryside",
    location: "Italy",
    dates: "10 Sep 2024 - 20 Sep 2024",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1000",
    nights: 10,
    places: 12,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 4 },
      { icon: "sunny", count: 11 },
      { icon: "moon", count: 10 },
      { icon: "location", count: 12 },
      { icon: "checkmark-circle", count: 12 },
    ],
  },
  // Add a cross-year trip to test year filtering
  {
    id: "new-year-2024-2025",
    title: "New Year in Dubai",
    location: "UAE",
    dates: "28 Dec 2024 - 02 Jan 2025",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
    nights: 5,
    places: 4,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 2 },
      { icon: "sunny", count: 6 },
      { icon: "moon", count: 5 },
      { icon: "location", count: 4 },
      { icon: "checkmark-circle", count: 4 },
    ],
  },
];

export const samplePlaces = [
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    location: "Agra, India",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000",
    rating: 4.8,
    visited: true,
    visitDate: "02 Apr 2025",
  },
  {
    id: "eiffel-tower",
    name: "Eiffel Tower",
    location: "Paris, France",
    image:
      "https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1000",
    rating: 4.7,
    visited: true,
    visitDate: "18 Dec 2025",
  },
  {
    id: "mount-fuji",
    name: "Mount Fuji",
    location: "Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000",
    rating: 4.9,
    visited: false,
  },
  {
    id: "uluwatu-temple",
    name: "Uluwatu Temple",
    location: "Bali, Indonesia",
    image:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=1000",
    rating: 4.6,
    visited: true,
    visitDate: "08 Oct 2025",
  },
  {
    id: "blue-lagoon",
    name: "Blue Lagoon",
    location: "Iceland",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000",
    rating: 4.5,
    visited: false,
  },
  {
    id: "phi-phi-islands",
    name: "Phi Phi Islands",
    location: "Thailand",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000",
    rating: 4.7,
    visited: true,
    visitDate: "15 Nov 2025",
  },
  {
    id: "sahara-desert",
    name: "Sahara Desert",
    location: "Morocco",
    image:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1000",
    rating: 4.9,
    visited: true,
    visitDate: "20 Mar 2024",
  },
  {
    id: "colosseum",
    name: "Colosseum",
    location: "Rome, Italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1000",
    rating: 4.8,
    visited: true,
    visitDate: "15 Sep 2024",
  },
  {
    id: "burj-khalifa",
    name: "Burj Khalifa",
    location: "Dubai, UAE",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
    rating: 4.7,
    visited: true,
    visitDate: "31 Dec 2024",
  },
];
