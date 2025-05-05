'use client';

import Content from './content.mdx';
import Link from 'next/link';

export default function ArticlePage() {
  return (
    <div className="min-h-screen flex flex-col">
        <div className="bg-white">
            <img
            src="/images/site-banner-short.png"
            alt=""
            className="w-full select-none pointer-events-none"
            />
        </div>
        <main className="prose lg:prose-lg mx-auto px-6 py-16">
          <Content />
          <Link href="/articles" className="inline-block mt-4 text-green-600 hover:underline">
            ← Back to Articles
          </Link>
        </main>
    </div>
  );
}
