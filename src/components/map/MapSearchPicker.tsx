"use client";
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setResults(data);
      setSelected(false);
    } catch (error) {
      console.error("Geocoding failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (place: PlaceResult) => {
    // Simplify the display name (Nominatim strings can be very long)
    const shortName = place.display_name.split(',').slice(0, 3).join(',');
    setQuery(shortName);
    setResults([]);
    setSelected(true);
    // Send coordinates and name back to the form
    onLocationSelect(parseFloat(place.lat), parseFloat(place.lon), shortName);
  };

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Search Location on Map <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <Input 
          placeholder="Search landmark, street, or area..." 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
        />
        <Button type="button" onClick={handleSearch} disabled={isSearching} variant="secondary">
          <Search size={16} className="mr-2" /> {isSearching ? '...' : 'Search'}
        </Button>
      </div>

      {/* Dropdown Results */}
      {results.length > 0 && !selected && (
        <ul className="border border-slate-200 rounded-md shadow-sm max-h-48 overflow-y-auto bg-white z-50">
          {results.map((place) => (
            <li 
              key={place.place_id} 
              onClick={() => handleSelect(place)}
              className="p-2 text-sm hover:bg-slate-100 cursor-pointer flex items-start gap-2 border-b last:border-0"
            >
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <span>{place.display_name}</span>
            </li>
          ))}
        </ul>
      )}
      
      {selected && query && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          <MapPin size={12} /> Location captured successfully!
        </p>
      )}
    </div>
  );
}
