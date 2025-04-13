'use client';

import { useState } from 'react';
import Map from '@/components/Map';
import AnalyzeButton from '@/components/AnalyzeButton';

export default function Home() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  return (
    <main className="p-10 space-y-6">
      <h1 className="text-3xl font-bold text-center">📍 Business Zone Finder</h1>

      <Map
        onSelect={(selectedLat, selectedLng) => {
          setLat(selectedLat);
          setLng(selectedLng);
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
    </main>
  );
}
