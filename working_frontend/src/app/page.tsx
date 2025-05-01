// src/app/page.tsx
'use client';

import { useState } from 'react';
import dynamic     from 'next/dynamic';
import Image       from 'next/image';
import { buildReportPdf } from '@/utils/pdf';

import Map             from '@/components/Map';
import SearchControls  from '@/components/SearchControls';
import ZipResultCard   from '@/components/ZipResultCard';

const Loader = dynamic(() => import('@/components/Loader'), { ssr: false });

type Weights = {
  rent: number;
  competition: number;
  population: number;
  income: number;
  traffic: number;
  parking: number;
};

export default function Home() {
  /* ───────────────────────── shared state ───────────────────────── */
  const [lat,  setLat]  = useState<number | null>(null);
  const [lng,  setLng]  = useState<number | null>(null);

  const [radiusMiles, setRadius] = useState(5);
  const [weights, setWeights] = useState<Weights>({
    rent: 0.2,
    competition: 0.2,
    population: 0.3,
    income: 0.1,
    traffic: 0.0,
    parking: 0.1,
  });

  const [results,       setResults]       = useState<any[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emailModalOpen, setEmailModal] = useState(false);
const [emailAddr,      setEmailAddr]  = useState('');


  const selectedZip = results[selectedIndex]?.zip ?? null;

  /* ───────────────────────── analysis handler ───────────────────── */
  async function runAnalysis({
    radiusMiles,
    weights,
  }: {
    radiusMiles: number;
    weights: Record<string, number>;
  }) {
    if (lat == null || lng == null) {
      alert('Click a point on the map first');
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
          radius: radiusMiles * 1.60934,      // backend expects km
          weights,
          business_type: 'barbershop',
        }),
      });

      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      setResults(data.results);
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
      alert('Analysis failed – see console');
    } finally {
      setLoading(false);
    }
  }

  /* ───────────────────────────── markup ─────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Decorative banner ─── */}
      <img
        src="/images/site-banner-short.png"
        alt=""
        className="w-full select-none pointer-events-none"
      />

      {/* ─── Header ─── */}
      <header className="flex flex-col items-center gap-2 p-6 pb-4 mb-12 shadow bg-white">
        <Image
          src="/images/firestore-text.png"
          alt="Firestore"
          width={320}
          height={800}
          priority
        />
        <p className="text-sm text-gray-600 text-center max-w-md">
          Find the perfect spot for your next shop — balance rent, foot-traffic,
          competition and more in a single click.
        </p>
      </header>

      {/* ─── Main grid ─── */}
      <main className="flex-1 flex justify-center">
        <div
          className="
            grid gap-6 px-4 sm:px-6
            lg:grid-cols-[300px_minmax(500px,1fr)_480px]
          "
        >
          {/* 1️⃣ Settings / sliders pane */}
          <aside
            className="
              order-1 lg:order-none
              lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]
              space-y-4 overflow-y-auto
            "
          >
            <h3 className="flex items-baseline gap-2 mb-10">
              <span className="text-5xl md:text-6xl font-extrabold text-gray-300 leading-none">1.</span>
              <span className="text-2xl md:text-2xl font-extrabold text-gray-600 leading-none">ADJUST YOUR CRITERIA</span>
            </h3>

            <SearchControls
              radius={radiusMiles}
              weights={weights}
              onRadiusChange={setRadius}
              onWeightsChange={setWeights}
            />
          </aside>

          {/* 2️⃣ Map pane */}
          <section className="order-2 lg:order-none space-y-4">
            <h3 className="flex items-baseline gap-2 mb-10">
              <span className="text-5xl md:text-6xl font-extrabold text-gray-300 leading-none">2.</span>
              <span className="text-2xl md:text-2xl font-extrabold text-gray-600 leading-none">CLICK A CANDIDATE LOCATION ON THE MAP</span>
            </h3>

            <div className="w-full aspect-[4/3] rounded-md border shadow">
              <Map
                lat={lat}
                lng={lng}
                radiusKm={radiusMiles * 1.60934}
                results={results}
                highlightedZip={selectedZip ?? null}
                onSelect={(la, lo) => {
                  setLat(la);
                  setLng(lo);
                }}
              />
            </div>

            {lat != null && lng != null && (
              <p className="text-sm text-gray-600 text-center">
                Selected:&nbsp;
                <strong>{lat.toFixed(4)}, {lng.toFixed(4)}</strong>
              </p>
            )}
          </section>

          {/* 3️⃣ Results / CTA pane */}
          <aside
            className="
              order-3 lg:order-none
              space-y-4
              lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]
              overflow-hidden
            "
          >
            <h3 className="flex items-baseline gap-2 mb-10">
              <span className="text-5xl md:text-6xl font-extrabold text-gray-300 leading-none">3.</span>
              <span className="text-2xl md:text-2xl font-extrabold text-gray-600 leading-none">REVIEW THE TOP ZONES</span>
            </h3>

            {/* CTA stack BEFORE analysis */}
            {results.length === 0 && (
              <>
                {/* Payment placeholders */}
                <section className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Payment options
                  </h4>

                  {['gpay', 'apple', 'paypal'].map((brand) => (
                    <button
                      key={brand}
                      disabled
                      className="
                        w-full flex items-center justify-center gap-2
                        py-1.5 rounded border border-gray-300
                        hover:bg-gray-50 disabled:opacity-60
                      "
                    >
                      <Image
                        src={`/images/pay-${brand}.png`}
                        alt=""
                        width={22}
                        height={22}
                      />
                      <span className="text-xs capitalize">
                        {brand === 'gpay' ? 'Google Pay' : brand + ' Pay'}
                      </span>
                    </button>
                  ))}
                </section>

                {/* Cog + Analyze */}
                <div className="space-y-3 pt-4">
                  <button
                    disabled
                    title="Settings (coming soon)"
                    className="
                      w-10 h-10 mx-auto flex items-center justify-center
                      rounded-full border border-gray-300 bg-white
                      text-gray-600 hover:bg-gray-50 disabled:opacity-60
                    "
                  >
                    ⚙️
                  </button>

                  <button
                    onClick={() => runAnalysis({ radiusMiles, weights })}
                    className="
                      w-full text-center
                      bg-green-600 hover:bg-green-700
                      text-white font-semibold
                      px-4 py-2 rounded shadow
                    "
                  >
                    Analyze&nbsp;Location
                  </button>
                </div>
              </>
            )}

            {/* Card carousel AFTER analysis */}
            {results.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  {/* ← arrow */}
                  <button
                    onClick={() =>
                      setSelectedIndex((i) => Math.max(0, i - 1))
                    }
                    disabled={selectedIndex === 0}
                    className="
                      px-2 py-1 rounded
                      bg-gray-200 hover:bg-gray-300
                      disabled:opacity-40
                    "
                  >
                    ←
                  </button>

                  {/* active card */}
                  <div className="flex-1 min-w-0">
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

                  {/* → arrow */}
                  <button
                    onClick={() =>
                      setSelectedIndex((i) =>
                        Math.min(results.length - 1, i + 1),
                      )
                    }
                    disabled={selectedIndex === results.length - 1}
                    className="
                      px-2 py-1 rounded
                      bg-gray-200 hover:bg-gray-300
                      disabled:opacity-40
                    "
                  >
                    →
                  </button>
                </div>

                {/* ─── PDF actions ─── */}
                <div className="flex gap-3 pt-4">
                  {/* Download */}
                  <button
                    className="flex-1 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    onClick={async () => {
                      const blob = await buildReportPdf(results, { radiusMiles, weights });
                      const url  = URL.createObjectURL(blob);
                      const a    = document.createElement('a');
                      a.href = url;
                      a.download = 'firestore-report.pdf';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download&nbsp;PDF
                  </button>

                  {/* Email */}
                  <button
                    className="flex-1 px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                    onClick={() => setEmailModal(true)}
                  >
                    Email&nbsp;PDF
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
        {emailModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow p-6 w-80 space-y-4">
              <h4 className="font-semibold text-lg">Send report by email</h4>

              <input
                type="email"
                placeholder="you@example.com"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />

              <div className="flex justify-end gap-3">
                <button
                  className="px-3 py-1 text-sm"
                  onClick={() => setEmailModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-40"
                  disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddr)}
                  onClick={async () => {
                    const blob = await buildReportPdf(results, { radiusMiles, weights });
                    const buf  = await blob.arrayBuffer();
                    const binary = Array.from(new Uint8Array(buf))
                      .map((b) => String.fromCharCode(b))
                      .join('');
                    const base64 = btoa(binary);

                    await fetch('/api/email-report', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: emailAddr, pdfBase64: base64 }),
                    });

                    setEmailModal(false);
                    alert('Email sent!');
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="text-xs text-gray-400 text-center py-4">
        © {new Date().getFullYear()} Firestore · All rights reserved
      </footer>

      {/* ─── Loading overlay ─── */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur flex flex-col items-center justify-center z-40">
          <Loader />
          <p className="mt-2 text-green-700 font-medium">Crunching numbers…</p>
        </div>
      )}
    </div>
  );
}
