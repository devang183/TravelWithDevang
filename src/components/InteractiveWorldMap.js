'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import { photos } from '@/app/test-cities/CityPhotos';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const InteractiveWorldMap = ({ selectedCity, onCitySelect, cities = [] }) => {
  const router = useRouter();
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const mapContainerRef = useRef(null);
  const cityListScrollRef = useRef(null);
  const cityButtonRefs = useRef({});
  const previousCityRef = useRef(null);
  const originalCenter = [30, 0];
  const originalZoom = 2.5;

  // Function to create a custom marker icon
  const createCustomIcon = (isSelected = false) => {
    const color = isSelected ? '#ef4444' : '#3b82f6';
    return L.divIcon({
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          position: relative;
          transform: rotate(-45deg);
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
        ">
          <div style="
            position: absolute;
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            margin: -4px 0 0 -4px;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  };

  // Function to create image carousel HTML
  const createImageCarousel = (city) => {
    const cityPhotos = photos[city.name.toLowerCase()]?.images || [];
    const cityId = city.id || city.name.toLowerCase().replace(/\s+/g, '-');

    if (cityPhotos.length === 0) return '';

    const sliderId = `slider-${cityId}`;
    const slides = cityPhotos.map((img, idx) => `
      <div class="popup-slide" style="display: ${idx === 0 ? 'block' : 'none'}; width: 100%;">
        <img src="${img}" alt="${city.name} ${idx + 1}" class="w-full h-40 object-cover rounded-t-lg">
      </div>
    `).join('');

    const dots = cityPhotos.map((_, idx) => `
      <div
        id="bar-${cityId}-${idx}"
        class="h-1 flex-1 mx-0.5 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300'}"
        style="cursor: pointer;"
        onclick="window.showNext('${sliderId}')"
      ></div>
    `).join('');

    // Only show arrows if there's more than one image
    const arrows = cityPhotos.length > 1 ? `
      <div
        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 cursor-pointer hover:bg-opacity-75"
        onclick="event.stopPropagation(); const sliderId = this.closest('[id^=slider-]').id; window.showPrev(sliderId);"
      >
        &larr;
      </div>
      <div
        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 cursor-pointer hover:bg-opacity-75"
        onclick="event.stopPropagation(); const sliderId = this.closest('[id^=slider-]').id; window.showNext(sliderId);"
      >
        &rarr;
      </div>
    ` : '';

    return `
      <div id="${sliderId}" class="w-64">
        <div class="relative group">
          ${slides}
          ${arrows}
          <div class="absolute bottom-0 left-0 right-0 flex p-1">
            ${dots}
          </div>
        </div>
        <div class="p-3 space-y-2">
          <div>
            <h3 class="font-bold text-lg">${city.name}</h3>
            ${city.country ? `<p class="text-gray-600">${city.country}</p>` : ''}
            ${city.date ? `<p class="text-sm text-gray-500">${city.date}</p>` : ''}
            ${city.food ? `<div class="mt-1"><p class="text-sm font-medium">Best Food:</p><p class="text-sm">${city.food}</p></div>` : ''}
          </div>
        </div>
      </div>
    `;
  };

  // Function to add a city marker to the map
  const addCityMarker = (city) => {
    if (!city.coords || !Array.isArray(city.coords) || city.coords.length !== 2) {
      console.warn(`Invalid coordinates for city: ${city.name}`, city.coords);
      return null;
    }
    
    const [lat, lng] = city.coords;
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn(`Invalid coordinates for city: ${city.name}`, [lat, lng]);
      return null;
    }
    
    const marker = L.marker([lat, lng], {
      icon: createCustomIcon(selectedCity?.name === city.name),
      cityName: city.name,
      riseOnHover: true
    }).addTo(mapRef.current);
    
    // Add popup with image carousel and city info
    const popupContent = createImageCarousel(city);
    
    const popup = L.popup({
      maxWidth: 300,
      className: 'custom-popup'
    }).setContent(popupContent);
    
    marker.bindPopup(popup);
    
    // Add click handler for direct marker clicks
    marker.on('click', (e) => {
      handleCitySelect(city, e);
    });

    return marker;
  };

  // Function to handle city selection
  const handleCitySelect = (city, event) => {
    // If it's a popup click, let the popup handle it
    if (event && event.originalEvent && event.originalEvent.target.closest('.popup-content')) {
      return;
    }

    if (city && city.coords && mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const isAlreadyZoomedIn = currentZoom > 8;
      const isSameCity = previousCityRef.current?.name === city.name;

      // If clicking the same city, just ensure it's centered and popup is open
      if (isSameCity && isAlreadyZoomedIn) {
        // Just make sure the popup is open
        const marker = markersRef.current[city.name];
        if (marker && !marker.isPopupOpen()) {
          marker.openPopup();
        }

        // Scroll the city into center view in the horizontal list
        if (cityListScrollRef.current && cityButtonRefs.current[city.name]) {
          const container = cityListScrollRef.current;
          const button = cityButtonRefs.current[city.name];

          const containerWidth = container.offsetWidth;
          const buttonLeft = button.offsetLeft;
          const buttonWidth = button.offsetWidth;

          const scrollTo = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

          container.scrollTo({
            left: scrollTo,
            behavior: 'smooth'
          });
        }

        return;
      }

      // Update previous city reference
      previousCityRef.current = city;

      // If we're already zoomed in on a city, zoom out first
      if (isAlreadyZoomedIn) {
        // Step 1: Fly out (zoom out to see the globe)
        mapRef.current.flyTo(originalCenter, 2, {
          duration: 1.8,
          easeLinearity: 0.15
        });

        // Step 2: After flying out, fly in to the new city
        setTimeout(() => {
          mapRef.current.flyTo(city.coords, 12, {
            duration: 2.0,
            easeLinearity: 0.2
          });

          // Highlight the selected marker after flying in
          Object.entries(markersRef.current).forEach(([name, marker]) => {
            if (marker) {
              const isSelected = name === city.name;
              marker.setIcon(createCustomIcon(isSelected));

              if (isSelected) {
                marker.openPopup();
              }
            }
          });
        }, 1800);
      } else {
        // If not zoomed in, just fly directly to the city
        mapRef.current.flyTo(city.coords, 12, {
          duration: 2.2,
          easeLinearity: 0.2
        });

        // Highlight the selected marker
        Object.entries(markersRef.current).forEach(([name, marker]) => {
          if (marker) {
            const isSelected = name === city.name;
            marker.setIcon(createCustomIcon(isSelected));

            if (isSelected) {
              marker.openPopup();
            }
          }
        });
      }

      // Scroll the city into center view in the horizontal list
      if (cityListScrollRef.current && cityButtonRefs.current[city.name]) {
        const container = cityListScrollRef.current;
        const button = cityButtonRefs.current[city.name];

        const containerWidth = container.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;

        // Calculate scroll position to center the button
        const scrollTo = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

        container.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }

      // Call the onCitySelect prop if provided
      if (onCitySelect) {
        onCitySelect(city);
      }
    }
  };

  // Global functions for image slider
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateSlider = (sliderId, current, next) => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.popup-slide');
        const cityId = sliderId.replace('slider-', '');
        const bars = slider.querySelectorAll(`[id^='bar-${cityId}-']`);
        
        if (!slides.length) return;
        
        // Hide current slide
        if (current >= 0 && current < slides.length) {
          slides[current].style.display = 'none';
          if (bars[current]) bars[current].style.background = '#ccc';
        }
        
        // Show next slide
        if (next >= 0 && next < slides.length) {
          slides[next].style.display = 'block';
          if (bars[next]) bars[next].style.background = '#3b82f6';
        }
      };

      window.showNext = (sliderId) => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.popup-slide');
        if (!slides.length) return;
        
        const current = [...slides].findIndex(slide => 
          window.getComputedStyle(slide).display === 'block'
        );
        const next = (current + 1) % slides.length;
        updateSlider(sliderId, current, next);
      };

      window.showPrev = (sliderId) => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.popup-slide');
        if (!slides.length) return;
        
        const current = [...slides].findIndex(slide => 
          window.getComputedStyle(slide).display === 'block'
        );
        const prev = (current - 1 + slides.length) % slides.length;
        updateSlider(sliderId, current, prev);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.showNext;
        delete window.showPrev;
      }
    };
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      // Define world bounds to prevent infinite scrolling
      const worldBounds = [
        [-90, -180], // Southwest coordinates
        [90, 180]    // Northeast coordinates
      ];

      // Initialize the map
      mapRef.current = L.map(mapContainerRef.current, {
        fullscreenControl: true,
        fullscreenControlOptions: { position: 'topright' },
        worldCopyJump: false,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 1,
        maxZoom: 18,
        zoomSnap: 0.1,
        zoomDelta: 0.1
      }).setView(originalCenter, originalZoom);

      // Add the base map layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 1,
        noWrap: true,
        bounds: worldBounds
      }).addTo(mapRef.current);

      // Add city markers
      cities.forEach(city => {
        if (city.coords && city.coords.length === 2) {
          const marker = addCityMarker(city);
          if (marker) {
            markersRef.current[city.name] = marker;
          }
        }
      });

      // Add event listeners
      mapRef.current.on('zoomend', () => {
        if (mapRef.current.getZoom() < 1) {
          mapRef.current.setZoom(1);
        }
      });

      mapRef.current.on('moveend', () => {
        const center = mapRef.current.getCenter();

        // Prevent wrapping around the world
        if (center.lng > 180 || center.lng < -180) {
          let newLng = center.lng;
          while (newLng > 180) newLng -= 360;
          while (newLng < -180) newLng += 360;
          mapRef.current.panTo([center.lat, newLng]);
        }
      });

      // If there's a selected city, center on it
      if (selectedCity) {
        handleCitySelect(selectedCity);
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Update markers when selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      handleCitySelect(selectedCity);
    }
  }, [selectedCity]);

  // Sort cities alphabetically by name
  const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full flex justify-center">
      <div
        className="relative z-10"
        style={{
          width: '100%',
          height: '700px',
          borderRadius: '20px',
        }}
      >
        <div
          ref={mapContainerRef}
          className="w-full h-full rounded-lg"
          style={{
            position: 'relative',
            zIndex: 10,
          }}
        />

        {/* Recenter Button */}
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo(originalCenter, originalZoom, {
                duration: 1,
                easeLinearity: 0.5
              });
            }
          }}
          className="absolute bottom-24 right-5 px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 z-30"
        >
          Recenter
        </button>

        {/* Horizontal Scrollable City List Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div
            ref={cityListScrollRef}
            className="overflow-x-auto overflow-y-hidden px-4 py-3"
            style={{
              height: '100px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#3b82f6 rgba(0,0,0,0.1)'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                height: 6px;
              }
              div::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1);
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb {
                background: #3b82f6;
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: #2563eb;
              }
            `}</style>
            <div className="flex gap-3 h-full items-center">
              {sortedCities.map((city) => (
                <div
                  key={city.name}
                  ref={(el) => {
                    if (el) cityButtonRefs.current[city.name] = el;
                  }}
                  className={`
                    flex-shrink-0 rounded-xl min-w-[160px]
                    flex flex-col backdrop-blur-md transition-all duration-300
                    ${
                      selectedCity?.name === city.name
                        ? 'bg-blue-500/90 text-white shadow-2xl scale-110 border-2 border-white'
                        : 'bg-black/20 text-white shadow-lg hover:scale-105'
                    }
                  `}
                >
                  <button
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-5 py-2 flex flex-col items-center justify-center hover:bg-white/5 transition-colors rounded-t-xl"
                  >
                    <span className="font-bold text-base text-center leading-tight">
                      {city.name}
                    </span>
                    {city.country && (
                      <span className="text-xs opacity-90 mt-1 text-center">
                        {city.country}
                      </span>
                    )}
                  </button>
                  {city.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/test-cities/${city.id}`);
                      }}
                      className="w-full px-3 py-1 text-xs border-t border-white/20 hover:bg-white/10 transition-colors rounded-b-xl"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveWorldMap;