'use client';

import { useState, useMemo } from 'react';
import { PRESETS, Weights } from '@/constants/presets';

interface Props {
  business: string;
  radius: number;
  weights: Weights;
  onBusinessChange: (key: string) => void;
  onRadiusChange: (miles: number) => void;
  onWeightsChange: (w: Weights) => void;
}

export default function SearchControls(props: Props) {
  const {
    business,
    radius,
    weights,
    onBusinessChange,
    onRadiusChange,
    onWeightsChange,
  } = props;

  /** current total weight (0‒1) */
  const total = useMemo(
    () =>
      weights.rent +
      weights.competition +
      weights.population +
      weights.income +
      weights.traffic +
      weights.parking,
    [weights],
  );

  /** update a single weight while clamping total ≤ 1 */
  function updateWeight(key: keyof Weights, value: number) {
    const current = weights[key];
    const proposedTotal = total - current + value;

    // clamp if we would exceed 1
    const finalValue =
      proposedTotal > 1 ? value - (proposedTotal - 1) : value;

    onWeightsChange({
      ...weights,
      [key]: +(finalValue.toFixed(2)), // round to 2‑dp
    });
  }

  return (
    <div className="w-full space-y-6 mb-2">
      {/* Business preset selector */}
      <div>
        <label className="text-sm font-semibold text-gray-800">
          Business type
        </label>
        <select
          value={business}
          onChange={(e) => onBusinessChange(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm mb-1"
        >
          {Object.entries(PRESETS).map(([key, { label }]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Radius slider */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-gray-800 mb-1">
          Radius: {radius} miles
        </label>
        <input
          type="range"
          min={2}
          max={5}
          step={1}
          value={radius}
          onChange={(e) => onRadiusChange(+e.target.value)}
          className="w-full slider-green"
        />
      </div>

      {/* Weight sliders */}
      {(
        Object.keys(weights) as (keyof Weights)[]
      ).map((key) => {
        const remaining = 1 - (total - weights[key]); // max user can still add
        return (
          <div key={key}>
            <label className="text-sm font-semibold text-gray-800 mb-1 capitalize">
              {key}: {weights[key]}
            </label>
            <input
              type="range"
              min={0}
              max={remaining}
              step={0.05}
              value={weights[key]}
              onChange={(e) => updateWeight(key, +e.target.value)}
              className="w-full slider-green"
            />
          </div>
        );
      })}

      {/* Tiny helper text */}
      <p className="text-xs text-gray-500">
        Weight budget used:&nbsp;
        <span className={total === 1 ? 'text-red-600' : ''}>
          {(total * 100).toFixed(0)}%
        </span>
        &nbsp;(max 100%)
      </p>
    </div>
  );
}
