import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface Place {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  description: string;
  address: string;
  image: string;
  isSaved: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function PlacesMobile() {
  const [activeView, setActiveView] = useState<string>("map");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [radius, setRadius] = useState<number>(5);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlace, setNewPlace] = useState<Partial<Place>>({ category: "attractions", isSaved: false });

  const categories = [
    { id: "all", name: "All", icon: "fa-globe" },
    { id: "attractions", name: "Attractions", icon: "fa-landmark" },
    { id: "restaurants", name: "Restaurants", icon: "fa-utensils" },
    { id: "hotels", name: "Hotels", icon: "fa-hotel" },
    { id: "cafes", name: "Cafes", icon: "fa-coffee" },
    { id: "shopping", name: "Shopping", icon: "fa-shopping-bag" }
  ];

  const places: Place[] = [
    {
      id: 1,
      name: "Eiffel Tower",
      category: "attractions",
      rating: 4.7,
      reviews: 45892,
      distance: "1.2 mi",
      description: "Iconic 19th-century tower with panoramic city views from observation decks.",
      address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
      image: "https://readdy.ai/api/search-image?query=Eiffel%20Tower%20in%20Paris%20during%20golden%20hour%2C%20iconic%20landmark%2C%20beautiful%20lighting%2C%20travel%20destination%2C%20professional%20photography%2C%20high%20resolution%2C%20detailed%20architecture%2C%20centered%20composition%2C%20tourist%20attraction&width=300&height=200&seq=1&orientation=landscape",
      isSaved: true,
      coordinates: { lat: 48.8584, lng: 2.2945 }
    },
    {
      id: 2,
      name: "The Louvre",
      category: "attractions",
      rating: 4.8,
      reviews: 35621,
      distance: "0.8 mi",
      description: "World's largest art museum with thousands of works including the Mona Lisa.",
      address: "Rue de Rivoli, 75001 Paris, France",
      image: "https://readdy.ai/api/search-image?query=The%20Louvre%20Museum%20in%20Paris%20with%20glass%20pyramid%2C%20famous%20art%20museum%2C%20architectural%20contrast%2C%20travel%20destination%2C%20professional%20photography%2C%20high%20resolution%2C%20detailed%20architecture%2C%20centered%20composition%2C%20tourist%20attraction&width=300&height=200&seq=2&orientation=landscape",
      isSaved: false,
      coordinates: { lat: 48.8606, lng: 2.3376 }
    },
    {
      id: 3,
      name: "Le Jules Verne",
      category: "restaurants",
      rating: 4.5,
      reviews: 2845,
      distance: "1.3 mi",
      description: "Upscale French restaurant located on the second floor of the Eiffel Tower.",
      address: "Eiffel Tower, Avenue Gustave Eiffel, 75007 Paris, France",
      image: "https://readdy.ai/api/search-image?query=Elegant%20fine%20dining%20restaurant%20interior%20with%20panoramic%20city%20views%2C%20sophisticated%20atmosphere%2C%20gourmet%20food%20presentation%2C%20luxury%20dining%20experience%2C%20professional%20food%20photography%2C%20high%20resolution%2C%20centered%20composition%2C%20romantic%20setting&width=300&height=200&seq=3&orientation=landscape",
      isSaved: true,
      coordinates: { lat: 48.8583, lng: 2.2944 }
    },
    {
      id: 4,
      name: "Hôtel Plaza Athénée",
      category: "hotels",
      rating: 4.9,
      reviews: 1856,
      distance: "1.5 mi",
      description: "Luxury hotel with Eiffel Tower views, spa, and Michelin-starred restaurant.",
      address: "25 Avenue Montaigne, 75008 Paris, France",
      image: "https://readdy.ai/api/search-image?query=Luxury%20hotel%20exterior%20with%20elegant%20facade%2C%20five%20star%20accommodation%2C%20upscale%20hospitality%2C%20beautiful%20architecture%2C%20professional%20hotel%20photography%2C%20high%20resolution%2C%20centered%20composition%2C%20prestigious%20location&width=300&height=200&seq=4&orientation=landscape",
      isSaved: false,
      coordinates: { lat: 48.8661, lng: 2.3031 }
    },
    {
      id: 5,
      name: "Café de Flore",
      category: "cafes",
      rating: 4.3,
      reviews: 8924,
      distance: "1.1 mi",
      description: "Historic café known for famous literary patrons and classic French cuisine.",
      address: "172 Boulevard Saint-Germain, 75006 Paris, France",
      image: "https://readdy.ai/api/search-image?query=Historic%20Parisian%20cafe%20with%20outdoor%20seating%2C%20traditional%20French%20bistro%2C%20charming%20atmosphere%2C%20coffee%20culture%2C%20professional%20photography%2C%20high%20resolution%2C%20centered%20composition%2C%20iconic%20establishment&width=300&height=200&seq=5&orientation=landscape",
      isSaved: true,
      coordinates: { lat: 48.8539, lng: 2.3336 }
    },
    {
      id: 6,
      name: "Galeries Lafayette",
      category: "shopping",
      rating: 4.6,
      reviews: 12567,
      distance: "1.9 mi",
      description: "Upscale department store with luxury brands and stunning architecture.",
      address: "40 Boulevard Haussmann, 75009 Paris, France",
      image: "https://readdy.ai/api/search-image?query=Luxurious%20department%20store%20interior%20with%20ornate%20architecture%2C%20high-end%20retail%20space%2C%20elegant%20dome%20ceiling%2C%20fashion%20shopping%20destination%2C%20professional%20photography%2C%20high%20resolution%2C%20centered%20composition%2C%20upscale%20shopping%20experience&width=300&height=200&seq=6&orientation=portrait",
      isSaved: false,
      coordinates: { lat: 48.8738, lng: 2.3324 }
    }
  ];

  const filteredPlaces = activeFilter === "all" 
    ? places 
    : places.filter(place => place.category === activeFilter);

  const searchedPlaces = searchQuery 
    ? filteredPlaces.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        place.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredPlaces;

  const savedPlaces = places.filter(place => place.isSaved);

  const toggleSavePlace = (id: number) => {
    const updatedPlaces = places.map(place => {
      if (place.id === id) {
        return { ...place, isSaved: !place.isSaved };
      }
      return place;
    });
    // In a real app, you would update state here
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
  };

  // --- Map Section ---
  const MapSection = () => (
    <div className="relative w-full h-[350px] bg-gray-100 rounded-xl overflow-hidden mb-4">
      <img
        src="https://readdy.ai/api/search-image?query=Detailed%20city%20map%20view%20with%20streets%20and%20landmarks%2C%20navigation%20interface%2C%20satellite%20imagery%20with%20location%20pins%2C%20digital%20cartography%2C%20professional%20map%20design%2C%20high%20resolution%2C%20centered%20composition%2C%20interactive%20map%20visualization&width=375&height=350&seq=7&orientation=landscape"
        alt="Map View"
        className="w-full h-full object-cover"
      />
      {/* List View Button - solid, visible, with hover */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-4 left-4 bg-white/95 hover:bg-blue-100 text-gray-800 shadow-md !rounded-full flex items-center px-4 py-2 font-medium border border-gray-200 transition-colors"
        style={{ backdropFilter: 'none' }}
        onClick={() => setActiveView(activeView === "map" ? "list" : "map")}
      >
        <i className="fas fa-list mr-2"></i>
        List View
      </Button>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button size="icon" variant="secondary" className="w-10 h-10 bg-white shadow-md !rounded-full">
          <i className="fas fa-plus text-gray-700"></i>
        </Button>
        <Button size="icon" variant="secondary" className="w-10 h-10 bg-white shadow-md !rounded-full">
          <i className="fas fa-minus text-gray-700"></i>
        </Button>
        <Button size="icon" variant="secondary" className="w-10 h-10 bg-white shadow-md !rounded-full">
          <i className="fas fa-location-arrow text-blue-600"></i>
        </Button>
      </div>
      {/* Example pins (static) */}
      <div className="absolute top-1/4 left-1/3">
        <i className="fas fa-map-marker-alt text-blue-600 text-2xl"></i>
      </div>
      <div className="absolute top-1/2 left-1/2">
        <i className="fas fa-map-marker-alt text-red-600 text-2xl"></i>
      </div>
      <div className="absolute bottom-1/3 right-1/4">
        <i className="fas fa-map-marker-alt text-blue-600 text-2xl"></i>
      </div>
      {/* Current Location Indicator */}
      <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="w-16 h-16 bg-blue-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>
    </div>
  );

  // --- Place Detail Overlay ---
  const PlaceDetail = ({ place }: { place: Place }) => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <header className="fixed top-0 w-full bg-white z-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <Button variant="ghost" size="icon" className="!rounded-full" onClick={() => setSelectedPlace(null)}>
          <i className="fas fa-arrow-left text-gray-600"></i>
        </Button>
        <h1 className="text-lg font-semibold text-gray-800">{place.name}</h1>
        <Button variant="ghost" size="icon" className="!rounded-full" onClick={() => toggleSavePlace(place.id)}>
          <i className={`fa${place.isSaved ? 's' : 'r'} fa-heart text-xl ${place.isSaved ? 'text-red-500' : 'text-gray-400'}`}></i>
        </Button>
      </header>
      <div className="flex-1 pt-16 pb-20 overflow-auto">
        <div className="relative h-64 w-full">
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 flex space-x-2">
            <Badge className="bg-white/90 text-gray-800 font-medium">
              {categories.find(cat => cat.id === place.category)?.name}
            </Badge>
            <Badge className="bg-white/90 text-gray-800 font-medium">
              <i className="fas fa-star text-yellow-400 mr-1"></i>
              {place.rating} ({place.reviews.toLocaleString()})
            </Badge>
          </div>
        </div>
        <div className="px-4 py-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{place.name}</h2>
          <p className="text-gray-600 mb-4">{place.description}</p>
          <div className="flex items-center mb-4">
            <i className="fas fa-map-marker-alt text-gray-500 mr-2"></i>
            <p className="text-gray-600">{place.address}</p>
          </div>
          <div className="flex items-center mb-4">
            <i className="fas fa-walking text-gray-500 mr-2"></i>
            <p className="text-gray-600">{place.distance} from your location</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button className="!rounded-full">
              <i className="fas fa-directions mr-2"></i>
              Directions
            </Button>
            <Button variant="outline" className="!rounded-full">
              <i className="fas fa-share-alt mr-2"></i>
              Share
            </Button>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Location</h3>
            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img src="https://readdy.ai/api/search-image?query=Detailed%20city%20map%20view%20with%20a%20highlighted%20location%20pin%2C%20navigation%20interface%20with%20streets%20and%20landmarks%2C%20satellite%20imagery%2C%20digital%20cartography%2C%20professional%20map%20design%2C%20high%20resolution%2C%20centered%20composition%2C%20interactive%20map%20visualization&width=375&height=200&seq=8&orientation=landscape" alt="Location Map" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Nearby Places</h3>
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex space-x-4">
                {places.filter(p => p.id !== place.id).slice(0, 4).map((nearbyPlace) => (
                  <Card key={nearbyPlace.id} className="w-40 flex-shrink-0">
                    <div className="relative h-32">
                      <img src={nearbyPlace.image} alt={nearbyPlace.name} className="w-full h-full object-cover rounded-t-lg" />
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-white/90 text-gray-800">
                          <i className="fas fa-star text-yellow-400 mr-1"></i>
                          {nearbyPlace.rating}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-800 text-sm">{nearbyPlace.name}</h4>
                      <p className="text-xs text-gray-500">{nearbyPlace.distance}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-4">
        <Button className="w-full !rounded-full">
          <i className="fas fa-calendar-plus mr-2"></i>
          Add to Itinerary
        </Button>
      </div>
    </div>
  );

  // --- Place Card ---
  const PlaceCard = ({ place }: { place: Place }) => (
    <Card className="mb-4 overflow-hidden cursor-pointer" onClick={() => setSelectedPlace(place)}>
      <div className="relative h-48">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white/90 !rounded-full"
            onClick={e => { e.stopPropagation(); toggleSavePlace(place.id); }}>
            <i className={`${place.isSaved ? 'fas' : 'far'} fa-heart ${place.isSaved ? 'text-red-500' : 'text-gray-700'}`}></i>
          </Button>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-gray-800 font-medium">
            {categories.find(cat => cat.id === place.category)?.name}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{place.name}</h3>
          <div className="flex items-center">
            <i className="fas fa-star text-yellow-400 mr-1 text-sm"></i>
            <span className="text-sm font-medium text-gray-700">{place.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{place.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
            <span>{place.distance}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <i className="far fa-comment mr-1 text-gray-400"></i>
            <span>{place.reviews.toLocaleString()}</span>
          </div>
          <Button variant="outline" size="sm" className="!rounded-full">
            <i className="fas fa-directions mr-1"></i>
            Directions
          </Button>
        </div>
      </div>
    </Card>
  );

  // --- Add New Place Modal ---
  const AddPlaceModal = () => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[95%] max-w-md max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Add New Place</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <Input
              type="text"
              placeholder="Enter place name"
              value={newPlace.name || ""}
              onChange={e => setNewPlace({ ...newPlace, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
              value={newPlace.category}
              onChange={e => setNewPlace({ ...newPlace, category: e.target.value })}
            >
              {categories.filter(cat => cat.id !== "all").map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 p-2 text-sm min-h-[100px]"
              placeholder="Enter place description"
              value={newPlace.description || ""}
              onChange={e => setNewPlace({ ...newPlace, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Address</label>
            <Input
              type="text"
              placeholder="Enter address"
              value={newPlace.address || ""}
              onChange={e => setNewPlace({ ...newPlace, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={e => {/* handle file upload */}}
              />
            </div>
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newPlace.isSaved}
                onChange={e => setNewPlace({ ...newPlace, isSaved: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Save this place</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <div className="h-40 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=Detailed%20city%20map%20view%20with%20location%20pin%20selection%20interface%2C%20navigation%20map%20with%20streets%20and%20landmarks%2C%20satellite%20imagery%2C%20digital%20cartography%2C%20professional%20map%20design%2C%20high%20resolution%2C%20centered%20composition%2C%20interactive%20map%20visualization&width=375&height=160&seq=9&orientation=landscape"
                alt="Select Location"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1 !rounded-full" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 !rounded-full" onClick={() => setShowAddModal(false)}>
              Add Place
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // --- All Saved Places Modal ---
  const AllSavedModal = () => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[95%] max-w-md max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Saved Places</h2>
          <Button variant="ghost" size="icon" className="!rounded-full" onClick={() => setShowAllSaved(false)}>
            <i className="fas fa-times text-gray-600"></i>
          </Button>
        </div>
        {savedPlaces.length > 0 ? (
          <div className="space-y-3">
            {savedPlaces.map(place => (
              <Card key={place.id} className="flex overflow-hidden cursor-pointer" onClick={() => { setSelectedPlace(place); setShowAllSaved(false); }}>
                <div className="w-24 h-24">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{place.name}</h3>
                      <p className="text-xs text-gray-500">{categories.find(cat => cat.id === place.category)?.name}</p>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
                      <span className="text-xs font-medium">{place.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-600">
                    <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
                    <span>{place.distance}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <i className="far fa-heart text-gray-400 text-lg"></i>
            </div>
            <h3 className="text-base font-medium text-gray-700 mb-1">No saved places yet</h3>
            <p className="text-sm text-gray-500 text-center mb-3">Save places you like to find them easily later</p>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {selectedPlace ? (
        <PlaceDetail place={selectedPlace} />
      ) : (
        <>
          {/* Header with search and filter */}
          <header className="fixed top-0 w-full bg-white z-50 px-4 pt-4 flex flex-col border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-blue-600">Places</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="!rounded-full">
                  <i className="fas fa-bell text-gray-500"></i>
                </Button>
              </div>
            </div>
          </header>
          {/* Search bar and filter, below header, not overlapping */}
          <div className="w-full bg-white z-40 px-4 pt-2 pb-2 flex items-center sticky top-[56px] border-b border-gray-100" style={{marginTop: '56px'}}>
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <Input
                type="text"
                placeholder="Search places, addresses..."
                className="pl-10 pr-4 py-2 w-full border-gray-200 focus:border-blue-500 rounded-lg"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="ml-2 !rounded-full" onClick={() => setIsFilterModalOpen(true)}>
              <i className="fas fa-sliders-h text-gray-600"></i>
            </Button>
          </div>
          {/* Category filter chips, horizontally scrollable */}
          <div className="w-full overflow-x-auto scrollbar-hide px-4 pb-2">
            <div className="flex space-x-2 whitespace-nowrap">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeFilter === category.id ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center !rounded-full ${activeFilter === category.id ? 'bg-blue-600' : 'bg-white'}`}
                  onClick={() => setActiveFilter(category.id)}
                >
                  <i className={`fas ${category.icon} ${activeFilter === category.id ? 'text-white' : 'text-gray-600'} mr-2`}></i>
                  <span className={activeFilter === category.id ? 'text-white' : 'text-gray-600'}>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
          {/* Main content */}
          <main className="flex-1 pt-2 pb-16 px-4">
            {activeView === "map" ? (
              <>
                <MapSection />
                {/* Popular Places horizontal scroll, always scrollable */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    {searchQuery ? "Search Results" : activeFilter === "all" ? "Popular Places" : `${categories.find(cat => cat.id === activeFilter)?.name}`}
                  </h2>
                  <div className="w-full overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-4 whitespace-nowrap">
                      {searchedPlaces.map(place => (
                        <Card key={place.id} className="w-64 flex-shrink-0" onClick={() => setSelectedPlace(place)}>
                          <div className="relative h-36">
                            <img src={place.image} alt={place.name} className="w-full h-full object-cover rounded-t-lg" />
                            <div className="absolute top-2 right-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-white/80 hover:bg-white/90 !rounded-full w-8 h-8"
                                onClick={e => { e.stopPropagation(); toggleSavePlace(place.id); }}
                              >
                                <i className={`${place.isSaved ? 'fas' : 'far'} fa-heart ${place.isSaved ? 'text-red-500' : 'text-gray-700'} text-sm`}></i>
                              </Button>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <Badge className="bg-white/90 text-gray-800 text-xs">
                                {categories.find(cat => cat.id === place.category)?.name}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-800">{place.name}</h3>
                              <div className="flex items-center">
                                <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
                                <span className="text-xs font-medium">{place.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{place.distance}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Saved Places vertical list */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">Saved Places</h2>
                    <Button variant="ghost" size="sm" className="text-blue-600 !rounded-full border border-blue-600 px-4 py-1 font-semibold" onClick={() => setShowAllSaved(true)}>
                      See All
                    </Button>
                  </div>
                  {savedPlaces.length > 0 ? (
                    <div className="space-y-3">
                      {savedPlaces.slice(0, 3).map(place => (
                        <Card key={place.id} className="flex overflow-hidden cursor-pointer" onClick={() => setSelectedPlace(place)}>
                          <div className="w-24 h-24">
                            <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-800">{place.name}</h3>
                                <p className="text-xs text-gray-500">{categories.find(cat => cat.id === place.category)?.name}</p>
                              </div>
                              <div className="flex items-center">
                                <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
                                <span className="text-xs font-medium">{place.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center mt-2 text-xs text-gray-600">
                              <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
                              <span>{place.distance}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-6 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <i className="far fa-heart text-gray-400 text-lg"></i>
                      </div>
                      <h3 className="text-base font-medium text-gray-700 mb-1">No saved places yet</h3>
                      <p className="text-sm text-gray-500 text-center mb-3">Save places you like to find them easily later</p>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  {searchQuery ? "Search Results" : activeFilter === "all" ? "All Places" : `${categories.find(cat => cat.id === activeFilter)?.name}`}
                </h2>
                {searchedPlaces.length > 0 ? (
                  searchedPlaces.map(place => (
                    <PlaceCard key={place.id} place={place} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <i className="fas fa-search text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No places found</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Try adjusting your search or filters</p>
                    <Button className="!rounded-full" onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
          {/* Floating Action Button */}
          <div className="fixed right-4 bottom-20">
            <Button size="icon" className="w-14 h-14 rounded-full bg-blue-600 shadow-lg !rounded-full" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus text-white text-xl"></i>
            </Button>
          </div>
          {/* Filter Modal (basic stub) */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg w-[90%] max-h-[90vh] overflow-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  <Button variant="ghost" size="icon" className="!rounded-full" onClick={() => setIsFilterModalOpen(false)}>
                    <i className="fas fa-times text-gray-600"></i>
                  </Button>
                </div>
                {/* Add filter controls here */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Radius</label>
                  <Slider value={[radius]} min={1} max={50} step={1} onValueChange={vals => setRadius(vals[0])} />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>1 mi</span>
                    <span>50 mi</span>
                  </div>
                </div>
                <Button className="w-full !rounded-full" onClick={() => setIsFilterModalOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
          {/* All Saved Places Modal */}
          {showAllSaved && <AllSavedModal />}
          {/* Add New Place Modal */}
          {showAddModal && <AddPlaceModal />}
        </>
      )}
    </div>
  );
}