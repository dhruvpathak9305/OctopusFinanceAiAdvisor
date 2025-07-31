import React from 'react';
import { Input } from "@/components/ui/input";

const MobilePlaces: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Search Section */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <Input 
          type="text"
          placeholder="Search places, addresses..."
          className="w-full rounded-xl bg-gray-50"
        />
        {/* Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 hide-scrollbar">
          <button className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm whitespace-nowrap">
            All
          </button>
          <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm whitespace-nowrap">
            Attractions
          </button>
          <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm whitespace-nowrap">
            Restaurants
          </button>
          <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm whitespace-nowrap">
            Hotels
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="relative h-[300px] bg-gray-100">
        {/* Map will be integrated here */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md px-3 py-1.5">
          <span className="text-sm font-medium">List View</span>
        </div>
      </div>

      {/* Popular Places */}
      <div className="px-4 py-4">
        <h2 className="text-xl font-bold mb-4">Popular Places</h2>
        <div className="grid grid-cols-2 gap-4 pb-20">
          {/* Eiffel Tower Card */}
          <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
            <div className="relative h-32">
              <img 
                src="https://source.unsplash.com/featured/?eiffel-tower" 
                alt="Eiffel Tower"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs">
                Attractions
              </span>
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Eiffel Tower</h3>
                  <p className="text-xs text-gray-500">1.2 mi</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">4.7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Louvre Museum Card */}
          <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
            <div className="relative h-32">
              <img 
                src="https://source.unsplash.com/featured/?louvre" 
                alt="Louvre Museum"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs">
                Attractions
              </span>
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">The Louvre</h3>
                  <p className="text-xs text-gray-500">0.8 mi</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePlaces; 