'use client';
import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Utensils, Coffee, Sunset, ArrowRight, Sparkles, Edit3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Sample itinerary data for Dublin (you can expand this later)
const cityItineraries = {
  dublin: {
    1: [
      { time: 'Breakfast', name: 'Queen of Tarts', coords: [53.3441, -6.2675], type: 'breakfast' },
      { time: 'Morning', name: 'Trinity College', coords: [53.3438, -6.2546], type: 'attraction' },
      { time: 'Mid-Morning', name: 'Book of Kells', coords: [53.3438, -6.2546], type: 'attraction' },
      { time: 'Lunch', name: 'The Woollen Mills', coords: [53.3467, -6.2589], type: 'lunch' },
      { time: 'Afternoon', name: 'Dublin Castle', coords: [53.3429, -6.2674], type: 'attraction' },
      { time: 'Late Afternoon', name: 'Chester Beatty Library', coords: [53.3428, -6.2672], type: 'attraction' },
      { time: 'Evening', name: 'Ha\'penny Bridge Walk', coords: [53.3460, -6.2633], type: 'attraction' },
      { time: 'Dinner', name: 'The Brazen Head', coords: [53.3443, -6.2771], type: 'dinner' },
    ],
    2: [
      { time: 'Breakfast', name: 'Brother Hubbard', coords: [53.3505, -6.2603], type: 'breakfast' },
      { time: 'Morning', name: 'Guinness Storehouse', coords: [53.3419, -6.2867], type: 'attraction' },
      { time: 'Mid-Morning', name: 'Gravity Bar', coords: [53.3419, -6.2867], type: 'attraction' },
      { time: 'Lunch', name: 'Bunsen', coords: [53.3420, -6.2633], type: 'lunch' },
      { time: 'Afternoon', name: 'St. Patrick\'s Cathedral', coords: [53.3394, -6.2714], type: 'attraction' },
      { time: 'Late Afternoon', name: 'Marsh\'s Library', coords: [53.3390, -6.2708], type: 'attraction' },
      { time: 'Evening', name: 'Temple Bar Walk', coords: [53.3454, -6.2644], type: 'attraction' },
      { time: 'Dinner', name: 'The Winding Stair', coords: [53.3467, -6.2589], type: 'dinner' },
    ],
    3: [
      { time: 'Breakfast', name: 'The Fumbally', coords: [53.3367, -6.2728], type: 'breakfast' },
      { time: 'Morning', name: 'Phoenix Park', coords: [53.3558, -6.3298], type: 'attraction' },
      { time: 'Mid-Morning', name: 'Dublin Zoo', coords: [53.3558, -6.3298], type: 'attraction' },
      { time: 'Lunch', name: 'Umi Falafel', coords: [53.3429, -6.2633], type: 'lunch' },
      { time: 'Afternoon', name: 'National Gallery', coords: [53.3409, -6.2527], type: 'attraction' },
      { time: 'Late Afternoon', name: 'Merrion Square', coords: [53.3395, -6.2499], type: 'attraction' },
      { time: 'Evening', name: 'Temple Bar District', coords: [53.3454, -6.2644], type: 'attraction' },
      { time: 'Dinner', name: 'The Church', coords: [53.3505, -6.2603], type: 'dinner' },
    ],
    4: [
      { time: 'Breakfast', name: 'Clement & Pekoe', coords: [53.3356, -6.2611], type: 'breakfast' },
      { time: 'Morning', name: 'National Museum', coords: [53.3404, -6.2551], type: 'attraction' },
      { time: 'Mid-Morning', name: 'Natural History Museum', coords: [53.3399, -6.2508], type: 'attraction' },
      { time: 'Lunch', name: 'Cornucopia', coords: [53.3425, -6.2633], type: 'lunch' },
      { time: 'Afternoon', name: 'Grafton Street Shopping', coords: [53.3419, -6.2603], type: 'attraction' },
      { time: 'Late Afternoon', name: 'St. Stephen\'s Green', coords: [53.3376, -6.2597], type: 'attraction' },
      { time: 'Evening', name: 'Georgian Doors Walk', coords: [53.3395, -6.2499], type: 'attraction' },
      { time: 'Dinner', name: 'Chapter One', coords: [53.3521, -6.2603], type: 'dinner' },
    ],
    5: [
      { time: 'Breakfast', name: 'Manifesto', coords: [53.3467, -6.2589], type: 'breakfast' },
      { time: 'Morning', name: 'Kilmainham Gaol', coords: [53.3420, -6.3099], type: 'attraction' },
      { time: 'Mid-Morning', name: 'War Memorial Gardens', coords: [53.3432, -6.3156], type: 'attraction' },
      { time: 'Lunch', name: 'Fade Street Social', coords: [53.3429, -6.2644], type: 'lunch' },
      { time: 'Afternoon', name: 'Irish Museum of Modern Art', coords: [53.3407, -6.2967], type: 'attraction' },
      { time: 'Late Afternoon', name: 'Christ Church Cathedral', coords: [53.3432, -6.2713], type: 'attraction' },
      { time: 'Evening', name: 'O\'Connell Street', coords: [53.3498, -6.2603], type: 'attraction' },
      { time: 'Dinner', name: 'The Vintage Kitchen', coords: [53.3356, -6.2633], type: 'dinner' },
    ],
  },
  // Add more cities as needed
};

const getPlaceIcon = (type) => {
  switch (type) {
    case 'breakfast':
      return <Coffee className="w-4 h-4" />;
    case 'lunch':
      return <Utensils className="w-4 h-4" />;
    case 'dinner':
      return <Sunset className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

const dayColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
];

export default function TripItinerary({ cityId, coords }) {
  const [selectedDays, setSelectedDays] = useState(3);
  const [activeDays, setActiveDays] = useState([1, 2, 3]);
  const [isOptimized, setIsOptimized] = useState(true);
  const [generatedItinerary, setGeneratedItinerary] = useState({});
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  // Fetch pins data from API
  const { data: pinsData, isLoading: pinsLoading } = useQuery({
    queryKey: ['pins', cityId],
    queryFn: async () => {
      const response = await fetch(`/api/pins/${cityId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch pins: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Generate itinerary from pins data
  useEffect(() => {
    if (!pinsData || pinsData.length === 0 || Object.keys(cityItineraries[cityId] || {}).length > 0) return;

    // Categorize pins
    const categorizedPins = {
      breakfast: pinsData.filter(p => {
        const cats = Array.isArray(p.category) ? p.category : [p.category];
        return cats.some(c => ['cafe', 'restaurant'].includes(c)) && p.name.toLowerCase().includes('breakfast') || cats.includes('cafe');
      }),
      lunch: pinsData.filter(p => {
        const cats = Array.isArray(p.category) ? p.category : [p.category];
        return cats.some(c => ['restaurant', 'cafe', 'fishandchips'].includes(c));
      }),
      dinner: pinsData.filter(p => {
        const cats = Array.isArray(p.category) ? p.category : [p.category];
        return cats.some(c => ['restaurant', 'pint'].includes(c));
      }),
      attractions: pinsData.filter(p => {
        const cats = Array.isArray(p.category) ? p.category : [p.category];
        return cats.some(c => ['historic', 'museum', 'church', 'art', 'college', 'park', 'viewpoint', 'beach'].includes(c));
      }),
    };

    // Generate 5 days of itinerary
    const newItinerary = {};
    for (let day = 1; day <= 5; day++) {
      const dayPlaces = [];

      // Breakfast
      if (categorizedPins.breakfast.length > 0) {
        const breakfast = categorizedPins.breakfast[(day - 1) % categorizedPins.breakfast.length];
        dayPlaces.push({
          time: 'Breakfast',
          name: breakfast.name,
          coords: breakfast.coords,
          type: 'breakfast',
          description: breakfast.description
        });
      }

      // Morning & Mid-Morning attractions
      for (let i = 0; i < 2; i++) {
        if (categorizedPins.attractions.length > dayPlaces.length) {
          const attraction = categorizedPins.attractions[(day - 1) * 2 + i % categorizedPins.attractions.length];
          dayPlaces.push({
            time: i === 0 ? 'Morning' : 'Mid-Morning',
            name: attraction.name,
            coords: attraction.coords,
            type: 'attraction',
            description: attraction.description
          });
        }
      }

      // Lunch
      if (categorizedPins.lunch.length > 0) {
        const lunch = categorizedPins.lunch[(day - 1) % categorizedPins.lunch.length];
        dayPlaces.push({
          time: 'Lunch',
          name: lunch.name,
          coords: lunch.coords,
          type: 'lunch',
          description: lunch.description
        });
      }

      // Afternoon & Late Afternoon attractions
      for (let i = 0; i < 2; i++) {
        const offset = 2 + i;
        if (categorizedPins.attractions.length > offset) {
          const attraction = categorizedPins.attractions[(day - 1) * 2 + offset % categorizedPins.attractions.length];
          dayPlaces.push({
            time: i === 0 ? 'Afternoon' : 'Late Afternoon',
            name: attraction.name,
            coords: attraction.coords,
            type: 'attraction',
            description: attraction.description
          });
        }
      }

      // Evening attraction
      if (categorizedPins.attractions.length > dayPlaces.length - 2) {
        const attraction = categorizedPins.attractions[(day - 1) * 3 % categorizedPins.attractions.length];
        dayPlaces.push({
          time: 'Evening',
          name: attraction.name,
          coords: attraction.coords,
          type: 'attraction',
          description: attraction.description
        });
      }

      // Dinner
      if (categorizedPins.dinner.length > 0) {
        const dinner = categorizedPins.dinner[(day - 1) % categorizedPins.dinner.length];
        dayPlaces.push({
          time: 'Dinner',
          name: dinner.name,
          coords: dinner.coords,
          type: 'dinner',
          description: dinner.description
        });
      }

      newItinerary[day] = dayPlaces;
    }

    setGeneratedItinerary(newItinerary);
  }, [pinsData, cityId]);

  const itinerary = cityItineraries[cityId] || generatedItinerary;
  const availableDays = Object.keys(itinerary).length;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet only on client side
    const loadMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Initialize map
      const map = L.map(mapRef.current, {
        center: coords || [53.3498, -6.2603],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = async () => {
      const L = await import('leaflet');

      // Clear existing markers and polylines
      markersRef.current.forEach(marker => marker.remove());
      polylinesRef.current.forEach(polyline => polyline.remove());
      markersRef.current = [];
      polylinesRef.current = [];

      // Add markers and polylines for active days
      activeDays.sort((a, b) => a - b).forEach((day) => {
        const places = itinerary[day];
        if (!places) return;

        const color = dayColors[day - 1] || '#3b82f6';

        // Create custom icon for each place
        places.forEach((place, index) => {
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background-color: ${color};
                color: white;
                border: 2px solid white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                ${index + 1}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker(place.coords, { icon }).addTo(mapInstanceRef.current);

          marker.bindPopup(`
            <div style="min-width: 150px;">
              <strong style="color: ${color};">Day ${day} - ${place.time}</strong>
              <br/>
              <span style="font-size: 14px;">${place.name}</span>
            </div>
          `);

          markersRef.current.push(marker);
        });

        // Draw polyline connecting the places
        const polylineCoords = places.map(p => p.coords);
        const polyline = L.polyline(polylineCoords, {
          color: color,
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
          lineJoin: 'round',
        }).addTo(mapInstanceRef.current);

        polylinesRef.current.push(polyline);
      });

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    updateMarkers();
  }, [activeDays, itinerary]);

  const handleDaysChange = (numDays) => {
    setSelectedDays(numDays);
    setActiveDays(Array.from({ length: numDays }, (_, i) => i + 1));
  };

  const toggleDay = (day) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter(d => d !== day));
    } else {
      setActiveDays([...activeDays, day].sort((a, b) => a - b));
    }
  };

  if (pinsLoading) {
    return (
      <div className="max-w-7xl mx-auto my-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading itinerary from city pins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!availableDays) {
    return (
      <div className="max-w-7xl mx-auto my-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-white text-center">No itinerary data available for this city yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-white">Plan Your Trip</h2>
        </div>

        {/* Optimize Toggle */}
        <div className="flex items-center gap-3 bg-white/10 rounded-lg p-2">
          <button
            onClick={() => setIsOptimized(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isOptimized
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Optimized
          </button>
          <button
            onClick={() => setIsOptimized(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              !isOptimized
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Manual
          </button>
        </div>
      </div>

      {isOptimized && (
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <p className="text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>This itinerary is optimized to minimize travel time and maximize your experience!</span>
          </p>
        </div>
      )}

      {!isOptimized && (
        <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <p className="text-white text-sm flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            <span>Manual mode: Customize your itinerary by selecting specific days and places.</span>
          </p>
        </div>
      )}

      {/* Day Selector */}
      <div className="mb-6">
        <label className="block text-white font-semibold mb-3">
          How many days are you staying?
        </label>
        <div className="flex gap-3">
          {Array.from({ length: availableDays }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => handleDaysChange(num)}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                selectedDays === num
                  ? 'bg-blue-500 text-white scale-110 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {num} {num === 1 ? 'Day' : 'Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Day Toggle Buttons */}
      <div className="mb-6">
        <label className="block text-white font-semibold mb-3">
          Select which days to show on the map:
        </label>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: selectedDays }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeDays.includes(day)
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              style={{
                backgroundColor: activeDays.includes(day) ? dayColors[day - 1] : undefined,
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: activeDays.includes(day) ? 'white' : 'transparent',
                  borderColor: activeDays.includes(day) ? 'white' : dayColors[day - 1],
                }}
              />
              Day {day}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="mb-6">
        <div
          ref={mapRef}
          className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg"
        />
      </div>

      {/* Itinerary Details */}
      <div className="space-y-4">
        {activeDays.sort((a, b) => a - b).map((day) => {
          const places = itinerary[day];
          if (!places) return null;

          return (
            <div
              key={day}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border-l-4"
              style={{ borderColor: dayColors[day - 1] }}
            >
              <h3
                className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: dayColors[day - 1] }}
              >
                <Calendar className="w-5 h-5" />
                Day {day}
              </h3>

              {/* Arrow-separated Overview */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  {places.map((place, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ backgroundColor: dayColors[day - 1] }}
                        >
                          {index + 1}
                        </span>
                        <span className="text-white font-medium text-sm whitespace-nowrap">
                          {place.name}
                        </span>
                      </div>
                      {index < places.length - 1 && (
                        <ArrowRight
                          className="w-5 h-5 text-white/50 flex-shrink-0"
                          style={{ color: dayColors[day - 1] }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {places.map((place, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-lg p-3 flex items-start gap-3 hover:bg-white/20 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                      style={{ backgroundColor: dayColors[day - 1] }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getPlaceIcon(place.type)}
                        <span className="text-sm font-semibold text-gray-300">
                          {place.time}
                        </span>
                      </div>
                      <p className="text-white font-medium">{place.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
