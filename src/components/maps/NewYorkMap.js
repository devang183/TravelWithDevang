"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Navigation, X, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import Fuse from "fuse.js";
import { useQuery } from '@tanstack/react-query';

// Add keyframe animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Permanent map label styles */
    .newyork-map-label {
      background: rgba(255, 255, 255, 0.95) !important;
      border: 2px solid rgba(99, 102, 241, 0.8) !important;
      border-radius: 8px !important;
      padding: 4px 8px !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      color: #1e293b !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      white-space: nowrap !important;
      pointer-events: none !important;
      backdrop-filter: blur(8px) !important;
    }
  `;
  if (!document.head.querySelector('#newyork-map-animations')) {
    style.id = 'newyork-map-animations';
    document.head.appendChild(style);
  }
}

// Category emojis for New York
const CATEGORY_EMOJIS = {
  restaurant: "🍽️",
  cafe: "☕",
  bar: "🍺",
  museum: "🖼️",
  park: "🌳",
  landmark: "🗽",
  theater: "🎭",
  shopping: "🛍️",
  hotel: "🏨",
  viewpoint: "🔭",
  subway: "🚇",
  historic: "🏛️",
  art: "🎨",
  default: "📍"
};

export default function NewYorkMap({ coords = [40.7128, -74.0060], zoom = 12, name = "New York" }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRefs = useRef([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch pins from MongoDB via API using React Query
  const { data: pinsData, error: queryError, isLoading } = useQuery({
    queryKey: ['newyork-pins'],
    queryFn: async () => {
      const response = await fetch('/api/pins-newyork');
      if (!response.ok) {
        throw new Error(`Failed to fetch New York pins: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    onSuccess: (data) => {
      console.log(`Loaded ${data.length} pins for New York from API`);
    },
    onError: (queryError) => {
      console.error('Error fetching New York pins:', queryError);
      setLoading(false);
    }
  });

  // Load Leaflet and initialize map
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // Fix Leaflet icon paths
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (!isMounted || !mapRef.current) return;

        // Initialize map
        if (!mapInstance.current) {
          mapInstance.current = L.map(mapRef.current).setView(coords, zoom);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(mapInstance.current);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        setLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coords, zoom]);

  // Add markers when pins data is loaded
  useEffect(() => {
    if (!mapInstance.current || !pinsData || isLoading) return;

    const L = window.L;
    if (!L) return;

    // Clear existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Add new markers
    const newMarkers = pinsData.map((pin, index) => {
      const emoji = CATEGORY_EMOJIS[pin.category] || CATEGORY_EMOJIS.default;

      const icon = L.divIcon({
        html: `<div style="font-size: 24px;">${emoji}</div>`,
        className: 'custom-marker-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker(pin.coords, { icon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${pin.name}</h3>
            <p style="margin: 0 0 8px 0;">${pin.description || ''}</p>
            ${pin.website ? `<a href="${pin.website}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6;">Visit Website</a>` : ''}
          </div>
        `);

      marker.on('click', () => setSelectedMarker(pin));
      markerRefs.current.push(marker);

      return { ...pin, markerId: index };
    });

    setMarkers(newMarkers);
    setFilteredMarkers(newMarkers);
  }, [pinsData, isLoading]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMarkers(markers);
      return;
    }

    const fuse = new Fuse(markers, {
      keys: ['name', 'description', 'category', 'keywords'],
      threshold: 0.3
    });

    const results = fuse.search(searchTerm).map(result => result.item);
    setFilteredMarkers(results);
  }, [searchTerm, markers]);

  const flyToMarker = useCallback((pin) => {
    if (!mapInstance.current) return;

    mapInstance.current.setView(pin.coords, 16, {
      animate: true,
      duration: 1
    });

    const marker = markerRefs.current[pin.markerId];
    if (marker) {
      marker.openPopup();
    }
    setSelectedMarker(pin);
  }, []);

  if (queryError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading New York map: {queryError.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/10">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md transition"
      >
        <span className="font-medium text-white text-center">
          {isExpanded ? `Explore ${name}` : `Show ${name} Map`}
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Map Container */}
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-96 rounded-lg shadow-lg"
              style={{ zIndex: 1 }}
            />
            {(loading || isLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-600">Loading map...</p>
              </div>
            )}
          </div>

          {/* Results List */}
          {filteredMarkers.length > 0 && (
            <div className="mt-4 max-h-64 overflow-y-auto bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2 text-gray-800">
                {filteredMarkers.length} Location{filteredMarkers.length !== 1 ? 's' : ''} Found
              </h3>
              <div className="space-y-2">
                {filteredMarkers.map((pin) => (
                  <div
                    key={pin.markerId}
                    onClick={() => flyToMarker(pin)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer transition flex items-start gap-3"
                  >
                    <div className="text-2xl">{CATEGORY_EMOJIS[pin.category] || CATEGORY_EMOJIS.default}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{pin.name}</h4>
                      {pin.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{pin.description}</p>
                      )}
                    </div>
                    <Navigation className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
