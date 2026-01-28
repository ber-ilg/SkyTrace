'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import FlightsList from '@/components/FlightsList';
import FlightsMap from '@/components/FlightsMap';
import FlightStats from '@/components/FlightStats';
import AddFlightModal from '@/components/AddFlightModal';
import { supabase } from '@/lib/supabase';
import type { Flight } from '@/lib/supabase';

export default function Home() {
  const { data: session, status } = useSession();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    emailsScanned?: number;
    flightsFound?: number;
  } | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const fetchFlights = async () => {
    if (!session?.user?.email) return;
    
    setLoadingFlights(true);
    
    // Get user ID from email
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();
    
    if (!userData) {
      setLoadingFlights(false);
      return;
    }

    // Store userId for manual flight entry
    setUserId(userData.id);

    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('user_id', userData.id)
      .order('departure_date', { ascending: false });

    if (!error && data) {
      setFlights(data);
    }
    setLoadingFlights(false);
  };

  const handleScanEmails = async () => {
    setScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/gmail/scan', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setScanResult(data);
        // Refresh flights after scan
        await fetchFlights();
      }
    } catch (error) {
      alert('Failed to scan emails. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchFlights();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl text-center">
          <h1 className="mb-4 text-6xl font-bold text-gray-900">
            ✈️ SkyTrace
          </h1>
          <p className="mb-8 text-xl text-gray-700">
            Your lifetime flight history, visualized.
          </p>
          <p className="mb-12 text-gray-600">
            Connect your Gmail account to automatically scan and map all your past flights.
          </p>
          <button
            onClick={() => signIn('google')}
            className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          >
            🔗 Connect Gmail
          </button>
          <div className="mt-12 text-sm text-gray-500">
            <p>✓ Secure OAuth connection</p>
            <p>✓ Read-only access to emails</p>
            <p>✓ Your data stays private</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">✈️ SkyTrace</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {session.user?.email}
              </p>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Scan Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Add Flights
          </h2>
          <p className="mb-4 text-gray-600">
            Scan your Gmail for flight confirmations or add flights manually.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleScanEmails}
              disabled={scanning}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {scanning ? '⏳ Scanning...' : '🔍 Scan Emails'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg border-2 border-blue-600 bg-white px-6 py-3 font-semibold text-blue-600 shadow hover:bg-blue-50"
            >
              ➕ Add Manually
            </button>
          </div>

          {scanResult && (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="font-medium text-green-900">
                ✅ Scan complete!
              </p>
              <p className="text-sm text-green-700">
                Scanned {scanResult.emailsScanned} emails, found {scanResult.flightsFound} flights
              </p>
            </div>
          )}
        </div>

        {/* Flight Statistics */}
        <FlightStats flights={flights} />

        {/* Flights Map */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Flight Map
          </h2>
          <FlightsMap flights={flights} />
        </div>

        {/* Flights List */}
        <FlightsList flights={flights} loading={loadingFlights} onRefresh={fetchFlights} />
      </main>

      {/* Add Flight Modal */}
      <AddFlightModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchFlights}
        userId={userId}
      />
    </div>
  );
}
