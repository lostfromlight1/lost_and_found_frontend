"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons missing in Next.js/Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapProps {
  lat: number;
  lon: number;
  onLocationChange: (lat: number, lon: number) => void;
}

// Component to handle map clicks
function MapEvents({ onLocationChange }: { onLocationChange: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to smoothly pan the map when coordinates change externally
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 0.5 });
  }, [center, map]);
  return null;
}

export default function InteractiveMap({ lat, lon, onLocationChange }: InteractiveMapProps) {
  return (
    <div className="h-[280px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative">
      <MapContainer center={[lat, lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]} />
        <MapEvents onLocationChange={onLocationChange} />
        <MapUpdater center={[lat, lon]} />
      </MapContainer>
    </div>
  );
}
