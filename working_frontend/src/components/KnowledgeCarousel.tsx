'use client';

import { useState } from 'react';
import Link from 'next/link';

const ARTICLES = [
  {
    slug: 'radius-guide',
    title: 'Size The Perfect Radius',
    blurb: '3 quick tips for choosing 3 mi vs 5 mi vs 10 mi.',
  },
  {
    slug: 'competitor-density',
    title: 'Reading Competitor Density Maps',
    blurb: 'When “too many rivals” is actually good traffic.',
  },
  {
    slug: 'parking-factors',
    title: 'Parking Factors Explained',
    blurb: 'How much weight should you give parking scores?',
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
            href={`/knowledge/${ARTICLES[index].slug}`}
            className="block w-full h-full bg-gray-50 p-8 text-center flex flex-col items-center justify-center"
          >
            <div>
              <h1 className="text-5xl font-extrabold text-gray-800 mb-2">
                {ARTICLES[index].title}
              </h1>
              <p className="text-gray-600 text-sm mb-6">
                {ARTICLES[index].blurb}
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
