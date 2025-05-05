'use client';

import Image from 'next/image';
import Content from './content.mdx';

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
        </main>
    </div>
  );
}
