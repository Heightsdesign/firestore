'use client';

import { useState } from 'react';
import Map from '@/components/Map';
import AnalyzeButton from '@/components/AnalyzeButton';
import SearchControls from '@/components/SearchControls';

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
          radius: radiusMiles,
          weights,
          business_type: 'barbershop', // temp hardcoded
        }),
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      console.log('✅ Received results:', data);
      setResults(data);
    } catch (err) {
      console.error('❌ Error running analysis:', err);
      alert('Failed to analyze. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 space-y-6">
      <h1 className="text-3xl font-bold text-center">📍 Firestore</h1>

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

      {loading && <p className="text-center text-blue-600 font-medium">Analyzing...</p>}

      {results.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Top Zones:</h2>
          {results.map((zone, index) => (
            <div key={index} className="p-4 border rounded shadow">
              <p><strong>#{index + 1} ZIP:</strong> {zone.zip}</p>
              <p><strong>Score:</strong> {zone.score}</p>
              <p><strong>Population:</strong> {zone.population}</p>
              <p><strong>Income:</strong> ${zone.median_income}</p>
              <p><strong>Rent:</strong> {zone.rent_cost} ({zone.rent_cost_label})</p>
              <p><strong>Competitors:</strong> {zone.competitor_count}</p>
              <p><strong>Traffic:</strong> {zone.traffic_score}</p>
              <p><strong>Parking:</strong> {zone.parking_score}</p>
              <p><strong>Insight:</strong> {zone.insight}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
