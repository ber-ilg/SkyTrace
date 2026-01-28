'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import type { Flight } from '@/lib/supabase';

export default function FlightsList() {
  const { data: session } = useSession();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.userId) {
      fetchFlights();
    }
  }, [session]);

  const fetchFlights = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    
    // Get user ID from email
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();
    
    if (!userData) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('user_id', userData.id)
      .order('departure_date', { ascending: false });

    if (error) {
      console.error('Error fetching flights:', error);
    } else {
      setFlights(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-gray-600">Loading flights...</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Your Flights
        </h2>
        <p className="text-gray-600">
          No flights found yet. Click "Scan Emails" above to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Your Flights ({flights.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Airline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Flight #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Confirmation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {flights.map((flight) => (
              <tr key={flight.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {flight.departure_date
                    ? new Date(flight.departure_date).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {flight.departure_airport} → {flight.arrival_airport}
                  <div className="text-xs text-gray-500">
                    {flight.departure_city} → {flight.arrival_city}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {flight.airline || 'Unknown'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {flight.flight_number || '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {flight.confirmation_code || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
