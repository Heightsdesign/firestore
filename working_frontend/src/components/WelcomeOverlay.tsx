'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function WelcomeOverlay() {
  const [show, setShow] = useState(true);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('fs_visited');
      if (visited) setShow(false);
    }
  }, []);

  function handleContinue() {
    localStorage.setItem('fs_visited', 'yes');
    setIsHiding(true);
    setTimeout(() => setShow(false), 600); // match transition duration
  }

  if (!show) return null;

  return (
    <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center
                    bg-gray-900/60 bg-cover bg-center backdrop-blur-sm
                    transition-all duration-600 ease-in-out transform
                    ${isHiding ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
                    `}
        style={{
            backgroundImage: "url('/images/welcome_overlay_bg.jpeg')",
            backgroundPosition: 'center -200px',
            transform: isHiding ? 'translateY(-100vh)' : 'translateY(0)',
            opacity:   isHiding ? 0 : 1,
            transition: 'transform 0.6s ease, opacity 0.6s ease',
        }}
        >
      <Image
        src="/images/firestore-text.png"
        alt="Firestore"
        width={280}
        height={80}
        priority
        className="mb-10"
      />

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        Welcome to Firestore
      </h1>

      <p className="text-gray-600 text-center max-w-xl mb-10">
        Firestore helps you find the perfect location for your business in just a few clicks.
        Analyze rent, competition, traffic and more on an interactive map. <br />
        Ready to see it in action?
      </p>

      <button
        onClick={handleContinue}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-4 rounded-md
            text-xl font-semibold 
            shadow"
            >
        Get Started
      </button>
    </div>
  );
}
