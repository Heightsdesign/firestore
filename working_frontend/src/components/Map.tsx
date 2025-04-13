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
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-118.2437, 34.0522],
      zoom: 10,
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('✅ Map loaded');
      map.resize();
    });

    map.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      onSelect(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSelect]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100vw',
        height: '70vh',
        margin: '0 auto',
        maxWidth: '1200px',
        borderRadius: '0.5rem',
        border: '1px solid #ccc',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
}
