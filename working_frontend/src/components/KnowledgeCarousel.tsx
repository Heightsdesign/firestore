'use client';

import { useState } from 'react';
import Link from 'next/link';

const ARTICLES = [
  {
    title: "Parking Factors Explained",
    summary: "How much weight should you give parking scores?",
    excerpt: "Choosing a location with the right parking can make or break your foot traffic...",
    slug: "/articles/parking-factors-explained",
  },
  {
    title: "Best ZIPs for Opening a Coffee Shop in Los Angeles",
    summary: "Find the best areas in LA to open a café based on income, traffic, and competitor density.",
    excerpt: "Silver Lake, DTLA and Mid-Wilshire all offer high foot traffic — but different tradeoffs...",
    slug: "/articles/coffee-shop-locations-la",
  },
  {
    title: "Where to Open a Boutique in Miami",
    summary: "Target stylish ZIPs with high spending power and low direct fashion competition.",
    excerpt: "Explore South Beach, Coconut Grove, and Wynwood to find a boutique-friendly pocket.",
    slug: "/articles/boutique-miami-guide",
  },
  {
    title: "Opening a Fitness Studio: Where to Start",
    summary: "Target neighborhoods where fitness demand is high but supply is still limited.",
    excerpt: "Areas may vary widely in gym saturation and rent finding the right spot for your gym studio.",
    slug: "/articles/fitness-austin-guide",
  },
  {
    title: "How to Analyze Foot Traffic for a New Business",
    summary: "Foot traffic tells you more than just volume — it reveals patterns and intent.",
    excerpt: "Look at both total traffic and time-of-day activity to understand your potential customer base.",
    slug: "/articles/analyze-foot-traffic",
  },
  {
    title: "Top Mistakes When Choosing a Business Location",
    summary: "Avoid common traps like chasing rent savings or ignoring nearby competition.",
    excerpt: "The cheapest location often costs more in missed revenue. Here’s how to choose better.",
    slug: "/articles/location-selection-mistakes",
  },
];

export default function KnowledgeCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((i) => (i === 0 ? ARTICLES.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === ARTICLES.length - 1 ? 0 : i + 1));

  return (
    <section className="parallax-bg bg-no-repeat py-24"
    style={{ backgroundImage: "url('/images/AdobeStock_45811028.jpeg')" }}
    >
      <div className="relative max-w-4xl mx-auto h-56 flex items-center">
        {/* ← arrow */}
        <button
          onClick={prev}
          className="absolute left-0 ml-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
        >
          ←
        </button>

        {/* card */}
        <div className="w-full flex-shrink-0 px-6">
          <Link
            href={ARTICLES[index].slug}
            className="block w-full h-full bg-gray-50 p-8 text-center flex flex-col items-center justify-center"
          >
            <div>
              <h1 className="text-5xl font-extrabold text-gray-800 mb-2">
                {ARTICLES[index].title}
              </h1>
              <p className="text-gray-600 text-sm mb-6">
                {ARTICLES[index].summary}
              </p>
              <span className="text-green-600 font-medium text-sm">
                Read full article →
              </span>
            </div>
          </Link>
        </div>

        {/* → arrow */}
        <button
          onClick={next}
          className="absolute right-0 mr-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
        >
          →
        </button>
      </div>
    </section>
  );
}
