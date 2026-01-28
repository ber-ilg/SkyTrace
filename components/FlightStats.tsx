'use client';

import { useMemo } from 'react';
import type { Flight } from '@/lib/supabase';
import { calculateFlightStats } from '@/lib/flight-stats';

interface FlightStatsProps {
  flights: Flight[];
}

export default function FlightStats({ flights }: FlightStatsProps) {
  const stats = useMemo(() => calculateFlightStats(flights), [flights]);

  if (flights.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Travel Statistics
      </h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Flights */}
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="text-3xl font-bold">{stats.totalFlights}</div>
          <div className="text-sm opacity-90">Total Flights</div>
        </div>

        {/* Total Miles */}
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="text-3xl font-bold">{stats.totalMiles.toLocaleString()}</div>
          <div className="text-sm opacity-90">Miles Flown</div>
          <div className="text-xs opacity-75 mt-1">{stats.totalKilometers.toLocaleString()} km</div>
        </div>

        {/* Countries */}
        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="text-3xl font-bold">{stats.countriesCount}</div>
          <div className="text-sm opacity-90">Countries Visited</div>
        </div>

        {/* Time in Air */}
        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="text-3xl font-bold">{stats.timeInAir}</div>
          <div className="text-sm opacity-90">Hours in Air</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Airports */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Most Frequent Airports
          </h3>
          {stats.airportStats.length > 0 ? (
            <div className="space-y-3">
              {stats.airportStats.map((airport) => (
                <div
                  key={airport.code}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-gray-900">
                      {airport.code}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      {airport.city}, {airport.country}
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {airport.count} flights
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No airport data available</p>
          )}
        </div>

        {/* Airlines */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Airlines Flown
          </h3>
          {stats.airlineStats.length > 0 ? (
            <div className="space-y-3">
              {stats.airlineStats.slice(0, 5).map((airline) => (
                <div
                  key={airline.airline}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-900">{airline.airline}</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    {airline.count} flights
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No airline data available</p>
          )}
        </div>
      </div>

      {/* Environmental & Records */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Carbon Footprint */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Carbon Footprint
          </h3>
          <div className="text-3xl font-bold text-red-600">
            {stats.carbonFootprint.toLocaleString()} kg
          </div>
          <p className="mt-2 text-sm text-gray-600">
            CO₂ emissions estimate
          </p>
          <p className="mt-1 text-xs text-gray-500">
            ≈ {Math.round(stats.carbonFootprint / 411)} trees needed to offset
          </p>
        </div>

        {/* Longest Flight */}
        {stats.longestFlight && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Longest Flight
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {stats.longestFlight.route}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {stats.longestFlight.miles.toLocaleString()} miles
            </p>
            <p className="text-xs text-gray-500">
              ≈ {Math.round(stats.longestFlight.miles / 500)} hours flight time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
