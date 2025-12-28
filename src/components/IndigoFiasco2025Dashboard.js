'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Plane, MapPin } from 'lucide-react';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

// Major Indian city coordinates
const INDIAN_CITIES = {
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  'blr': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  'delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
  'del': { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  'bom': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  'ccu': { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  'maa': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  'hyd': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  'amd': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
  'goa': { lat: 15.2993, lng: 74.1240, name: 'Goa' },
  'kochi': { lat: 9.9312, lng: 76.2673, name: 'Kochi' },
  'cok': { lat: 9.9312, lng: 76.2673, name: 'Kochi' },
  'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, name: 'Chandigarh' },
  'indore': { lat: 22.7196, lng: 75.8577, name: 'Indore' },
  'nagpur': { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
  'patna': { lat: 25.5941, lng: 85.1376, name: 'Patna' },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram' },
  'trv': { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram' },
  'visakhapatnam': { lat: 17.6869, lng: 83.2185, name: 'Visakhapatnam' },
  'surat': { lat: 21.1702, lng: 72.8311, name: 'Surat' },
  'varanasi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi' }
};

const IndigoFiasco2025Dashboard = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityA, setCityA] = useState('');
  const [cityB, setCityB] = useState('');
  const [selectedFlight, setSelectedFlight] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Get unique cities for dropdown
  const uniqueCities = useMemo(() => {
    const seen = new Set();
    return Object.values(INDIAN_CITIES).filter(city => {
      if (seen.has(city.name)) return false;
      seen.add(city.name);
      return true;
    });
  }, []);

  // Calculate aerial distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate curved path points for flight route (Google Flights style)
  const getCurvedPath = (lat1, lng1, lat2, lng2, curveIntensity = 0.2) => {
    const points = [];
    const steps = 50; // Number of points along the curve

    // Calculate midpoint
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    // Calculate perpendicular offset for curve
    const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    const offsetLat = -(lng2 - lng1) * curveIntensity;
    const offsetLng = (lat2 - lat1) * curveIntensity;

    // Control point for quadratic bezier curve
    const ctrlLat = midLat + offsetLat;
    const ctrlLng = midLng + offsetLng;

    // Generate points along the curve using quadratic bezier formula
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = Math.pow(1 - t, 2) * lat1 + 2 * (1 - t) * t * ctrlLat + Math.pow(t, 2) * lat2;
      const lng = Math.pow(1 - t, 2) * lng1 + 2 * (1 - t) * t * ctrlLng + Math.pow(t, 2) * lng2;
      points.push([lat, lng]);
    }

    return points;
  };

  useEffect(() => {
    fetchData();
    setIsMapReady(true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/indigo-fiasco');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setRawData(result.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching Indigo Fiasco data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Deep analytics computed from raw data
  const analytics = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    // Extract all unique fields dynamically
    const allFields = new Set();
    rawData.forEach(record => {
      Object.keys(record).forEach(key => {
        if (key !== 'id' && key !== '_id') allFields.add(key);
      });
    });

    // Analyze temporal patterns
    const dateField = [...allFields].find(f =>
      f.toLowerCase().includes('date') ||
      f.toLowerCase().includes('time') ||
      f.toLowerCase().includes('when')
    );

    // Analyze location patterns
    const locationFields = [...allFields].filter(f =>
      f.toLowerCase().includes('location') ||
      f.toLowerCase().includes('airport') ||
      f.toLowerCase().includes('city') ||
      f.toLowerCase().includes('place') ||
      f.toLowerCase().includes('from') ||
      f.toLowerCase().includes('to') ||
      f.toLowerCase().includes('origin') ||
      f.toLowerCase().includes('destination')
    );

    // Analyze flight patterns
    const flightFields = [...allFields].filter(f =>
      f.toLowerCase().includes('flight') ||
      f.toLowerCase().includes('airline') ||
      f.toLowerCase().includes('route') ||
      f.toLowerCase().includes('6e')
    );

    // Analyze impact metrics
    const impactFields = [...allFields].filter(f =>
      f.toLowerCase().includes('passenger') ||
      f.toLowerCase().includes('delay') ||
      f.toLowerCase().includes('cancel') ||
      f.toLowerCase().includes('impact') ||
      f.toLowerCase().includes('affected') ||
      f.toLowerCase().includes('status')
    );

    // Extract cities from data
    const affectedCities = new Set();
    const cityPairs = [];
    const timelineData = [];

    rawData.forEach((record, idx) => {
      // Try to extract cities from various fields
      locationFields.forEach(field => {
        const value = String(record[field] || '').toLowerCase();
        Object.keys(INDIAN_CITIES).forEach(cityKey => {
          if (value.includes(cityKey)) {
            affectedCities.add(INDIAN_CITIES[cityKey].name);
          }
        });
      });

      // Try to extract date/time for timeline
      if (dateField && record[dateField]) {
        timelineData.push({
          date: record[dateField],
          record: record,
          index: idx
        });
      }
    });

    return {
      totalRecords: rawData.length,
      allFields: [...allFields],
      dateField,
      locationFields,
      flightFields,
      impactFields,
      affectedCities: [...affectedCities],
      timelineData,
      rawData
    };
  }, [rawData]);

  // Filter flights between two cities
  const filteredFlights = useMemo(() => {
    if (!cityA || !cityB || !analytics) return [];

    const cityALower = cityA.toLowerCase();
    const cityBLower = cityB.toLowerCase();

    return analytics.rawData.filter(record => {
      const recordStr = JSON.stringify(record).toLowerCase();
      return recordStr.includes(cityALower) && recordStr.includes(cityBLower);
    });
  }, [cityA, cityB, analytics]);

  // Get unique flight numbers from filtered flights
  const uniqueFlightNumbers = useMemo(() => {
    if (!filteredFlights.length || !analytics) return [];
    const flights = new Set();

    filteredFlights.forEach(record => {
      analytics.flightFields.forEach(field => {
        if (record[field]) {
          const flightNum = String(record[field]).trim();
          if (flightNum) flights.add(flightNum);
        }
      });
    });

    return Array.from(flights).sort();
  }, [filteredFlights, analytics]);

  // Get selected flight data and calculate distance
  const selectedFlightData = useMemo(() => {
    if (!selectedFlight || !cityA || !cityB) return null;

    const cityAData = Object.values(INDIAN_CITIES).find(c =>
      c.name.toLowerCase() === cityA.toLowerCase()
    );
    const cityBData = Object.values(INDIAN_CITIES).find(c =>
      c.name.toLowerCase() === cityB.toLowerCase()
    );

    if (!cityAData || !cityBData) return null;

    const distance = calculateDistance(
      cityAData.lat, cityAData.lng,
      cityBData.lat, cityBData.lng
    );

    // Find the flight record
    const flightRecord = filteredFlights.find(record => {
      return analytics.flightFields.some(field =>
        String(record[field]).trim() === selectedFlight
      );
    });

    return {
      distance: distance.toFixed(2),
      flightNumber: selectedFlight,
      record: flightRecord,
      cityA: cityAData,
      cityB: cityBData
    };
  }, [selectedFlight, cityA, cityB, filteredFlights, analytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Indigo Fiasco 2025 Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-red-800 text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md">
          <h2 className="text-yellow-800 text-xl font-bold mb-2">No Data Available</h2>
          <p className="text-yellow-600">The Indigo Fiasco 2025 collection is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Plane className="h-12 w-12 text-white drop-shadow-lg" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              IndiGo Fiasco 2025
            </h1>
          </div>
          <p className="text-xl text-gray-100 drop-shadow-md">
            Comprehensive Analysis & Deep-dive
          </p>
          <div className="mt-4 inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <p className="text-white font-semibold">
              {analytics.totalRecords} Records Analyzed
            </p>
          </div>
        </header>

        {/* Locations Section */}
        <div className="space-y-8">
          <div className="bg-white/30 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/40">
            <div className="flex items-center space-x-3 mb-6 bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-md">
              <MapPin className="h-8 w-8 text-orange-600 drop-shadow-md" />
              <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm">Route Analyzer & Geographic View</h2>
            </div>

            {/* City Selector */}
            <div className="mb-6 p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-white/50 shadow-lg">
              {/* <h3 className="text-lg font-semibold text-gray-900 drop-shadow-sm mb-4">Flight Route Analyzer</h3>
              <p className="text-sm text-gray-800 font-medium drop-shadow-sm mb-4">
                Enter two cities and a flight number to view detailed route analysis
              </p> */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 drop-shadow-sm mb-2">City A (Origin)</label>
                  <input
                    type="text"
                    placeholder="e.g., Bengaluru, Delhi, Mumbai"
                    value={cityA}
                    onChange={(e) => {
                      setCityA(e.target.value);
                      setSelectedFlight(''); // Reset flight when city changes
                      setIsPopupOpen(false); // Close popup when city changes
                    }}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white/90 text-gray-900 font-medium placeholder-gray-600"
                    list="cities-list-a"
                  />
                  <datalist id="cities-list-a">
                    {uniqueCities.map((city, idx) => (
                      <option key={idx} value={city.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 drop-shadow-sm mb-2">City B (Destination)</label>
                  <input
                    type="text"
                    placeholder="e.g., Delhi, Mumbai, Chennai"
                    value={cityB}
                    onChange={(e) => {
                      setCityB(e.target.value);
                      setSelectedFlight(''); // Reset flight when city changes
                      setIsPopupOpen(false); // Close popup when city changes
                    }}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white/90 text-gray-900 font-medium placeholder-gray-600"
                    list="cities-list-b"
                  />
                  <datalist id="cities-list-b">
                    {uniqueCities.map((city, idx) => (
                      <option key={idx} value={city.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 drop-shadow-sm mb-2">Flight Number</label>
                  <input
                    type="text"
                    placeholder="e.g., 6E-2345"
                    value={selectedFlight}
                    onChange={(e) => {
                      setSelectedFlight(e.target.value);
                      setIsPopupOpen(false); // Close popup when flight changes
                    }}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white/90 text-gray-900 font-medium placeholder-gray-600"
                    list="flights-list"
                  />
                  <datalist id="flights-list">
                    {uniqueFlightNumbers.map((flight, idx) => (
                      <option key={idx} value={flight} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Aerial Distance Display with Hover Tooltip */}
              {selectedFlightData && (
                <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border-2 border-orange-400 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Plane className="h-5 w-5 text-orange-600 drop-shadow-md" />
                      <p className="font-semibold text-gray-900 drop-shadow-sm">
                        Flight {selectedFlightData.flightNumber}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setIsPopupOpen(!isPopupOpen)}
                        className="cursor-pointer px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border border-orange-300 transition-all hover:shadow-lg active:scale-95 w-full sm:w-auto"
                      >
                        <p className="text-sm text-gray-600">Aerial Distance</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {selectedFlightData.distance} km
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {isPopupOpen ? '▼ Hide details' : '▶ Tap for details'}
                        </p>
                      </button>

                      {/* Click/Tap Popup - Compact Flight Details */}
                      <div className={`fixed sm:absolute ${isPopupOpen ? 'block' : 'hidden'} z-[9999]
                        inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-full sm:right-0 sm:mb-2
                        w-auto sm:w-[380px] sm:max-w-[90vw]`}>
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-3 sm:p-4 rounded-lg shadow-2xl border border-orange-500/30 max-h-[80vh] sm:max-h-[70vh] overflow-hidden flex flex-col">
                          {/* Header Section - Fixed */}
                          <div className="mb-2 pb-2 border-b border-orange-500/30 flex-shrink-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] sm:text-[10px] text-orange-400 uppercase tracking-wider font-semibold">Flight Details</p>
                              <button
                                onClick={() => setIsPopupOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Close"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm sm:text-base font-bold text-white mb-0.5">
                              {selectedFlightData.cityA.name} → {selectedFlightData.cityB.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-300">
                              Distance: <span className="text-orange-400 font-semibold">{selectedFlightData.distance} km</span>
                            </p>
                          </div>

                          {/* Scrollable Content */}
                          {selectedFlightData.record && (
                            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                              {/* Flight Schedule */}
                              {(selectedFlightData.record.scheduled_departure_time || selectedFlightData.record.scheduled_arrival_time) && (
                                <div className="bg-white/5 rounded p-1.5 sm:p-2">
                                  <p className="text-[9px] sm:text-[10px] text-orange-400 uppercase tracking-wide mb-1 font-semibold">Schedule</p>
                                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                                    {selectedFlightData.record.scheduled_departure_time && (
                                      <div>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400">Departure</p>
                                        <p className="text-white font-medium text-[10px] sm:text-xs">{selectedFlightData.record.scheduled_departure_time}</p>
                                      </div>
                                    )}
                                    {selectedFlightData.record.scheduled_arrival_time && (
                                      <div>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400">Arrival</p>
                                        <p className="text-white font-medium text-[10px] sm:text-xs">{selectedFlightData.record.scheduled_arrival_time}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Cancellation & Impact */}
                              <div className="bg-red-500/10 border border-red-500/30 rounded p-1.5 sm:p-2">
                                <p className="text-[9px] sm:text-[10px] text-red-400 uppercase tracking-wide mb-1 font-semibold">Impact Details</p>
                                <div className="space-y-1 text-[10px] sm:text-xs">
                                  {selectedFlightData.record.cancellation_reason && (
                                    <div>
                                      <p className="text-[9px] sm:text-[10px] text-gray-400">Reason</p>
                                      <p className="text-white text-[10px] sm:text-xs">{selectedFlightData.record.cancellation_reason}</p>
                                    </div>
                                  )}
                                  {selectedFlightData.record.route_type && (
                                    <div>
                                      <p className="text-[9px] sm:text-[10px] text-gray-400">Route Type</p>
                                      <p className="text-white capitalize text-[10px] sm:text-xs">{selectedFlightData.record.route_type}</p>
                                    </div>
                                  )}
                                  {selectedFlightData.record.estimated_passengers_affected && (
                                    <div>
                                      <p className="text-[9px] sm:text-[10px] text-gray-400">Passengers</p>
                                      <p className="text-orange-400 font-semibold text-[10px] sm:text-xs">{selectedFlightData.record.estimated_passengers_affected}</p>
                                    </div>
                                  )}
                                  {selectedFlightData.record.refund_status && (
                                    <div>
                                      <p className="text-[9px] sm:text-[10px] text-gray-400">Refund</p>
                                      <p className={`font-medium text-[10px] sm:text-xs ${
                                        selectedFlightData.record.refund_status.toLowerCase().includes('complete') ||
                                        selectedFlightData.record.refund_status.toLowerCase().includes('processed')
                                          ? 'text-green-400'
                                          : 'text-yellow-400'
                                      }`}>
                                        {selectedFlightData.record.refund_status}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Additional Information */}
                              <div className="bg-white/5 rounded p-1.5 sm:p-2">
                                <p className="text-[9px] sm:text-[10px] text-orange-400 uppercase tracking-wide mb-1 font-semibold">Additional Info</p>
                                <div className="space-y-0.5 max-h-20 sm:max-h-24 overflow-y-auto text-[10px] sm:text-[11px]">
                                  {Object.entries(selectedFlightData.record)
                                    .filter(([key]) =>
                                      key !== 'id' &&
                                      key !== '_id' &&
                                      key !== 'scheduled_departure_time' &&
                                      key !== 'scheduled_arrival_time' &&
                                      key !== 'cancellation_reason' &&
                                      key !== 'route_type' &&
                                      key !== 'estimated_passengers_affected' &&
                                      key !== 'refund_status'
                                    )
                                    .map(([key, value]) => (
                                      <div key={key} className="flex justify-between items-start gap-1.5 sm:gap-2">
                                        <span className="text-gray-400 capitalize text-[9px] sm:text-[10px]">{key.replace(/_/g, ' ')}:</span>
                                        <span className="text-white text-right break-words flex-1 text-[9px] sm:text-[10px]">{String(value)}</span>
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tooltip arrow - only on desktop */}
                          <div className="hidden sm:block absolute top-full right-8 -mt-1">
                            <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile backdrop overlay */}
                      {isPopupOpen && (
                        <div
                          className="fixed inset-0 bg-black/50 z-[9998] sm:hidden"
                          onClick={() => setIsPopupOpen(false)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-800 font-medium drop-shadow-sm">
                    <p>Route: {selectedFlightData.cityA.name} ({selectedFlightData.cityA.lat.toFixed(2)}°, {selectedFlightData.cityA.lng.toFixed(2)}°) → {selectedFlightData.cityB.name} ({selectedFlightData.cityB.lat.toFixed(2)}°, {selectedFlightData.cityB.lng.toFixed(2)}°)</p>
                    <p className="mt-1 italic">Click/Tap the distance box above to see complete flight details</p>
                  </div>
                </div>
              )}

              {cityA && cityB && !selectedFlight && (
                <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-300 shadow-lg">
                  <p className="font-semibold text-gray-900 drop-shadow-sm mb-2">
                    Flights between {cityA} ↔ {cityB}: {filteredFlights.length} affected records
                  </p>
                  {filteredFlights.length > 0 ? (
                    <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                      {filteredFlights.map((flight, idx) => (
                        <div key={idx} className="p-3 bg-white/50 backdrop-blur-sm rounded border border-gray-300 shadow-md">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(flight).slice(0, 6).map(([key, value]) => (
                              key !== 'id' && key !== '_id' && (
                                <div key={key} className="truncate">
                                  <span className="text-gray-700 font-medium">{key}:</span>{' '}
                                  <span className="text-gray-900 font-semibold">{String(value)}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 font-medium italic">No flights found between these cities</p>
                  )}
                </div>
              )}
            </div>

            {/* Map */}
            {isMapReady && typeof window !== 'undefined' && (
              <div className="h-[600px] rounded-lg overflow-hidden border-4 border-orange-200">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {/* Plot all affected cities with blue markers */}
                  {analytics.affectedCities.map((cityName, idx) => {
                    // Skip this city if it's selected as City A or City B
                    if (cityA && cityName.toLowerCase() === cityA.toLowerCase()) return null;
                    if (cityB && cityName.toLowerCase() === cityB.toLowerCase()) return null;

                    const cityData = Object.values(INDIAN_CITIES).find(c => c.name === cityName);
                    if (cityData && typeof window !== 'undefined' && window.L) {
                      // Create blue icon for affected cities
                      const blueIcon = window.L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                      });

                      return (
                        <Marker key={idx} position={[cityData.lat, cityData.lng]} icon={blueIcon}>
                          <Popup>
                            <strong>{cityName}</strong>
                            <br />
                            Affected Location
                          </Popup>
                        </Marker>
                      );
                    }
                    return null;
                  })}

                  {/* Draw route and custom markers if two cities selected */}
                  {cityA && cityB && (() => {
                    const cityAData = Object.values(INDIAN_CITIES).find(c =>
                      c.name.toLowerCase() === cityA.toLowerCase()
                    );
                    const cityBData = Object.values(INDIAN_CITIES).find(c =>
                      c.name.toLowerCase() === cityB.toLowerCase()
                    );

                    if (cityAData && cityBData && typeof window !== 'undefined' && window.L) {
                      // Create custom icons for City A and City B
                      const cityAIcon = window.L.icon({
                        iconUrl: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/indigoA.png',
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        popupAnchor: [0, -40]
                      });

                      const cityBIcon = window.L.icon({
                        iconUrl: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/indigoB.png',
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        popupAnchor: [0, -40]
                      });

                      return (
                        <>
                          {/* City A Marker */}
                          <Marker
                            position={[cityAData.lat, cityAData.lng]}
                            icon={cityAIcon}
                          >
                            <Popup>
                              <strong>City A: {cityAData.name}</strong>
                              <br />
                              Origin
                            </Popup>
                          </Marker>

                          {/* City B Marker */}
                          <Marker
                            position={[cityBData.lat, cityBData.lng]}
                            icon={cityBIcon}
                          >
                            <Popup>
                              <strong>City B: {cityBData.name}</strong>
                              <br />
                              Destination
                            </Popup>
                          </Marker>

                          {/* Curved Dotted Route Polyline (Google Flights style) */}
                          <Polyline
                            positions={getCurvedPath(
                              cityAData.lat,
                              cityAData.lng,
                              cityBData.lat,
                              cityBData.lng,
                              0.15
                            )}
                            color="#3b82f6"
                            weight={3}
                            opacity={0.8}
                            dashArray="10, 10"
                          />
                        </>
                      );
                    }
                    return null;
                  })()}
                </MapContainer>
              </div>
            )}

            {/* Affected Cities List */}
            <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 drop-shadow-sm mb-4">Affected Cities ({analytics.affectedCities.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analytics.affectedCities.map((city, idx) => (
                  <div key={idx} className="p-3 bg-orange-100/60 backdrop-blur-sm rounded-lg border border-orange-300 text-center shadow-md hover:bg-orange-100/80 transition-all">
                    <MapPin className="h-5 w-5 text-orange-600 drop-shadow-md mx-auto mb-1" />
                    <p className="font-medium text-gray-900 drop-shadow-sm">{city}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndigoFiasco2025Dashboard;
