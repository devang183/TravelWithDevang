'use client';
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

// Bike icon
const bikeIcon = L.icon({
  iconUrl: "/images/mapicons/bike.png", // normal bike
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// E-bike icon
const ebikeIcon = L.icon({
  iconUrl: "/images/mapicons/e-bike.png",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function DublinLiveBikesMap() {
  const [bikes, setBikes] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'bike', 'ebike'

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

  useEffect(() => {
    fetchBikes(); // initial fetch
  }, []);

  const filteredBikes = getFilteredBikes();

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
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
            >
              <Popup>
                <b>Bike ID:</b> {bike_id}<br/>
                <b>Type:</b> {vehicle_type_id.replace("SHA:VehicleType:", "")}<br/>
                <b>Last Updated:</b> {last_updated_dt}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// 'use client';
// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import 'leaflet/dist/leaflet.css';

// // Bike icon
// const bikeIcon = L.icon({
//   iconUrl: "/images/mapicons/bike.png", // normal bike
//   iconSize: [25, 25],
//   iconAnchor: [12, 12],
//   popupAnchor: [0, -12],
// });

// // E-bike icon
// const ebikeIcon = L.icon({
//   iconUrl: "/images/mapicons/e-bike.png",
//   iconSize: [25, 25],
//   iconAnchor: [12, 12],
//   popupAnchor: [0, -12],
// });

// export default function DublinLiveBikesMap() {
//   const [bikes, setBikes] = useState([]);

//   const fetchBikes = () => {
//     fetch("https://data.smartdublin.ie/mobybikes-api/bikes/mobymoby_dublin/current/bikes.geojson")
//       .then(res => res.json())
//       .then(data => setBikes(data.features))
//       .catch(err => console.error("Error fetching bikes:", err));
//   };

//   useEffect(() => {
//     fetchBikes(); // initial fetch
//   }, []);

//   return (
//     <div style={{ height: "100vh", width: "100%", position: "relative" }}>
//       <button
//         onClick={fetchBikes}
//         className="absolute top-4 right-4 z-[1000] p-2 bg-blue-600 backdrop-blur-md rounded shadow-lg hover:bg-blue-700"
//         style={{
//             backgroundColor: "rgba(255, 255, 255, 0.3)",
//             borderRadius: "8px",
//             fontSize: "0.9rem",
//             cursor: "pointer",
//             transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
//           }}
//           onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; }}
//           onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}      >
//         Refresh Bikes
//       </button>
//       <MapContainer center={[53.3498, -6.2603]} zoom={14} style={{ height: "100%", width: "100%" }}>
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution="&copy; OpenStreetMap contributors"
//         />
//         {bikes.map((bike, i) => {
//           const [lng, lat] = bike.geometry.coordinates;
//           const { bike_id, vehicle_type_id, last_updated_dt } = bike.properties;
//           return (
//             <Marker
//               key={bike_id}
//               position={[lat, lng]}
//               icon={vehicle_type_id.includes("E_BIKE") ? ebikeIcon : bikeIcon}
//             >
//               <Popup>
//                 <b>Bike ID:</b> {bike_id}<br/>
//                 <b>Type:</b> {vehicle_type_id.replace("SHA:VehicleType:", "")}<br/>
//                 <b>Last Updated:</b> {last_updated_dt}
//               </Popup>
//             </Marker>
//           );
//         })}
//       </MapContainer>
//     </div>
//   );
// }