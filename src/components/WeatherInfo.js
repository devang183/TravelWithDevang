"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WeatherInfo({ coords }) {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // const fetchWeatherData = async () => {
  //   setLoading(true);
  //   try {
  //     const [lat, lon] = coords;

  //     const [weatherRes, aqiRes] = await Promise.all([
  //       fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9993e961c0650adcf0d90536f3cdd857&units=metric`),
  //       fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=9993e961c0650adcf0d90536f3cdd857`)
  //     ]);

  //     const weatherData = await weatherRes.json();
  //     const aqiData = await aqiRes.json();

  //     setWeather(weatherData);
  //     setAqi(aqiData);
  //   } catch (error) {
  //     console.error("Error fetching weather or AQI data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const [lat, lon] = coords;
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setWeather(data.weather);
      setAqi(data.aqi);
    } catch (err) {
      console.error("Error fetching weather or AQI data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWeatherData();
  }, [coords]);

  if (!weather || !weather.weather || !weather.main || !aqi?.list?.[0]) return null;

  const aqiValue = aqi.list[0].main.aqi;
  const aqiLevels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
  const aqiText = aqiLevels[aqiValue] || "Unknown";

  return (
    <>
      <AnimatePresence>
        {expanded ? (
          <motion.div
            key="weather"
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-4 max-w-md bg-white/30 backdrop-blur-md rounded-lg shadow-2xl p-6 z-40 text-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Current Weather</h3>
              <div className="flex gap-2">
                <button
                  onClick={fetchWeatherData}
                  disabled={loading}
                  className="bg-white/30 px-3 py-1 text-black font-semibold rounded hover:bg-white/10 transition text-sm"
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Collapse weather widget"
                  className="bg-gray-300 hover:bg-gray-400 rounded-full p-1 text-black transition"
                >
                  &#x2715;
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="w-16 h-16"
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              />
              <p className="text-base capitalize">{weather.weather[0].description}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-black">
              <p><strong>Temp:</strong> {weather.main.temp}°C</p>
              <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
              <p><strong>Wind:</strong> {weather.wind.speed} m/s</p>
              <p><strong>Feels Like:</strong> {weather.main.feels_like}°C</p>
              <p><strong>Visibility:</strong> {weather.visibility / 1000} km</p>
              <p><strong>Sunrise:</strong> {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
              <p><strong>Sunset:</strong> {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
              <p><strong>AQI:</strong> {aqiText} ({aqiValue})</p>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="toggle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            onClick={() => setExpanded(true)}
            aria-label="Expand weather widget"
            className="fixed top-20 right-4 z-40 w-10 h-10 rounded-full bg-[#8ba6ab] hover:bg-[#6c8185] text-white shadow-lg flex items-center justify-center transition"
          >
            &#9728;
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

// "use client";

// import { useEffect, useState } from "react";

// export default function WeatherInfo({ coords }) {
//   const [weather, setWeather] = useState(null);
//   const [aqi, setAqi] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [expanded, setExpanded] = useState(false);  // collapse/expand state

//   const fetchWeatherData = async () => {
//     setLoading(true);
//     try {
//       const [lat, lon] = coords;

//       const [weatherRes, aqiRes] = await Promise.all([
//         fetch(
//           `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9993e961c0650adcf0d90536f3cdd857&units=metric`
//         ),
//         fetch(
//           `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=9993e961c0650adcf0d90536f3cdd857`
//         ),
//       ]);

//       const weatherData = await weatherRes.json();
//       const aqiData = await aqiRes.json();

//       setWeather(weatherData);
//       setAqi(aqiData);
//     } catch (error) {
//       console.error("Error fetching weather or AQI data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWeatherData();
//   }, [coords]);

//   if (!weather || !weather.weather || !weather.main || !aqi?.list?.[0]) {
//     return null;
//   }

//   const aqiValue = aqi.list[0].main.aqi;
//   const aqiLevels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
//   const aqiText = aqiLevels[aqiValue] || "Unknown";

//   return (
//     <>
//       {expanded ? (
//         <div className="fixed top-4 right-4 max-w-md bg-white rounded-lg shadow-2xl p-6 z-50 text-sm">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-xl font-semibold">Current Weather</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={fetchWeatherData}
//                 disabled={loading}
//                 className="bg-green-500 px-3 py-1 text-black font-semibold rounded hover:bg-green-600 transition text-sm"
//               >
//                 {loading ? "Refreshing..." : "Refresh"}
//               </button>
//               <button
//                 onClick={() => setExpanded(false)}
//                 aria-label="Collapse weather widget"
//                 className="bg-gray-300 hover:bg-gray-400 rounded-full p-1 text-black transition"
//               >
//                 &#x2715; {/* Cross icon */}
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 mb-4">
//             <img
//               src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
//               alt={weather.weather[0].description}
//               className="w-16 h-16"
//             />
//             <p className="text-base capitalize">{weather.weather[0].description}</p>
//           </div>

//           <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-black">
//             <p>
//               <strong>Temp:</strong> {weather.main.temp}°C
//             </p>
//             <p>
//               <strong>Humidity:</strong> {weather.main.humidity}%
//             </p>
//             <p>
//               <strong>Wind:</strong> {weather.wind.speed} m/s
//             </p>
//             <p>
//               <strong>Feels Like:</strong> {weather.main.feels_like}°C
//             </p>
//             <p>
//               <strong>Visibility:</strong> {weather.visibility / 1000} km
//             </p>
//             <p>
//               <strong>Sunrise:</strong> {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
//             </p>
//             <p>
//               <strong>Sunset:</strong> {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
//             </p>
//             <p>
//               <strong>AQI:</strong> {aqiText} ({aqiValue})
//             </p>
//           </div>
//         </div>
//       ) : (
//         <button
//           onClick={() => setExpanded(true)}
//           aria-label="Expand weather widget"
//           className="fixed top-4 right-4 z-50 w-6 h-6 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition"
//         >
//           &#9728; {/* Sun icon or use any icon here */}
//         </button>
//       )}
//     </>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";

// export default function WeatherInfo({ coords }) {
//   const [weather, setWeather] = useState(null);
//   const [aqi, setAqi] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchWeatherData = async () => {
//     setLoading(true);
//     try {
//       const [lat, lon] = coords;

//       const [weatherRes, aqiRes] = await Promise.all([
//         fetch(
//           `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9993e961c0650adcf0d90536f3cdd857&units=metric`
//         ),
//         fetch(
//           `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=9993e961c0650adcf0d90536f3cdd857`
//         ),
//       ]);

//       const weatherData = await weatherRes.json();
//       const aqiData = await aqiRes.json();

//       setWeather(weatherData);
//       setAqi(aqiData);
//     } catch (error) {
//       console.error("Error fetching weather or AQI data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWeatherData();
//   }, [coords]);

//   if (!weather || !weather.weather || !weather.main || !aqi?.list?.[0]) {
//     return null;
//   }

//   const aqiValue = aqi.list[0].main.aqi;
//   const aqiLevels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
//   const aqiText = aqiLevels[aqiValue] || "Unknown";

//   return (
//     <div className="fixed top-4 right-4 max-w-md bg-white rounded-lg shadow-2xl p-6 z-50 text-sm">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-xl font-semibold">Current Weather</h3>
//         <button
//           onClick={fetchWeatherData}
//           disabled={loading}
//           className="bg-green-500 px-3 py-1 text-black font-semibold rounded hover:bg-green-600 transition text-sm"
//         >
//           {loading ? "Refreshing..." : "Refresh"}
//         </button>
//       </div>

//       <div className="flex items-center gap-4 mb-4">
//         <img
//           src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
//           alt={weather.weather[0].description}
//           className="w-16 h-16"
//         />
//         <p className="text-base capitalize">{weather.weather[0].description}</p>
//       </div>

//       <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-black">
//         <p><strong>Temp:</strong> {weather.main.temp}°C</p>
//         <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
//         <p><strong>Wind:</strong> {weather.wind.speed} m/s</p>
//         <p><strong>Feels Like:</strong> {weather.main.feels_like}°C</p>
//         <p><strong>Visibility:</strong> {weather.visibility / 1000} km</p>
//         <p><strong>Sunrise:</strong> {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
//         <p><strong>Sunset:</strong> {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
//         <p><strong>AQI:</strong> {aqiText} ({aqiValue})</p>
//       </div>
//     </div>
//   );
// }

// // components/WeatherInfo.js
// "use client";

// import { useEffect, useState } from "react";

// export default function WeatherInfo({ coords }) {
//   const [weather, setWeather] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [aqi, setAqi] = useState(null);
//   const fetchWeather = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&appid=9993e961c0650adcf0d90536f3cdd857&units=metric`
//       );
//       const data = await res.json();
//       setWeather(data);
//     } catch (error) {
//       console.error("Error fetching weather:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWeather();
//   }, [coords]);

//   if (!weather || !weather.weather || !weather.main) {
//     return ;
//   }

//   return (
//     <div className="fixed top-4 right-4 w-150 bg-white rounded-lg shadow-2xl shadow-gray-800 p-6 z-50">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-xl font-semibold">Current Weather</h3>
//         <button
//           onClick={fetchWeather}
//           disabled={loading}
//           className="bg-green-500 px-3 py-1 text-black font-semibold rounded shadow hover:bg-green-600 transition text-sm"
//         >
//           {loading ? "Refreshing..." : "Refresh"}
//         </button>
//       </div>
//       <div className="flex items-center gap-4 mb-4">
//         <img
//           src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
//           alt={weather.weather[0].description}
//           className="w-16 h-16"
//         />
//         <p className="text-lg capitalize">{weather.weather[0].description}</p>
//       </div>
//       <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-black">
//         <p><strong>Temperature:</strong> {weather.main.temp}°C    <strong>Humidity:</strong> {weather.main.humidity}%</p>
//         <p><strong>Wind:</strong> {weather.wind.speed} m/s        <strong>Feels Like:</strong> {weather.main.feels_like}°C</p>
//       </div>
//     </div>
//   );
// }

// -------------------------------------

// // components/WeatherInfo.js
// "use client";

// import { useEffect, useState } from "react";

// export default function WeatherInfo({ coords }) {
//   const [weather, setWeather] = useState(null);

//   useEffect(() => {
//     const fetchWeather = async () => {
//       const res = await fetch(
//         `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&appid=9993e961c0650adcf0d90536f3cdd857&units=metric`
//       );
//     //   const res = await fetch(
//     //     `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=9993e961c0650adcf0d90536f3cdd857`
//     //   );
    
//       const data = await res.json();
//       setWeather(data);
//     };

//     fetchWeather();
//   }, [coords]);

//   // ✅ Wait until weather data is loaded and valid
//   if (!weather || !weather.weather || !weather.main) {
//     return <p>Loading weather...</p>;
//   }

//   return (
//     <div className="fixed top-4 right-4 max-w-sm bg-white rounded-lg shadow-xl p-6 z-50">
//       <h3 className="text-xl font-semibold mb-4">Current Weather</h3>
//       <div className="flex items-center gap-4 mb-4">
//         <img
//             src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
//             alt={weather.weather[0].description}
//             className="w-16 h-5"
//         />
//         <p className="text-lg capitalize">{weather.weather[0].description}</p>
//       </div>
//       {/* <p>{weather.weather[0].description}</p> */}
//       <p>Temperature: {weather.main.temp}°C</p>
//       <p>Humidity: {weather.main.humidity}%</p>
//       <p>Wind: {weather.wind.speed} m/s, {weather.wind.deg}°</p>
//       <p>Feels Like: {weather.main.feels_like}°C</p>
//       <p>Pressure: {weather.main.pressure} hPa</p>
//       <p>Visibility: {weather.visibility / 1000} km</p>
//       <p>Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
//       <p>Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
//       <p>Cloudiness: {weather.clouds.all}%</p>

//     </div>
//   );
// }