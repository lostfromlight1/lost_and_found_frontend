"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as typeof L.Icon.Default.prototype & { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: typeof markerIcon2x === 'object' && 'src' in markerIcon2x ? markerIcon2x.src : markerIcon2x,
  iconUrl: typeof markerIcon === 'object' && 'src' in markerIcon ? markerIcon.src : markerIcon,
  shadowUrl: typeof markerShadow === 'object' && 'src' in markerShadow ? markerShadow.src : markerShadow,
});

interface MapDisplayProps {
  lat: number;
  lon: number;
  name: string;
}

export default function MapDisplay({ lat, lon, name }: MapDisplayProps) {
  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
      <MapContainer center={[lat, lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
