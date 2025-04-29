// src/app/page.tsx
'use client';

import { useState } from 'react';
import dynamic     from 'next/dynamic';
import Image       from 'next/image';

import Map             from '@/components/Map';
import SearchControls  from '@/components/SearchControls';
import ZipResultCard   from '@/components/ZipResultCard';

const Loader = dynamic(() => import('@/components/Loader'), { ssr: false });

export default function Home() {
  /* ──────────────────────────── state */
  const [lat, setLat]             = useState<number | null>(null);
  const [lng, setLng]             = useState<number | null>(null);
  const [radiusMiles, setRadius]  = useState(5);          // miles

  const [results, setResults]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);

  const [selectedIndex, setIdx]   = useState(0);
  const selectedZip               = results[selectedIndex]?.zip ?? null;

  /* ─────────────────────── run analysis */
  async function runAnalysis({
    radiusMiles,
    weights,
  }: {
    radiusMiles: number;
    weights: Record<string, number>;
  }) {
    if (lat == null || lng == null) {
      alert('Please click a point on the map first');
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze/', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          lat,
          lng,
          radius: radiusMiles * 1.60934, // backend expects km
          weights,
          business_type: 'barbershop',
        }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();

      setResults(data.results);
      setIdx(0);
    } catch (err) {
      console.error(err);
      alert('Analysis failed – see console');
    } finally {
      setLoading(false);
    }
  }

  /* ─────────────────────────── layout */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Header ─── */}
      <header className="flex items-center justify-center p-4 shadow bg-white">
        <Image
          src="/images/firestore-full-logo-medium.png"
          alt="Firestore"
          width={160}
          height={40}
          priority
        />
      </header>

      {/* ─── Main (centred) ─── */}
      <main className="w-full flex justify-center">
        <div
          className="
            grid gap-6
            w-full max-w-7xl mx-auto
            lg:grid-cols-[300px_1fr_380px]   /* settings | map | results */
          "
        >
          {/* 1️⃣ Settings panel */}
          <aside
            className="
              order-1
              lg:order-none
              lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]
              overflow-y-auto
            "
          >
            <SearchControls
              initialRadius={radiusMiles}
              onRadiusChange={setRadius}
              onRun={runAnalysis}
            />
          </aside>

          {/* 2️⃣ Map */}
          <section className="order-2 lg:order-none space-y-4">
            <div className="w-full aspect-[4/3] rounded-md border shadow">
              <Map
                lat={lat}
                lng={lng}
                radiusKm={radiusMiles * 1.60934}
                results={results}
                highlightedZip={
                  selectedZip ? String(selectedZip) : null
                }
                onSelect={(la, lo) => {
                  setLat(la);
                  setLng(lo);
                }}
              />
            </div>

            {lat != null && lng != null && (
              <p className="text-sm text-gray-600 text-center">
                Selected:&nbsp;
                <strong>{lat.toFixed(4)},&nbsp;{lng.toFixed(4)}</strong>
              </p>
            )}
          </section>

          {/* 3️⃣ Results (one card at a time) */}
          <aside
            className="
              order-3 lg:order-none
              space-y-4
              lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]
              overflow-hidden
            "
          >
            {results.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                Run an analysis to see suggested zones
              </p>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-center">Top Zones</h2>

                <div className="flex items-center gap-2 justify-center">
                  {/* ← button */}
                  <button
                    onClick={() => setIdx((i) => Math.max(0, i - 1))}
                    disabled={selectedIndex === 0}
                    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
                  >
                    ←
                  </button>

                  {/* animated card */}
                  <div className="relative w-[90vw] sm:w-80 overflow-hidden mx-2">
                    <div
                      key={results[selectedIndex].zip}
                      className="
                        transition duration-300 ease-out
                        translate-x-6 opacity-0
                        animate-[slide-fade_0.3s_ease-out_forwards]
                      "
                    >
                      <ZipResultCard
                        index={selectedIndex}
                        zone={results[selectedIndex]}
                        isActive
                        onSelect={() => null}
                      />
                    </div>
                  </div>

                  {/* → button */}
                  <button
                    onClick={() =>
                      setIdx((i) => Math.min(results.length - 1, i + 1))
                    }
                    disabled={selectedIndex === results.length - 1}
                    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      {/* ─── Loading overlay ─── */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur flex flex-col items-center justify-center z-40">
          <Loader />
          <p className="mt-2 text-green-700 font-medium">Analyzing…</p>
        </div>
      )}
    </div>
  );
}
