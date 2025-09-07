'use client';
import { useEffect, useState, memo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import Fuse from 'fuse.js';

// Bike icon
const bikeIcon = L.icon({
  iconUrl: "https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/bike.svg", // normal bike
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// E-bike icon
const ebikeIcon = L.icon({
  iconUrl: "https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/mapicons/e-bike.svg",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Component to fly to a specific bike location
function FlyToBike({ position, selectedBikeId }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && selectedBikeId) {
      map.flyTo(position, 18, {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, selectedBikeId, map]);
  
  return null;
}

function DublinLiveBikesMap() {
  const [bikes, setBikes] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'bike', 'ebike'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [fuse, setFuse] = useState(null);
  
  const searchInputRef = useRef(null);
  const markersRef = useRef({});

  const fetchBikes = () => {
    fetch("https://data.smartdublin.ie/mobybikes-api/bikes/mobymoby_dublin/current/bikes.geojson")
      .then(res => res.json())
      .then(data => setBikes(data.features))
      .catch(err => console.error("Error fetching bikes:", err));
  };

  const getFilteredBikes = () => {
    if (filter === 'bike') {
      return bikes.filter(bike => !bike.properties.vehicle_type_id.includes("E_BIKE"));
    } else if (filter === 'ebike') {
      return bikes.filter(bike => bike.properties.vehicle_type_id.includes("E_BIKE"));
    }
    return bikes;
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const refreshCurrentFilter = () => {
    fetchBikes(); // This will refresh all bikes, then filter will be applied
  };

  // Initialize Fuse.js when bikes data changes
  useEffect(() => {
    if (bikes.length > 0) {
      const fuseOptions = {
        keys: ['properties.bike_id'],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true
      };
      setFuse(new Fuse(bikes, fuseOptions));
    }
  }, [bikes]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    
    if (fuse && value.length > 0) {
      const results = fuse.search(value).slice(0, 10); // Limit to 10 results
      setSearchResults(results);
      setShowSearchDropdown(true);
    }
  };

  // Handle bike selection from search results
  const handleBikeSelect = (bike) => {
    const [lng, lat] = bike.geometry.coordinates;
    setSelectedBike({
      ...bike,
      position: [lat, lng]
    });
    setSearchTerm(bike.properties.bike_id);
    setShowSearchDropdown(false);
    
    // Open popup after a short delay to allow map to fly to position
    setTimeout(() => {
      const marker = markersRef.current[bike.properties.bike_id];
      if (marker) {
        marker.openPopup();
      }
    }, 1600);
  };

  // Handle search input focus/blur
  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchDropdown(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowSearchDropdown(false);
    }, 200);
  };

  // Keyboard navigation for search
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearchDropdown(false);
      searchInputRef.current?.blur();
    }
  };

  // Function to highlight matching text
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="bg-yellow-200 font-semibold text-yellow-800">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    fetchBikes(); // initial fetch
  }, []);

  const filteredBikes = getFilteredBikes();

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-[1000] w-80">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by Bike ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 pr-10 bg-white/90 backdrop-blur-md border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Search Results Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
            {searchResults.map((result, index) => {
              const bike = result.item;
              const { bike_id, vehicle_type_id, last_updated_dt } = bike.properties;
              return (
                <div
                  key={bike_id}
                  onClick={() => handleBikeSelect(bike)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {vehicle_type_id.includes("E_BIKE") ? "🔋" : "🚲"}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Bike ID: {highlightMatch(bike_id, searchTerm)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle_type_id.replace("SHA:VehicleType:", "")}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Score: {(1 - result.score).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* No Results Message */}
        {showSearchDropdown && searchTerm && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500">
            No bikes found matching {searchTerm}
          </div>
        )}
      </div>

      <button
        onClick={refreshCurrentFilter}
        className="absolute top-4 right-4 z-[1000] p-2 bg-blue-600 backdrop-blur-md rounded shadow-lg hover:bg-blue-700"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          borderRadius: "8px",
          fontSize: "0.9rem",
          cursor: "pointer",
          transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        Refresh {filter === 'all' ? 'All' : filter === 'bike' ? 'Bikes' : 'E-bikes'}
      </button>

      {/* Filter buttons */}
      <div className="absolute top-20 right-6 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            filter === 'all' ? 'bg-green-500 scale-110' : 'bg-white/70 hover:bg-white/90'
          }`}
          style={{
            fontSize: "1.5rem",
            cursor: "pointer",
            transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          title="Show all bikes"
        >
          🚲🔋
        </button>
        
        <button
          onClick={() => handleFilterChange('bike')}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            filter === 'bike' ? 'bg-green-500 scale-110' : 'bg-white/70 hover:bg-white/90'
          }`}
          style={{
            fontSize: "1.5rem",
            cursor: "pointer",
            //backdropFilter: "blur(10px)",
            transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          title="Show only regular bikes"
        >
          🚲
        </button>
        
        <button
          onClick={() => handleFilterChange('ebike')}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            filter === 'ebike' ? 'bg-green-500 scale-110' : 'bg-white/70 hover:bg-white/90'
          }`}
          style={{
            fontSize: "1.5rem",
            cursor: "pointer",
            //backdropFilter: "blur(10px)",
            transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          title="Show only e-bikes"
        >
          🔋
        </button>
      </div>

      <MapContainer center={[53.3498, -6.2603]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {filteredBikes.map((bike, i) => {
          const [lng, lat] = bike.geometry.coordinates;
          const { bike_id, vehicle_type_id, last_updated_dt } = bike.properties;
          return (
            <Marker
              key={bike_id}
              position={[lat, lng]}
              icon={vehicle_type_id.includes("E_BIKE") ? ebikeIcon : bikeIcon}
              ref={(ref) => {
                if (ref) {
                  markersRef.current[bike_id] = ref;
                }
              }}
            >
              <Popup>
                <b>Bike ID:</b> {bike_id}<br/>
                <b>Type:</b> {vehicle_type_id.replace("SHA:VehicleType:", "")}<br/>
                <b>Last Updated:</b> {last_updated_dt}
              </Popup>
            </Marker>
          );
        })}
        
        {/* Fly to selected bike */}
        {selectedBike && (
          <FlyToBike 
            position={selectedBike.position} 
            selectedBikeId={selectedBike.properties.bike_id}
          />
        )}
      </MapContainer>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
const MemoizedDublinLiveBikesMap = memo(DublinLiveBikesMap);
export default MemoizedDublinLiveBikesMap;