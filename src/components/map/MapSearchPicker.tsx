"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Map, Type } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Dynamically import to avoid Next.js SSR crashes
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
      Loading Interactive Map...
    </div>
  )
});

interface PlaceResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface MapSearchPickerProps {
  onLocationSelect: (lat: number, lon: number, displayName: string) => void;
  defaultLocation?: string;
}

export default function MapSearchPicker({ onLocationSelect, defaultLocation }: MapSearchPickerProps) {
  const [query, setQuery] = useState(defaultLocation || '');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<boolean>(!!defaultLocation);
  
  // New States for Map and Toggles
  const [showMap, setShowMap] = useState(false);
  const [isUnknownLocation, setIsUnknownLocation] = useState(false);
  const [mapCoords, setMapCoords] = useState<{lat: number, lon: number}>({ 
    lat: 16.8409, lon: 96.1735 // Default: Yangon 
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setResults(data);
      setSelected(false);
      
      // If results found, pan the hidden map to the first result
      if (data.length > 0) {
        setMapCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      }
    } catch (error) {
      console.error("Geocoding failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (place: PlaceResult) => {
    const shortName = place.display_name.split(',').slice(0, 3).join(',');
    setQuery(shortName);
    setResults([]);
    setSelected(true);
    setMapCoords({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
    onLocationSelect(parseFloat(place.lat), parseFloat(place.lon), shortName);
  };

  // Reverse Geocode when user clicks the interactive map
  const handleMapClick = async (lat: number, lon: number) => {
    setMapCoords({ lat, lon });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      
      const shortName = data.display_name 
        ? data.display_name.split(',').slice(0, 3).join(',') 
        : `Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
        
      setQuery(shortName);
      setSelected(true);
      onLocationSelect(lat, lon, shortName);
    } catch {
      // Fallback if reverse geocode fails
      const fallbackName = `Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
      setQuery(fallbackName);
      setSelected(true);
      onLocationSelect(lat, lon, fallbackName);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-sm font-medium leading-none">
          Location Details <span className="text-red-500">*</span>
        </label>
        
        {/* Toggle for Bus/Taxi scenario */}
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900 transition-colors bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
          <input
            type="checkbox"
            className="rounded border-slate-300 w-3.5 h-3.5 accent-blue-600"
            checked={isUnknownLocation}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsUnknownLocation(checked);
              if (checked) {
                onLocationSelect(0, 0, query); // Pass 0 for unknown coords
                setShowMap(false);
              } else {
                onLocationSelect(mapCoords.lat, mapCoords.lon, query);
              }
            }}
          />
          Map location unknown (e.g., lost on YBS/Taxi)
        </label>
      </div>

      {isUnknownLocation ? (
        // Mode 1: Pure Text Input
        <div className="relative animate-in fade-in zoom-in-95 duration-200">
          <Type className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Describe where you lost/found it (e.g., On YBS 37, Taxi...)"
            className="pl-9 bg-white"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onLocationSelect(0, 0, e.target.value);
            }}
          />
          <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Location will be saved as a text description only.</p>
        </div>
      ) : (
        // Mode 2: Map & Search
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search landmark, street, or area..." 
                className="pl-9 bg-white"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              />
            </div>
            <Button type="button" onClick={handleSearch} disabled={isSearching} variant="secondary">
              <Search size={16} className="sm:mr-2" /> <span className="hidden sm:inline">{isSearching ? '...' : 'Search'}</span>
            </Button>
            <Button 
              type="button" 
              onClick={() => setShowMap(!showMap)} 
              variant={showMap ? "default" : "outline"} 
              className="shrink-0 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
            >
              <Map size={16} className="sm:mr-2" /> <span className="hidden sm:inline">{showMap ? 'Hide Map' : 'Drop Pin'}</span>
            </Button>
          </div>

          {/* Dropdown Results */}
          {results.length > 0 && !selected && !showMap && (
            <ul className="border border-slate-200 rounded-md shadow-sm max-h-48 overflow-y-auto bg-white z-50 absolute w-full max-w-[calc(100%-2rem)]">
              {results.map((place) => (
                <li 
                  key={place.place_id} 
                  onClick={() => handleSelect(place)}
                  className="p-2.5 text-sm hover:bg-slate-50 cursor-pointer flex items-start gap-2 border-b last:border-0"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <span className="leading-tight">{place.display_name}</span>
                </li>
              ))}
            </ul>
          )}
          
          {selected && query && !showMap && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1 ml-1 pt-1">
              <MapPin size={12} /> Location captured successfully
            </p>
          )}

          {/* Interactive Map */}
          {showMap && (
             <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
               <div className="flex justify-between items-center mb-1.5 px-1">
                 <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                   <MapPin size={12} className="text-blue-500"/> Click anywhere on the map to drop a pin
                 </p>
               </div>
               <InteractiveMap 
                 lat={mapCoords.lat} 
                 lon={mapCoords.lon} 
                 onLocationChange={handleMapClick} 
               />
             </div>
          )}
        </div>
      )}
    </div>
  );
}
