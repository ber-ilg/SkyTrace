'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getAirportInfo } from '@/lib/airports';

interface AddFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function AddFlightModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: AddFlightModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    departureAirport: '',
    arrivalAirport: '',
    departureDate: '',
    airline: '',
    flightNumber: '',
    confirmationCode: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate airports
      if (formData.departureAirport.length !== 3 || formData.arrivalAirport.length !== 3) {
        throw new Error('Airport codes must be 3 letters (e.g., LHR, JFK)');
      }

      // Get airport data
      const depData = await getAirportInfo(formData.departureAirport.toUpperCase());
      const arrData = await getAirportInfo(formData.arrivalAirport.toUpperCase());

      if (!depData) {
        throw new Error(`Departure airport ${formData.departureAirport.toUpperCase()} not found`);
      }
      if (!arrData) {
        throw new Error(`Arrival airport ${formData.arrivalAirport.toUpperCase()} not found`);
      }

      // Insert flight
      const { error: insertError } = await supabase.from('flights').insert({
        user_id: userId,
        departure_airport: formData.departureAirport.toUpperCase(),
        departure_city: depData.city,
        departure_country: depData.country,
        departure_lat: depData.lat,
        departure_lng: depData.lng,
        departure_date: formData.departureDate ? new Date(formData.departureDate).toISOString() : null,
        arrival_airport: formData.arrivalAirport.toUpperCase(),
        arrival_city: arrData.city,
        arrival_country: arrData.country,
        arrival_lat: arrData.lat,
        arrival_lng: arrData.lng,
        airline: formData.airline || null,
        flight_number: formData.flightNumber || null,
        confirmation_code: formData.confirmationCode || null,
      });

      if (insertError) throw insertError;

      // Reset form and close
      setFormData({
        departureAirport: '',
        arrivalAirport: '',
        departureDate: '',
        airline: '',
        flightNumber: '',
        confirmationCode: '',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add flight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Flight Manually</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Route */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From (Airport Code)
              </label>
              <input
                type="text"
                required
                maxLength={3}
                value={formData.departureAirport}
                onChange={(e) =>
                  setFormData({ ...formData, departureAirport: e.target.value.toUpperCase() })
                }
                placeholder="LHR"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                To (Airport Code)
              </label>
              <input
                type="text"
                required
                maxLength={3}
                value={formData.arrivalAirport}
                onChange={(e) =>
                  setFormData({ ...formData, arrivalAirport: e.target.value.toUpperCase() })
                }
                placeholder="JFK"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Departure Date (Optional)
            </label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) =>
                setFormData({ ...formData, departureDate: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Airline */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Airline (Optional)
            </label>
            <input
              type="text"
              value={formData.airline}
              onChange={(e) =>
                setFormData({ ...formData, airline: e.target.value })
              }
              placeholder="British Airways"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Flight Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Flight Number (Optional)
            </label>
            <input
              type="text"
              value={formData.flightNumber}
              onChange={(e) =>
                setFormData({ ...formData, flightNumber: e.target.value })
              }
              placeholder="BA123"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Confirmation Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmation Code (Optional)
            </label>
            <input
              type="text"
              value={formData.confirmationCode}
              onChange={(e) =>
                setFormData({ ...formData, confirmationCode: e.target.value })
              }
              placeholder="ABC123"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
