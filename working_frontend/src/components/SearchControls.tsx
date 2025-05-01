'use client';

import { PRESETS, Weights } from '@/constants/presets';


interface Props {
   business: string;
   radius: number;
   weights: Weights;
   onBusinessChange: (key: string) => void;
   onRadiusChange: (miles: number) => void;
   onWeightsChange: (w: Weights) => void;
}

export default function SearchControls({
  business,
  radius,
  weights,
  onBusinessChange,
  onRadiusChange,
  onWeightsChange,
}: Props) {
  const updateWeight = (key: string, value: number) => {
    onWeightsChange({ ...weights, [key]: value } as Weights);
  };

  return (
    <>
      {/* ─── Business type selector ─── */}
      <div className="space-y-1">
        <label className="block font-medium text-gray-600">Business type</label>
        <select
          value={business}
          onChange={(e) => onBusinessChange(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          {Object.entries(PRESETS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {/* Radius */}
        <div>
          <label className="block font-medium text-gray-600 mb-1">
            📏 Radius: {radius} miles
          </label>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
            className="w-full slider-green"
          />
        </div>

        {/* Weights */}
        {Object.entries(weights).map(([key, value]) => (
          <div key={key}>
            <label className="block font-medium text-gray-600 mb-1 capitalize">
              {key}: {value}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={value}
              onChange={(e) => updateWeight(key, parseFloat(e.target.value))}
              className="w-full slider-green"
            />
          </div>
        ))}
      </div>
    </>
  );
}
