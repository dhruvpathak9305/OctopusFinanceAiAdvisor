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
      { icon: "moon", count: 1 },
      { icon: "location", count: 5 },
      { icon: "checkmark-circle", count: 0 },
    ],
  },
  {
    id: "paris-2024",
    title: "Paris Adventure",
    location: "France",
    dates: "15 Dec 2024 - 22 Dec 2024",
    image:
      "https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1000",
    nights: 7,
    places: 12,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 3 },
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
      { icon: "moon", count: 8 },
      { icon: "location", count: 15 },
      { icon: "checkmark-circle", count: 0 },
    ],
  },
  {
    id: "bali-2024",
    title: "Bali Retreat",
    location: "Indonesia",
    dates: "05 Oct 2024 - 12 Oct 2024",
    image:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=1000",
    nights: 7,
    places: 8,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 4 },
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
      { icon: "moon", count: 8 },
      { icon: "location", count: 10 },
      { icon: "checkmark-circle", count: 0 },
    ],
  },
  {
    id: "thailand-2024",
    title: "Thailand Beach Hopping",
    location: "Thailand",
    dates: "08 Nov 2024 - 20 Nov 2024",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000",
    nights: 12,
    places: 6,
    isCompleted: true,
    badges: [
      { icon: "flash", count: 5 },
      { icon: "moon", count: 12 },
      { icon: "location", count: 6 },
      { icon: "checkmark-circle", count: 6 },
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
    visitDate: "18 Dec 2024",
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
    visitDate: "08 Oct 2024",
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
    visitDate: "15 Nov 2024",
  },
  {
    id: "santorini",
    name: "Santorini",
    location: "Greece",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1000",
    rating: 4.8,
    visited: false,
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    location: "Peru",
    image:
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000",
    rating: 4.9,
    visited: false,
  },
];
