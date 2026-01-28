import type { Flight } from './supabase';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface FlightStats {
  totalFlights: number;
  totalMiles: number;
  totalKilometers: number;
  countriesVisited: string[];
  countriesCount: number;
  citiesVisited: string[];
  citiesCount: number;
  airportStats: {
    code: string;
    city: string;
    country: string;
    count: number;
  }[];
  airlineStats: {
    airline: string;
    count: number;
  }[];
  carbonFootprint: number; // kg CO2
  timeInAir: number; // hours (estimated)
  longestFlight: {
    route: string;
    miles: number;
  } | null;
}

export function calculateFlightStats(flights: Flight[]): FlightStats {
  const validFlights = flights.filter(
    (f) =>
      f.departure_lat &&
      f.departure_lng &&
      f.arrival_lat &&
      f.arrival_lng
  );

  // Calculate total miles
  let totalMiles = 0;
  let longestFlight: { route: string; miles: number } | null = null;

  validFlights.forEach((flight) => {
    const miles = calculateDistance(
      flight.departure_lat!,
      flight.departure_lng!,
      flight.arrival_lat!,
      flight.arrival_lng!
    );
    totalMiles += miles;

    if (!longestFlight || miles > longestFlight.miles) {
      longestFlight = {
        route: `${flight.departure_airport} → ${flight.arrival_airport}`,
        miles: Math.round(miles),
      };
    }
  });

  // Countries visited (unique)
  const countries = new Set<string>();
  flights.forEach((flight) => {
    if (flight.departure_country) countries.add(flight.departure_country);
    if (flight.arrival_country) countries.add(flight.arrival_country);
  });

  // Cities visited (unique)
  const cities = new Set<string>();
  flights.forEach((flight) => {
    if (flight.departure_city) cities.add(flight.departure_city);
    if (flight.arrival_city) cities.add(flight.arrival_city);
  });

  // Airport frequency
  const airportCounts = new Map<
    string,
    { city: string; country: string; count: number }
  >();
  flights.forEach((flight) => {
    // Departure airport
    if (flight.departure_airport) {
      const existing = airportCounts.get(flight.departure_airport) || {
        city: flight.departure_city || '',
        country: flight.departure_country || '',
        count: 0,
      };
      airportCounts.set(flight.departure_airport, {
        ...existing,
        count: existing.count + 1,
      });
    }
    // Arrival airport
    if (flight.arrival_airport) {
      const existing = airportCounts.get(flight.arrival_airport) || {
        city: flight.arrival_city || '',
        country: flight.arrival_country || '',
        count: 0,
      };
      airportCounts.set(flight.arrival_airport, {
        ...existing,
        count: existing.count + 1,
      });
    }
  });

  const airportStats = Array.from(airportCounts.entries())
    .map(([code, data]) => ({
      code,
      city: data.city,
      country: data.country,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  // Airline frequency
  const airlineCounts = new Map<string, number>();
  flights.forEach((flight) => {
    if (flight.airline && flight.airline !== 'Unknown') {
      const count = airlineCounts.get(flight.airline) || 0;
      airlineCounts.set(flight.airline, count + 1);
    }
  });

  const airlineStats = Array.from(airlineCounts.entries())
    .map(([airline, count]) => ({ airline, count }))
    .sort((a, b) => b.count - a.count);

  // Carbon footprint (rough estimate: 90kg CO2 per 100 miles)
  const carbonFootprint = Math.round((totalMiles / 100) * 90);

  // Time in air (rough estimate: average speed 500mph)
  const timeInAir = Math.round(totalMiles / 500);

  return {
    totalFlights: flights.length,
    totalMiles: Math.round(totalMiles),
    totalKilometers: Math.round(totalMiles * 1.60934),
    countriesVisited: Array.from(countries).sort(),
    countriesCount: countries.size,
    citiesVisited: Array.from(cities).sort(),
    citiesCount: cities.size,
    airportStats,
    airlineStats,
    carbonFootprint,
    timeInAir,
    longestFlight,
  };
}
