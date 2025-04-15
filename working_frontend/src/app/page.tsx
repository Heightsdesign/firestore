'use client';

import { useState } from 'react';
import Map from '@/components/Map';
import SearchControls from '@/components/SearchControls';
import Loader from '@/components/Loader';
import Image from 'next/image';
import ZipResultCard from '@/components/ZipResultCard';


export default function Home() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState(5); // miles

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRunAnalysis = async ({
    radiusMiles,
    weights,
  }: {
    radiusMiles: number;
    weights: Record<string, number>;
  }) => {
    if (lat === null || lng === null) {
      alert('Please select a location on the map.');
      return;
    }

    setLoading(true);
    setResults([]); // Clear old ones

    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          radius: radiusMiles * 1.60934,
          weights,
          business_type: 'barbershop', // temp hardcoded
        }),
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      console.log('✅ Received results:', data);
      setResults(data.results);
    } catch (err) {
      console.error('❌ Error running analysis:', err);
      alert('Failed to analyze. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Image
          src="/images/firestore-full-logo-medium.png"
          alt="Firestore Logo"
          width={160} // You can adjust this
          height={40}
          priority
        />
        <h1 className="text-2xl font-semibold">Business Zone Finder</h1>
      </div>

      <section className="w-full flex flex-col items-center justify-center mt-6 px-4">
        <h2 className="text-xl font-semibold mb-4">🗺️ Choose a Location</h2>

        <Map
          lat={lat}
          lng={lng}
          radiusKm={radius * 1.60934}
          onSelect={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
        />

        {lat && lng ? (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Selected Location: <strong>{lat.toFixed(4)}, {lng.toFixed(4)}</strong>
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-400">Click anywhere on the map to begin.</p>
        )}
      </section>

      <SearchControls
        onRun={handleRunAnalysis}
        onRadiusChange={(miles) => setRadius(miles)}
      />

      {loading && (
        <>
          <p className="text-center text-blue-600 font-medium">Analyzing...</p>
          <Loader />
        </>
      )}

      {results.length > 0 && (
        <section className="mt-8 space-y-4 w-full max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-4">Top Zones:</h2>
          console.log("🧪 Rendering", results.length, "zones");
          {results.map((zone, index) => (
            <ZipResultCard key={index} index={index} zone={zone} />
          ))}
        </section>
      )}


    </main>
  );
}
