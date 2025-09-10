// 'use client';
// import { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet.fullscreen/Control.FullScreen.css';
// // import { photos } from '@/app/test-cities/CityPhotos';
// import { photos } from '@/app/test-cities/CityPhotos';

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// export default function WorldMap({ selectedCity, onCitySelect }) {
//   const mapRef = useRef(null);
//   const markersRef = useRef({});
//   const recenterBtnRef = useRef(null);
//   const originalCenter = [30, 0];
//   const originalZoom = 2.2;

//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://unpkg.com/leaflet.fullscreen/Control.FullScreen.js';
//     script.async = true;
//     script.onload = () => {
//       if (L.DomUtil.get('map') && !mapRef.current) {
//         // Define world bounds to prevent infinite scrolling
//         const worldBounds = [
//           [-90, -180], // Southwest coordinates
//           [90, 180]    // Northeast coordinates
//         ];

//         mapRef.current = L.map('map', {
//           fullscreenControl: true,
//           fullscreenControlOptions: { position: 'topright' },
//           // Prevent infinite horizontal scrolling
//           worldCopyJump: false,
//           // Set maximum bounds to prevent panning outside the world
//           maxBounds: worldBounds,
//           maxBoundsViscosity: 1.0,
//           // Set zoom constraints
//           minZoom: 1,
//           maxZoom: 18,
//           // Prevent zooming out too far
//           zoomSnap: 0.1,
//           zoomDelta: 0.1
//         }).setView(originalCenter, originalZoom);

//         // Function to create a custom icon
//   const createCustomIcon = (color = '#3b82f6') => {
//     return L.divIcon({
//       html: `
//         <div style="
//           width: 24px;
//           height: 24px;
//           background: ${color};
//           border-radius: 50% 50% 50% 0;
//           position: relative;
//           transform: rotate(-45deg);
//           box-shadow: 0 0 10px rgba(0,0,0,0.2);
//         ">
//           <div style="
//             position: absolute;
//             width: 8px;
//             height: 8px;
//             background: white;
//             border-radius: 50%;
//             top: 50%;
//             left: 50%;
//             margin: -4px 0 0 -4px;
//             transform: rotate(45deg);
//           "></div>
//         </div>
//       `,
//       className: '',
//       iconSize: [24, 24],
//       iconAnchor: [12, 24],
//       popupAnchor: [0, -24]
//     });
//   };

//   // Function to add a city marker to the map
//   const addCityMarker = (city) => {
//     if (!city.coords || !Array.isArray(city.coords) || city.coords.length !== 2) {
//       console.warn(`Invalid coordinates for city: ${city.name}`, city.coords);
//       return null;
//     }
    
//     const [lat, lng] = city.coords;
    
//     // Skip if coordinates are not valid
//     if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
//       console.warn(`Invalid coordinates for city: ${city.name}`, [lat, lng]);
//       return null;
//     }
    
//     const marker = L.marker([lat, lng], {
//       icon: createCustomIcon(selectedCity?.name === city.name ? '#ef4444' : '#3b82f6'),
//       cityName: city.name,
//       riseOnHover: true
//     }).addTo(mapRef.current);
    
//     // Add popup with city info
//     const popupContent = `
//       <div class="p-2">
//         <h3 class="font-bold text-lg">${city.name}</h3>
//         ${city.country ? `<p class="text-gray-600">${city.country}</p>` : ''}
//         ${city.date ? `<p class="text-sm text-gray-500">${city.date}</p>` : ''}
//         ${city.food ? `<p class="mt-1 text-sm">${city.food}</p>` : ''}
//       </div>
//     `;
    
//     marker.bindPopup(popupContent);
    
//     // Add click handler
//     marker.on('click', () => {
//       handleCitySelect(city);
//     });
    
//     return marker;
//   };

//   // Function to handle city selection
//   const handleCitySelect = (city) => {
//     if (city && city.coords && mapRef.current) {
//       // Fly to the selected city
//       mapRef.current.flyTo(city.coords, 12, {
//         duration: 1.5,
//         easeLinearity: 0.5
//       });
      
//       // Highlight the selected marker
//       Object.values(markersRef.current).forEach(marker => {
//         if (marker) {
//           const isSelected = marker.options.cityName === city.name;
//           marker.setIcon(createCustomIcon(isSelected ? '#ef4444' : '#3b82f6'));
          
//           if (isSelected) {
//             marker.openPopup();
//           }
//         }
//       });
      
//       // Call the onCitySelect prop if provided
//       if (onCitySelect) {
//         onCitySelect(city);
//       }
//     }
//   };
  
//   // Effect to handle selectedCity changes
//   useEffect(() => {
//     if (selectedCity) {
//       handleCitySelect(selectedCity);
//     }
//   }, [selectedCity]);

//   // Add tile layer with proper bounds
//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: '&copy; OpenStreetMap contributors',
//           maxZoom: 18,
//           minZoom: 1,
//           // Prevent tiles from repeating horizontally
//           noWrap: true,
//           // Set bounds for tile layer
//           bounds: worldBounds
//         }).addTo(mapRef.current);

//         // Add event listener to enforce zoom constraints
//         mapRef.current.on('zoomend', function() {
//           if (mapRef.current.getZoom() < 1) {
//             mapRef.current.setZoom(1);
//           }
//         });

//         // Add event listener to enforce zoom constraints and add city markers
//         mapRef.current.on('zoomend', function() {
//           if (mapRef.current.getZoom() < 1) {
//             mapRef.current.setZoom(1);
//           }

//           // Add markers for all cities
//           window.citiesForMap.forEach(city => {
//             if (city.coords && city.coords.length === 2) {
//               const marker = addCityMarker(city);
//               if (marker) {
//                 markersRef.current[city.name] = marker;
//               }
//             }
//           });
//         });

//         // Add event listener to enforce pan constraints
//         mapRef.current.on('moveend', function() {
//           const bounds = mapRef.current.getBounds();
//           const center = mapRef.current.getCenter();
          
//           // If we've gone too far horizontally, bring it back
//           if (center.lng > 180 || center.lng < -180) {
//             let newLng = center.lng;
//             while (newLng > 180) newLng -= 360;
//             while (newLng < -180) newLng += 360;
//             mapRef.current.panTo([center.lat, newLng]);
//           }
//         });

//         // Add city markers after the map is initialized
//         const addCityMarkers = () => {
//           // Make cities available globally for the marker creation
//           window.citiesForMap = [
//           { 
//             name: 'Dublin', 
//             coords: [53.3498, -6.2603], 
//             country: 'Ireland', 
//             date: '2024-11-08', 
//             food: 'Irish Stew, Fish & Chips, Spice Bag(Xian Street Food), and Hot Chocolate(Butlers Hot Chocolate)',
//             images: typeof photos !== 'undefined' && photos.dublin ? photos.dublin.images : []
//           },
//           { 
//             name: 'Newry', 
//             coords: [54.175, -6.349], 
//             country: 'Northern Ireland', 
//             date: '2024-11-08', 
//             food: 'Himalayan Spicy Shawarma, Cheese Chips, and Hot Chocolate',
//             images: typeof photos !== 'undefined' && photos.newry ? photos.newry.images : []
//           },
//           { 
//             name: 'London', 
//             coords: [51.8787, -0.4200], 
//             country: 'United Kingdom', 
//             date: '2024-11-01', 
//             food: 'Cream Tea, Dumplings, Doner Kebab, and Hot Chocolate',
//             images: typeof photos !== 'undefined' && photos.london ? photos.london.images : []
//           },
//           { 
//             name: 'Belfast', 
//             coords: [54.5973, -5.9301], 
//             country: 'Northern Ireland', 
//             date: '2024-11-13', 
//             food: 'Doner Kebab, Chips, and Hot Chocolate',
//             images: typeof photos !== 'undefined' && photos.belfast ? photos.belfast.images : []
//           },
//           { 
//             name: 'Liverpool', 
//             coords: [53.4084, -2.9916], 
//             country: 'United Kingdom', 
//             date: '2024-12-21', 
//             food: 'Cheese Chips, Doner Kebab, Hot Chocolate(The Chocolate), and Christmas Cheesecake(Starbucks)',
//             images: typeof photos !== 'undefined' && photos.liverpool ? photos.liverpool.images : []
//           },
//           { 
//             name: 'Newyork', 
//             coords: [40.7128, -74.0060], 
//             country: 'United States of America', 
//             date: '2025-05-07', 
//             food: 'Chana Samosa(Priti Corner), Sandwich Samosa(Haldirams), and Adrak ki Chai(Amrutulya, Sadar)',
//             images: typeof photos !== 'undefined' && photos.newyork ? photos.newyork.images : []
//           },
//           { 
//             name: 'Chicago', 
//             coords: [41.8781, -87.6298], 
//             country: 'United States of America', 
//             date: '2024-12-26', 
//             food: 'Himalayan Spicy Shawarma, Cheese Chips, and Hot Chocolate',
//             images: typeof photos !== 'undefined' && photos.chicago ? photos.chicago.images : []
//           },
//           { 
//             name: 'Birmingham', 
//             coords: [52.4862, -1.8904], 
//             country: 'United Kingdom', 
//             date: '2025-01-05', 
//             food: 'Chole Parantha(Bangladeshi Food Stall), Aloo Samosa(Pakistani Food Stall), Hot Chocolate(some family business cafe), more Hot Chocolate(The Soho), Breakfast(Rooted in Mumbai), more Hot Chocolate(200 degrees)',
//             images: typeof photos !== 'undefined' && photos.birmingham ? photos.birmingham.images : []
//           },
//           { 
//             name: 'Manchester', 
//             coords: [53.4808, -2.2426], 
//             country: 'United Kingdom', 
//             date: '2025-01-25', 
//             food: 'Masala Dosa+Chai(Chennai Dosa), Rajma+Chole+Aloo Rice(This and That), Samosa Chutney(), Chole Kulchey(Sanam Sweet Centre), and Hot Chocolate(ManCoCo - Coffee Bar & Roastery), more Hot Chocolate(Waterside Coffee House)',
//             images: typeof photos !== 'undefined' && photos.manchester ? photos.manchester.images : []
//           },
//           { 
//             name: 'Leeds', 
//             coords: [53.8008, -1.5491], 
//             country: 'United Kingdom', 
//             date: '2023-02-08', 
//             food: 'Shawarma+Chips(Mersin Shawarma), Masala Dosa+Filter Coffee(Arusuvai Restaurant), Shawarma+Chips(Chickos Carribean), Hot Chocolate(Icestone Gelato), Prasad(BAPS Shri Swaminarayan Mandir)',
//             images: typeof photos !== 'undefined' && photos.leeds ? photos.leeds.images : []
//           },
//           { 
//             name: 'Malahide', 
//             coords: [53.4508, -6.1544], 
//             country: 'Ireland', 
//             date: '2025-03-08', 
//             food: 'The capital of Northern Ireland, known for its maritime history.',
//             images: typeof photos !== 'undefined' && photos.malahide ? photos.malahide.images : []
//           },
//           { 
//             name: 'Naas', 
//             coords: [53.2158, -6.6669], 
//             country: 'Ireland', 
//             date: '2025-05-12', 
//             food: 'Salad, Roll, and Hot Chocolate',
//             images: typeof photos !== 'undefined' && photos.naas ? photos.naas.images : []
//           },
//           { 
//             name: 'Maynooth', 
//             coords: [53.2158, -6.6669], 
//             country: 'Ireland', 
//             date: '2025-05-12', 
//             food: 'Salad, Roll, and Hot Chocolate',
//             images: typeof photos !== 'undefined' && photos.naas ? photos.naas.images : []
//           },
//           { 
//             name: 'Galway', 
//             coords: [53.2707, -9.0568], 
//             country: 'Ireland', 
//             date: '2025-06-17', 
//             food: 'Irish Stew, Fish & Chips, Spice Bag(Xian Street Food), and Hot Chocolate(Butlers Hot Chocolate)',
//             images: typeof photos !== 'undefined' && photos.galway ? photos.galway.images : []
//           },
//           { 
//             name: 'Rabat', 
//             coords: [34.020882, -6.84165], 
//             country: 'Morocco', 
//             date: '2025-05-15', 
//             food: 'Nutella Crepe(Rabat Old Market), Breakfast(Loqma Hania), Moroccan Tea(Chabab)',
//             images: typeof photos !== 'undefined' && photos.rabat ? photos.rabat.images : []
//           },
//           { 
//             name: 'Delhi', 
//             coords: [28.6139, 77.209], 
//             country: 'India', 
//             date: '2025-05-12', 
//             food: 'Khurchan Parantha(Paranthe wali gali), Chole Kulchey, Pav Bhaji, Steam Momos, Roll, and Coconut Water',
//             images: typeof photos !== 'undefined' && photos.delhi ? photos.delhi.images : []
//           },    
//           { 
//             name: 'Raipur', 
//             coords: [21.2514, 81.6296], 
//             country: 'India', 
//             date: '2025-06-28', 
//             food: 'Pani Puri(Alka Chaat Bhandar), Kathi Roll(Food Court), Masala Chai+Butter Bun(Chai Sutta Bar)',
//             images: typeof photos !== 'undefined' && photos.nagpur ? photos.nagpur.images : []
//           },
//           { 
//             name: 'Muharraq', 
//             coords: [26.2572, 50.6119],
//             country: 'Bahrain', 
//             date: '2025-06-26', 
//             food: 'Flight layover',
//             images: typeof photos !== 'undefined' && photos.raipur ? photos.raipur.images : []
//           },
//           { 
//             name: 'Nagpur', 
//             coords: [21.1458, 79.0882], 
//             country: 'India', 
//             date: '2025-05-07', 
//             food: 'Chana Samosa(Priti Corner), Sandwich Samosa(Haldirams), and Adrak ki Chai(Amrutulya, Sadar)',
//             images: typeof photos !== 'undefined' && photos.dublin ? photos.dublin.images : []
//           },
//           { 
//             name: 'Newquay', 
//             coords: [50.4155, -5.0737], 
//             country: 'United Kingdom', 
//             date: '2025-09-02', 
//             food: 'Chana Samosa(Priti Corner), Sandwich Samosa(Haldirams), and Adrak ki Chai(Amrutulya, Sadar)',
//             images: typeof photos !== 'undefined' && photos.dublin ? photos.dublin.images : []
//           },
//         ];

//         cities.forEach((city, index) => {
//           const imageSlider = city.images && city.images.length
//             ? `
//               <div class="popup-slider" id="slider-${index}">
//                 ${city.images.map((img, i) => `
//                   <img src="${img}" class="popup-slide" style="display:${i === 0 ? 'block' : 'none'}; width:100%; border-radius:6px; margin-bottom:6px; transition: opacity 0.5s ease;" />
//                 `).join('')}
//                 <div style="display:flex; justify-content:center; gap:8px; margin:6px 0;">
//                   ${city.images.map((_, i) => `
//                     <div id="bar-${index}-${i}" style="flex:1; height:4px; background:${i === 0 ? '#007bff' : '#ccc'}; transition: background 0.3s ease;"></div>
//                   `).join('')}
//                 </div>
//                 <div style="text-align:center; margin-bottom: 8px;">
//                   <button onclick="showPrev(${index})" style="cursor:pointer; font-size:18px; background:none; border:none; padding:4px 8px;">‹</button>
//                   <button onclick="showNext(${index})" style="cursor:pointer; font-size:18px; background:none; border:none; padding:4px 8px;">›</button>
//                 </div>
//               </div>
//             `
//             : '';

//           const popupContent = `
//             ${imageSlider}
//             <b><a href="/test-cities/${city.name.toLowerCase()}" style="text-decoration:none; color:#007bff;">${city.name}</a></b><br/>
//             <b>Country:</b> ${city.country}<br/>
//             <b>Date Visited:</b> ${city.date}<br/>
//             <b>Best Food:</b> ${city.food}
//           `;
//           L.marker(city.coords).addTo(mapRef.current).bindPopup(popupContent, { maxWidth: 250 });
//         });

//         if (recenterBtnRef.current) {
//           recenterBtnRef.current.addEventListener('click', () => {
//             mapRef.current.setView(originalCenter, originalZoom);
//           });
//         }
//       }

//       // Global functions for image slider
//       window.showNext = (index) => {
//         const slides = document.querySelectorAll(`#slider-${index} .popup-slide`);
//         const bars = document.querySelectorAll(`#slider-${index} [id^='bar-${index}-']`);
//         if (!slides.length) return;
//         let current = [...slides].findIndex(slide => slide.style.display === 'block');
//         slides[current].style.display = 'none';
//         bars[current].style.background = '#ccc';
//         const next = (current + 1) % slides.length;
//         slides[next].style.display = 'block';
//         bars[next].style.background = '#007bff';
//       };

//       window.showPrev = (index) => {
//         const slides = document.querySelectorAll(`#slider-${index} .popup-slide`);
//         const bars = document.querySelectorAll(`#slider-${index} [id^='bar-${index}-']`);
//         if (!slides.length) return;
//         let current = [...slides].findIndex(slide => slide.style.display === 'block');
//         slides[current].style.display = 'none';
//         bars[current].style.background = '#ccc';
//         const prev = (current - 1 + slides.length) % slides.length;
//         slides[prev].style.display = 'block';
//         bars[prev].style.background = '#007bff';
//       };
//     };

//     document.body.appendChild(script);

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//       // Clean up global functions
//       if (typeof window !== 'undefined') {
//         delete window.showNext;
//         delete window.showPrev;
//       }
//     };
//   }, []);

//   return (
//     <div className="w-full flex justify-center">
//       <div
//         className="relative z-10"
//         style={{
//           width: '78vw',
//           height: '600px',
//           borderRadius: '50px',
//           marginTop: '2rem',
//         }}
//       >
//         <div
//           id="map"
//           className="z-10"
//           style={{
//             width: '100%',
//             height: '100%',
//             borderRadius: '20px',
//             position: 'relative',
//             zIndex: 10,
//           }}
//         />
//         <button
//           ref={recenterBtnRef}
//           className="absolute bottom-5 right-5 px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 z-20"
//         >
//           Recenter
//         </button>
//       </div>
//     </div>
//   );
// }