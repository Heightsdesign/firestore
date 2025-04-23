'use client';
import { useState, useRef } from "react";
import Map from "@/components/Map";
import SearchControls from "@/components/SearchControls";
import ZipResultCard from "@/components/ZipResultCard";
import Loader from "@/components/Loader";
import Image from "next/image";

/**
 * AppShell – Concept ① implementation
 * ┌────────────── Header ──────────────┐
 * │ logo  ⚙️Settings  Sign‑in          │
 * ├─────── grid (lg) ──────────────────┤
 * │  Map  │   Carousel                │  ⇢ desktop
 * │───────┴───────────────────────────│
 * │  Carousel                         │  ⇢ mobile (map below)
 * │  Map                              │
 * └────────────────────────────────────┘
 */
export default function AppShell() {
  /* ————— location + analysis state ————— */
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(5);

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedZip = results[selectedIndex]?.zip ?? null;
  const zone = results[selectedIndex];

  /* ————— settings drawer ————— */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen((o) => !o);

  /* ————— analysis handler ————— */
  async function runAnalysis({ radiusMiles, weights }: { radiusMiles: number; weights: Record<string, number> }) {
    if (lat == null || lng == null) {
      alert("Please click a point on the map first");
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/analyze/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lng,
          radius: radiusMiles * 1.60934, // backend expects km
          weights,
          business_type: "barbershop",
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResults(data.results);
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
      alert("Analysis failed – check console");
    } finally {
      setLoading(false);
      setDrawerOpen(false);
    }
  }

  /* ————— carousel ref for smooth centring ————— */
  const sliderRef = useRef<HTMLDivElement>(null);

  /* ————— jsx ————— */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between px-4 py-2 shadow bg-white">
        <div className="flex items-center gap-2">
          <Image src="/images/firestore-text.png" alt="logo" width={120} height={32} />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDrawer}
            className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm text-white font-semibold"
          >
            ⚙️ Settings
          </button>
          <button className="text-sm text-green-600 font-semibold">Sign&nbsp;in</button>
        </div>
      </header>

      {/* ─── Main grid ─── */}
      <main className="flex-1 lg:grid lg:grid-cols-[2fr_1fr] lg:gap-4">
        {/* Map column */}
        <div className="lg:sticky lg:top-0 lg:h-screen">
          <Map
            lat={lat}
            lng={lng}
            radiusKm={radiusMiles * 1.60934}
            results={results}
            highlightedZip={selectedZip ? String(selectedZip) : null}
            onSelect={(la, ln) => {
              setLat(la);
              setLng(ln);
            }}
          />
        </div>

        {/* Carousel column (desktop) or stacked (mobile) */}
        {results.length > 0 && (
          <section className="mt-6 lg:mt-0 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">Top Zones</h2>

            <div className="flex items-center gap-2">
              {/* ← */}
              <button
                onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
                disabled={selectedIndex === 0}
                className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
              >←</button>

              {/* single card view */}
              <div className="relative w-[90vw] sm:w-96 overflow-hidden mx-2">
                <div
                  key={zone.zip}
                  className="transition duration-300 ease-out
                            translate-x-6 opacity-0               /* start state */
                            animate-[slide-fade_0.3s_ease-out_forwards]"
                >
                  <ZipResultCard
                    index={selectedIndex}
                    zone={results[selectedIndex]}
                    isActive
                    onSelect={() => null}
                  />
                </div>
              </div>

              {/* → */}
              <button
                onClick={() => setSelectedIndex((i) => Math.min(results.length - 1, i + 1))}
                disabled={selectedIndex === results.length - 1}
                className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
              >→</button>
            </div>
          </section>
        )}
      </main>

      {/* ─── Loading overlay ─── */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur flex flex-col items-center justify-center z-40">
          <Loader />
          <p className="mt-2 text-green-700 font-medium">Analyzing…</p>
        </div>
      )}

      {/* ─── Settings drawer ─── */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform z-50
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="font-semibold">Settings</h3>
          <button onClick={toggleDrawer}>✕</button>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto">
          <SearchControls
            initialRadius={radiusMiles}
            onRadiusChange={setRadiusMiles}
            onRun={runAnalysis}
          />
        </div>
      </aside>
    </div>
  );
}
