'use client';
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

// Bike icons
const bikeIcon = L.icon({
  iconUrl: "/images/mapicons/bike.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const highlightedBikeIcon = L.icon({
  iconUrl: "/images/mapicons/seat.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const selectedStationIcon = L.icon({
  iconUrl: "/images/mapicons/highlighted-bike.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to pan map to a position
function PanTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15, { animate: true });
  }, [position, map]);
  return null;
}

export default function DublinBikesMap() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightedStation, setHighlightedStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);
  const [focusedStationIndex, setFocusedStationIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchInputRef = useRef(null);
  const refreshButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchStations = () => {
    setLoading(true);
    fetch("https://data.smartdublin.ie/mobybikes-api/bikes/dublin_bikes/current/stations.geojson")
      .then(res => res.json())
      .then(data => {
        const features = data.features;
        setStations(features);
        // Highlight station with most bikes
        if (features.length > 0) {
          const maxBikesStation = features.reduce((prev, curr) => 
            curr.properties.num_bikes_available > prev.properties.num_bikes_available ? curr : prev
          );
          setHighlightedStation(maxBikesStation);
        }
      })
      .catch(err => console.error("Error fetching bikes:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Filter stations by search term
  const filteredStations = stations.filter(s => 
    s.properties.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStation = (station) => {
    setSelectedStation(station);
    setSearchTerm(""); // clear search after selecting
    setShowDropdown(false);
    setFocusedStationIndex(-1);
    // Automatically remove highlight after 5 seconds
    setTimeout(() => {
      setSelectedStation(null);
    }, 5000);
  };

  // Keyboard navigation handlers
  const handleKeyDown = (e) => {
    // Global keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'r':
          e.preventDefault();
          fetchStations();
          break;
      }
      return;
    }

    // Escape key handling
    if (e.key === 'Escape') {
      if (showDropdown) {
        setShowDropdown(false);
        setFocusedStationIndex(-1);
        searchInputRef.current?.focus();
      } else if (searchTerm) {
        setSearchTerm("");
        setShowDropdown(false);
        setFocusedStationIndex(-1);
      }
      return;
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredStations.length > 0) {
        setShowDropdown(true);
        setFocusedStationIndex(prev => 
            prev < filteredStations.length - 1 ? prev + 1 : 0
          );
      }
    }else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedStationIndex <= 0) {
          setFocusedStationIndex(filteredStations.length - 1);
          searchInputRef.current?.focus();
        } else {
          setFocusedStationIndex(prev => prev - 1);
        }}
     else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredStations.length === 1) {
        handleSelectStation(filteredStations[0]);
      } else if (focusedStationIndex >= 0 && filteredStations[focusedStationIndex]) {
        handleSelectStation(filteredStations[focusedStationIndex]);
      }
    }
  };

  const handleDropdownKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedStationIndex(prev => 
        prev < filteredStations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (focusedStationIndex <= 0) {
        setFocusedStationIndex(-1);
        searchInputRef.current?.focus();
      } else {
        setFocusedStationIndex(prev => prev - 1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedStationIndex >= 0 && filteredStations[focusedStationIndex]) {
        handleSelectStation(filteredStations[focusedStationIndex]);
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
    setFocusedStationIndex(-1);
  };

  // Add global keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, searchTerm, filteredStations, focusedStationIndex]);

  return (
    <div style={{width: "100%", position: "relative"}} role="application" aria-label="Dublin Bikes Map">
      {/* Keyboard shortcuts info */}
      <div className="sr-only" aria-live="polite">
        Keyboard shortcuts: Ctrl+F to search, Ctrl+R to refresh, Arrow keys to navigate search results, Enter to select, Escape to close
      </div>
        
      {/* Search box */}
      <div className="absolute top-4 left-4 z-[1000] w-64">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search street... (Ctrl+F)"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => searchTerm && setShowDropdown(true)}
            onBlur={(e) => {
              // Only hide dropdown if focus is not moving to a dropdown item
              if (!dropdownRef.current?.contains(e.relatedTarget)) {
                setTimeout(() => setShowDropdown(false), 150);
              }
            }}
            className="w-full p-2 rounded border shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search for bike stations by street name"
            aria-expanded={showDropdown && filteredStations.length > 0}
            aria-haspopup="listbox"
            aria-activedescendant={focusedStationIndex >= 0 ? `station-${focusedStationIndex}` : undefined}
            role="combobox"
            autoComplete="off"
          />
          {showDropdown && searchTerm && filteredStations.length > 0 && (
            <ul 
            ref={dropdownRef}
            className="bg-white border rounded shadow max-h-60 overflow-y-auto mt-1 absolute w-full"
            role="listbox"
            aria-label="Search results"
          >
            {filteredStations.map((station, index) => (
              <li
                key={station.properties.station_id}
                id={`station-${index}`}
                ref={(el) => {
                  if (focusedStationIndex === index && el) {
                    el.scrollIntoView({ block: "nearest" });
                  }
                }}
                onClick={() => handleSelectStation(station)}
                onMouseEnter={() => setFocusedStationIndex(index)}
                className={`p-2 cursor-pointer ${
                  focusedStationIndex === index 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-blue-100'
                }`}
                role="option"
                aria-selected={focusedStationIndex === index}
                tabIndex={-1}
              >
                <div className="font-medium">{station.properties.address}</div>
                <div className="text-sm opacity-75">
                  {station.properties.num_bikes_available} bikes available
                </div>
              </li>
            ))}
          </ul>
          )}
        </div>
        {searchTerm && filteredStations.length === 0 && (
          <div className="bg-white border rounded shadow mt-1 p-2 text-gray-500">
            No stations found
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <button
        ref={refreshButtonRef}
        onClick={fetchStations}
        onKeyDown={handleDropdownKeyDown}
        className="absolute top-4 right-4 z-[1000] p-2 bg-blue-600 backdrop-blur-md rounded shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        disabled={loading}
        aria-label={loading ? "Refreshing bike data..." : "Refresh bike data (Ctrl+R)"}
        title="Refresh bike data (Ctrl+R)"
      >
        {loading ? "Refreshing..." : "Refresh Bikes"}
      </button>

      <MapContainer 
        center={[53.3498, -6.2603]} 
        zoom={14} 
        style={{ height: "90vh", width: "100%" }}
        keyboard={true}
        keyboardPanDelta={80}
        aria-label="Interactive map of Dublin bike stations"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {stations.map((station, i) => {
          const [lng, lat] = station.geometry.coordinates;
          const { name, address, num_bikes_available, num_docks_available, capacity, station_id } = station.properties;
          // Determine icon
          let icon = bikeIcon;
          if (highlightedStation?.properties.station_id === station_id) icon = highlightedBikeIcon;
          if (selectedStation?.properties.station_id === station_id) icon = selectedStationIcon;
          return (
            <Marker key={i} position={[lat, lng]} icon={icon}>
              <Popup>
                <b>{name}</b><br/>
                📍 {address}<br/>
                🚲 Bikes Available: {num_bikes_available}<br/>
                🅿️ Free Docks: {num_docks_available}<br/>
                🔢 Capacity: {capacity}
              </Popup>
            </Marker>
          );
        })}
        {/* Pan to selected station or max bikes station */}
        {selectedStation && <PanTo position={selectedStation.geometry.coordinates.slice().reverse()} />}
        {!selectedStation && highlightedStation && <PanTo position={highlightedStation.geometry.coordinates.slice().reverse()} />}
      </MapContainer>
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import 'leaflet/dist/leaflet.css';

// // Bike icons
// const bikeIcon = L.icon({
//   iconUrl: "/images/mapicons/bike.png",
//   iconSize: [30, 30],
//   iconAnchor: [15, 30],
//   popupAnchor: [0, -30],
// });

// const highlightedBikeIcon = L.icon({
//   iconUrl: "/images/mapicons/seat.png",
//   iconSize: [45, 45],
//   iconAnchor: [22, 45],
//   popupAnchor: [0, -45],
// });

// const selectedStationIcon = L.icon({
//   iconUrl: "/images/mapicons/highlighted-bike.png",
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
//   popupAnchor: [0, -40],
// });

// // Component to pan map to a position
// function PanTo({ position }) {
//   const map = useMap();
//   useEffect(() => {
//     if (position) map.setView(position, 15, { animate: true });
//   }, [position, map]);
//   return null;
// }

// export default function DublinBikesMap() {
//   const [stations, setStations] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [highlightedStation, setHighlightedStation] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStation, setSelectedStation] = useState(null);

//   const fetchStations = () => {
//     setLoading(true);
//     fetch("https://data.smartdublin.ie/mobybikes-api/bikes/dublin_bikes/current/stations.geojson")
//       .then(res => res.json())
//       .then(data => {
//         const features = data.features;
//         setStations(features);

//         // Highlight station with most bikes
//         if (features.length > 0) {
//           const maxBikesStation = features.reduce((prev, curr) => 
//             curr.properties.num_bikes_available > prev.properties.num_bikes_available ? curr : prev
//           );
//           setHighlightedStation(maxBikesStation);
//         }
//       })
//       .catch(err => console.error("Error fetching bikes:", err))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     fetchStations();
//   }, []);

//   // Filter stations by search term
//   const filteredStations = stations.filter(s => 
//     s.properties.address.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelectStation = (station) => {
//     setSelectedStation(station);
//     setSearchTerm(""); // clear search after selecting

//     // Automatically remove highlight after 5 seconds
//     setTimeout(() => {
//       setSelectedStation(null);
//     }, 5000);
//   };

//   return (
//     <div style={{width: "100%", position: "relative"}}>
        
//       {/* Search box */}
//       <div className="absolute top-4 left-4 z-[1000] w-64">
//         <input
//           type="text"
//           placeholder="Search street..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full p-2 rounded border shadow focus:outline-none focus:ring"
//         />
//         {searchTerm && filteredStations.length > 0 && (
//           <ul className="bg-white border rounded shadow max-h-60 overflow-y-auto mt-1">
//             {filteredStations.map((station) => (
//               <li
//                 key={station.properties.station_id}
//                 onClick={() => handleSelectStation(station)}
//                 className="p-2 hover:bg-blue-100 cursor-pointer"
//               >
//                 {station.properties.address} ({station.properties.num_bikes_available} bikes)
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Refresh Button */}
//       <button
//         onClick={fetchStations}
//         className="absolute top-4 right-4 z-[1000] p-2 bg-blue-600 backdrop-blur-md rounded shadow-lg hover:bg-blue-700"
//         disabled={loading}
//       >
//         {loading ? "Refreshing..." : "Refresh Bikes"}
//       </button>

//       <MapContainer center={[53.3498, -6.2603]} zoom={14} style={{ height: "90vh", width: "100%" }}>
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution="&copy; OpenStreetMap contributors"
//         />

//         {stations.map((station, i) => {
//           const [lng, lat] = station.geometry.coordinates;
//           const { name, address, num_bikes_available, num_docks_available, capacity, station_id } = station.properties;

//           // Determine icon
//           let icon = bikeIcon;
//           if (highlightedStation?.properties.station_id === station_id) icon = highlightedBikeIcon;
//           if (selectedStation?.properties.station_id === station_id) icon = selectedStationIcon;

//           return (
//             <Marker key={i} position={[lat, lng]} icon={icon}>
//               <Popup>
//                 <b>{name}</b><br/>
//                 📍 {address}<br/>
//                 🚲 Bikes Available: {num_bikes_available}<br/>
//                 🅿️ Free Docks: {num_docks_available}<br/>
//                 🔢 Capacity: {capacity}
//               </Popup>
//             </Marker>
//           );
//         })}

//         {/* Pan to selected station or max bikes station */}
//         {selectedStation && <PanTo position={selectedStation.geometry.coordinates.slice().reverse()} />}
//         {!selectedStation && highlightedStation && <PanTo position={highlightedStation.geometry.coordinates.slice().reverse()} />}
//       </MapContainer>
//     </div>
//   );
// }