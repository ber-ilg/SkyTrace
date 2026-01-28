'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Flight } from '@/lib/supabase';

// Dynamically import map components (Leaflet doesn't work server-side)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface FlightsMapProps {
  flights: Flight[];
}

export default function FlightsMap({ flights }: FlightsMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // Filter flights with valid coordinates
  const validFlights = flights.filter(
    (f) =>
      f.departure_lat &&
      f.departure_lng &&
      f.arrival_lat &&
      f.arrival_lng
  );

  if (validFlights.length === 0) {
    return (
      <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No flights with location data yet</p>
      </div>
    );
  }

  // Get unique airports for markers
  const airports = new Map<string, { lat: number; lng: number; city: string; country: string }>();
  
  validFlights.forEach((flight) => {
    if (flight.departure_lat && flight.departure_lng) {
      airports.set(flight.departure_airport, {
        lat: flight.departure_lat,
        lng: flight.departure_lng,
        city: flight.departure_city || '',
        country: flight.departure_country || '',
      });
    }
    if (flight.arrival_lat && flight.arrival_lng) {
      airports.set(flight.arrival_airport, {
        lat: flight.arrival_lat,
        lng: flight.arrival_lng,
        city: flight.arrival_city || '',
        country: flight.arrival_country || '',
      });
    }
  });

  // Calculate center point (average of all coordinates)
  const avgLat =
    validFlights.reduce(
      (sum, f) => sum + (f.departure_lat || 0) + (f.arrival_lat || 0),
      0
    ) /
    (validFlights.length * 2);
  const avgLng =
    validFlights.reduce(
      (sum, f) => sum + (f.departure_lng || 0) + (f.arrival_lng || 0),
      0
    ) /
    (validFlights.length * 2);

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Airport markers */}
        {Array.from(airports.entries()).map(([code, info]) => (
          <Marker key={code} position={[info.lat, info.lng]}>
            <Popup>
              <strong>{code}</strong>
              <br />
              {info.city}, {info.country}
            </Popup>
          </Marker>
        ))}

        {/* Flight paths */}
        {validFlights.map((flight, idx) => {
          if (!flight.departure_lat || !flight.arrival_lat) return null;

          const positions: [number, number][] = [
            [flight.departure_lat, flight.departure_lng!],
            [flight.arrival_lat, flight.arrival_lng!],
          ];

          return (
            <Polyline
              key={`${flight.id}-${idx}`}
              positions={positions}
              pathOptions={{
                color: '#3b82f6',
                weight: 2,
                opacity: 0.6,
              }}
            >
              <Popup>
                <strong>
                  {flight.departure_airport} → {flight.arrival_airport}
                </strong>
                <br />
                {flight.airline && `${flight.airline} `}
                {flight.flight_number}
                <br />
                {flight.departure_date &&
                  new Date(flight.departure_date).toLocaleDateString()}
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>
    </div>
  );
}
