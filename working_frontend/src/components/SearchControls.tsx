'use client';

type Weights = {
  rent: number;
  competition: number;
  population: number;
  income: number;
  traffic: number;
  parking: number;
};

interface Props {
  radius: number;
  weights: Record<string, number>;
  onRadiusChange: (miles: number) => void;
  onWeightsChange: (w: Weights) => void;
}

export default function SearchControls({
  radius,
  weights,
  onRadiusChange,
  onWeightsChange,
}: Props) {
  const updateWeight = (key: string, value: number) => {
    onWeightsChange({ ...weights, [key]: value } as Weights);
  };

  return (
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
  );
}
