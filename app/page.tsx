'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import FlightsList from '@/components/FlightsList';

export default function Home() {
  const { data: session, status } = useSession();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    emailsScanned?: number;
    flightsFound?: number;
  } | null>(null);

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
      }
    } catch (error) {
      alert('Failed to scan emails. Please try again.');
    } finally {
      setScanning(false);
    }
  };

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
            Email Scanner
          </h2>
          <p className="mb-4 text-gray-600">
            Scan your Gmail for flight confirmations from the last 2 years.
          </p>
          <button
            onClick={handleScanEmails}
            disabled={scanning}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {scanning ? '⏳ Scanning...' : '🔍 Scan Emails'}
          </button>

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

        {/* Flights List */}
        <FlightsList />
      </main>
    </div>
  );
}
