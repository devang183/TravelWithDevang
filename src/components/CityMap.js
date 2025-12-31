"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { PawPrint, Navigation, X, Calendar, MapPin, Plus, Trash2, Download, FileText, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import Fuse from "fuse.js";
import CityMapCategoryBar from "./CityMapCategoryBar";
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Add keyframe animations for the performance warning modal
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cityMapFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes cityMapSlideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes cityMapPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* Permanent map label styles */
    .city-map-label {
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

    .city-map-label::before {
      display: none !important;
    }
  `;
  if (!document.head.querySelector('#citymap-animations')) {
    style.id = 'citymap-animations';
    document.head.appendChild(style);
  }
}

// Category emojis - single source of truth
const CATEGORY_EMOJIS = {
  fishandchips: "🐟",
  racecourse: "🏇",
  park: "🌳",
  pint: "🍺",
  bakerloo: "🚇",
  atm: "🏧",
  historic: "🏰",
  museum: "🖼️",
  beach: "🏖️",
  cafe: "☕",
  restaurant: "🍽️",
  viewpoint: "🔭",
  college: "🎓",
  church: "⛪",
  art: "🎨",
  cricket: "🏏",
  bookstore: "📚",
  hospital: "🩺",
  bookmaker: "🟩",
  pharmacy: "💊",
  Red: "🔴",
  Green: "🟢",
  icecream: "🍦",
  womenbeauty: "💇‍♀️",
  LEISURE: "🎭",
  retailshops: "🛍️",
  hospitality: "🏨",
  health: "🏥",
  police: "👮",
  dentist: "🦷",
  fuelgas: "⛽",
  casino: "🎰",
  // Work-friendly venues (WiFi + Power)
  cafe_wifi: "☕📶",
  cafe_power: "☕🔌",
  restaurant_wifi: "🍽️📶",
  restaurant_power: "🍽️🔌",
  library_wifi: "📚📶",
  coworking: "💼",
};

export default function CityMap({ cityId, coords, zoom = 20, name = "this city" }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRefs = useRef([]);
  const scrollRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeCategories, setActiveCategories] = useState([]);
  const [markersVisible, setMarkersVisible] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  const [pendingMarkersVisible, setPendingMarkersVisible] = useState(false);
  const [showLabels, setShowLabels] = useState(true); // Toggle for permanent labels

  const [startMarkerRef, setStartMarkerRef] = useState(null);
  const [endMarkerRef, setEndMarkerRef] = useState(null);
  
  // Add refs to prevent infinite loops
  const isUpdatingMarkers = useRef(false);
  const lastBounds = useRef(null);
  
  // Routing states
  const [routingControl, setRoutingControl] = useState(null);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [showRouting, setShowRouting] = useState(false);
  const [routeDistance, setRouteDistance] = useState(null);
  const [transportMode, setTransportMode] = useState("driving");
  const [routeTime, setRouteTime] = useState(null);
  const [directionsCollapsed, setDirectionsCollapsed] = useState(false);
  
  // Search states for routing
  const [startSearchTerm, setStartSearchTerm] = useState("");
  const [endSearchTerm, setEndSearchTerm] = useState("");
  const [startSearchResults, setStartSearchResults] = useState([]);
  const [endSearchResults, setEndSearchResults] = useState([]);
  const [showStartResults, setShowStartResults] = useState(false);
  const [showEndResults, setShowEndResults] = useState(false);
  const [startHighlighted, setStartHighlighted] = useState(-1);
  const [endHighlighted, setEndHighlighted] = useState(-1);

  // Nearby places along route
  const [nearbyPlacesMarkers, setNearbyPlacesMarkers] = useState([]);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(true);
  const [activeNearbyCategories, setActiveNearbyCategories] = useState({
    restaurant: true,
    cafe: true,
    pharmacy: true
  });

  // Trip planning states
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [tripItinerary, setTripItinerary] = useState([]);
  const [tripPolylines, setTripPolylines] = useState([]);
  const [tripMarkersRefs, setTripMarkersRefs] = useState([]);

  // Day-wise trip planning states
  const [tripMode, setTripMode] = useState("single"); // "single" or "daywise"
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [dayWiseItinerary, setDayWiseItinerary] = useState({});
  const [selectedDay, setSelectedDay] = useState(1);
  const [viewMode, setViewMode] = useState("all"); // "all" or specific day number for viewing routes

  // Collapse states for sections
  const [isRoutePlannerCollapsed, setIsRoutePlannerCollapsed] = useState(false);
  const [isTripPlannerCollapsed, setIsTripPlannerCollapsed] = useState(false);

  // Refs to hold current values for closures
  const tripModeRef = useRef(tripMode);
  const selectedDayRef = useRef(selectedDay);

  // Update refs when values change
  useEffect(() => {
    tripModeRef.current = tripMode;
  }, [tripMode]);

  useEffect(() => {
    selectedDayRef.current = selectedDay;
  }, [selectedDay]);

  // Helper function to normalize categories - handles both single category and array
  const normalizeCategories = (categories) => {
    if (!categories) return [];
    if (typeof categories === 'string') return [categories];
    if (Array.isArray(categories)) return categories;
    return [];
  };

  // Helper function to get primary category (first category for icon display)
  const getPrimaryCategory = (categories) => {
    const normalized = normalizeCategories(categories);
    return normalized[0] || 'default';
  };

  // Helper function to check if marker matches any active category
  const markerMatchesCategories = (markerCategories, activeCategories) => {
    if (activeCategories.length === 0) return true;
    const normalized = normalizeCategories(markerCategories);
    return activeCategories.some(activeCat => normalized.includes(activeCat));
  };

  // Helper function to compare bounds
  const boundsEqual = (bounds1, bounds2) => {
    if (!bounds1 || !bounds2) return false;
    return bounds1.toBBoxString() === bounds2.toBBoxString();
  };

  // Handler for toggling markers visibility with performance warning
  const handleToggleMarkers = () => {
    const newVisibility = !markersVisible;

    // If trying to show markers without any category filter, show warning
    if (newVisibility && activeCategories.length === 0 && markers.length > 100) {
      setPendingMarkersVisible(newVisibility);
      setShowPerformanceWarning(true);
    } else {
      setMarkersVisible(newVisibility);
    }
  };

  // Confirm showing all markers
  const handleConfirmShowAllMarkers = () => {
    setMarkersVisible(pendingMarkersVisible);
    setShowPerformanceWarning(false);
    setPendingMarkersVisible(false);
  };

  // Cancel showing all markers
  const handleCancelShowAllMarkers = () => {
    setShowPerformanceWarning(false);
    setPendingMarkersVisible(false);
  };


  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coords1, coords2) => {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coords1[0] * Math.PI / 180;
    const lat2 = coords2[0] * Math.PI / 180;
    const deltaLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const deltaLon = (coords2[1] - coords1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Returns distance in kilometers
  };

  // Helper function to format distance
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(2)}km`;
  };

  // Drag and drop handlers for trip itinerary
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (tripMode === "single") {
      // Reorder single-day itinerary
      const items = Array.from(tripItinerary);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setTripItinerary(items);
    } else if (tripMode === "daywise") {
      // Reorder day-wise itinerary
      const items = Array.from(dayWiseItinerary[selectedDay] || []);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setDayWiseItinerary({
        ...dayWiseItinerary,
        [selectedDay]: items,
      });
    }
  };

  // Fetch data from MongoDB using React Query
  const { data: pinsData, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['pins', cityId],
    queryFn: async () => {
      const response = await fetch(`/api/pins/${cityId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch pins: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update markers when data changes
  useEffect(() => {
    if (pinsData) {
      setMarkers(pinsData);
      setLoading(false);
      setError(null);
    } else if (isError) {
      console.error('Error fetching pins:', queryError);
      setError(queryError.message);
      setMarkers([]);
      setLoading(false);
    } else if (isLoading) {
      setLoading(true);
    }
  }, [pinsData, isLoading, isError, queryError]);

  // Debounce hook
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };
  
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  };

  // Load map and create markers from MongoDB data
  useEffect(() => {
    const loadMap = async () => {
      if (loading || markers.length === 0) return;
      
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      
      // Load Leaflet Routing Machine
      const { default: LRM } = await import("leaflet-routing-machine");
      await import("leaflet-routing-machine/dist/leaflet-routing-machine.css");
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current && !mapRef.current._leaflet_map) {
        const map = L.map(mapRef.current, {
          // Add map options to prevent infinite world
          worldCopyJump: false,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0
        }).setView(coords, zoom);
        
        mapInstance.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          // Add tile layer options to prevent wrapping
          noWrap: true,
          bounds: [[-90, -180], [90, 180]]
        }).addTo(map);

        const newMarkerRefs = [];
        
        markers.forEach(({ url, coords, name, description, categories, category, videoId, phone, website }, index) => {
          // Handle both old 'category' field and new 'categories' field
          const markerCategories = categories || category;
          const normalizedCategories = normalizeCategories(markerCategories);
          const primaryCategory = getPrimaryCategory(markerCategories);
          
          // Create category display for popup
          const categoryDisplay = normalizedCategories
            .map(cat => CATEGORY_EMOJIS[cat] || cat)
            .join(' ');
          
          const videoEmbed = videoId
            ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" 
                title="YouTube video player" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>`
            : "";
        
          // Create popup content container
          const popupDiv = document.createElement("div");
          popupDiv.style.maxWidth = "200px";
          popupDiv.style.wordWrap = "break-word";

          popupDiv.innerHTML = `
  <p><strong>${categoryDisplay} ${name}</strong></p>
  <p style="font-size:0.85em">${description}</p>
  ${phone ? `<p style="font-size:0.8em;"><strong>Phone:</strong> ${phone}</p>` : ''}
  ${website ? `<p style="font-size:0.8em;">
    <strong>Website:</strong>
    <a href="${website}" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">
      ${website}
    </a>
  </p>` : ''}
  ${normalizedCategories.length > 1 ?
    `<p style="font-size:0.75em; color: #666;">Categories: ${normalizedCategories.join(', ')}</p>` : ''}
  ${videoEmbed}
  <a href="${url}" target="_blank" style="
    display:inline-block;
    margin-top:8px;
    padding:4px 8px;
    font-weight:bold;
    color:white;
    background:#1e40af;
    border-radius:6px;
    text-decoration:none;
  ">
    More info
  </a>
  <div style="margin-top: 8px; display:flex; gap:5px;">
    <button class="set-source-btn"
      style="
        flex:1;
        padding:4px;
        font-size:0.8em;
        border-radius:4px;
        border:none;
        background:#10b981;
        color:white;
        cursor:pointer;
        transition: transform 0.2s, border-color 0.3s, background-color 0.3s, backdrop-filter 0.3s;
      "
      onmouseenter="this.style.transform='scale(1.1)';"
      onmouseleave="this.style.transform='scale(1)';"
    >
      Set as Source
    </button>
    <button class="set-dest-btn"
      style="
        flex:1;
        padding:4px;
        font-size:0.8em;
        border-radius:4px;
        border:none;
        background:#f59e0b;
        color:white;
        cursor:pointer;
        transition: transform 0.2s, border-color 0.3s, background-color 0.3s, backdrop-filter 0.3s;
      "
      onmouseenter="this.style.transform='scale(1.1)';"
      onmouseleave="this.style.transform='scale(1)';"
    >
      Set as Destination
    </button>
  </div>
  <div style="margin-top: 5px;">
    <button class="add-to-trip-btn"
      style="
        width: 100%;
        padding:6px;
        font-size:0.8em;
        border-radius:4px;
        border:none;
        background:#8b5cf6;
        color:white;
        cursor:pointer;
        font-weight: bold;
        transition: transform 0.2s, border-color 0.3s, background-color 0.3s, backdrop-filter 0.3s;
      "
      onmouseenter="this.style.transform='scale(1.05)';"
      onmouseleave="this.style.transform='scale(1)';"
    >
      + Add to Trip Plan
    </button>
  </div>
`;
        
          const marker = L.marker(coords, {
            icon: L.icon({
              iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              shadowSize: [41, 41],
            }),
          });

          marker.bindPopup(popupDiv);

          // Add permanent tooltip label showing the place name
          marker.bindTooltip(name, {
            permanent: showLabels,
            direction: 'top',
            offset: [0, -40],
            className: 'city-map-label',
            opacity: 0.9
          });
        
          // Add event listeners when popup opens
          marker.on("popupopen", () => {
            const popupEl = marker.getPopup().getElement();
            popupEl.querySelector(".set-source-btn").onclick = (e) => {
              const btn = e.target;

              // Check if source is changing
              if (startPoint !== name) {
                // Happy animation
                btn.style.transform = 'scale(1.2)';
                btn.style.background = '#059669';
                btn.innerHTML = '✓ Source Set!';

                setTimeout(() => {
                  btn.style.transform = 'scale(1)';
                  setTimeout(() => {
                    btn.innerHTML = 'Set as Source';
                    btn.style.background = '#10b981';
                  }, 200);
                }, 600);
              }

              setStartPoint(name);
              setStartSearchTerm(name);
            };
            popupEl.querySelector(".set-dest-btn").onclick = (e) => {
              const btn = e.target;

              // Check if destination is changing
              if (endPoint !== name) {
                // Happy animation
                btn.style.transform = 'scale(1.2)';
                btn.style.background = '#d97706';
                btn.innerHTML = '✓ Destination Set!';

                setTimeout(() => {
                  btn.style.transform = 'scale(1)';
                  setTimeout(() => {
                    btn.innerHTML = 'Set as Destination';
                    btn.style.background = '#f59e0b';
                  }, 200);
                }, 600);
              }

              setEndPoint(name);
              setEndSearchTerm(name);
            };
            popupEl.querySelector(".add-to-trip-btn").onclick = (e) => {
              const btn = e.target;
              const placeData = markers[index];
              const currentMode = tripModeRef.current;
              const currentDay = selectedDayRef.current;

              // Check if already exists before animation
              let alreadyExists = false;
              if (currentMode === "single") {
                alreadyExists = tripItinerary.some(p => p.name === placeData.name);
              } else {
                const currentDayPlaces = dayWiseItinerary[currentDay] || [];
                alreadyExists = currentDayPlaces.some(p => p.name === placeData.name);
              }

              if (!alreadyExists) {
                // Happy animation
                btn.style.transform = 'scale(1.2)';
                btn.style.background = '#10b981';
                btn.innerHTML = '✓ Added!';

                setTimeout(() => {
                  btn.style.transform = 'scale(1)';
                  setTimeout(() => {
                    btn.innerHTML = '+ Add to Trip Plan';
                    btn.style.background = '#8b5cf6';
                  }, 200);
                }, 600);
              }

              if (currentMode === "single") {
                setTripItinerary(prev => {
                  if (prev.some(p => p.name === placeData.name)) {
                    return prev;
                  }
                  return [...prev, placeData];
                });
              } else {
                // Day-wise mode
                setDayWiseItinerary(prev => {
                  const currentDayPlaces = prev[currentDay] || [];
                  if (currentDayPlaces.some(p => p.name === placeData.name)) {
                    return prev;
                  }
                  return {
                    ...prev,
                    [currentDay]: [...currentDayPlaces, placeData]
                  };
                });
              }

              setShowTripPlanner(true);
            };
          });
        
          marker.on("mouseover", function () {
            marker.openPopup();
          });
        
          newMarkerRefs.push(marker);
          markers[index].popupContent = popupDiv;
        });

        markerRefs.current = newMarkerRefs;
        mapRef.current._leaflet_map = map;
      }
    };
    loadMap();
  }, [markers, loading, coords, zoom]);

  // Effect to toggle label visibility when showLabels state changes
  useEffect(() => {
    if (markerRefs.current && markerRefs.current.length > 0) {
      markerRefs.current.forEach((marker) => {
        if (marker && marker.getTooltip()) {
          const tooltip = marker.getTooltip();
          if (showLabels) {
            tooltip.options.permanent = true;
            if (mapInstance.current && mapInstance.current.hasLayer(marker)) {
              marker.openTooltip();
            }
          } else {
            tooltip.options.permanent = false;
            marker.closeTooltip();
          }
        }
      });
    }
  }, [showLabels]);

  // Fixed function to handle multiple categories with bounds checking
  const addMarkersInView = useCallback((forceUpdate = false) => {
    const map = mapInstance.current;
    if (!map || isUpdatingMarkers.current) return;

    const bounds = map.getBounds();

    // Check if bounds have actually changed to prevent unnecessary updates
    // Skip this check if forceUpdate is true (e.g., when toggling markers visibility)
    if (!forceUpdate && lastBounds.current && boundsEqual(bounds, lastBounds.current)) {
      return;
    }

    lastBounds.current = bounds;
    isUpdatingMarkers.current = true;

    try {
      markerRefs.current.forEach((marker, index) => {
        if (!marker) return;

        const markerData = markers[index];
        if (!markerData) return;

        const inBounds = bounds.contains(marker.getLatLng());
        const markerCategories = markerData.categories || markerData.category;
        const categoryMatch = markerMatchesCategories(markerCategories, activeCategories);

        if (markersVisible && inBounds && categoryMatch) {
          if (!map.hasLayer(marker)) {
            const primaryCategory = getPrimaryCategory(markerCategories);
            const iconUrl = getDefaultIconUrlByCategory(primaryCategory);
            marker.setIcon(
              new (window.L || globalThis.L).Icon({
                iconUrl,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                shadowSize: [41, 41],
              })
            );
            marker.addTo(map);

            // Respect current label visibility state
            if (marker.getTooltip()) {
              const tooltip = marker.getTooltip();
              tooltip.options.permanent = showLabels;
              if (showLabels) {
                marker.openTooltip();
              } else {
                marker.closeTooltip();
              }
            }
          }
        } else {
          if (map.hasLayer(marker)) map.removeLayer(marker);
        }
      });
    } finally {
      isUpdatingMarkers.current = false;
    }
  }, [selectedMarkerIndex, activeCategories, markersVisible, markers, showLabels]);

  // Debounced version of addMarkersInView to prevent rapid firing
  const debouncedAddMarkersInView = useCallback(
    (() => {
      let timeoutId;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(addMarkersInView, 100);
      };
    })(),
    [addMarkersInView]
  );

  // Track previous markersVisible state to detect changes
  const prevMarkersVisible = useRef(markersVisible);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Use debounced version and add proper event cleanup
    const handleMoveEnd = () => {
      debouncedAddMarkersInView();
    };

    // Force update if markersVisible changed
    const shouldForceUpdate = prevMarkersVisible.current !== markersVisible;
    prevMarkersVisible.current = markersVisible;

    addMarkersInView(shouldForceUpdate);
    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);

    return () => {
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);
    };
  }, [selectedMarkerIndex, activeCategories, markersVisible, markers, debouncedAddMarkersInView, addMarkersInView]);

  const handleRecenter = () => {
    const map = mapRef.current._leaflet_map;
    if (map) map.setView(coords, zoom);
  };

  // Zoom level presets
  const zoomLevels = [
    { name: 'Foot', emoji: '🚶', zoom: 18 },
    { name: 'Bee', emoji: '🐝', zoom: 16 },
    { name: 'Bird', emoji: '🐦', zoom: 14 },
    { name: 'Helicopter', emoji: '🚁', zoom: 12 },
    { name: 'Airplane', emoji: '✈️', zoom: 10 },
    { name: 'Satellite', emoji: '🛰️', zoom: 7 },
    { name: 'Rocket', emoji: '🚀', zoom: 4 }
  ];

  const handleZoomLevel = (zoomLevel) => {
    const map = mapInstance.current;
    if (map) {
      map.setZoom(zoomLevel);
    }
  };

  const focusOnMarker = (index) => {
    const marker = markerRefs.current[index];
    const map = mapInstance.current;
    if (marker && map) {
      setSelectedMarkerIndex(index);
      map.flyTo(marker.getLatLng(), 16, {
        animate: true,
        duration: 1.5,
      });
      marker.openPopup();
      setHighlightedIndex(null);
    }
  };

  // Modified search to handle multiple categories
  const searchLocations = (searchTerm) => {
    if (!searchTerm.trim()) return [];
    
    // Prepare markers for search with flattened categories
    const searchableMarkers = markers.map(marker => ({
      ...marker,
      searchableCategories: normalizeCategories(marker.categories || marker.category).join(' ')
    }));
    
    const fuse = new Fuse(searchableMarkers, {
      keys: ["name", "keywords", "description", "searchableCategories"],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });
    
    return fuse.search(searchTerm)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map(result => result.item);
  };

  useEffect(() => {
    setStartSearchResults(searchLocations(startSearchTerm));
  }, [startSearchTerm, markers]);

  useEffect(() => {
    setEndSearchResults(searchLocations(endSearchTerm));
  }, [endSearchTerm, markers]);

  // Draw trip itinerary polyline
  useEffect(() => {
    if (!mapInstance.current) return;

    const drawTripRoute = async () => {
      const L = await import('leaflet');

      // Clear existing trip polylines and markers
      tripPolylines.forEach(line => {
        if (mapInstance.current.hasLayer(line)) {
          mapInstance.current.removeLayer(line);
        }
      });
      tripMarkersRefs.forEach(marker => {
        if (mapInstance.current.hasLayer(marker)) {
          mapInstance.current.removeLayer(marker);
        }
      });

      const newTripMarkers = [];
      const newPolylines = [];

      if (tripMode === "single") {
        // Single day itinerary mode
        if (tripItinerary.length < 2) {
          setTripPolylines([]);
          setTripMarkersRefs([]);
          return;
        }

        // Draw numbered markers for trip places
        tripItinerary.forEach((place, index) => {
          const icon = L.divIcon({
            className: 'trip-marker',
            html: `
              <div style="
                background-color: #8b5cf6;
                color: white;
                border: 2px solid white;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              ">
                ${index + 1}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker(place.coords, { icon }).addTo(mapInstance.current);
          marker.bindPopup(`<strong>${index + 1}. ${place.name}</strong>`);
          newTripMarkers.push(marker);
        });

        // Draw polyline
        const coords = tripItinerary.map(p => p.coords);
        const polyline = L.polyline(coords, {
          color: '#8b5cf6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
          lineJoin: 'round',
        }).addTo(mapInstance.current);
        newPolylines.push(polyline);

        // Add distance labels on each segment
        for (let i = 0; i < tripItinerary.length - 1; i++) {
          const place1 = tripItinerary[i];
          const place2 = tripItinerary[i + 1];
          const distance = calculateDistance(place1.coords, place2.coords);
          const midLat = (place1.coords[0] + place2.coords[0]) / 2;
          const midLng = (place1.coords[1] + place2.coords[1]) / 2;

          const distanceIcon = L.divIcon({
            className: 'distance-label',
            html: `
              <div style="
                background: #8b5cf6;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">
                ${formatDistance(distance)}
              </div>
            `,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          });

          const distanceMarker = L.marker([midLat, midLng], { icon: distanceIcon }).addTo(mapInstance.current);
          newTripMarkers.push(distanceMarker);
        }
      } else {
        // Day-wise itinerary mode
        const dayColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        Object.entries(dayWiseItinerary).forEach(([day, places]) => {
          if (!places || places.length === 0) return;

          const dayNum = parseInt(day);

          // Only show markers/routes for selected day view or all
          if (viewMode !== "all" && viewMode !== dayNum) return;

          const color = dayColors[(dayNum - 1) % dayColors.length];

          // Draw numbered markers for each day
          places.forEach((place, index) => {
            const icon = L.divIcon({
              className: 'trip-marker',
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
                  font-size: 11px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ">
                  D${dayNum}-${index + 1}
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const marker = L.marker(place.coords, { icon }).addTo(mapInstance.current);
            marker.bindPopup(`<strong>Day ${dayNum} - Stop ${index + 1}</strong><br/>${place.name}`);
            newTripMarkers.push(marker);
          });

          // Draw polyline for each day
          if (places.length >= 2) {
            const coords = places.map(p => p.coords);
            const polyline = L.polyline(coords, {
              color: color,
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
              lineJoin: 'round',
            }).addTo(mapInstance.current);
            newPolylines.push(polyline);

            // Add distance labels on each segment for this day
            for (let i = 0; i < places.length - 1; i++) {
              const place1 = places[i];
              const place2 = places[i + 1];
              const distance = calculateDistance(place1.coords, place2.coords);
              const midLat = (place1.coords[0] + place2.coords[0]) / 2;
              const midLng = (place1.coords[1] + place2.coords[1]) / 2;

              const distanceIcon = L.divIcon({
                className: 'distance-label',
                html: `
                  <div style="
                    background: ${color};
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                    white-space: nowrap;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    border: 2px solid white;
                  ">
                    ${formatDistance(distance)}
                  </div>
                `,
                iconSize: [60, 20],
                iconAnchor: [30, 10],
              });

              const distanceMarker = L.marker([midLat, midLng], { icon: distanceIcon }).addTo(mapInstance.current);
              newTripMarkers.push(distanceMarker);
            }
          }
        });
      }

      setTripPolylines(newPolylines);
      setTripMarkersRefs(newTripMarkers);
    };

    drawTripRoute();
  }, [tripItinerary, dayWiseItinerary, tripMode, viewMode]);

  // Toggle nearby places visibility and filter by category
  useEffect(() => {
    nearbyPlacesMarkers.forEach(marker => {
      if (mapInstance.current) {
        const categoryActive = activeNearbyCategories[marker.nearbyCategory];
        if (showNearbyPlaces && categoryActive) {
          marker.addTo(mapInstance.current);
        } else {
          mapInstance.current.removeLayer(marker);
        }
      }
    });
  }, [showNearbyPlaces, activeNearbyCategories]);

  // Handle directions panel collapse/expand
  useEffect(() => {
    const routingAlt = document.querySelector('.leaflet-routing-alt');
    const collapseBtn = document.querySelector('.directions-collapse-btn');

    if (routingAlt && collapseBtn) {
      if (directionsCollapsed) {
        routingAlt.style.display = 'none';
        collapseBtn.innerHTML = '▶';
        collapseBtn.style.transform = 'rotate(180deg)';
      } else {
        routingAlt.style.display = 'block';
        collapseBtn.innerHTML = '▼';
        collapseBtn.style.transform = 'rotate(0deg)';
      }
    }
  }, [directionsCollapsed]);

  const handleStartSearch = (value) => {
    setStartSearchTerm(value);
    setShowStartResults(value.length > 0);
    setStartHighlighted(-1);
  };

  const handleEndSearch = (value) => {
    setEndSearchTerm(value);
    setShowEndResults(value.length > 0);
    setEndHighlighted(-1);
  };

  const selectStartLocation = (location) => {
    setStartPoint(location.name);
    setStartSearchTerm(location.name);
    setShowStartResults(false);
    setStartHighlighted(-1);
  };

  const selectEndLocation = (location) => {
    setEndPoint(location.name);
    setEndSearchTerm(location.name);
    setShowEndResults(false);
    setEndHighlighted(-1);
  };

  const handleStartKeyDown = (e) => {
    if (!showStartResults || startSearchResults.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setStartHighlighted(prev => 
        prev < startSearchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setStartHighlighted(prev => 
        prev > 0 ? prev - 1 : startSearchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (startHighlighted >= 0) {
        selectStartLocation(startSearchResults[startHighlighted]);
      }
    } else if (e.key === "Escape") {
      setShowStartResults(false);
      setStartHighlighted(-1);
    }
  };

  const handleEndKeyDown = (e) => {
    if (!showEndResults || endSearchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setEndHighlighted(prev =>
        prev < endSearchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setEndHighlighted(prev =>
        prev > 0 ? prev - 1 : endSearchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (endHighlighted >= 0) {
        selectEndLocation(endSearchResults[endHighlighted]);
      }
    } else if (e.key === "Escape") {
      setShowEndResults(false);
      setEndHighlighted(-1);
    }
  };

  // Helper function to capture map as image
  const captureMapImage = async (bounds) => {
    return new Promise(async (resolve) => {
      if (!mapInstance.current || !mapRef.current) {
        console.log('Map not ready for capture');
        resolve(null);
        return;
      }

      let originalCenter = null;
      let originalZoom = null;

      try {
        // Save original view
        originalCenter = mapInstance.current.getCenter();
        originalZoom = mapInstance.current.getZoom();

        console.log('Capturing map image...');

        // Fit bounds if provided with generous padding to ensure all markers are visible
        if (bounds) {
          // Use larger padding to ensure all points are visible
          // padding: [top, right, bottom, left] or [vertical, horizontal]
          mapInstance.current.fitBounds(bounds, {
            padding: [80, 80], // Increased padding from 50 to 80
            maxZoom: 15, // Prevent zooming in too close
            animate: false // Disable animation for faster rendering
          });
        }

        // Force map to invalidate size and redraw
        mapInstance.current.invalidateSize();

        // Wait longer for map to fully render with all markers and polylines
        await new Promise(r => setTimeout(r, 2500)); // Increased to 2500ms for better reliability

        // Import dependencies
        const html2canvas = (await import('html2canvas')).default;
        const domtoimage = await import('dom-to-image-more');

        // Try using dom-to-image-more which handles SVG better than html2canvas
        try {
          console.log('Attempting capture with dom-to-image...');
          const dataUrl = await domtoimage.toPng(mapRef.current, {
            quality: 0.95,
            width: mapRef.current.offsetWidth,
            height: mapRef.current.offsetHeight,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left'
            }
          });

          console.log('Map captured successfully with dom-to-image');

          // Restore original view
          if (originalCenter && originalZoom) {
            mapInstance.current.setView(originalCenter, originalZoom);
          }

          resolve(dataUrl);
          return;
        } catch (domImageError) {
          console.warn('dom-to-image failed, falling back to html2canvas:', domImageError);
        }

        // Fallback to html2canvas
        const canvas = await html2canvas(mapRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#f0f0f0',
          scale: 2, // Increased scale for better quality
          logging: false, // Disable logging for cleaner output
          foreignObjectRendering: false, // Keep disabled for LAB color compatibility
          ignoreElements: (element) => {
            // Skip control elements but keep map layers
            if (element.classList && element.classList.contains('leaflet-control')) {
              return true;
            }
            return false;
          },
          onclone: (clonedDoc) => {
            // Fix any LAB colors or other unsupported CSS in the cloned document
            try {
              // Remove stylesheets that might contain LAB colors
              const styleSheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
              styleSheets.forEach(sheet => {
                try {
                  if (sheet.textContent && (sheet.textContent.includes('lab(') || sheet.textContent.includes('lch(') || sheet.textContent.includes('oklab('))) {
                    sheet.remove();
                  }
                } catch (e) {
                  // Ignore
                }
              });

              const allElements = clonedDoc.querySelectorAll('*');
              allElements.forEach((el) => {
                try {
                  // Remove inline styles with LAB colors
                  const inlineStyle = el.getAttribute('style');
                  if (inlineStyle && (inlineStyle.includes('lab(') || inlineStyle.includes('lch(') || inlineStyle.includes('oklab('))) {
                    el.removeAttribute('style');
                  }

                  // Set safe colors with important flag
                  const computedStyle = window.getComputedStyle(el);

                  // Fix background color
                  const bgColor = computedStyle.backgroundColor;
                  if (bgColor && (bgColor.includes('lab') || bgColor.includes('lch') || bgColor.includes('oklab'))) {
                    el.style.setProperty('background-color', 'transparent', 'important');
                  }

                  // Fix text color
                  const textColor = computedStyle.color;
                  if (textColor && (textColor.includes('lab') || textColor.includes('lch') || textColor.includes('oklab'))) {
                    el.style.setProperty('color', '#000000', 'important');
                  }

                  // Fix border color
                  const borderColor = computedStyle.borderColor;
                  if (borderColor && (borderColor.includes('lab') || borderColor.includes('lch') || borderColor.includes('oklab'))) {
                    el.style.setProperty('border-color', '#cccccc', 'important');
                  }
                } catch (e) {
                  // Ignore individual element errors
                }
              });

              // Ensure SVG elements are properly positioned
              const svgElements = clonedDoc.querySelectorAll('svg');
              svgElements.forEach(svg => {
                try {
                  // Reset any problematic transforms
                  const paths = svg.querySelectorAll('path');
                  paths.forEach(path => {
                    // Ensure paths are visible
                    if (path.getAttribute('stroke-opacity')) {
                      path.setAttribute('stroke-opacity', '0.8');
                    }
                  });
                } catch (e) {
                  // Ignore
                }
              });
            } catch (e) {
              console.warn('Error processing cloned document:', e);
            }
          }
        });

        console.log('Map captured successfully');

        // Restore original view
        if (originalCenter && originalZoom) {
          mapInstance.current.setView(originalCenter, originalZoom);
        }

        // Return base64 image
        const imageData = canvas.toDataURL('image/png', 0.9);
        console.log('Image data length:', imageData.length);
        resolve(imageData);
      } catch (error) {
        console.error('Error capturing map:', error);
        // Still restore view even on error
        if (mapInstance.current && originalCenter && originalZoom) {
          try {
            mapInstance.current.setView(originalCenter, originalZoom);
          } catch (e) {
            console.error('Error restoring view:', e);
          }
        }
        resolve(null);
      }
    });
  };

  // Helper function to clean HTML and decode entities from description
  const cleanDescription = (description) => {
    if (!description) return '';

    try {
      let cleanText = String(description);

      // First, convert <br> tags to newlines before processing
      cleanText = cleanText.replace(/<br\s*\/?>/gi, '\n');

      // Decode numeric HTML entities (&#123; or &#xAB;)
      cleanText = cleanText.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
      cleanText = cleanText.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

      // Create a temporary div to decode HTML entities and strip tags
      const temp = document.createElement('div');
      temp.innerHTML = cleanText;

      // Get text content (strips all HTML tags)
      cleanText = temp.textContent || temp.innerText || '';

      // Decode common HTML entities manually as fallback
      cleanText = cleanText
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");

      // Remove phone symbols that appear as Ø (Unicode phone/fax symbols)
      cleanText = cleanText.replace(/[\u260E\u260F\u2706\u2121\u2706]/g, '');

      // Remove email symbols
      cleanText = cleanText.replace(/[\u2709\u2709]/g, '');

      // Remove other problematic symbols and combining marks
      cleanText = cleanText.replace(/[\u0300-\u036F]/g, ''); // Combining diacritical marks
      cleanText = cleanText.replace(/[\u2000-\u206F]/g, ' '); // General punctuation
      cleanText = cleanText.replace(/[\uFFF0-\uFFFF]/g, ''); // Specials

      // Remove URLs which often cause encoding issues
      cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '');

      // Fix the spaced character pattern (e.g., "H o u s e" -> "House")
      // This pattern catches single chars followed by spaces
      cleanText = cleanText.replace(/\b(\w)\s+(?=\w\s+|\w$)/g, '$1');

      // Remove any remaining HTML-like patterns
      cleanText = cleanText.replace(/<[^>]*>/g, '');

      // Remove any control characters and non-printable characters
      cleanText = cleanText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

      // Keep only safe printable ASCII and common extended characters
      cleanText = cleanText.split('').map(char => {
        const code = char.charCodeAt(0);
        // Allow: space, printable ASCII, common Latin extended
        if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255) || code === 10) {
          return char;
        }
        return ' ';
      }).join('');

      // Normalize whitespace but preserve newlines
      cleanText = cleanText.split('\n').map(line =>
        line.replace(/\s+/g, ' ').trim()
      ).join('\n');

      // Remove excessive blank lines
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n');

      return cleanText.trim();
    } catch (e) {
      console.error('Error cleaning description:', e);
      // If all else fails, just return basic cleaned text
      return String(description).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  };

  // Export itinerary as PDF
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPos = margin;

    // Title
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text(`Trip Itinerary - ${name}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    if (tripMode === "single") {
      // Single day itinerary
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Single Day Trip', margin, yPos);
      yPos += 10;

      // Capture map image for single day trip
      let mapImageData = null;
      if (tripItinerary.length > 0) {
        console.log('Attempting to capture single day trip map...');
        const L = await import('leaflet');
        const bounds = L.latLngBounds(tripItinerary.map(p => p.coords));
        mapImageData = await captureMapImage(bounds);
        console.log('Single day map captured:', mapImageData ? 'SUCCESS' : 'FAILED');
      }

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');

      tripItinerary.forEach((place, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${place.name}`, margin + 5, yPos);
        yPos += 7;

        if (place.description) {
          doc.setFont(undefined, 'normal');
          doc.setFontSize(9);
          const cleanedDesc = cleanDescription(place.description);
          if (cleanedDesc) {
            const splitDesc = doc.splitTextToSize(cleanedDesc, pageWidth - margin * 2 - 10);
            doc.text(splitDesc, margin + 10, yPos);
            yPos += splitDesc.length * 5 + 5;
          } else {
            yPos += 5;
          }
        } else {
          yPos += 5;
        }

        // Add distance to next place
        if (index < tripItinerary.length - 1) {
          const nextPlace = tripItinerary[index + 1];
          const distance = calculateDistance(place.coords, nextPlace.coords);
          doc.setFont(undefined, 'italic');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`    ↓ ${formatDistance(distance)} to next stop`, margin + 5, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 6;
        }
      });

      // Total places
      yPos += 5;
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text(`Total Places: ${tripItinerary.length}`, margin, yPos);
      yPos += 15;

      // Add map image if captured
      if (mapImageData) {
        console.log('Adding single day map to PDF...');
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Route Map', margin, yPos);
        yPos += 8;

        // Add map image (landscape, centered)
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = 80;
        try {
          doc.addImage(mapImageData, 'PNG', margin, yPos, imgWidth, imgHeight);
          console.log('Single day map added to PDF successfully');
        } catch (err) {
          console.error('Error adding single day map to PDF:', err);
        }
        yPos += imgHeight + 10;
      } else {
        console.log('No map image data for single day trip');
      }
    } else {
      // Day-wise itinerary
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${numberOfDays}-Day Trip`, margin, yPos);
      yPos += 12;

      for (let day = 1; day <= numberOfDays; day++) {
        const places = dayWiseItinerary[day] || [];

        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }

        // Day header
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(59, 130, 246);
        doc.rect(margin, yPos - 6, pageWidth - margin * 2, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`Day ${day}`, margin + 5, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        if (places.length === 0) {
          doc.setFontSize(10);
          doc.setFont(undefined, 'italic');
          doc.text('No places added yet', margin + 10, yPos);
          yPos += 8;
        } else {
          doc.setFontSize(11);
          doc.setFont(undefined, 'normal');

          places.forEach((place, index) => {
            if (yPos > pageHeight - 30) {
              doc.addPage();
              yPos = margin;
            }

            doc.setFont(undefined, 'bold');
            doc.text(`  ${index + 1}. ${place.name}`, margin + 5, yPos);
            yPos += 7;

            if (place.description) {
              doc.setFont(undefined, 'normal');
              doc.setFontSize(9);
              const cleanedDesc = cleanDescription(place.description);
              if (cleanedDesc) {
                const splitDesc = doc.splitTextToSize(cleanedDesc, pageWidth - margin * 2 - 15);
                doc.text(splitDesc, margin + 15, yPos);
                yPos += splitDesc.length * 5 + 3;
              } else {
                yPos += 3;
              }
            } else {
              yPos += 3;
            }

            // Add distance to next place
            if (index < places.length - 1) {
              const nextPlace = places[index + 1];
              const distance = calculateDistance(place.coords, nextPlace.coords);
              doc.setFont(undefined, 'italic');
              doc.setFontSize(9);
              doc.setTextColor(100, 100, 100);
              doc.text(`      ↓ ${formatDistance(distance)} to next stop`, margin + 5, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;
            }
          });

          yPos += 3;
          doc.setFont(undefined, 'italic');
          doc.setFontSize(9);
          doc.text(`Day ${day} - ${places.length} place(s)`, margin + 10, yPos);
          yPos += 10;

          // Now capture map image for this day's places
          console.log(`Attempting to capture Day ${day} map...`);
          const L = await import('leaflet');
          const bounds = L.latLngBounds(places.map(p => p.coords));
          const dayMapImageData = await captureMapImage(bounds);
          console.log(`Day ${day} map captured:`, dayMapImageData ? 'SUCCESS' : 'FAILED');

          // Add map image for this day if captured
          if (dayMapImageData) {
            console.log(`Adding Day ${day} map to PDF...`);
            if (yPos > pageHeight - 90) {
              doc.addPage();
              yPos = margin;
            }

            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Day ${day} Route Map`, margin + 10, yPos);
            yPos += 6;

            // Add map image (smaller for multi-day)
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = 70;
            try {
              doc.addImage(dayMapImageData, 'PNG', margin, yPos, imgWidth, imgHeight);
              console.log(`Day ${day} map added to PDF successfully`);
            } catch (err) {
              console.error(`Error adding Day ${day} map to PDF:`, err);
            }
            yPos += imgHeight + 5;
          } else {
            console.log(`No map image data for Day ${day}`);
          }
        }

        yPos += 12;
      }

      // Total summary
      const totalPlaces = Object.values(dayWiseItinerary).reduce((sum, places) => sum + (places?.length || 0), 0);
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text(`Total: ${totalPlaces} places across ${numberOfDays} days`, margin, yPos);
    }

    // Footer on last page
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by TravelWithDevang', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    const fileName = `${name.replace(/\s+/g, '_')}_Itinerary_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Function to find nearby places along the route
  const findNearbyPlacesAlongRoute = (routeCoordinates) => {
    console.log('=== Finding nearby places along route ===');
    console.log('Route coordinates count:', routeCoordinates.length);
    console.log('Total markers available:', markers.length);

    // Debug: Check sample marker structure
    if (markers.length > 0) {
      console.log('Sample marker structure:', {
        name: markers[0].name,
        categories: markers[0].categories,
        category: markers[0].category,
        coords: markers[0].coords
      });
    }

    // Clear existing nearby places markers
    nearbyPlacesMarkers.forEach(marker => {
      if (mapInstance.current) {
        mapInstance.current.removeLayer(marker);
      }
    });

    const L = window.L || globalThis.L;
    const radiusKm = 1; // 1 km radius
    const newNearbyMarkers = [];

    // Categories to look for with their colors
    const categories = {
      restaurant: { color: '#EF4444', emoji: '🍽️', label: 'Restaurant' }, // Red
      cafe: { color: '#F59E0B', emoji: '☕', label: 'Cafe' }, // Orange
      pharmacy: { color: '#10B981', emoji: '💊', label: 'Pharmacy' }, // Green
    };

    // Find places near the route
    const foundPlaces = new Set(); // To avoid duplicate markers
    const categoryCount = { restaurant: 0, cafe: 0, pharmacy: 0 };

    // Sample route points every ~200 meters to avoid checking thousands of points
    // This makes the search more efficient while still catching nearby places
    const sampledPoints = [];
    let lastSampledPoint = null;
    const minSampleDistance = 0.2; // 200 meters in km

    for (let i = 0; i < routeCoordinates.length; i++) {
      const point = routeCoordinates[i];

      if (!lastSampledPoint) {
        // Always include first point
        sampledPoints.push(point);
        lastSampledPoint = point;
      } else {
        // Check if we've traveled at least 200m from last sampled point
        const dist = calculateDistance(
          [lastSampledPoint.lat, lastSampledPoint.lng],
          [point.lat, point.lng]
        );

        if (dist >= minSampleDistance) {
          sampledPoints.push(point);
          lastSampledPoint = point;
        }
      }
    }

    // Always include last point
    if (routeCoordinates.length > 0 &&
        sampledPoints[sampledPoints.length - 1] !== routeCoordinates[routeCoordinates.length - 1]) {
      sampledPoints.push(routeCoordinates[routeCoordinates.length - 1]);
    }

    console.log(`Sampled ${sampledPoints.length} points from ${routeCoordinates.length} total route points`);

    // Iterate through sampled route points
    sampledPoints.forEach(point => {
      const routeLat = point.lat;
      const routeLng = point.lng;

      // Check all markers for nearby places
      markers.forEach(marker => {
        // Get the marker's categories (handle both old 'category' and new 'categories' fields)
        const markerCategories = marker.categories || marker.category;
        const category = getPrimaryCategory(markerCategories);

        // Debug: log first few categories found
        if (categories[category] && !foundPlaces.has(`${marker.name}-${category}`)) {
          console.log('Found potential place:', marker.name, 'Category:', category);
        }

        // Only process if it's one of our target categories
        if (!categories[category]) return;

        // Check if already added
        const placeKey = `${marker.name}-${category}`;
        if (foundPlaces.has(placeKey)) return;

        const markerLat = marker.coords[0];
        const markerLng = marker.coords[1];

        // Calculate distance from this route point to marker
        const distance = calculateDistance([routeLat, routeLng], [markerLat, markerLng]);

        // If within 1km of ANY point on the route
        if (distance <= radiusKm) {
          foundPlaces.add(placeKey);
          categoryCount[category]++;

          console.log(`Adding ${category}: ${marker.name} (${distance.toFixed(2)} km from route)`);

          // Create a small colored circle marker
          const circleMarker = L.circleMarker([markerLat, markerLng], {
            radius: 8,
            fillColor: categories[category].color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          });

          // Store category on the marker for filtering later
          circleMarker.nearbyCategory = category;

          // Add popup with place info
          const popupContent = `
            <div style="min-width: 150px;">
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${categories[category].emoji} ${marker.name}
              </div>
              <div style="color: ${categories[category].color}; font-size: 12px; margin-bottom: 4px;">
                ${categories[category].label}
              </div>
              <div style="font-size: 11px; color: #666;">
                ${distance.toFixed(2)} km from route
              </div>
            </div>
          `;

          circleMarker.bindPopup(popupContent);
          circleMarker.addTo(mapInstance.current);
          newNearbyMarkers.push(circleMarker);
        }
      });
    });

    console.log('Category counts:', categoryCount);
    console.log('Total nearby places found:', newNearbyMarkers.length);
    setNearbyPlacesMarkers(newNearbyMarkers);
  };

  const showRoute = () => {
    if (!startPoint || !endPoint || !mapInstance.current) return;
    
    const startMarker = markers.find(m => m.name === startPoint);
    const endMarker = markers.find(m => m.name === endPoint);
    
    if (!startMarker || !endMarker) return;

    if (routingControl) {
      mapInstance.current.removeControl(routingControl);
    }

    const L = window.L || globalThis.L;
    const LRM = window.L.Routing;
    
    const startIcon = L.icon({
      iconUrl: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/A.svg',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
    
    const endIcon = L.icon({
      iconUrl: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/B.svg',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    // Define route styles for different transport modes
    const routeStyles = {
      driving: { color: '#0C84ED', weight: 8, opacity: 0.7, dashArray: null },
      foot: { color: '#10B981', weight: 6, opacity: 0.8, dashArray: '5, 10' },
      bike: { color: '#F59E0B', weight: 6, opacity: 0.8, dashArray: null }
    };

    const newRoutingControl = LRM.control({
      waypoints: [
        L.latLng(startMarker.coords[0], startMarker.coords[1]),
        L.latLng(endMarker.coords[0], endMarker.coords[1])
      ],
      routeWhileDragging: true,
      addWaypoints: false,
      createMarker: function() { return null; },
      lineOptions: {
        styles: [routeStyles[transportMode] || routeStyles.driving],
        extendToWaypoints: true,
        missingRouteTolerance: 1
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: transportMode,
        timeout: 30000 // 30 second timeout
      })
    }).on('routesfound', function(e) {
      console.log('Route found event triggered!');
      const routes = e.routes;
      const summary = routes[0].summary;
      const distance = (summary.totalDistance / 1000).toFixed(2);
      let duration = summary.totalTime;
      console.log('Route coordinates:', routes[0].coordinates);
      let hours = Math.floor(duration / 3600);
      let minutes = Math.floor((duration % 3600) / 60);

      // Adjust time display based on transport mode
      if (transportMode === 'foot') {
        // Walking is typically slower, so we'll adjust the time to be more realistic
        duration = duration * 2.5; // Add 30% more time for walking
        hours = Math.floor(duration / 3600);
        minutes = Math.floor((duration % 3600) / 60);
      } else if (transportMode === 'bike') {
        // Cycling is typically faster than walking but depends on terrain
        duration = duration * 0.7; // 30% faster than walking
        hours = Math.floor(duration / 3600);
        minutes = Math.floor((duration % 3600) / 60);
      }

      let timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      setRouteDistance(distance);
      setRouteTime(timeStr);

      // Find nearby places along the route
      if (showNearbyPlaces && routes[0].coordinates) {
        findNearbyPlacesAlongRoute(routes[0].coordinates);
      }
    }).addTo(mapInstance.current);

    setRoutingControl(newRoutingControl);
    setShowRouting(true);

    // Add collapse button to routing container after a short delay
    setTimeout(() => {
      const routingContainer = document.querySelector('.leaflet-routing-container');
      if (routingContainer && !routingContainer.querySelector('.directions-collapse-btn')) {
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'directions-collapse-btn';
        collapseBtn.innerHTML = '▼';
        collapseBtn.style.cssText = `
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 4px;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          transition: transform 0.3s;
        `;
        collapseBtn.onclick = () => {
          setDirectionsCollapsed(prev => !prev);
        };
        routingContainer.style.position = 'relative';
        routingContainer.insertBefore(collapseBtn, routingContainer.firstChild);
      }
    }, 500);

    const startMarkerObj = L.marker([startMarker.coords[0], startMarker.coords[1]], { icon: startIcon })
      .addTo(mapInstance.current)
      .bindPopup(startMarker.popupContent);
    setStartMarkerRef(startMarkerObj);

    const endMarkerObj = L.marker([endMarker.coords[0], endMarker.coords[1]], { icon: endIcon })
      .addTo(mapInstance.current)
      .bindPopup(endMarker.popupContent);
    setEndMarkerRef(endMarkerObj);
  };

  const clearRoute = () => {
    if (routingControl && mapInstance.current) {
      mapInstance.current.removeControl(routingControl);
      setRoutingControl(null);
      setShowRouting(false);
      setRouteDistance(null);

      if (startMarkerRef) {
        mapInstance.current.removeLayer(startMarkerRef);
        setStartMarkerRef(null);
      }
      if (endMarkerRef) {
        mapInstance.current.removeLayer(endMarkerRef);
        setEndMarkerRef(null);
      }

      // Clear nearby places markers
      nearbyPlacesMarkers.forEach(marker => {
        if (mapInstance.current) {
          mapInstance.current.removeLayer(marker);
        }
      });
      setNearbyPlacesMarkers([]);

      setStartPoint("");
      setEndPoint("");
      setStartSearchTerm("");
      setEndSearchTerm("");
      setShowStartResults(false);
      setShowEndResults(false);
    }
  };

  function getDefaultIconUrlByCategory(category) {
    switch (category) {
      case 'racecourse':
        return "https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/horse.svg";
      case 'park':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/park.svg';
      case 'fishandchips':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/fish.svg'
      case 'historic':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/historic.svg'
      case 'college':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/college.png'
      case 'art':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/art.svg'
      case 'church':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/church.svg'
      case 'restaurant':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/restaurant.svg'
      case 'pint':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/beer.svg'
      case 'cafe':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/cafe.svg'
      case 'viewpoint':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/viewpoint.svg'  
      case 'beach':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/beach.svg'
      case 'museum':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/museum.svg'
      case 'cricket':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/cricket.svg'
      case 'bookstore':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/bookstore.svg'
      case 'hospital':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/hospital.svg'
      case 'bookmaker':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/bet.png'
      case 'pharmacy':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/pharmacy.svg'
      case 'Red':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/red.svg'
      case 'Green':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/green.svg'
      case 'atm':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/atm.svg'
      case 'icecream':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/ice-cream.svg'
      case 'womenbeauty':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/women-beauty.svg'
      case 'leisure':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/resting.png'
      case 'retailshops':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/retailshop.png'
      case 'hospitality':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/hospitality.svg'
      case 'health':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/health.svg'
      case 'police':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/police.svg'
      case 'dentist':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/dentist.svg'
      case 'fuelgas':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/fuelgas.svg'      
      case 'casino':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/casino.svg'      
      default:
        return "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
    }
  }

  // Modified to handle multiple categories for icon selection
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markerRefs.current.forEach((marker, index) => {
      const markerData = markers[index];
      if (!markerData) return;
      
      const markerCategories = markerData.categories || markerData.category;
      const primaryCategory = getPrimaryCategory(markerCategories);
      const isSelected = selectedMarkerIndex === index;
      const isFiltered = markerMatchesCategories(markerCategories, activeCategories);

      if (map.hasLayer(marker)) {
        marker.setIcon(
          new (window.L || globalThis.L).Icon({
            iconUrl: isSelected
              ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
              : getDefaultIconUrlByCategory(primaryCategory),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            shadowSize: [41, 41],
          })
        );
      }
    });
  }, [selectedMarkerIndex, activeCategories, markersVisible, markers]);

  // Modified filtering logic for multiple categories
  const visibleMarkers = activeCategories.length > 0
    ? markers.filter(m => markerMatchesCategories(m.categories || m.category, activeCategories))
    : markers;

  const fuse = new Fuse(visibleMarkers.map(marker => ({
    ...marker,
    searchableCategories: normalizeCategories(marker.categories || marker.category).join(' ')
  })), {
    keys: ["name", "keywords", "description", "searchableCategories"],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
  });

  const normalizedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
  const filteredMarkers = normalizedSearchTerm
    ? fuse.search(normalizedSearchTerm)
        .sort((a, b) => a.score - b.score)
        .map(result => result.item)
    : visibleMarkers;

  const onKeyDown = (e) => {
    if (filteredMarkers.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev === null || prev === filteredMarkers.length - 1 ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev === null || prev <= 0 ? filteredMarkers.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex !== null) {
        const originalIndex = markers.findIndex((mm) => mm.name === filteredMarkers[highlightedIndex].name);
        focusOnMarker(originalIndex);
        setSearchTerm("");
        setHighlightedIndex(null);
      }
    }
  };

  const highlightText = (text, highlight) => {
    if (!text) return '';  // Return empty string if text is null/undefined
    if (!highlight) return text;
    
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Modified filtered marker count for multiple categories
  const filteredMarkerCount = markers.filter(marker => {
    if (!marker) return false;
    const categoryMatch = markerMatchesCategories(marker.categories || marker.category, activeCategories);
    return markersVisible && categoryMatch;
  }).length;

  const handleCategoryToggle = (category) => {
    setActiveCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
    setSelectedMarkerIndex(null);
  };

  const handleClearCategories = () => {
    setActiveCategories([]);
    setSelectedMarkerIndex(null);
  };

  // Loading skeleton component
  if (loading && markers.length === 0) {
    return (
      <div style={{ position: "relative" }}>
        <div style={{
          height: "500px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-blue-400 rounded-full"></div>
            <div className="h-4 w-48 bg-gray-300 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
          <p style={{ color: "#666", fontSize: "14px" }}>Loading map for {name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* New Custom Category Emoji Bar */}
      <CityMapCategoryBar
        markers={markers}
        activeCategories={activeCategories}
        onCategoryToggle={handleCategoryToggle}
        onClearCategories={handleClearCategories}
        markersVisible={markersVisible}
        onToggleMarkersVisibility={handleToggleMarkers}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        loading={loading}
      />

      {/* Map */}
      <div
        ref={mapRef}
        className="aspect-square sm:aspect-auto"
        style={{
          height: window.innerWidth < 640 ? "auto" : "600px",
          width: "100%",
          borderRadius: "50px",
          marginBottom: "1.5rem",
          zIndex: 0,
        }}
      />
      

      {/* Trip Planning Section - Left Slide-out Panel */}
      <div style={{
        position: "fixed",
        left: showTripPlanner ? "0" : "-420px",
        top: "0",
        height: "100vh",
        width: "400px",
        backgroundColor: "rgba(15, 23, 42, 0.98)",
        backdropFilter: "blur(10px)",
        zIndex: 10000,
        transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: showTripPlanner ? "4px 0 20px rgba(0, 0, 0, 0.3)" : "none",
        overflowY: "auto",
        fontFamily: '"Playfair Display", serif'
      }}>
        {/* Panel Header */}
        <div style={{
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(15, 23, 42, 0.98)",
          padding: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 10001
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h4 style={{ margin: 0, color: "#ffffff", fontSize: "1.5rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar size={24} />
              Plan Your Trip
            </h4>
            <button
              onClick={() => setShowTripPlanner(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              style={{ color: "white" }}
              aria-label="Close trip planner"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div style={{ padding: "20px" }}>
          {/* Route Planner Section */}
          <div className="bg-white/10 rounded-lg p-4 space-y-4 mb-6">
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-white/10 rounded-lg p-2 -mx-2 -mt-2 transition-colors"
              onClick={() => setIsRoutePlannerCollapsed(!isRoutePlannerCollapsed)}
            >
              <h5 style={{ margin: 0, color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                <Navigation size={20} />
                Route Planner
              </h5>
              {isRoutePlannerCollapsed ? (
                <ChevronDown size={20} className="text-white" />
              ) : (
                <ChevronUp size={20} className="text-white" />
              )}
            </div>

            {!isRoutePlannerCollapsed && (
            <>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <label style={{ fontSize: "0.85rem", marginBottom: "5px", display: "block", color: "white" }}>From:</label>
                <input
                  type="text"
                  value={startSearchTerm}
                  onChange={(e) => handleStartSearch(e.target.value)}
                  onKeyDown={handleStartKeyDown}
                  onFocus={() => setShowStartResults(startSearchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowStartResults(false), 200)}
                  placeholder="Search start location..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "none"
                  }}
                  className="focus:outline-none"
                />
                {showStartResults && startSearchResults.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    borderRadius: "0 0 6px 6px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    zIndex: 10002,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    marginTop: "2px"
                  }}>
                    {startSearchResults.map((location, index) => {
                      const locationCategories = normalizeCategories(location.categories || location.category);
                      const primaryEmoji = CATEGORY_EMOJIS[locationCategories[0]] || "📍";
                      return (
                        <div
                          key={index}
                          onClick={() => selectStartLocation(location)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            backgroundColor: index === startHighlighted ? "#f0f9ff" : "white",
                            fontSize: "0.85rem",
                            borderBottom: index < startSearchResults.length - 1 ? "1px solid #eee" : "none"
                          }}
                          onMouseEnter={() => setStartHighlighted(index)}
                        >
                          <span style={{ marginRight: "8px" }}>{primaryEmoji}</span>
                          {location.name}
                          {locationCategories.length > 1 && (
                            <span style={{ fontSize: "0.7rem", color: "#666", marginLeft: "4px" }}>
                              (+{locationCategories.length - 1})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <label style={{ fontSize: "0.85rem", marginBottom: "5px", display: "block", color: "white" }}>To:</label>
                <input
                  type="text"
                  value={endSearchTerm}
                  onChange={(e) => handleEndSearch(e.target.value)}
                  onKeyDown={handleEndKeyDown}
                  onFocus={() => setShowEndResults(endSearchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowEndResults(false), 200)}
                  placeholder="Search destination..."
                  className='focus:outline-none'
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "none"
                  }}
                />
                {showEndResults && endSearchResults.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    borderRadius: "0 0 6px 6px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    zIndex: 10002,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    marginTop: "2px"
                  }}>
                    {endSearchResults.map((location, index) => {
                      const locationCategories = normalizeCategories(location.categories || location.category);
                      const primaryEmoji = CATEGORY_EMOJIS[locationCategories[0]] || "📍";
                      return (
                        <div
                          key={index}
                          onClick={() => selectEndLocation(location)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            backgroundColor: index === endHighlighted ? "#f0f9ff" : "white",
                            fontSize: "0.85rem",
                            borderBottom: index < endSearchResults.length - 1 ? "1px solid #eee" : "none"
                          }}
                          onMouseEnter={() => setEndHighlighted(index)}
                        >
                          <span style={{ marginRight: "8px" }}>{primaryEmoji}</span>
                          {location.name}
                          {locationCategories.length > 1 && (
                            <span style={{ fontSize: "0.7rem", color: "#666", marginLeft: "4px" }}>
                              (+{locationCategories.length - 1})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">Travel Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTransportMode('driving')}
                  className={`flex-1 p-2 rounded-lg text-xs border ${transportMode === 'driving' ? 'bg-blue-600/80 border-blue-400' : 'bg-white/10 border-white/30'} text-white transition-colors`}
                >
                  🚗 Drive
                </button>
                <button
                  onClick={() => setTransportMode('foot')}
                  className={`flex-1 p-2 rounded-lg text-xs border ${transportMode === 'foot' ? 'bg-green-600/80 border-green-400' : 'bg-white/10 border-white/30'} text-white transition-colors`}
                >
                  🚶 Walk
                </button>
                <button
                  onClick={() => setTransportMode('bike')}
                  className={`flex-1 p-2 rounded-lg text-xs border ${transportMode === 'bike' ? 'bg-yellow-600/80 border-yellow-400' : 'bg-white/10 border-white/30'} text-white transition-colors`}
                >
                  🚴 Bike
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={showRoute}
                disabled={!startPoint || !endPoint}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                  !startPoint || !endPoint
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                Show Route
              </button>

              {showRouting && (
                <button
                  onClick={clearRoute}
                  className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={14} />
                  Clear Route
                </button>
              )}

              {routeDistance && routeTime && (
                <div className="p-3 bg-green-600 text-white rounded-lg text-center text-sm font-semibold">
                  {routeDistance} km • {routeTime}
                </div>
              )}

              {showRouting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                    <span className="text-white text-xs font-semibold">Nearby Places</span>
                    <button
                      onClick={() => setShowNearbyPlaces(!showNearbyPlaces)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        showNearbyPlaces ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}
                    >
                      {showNearbyPlaces ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {showNearbyPlaces && nearbyPlacesMarkers.length > 0 && (
                    <div className="p-2 bg-white/5 rounded-lg space-y-2">
                      <div className="text-white text-xs font-semibold mb-2">
                        Filter {nearbyPlacesMarkers.length} places within 1km:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => setActiveNearbyCategories(prev => ({...prev, restaurant: !prev.restaurant}))}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
                        >
                          <div
                            className="w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center"
                            style={{
                              backgroundColor: activeNearbyCategories.restaurant ? '#EF4444' : 'transparent',
                              border: '2px solid #EF4444',
                              opacity: activeNearbyCategories.restaurant ? 1 : 0.4,
                              transform: activeNearbyCategories.restaurant ? 'scale(1)' : 'scale(0.85)'
                            }}
                          >
                            {activeNearbyCategories.restaurant && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className="text-white">🍽️ Restaurants</span>
                        </button>
                        <button
                          onClick={() => setActiveNearbyCategories(prev => ({...prev, cafe: !prev.cafe}))}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
                        >
                          <div
                            className="w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center"
                            style={{
                              backgroundColor: activeNearbyCategories.cafe ? '#F59E0B' : 'transparent',
                              border: '2px solid #F59E0B',
                              opacity: activeNearbyCategories.cafe ? 1 : 0.4,
                              transform: activeNearbyCategories.cafe ? 'scale(1)' : 'scale(0.85)'
                            }}
                          >
                            {activeNearbyCategories.cafe && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className="text-white">☕ Cafes</span>
                        </button>
                        <button
                          onClick={() => setActiveNearbyCategories(prev => ({...prev, pharmacy: !prev.pharmacy}))}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
                        >
                          <div
                            className="w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center"
                            style={{
                              backgroundColor: activeNearbyCategories.pharmacy ? '#10B981' : 'transparent',
                              border: '2px solid #10B981',
                              opacity: activeNearbyCategories.pharmacy ? 1 : 0.4,
                              transform: activeNearbyCategories.pharmacy ? 'scale(1)' : 'scale(0.85)'
                            }}
                          >
                            {activeNearbyCategories.pharmacy && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className="text-white">💊 Pharmacies</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            </>
            )}
          </div>

          {/* Trip Planner Section */}
          {(
          <div className="bg-white/10 rounded-lg p-4 space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-white/10 rounded-lg p-2 -mx-2 -mt-2 transition-colors"
              onClick={() => setIsTripPlannerCollapsed(!isTripPlannerCollapsed)}
              style={{ marginBottom: "12px" }}
            >
              <h5 style={{ margin: 0, color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={20} />
                Trip Planner
              </h5>
              {isTripPlannerCollapsed ? (
                <ChevronDown size={20} className="text-white" />
              ) : (
                <ChevronUp size={20} className="text-white" />
              )}
            </div>

            {!isTripPlannerCollapsed && (
            <>
            {/* Mode Selection */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setTripMode("single");
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  tripMode === "single"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Single Day Trip</span>
                  {tripItinerary.length > 0 && (
                    <span className={`text-xs mt-1 ${
                      tripMode === "single" ? "text-purple-100" : "text-white/60"
                    }`}>
                      {tripItinerary.length} place{tripItinerary.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  setTripMode("daywise");
                  setViewMode("all"); // Start with "All Days" view when switching to daywise mode
                  // Initialize empty days only if dayWiseItinerary is empty
                  if (Object.keys(dayWiseItinerary).length === 0) {
                    const initDays = {};
                    for (let i = 1; i <= numberOfDays; i++) {
                      initDays[i] = [];
                    }
                    setDayWiseItinerary(initDays);
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  tripMode === "daywise"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Multi-Day Trip</span>
                  {Object.values(dayWiseItinerary).some((places) => places && places.length > 0) && (
                    <span className={`text-xs mt-1 ${
                      tripMode === "daywise" ? "text-blue-100" : "text-white/60"
                    }`}>
                      {Object.values(dayWiseItinerary).reduce((sum, places) => sum + (places?.length || 0), 0)} place{Object.values(dayWiseItinerary).reduce((sum, places) => sum + (places?.length || 0), 0) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Day-wise Configuration */}
            {tripMode === "daywise" && (
              <div className="bg-white/10 rounded-lg p-3 space-y-3">
                <label className="text-white font-semibold text-sm">Number of Days:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setNumberOfDays(num);
                        const newDays = {};
                        for (let i = 1; i <= num; i++) {
                          newDays[i] = dayWiseItinerary[i] || [];
                        }
                        setDayWiseItinerary(newDays);
                        if (selectedDay > num) {
                          setSelectedDay(1);
                          setViewMode(1);
                        }
                      }}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        numberOfDays === num
                          ? "bg-blue-500 text-white"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Day Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => {
                      setViewMode("all");
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      viewMode === "all"
                        ? "bg-purple-500 text-white shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    All Days
                  </button>
                  {Array.from({ length: numberOfDays }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setViewMode(day);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                        viewMode === day
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      Day {day} ({dayWiseItinerary[day]?.length || 0})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-white text-sm">
              {tripMode === "single"
                ? "Click on places from the map to add them to your single-day trip itinerary."
                : `Click on places to add them to Day ${selectedDay}. Switch between days using the tabs above.`}
            </p>

            {/* Export Button */}
            {((tripMode === "single" && tripItinerary.length > 0) ||
              (tripMode === "daywise" &&
                Object.values(dayWiseItinerary).some((places) => places && places.length > 0))) && (
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Export to PDF
                </button>
                <button
                  onClick={() => {
                    if (tripMode === "single") {
                      setTripItinerary([]);
                    } else {
                      setDayWiseItinerary(
                        Object.keys(dayWiseItinerary).reduce((acc, day) => {
                          acc[day] = [];
                          return acc;
                        }, {})
                      );
                    }
                    if (mapInstance.current) {
                      tripPolylines.forEach((line) => mapInstance.current.removeLayer(line));
                      tripMarkersRefs.forEach((marker) => mapInstance.current.removeLayer(marker));
                    }
                    setTripPolylines([]);
                    setTripMarkersRefs([]);
                  }}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded shadow hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>
            )}

            {/* Single Day Itinerary Display */}
            {tripMode === "single" && (
              <>
                {tripItinerary.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-white font-semibold">Your Itinerary ({tripItinerary.length} places)</h5>
                      <span className="text-white/70 text-xs">Drag to reorder</span>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="single-trip-itinerary">
                        {(provided, snapshot) => (
                          <div
                            className={`max-h-60 overflow-y-auto space-y-2 rounded-lg p-2 transition-all ${
                              snapshot.isDraggingOver ? 'bg-purple-500/20 ring-2 ring-purple-400' : 'bg-transparent'
                            }`}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {tripItinerary.map((place, index) => {
                              const uniqueId = `${place.name}-${place.coords[0]}-${place.coords[1]}`;
                              const nextPlace = tripItinerary[index + 1];
                              const distance = nextPlace ? calculateDistance(place.coords, nextPlace.coords) : null;

                              return (
                                <React.Fragment key={uniqueId}>
                                  <Draggable draggableId={uniqueId} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`flex items-center gap-2 rounded p-2 transition-all duration-200 ${
                                          snapshot.isDragging
                                            ? 'bg-purple-500/60 shadow-2xl scale-105 rotate-1 ring-2 ring-purple-300 z-50'
                                            : 'bg-white/20 hover:bg-white/30'
                                        }`}
                                        style={{
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                                          <GripVertical size={16} className={`transition-colors ${snapshot.isDragging ? 'text-white' : 'text-white/70'}`} />
                                        </div>
                                        <span className={`w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold transition-all ${
                                          snapshot.isDragging ? 'ring-2 ring-white' : ''
                                        }`}>
                                          {index + 1}
                                        </span>
                                        <span className="flex-1 text-white text-sm">{place.name}</span>
                                        <button
                                          onClick={() => {
                                            const newItinerary = tripItinerary.filter((_, i) => i !== index);
                                            setTripItinerary(newItinerary);
                                          }}
                                          className="p-1 hover:bg-red-500 rounded transition-colors"
                                        >
                                          <X size={14} className="text-white" />
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
                                  {distance && (
                                    <div className="flex items-center justify-center py-1">
                                      <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <div className="h-4 border-l-2 border-dashed border-purple-400"></div>
                                        <span className="bg-purple-500/40 px-2 py-0.5 rounded-full font-semibold">
                                          {formatDistance(distance)}
                                        </span>
                                        <div className="h-4 border-l-2 border-dashed border-purple-400"></div>
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}

                {tripItinerary.length === 0 && (
                  <p className="text-white/70 text-sm italic text-center py-4">
                    No places added yet. Click on any place marker on the map to add it to your trip!
                  </p>
                )}
              </>
            )}

            {/* Day-wise Itinerary Display */}
            {tripMode === "daywise" && (
              <>
                {viewMode === "all" ? (
                  /* Show all days when "All Days" is selected */
                  <div className="space-y-4">
                    {Array.from({ length: numberOfDays }, (_, i) => i + 1).map((day) => {
                      const dayPlaces = dayWiseItinerary[day] || [];
                      const dayColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      const color = dayColors[(day - 1) % dayColors.length];

                      if (dayPlaces.length === 0) return null;

                      return (
                        <div key={day} className="space-y-2 border-l-4 pl-3" style={{ borderColor: color }}>
                          <div className="flex items-center justify-between">
                            <h5 className="text-white font-semibold">
                              Day {day} ({dayPlaces.length} places)
                            </h5>
                            <button
                              onClick={() => {
                                setSelectedDay(day);
                                setViewMode(day);
                              }}
                              className="px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 transition-colors"
                            >
                              View/Edit
                            </button>
                          </div>

                          <div className="space-y-2 bg-white/5 rounded-lg p-2">
                            {dayPlaces.map((place, index) => {
                              const nextPlace = dayPlaces[index + 1];
                              const distance = nextPlace ? calculateDistance(place.coords, nextPlace.coords) : null;

                              return (
                                <React.Fragment key={`${day}-${place.name}-${index}`}>
                                  <div className="flex items-center gap-2 rounded p-2 bg-white/10">
                                    <span
                                      className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold"
                                      style={{ backgroundColor: color }}
                                    >
                                      {index + 1}
                                    </span>
                                    <span className="flex-1 text-white text-sm">{place.name}</span>
                                  </div>
                                  {distance && (
                                    <div className="flex items-center justify-center py-1">
                                      <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <div className="h-4 border-l-2 border-dashed" style={{ borderColor: color }}></div>
                                        <span className="px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${color}66` }}>
                                          {formatDistance(distance)}
                                        </span>
                                        <div className="h-4 border-l-2 border-dashed" style={{ borderColor: color }}></div>
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {Object.values(dayWiseItinerary).every((places) => !places || places.length === 0) && (
                      <p className="text-white/70 text-sm italic text-center py-4">
                        No places added yet. Click on any place marker on the map!
                      </p>
                    )}
                  </div>
                ) : (
                  /* Show only selected day */
                  <>
                    {dayWiseItinerary[selectedDay]?.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-white font-semibold">
                            Day {selectedDay} ({dayWiseItinerary[selectedDay].length} places)
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="text-white/70 text-xs">Drag to reorder</span>
                            <button
                              onClick={() => {
                                setDayWiseItinerary({
                                  ...dayWiseItinerary,
                                  [selectedDay]: [],
                                });
                              }}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              Clear Day
                            </button>
                          </div>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId={`day-${selectedDay}-itinerary`}>
                            {(provided, snapshot) => (
                              <div
                                className={`max-h-60 overflow-y-auto space-y-2 rounded-lg p-2 transition-all ${
                                  snapshot.isDraggingOver ? 'bg-blue-500/20 ring-2 ring-blue-400' : 'bg-transparent'
                                }`}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {dayWiseItinerary[selectedDay].map((place, index) => {
                                  const uniqueId = `day${selectedDay}-${place.name}-${place.coords[0]}-${place.coords[1]}`;
                                  const nextPlace = dayWiseItinerary[selectedDay][index + 1];
                                  const distance = nextPlace ? calculateDistance(place.coords, nextPlace.coords) : null;

                                  return (
                                    <React.Fragment key={uniqueId}>
                                      <Draggable draggableId={uniqueId} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`flex items-center gap-2 rounded p-2 transition-all duration-200 ${
                                              snapshot.isDragging
                                                ? 'bg-blue-500/60 shadow-2xl scale-105 rotate-1 ring-2 ring-blue-300 z-50'
                                                : 'bg-white/20 hover:bg-white/30'
                                            }`}
                                            style={{
                                              ...provided.draggableProps.style,
                                            }}
                                          >
                                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                                              <GripVertical size={16} className={`transition-colors ${snapshot.isDragging ? 'text-white' : 'text-white/70'}`} />
                                            </div>
                                            <span className={`w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold transition-all ${
                                              snapshot.isDragging ? 'ring-2 ring-white' : ''
                                            }`}>
                                              {index + 1}
                                            </span>
                                            <span className="flex-1 text-white text-sm">{place.name}</span>
                                            <button
                                              onClick={() => {
                                                setDayWiseItinerary({
                                                  ...dayWiseItinerary,
                                                  [selectedDay]: dayWiseItinerary[selectedDay].filter((_, i) => i !== index),
                                                });
                                              }}
                                              className="p-1 hover:bg-red-500 rounded transition-colors"
                                            >
                                              <X size={14} className="text-white" />
                                            </button>
                                          </div>
                                        )}
                                      </Draggable>
                                      {distance && (
                                        <div className="flex items-center justify-center py-1">
                                          <div className="flex items-center gap-2 text-white/80 text-xs">
                                            <div className="h-4 border-l-2 border-dashed border-blue-400"></div>
                                            <span className="bg-blue-500/40 px-2 py-0.5 rounded-full font-semibold">
                                              {formatDistance(distance)}
                                            </span>
                                            <div className="h-4 border-l-2 border-dashed border-blue-400"></div>
                                          </div>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>
                    )}

                    {(!dayWiseItinerary[selectedDay] || dayWiseItinerary[selectedDay].length === 0) && (
                      <p className="text-white/70 text-sm italic text-center py-4">
                        No places added to Day {selectedDay} yet. Click on any place marker on the map!
                      </p>
                    )}
                  </>
                )}
              </>
            )}
            </>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Floating Toggle Button for Trip Planner */}
      <button
        onClick={() => setShowTripPlanner(!showTripPlanner)}
        className="fixed z-[9999] bg-purple-600 text-white border-none cursor-pointer shadow-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300"
        style={{
          left: showTripPlanner ? "min(410px, calc(100vw - 100px))" : "20px",
          bottom: "120px",
          borderRadius: "50px",
          padding: "12px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#7c3aed";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#8b5cf6";
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label={showTripPlanner ? "Hide trip planner" : "Show trip planner"}
      >
        {showTripPlanner ? (
          <X size={20} />
        ) : (
          <Calendar size={20} />
        )}
      </button>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        style={{
          position: "absolute",
          top: "90px",
          right: "10px",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          padding: "6px 10px",
          borderRadius: "8px",
          fontSize: "0.9rem",
          cursor: "pointer",
          color: "white",
          transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        aria-label="Recenter map"
      >
        <PawPrint size={20} />
      </button>

      {/* Zoom Level Controls */}
      <div
        className="zoom-controls"
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {zoomLevels.map((level) => (
          <button
            key={level.name}
            onClick={() => handleZoomLevel(level.zoom)}
            className="zoom-level-btn"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              padding: "6px 8px",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
              border: "none",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.15)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            }}
            title={`${level.name} view (zoom ${level.zoom})`}
            aria-label={`Zoom to ${level.name} level`}
          >
            {level.emoji}
          </button>
        ))}
      </div>
      <style jsx>{`
        /* Zoom controls responsive styles */
        @media (max-width: 640px) {
          .zoom-controls {
            right: 5px !important;
            gap: 3px !important;
          }
          .zoom-level-btn {
            padding: 4px 6px !important;
            min-width: 28px !important;
            min-height: 28px !important;
            border-radius: 6px !important;
            font-size: 0.85rem !important;
          }
        }
        @media (max-width: 480px) {
          .zoom-controls {
            right: 3px !important;
            gap: 2px !important;
          }
          .zoom-level-btn {
            padding: 3px 5px !important;
            min-width: 24px !important;
            min-height: 24px !important;
            border-radius: 5px !important;
            font-size: 0.75rem !important;
          }
        }

        /* Leaflet Routing Machine directions panel - mobile responsive */
        @media (max-width: 768px) {
          :global(.leaflet-routing-container) {
            max-width: 250px !important;
            font-size: 0.8rem !important;
          }
          :global(.leaflet-routing-alt) {
            padding: 8px !important;
          }
          :global(.leaflet-routing-alt table) {
            font-size: 0.75rem !important;
          }
        }
        @media (max-width: 480px) {
          :global(.leaflet-routing-container) {
            max-width: 200px !important;
            font-size: 0.7rem !important;
          }
          :global(.leaflet-routing-alt) {
            padding: 6px !important;
          }
          :global(.leaflet-routing-alt table) {
            font-size: 0.65rem !important;
          }
          :global(.leaflet-routing-geocoder) {
            display: none !important;
          }
        }
      `}</style>

      {/* Legend/Search Panel */}
      {markers.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "160px",
            right: "20px",
            zIndex: 1000,
            width: legendOpen ? "250px" : "auto",
          }}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setLegendOpen(!legendOpen)}
            className='bg-white/30 backdrop-blur-md'
            style={{
              position: "absolute",
              color: "black",
              right: "6px",
              border: "none",
              padding: "6px 10px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              marginBottom: "8px",
            }}
          >
            {legendOpen ? "-" : "+"}
          </button>
          
          {legendOpen && (
            <div
              style={{
                maxHeight: "180px",
                overflowY: "auto",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "50px",
                padding: "10px 12px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h4 style={{ marginBottom: "8px", fontSize: "0.95rem" }}>
                <strong>📍 Map Locations</strong>
                {activeCategories.length > 0 && (
                  <span style={{ marginLeft: "8px", fontSize: "0.85rem", color: "#555" }}>
                    ({filteredMarkerCount})
                  </span>
                )}
              </h4>
              
              {/* Search */}
              <input
                type="text"
                placeholder="Search location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(null);
                }}
                onKeyDown={onKeyDown}
                style={{
                  width: "100%",
                  padding: "5px 8px",
                  marginBottom: "10px",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  outline: "none",
                }}
                aria-label="Search map locations"
              />
              
              {filteredMarkers.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#888", margin: "0.5rem 0" }}>
                  No results found
                </p>
              ) : (
                <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
                  {[...new Map(filteredMarkers.map(m => [m.name, m])).values()].map((m, index) => {
                    const originalIndex = markers.findIndex((mm) => mm.name === m.name);
                    const isSelected = selectedMarkerIndex === originalIndex;
                    const isHighlighted = highlightedIndex === index;
                    const markerCategories = normalizeCategories(m.categories || m.category);
                    const primaryEmoji = CATEGORY_EMOJIS[markerCategories[0]] || "📍";
                    
                    return (
                      <li key={originalIndex} style={{ marginBottom: "6px" }}>
                        <button
                          onClick={() => focusOnMarker(originalIndex)}
                          style={{
                            background: isSelected
                              ? "#1e40af"
                              : isHighlighted
                              ? "#dbeafe"
                              : "#f1f5f9",
                            color: isSelected ? "white" : "black",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.88rem",
                            width: "100%",
                            textAlign: "left",
                            transition: "background 0.3s, color 0.3s",
                          }}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onMouseLeave={() => setHighlightedIndex(null)}
                        >
                          <span>{primaryEmoji}</span>{" "}
                          {highlightText(m.name, debouncedSearchTerm)}
                          {markerCategories.length > 1 && (
                            <span style={{ 
                              fontSize: "0.7rem", 
                              color: isSelected ? "#e5e7eb" : "#666", 
                              marginLeft: "4px" 
                            }}>
                              ({markerCategories.length} categories)
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Performance Warning Modal */}
      {showPerformanceWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px",
            animation: "cityMapFadeIn 0.2s ease-out",
          }}
          onClick={handleCancelShowAllMarkers}
        >
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              position: "relative",
              animation: "cityMapSlideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 20px",
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                animation: "cityMapPulse 2s ease-in-out infinite",
              }}
            >
              ⚠️
            </div>

            {/* Title */}
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#fbbf24",
                textAlign: "center",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Performance Warning
            </h3>

            {/* Message */}
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "1rem",
                color: "#e2e8f0",
                textAlign: "center",
                lineHeight: "1.6",
              }}
            >
              You are about to display{" "}
              <strong
                style={{
                  color: "#fbbf24",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {markers.length.toLocaleString()}
              </strong>{" "}
              markers on the map without any category filter.
              <br />
              <br />
              This might cause performance issues and slow down your browser.
            </p>

            {/* Suggestion */}
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "#93c5fd",
                  textAlign: "center",
                }}
              >
                💡 <strong>Tip:</strong> Try selecting specific categories from
                the filter bar to improve performance
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={handleCancelShowAllMarkers}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "2px solid rgba(148, 163, 184, 0.3)",
                  background: "rgba(51, 65, 85, 0.5)",
                  color: "#cbd5e1",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: '"Playfair Display", serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(51, 65, 85, 0.8)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(51, 65, 85, 0.5)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                ← Go Back
              </button>

              <button
                onClick={handleConfirmShowAllMarkers}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
                  fontFamily: '"Playfair Display", serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.4)";
                }}
              >
                Show Anyway →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}