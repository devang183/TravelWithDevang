"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { PawPrint, Navigation, X } from "lucide-react";
import Fuse from "fuse.js";
import CityMapCategoryBar from "./CityMapCategoryBar";

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
  paddypower: "🟩",
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

  // Fetch data from MongoDB
  useEffect(() => {
    const fetchPins = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pins/${cityId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pins: ${response.statusText}`);
        }
        
        const pinsData = await response.json();
        setMarkers(pinsData);
      } catch (err) {
        console.error('Error fetching pins:', err);
        setError(err.message);
        setMarkers([]);
      } finally {
        setLoading(false);
      }
    };

    if (cityId) {
      fetchPins();
    }
  }, [cityId]);


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
        const map = L.map(mapRef.current).setView(coords, zoom);
        mapInstance.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const newMarkerRefs = [];
        
        markers.forEach(({ url, coords, name, description, categories, category, videoId }, index) => {
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
            ${normalizedCategories.length > 1 ? 
              `<p style="font-size:0.75em; color: #666;">Categories: ${normalizedCategories.join(', ')}</p>` : ''}
            ${videoEmbed}
            <a href="${url}" target="_blank" style="
              display:inline-block;margin-top:8px;padding:4px 8px;font-weight:bold;
              color:white;background:#1e40af;border-radius:6px;text-decoration:none;
            ">More info</a>
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

  // Modified function to handle multiple categories
  function addMarkersInView() {
    const map = mapInstance.current;
    if (!map) return;
  
    const bounds = map.getBounds();
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
  }

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    addMarkersInView();
    map.on("moveend", addMarkersInView);

    return () => {
      map.off("moveend", addMarkersInView);
    };
  }, [selectedMarkerIndex, activeCategories, markersVisible, markers]);

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
      iconUrl: '/images/mapicons/start.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
    
    const endIcon = L.icon({
      iconUrl: '/images/mapicons/end.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const newRoutingControl = LRM.control({
      waypoints: [
        L.latLng(startMarker.coords[0], startMarker.coords[1]),
        L.latLng(endMarker.coords[0], endMarker.coords[1])
      ],
      routeWhileDragging: true,
      addWaypoints: false,
      createMarker: function() { return null; },
      lineOptions: {
        styles: [{ color: '#0C84ED', weight: 8, opacity: 0.7 }]
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: transportMode
      })
    }).on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      const distance = (summary.totalDistance / 1000).toFixed(2);
      let duration = summary.totalTime;
      let hours = Math.floor(duration / 3600);
      let minutes = Math.floor((duration % 3600) / 60);
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
      case 'paddypower':
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
      // case 'underground':
      //   return 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/underground.png'
      // default:
      //   return "https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/cricket.png";
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

  const highlightText = (text="", highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: "#fffb91" }}>
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

  // const categoryEmojis = {
  //   fishandchips: "🐟",
  //   racecourse: "🏇",
  //   park: "🌳",
  //   pint: "🍺",
  //   bakerloo: "🚇",
  //   atm:'🏧',
  //   historic: "🏰",
  //   museum: "🖼️",
  //   beach: "🏖️",
  //   cafe: "☕",
  //   restaurant: "🍽️",
  //   viewpoint: "🔭",
  //   college: '🎓',
  //   church: '⛪',
  //   art: '🎨',
  //   cricket:'🏏',
  //   bookstore:'📚',
  //   grocery:'🛒',
  //   hospital: '🩺',
  //   paddypower:'🟩',
  //   pharmacy:'💊',
  //   Red: '🔴',
  //   Green: '🟢',
  //   icecream:'🍦',
  //   womenbeauty:'💇‍♀️',
  //   leisure:'🎭',
  //   retailshops: '🛍️',
  //   hospitality:'🏨',
  //   health:'🏥',
  //   police:'👮',
  //   dentist:'🦷',
  //   fuelgas:'⛽',
  //   // underground: '🚇'
  // };


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
      
      {/* Routing Controls */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "15px",
        padding: "15px",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
        zIndex: 50,
        fontFamily: '"Playfair Display", serif'
      }}>
        <h4 style={{ margin: 0, color: "#ffffff" }} className="text-3xl font-bold text-center p-2 ">
          <Navigation size={16} style={{ marginRight: "5px", verticalAlign: "middle" }} />
          Route Planner
        </h4>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", color:"white"}}>
          <div style={{ flex: 1, minWidth: "150px", position: "relative" }}>
            <label style={{ fontSize: "0.9rem", marginBottom: "5px", display: "block" }}>From:</label>
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
                fontSize: "0.9rem"
              }}
              className="focus:outline-none"
            />
            {showStartResults && startSearchResults.length > 0 && (
              <div style={{
                top: "100%",
                left: 0,
                right: 0,
                borderTop: "none",
                borderRadius: "0 0 6px 6px",
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color:"black",
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
                        fontSize: "0.9rem",
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
          
          <div style={{ flex: 1, minWidth: "150px", position: "relative" }}>
            <label style={{ fontSize: "0.9rem", marginBottom: "5px", display: "block" }}>To:</label>
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
                fontSize: "0.9rem",
              }}
            />
            {showEndResults && endSearchResults.length > 0 && (
              <div style={{
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderTop: "none",
                borderRadius: "0 0 6px 6px",
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 1000,
                color:"black",
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
                        fontSize: "0.9rem",
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
        
        <div className="mb-3">
          <label className="block text-white mb-1">Travel Mode</label>
          <select
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
            className="w-full p-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none"
          >
            <option value="driving">🚗 Driving</option>
            <option value="foot">🚶 Walking</option>
            <option value="bike">🚴 Cycling</option>
          </select>
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={showRoute}
            disabled={!startPoint || !endPoint}
            style={{
              padding: "8px 16px",
              backgroundColor: (!startPoint || !endPoint) ? "#ccc" : "#1e40af",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: (!startPoint || !endPoint) ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            Show Route
          </button>
          
          {showRouting && (
            <button
              onClick={clearRoute}
              style={{
                padding: "8px 16px",
                backgroundColor: "#27ADF5",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <X size={14} />
              Clear Route
            </button>
          )}
          
          {routeDistance && routeTime && (
            <div style={{
              padding: "8px 12px",
              backgroundColor: "#10b981",
              color: "white",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "bold"
            }}>
              Distance: {routeDistance} km | Time: {routeTime}
            </div>
          )}
        </div>
      </div>

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