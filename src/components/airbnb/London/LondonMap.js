'use client';
import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Papa from "papaparse";
import 'leaflet/dist/leaflet.css';
import { neighbourhoodList } from "@/components/airbnb/London/neighbourhoodList";
import { cities } from "@/components/citycoord";


const roomTypes = ["Private room", "Entire home/apt", "Shared room", "Hotel room"];

// Custom icons for different property types
const createCustomIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const propertyIcons = {
  "Entire home/apt": createCustomIcon('#e74c3c'),
  "Private room": createCustomIcon('#3498db'), 
  "Shared room": createCustomIcon('#f39c12'),
  "Hotel room": createCustomIcon('#9b59b6'),
  default: createCustomIcon('#95a5a6')
};

// Overpass query to get safety amenities
const overpassSafetyQuery = (lat, lng) => `
[out:json];
(
  node["amenity"="police"](around:1000,${lat},${lng});
  node["highway"="street_lamp"](around:500,${lat},${lng});
  node["highway"="bus_stop"](around:500,${lat},${lng}); 
  node["railway"="station"](around:500,${lat},${lng}); 
);
out;
`;

// Overpass query for livability (counts amenities)
const overpassLivabilityQuery = (lat, lng) => `
[out:json];
(
  node["amenity"](around:500,${lat},${lng});
  node["shop"](around:500,${lat},${lng});
  node["leisure"](around:500,${lat},${lng});
);
out;
`;

// Fetch safety data
async function getSafetyScore(lat, lng) {
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassSafetyQuery(lat, lng),
    });
    const json = await response.json();
    const polices = json.elements.filter(e => e.tags?.amenity === "police")
    const policeCount = polices.length;
    const policeNames = polices.map(b => b.tags.name).filter(Boolean).slice(0, 5);
    const lampCount = json.elements.filter(e => e.tags?.highway === "street_lamp").length;
    const busStops = json.elements.filter(e => e.tags?.highway === "bus_stop");
    const busStopCount = busStops.length;
    const busStopNames = busStops.map(b => b.tags.name).filter(Boolean).slice(0, 5);
    const stations = json.elements.filter(e => e.tags?.railway === "station");
    const railwayStationCount = stations.length;
    const railwayStationNames = stations.map(s => s.tags.name).filter(Boolean).slice(0, 5);
    const score = policeCount * 2 + lampCount * 0.1;
    return { policeCount, policeNames, lampCount, busStopCount, busStopNames, railwayStationCount, railwayStationNames, score };
  } catch (error) {
    console.error('Error fetching safety data:', error);
    return null;
  }
}

// Fetch livability score
async function getLivabilityScore(lat, lng) {
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassLivabilityQuery(lat, lng),
    });
    const json = await response.json();
    const elements = json.elements || [];
    const weights = {
      police: 2,
      hospital: 2,
      school: 2,
      park: 2,
      supermarket: 3,
      bus_stop: 0.5,
      atm: 2,
      pub: 2,
      pharmacy: 3,
      cafe: 1,
      restaurant: 2,
      playground: 1,
      library: 2,
      bank: 2,
      clinic: 3,
      gym: 1,
    };
    let score = 0;
    elements.forEach(el => {
      const t = el.tags;
      if (!t) return;
      if (t.amenity === "police") score += weights.police;
      if (t.amenity === "hospital") score += weights.hospital;
      if (t.amenity === "school") score += weights.school;
      if (t.leisure === "park") score += weights.park;
      if (t.shop === "supermarket") score += weights.supermarket;
      if (t.highway === "bus_stop") score += weights.bus_stop;
      if (t.amenity === "atm") score += weights.atm;
      if (t.amenity === "pub") score += weights.pub;
      if (t.amenity === "pharmacy") score += weights.pharmacy;
      if (t.amenity === "cafe") score += weights.cafe;
      if (t.amenity === "restaurant") score += weights.restaurant;
      if (t.amenity === "playground") score += weights.playground;
      if (t.amenity === "library") score += weights.library;
      if (t.amenity === "bank") score += weights.bank;
      if (t.amenity === "clinic") score += weights.clinic;
      if (t.amenity === "gym") score += weights.gym;
    });
    return Math.round(score * 10) / 10; // round to 1 decimal
  } catch (error) {
    console.error('Error fetching livability data:', error);
    return null;
  }
}

// Hook to get visible bounds and handle map events
function useMapBounds() {
  const map = useMap();
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
    },
    zoomend: () => {
      setBounds(map.getBounds());
      setZoom(map.getZoom());
    },
  });

  useEffect(() => {
    setBounds(map.getBounds());
  }, [map]);

  return { bounds, zoom };
}

// Component to handle lazy loading of markers
function LazyMarkers({ listings, onMarkerClick, safetyData, livabilityData }) {
  const { bounds, zoom } = useMapBounds();
  
  // Filter listings based on visible bounds with buffer
  const visibleListings = useMemo(() => {
    if (!bounds || !listings.length) return [];
    
    // Add buffer based on zoom level (more buffer at lower zoom levels)
    const bufferFactor = Math.max(0.01, 0.1 / Math.pow(2, zoom - 10));
    
    const north = bounds.getNorth() + bufferFactor;
    const south = bounds.getSouth() - bufferFactor;
    const east = bounds.getEast() + bufferFactor;
    const west = bounds.getWest() - bufferFactor;
    
    return listings.filter(listing => 
      listing.lat >= south && 
      listing.lat <= north && 
      listing.lng >= west && 
      listing.lng <= east
    );
  }, [bounds, listings, zoom]);

  // Limit markers based on zoom level to prevent overcrowding
  const maxMarkers = useMemo(() => {
    if (zoom >= 15) return 500;
    if (zoom >= 13) return 200;
    if (zoom >= 11) return 100;
    return 50;
  }, [zoom]);

  const renderableListings = useMemo(() => {
    return visibleListings.slice(0, maxMarkers);
  }, [visibleListings, maxMarkers]);

  return (
    <>
      {renderableListings.map((listing) => {
        const icon = propertyIcons[listing.room_type] || propertyIcons.default;
        const safety = safetyData[listing.id];
        const livability = livabilityData[listing.id];
        
        return (
          <Marker 
            key={listing.id} 
            position={[listing.lat, listing.lng]} 
            icon={icon}
            eventHandlers={{
              click: () => {
                onMarkerClick(listing);
              },
            }}
          >
            <Popup maxWidth={350} maxHeight={400}>
              <div style={{ minWidth: '320px', maxHeight: '380px', overflowY: 'auto' }}>
                {/* Host Information */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <img 
                    src={listing.host_picture_url} 
                    alt={`${listing.host_name}'s profile`} 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      border: '2px solid #ec4899',
                      marginRight: '12px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/images/default-avatar.png';
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>Host: {listing.host_name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Host since: {listing.host_since}</div>
                  </div>
                </div>
                {/* Basic Property Info */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{listing.name}</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    <b>Price:</b> €{listing.price}<br/>
                    <b>Accommodates:</b> {listing.accommodates}<br/>
                    <b>Bedrooms:</b> {listing.bedrooms}<br/>
                    <b>Bathrooms:</b> {listing.bathrooms}<br/>
                    <b>Property Type:</b> {listing.property_type}<br/>
                    <b>Neighbourhood:</b> {listing.host_neighbourhood}<br/>
                    <b>Host Neighbourhood:</b> {listing.neighbourhood_cleansed}<br/>
                    <b>Number of Reviews:</b> {listing.number_of_reviews}<br/>
                    <b>Reviews per Month:</b> {listing.reviews_per_month}<br/>
                    <b>Host Response Time:</b> {listing.host_response_time}<br/>
                    <b>URL: </b>
                    <a 
                      href={listing.listing_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'underline' }}
                    >
                      View Listing
                    </a>
                  </div>
                </div>
                {/* Safety Information */}
                {safety ? (
                  <div style={{ fontSize: '12px', marginBottom: '12px', color: '#374151' }}>
                    <div><b>Police Stations Nearby:</b> {safety.policeCount}</div>
                    {safety.policeNames.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontWeight: 'bold' }}>Police Stations Names:</div>
                        <ul style={{ listStyle: 'disc', paddingLeft: '16px', maxHeight: '60px', overflowY: 'auto' }}>
                          {safety.policeNames.map((name, i) => <li key={i}>{name}</li>)}
                        </ul>
                      </div>
                    )}
                    <div><b>Streetlights Nearby:</b> {safety.lampCount}</div>
                    <div><b>Bus Stops Nearby:</b> {safety.busStopCount}</div>
                    {safety.busStopNames.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontWeight: 'bold' }}>Bus Stops Names:</div>
                        <ul style={{ listStyle: 'disc', paddingLeft: '16px', maxHeight: '60px', overflowY: 'auto' }}>
                          {safety.busStopNames.map((name, i) => <li key={i}>{name}</li>)}
                        </ul>
                      </div>
                    )}
                    {safety.railwayStationCount > 0 && (
                      <div>
                        <div><b>Railway Stations Nearby:</b> {safety.railwayStationCount}</div>
                        <div style={{ fontWeight: 'bold', marginTop: '4px' }}>Railway Stations Names:</div>
                        <ul style={{ listStyle: 'disc', paddingLeft: '16px', maxHeight: '60px', overflowY: 'auto' }}>
                          {safety.railwayStationNames.map((name, i) => <li key={i}>{name}</li>)}
                        </ul>
                      </div>
                    )}
                    <div 
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        color: 'white',
                        backgroundColor: safety.score > 5 ? '#10b981' : safety.score > 2 ? '#3b82f6' : '#000000',
                        fontWeight: 'bold',
                        marginTop: '8px'
                      }}
                    >
                      🛡️ {safety.score > 5 ? 'High Safety' : safety.score > 2 ? 'Medium Safety' : 'Low Safety'}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '8px' }}>
                    Loading safety data...
                  </div>
                )}
                {/* Livability Information */}
                {livability != null ? (
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>
                    🏘️ <b>Livability Score:</b> {livability}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', fontStyle: 'italic' }}>
                    Loading livability data...
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// Component to handle map updates
function MapUpdater({ listings, selectedListing }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedListing) {
      // Fly to the selected listing with smooth animation
      map.flyTo([selectedListing.lat, selectedListing.lng], 16, {
        animate: true,
        duration: 1.5
      });
    } else if (listings.length > 0) {
      const group = new L.featureGroup(
        listings.slice(0, 100).map(listing => L.marker([listing.lat, listing.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [listings, selectedListing, map]);
  
  return null;
}

// Filter Panel Component
function FilterPanel({ onApplyFilters }) {
  const [hostIsSuperhost, setHostIsSuperhost] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [roomType, setRoomType] = useState('');
  const [accommodatesMin, setAccommodatesMin] = useState('');
  const [accommodatesMax, setAccommodatesMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Neighborhood search states
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const [focusedNeighborhoodIndex, setFocusedNeighborhoodIndex] = useState(-1);
  
  const neighborhoodSearchRef = useRef(null);
  const neighborhoodDropdownRef = useRef(null);
  
  // Filter neighborhoods based on search
  const filteredNeighborhoods = neighbourhoodList.filter(n => 
    n.toLowerCase().includes(neighborhoodSearch.toLowerCase()) &&
    !neighborhoods.includes(n)
  );
  
  function applyFilters() {
    onApplyFilters({
      host_is_superhost: hostIsSuperhost,
      neighbourhood_cleansed: neighborhoods,
      room_type: roomType,
      accommodatesMin: accommodatesMin ? Number(accommodatesMin) : null,
      accommodatesMax: accommodatesMax ? Number(accommodatesMax) : null,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
    });
  }
  
  function clearFilters() {
    setHostIsSuperhost(null);
    setNeighborhoods([]);
    setRoomType('');
    setAccommodatesMin('');
    setAccommodatesMax('');
    setPriceMin('');
    setPriceMax('');
    setNeighborhoodSearch('');
    setShowNeighborhoodDropdown(false);
    setFocusedNeighborhoodIndex(-1);
    onApplyFilters({
      host_is_superhost: null,
      neighbourhood_cleansed: [],
      room_type: '',
      accommodatesMin: null,
      accommodatesMax: null,
      priceMin: null,
      priceMax: null,
    });
  }
  
  function onNeighborhoodChange(e) {
    const { value, checked } = e.target;
    if (checked) {
      setNeighborhoods(prev => [...prev, value]);
    } else {
      setNeighborhoods(prev => prev.filter(n => n !== value));
    }
  }
  
  // Add neighborhood from search
  const addNeighborhood = (neighborhood) => {
    if (!neighborhoods.includes(neighborhood)) {
      setNeighborhoods(prev => [...prev, neighborhood]);
    }
    setNeighborhoodSearch('');
    setShowNeighborhoodDropdown(false);
    setFocusedNeighborhoodIndex(-1);
  };
  
  // Remove neighborhood tag
  const removeNeighborhood = (neighborhood) => {
    setNeighborhoods(prev => prev.filter(n => n !== neighborhood));
  };
  
  //   const handleStartKeyDown = (e) => {
//     if (!showStartResults || startSearchResults.length === 0) return;
    
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setStartHighlighted(prev => 
//         prev < startSearchResults.length - 1 ? prev + 1 : 0
//       );
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setStartHighlighted(prev => 
//         prev > 0 ? prev - 1 : startSearchResults.length - 1
//       );

  // Handle neighborhood search keyboard events
  const handleNeighborhoodSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredNeighborhoods.length > 0) {
        setShowNeighborhoodDropdown(true);
        setFocusedNeighborhoodIndex(prev =>
          prev<filteredNeighborhoods.length-1?prev+1:0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if(showNeighborhoodDropdown && focusedNeighborhoodIndex<=0){
        setFocusedNeighborhoodIndex(filteredNeighborhoods.length-1);
        // searchInputRef.current?.focus();
      }else{
        setFocusedNeighborhoodIndex(prev=>prev-1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedNeighborhoodIndex >= 0 && filteredNeighborhoods[focusedNeighborhoodIndex]) {
        addNeighborhood(filteredNeighborhoods[focusedNeighborhoodIndex]);
      } else if (filteredNeighborhoods.length === 1) {
        addNeighborhood(filteredNeighborhoods[0]);
      }
    } else if (e.key === 'Escape') {
      setShowNeighborhoodDropdown(false);
      setFocusedNeighborhoodIndex(-1);
    }
  };
  
  // Handle neighborhood search change
  const handleNeighborhoodSearchChange = (e) => {
    const value = e.target.value;
    setNeighborhoodSearch(value);
    setShowNeighborhoodDropdown(value.length > 0 && filteredNeighborhoods.length > 0);
    setFocusedNeighborhoodIndex(-1);
  };
  
  // Global keyboard handler for neighborhood dropdown navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (showNeighborhoodDropdown && document.activeElement === neighborhoodSearchRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedNeighborhoodIndex(prev => 
            prev < filteredNeighborhoods.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedNeighborhoodIndex(prev => prev > 0 ? prev - 1 : -1);
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showNeighborhoodDropdown, filteredNeighborhoods, focusedNeighborhoodIndex]);
  
  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 bg-white/10 backdrop-blur-md border rounded-lg shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
        <div className={`space-y-3 ${!isExpanded ? 'hidden' : ''}`}>
          {/* Superhost Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Superhost:</label>
            <select
              value={hostIsSuperhost === null ? '' : hostIsSuperhost ? 'true' : 'false'}
              onChange={e => {
                const val = e.target.value;
                if (val === '') setHostIsSuperhost(null);
                else setHostIsSuperhost(val === 'true');
              }}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          {/* Neighborhood Filter - Searchable */}
          <div>
            <label className="block text-sm font-medium mb-1">Neighborhoods:</label>
            
            {/* Selected neighborhoods as tags */}
            {neighborhoods.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {neighborhoods.map((neighborhood) => (
                  <span
                    key={neighborhood}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {neighborhood}
                    <button
                      onClick={() => removeNeighborhood(neighborhood)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800"
                      aria-label={`Remove ${neighborhood}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Search input */}
            <div className="relative">
              <input
                ref={neighborhoodSearchRef}
                type="text"
                placeholder="Search neighborhoods..."
                value={neighborhoodSearch}
                onChange={handleNeighborhoodSearchChange}
                onKeyDown={handleNeighborhoodSearchKeyDown}
                onFocus={() => neighborhoodSearch && filteredNeighborhoods.length > 0 && setShowNeighborhoodDropdown(true)}
                onBlur={(e) => {
                  if (!neighborhoodDropdownRef.current?.contains(e.relatedTarget)) {
                    setTimeout(() => {
                      setShowNeighborhoodDropdown(false);
                      setFocusedNeighborhoodIndex(-1);
                    }, 150);
                  }
                }}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                aria-label="Search for neighborhoods"
                aria-expanded={showNeighborhoodDropdown && filteredNeighborhoods.length > 0}
                aria-haspopup="listbox"
                aria-activedescendant={focusedNeighborhoodIndex >= 0 ? `neighborhood-${focusedNeighborhoodIndex}` : undefined}
                role="combobox"
                autoComplete="off"
              />
              
              {/* Dropdown */}
              {showNeighborhoodDropdown && neighborhoodSearch && filteredNeighborhoods.length > 0 && (
                <ul 
                  ref={neighborhoodDropdownRef}
                  className="absolute z-50 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-40 overflow-y-auto mt-1"
                  role="listbox"
                  aria-label="Neighborhood search results"
                >
                  {filteredNeighborhoods.map((neighborhood, index) => (
                    <li
                      key={neighborhood}
                      id={`neighborhood-${index}`}
                      ref={(el) => {
                        if (focusedNeighborhoodIndex === index && el) {
                          el.scrollIntoView({ block: "nearest" });
                        }
                      }}
                      onClick={() => addNeighborhood(neighborhood)}
                      onMouseEnter={() => setFocusedNeighborhoodIndex(index)}
                      className={`px-3 py-2 cursor-pointer text-sm ${
                        focusedNeighborhoodIndex === index 
                          ? 'bg-blue-500 text-white' 
                          : 'hover:bg-blue-50'
                      }`}
                      role="option"
                      aria-selected={focusedNeighborhoodIndex === index}
                      tabIndex={-1}
                    >
                      {neighborhood}
                    </li>
                  ))}
                </ul>
              )}
              
              {/* No results message */}
              {neighborhoodSearch && filteredNeighborhoods.length === 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-b shadow-lg p-3 mt-1 text-sm text-gray-500">
                  No neighborhoods found matching {neighborhoodSearch}
                </div>
              )}
            </div>
            
            {neighborhoods.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                {neighborhoods.length} neighborhood{neighborhoods.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          
          {/* Room Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Room Type:</label>
            <select
              value={roomType}
              onChange={e => setRoomType(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Any</option>
              {roomTypes.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          {/* Accommodates Filter */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Min Guests:</label>
              <input
                type="number"
                min={1}
                value={accommodatesMin}
                onChange={e => setAccommodatesMin(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Max Guests:</label>
              <input
                type="number"
                min={1}
                value={accommodatesMax}
                onChange={e => setAccommodatesMax(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Any"
              />
            </div>
          </div>
          
          {/* Price Filter */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Min Price (€):</label>
              <input
                type="number"
                min={0}
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Max Price (€):</label>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Any"
              />
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={applyFilters}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition focus:ring-2 focus:ring-gray-400 focus:outline-none"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function LondonMap() {
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [safetyData, setSafetyData] = useState({});
  const [livabilityData, setLivabilityData] = useState({});

  // Load CSV data
//   useEffect(() => {
//     setLoading(true);
//     Papa.parse('/london_airbnb_cleaned.csv', {
//       download: true,
//       header: true,
//       complete: (result) => {
//         try {
//           const cleaned = result.data
//             .filter(r => r.latitude && r.longitude && r.latitude !== '' && r.longitude !== '')
//             .map(r => ({
//               ...r,
//               lat: parseFloat(r.latitude),
//               lng: parseFloat(r.longitude),
//               accommodates: Number(r.accommodates) || 1,
//               bathrooms: Number(r.bathrooms) || 0,
//               bedrooms: Number(r.bedrooms) || 0,
//               host_is_superhost: r.host_is_superhost === 't' || r.host_is_superhost === 'true',
//               neighbourhood_cleansed: r.neighbourhood_cleansed || 'Unknown',
//               room_type: r.room_type || 'Unknown',
//               price: r.price ? parseFloat(r.price.toString().replace(/[€$,]/g, '')) : 0,
//               id: r.id || Math.random().toString(36),
//               name: r.name || 'Unnamed Property',
//               host_name: r.host_name || 'Unknown Host',
//               host_since: r.host_since || 'Unknown',
//               host_picture_url: r.host_picture_url || '/images/default-avatar.png',
//               host_neighbourhood: r.host_neighbourhood || 'Unknown',
//               property_type: r.property_type || 'Unknown',
//               number_of_reviews: r.number_of_reviews || 0,
//               reviews_per_month: r.reviews_per_month || 0,
//               host_response_time: r.host_response_time || 'Unknown',
//               listing_url: r.listing_url || '#',
//             }))
//             .filter(r => !isNaN(r.lat) && !isNaN(r.lng));
          
//           console.log(`Loaded ${cleaned.length} listings`);
//           setAllListings(cleaned);
//           setFilteredListings(cleaned);
//           setLoading(false);
//         } catch (err) {
//           console.error('Error processing CSV:', err);
//           setError('Error processing data');
//           setLoading(false);
//         }
//       },
//       error: (err) => {
//         console.error('Error loading CSV:', err);
//         setError('Error loading data');
//         setLoading(false);
//       }
//     });
//   }, []);

useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/listingsLondon");
        const data = await res.json();
  
        const cleaned = data
          .filter(r => r.latitude && r.longitude)
          .map(r => ({
            ...r,
            lat: parseFloat(r.latitude),
            lng: parseFloat(r.longitude),
            accommodates: Number(r.accommodates) || 1,
            bathrooms: Number(r.bathrooms) || 0,
            bedrooms: Number(r.bedrooms) || 0,
            host_is_superhost: r.host_is_superhost === "t" || r.host_is_superhost === true,
            host_neighbourhood: r.host_neighbourhood || "Unknown",
            room_type: r.room_type || "Unknown",
            price: r.price ? parseFloat(r.price.toString().replace(/[€$,]/g, "")) : 0,
            id: r._id?.toString() || Math.random().toString(36),
            name: r.name || "Unnamed Property",
            host_name: r.host_name || "Unknown Host",
            host_since: r.host_since || "Unknown",
            host_picture_url: r.host_picture_url || "/images/default-avatar.png",
            neighbourhood: r.neighbourhood || "Unknown",
            property_type: r.property_type || "Unknown",
            number_of_reviews: r.number_of_reviews || 0,
            reviews_per_month: r.reviews_per_month || 0,
            host_response_time: r.host_response_time || "Unknown",
            listing_url: r.listing_url || "#",
          }))
          .filter(r => !isNaN(r.lat) && !isNaN(r.lng));
  
        console.log(`Loaded ${cleaned.length} listings`);
        setAllListings(cleaned);
        setFilteredListings(cleaned);
      } catch (err) {
        console.error("Error fetching MongoDB data:", err);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchListings();
  }, []);
  // Apply filters
  function applyFilters(filters) {
    const filtered = allListings.filter(item => {
      if (
        filters.host_is_superhost !== null &&
        item.host_is_superhost !== filters.host_is_superhost
      ) return false;
      
      if (
        filters.neighbourhood_cleansed &&
        filters.neighbourhood_cleansed.length > 0 &&
        !filters.neighbourhood_cleansed.includes(item.neighbourhood_cleansed)
      ) return false;
      
      if (filters.room_type && item.room_type !== filters.room_type) return false;
      
      if (
        filters.accommodatesMin !== null &&
        item.accommodates < filters.accommodatesMin
      ) return false;
      
      if (
        filters.accommodatesMax !== null &&
        item.accommodates > filters.accommodatesMax
      ) return false;
      
      if (
        filters.priceMin !== null &&
        item.price < filters.priceMin
      ) return false;
      
      if (
        filters.priceMax !== null &&
        item.price > filters.priceMax
      ) return false;
      
      return true;
    });
    
    setFilteredListings(filtered);
    setSelectedListing(null);
  }

  // Handle marker click with safety and livability data loading
  const handleMarkerClick = async (listing) => {
    setSelectedListing(listing);
    
    // Load safety data if not already loaded
    if (!safetyData[listing.id]) {
      const safety = await getSafetyScore(listing.lat, listing.lng);
      setSafetyData(prev => ({ ...prev, [listing.id]: safety }));
    }
    
    // Load livability data if not already loaded
    if (!livabilityData[listing.id]) {
      const livability = await getLivabilityScore(listing.lat, listing.lng);
      setLivabilityData(prev => ({ ...prev, [listing.id]: livability }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading London listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Filter Panel */}
      <FilterPanel onApplyFilters={applyFilters} />
      
      {/* Results Counter */}
      <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
        <span className="text-sm font-medium">
          Showing {filteredListings.length} of {allListings.length} properties
        </span>
      </div>

      {/* Map */}
      <MapContainer 
        // center={[53.3498, -6.2603]}
        center={cities['london'].coords} 
        zoom={12} 
        style={{ height: "100vh", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        <MapUpdater listings={filteredListings} selectedListing={selectedListing} />
        
        {/* Lazy Loaded Markers */}
        <LazyMarkers 
          listings={filteredListings}
          onMarkerClick={handleMarkerClick}
          safetyData={safetyData}
          livabilityData={livabilityData}
        />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-medium mb-2 text-sm">Property Types</h4>
        <div className="space-y-1">
          {Object.entries(propertyIcons).filter(([key]) => key !== 'default').map(([type, icon]) => (
            <div key={type} className="flex items-center text-xs">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ 
                  backgroundColor: type === 'Entire home/apt' ? '#e74c3c' :
                                  type === 'Private room' ? '#3498db' :
                                  type === 'Shared room' ? '#f39c12' : '#9b59b6',
                  border: '2px solid white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              />
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Performance Info */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg">
        <div className="text-xs text-gray-600">
          Lazy loading enabled
        </div>
      </div>
    </div>
  );
}

// 'use client';
// import { useEffect, useState, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import Papa from "papaparse";
// import 'leaflet/dist/leaflet.css';
// import { neighborhoodsList } from "@/components/airbnb/Dublin/neighbourhoodList.js";
// import { photos } from "@/app/test-cities/CityPhotos";
// import { cities } from "@/components/citycoord";
// const roomTypes = ["Private room", "Entire home/apt", "Shared room", "Hotel room"];

// // Custom icons for different property types
// const createCustomIcon = (color) => L.divIcon({
//   className: 'custom-marker',
//   html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
//   popupAnchor: [0, -10],
// });

// const propertyIcons = {
//   "Entire home/apt": createCustomIcon('#e74c3c'),
//   "Private room": createCustomIcon('#3498db'), 
//   "Shared room": createCustomIcon('#f39c12'),
//   "Hotel room": createCustomIcon('#9b59b6'),
//   default: createCustomIcon('#95a5a6')
// };

// // Overpass query to get safety amenities
// const overpassSafetyQuery = (lat, lng) => `
// [out:json];
// (
//   node["amenity"="police"](around:1000,${lat},${lng});
//   node["highway"="street_lamp"](around:500,${lat},${lng});
//   node["highway"="bus_stop"](around:500,${lat},${lng}); 
//   node["railway"="station"](around:500,${lat},${lng}); 
// );
// out;
// `;

// // Overpass query for livability (counts amenities)
// const overpassLivabilityQuery = (lat, lng) => `
// [out:json];
// (
//   node["amenity"](around:500,${lat},${lng});
//   node["shop"](around:500,${lat},${lng});
//   node["leisure"](around:500,${lat},${lng});
// );
// out;
// `;

// // Fetch safety data
// async function getSafetyScore(lat, lng) {
//   try {
//     const response = await fetch("https://overpass-api.de/api/interpreter", {
//       method: "POST",
//       body: overpassSafetyQuery(lat, lng),
//     });
//     const json = await response.json();
//     const polices = json.elements.filter(e => e.tags?.amenity === "police")
//     const policeCount = polices.length;
//     const policeNames = polices.map(b => b.tags.name).filter(Boolean).slice(0, 5);
//     const lampCount = json.elements.filter(e => e.tags?.highway === "street_lamp").length;
//     const busStops = json.elements.filter(e => e.tags?.highway === "bus_stop");
//     const busStopCount = busStops.length;
//     const busStopNames = busStops.map(b => b.tags.name).filter(Boolean).slice(0, 5);
//     const stations = json.elements.filter(e => e.tags?.railway === "station");
//     const railwayStationCount = stations.length;
//     const railwayStationNames = stations.map(s => s.tags.name).filter(Boolean).slice(0, 5);
//     const score = policeCount * 2 + lampCount * 0.1;
//     return { policeCount, policeNames, lampCount, busStopCount, busStopNames, railwayStationCount, railwayStationNames, score };
//   } catch (error) {
//     console.error('Error fetching safety data:', error);
//     return null;
//   }
// }

// // Fetch livability score
// async function getLivabilityScore(lat, lng) {
//   try {
//     const response = await fetch("https://overpass-api.de/api/interpreter", {
//       method: "POST",
//       body: overpassLivabilityQuery(lat, lng),
//     });
//     const json = await response.json();
//     const elements = json.elements || [];
//     const weights = {
//       police: 2,
//       hospital: 2,
//       school: 2,
//       park: 2,
//       supermarket: 3,
//       bus_stop: 0.5,
//       atm: 2,
//       pub: 2,
//       pharmacy: 3,
//       cafe: 1,
//       restaurant: 2,
//       playground: 1,
//       library: 2,
//       bank: 2,
//       clinic: 3,
//       gym: 1,
//     };
//     let score = 0;
//     elements.forEach(el => {
//       const t = el.tags;
//       if (!t) return;
//       if (t.amenity === "police") score += weights.police;
//       if (t.amenity === "hospital") score += weights.hospital;
//       if (t.amenity === "school") score += weights.school;
//       if (t.leisure === "park") score += weights.park;
//       if (t.shop === "supermarket") score += weights.supermarket;
//       if (t.highway === "bus_stop") score += weights.bus_stop;
//       if (t.amenity === "atm") score += weights.atm;
//       if (t.amenity === "pub") score += weights.pub;
//       if (t.amenity === "pharmacy") score += weights.pharmacy;
//       if (t.amenity === "cafe") score += weights.cafe;
//       if (t.amenity === "restaurant") score += weights.restaurant;
//       if (t.amenity === "playground") score += weights.playground;
//       if (t.amenity === "library") score += weights.library;
//       if (t.amenity === "bank") score += weights.bank;
//       if (t.amenity === "clinic") score += weights.clinic;
//       if (t.amenity === "gym") score += weights.gym;
//     });
//     return Math.round(score * 10) / 10; // round to 1 decimal
//   } catch (error) {
//     console.error('Error fetching livability data:', error);
//     return null;
//   }
// }

// // Component to handle map updates
// function MapUpdater({ listings, selectedListing }) {
//   const map = useMap();
  
//   useEffect(() => {
//     if (selectedListing) {
//       // Fly to the selected listing with smooth animation
//       map.flyTo([selectedListing.lat, selectedListing.lng], 16, {
//         animate: true,
//         duration: 1.5
//       });
//     } else if (listings.length > 0) {
//       const group = new L.featureGroup(
//         listings.map(listing => L.marker([listing.lat, listing.lng]))
//       );
//       map.fitBounds(group.getBounds().pad(0.1));
//     }
//   }, [listings, selectedListing, map]);
  
//   return null;
// }

// // Filter Panel Component
// function FilterPanel({ onApplyFilters }) {
//   const [hostIsSuperhost, setHostIsSuperhost] = useState(null);
//   const [neighborhoods, setNeighborhoods] = useState([]);
//   const [roomType, setRoomType] = useState('');
//   const [accommodatesMin, setAccommodatesMin] = useState('');
//   const [accommodatesMax, setAccommodatesMax] = useState('');
//   const [priceMin, setPriceMin] = useState('');
//   const [priceMax, setPriceMax] = useState('');
//   const [isExpanded, setIsExpanded] = useState(false);
  
//   // Neighborhood search states
//   const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
//   const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
//   const [focusedNeighborhoodIndex, setFocusedNeighborhoodIndex] = useState(-1);
  
//   const neighborhoodSearchRef = useRef(null);
//   const neighborhoodDropdownRef = useRef(null);

//   // Filter neighborhoods based on search
//   const filteredNeighborhoods = neighborhoodsList.filter(n => 
//     n.toLowerCase().includes(neighborhoodSearch.toLowerCase()) &&
//     !neighborhoods.includes(n)
//   );

//   function applyFilters() {
//     onApplyFilters({
//       host_is_superhost: hostIsSuperhost,
//       host_neighbourhood: neighborhoods,
//       room_type: roomType,
//       accommodatesMin: accommodatesMin ? Number(accommodatesMin) : null,
//       accommodatesMax: accommodatesMax ? Number(accommodatesMax) : null,
//       priceMin: priceMin ? Number(priceMin) : null,
//       priceMax: priceMax ? Number(priceMax) : null,
//     });
//   }

//   function clearFilters() {
//     setHostIsSuperhost(null);
//     setNeighborhoods([]);
//     setRoomType('');
//     setAccommodatesMin('');
//     setAccommodatesMax('');
//     setPriceMin('');
//     setPriceMax('');
//     setNeighborhoodSearch('');
//     setShowNeighborhoodDropdown(false);
//     setFocusedNeighborhoodIndex(-1);
//     onApplyFilters({
//       host_is_superhost: null,
//       host_neighbourhood: [],
//       room_type: '',
//       accommodatesMin: null,
//       accommodatesMax: null,
//       priceMin: null,
//       priceMax: null,
//     });
//   }

//   function onNeighborhoodChange(e) {
//     const { value, checked } = e.target;
//     if (checked) {
//       setNeighborhoods(prev => [...prev, value]);
//     } else {
//       setNeighborhoods(prev => prev.filter(n => n !== value));
//     }
//   }

//   // Add neighborhood from search
//   const addNeighborhood = (neighborhood) => {
//     if (!neighborhoods.includes(neighborhood)) {
//       setNeighborhoods(prev => [...prev, neighborhood]);
//     }
//     setNeighborhoodSearch('');
//     setShowNeighborhoodDropdown(false);
//     setFocusedNeighborhoodIndex(-1);
//   };

//   // Remove neighborhood tag
//   const removeNeighborhood = (neighborhood) => {
//     setNeighborhoods(prev => prev.filter(n => n !== neighborhood));
//   };

//   // Handle neighborhood search keyboard events
//   const handleNeighborhoodSearchKeyDown = (e) => {
//     if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       if (filteredNeighborhoods.length > 0) {
//         setShowNeighborhoodDropdown(true);
//         setFocusedNeighborhoodIndex(0);
//       }
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       if (showNeighborhoodDropdown && focusedNeighborhoodIndex > 0) {
//         setFocusedNeighborhoodIndex(prev => prev - 1);
//       }
//     } else if (e.key === 'Enter') {
//       e.preventDefault();
//       if (focusedNeighborhoodIndex >= 0 && filteredNeighborhoods[focusedNeighborhoodIndex]) {
//         addNeighborhood(filteredNeighborhoods[focusedNeighborhoodIndex]);
//       } else if (filteredNeighborhoods.length === 1) {
//         addNeighborhood(filteredNeighborhoods[0]);
//       }
//     } else if (e.key === 'Escape') {
//       setShowNeighborhoodDropdown(false);
//       setFocusedNeighborhoodIndex(-1);
//     }
//   };

//   // Handle neighborhood search change
//   const handleNeighborhoodSearchChange = (e) => {
//     const value = e.target.value;
//     setNeighborhoodSearch(value);
//     setShowNeighborhoodDropdown(value.length > 0 && filteredNeighborhoods.length > 0);
//     setFocusedNeighborhoodIndex(-1);
//   };

//   // Global keyboard handler for neighborhood dropdown navigation
//   useEffect(() => {
//     const handleGlobalKeyDown = (e) => {
//       if (showNeighborhoodDropdown && document.activeElement === neighborhoodSearchRef.current) {
//         if (e.key === 'ArrowDown') {
//           e.preventDefault();
//           setFocusedNeighborhoodIndex(prev => 
//             prev < filteredNeighborhoods.length - 1 ? prev + 1 : prev
//           );
//         } else if (e.key === 'ArrowUp') {
//           e.preventDefault();
//           setFocusedNeighborhoodIndex(prev => prev > 0 ? prev - 1 : -1);
//         }
//       }
//     };

//     document.addEventListener('keydown', handleGlobalKeyDown);
//     return () => document.removeEventListener('keydown', handleGlobalKeyDown);
//   }, [showNeighborhoodDropdown, filteredNeighborhoods, focusedNeighborhoodIndex]);

//   return (
//     <div className="absolute top-4 left-4 z-[1000] w-80 bg-white border rounded-lg shadow-lg">
//       <div className="p-4">
//         <div className="flex justify-between items-center mb-3">
//           <h2 className="text-lg font-semibold">Filters</h2>
//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="text-sm text-blue-600 hover:text-blue-800"
//             aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
//           >
//             {isExpanded ? "Collapse" : "Expand"}
//           </button>
//         </div>

//         <div className={`space-y-3 ${!isExpanded ? 'hidden' : ''}`}>
//           {/* Superhost Filter */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Superhost:</label>
//             <select
//               value={hostIsSuperhost === null ? '' : hostIsSuperhost ? 'true' : 'false'}
//               onChange={e => {
//                 const val = e.target.value;
//                 if (val === '') setHostIsSuperhost(null);
//                 else setHostIsSuperhost(val === 'true');
//               }}
//               className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             >
//               <option value="">Any</option>
//               <option value="true">Yes</option>
//               <option value="false">No</option>
//             </select>
//           </div>

//           {/* Neighborhood Filter - Searchable */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Neighborhoods:</label>
            
//             {/* Selected neighborhoods as tags */}
//             {neighborhoods.length > 0 && (
//               <div className="flex flex-wrap gap-1 mb-2">
//                 {neighborhoods.map((neighborhood) => (
//                   <span
//                     key={neighborhood}
//                     className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                   >
//                     {neighborhood}
//                     <button
//                       onClick={() => removeNeighborhood(neighborhood)}
//                       className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800"
//                       aria-label={`Remove ${neighborhood}`}
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             )}

//             {/* Search input */}
//             <div className="relative">
//               <input
//                 ref={neighborhoodSearchRef}
//                 type="text"
//                 placeholder="Search neighborhoods..."
//                 value={neighborhoodSearch}
//                 onChange={handleNeighborhoodSearchChange}
//                 onKeyDown={handleNeighborhoodSearchKeyDown}
//                 onFocus={() => neighborhoodSearch && filteredNeighborhoods.length > 0 && setShowNeighborhoodDropdown(true)}
//                 onBlur={(e) => {
//                   if (!neighborhoodDropdownRef.current?.contains(e.relatedTarget)) {
//                     setTimeout(() => {
//                       setShowNeighborhoodDropdown(false);
//                       setFocusedNeighborhoodIndex(-1);
//                     }, 150);
//                   }
//                 }}
//                 className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
//                 aria-label="Search for neighborhoods"
//                 aria-expanded={showNeighborhoodDropdown && filteredNeighborhoods.length > 0}
//                 aria-haspopup="listbox"
//                 aria-activedescendant={focusedNeighborhoodIndex >= 0 ? `neighborhood-${focusedNeighborhoodIndex}` : undefined}
//                 role="combobox"
//                 autoComplete="off"
//               />
              
//               {/* Dropdown */}
//               {showNeighborhoodDropdown && neighborhoodSearch && filteredNeighborhoods.length > 0 && (
//                 <ul 
//                   ref={neighborhoodDropdownRef}
//                   className="absolute z-50 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-40 overflow-y-auto mt-1"
//                   role="listbox"
//                   aria-label="Neighborhood search results"
//                 >
//                   {filteredNeighborhoods.map((neighborhood, index) => (
//                     <li
//                       key={neighborhood}
//                       id={`neighborhood-${index}`}
//                       onClick={() => addNeighborhood(neighborhood)}
//                       onMouseEnter={() => setFocusedNeighborhoodIndex(index)}
//                       className={`px-3 py-2 cursor-pointer text-sm ${
//                         focusedNeighborhoodIndex === index 
//                           ? 'bg-blue-500 text-white' 
//                           : 'hover:bg-blue-50'
//                       }`}
//                       role="option"
//                       aria-selected={focusedNeighborhoodIndex === index}
//                       tabIndex={-1}
//                     >
//                       {neighborhood}
//                     </li>
//                   ))}
//                 </ul>
//               )}
              
//               {/* No results message */}
//               {neighborhoodSearch && filteredNeighborhoods.length === 0 && (
//                 <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-b shadow-lg p-3 mt-1 text-sm text-gray-500">
//                   No neighborhoods found matching "{neighborhoodSearch}"
//                 </div>
//               )}
//             </div>
            
//             {neighborhoods.length > 0 && (
//               <div className="text-xs text-gray-600 mt-1">
//                 {neighborhoods.length} neighborhood{neighborhoods.length !== 1 ? 's' : ''} selected
//               </div>
//             )}
//           </div>

//           {/* Room Type Filter */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Room Type:</label>
//             <select
//               value={roomType}
//               onChange={e => setRoomType(e.target.value)}
//               className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             >
//               <option value="">Any</option>
//               {roomTypes.map((r, i) => (
//                 <option key={i} value={r}>{r}</option>
//               ))}
//             </select>
//           </div>

//           {/* Accommodates Filter */}
//           <div className="flex gap-2">
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Min Guests:</label>
//               <input
//                 type="number"
//                 min={1}
//                 value={accommodatesMin}
//                 onChange={e => setAccommodatesMin(e.target.value)}
//                 className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 placeholder="1"
//               />
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Max Guests:</label>
//               <input
//                 type="number"
//                 min={1}
//                 value={accommodatesMax}
//                 onChange={e => setAccommodatesMax(e.target.value)}
//                 className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 placeholder="Any"
//               />
//             </div>
//           </div>

//           {/* Price Filter */}
//           <div className="flex gap-2">
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Min Price (€):</label>
//               <input
//                 type="number"
//                 min={0}
//                 value={priceMin}
//                 onChange={e => setPriceMin(e.target.value)}
//                 className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 placeholder="0"
//               />
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Max Price (€):</label>
//               <input
//                 type="number"
//                 min={0}
//                 value={priceMax}
//                 onChange={e => setPriceMax(e.target.value)}
//                 className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 placeholder="Any"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-2 mt-4">
//           <button
//             onClick={applyFilters}
//             className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           >
//             Apply Filters
//           </button>
//           <button
//             onClick={clearFilters}
//             className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition focus:ring-2 focus:ring-gray-400 focus:outline-none"
//           >
//             Clear All
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Main Component
// export default function LondonMap() {
//   const [allListings, setAllListings] = useState([]);
//   const [filteredListings, setFilteredListings] = useState([]);
//   const [selectedListing, setSelectedListing] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [safetyData, setSafetyData] = useState({});
//   const [livabilityData, setLivabilityData] = useState({});

//   // Load CSV data
//   useEffect(() => {
//     setLoading(true);
//     Papa.parse('/london_airbnb_cleaned.csv', {
//       download: true,
//       header: true,
//       complete: (result) => {
//         try {
//           const cleaned = result.data
//             .filter(r => r.latitude && r.longitude && r.latitude !== '' && r.longitude !== '')
//             .map(r => ({
//               ...r,
//               lat: parseFloat(r.latitude),
//               lng: parseFloat(r.longitude),
//               accommodates: Number(r.accommodates) || 1,
//               bathrooms: Number(r.bathrooms) || 0,
//               bedrooms: Number(r.bedrooms) || 0,
//               host_is_superhost: r.host_is_superhost === 't' || r.host_is_superhost === 'true',
//               host_neighbourhood: r.host_neighbourhood || 'Unknown',
//               room_type: r.room_type || 'Unknown',
//               price: r.price ? parseFloat(r.price.toString().replace(/[€$,]/g, '')) : 0,
//               id: r.id || Math.random().toString(36),
//               name: r.name || 'Unnamed Property',
//               host_name: r.host_name || 'Unknown Host',
//               host_since: r.host_since || 'Unknown',
//               host_picture_url: r.host_picture_url || '/images/default-avatar.png',
//               neighbourhood: r.neighbourhood || 'Unknown',
//               property_type: r.property_type || 'Unknown',
//               number_of_reviews: r.number_of_reviews || 0,
//               reviews_per_month: r.reviews_per_month || 0,
//               host_response_time: r.host_response_time || 'Unknown',
//               listing_url: r.listing_url || '#',
//             }))
//             .filter(r => !isNaN(r.lat) && !isNaN(r.lng));
          
//           console.log(`Loaded ${cleaned.length} listings`);
//           setAllListings(cleaned);
//           setFilteredListings(cleaned);
//           setLoading(false);
//         } catch (err) {
//           console.error('Error processing CSV:', err);
//           setError('Error processing data');
//           setLoading(false);
//         }
//       },
//       error: (err) => {
//         console.error('Error loading CSV:', err);
//         setError('Error loading data');
//         setLoading(false);
//       }
//     });
//   }, []);

//   // Apply filters
//   function applyFilters(filters) {
//     const filtered = allListings.filter(item => {
//       if (
//         filters.host_is_superhost !== null &&
//         item.host_is_superhost !== filters.host_is_superhost
//       ) return false;
      
//       if (
//         filters.host_neighbourhood &&
//         filters.host_neighbourhood.length > 0 &&
//         !filters.host_neighbourhood.includes(item.host_neighbourhood)
//       ) return false;
      
//       if (filters.room_type && item.room_type !== filters.room_type) return false;
      
//       if (
//         filters.accommodatesMin !== null &&
//         item.accommodates < filters.accommodatesMin
//       ) return false;
      
//       if (
//         filters.accommodatesMax !== null &&
//         item.accommodates > filters.accommodatesMax
//       ) return false;
      
//       if (
//         filters.priceMin !== null &&
//         item.price < filters.priceMin
//       ) return false;
      
//       if (
//         filters.priceMax !== null &&
//         item.price > filters.priceMax
//       ) return false;
      
//       return true;
//     });
    
//     setFilteredListings(filtered);
//     setSelectedListing(null);
//   }

//   // Handle marker click with safety and livability data loading
//   const handleMarkerClick = async (listing) => {
//     setSelectedListing(listing);
    
//     // Load safety data if not already loaded
//     if (!safetyData[listing.id]) {
//       const safety = await getSafetyScore(listing.lat, listing.lng);
//       setSafetyData(prev => ({ ...prev, [listing.id]: safety }));
//     }
    
//     // Load livability data if not already loaded
//     if (!livabilityData[listing.id]) {
//       const livability = await getLivabilityScore(listing.lat, listing.lng);
//       setLivabilityData(prev => ({ ...prev, [listing.id]: livability }));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-xl">Loading London listings...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-xl text-red-600">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-screen">
//       {/* Filter Panel */}
//       <FilterPanel onApplyFilters={applyFilters} />
      
//       {/* Results Counter */}
//       <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
//         <span className="text-sm font-medium">
//           Showing {filteredListings.length} of {allListings.length} properties
//         </span>
//       </div>

//       {/* Map */}
//       <MapContainer 
//         center={cities['london-2024'].coords}
//         zoom={20} 
//         style={{ height: "100vh", width: "100%" }}
//         className="z-0"
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution="&copy; OpenStreetMap contributors"
//         />
        
//         <MapUpdater listings={filteredListings} selectedListing={selectedListing} />
        
//         {/* Render markers */}
//         {filteredListings.map((listing) => {
//           const icon = propertyIcons[listing.room_type] || propertyIcons.default;
//           const safety = safetyData[listing.id];
//           const livability = livabilityData[listing.id];
          
//           return (
//             <Marker 
//               key={listing.id} 
//               position={[listing.lat, listing.lng]} 
//               icon={icon}
//               eventHandlers={{
//                 click: () => {
//                   handleMarkerClick(listing);
//                 },
//               }}
//             >
//               <Popup maxWidth={350} maxHeight={400}>
//                 <div style={{ minWidth: '320px', maxHeight: '380px', overflowY: 'auto' }}>
//                   {/* Host Information */}
//                   <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
//                     <img 
//                       src={listing.host_picture_url} 
//                       alt={`${listing.host_name}'s profile`} 
//                       style={{ 
//                         width: '48px', 
//                         height: '48px', 
//                         borderRadius: '50%', 
//                         border: '2px solid #ec4899',
//                         marginRight: '12px',
//                         objectFit: 'cover'
//                       }}
//                       onError={(e) => {
//                         e.target.src = '/images/default-avatar.png';
//                       }}
//                     />
//                     <div>
//                       <div style={{ fontSize: '14px', color: '#374151' }}>Host: {listing.host_name}</div>
//                       <div style={{ fontSize: '12px', color: '#6b7280' }}>Host since: {listing.host_since}</div>
//                     </div>
//                   </div>

//                   {/* Basic Property Info */}
//                   <div style={{ marginBottom: '12px' }}>
//                     <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{listing.name}</div>
//                     <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
//                       <b>Price:</b> €{listing.price}<br/>
//                       <b>Accommodates:</b> {listing.accommodates}<br/>
//                       <b>Bedrooms:</b> {listing.bedrooms}<br/>
//                       <b>Bathrooms:</b> {listing.bathrooms}<br/>
//                       <b>Property Type:</b> {listing.property_type}<br/>
//                       <b>Neighbourhood:</b> {listing.neighbourhood}<br/>
//                       <b>Host Neighbourhood:</b> {listing.host_neighbourhood}<br/>
//                       <b>Number of Reviews:</b> {listing.number_of_reviews}<br/>
//                       <b>Reviews per Month:</b> {listing.reviews_per_month}<br/>
//                       <b>Host Response Time:</b> {listing.host_response_time}<br/>
//                       <b>URL: </b>
//                       <a 
//                         href={listing.listing_url} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         style={{ color: '#2563eb', textDecoration: 'underline' }}
//                       >
//                         View Listing
//                       </a>
//                     </div>
//                   </div>

//                   {/* Safety Information */}
//                   {safety ? (
//                     <div style={{ fontSize: '12px', marginBottom: '12px', color: '#374151' }}>
//                       <div><b>Police Stations Nearby:</b> {safety.policeCount}</div>
//                       {safety.policeNames.length > 0 && (
//                         <div style={{ marginTop: '4px' }}>
//                           <div style={{ fontWeight: 'bold' }}>Police Stations Names:</div>
//                           <ul style={{ listStyle: 'disc', paddingLeft: '16px', maxHeight: '60px', overflowY: 'auto' }}>
//                             {safety.policeNames.map((name, i) => <li key={i}>{name}</li>)}
//                           </ul>
//                         </div>
//                       )}
//                       <div><b>Streetlights Nearby:</b> {safety.lampCount}</div>
//                       <div><b>Bus Stops Nearby:</b> {safety.busStopCount}</div>
//                       {safety.busStopNames.length > 0 && (
//                         <div style={{ marginTop: '4px' }}>
//                           <div style={{ fontWeight: 'bold' }}>Bus Stops Names:</div>
//                           <ul style={{ listStyle: 'disc', paddingLeft: '16px', maxHeight: '60px', overflowY: 'auto' }}>
//                             {safety.busStopNames.map((name, i) => <li key={i}>{name}</li>)}
//                           </ul>
//                         </div>
//                       )}
//                       {safety.railwayStationCount > 0 && (
//                         <div>
//                           <div><b>Railway Stations Nearby:</b> {safety.railwayStationCount}</div>
//                           <div style={{ fontWeight: 'bold', marginTop: '4px' }}>Railway Stations Names:</div>
//                           <ul style={{ listStyle: 'disc', paddingLeft: '16px', maxHeight: '60px', overflowY: 'auto' }}>
//                             {safety.railwayStationNames.map((name, i) => <li key={i}>{name}</li>)}
//                           </ul>
//                         </div>
//                       )}
//                       <div 
//                         style={{
//                           display: 'inline-block',
//                           padding: '4px 12px',
//                           borderRadius: '8px',
//                           color: 'white',
//                           backgroundColor: safety.score > 5 ? '#10b981' : safety.score > 2 ? '#3b82f6' : '#000000',
//                           fontWeight: 'bold',
//                           marginTop: '8px'
//                         }}
//                       >
//                         🛡️ {safety.score > 5 ? 'High Safety' : safety.score > 2 ? 'Medium Safety' : 'Low Safety'}
//                       </div>
//                     </div>
//                   ) : (
//                     <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '8px' }}>
//                       Loading safety data...
//                     </div>
//                   )}

//                   {/* Livability Information */}
//                   {livability != null ? (
//                     <div style={{ fontSize: '14px', marginTop: '8px' }}>
//                       🏘️ <b>Livability Score:</b> {livability}
//                     </div>
//                   ) : (
//                     <div style={{ fontSize: '12px', fontStyle: 'italic' }}>
//                       Loading livability data...
//                     </div>
//                   )}
//                 </div>
//               </Popup>
//             </Marker>
//           );
//         })}
//       </MapContainer>

//       {/* Legend */}
//       <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
//         <h4 className="font-medium mb-2 text-sm">Property Types</h4>
//         <div className="space-y-1">
//           {Object.entries(propertyIcons).filter(([key]) => key !== 'default').map(([type, icon]) => (
//             <div key={type} className="flex items-center text-xs">
//               <div 
//                 className="w-4 h-4 rounded-full mr-2" 
//                 style={{ 
//                   backgroundColor: type === 'Entire home/apt' ? '#e74c3c' :
//                                   type === 'Private room' ? '#3498db' :
//                                   type === 'Shared room' ? '#f39c12' : '#9b59b6',
//                   border: '2px solid white',
//                   boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
//                 }}
//               />
//               {type}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
