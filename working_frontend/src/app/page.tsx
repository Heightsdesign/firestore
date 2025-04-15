'use client';

import { useState } from 'react';
import Map from '@/components/Map';
import AnalyzeButton from '@/components/AnalyzeButton';
import SearchControls from '@/components/SearchControls';

export default function Home() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState(5); // miles

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
            <AnalyzeButton lat={lat} lng={lng} />
          </div>
        ) : (
          <p className="text-center text-gray-400">Click anywhere on the map to begin.</p>
        )}
      </section>

      <SearchControls
        onRun={({ radiusMiles, weights }) => {
          console.log('🚀 Run analysis with:', radiusMiles, weights);
        }}
        onRadiusChange={(miles) => {
          setRadius(miles); // 👈 updates map radius
        }}
      />
    </main>
  );
}
