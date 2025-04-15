'use client';

interface ZipResultCardProps {
  index: number;
  zone: {
    zip: string;
    score: number;
    population: number;
    median_income: number;
    rent_cost: number;
    rent_cost_label: string;
    competitor_count: number;
    traffic_score: number;
    parking_score: number;
    gpt_insight: string;
    loopnet_url: string;
  };
}

export default function ZipResultCard({ index, zone }: ZipResultCardProps) {
  return (
    <div className="p-4 border rounded shadow bg-white space-y-1">
      <h3 className="text-lg font-semibold">#{index + 1} - ZIP {zone.zip}</h3>
      <p><strong>Score:</strong> {zone.score}</p>
      <p><strong>Population:</strong> {zone.population}</p>
      <p><strong>Income:</strong> ${zone.median_income}</p>
      <p><strong>Rent:</strong> {zone.rent_cost} ({zone.rent_cost_label})</p>
      <p><strong>Competitors:</strong> {zone.competitor_count}</p>
      <p><strong>Traffic:</strong> {zone.traffic_score}</p>
      <p><strong>Parking:</strong> {zone.parking_score}</p>
      <p><strong>Insight:</strong> {zone.gpt_insight}</p>
      <a
        href={zone.loopnet_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View Listings on LoopNet
      </a>
    </div>
  );
}
