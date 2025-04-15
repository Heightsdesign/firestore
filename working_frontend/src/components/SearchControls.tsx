'use client';

import { useState } from 'react';

interface Props {
  onRun: (config: {
    radiusMiles: number;
    weights: Record<string, number>;
  }) => void;
  onRadiusChange: (miles: number) => void; // 👈 new prop
}

export default function SearchControls({ onRun, onRadiusChange }: Props) {
  const [radius, setRadius] = useState(5);
  const [weights, setWeights] = useState({
    rent: 0.2,
    competition: 0.2,
    population: 0.3,
    income: 0.1,
    traffic: 0.0,
    parking: 0.1,
  });

  const updateWeight = (key: string, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 mt-6">
      <div>
        <label className="block font-medium mb-1">📏 Radius: {radius} miles</label>
        <input
          type="range"
          min={2}
          max={20}
          step={1}
          value={radius}
          onChange={(e) => {
            const miles = parseInt(e.target.value);
            setRadius(miles);
            onRadiusChange(miles); // 👈 update parent
          }}
          className="w-full"
        />
      </div>

      {Object.entries(weights).map(([key, value]) => (
        <div key={key}>
          <label className="block font-medium mb-1 capitalize">
            {key}: {value}
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={value}
            onChange={(e) => updateWeight(key, parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      ))}

      <div className="text-center pt-4">
        <button
          onClick={() => onRun({ radiusMiles: radius, weights })}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Analyze Location
        </button>
      </div>
    </div>
  );
}
