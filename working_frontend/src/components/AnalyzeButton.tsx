'use client';

import { useState } from 'react';

export default function AnalyzeButton({ lat, lng }: { lat: number; lng: number }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lng,
          radius_km: 5,
          business_type: 'barbershop',
          weights: {
            rent: 0.2,
            competition: 0.2,
            population: 0.3,
            income: 0.1,
            traffic: 0.0,
            parking: 0.1,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Unknown error');
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Selected Location'}
      </button>

      {error && <p className="text-red-600">❌ {error}</p>}

      {results.length > 0 && (
        <div className="space-y-2 mt-4">
          {results.map((zone, i) => (
            <div key={zone.zip} className="border p-4 rounded shadow">
              <h3 className="font-semibold text-lg">
                #{i + 1}: {zone.name} ({zone.zip})
              </h3>
              <p>📊 Score: {zone.score}</p>
              <p>💬 Insight: {zone.gpt_insight}</p>
              <a
                className="text-blue-600 underline"
                href={zone.loopnet_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on LoopNet
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
