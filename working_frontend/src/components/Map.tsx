'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import { FeatureCollection, Point, GeoJsonProperties } from 'geojson';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MapProps {
  onSelect: (lat: number, lng: number) => void;
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  highlightedZip?: string | null;
  results?: any[]; 
}

export default function Map({ onSelect, lat, lng, radiusKm, highlightedZip, results = [], }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const circleSourceRef = useRef<GeoJSONSource | null>(null); // pointer to the circle source
  

  // Initialize the map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-118.2437, 34.0522],
      zoom: 10,
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('✅ Map loaded');
      map.resize();

      map.addSource('zip-centers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Create an empty source
      map.addSource('circle-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[]],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: 'zip-points',
        type: 'circle',
        source: 'zip-centers',
        paint: {
          'circle-radius': 6,
          'circle-color': '#3b82f6',      // default blue
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
        },
      });

      circleSourceRef.current = map.getSource('circle-source') as GeoJSONSource;

      map.addLayer({
        id: 'circle-layer',
        type: 'fill',
        source: 'circle-source',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.25,
        },
      });

      console.log('🟢 Source and layer added');
    });

    map.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      console.log('🖱️ Map clicked at:', lat, lng);
      onSelect(lat, lng);
    });

    

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw circle when radius or coords change
  useEffect(() => {
    console.log('📣 useEffect triggered with:');
    console.log('   ➤ lat:', lat);
    console.log('   ➤ lng:', lng);
    console.log('   ➤ radiusKm:', radiusKm);

    if (!mapRef.current) {
      console.warn('⛔ mapRef is not ready');
      return;
    }

    if (!circleSourceRef.current) {
      console.warn('⛔ circleSourceRef is not ready');
      return;
    }

    if (lat === null || lng === null) {
      console.warn('⛔ lat or lng is null');
      return;
    }

    const circle = createCircleGeoJSON([lng, lat], radiusKm);
    console.log('🔁 Calling setData() with updated circle geometry');

    circleSourceRef.current.setData(circle);
  }, [lat, lng, radiusKm]);

  useEffect(() => {
    if (!mapRef.current) return;
  
    const src = mapRef.current.getSource('zip-centers') as GeoJSONSource | undefined;
    if (!src) return;
  
    /* nothing selected → clear the source */
    if (!highlightedZip) {
      src.setData({ type: 'FeatureCollection', features: [] } as any);
      return;
    }
  
    const zone = results.find((z: any) => String(z.zip) === String(highlightedZip));
    if (!zone) return;
  
    const fc: FeatureCollection<Point, GeoJsonProperties> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [zone.lng, zone.lat] },
          properties: { zip: String(zone.zip) },
        },
      ],
    };
    src.setData(fc as any);
  }, [results, highlightedZip]);
  
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapRef.current.isStyleLoaded()) return;
  if (!mapRef.current.getLayer('zip-points')) return;
  
    mapRef.current.setPaintProperty('zip-points', 'circle-color', [
      'match',
      ['get', 'zip'],
      highlightedZip ?? '',   // match key
      '#f59e0b',              // highlight amber
      '#3b82f6',              // default blue
    ]);
  }, [highlightedZip]);
  
  // Circle geo generator with logs
  function createCircleGeoJSON(
    [lng, lat]: [number, number],
    radiusKm: number,
    points = 64
  ): GeoJSON.Feature {
    console.log('📏 createCircleGeoJSON called with:', { lng, lat, radiusKm });

    const coords = [];
    const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      coords.push([
        lng + distanceX * Math.cos(theta),
        lat + distanceY * Math.sin(theta),
      ]);
    }
    coords.push(coords[0]); // close the loop

    console.log('🧮 First 3 coords:', coords.slice(0, 3));
    console.log('🧮 Total coords in polygon:', coords.length);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
      properties: {},
    };
  }

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
