'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50
        bg-white shadow px-6 py-3
        flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Image
            src="/images/firestore-text.png"
            alt="Firestore Logo"
            width={140}
            height={32}
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <Link href="/articles" className="hover:text-green-600">Articles</Link>
      </div>
    </nav>
  );
}
