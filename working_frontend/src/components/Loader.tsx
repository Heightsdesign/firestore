'use client';

import { Player } from '@lottiefiles/react-lottie-player';

export default function Loader() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <Player
        autoplay
        loop
        src="/loading.json"
        style={{ height: '150px', width: '150px' }}
      />
    </div>
  );
}
