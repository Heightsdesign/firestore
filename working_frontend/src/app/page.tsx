'use client';

import { useState } from 'react';
import Map from '@/components/Map';
import AnalyzeButton from '@/components/AnalyzeButton';

export default function Home() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  return (
    <main className="p-10 space-y-6">
      <h1 className="text-3xl font-bold text-center">📍 Firestore</h1>
      <section className="w-full flex flex-col items-center justify-center mt-6 px-4">
        <h2 className="text-xl font-semibold mb-4">🗺️ Choose a Location</h2>

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
      </section>
    </main>
  );
}
