import Link from 'next/link';

const ARTICLES = [
  {
    title: "Parking Factors Explained",
    summary: "How much weight should you give parking scores?",
    slug: "/articles/parking-factors-explained",
  },
  {
    title: "Best ZIPs for Opening a Coffee Shop in Los Angeles",
    summary: "Find the best areas in LA to open a café based on income, traffic, and competitor density.",
    slug: "/articles/coffee-shop-locations-la",
  },
  {
    title: "Where to Open a Boutique in Miami",
    summary: "Target stylish ZIPs with high spending power and low direct fashion competition.",
    slug: "/articles/boutique-miami-guide",
  },
  {
    title: "Opening a Fitness Studio: Where to Start",
    summary: "Target neighborhoods where fitness demand is high but supply is still limited.",
    slug: "/articles/fitness-studio-guide",
  },
  {
    title: "How to Analyze Foot Traffic for a New Business",
    summary: "Foot traffic tells you more than just volume — it reveals patterns and intent.",
    slug: "/articles/analyze-foot-traffic",
  },
  {
    title: "Top Mistakes When Choosing a Business Location",
    summary: "Avoid common traps like chasing rent savings or ignoring nearby competition.",
    slug: "/articles/location-selection-mistakes",
  },
];

export default function ArticlesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-10">Business Location Guides</h1>
      <div className="space-y-8">
        {ARTICLES.map(({ title, summary, slug }) => (
          <div key={slug} className="bg-white p-6 rounded shadow hover:shadow-md transition">
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-600 mb-3">{summary}</p>
            <Link href={slug} className="text-green-600 font-medium hover:underline">
              Read full article →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
