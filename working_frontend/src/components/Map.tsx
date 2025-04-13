'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MapProps {
  onSelect: (lat: number, lng: number) => void;
}

export default function Map({ onSelect }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-118.2437, 34.0522], // Default: Los Angeles
      zoom: 10,
    });

    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      console.log('🗺️ Clicked:', lat, lng);
      onSelect(lat, lng);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onSelect]);

  return <div ref={mapContainerRef} className="w-full h-[500px] rounded shadow" />;
}
