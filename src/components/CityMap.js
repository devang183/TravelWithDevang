"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { PawPrint, Navigation, X, Calendar, MapPin, Plus, Trash2, Download, FileText } from "lucide-react";
import Fuse from "fuse.js";
import CityMapCategoryBar from "./CityMapCategoryBar";
import { useQuery } from '@tanstack/react-query';

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
  grocery: "🛒",
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
  
  // Search states for routing
  const [startSearchTerm, setStartSearchTerm] = useState("");
  const [endSearchTerm, setEndSearchTerm] = useState("");
  const [startSearchResults, setStartSearchResults] = useState([]);
  const [endSearchResults, setEndSearchResults] = useState([]);
  const [showStartResults, setShowStartResults] = useState(false);
  const [showEndResults, setShowEndResults] = useState(false);
  const [startHighlighted, setStartHighlighted] = useState(-1);
  const [endHighlighted, setEndHighlighted] = useState(-1);

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
        
          // Add event listeners when popup opens
          marker.on("popupopen", () => {
            const popupEl = marker.getPopup().getElement();
            popupEl.querySelector(".set-source-btn").onclick = () => {
              setStartPoint(name);
              setStartSearchTerm(name);
            };
            popupEl.querySelector(".set-dest-btn").onclick = () => {
              setEndPoint(name);
              setEndSearchTerm(name);
            };
            popupEl.querySelector(".add-to-trip-btn").onclick = () => {
              const placeData = markers[index];
              const currentMode = tripModeRef.current;
              const currentDay = selectedDayRef.current;

              if (currentMode === "single") {
                setTripItinerary(prev => {
                  // Check if place already exists
                  if (prev.some(p => p.name === placeData.name)) {
                    return prev;
                  }
                  return [...prev, placeData];
                });
              } else {
                // Day-wise mode
                setDayWiseItinerary(prev => {
                  const currentDayPlaces = prev[currentDay] || [];
                  // Check if place already exists in the current day
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
          }
        } else {
          if (map.hasLayer(marker)) map.removeLayer(marker);
        }
      });
    } finally {
      isUpdatingMarkers.current = false;
    }
  }, [selectedMarkerIndex, activeCategories, markersVisible, markers]);

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
      } else {
        // Day-wise itinerary mode
        const dayColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        Object.entries(dayWiseItinerary).forEach(([day, places]) => {
          if (!places || places.length === 0) return;

          const dayNum = parseInt(day);
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
          }
        });
      }

      setTripPolylines(newPolylines);
      setTripMarkersRefs(newTripMarkers);
    };

    drawTripRoute();
  }, [tripItinerary, dayWiseItinerary, tripMode]);

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
          const splitDesc = doc.splitTextToSize(place.description, pageWidth - margin * 2 - 10);
          doc.text(splitDesc, margin + 10, yPos);
          yPos += splitDesc.length * 5 + 5;
        } else {
          yPos += 5;
        }
      });

      // Total places
      yPos += 5;
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text(`Total Places: ${tripItinerary.length}`, margin, yPos);
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
              const splitDesc = doc.splitTextToSize(place.description, pageWidth - margin * 2 - 15);
              doc.text(splitDesc, margin + 15, yPos);
              yPos += splitDesc.length * 5 + 3;
            } else {
              yPos += 3;
            }
          });

          yPos += 3;
          doc.setFont(undefined, 'italic');
          doc.setFontSize(9);
          doc.text(`Day ${day} - ${places.length} place(s)`, margin + 10, yPos);
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
      const routes = e.routes;
      const summary = routes[0].summary;
      const distance = (summary.totalDistance / 1000).toFixed(2);
      let duration = summary.totalTime;
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
    }).addTo(mapInstance.current);

    setRoutingControl(newRoutingControl);
    setShowRouting(true);

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
      case 'grocery':
        return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/grocery.svg'
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
        onToggleMarkersVisibility={() => setMarkersVisible(!markersVisible)}
        loading={loading}
      />
      
      {/* Map */}
      <div
        ref={mapRef}
        style={{
          height: "600px",
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
            <h5 style={{ margin: 0, color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
              <Navigation size={20} />
              Route Planner
            </h5>

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
            </div>
          </div>

          {/* Trip Planner Section */}
          {(
          <div className="bg-white/10 rounded-lg p-4 space-y-4">
            <h5 style={{ margin: 0, color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Calendar size={20} />
              Trip Planner
            </h5>

            {/* Mode Selection */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setTripMode("single");
                  setDayWiseItinerary({});
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  tripMode === "single"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Single Day Trip
              </button>
              <button
                onClick={() => {
                  setTripMode("daywise");
                  setTripItinerary([]);
                  // Initialize empty days
                  const initDays = {};
                  for (let i = 1; i <= numberOfDays; i++) {
                    initDays[i] = [];
                  }
                  setDayWiseItinerary(initDays);
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  tripMode === "daywise"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Multi-Day Trip
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
                        if (selectedDay > num) setSelectedDay(1);
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
                  {Array.from({ length: numberOfDays }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                        selectedDay === day
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
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {tripItinerary.map((place, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white/20 rounded p-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
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
                      ))}
                    </div>
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
                {dayWiseItinerary[selectedDay]?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-white font-semibold">
                        Day {selectedDay} ({dayWiseItinerary[selectedDay].length} places)
                      </h5>
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

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {dayWiseItinerary[selectedDay].map((place, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white/20 rounded p-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
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
                      ))}
                    </div>
                  </div>
                )}

                {(!dayWiseItinerary[selectedDay] || dayWiseItinerary[selectedDay].length === 0) && (
                  <p className="text-white/70 text-sm italic text-center py-4">
                    No places added to Day {selectedDay} yet. Click on any place marker on the map!
                  </p>
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
        style={{
          position: "fixed",
          left: showTripPlanner ? "410px" : "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9999,
          backgroundColor: "#8b5cf6",
          color: "white",
          border: "none",
          borderRadius: showTripPlanner ? "0 50px 50px 0" : "50px",
          padding: showTripPlanner ? "12px 16px 12px 8px" : "12px 16px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: "600",
          fontSize: "0.9rem"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#7c3aed";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#8b5cf6";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
        aria-label={showTripPlanner ? "Hide trip planner" : "Show trip planner"}
      >
        {showTripPlanner ? (
          <>
            <X size={18} />
            <span>Hide</span>
          </>
        ) : (
          <>
            <Calendar size={18} />
            <span>Plan Trip</span>
          </>
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
    </div>
  );
}