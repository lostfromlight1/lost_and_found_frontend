"use client";

import { useState, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, MapMouseEvent } from '@vis.gl/react-google-maps';

interface MapPickerProps {
  defaultCenter?: { lat: number; lng: number };
  value?: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number }) => void;
}

export default function MapPicker({
  defaultCenter = { lat: 16.8409, lng: 96.1735 }, 
  value,
  onChange,
}: MapPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    value || null
  );

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (e.detail.latLng) {
        const newLocation = {
          lat: e.detail.latLng.lat,
          lng: e.detail.latLng.lng,
        };
        setMarkerPosition(newLocation);
        onChange(newLocation);
      }
    },
    [onChange]
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div className="h-64 bg-slate-100 flex items-center justify-center rounded-md border text-sm text-slate-500">Google Maps API key is missing</div>;
  }

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={value || defaultCenter}
          defaultZoom={13}
          mapId="lost_and_found_map_picker" 
          onClick={handleMapClick}
          disableDefaultUI={true}
          zoomControl={true}
        >
          {markerPosition && (
            <AdvancedMarker position={markerPosition} />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
