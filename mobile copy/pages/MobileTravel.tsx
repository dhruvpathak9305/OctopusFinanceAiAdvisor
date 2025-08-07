import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import PlacesMobile from '@/components/dashboard/PlacesMobile';

interface MobileTravelProps {
  activeMainTab?: string;
}

export default function MobileTravel({ activeMainTab = "travel" }: MobileTravelProps) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeView, setActiveView] = useState("main");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const navigate = useNavigate();
  const [activeBottomNav, setActiveBottomNav] = useState<string>("explore");

  // Data
  const upcomingTrips = [
    {
      id: 1,
      destination: "Paris, France",
      dates: "Jun 15 - Jun 22",
      image: "https://readdy.ai/api/search-image?query=beautiful%20paris%20cityscape%20with%20eiffel%20tower%20at%20sunset%2C%20soft%20warm%20lighting%2C%20iconic%20landmarks%2C%20romantic%20atmosphere%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20centered%20composition&width=400&height=200&seq=1&orientation=landscape",
      budget: "$2,850",
      spent: "$1,240",
      status: "Planning"
    },
    {
      id: 2,
      destination: "Tokyo, Japan",
      dates: "Aug 10 - Aug 20",
      image: "https://readdy.ai/api/search-image?query=vibrant%20tokyo%20cityscape%20at%20night%20with%20mount%20fuji%20in%20background%2C%20neon%20lights%2C%20modern%20architecture%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20centered%20composition&width=400&height=200&seq=2&orientation=landscape",
      budget: "$3,500",
      spent: "$800",
      status: "Booking"
    }
  ];

  const popularDestinations = [
    {
      name: "Bali",
      country: "Indonesia",
      image: "https://readdy.ai/api/search-image?query=tropical%20bali%20beach%20paradise%20with%20traditional%20boats%2C%20crystal%20clear%20water%2C%20palm%20trees%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20centered%20composition&width=200&height=250&seq=3&orientation=portrait",
      rating: 4.8,
      price: "$1,200"
    },
    {
      name: "Santorini",
      country: "Greece",
      image: "https://readdy.ai/api/search-image?query=stunning%20santorini%20white%20buildings%20with%20blue%20domes%2C%20mediterranean%20sea%20view%2C%20sunset%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20centered%20composition&width=200&height=250&seq=4&orientation=portrait",
      rating: 4.9,
      price: "$1,800"
    },
    {
      name: "Maldives",
      country: "Maldives",
      image: "https://readdy.ai/api/search-image?query=luxury%20overwater%20bungalows%20in%20maldives%2C%20turquoise%20lagoon%2C%20tropical%20paradise%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20centered%20composition&width=200&height=250&seq=5&orientation=portrait",
      rating: 4.9,
      price: "$2,500"
    }
  ];

  const quickActions = [
    { icon: "fa-plane", label: "Flights", color: "bg-blue-500" },
    { icon: "fa-hotel", label: "Hotels", color: "bg-purple-500" },
    { icon: "fa-car", label: "Cars", color: "bg-green-500" },
    { icon: "fa-utensils", label: "Food", color: "bg-orange-500" }
  ];

  const travelStats = [
    { label: "Countries", value: "12", icon: "fa-globe" },
    { label: "Cities", value: "28", icon: "fa-city" },
    { label: "Days", value: "145", icon: "fa-calendar" },
    { label: "Photos", value: "2.8k", icon: "fa-camera" }
  ];

  // App Navigation - Only shown when in main app context, not in Travel section
  const AppBottomNavigation = () => (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-14">
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full rounded-none">
          <i className="fas fa-home text-gray-400 text-lg"></i>
          <span className="text-[10px] mt-1 text-gray-500">Dashboard</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full rounded-none">
          <i className="fas fa-wallet text-gray-400 text-lg"></i>
          <span className="text-[10px] mt-1 text-gray-500">Budget</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full rounded-none">
          <i className="fas fa-bullseye text-gray-400 text-lg"></i>
          <span className="text-[10px] mt-1 text-gray-500">Goals</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full rounded-none">
          <i className="fas fa-chart-pie text-gray-400 text-lg"></i>
          <span className="text-[10px] mt-1 text-gray-500">Portfolio</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center justify-center h-full rounded-none">
          <i className="fas fa-plane text-emerald-500 text-lg"></i>
          <span className="text-[10px] mt-1 text-emerald-500 font-medium">Travel</span>
        </Button>
      </div>
    </nav>
  );

  // Travel Navigation - Only shown when in Travel section
  const TravelBottomNavigation = () => (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-14">
        {/* Dashboard */}
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center h-full rounded-none ${
            activeBottomNav === 'home' ? 'text-emerald-500' : 'text-gray-400'
          }`}
          onClick={() => {
            setActiveBottomNav('home');
            navigate('/dashboard');
          }}
        >
          <i className="fas fa-home text-lg" />
          <span className="text-[10px] mt-1">Dashboard</span>
        </Button>
        {/* Explore */}
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center h-full rounded-none ${
            activeBottomNav === 'explore' ? 'text-emerald-500' : 'text-gray-400'
          }`}
          onClick={() => setActiveBottomNav('explore')}
        >
          <i className="fas fa-compass text-lg" />
          <span className="text-[10px] mt-1">Explore</span>
        </Button>
        {/* Places */}
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center h-full rounded-none ${
            activeBottomNav === 'places' ? 'text-emerald-500' : 'text-gray-400'
          }`}
          onClick={() => setActiveBottomNav('places')}
        >
          <i className="fas fa-map-marker-alt text-lg" />
          <span className="text-[10px] mt-1">Places</span>
        </Button>
        {/* Plan */}
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center h-full rounded-none ${
            activeBottomNav === 'plan' ? 'text-emerald-500' : 'text-gray-400'
          }`}
          onClick={() => {
            setActiveBottomNav('plan');
            setActiveView('addTrip');
          }}
        >
          <i className="fas fa-plus-circle text-lg" />
          <span className="text-[10px] mt-1">Plan</span>
        </Button>
        {/* Saved */}
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center h-full rounded-none ${
            activeBottomNav === 'saved' ? 'text-emerald-500' : 'text-gray-400'
          }`}
          onClick={() => setActiveBottomNav('saved')}
        >
          <i className="fas fa-heart text-lg" />
          <span className="text-[10px] mt-1">Saved</span>
        </Button>
      </div>
    </nav>
  );

  // Header for main Travel view
  const TravelHeader = () => (
    <header className="fixed top-0 w-full bg-white z-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center">
        <i className="fas fa-compass text-emerald-500 mr-2"></i>
        <h1 className="text-lg font-semibold text-emerald-500">TravelPal</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <i className="fas fa-search text-gray-500"></i>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <i className="fas fa-bell text-gray-500"></i>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/profile')}>
          <i className="fas fa-user text-gray-500"></i>
        </Button>
      </div>
    </header>
  );

  // Add Trip Modal Component
  const AddTripModal = () => {
    const [tripData, setTripData] = useState({
      destination: "",
      startDate: "",
      endDate: "",
      tripType: "domestic",
      budget: 1000,
      region: "North America"
    });

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="fixed top-0 w-full bg-white z-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 rounded-full"
              onClick={() => setActiveView("main")}
            >
              <i className="fas fa-times text-gray-600"></i>
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">Create New Trip</h1>
          </div>
        </header>

        <main className="flex-1 pt-16 pb-20 px-4">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Paris, France"
                value={tripData.destination}
                onChange={(e) => setTripData({...tripData, destination: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={tripData.startDate}
                  onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={tripData.endDate}
                  onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={tripData.tripType === "domestic" ? "default" : "outline"}
                  className="w-full rounded-lg"
                  onClick={() => setTripData({...tripData, tripType: "domestic"})}
                >
                  <i className="fas fa-home mr-2"></i>
                  Domestic
                </Button>
                <Button
                  type="button"
                  variant={tripData.tripType === "international" ? "default" : "outline"}
                  className="w-full rounded-lg"
                  onClick={() => setTripData({...tripData, tripType: "international"})}
                >
                  <i className="fas fa-globe mr-2"></i>
                  International
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  className="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                  value={tripData.budget}
                  onChange={(e) => setTripData({...tripData, budget: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={tripData.region}
                onChange={(e) => setTripData({...tripData, region: e.target.value})}
              >
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-lg"
                onClick={() => setActiveView("main")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle trip creation logic here
                  setActiveView("main");
                }}
              >
                Create Trip
              </Button>
            </div>
          </form>
        </main>
        
        {/* Use the appropriate navigation based on whether we're in the main app or travel section */}
        {activeMainTab === "travel" ? <TravelBottomNavigation /> : <AppBottomNavigation />}
      </div>
    );
  };

  // Trip Details View Component
  const TripDetailsView = () => {
    const budgetCategories = [
      { name: "Accommodation", amount: 800, allocated: 350 },
      { name: "Transportation", amount: 400, allocated: 175 },
      { name: "Food & Dining", amount: 400, allocated: 170 },
      { name: "Activities", amount: 300, allocated: 170 },
      { name: "Miscellaneous", amount: 100, allocated: 75 },
    ];

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="fixed top-0 w-full bg-white z-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 rounded-full"
              onClick={() => setActiveView("main")}
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">
              Trip Budget Planner
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <i className="fas fa-share text-gray-500"></i>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 pt-16 pb-20 px-4">
          <Card className="mb-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Total Budget
                </h2>
                <span className="text-2xl font-bold text-emerald-600">$2,000</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-lg font-semibold text-gray-800">$895</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-lg font-semibold text-green-600">$1,405</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency</p>
                  <p className="text-lg font-semibold text-orange-600">$300</p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Budget Categories
            </h3>
            <div className="space-y-4">
              {budgetCategories.map((category, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {category.name}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      ${category.amount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{
                        width: `${(category.allocated / category.amount) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      Allocated: ${category.allocated}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round((category.allocated / category.amount) * 100)}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Emergency Fund
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Emergency Allocation</span>
                <span className="font-semibold text-orange-600">$300</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-orange-600 h-2 rounded-full w-[15%]"></div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Recommendations
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Set aside 5-10% of your total budget for emergencies</li>
                  <li>• Keep emergency funds easily accessible</li>
                  <li>• Consider travel insurance for added protection</li>
                </ul>
              </div>
            </div>
          </Card>
        </main>
        
        {/* Use the appropriate navigation based on whether we're in the main app or travel section */}
        {activeMainTab === "travel" ? <TravelBottomNavigation /> : <AppBottomNavigation />}
      </div>
    );
  };

  // Main Travel Content
  const MainTravelContent = () => (
    <>
      {/* Only show the Travel header if we're in the travel section */}
      {activeMainTab === "travel" && <TravelHeader />}
      
      <main className="flex-1 pt-16 pb-20 px-4">
        {/* Conditionally show explore vs places vs saved */}
        {activeBottomNav === 'explore' && (
          <>
            {/* Travel Banner */}
            <div className="mb-6 mt-2">
              <h1 className="text-2xl font-bold text-gray-800">Travel Planner</h1>
              <p className="text-gray-600">Plan your next adventure with ease</p>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="flex flex-col items-center p-3 h-auto rounded-lg"
                >
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-2`}>
                    <i className={`fas ${action.icon} text-white text-lg`}></i>
                  </div>
                  <span className="text-xs text-gray-600">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Travel Stats */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {travelStats.map((stat, index) => (
                <Card key={index} className="p-3 flex flex-col items-center justify-center">
                  <i className={`fas ${stat.icon} text-emerald-500 mb-1`}></i>
                  <span className="text-lg font-bold text-gray-800">{stat.value}</span>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-10 bg-gray-100 p-1">
                <TabsTrigger 
                  value="upcoming" 
                  className="text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-500"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger 
                  value="explore" 
                  className="text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-500"
                >
                  Explore
                </TabsTrigger>
                <TabsTrigger 
                  value="saved" 
                  className="text-xs font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-500"
                >
                  Saved
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-4">
                <div className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <Card key={trip.id} className="overflow-hidden rounded-xl">
                      <div className="relative h-40">
                        <img
                          src={trip.image}
                          alt={trip.destination}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 text-gray-800">
                            {trip.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800">{trip.destination}</h3>
                        <p className="text-sm text-gray-500 mb-3">{trip.dates}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="text-sm font-semibold text-gray-800">{trip.budget}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Spent</p>
                            <p className="text-sm font-semibold text-green-600">{trip.spent}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg"
                            onClick={() => {
                              setSelectedTrip(trip);
                              setActiveView("tripDetails");
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="explore" className="mt-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Destinations</h3>
                  <ScrollArea className="w-full whitespace-nowrap pb-4">
                    <div className="flex space-x-4">
                      {popularDestinations.map((destination, index) => (
                        <Card key={index} className="w-40 flex-shrink-0 rounded-xl">
                          <div className="relative h-48">
                            <img
                              src={destination.image}
                              alt={destination.name}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                            <div className="absolute bottom-2 right-2">
                              <Badge className="bg-white/90 text-gray-800">
                                <i className="fas fa-star text-yellow-400 mr-1"></i>
                                {destination.rating}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-800">{destination.name}</h4>
                            <p className="text-xs text-gray-500">{destination.country}</p>
                            <p className="text-sm font-semibold text-emerald-500 mt-2">From {destination.price}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="mt-4">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <i className="fas fa-heart text-emerald-500 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No saved trips yet</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">Start exploring and save your favorite destinations!</p>
                  <Button className="rounded-lg bg-emerald-500 hover:bg-emerald-600">
                    Explore Now
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        {activeBottomNav === 'places' && <PlacesMobile />}
        {activeBottomNav === 'saved' && (
          <>
            {/* Existing saved content */}
          </>
        )}
      </main>

      {/* Show the appropriate navigation based on context */}
      {activeMainTab === "travel" ? <TravelBottomNavigation /> : <AppBottomNavigation />}
    </>
  );

  // Main component render
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {activeView === "main" ? (
        <MainTravelContent />
      ) : activeView === "tripDetails" ? (
        <TripDetailsView />
      ) : (
        <AddTripModal />
      )}
    </div>
  );
} 