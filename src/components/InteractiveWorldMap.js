'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import { photos } from '@/app/test-cities/CityPhotos';
import PhotoUpload from './PhotoUpload';

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
  const flyTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const originalCenter = [30, 0];
  const originalZoom = 2.5;

  // State for lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxCityName, setLightboxCityName] = useState('');
  const [lightboxSliderId, setLightboxSliderId] = useState('');
  const [lightboxDragOffset, setLightboxDragOffset] = useState(0);
  const [lightboxIsDragging, setLightboxIsDragging] = useState(false);

  // State for photo upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadCityId, setUploadCityId] = useState('');
  const [uploadCityName, setUploadCityName] = useState('');

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

  // City introductions
  const cityIntroductions = {
    'Dublin': 'Deeply rooted in history but currently vibing at the center of Europe\'s tech soul. Come for the literary legends, stay for the unmatched craic and riverside aesthetic.',
    'London': 'A global mood board where royal tradition meets underground subcultures. It\'s a 24/7 fever dream of high fashion, iconic red buses, and infinite hidden gems.',
    'Belfast': 'A city with a gritty past and a glowing future, blending industrial cool with a legendary arts scene. It\'s raw, authentic, and serves major cinematic energy.',
    'Liverpool': 'Where the legacy of pop royalty meets a modern, high-gloss waterfront. It\'s a city that breathes music and walks with a confidence you can\'t help but match.',
    'Birmingham': 'The UK\'s best-kept secret, featuring more canals than Venice and a streetwear scene that\'s constantly ahead of the curve. Industrial heritage, but make it fashion.',
    'Manchester': 'The undisputed capital of the North, where football passion meets an iconic indie spirit. It\'s the ultimate destination for those who live for music, culture, and rain-slicked neon streets.',
    'Leeds': 'A sleek blend of Victorian architecture and a high-voltage nightlife scene. Perfectly curated for the shopaholics and the late-night socialites alike.',
    'Malahide': 'Coastal chic at its finest, where seaside strolls meet a sophisticated village atmosphere. It\'s giving "quiet luxury" with a side of salty Atlantic air.',
    'Naas': 'The perfect mix of equestrian elegance and modern boutique living. A sophisticated escape that\'s always on the pulse of the contemporary Irish lifestyle.',
    'Maynooth': 'A vibrant university town where historic campus vibes meet a fresh, youthful energy. It\'s smart, spirited, and perfectly tucked away in the heart of Kildare.',
    'Newquay': 'The surf capital of the North, where the lifestyle is centered around the tide and the sunset. Pure coastal escapism for the dreamers and the thrill-seekers.',
    'Rabat': 'A sun-drenched fusion of Atlantic breezes and ancient architectural grandeur. It\'s Morocco\'s quiet flex—refined, historic, and effortlessly cool.',
    'Raipur': 'A rising urban powerhouse where tradition gets a sleek, modern upgrade. It\'s the hidden heartbeat of Central India, evolving at the speed of light.',
    'Delhi': 'A maximalist masterpiece where Mughal history meets a high-speed, metropolitan future. From street food tiers to luxury lounges, it\'s a sensory overload in the best way.',
    'Bengaluru': 'The Silicon Valley of the East, where garden city greenery meets a high-octane startup hustle. It\'s a city of pub crawls, filter coffee, and the brightest minds in the game.'
  };

  // Function to create image carousel HTML
  const createImageCarousel = (city) => {
    const cityPhotos = photos[city.name.toLowerCase().replace(/\s+/g, '')]?.images || [];
    const cityId = city.id || city.name.toLowerCase().replace(/\s+/g, '-');

    if (cityPhotos.length === 0) return '';

    const sliderId = `slider-${cityId}`;
    const slides = cityPhotos.map((img, idx) => {
      // Support both old format (string) and new format (object with credits)
      const imageUrl = typeof img === 'string' ? img : img.url;
      const photographer = typeof img === 'object' && img.photographer ? img.photographer : null;
      const instagram = typeof img === 'object' && img.instagram ? img.instagram : null;

      const instagramForUrl = instagram;

      return `
      <div class="popup-slide" style="display: ${idx === 0 ? 'block' : 'none'}; width: 100%; position: absolute; top: 0; left: 0; transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <img
          src="${imageUrl}"
          alt="${city.name} ${idx + 1}"
          class="w-full h-40 object-cover ${photographer && instagram ? 'rounded-t-lg' : 'rounded-lg'} cursor-pointer hover:opacity-90 transition-opacity select-none"
          onclick="window.openLightboxFromSlider('${sliderId}')"
          draggable="false"
        >
        ${photographer && instagram ? `
          <div class="px-2.5 py-1.5 mb-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg border-t border-gray-200/50">
            <a href="https://instagram.com/${instagram}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 hover:opacity-75 transition-all group" onclick="event.stopPropagation();">
              <img
                src="https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/igHandles/IG${instagramForUrl}.jpg"
                alt="${photographer}"
                class="w-5 h-5 rounded-full object-cover border border-blue-400/60 shadow-sm flex-shrink-0"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              />
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-[10px] border border-blue-400/60 shadow-sm flex-shrink-0" style="display: none;">
                ${photographer.charAt(0).toUpperCase()}
              </div>
              <span class="text-[10px] text-gray-500 flex-shrink-0">📸</span>
              <span class="text-xs font-medium text-blue-600 group-hover:text-blue-700 truncate flex-1 min-w-0">@${instagram}</span>
              <svg class="w-3.5 h-3.5 text-pink-500 flex-shrink-0 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        ` : ''}
      </div>
    `;
    }).join('');

    const dots = cityPhotos.map((_, idx) => `
      <div
        id="bar-${cityId}-${idx}"
        class="h-1 flex-1 mx-0.5 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300'}"
        style="cursor: pointer;"
        onclick="window.showNext('${sliderId}')"
      ></div>
    `).join('');

    // Check if first photo has credits to calculate container height
    const hasCredits = cityPhotos.length > 0 && typeof cityPhotos[0] === 'object' && cityPhotos[0].photographer && cityPhotos[0].instagram;
    const containerHeight = hasCredits ? '192px' : '160px';

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
        <div class="relative group touch-swipe-container" data-slider-id="${sliderId}">
          <div class="swipe-track" style="position: relative; width: 100%; height: ${containerHeight}; overflow: hidden; touch-action: pan-y pinch-zoom;">
            ${slides}
          </div>
          ${arrows}
          <div class="absolute bottom-0 left-0 right-0 flex p-1 pointer-events-none">
            ${dots}
          </div>
        </div>
        <div class="p-2.5 space-y-1.5">
          <div>
            <h3 class="font-bold text-base">${city.name}</h3>
            ${cityIntroductions[city.name] ? `<p class="text-[11px] text-gray-600 leading-snug mt-1 italic">${cityIntroductions[city.name]}</p>` : ''}
            ${city.country ? `<p class="text-sm text-gray-600 ${cityIntroductions[city.name] ? 'mt-1.5' : ''}">${city.country}</p>` : ''}
            ${city.date ? `<p class="text-xs text-gray-500">${city.date}</p>` : ''}
            ${city.food ? `<div class="mt-1"><p class="text-xs font-medium">Best Food:</p><p class="text-xs">${city.food}</p></div>` : ''}
          </div>
          <button
            onclick="event.stopPropagation(); window.openPhotoUpload && window.openPhotoUpload('${cityId}', '${city.name}')"
            class="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            style="cursor: pointer;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            Upload Photo
          </button>
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

    // Clear any pending fly animations
    if (flyTimeoutRef.current) {
      clearTimeout(flyTimeoutRef.current);
      flyTimeoutRef.current = null;
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
        // Step 1: Fly out (zoom out to see the globe) - faster and smoother
        mapRef.current.flyTo(originalCenter, 2, {
          duration: 1.2,
          easeLinearity: 0.25,
          animate: true
        });

        // Step 2: After flying out, fly in to the new city
        flyTimeoutRef.current = setTimeout(() => {
          // Check if component is still mounted before continuing animation
          if (!isMountedRef.current || !mapRef.current) {
            return;
          }

          mapRef.current.flyTo(city.coords, 12, {
            duration: 1.5,
            easeLinearity: 0.25,
            animate: true
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

          flyTimeoutRef.current = null;
        }, 1200);
      } else {
        // If not zoomed in, just fly directly to the city - faster and smoother
        mapRef.current.flyTo(city.coords, 12, {
          duration: 1.8,
          easeLinearity: 0.25,
          animate: true
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

  // Global function for opening photo upload modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openPhotoUpload = (cityId, cityName) => {
        setUploadCityId(cityId);
        setUploadCityName(cityName);
        setUploadModalOpen(true);
      };

      return () => {
        delete window.openPhotoUpload;
      };
    }
  }, []);

  // Global functions for image slider and lightbox
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateSlider = (sliderId, current, next, animate = true) => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const slides = slider.querySelectorAll('.popup-slide');
        const cityId = sliderId.replace('slider-', '');
        const bars = slider.querySelectorAll(`[id^='bar-${cityId}-']`);

        if (!slides.length) return;

        const direction = next > current ? 1 : -1;

        // Animate current slide out
        if (current >= 0 && current < slides.length && animate) {
          slides[current].style.transform = `translateX(${-direction * 100}%)`;
          slides[current].style.opacity = '0';

          setTimeout(() => {
            slides[current].style.display = 'none';
            slides[current].style.transform = 'translateX(0)';
            slides[current].style.opacity = '1';
          }, 300);

          if (bars[current]) bars[current].style.background = '#ccc';
        } else if (current >= 0 && current < slides.length) {
          // Instant change without animation
          slides[current].style.display = 'none';
          if (bars[current]) bars[current].style.background = '#ccc';
        }

        // Animate next slide in
        if (next >= 0 && next < slides.length && animate) {
          slides[next].style.transform = `translateX(${direction * 100}%)`;
          slides[next].style.opacity = '0';
          slides[next].style.display = 'block';

          setTimeout(() => {
            slides[next].style.transform = 'translateX(0)';
            slides[next].style.opacity = '1';
          }, 10);

          if (bars[next]) bars[next].style.background = '#3b82f6';
        } else if (next >= 0 && next < slides.length) {
          // Instant change without animation
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

      // Lightbox open function from slider - finds current slide dynamically
      window.openLightboxFromSlider = (sliderId) => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const slides = slider.querySelectorAll('.popup-slide');
        if (!slides.length) return;

        // Find which slide is currently visible
        const currentIndex = [...slides].findIndex(slide =>
          window.getComputedStyle(slide).display === 'block'
        );

        if (currentIndex === -1) return;

        // Extract city name from the slider's city info
        const cityNameElement = slider.querySelector('h3');
        if (!cityNameElement) return;

        const cityName = cityNameElement.textContent;
        const cityPhotos = photos[cityName.toLowerCase().replace(/\s+/g, '')]?.images || [];

        if (cityPhotos.length > 0) {
          setLightboxImages(cityPhotos);
          setLightboxIndex(currentIndex);
          setLightboxCityName(cityName);
          setLightboxSliderId(sliderId);
          setLightboxOpen(true);
        }
      };

      // Legacy lightbox open function (kept for backward compatibility)
      window.openLightbox = (cityName, imageIndex) => {
        const cityPhotos = photos[cityName.toLowerCase().replace(/\s+/g, '')]?.images || [];
        if (cityPhotos.length > 0) {
          setLightboxImages(cityPhotos);
          setLightboxIndex(imageIndex);
          setLightboxCityName(cityName);
          setLightboxOpen(true);
        }
      };

      // Touch swipe support for carousel
      const swipeState = {
        startX: 0,
        startY: 0,
        currentX: 0,
        isDragging: false,
        startTime: 0,
        container: null,
        sliderId: null
      };

      const handleTouchStart = (e) => {
        const container = e.currentTarget;
        const sliderId = container.getAttribute('data-slider-id');

        swipeState.startX = e.touches[0].clientX;
        swipeState.startY = e.touches[0].clientY;
        swipeState.currentX = e.touches[0].clientX;
        swipeState.isDragging = true;
        swipeState.startTime = Date.now();
        swipeState.container = container;
        swipeState.sliderId = sliderId;

        // Add dragging state
        const track = container.querySelector('.swipe-track');
        if (track) {
          track.style.cursor = 'grabbing';
        }
      };

      const handleTouchMove = (e) => {
        if (!swipeState.isDragging) return;

        swipeState.currentX = e.touches[0].clientX;
        const deltaX = swipeState.currentX - swipeState.startX;
        const deltaY = Math.abs(e.touches[0].clientY - swipeState.startY);

        // Only handle horizontal swipes (not vertical scrolling)
        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
          e.preventDefault();

          const track = swipeState.container?.querySelector('.swipe-track');
          const slides = track?.querySelectorAll('.popup-slide');

          if (slides) {
            const currentSlide = [...slides].find(slide =>
              window.getComputedStyle(slide).display === 'block'
            );

            if (currentSlide) {
              // Apply drag effect with resistance
              const dragPercent = (deltaX / track.offsetWidth) * 100;
              const resistance = 0.6; // Add resistance for better feel
              currentSlide.style.transform = `translateX(${dragPercent * resistance}%)`;
              currentSlide.style.transition = 'none';
            }
          }
        }
      };

      const handleTouchEnd = () => {
        if (!swipeState.isDragging) return;

        const deltaX = swipeState.currentX - swipeState.startX;
        const deltaTime = Date.now() - swipeState.startTime;
        const velocity = Math.abs(deltaX) / deltaTime;

        const track = swipeState.container?.querySelector('.swipe-track');
        if (track) {
          track.style.cursor = 'grab';

          const slides = track.querySelectorAll('.popup-slide');
          const currentSlide = [...slides].find(slide =>
            window.getComputedStyle(slide).display === 'block'
          );

          if (currentSlide) {
            // Restore transition
            currentSlide.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            currentSlide.style.transform = 'translateX(0)';
          }
        }

        // Determine if swipe was significant enough
        const threshold = 50; // minimum distance in pixels
        const velocityThreshold = 0.3; // pixels per millisecond

        if ((Math.abs(deltaX) > threshold || velocity > velocityThreshold) && swipeState.sliderId) {
          if (deltaX > 0) {
            // Swiped right - show previous
            window.showPrev(swipeState.sliderId);
          } else {
            // Swiped left - show next
            window.showNext(swipeState.sliderId);
          }
        }

        swipeState.isDragging = false;
      };

      // Attach touch listeners to all swipe containers
      const attachSwipeListeners = () => {
        const containers = document.querySelectorAll('.touch-swipe-container');
        containers.forEach(container => {
          container.addEventListener('touchstart', handleTouchStart, { passive: false });
          container.addEventListener('touchmove', handleTouchMove, { passive: false });
          container.addEventListener('touchend', handleTouchEnd, { passive: true });
        });
      };

      // Initial attachment
      attachSwipeListeners();

      // Re-attach when map updates (for dynamically added markers)
      const observer = new MutationObserver(() => {
        attachSwipeListeners();
      });

      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }

      // Cleanup function
      window.cleanupSwipeListeners = () => {
        observer.disconnect();
        const containers = document.querySelectorAll('.touch-swipe-container');
        containers.forEach(container => {
          container.removeEventListener('touchstart', handleTouchStart);
          container.removeEventListener('touchmove', handleTouchMove);
          container.removeEventListener('touchend', handleTouchEnd);
        });
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.showNext;
        delete window.showPrev;
        delete window.openLightbox;
        delete window.openLightboxFromSlider;

        // Cleanup swipe listeners
        if (window.cleanupSwipeListeners) {
          window.cleanupSwipeListeners();
          delete window.cleanupSwipeListeners;
        }
      }
    };
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxImages.length]);

  // Touch swipe support for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let isDragging = false;
    let startTime = 0;

    const handleTouchStart = (e) => {
      // Only handle touches on the image container
      if (!e.target.closest('.lightbox-image-container')) return;

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchCurrentX = e.touches[0].clientX;
      isDragging = true;
      startTime = Date.now();
      setLightboxIsDragging(true);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;

      touchCurrentX = e.touches[0].clientX;
      const deltaX = touchCurrentX - touchStartX;
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

      // Only handle horizontal swipes
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
        e.preventDefault();

        // Apply drag effect with resistance
        const dragPercent = (deltaX / window.innerWidth) * 100;
        const resistance = 0.5;
        setLightboxDragOffset(dragPercent * resistance);
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;

      const deltaX = touchCurrentX - touchStartX;
      const deltaTime = Date.now() - startTime;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Reset drag state
      setLightboxDragOffset(0);
      setLightboxIsDragging(false);

      // Determine if swipe was significant
      const threshold = 75; // Larger threshold for full-screen images
      const velocityThreshold = 0.3;

      if (Math.abs(deltaX) > threshold || velocity > velocityThreshold) {
        if (deltaX > 0) {
          // Swiped right - previous image
          setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
        } else {
          // Swiped left - next image
          setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
        }
      }

      isDragging = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lightboxOpen, lightboxImages.length]);

  // Sync popup carousel when lightbox closes
  useEffect(() => {
    // Only sync when lightbox is closed and we have a slider ID
    if (lightboxOpen || !lightboxSliderId) return;

    const slider = document.getElementById(lightboxSliderId);
    if (!slider) return;

    const slides = slider.querySelectorAll('.popup-slide');
    if (!slides.length) return;

    // Find current visible slide
    const currentIndex = [...slides].findIndex(slide =>
      window.getComputedStyle(slide).display === 'block'
    );

    // If the carousel is already showing the right slide, no need to update
    if (currentIndex === lightboxIndex) return;

    // Extract city ID from slider ID
    const cityId = lightboxSliderId.replace('slider-', '');
    const bars = slider.querySelectorAll(`[id^='bar-${cityId}-']`);

    // Hide all slides and reset all bars
    slides.forEach((slide, idx) => {
      slide.style.display = 'none';
      if (bars[idx]) {
        bars[idx].style.background = '#ccc';
      }
    });

    // Show the slide that matches the lightbox index
    if (slides[lightboxIndex]) {
      slides[lightboxIndex].style.display = 'block';
      if (bars[lightboxIndex]) {
        bars[lightboxIndex].style.background = '#3b82f6';
      }
    }
  }, [lightboxOpen, lightboxIndex, lightboxSliderId]);

  // Initialize the map
  useEffect(() => {
    isMountedRef.current = true;

    if (!mapRef.current && mapContainerRef.current) {
      // Define world bounds to prevent infinite scrolling
      const worldBounds = [
        [-90, -180], // Southwest coordinates
        [90, 180]    // Northeast coordinates
      ];

      // Initialize the map with performance optimizations
      mapRef.current = L.map(mapContainerRef.current, {
        fullscreenControl: true,
        fullscreenControlOptions: { position: 'topright' },
        worldCopyJump: false,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 1,
        maxZoom: 18,
        zoomSnap: 0.1,
        zoomDelta: 0.1,
        preferCanvas: true, // Use canvas for better performance
        renderer: L.canvas({ tolerance: 5 }), // Canvas renderer with optimized tolerance
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
      }).setView(originalCenter, originalZoom);

      // Add the base map layer with optimized settings
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 1,
        noWrap: true,
        bounds: worldBounds,
        updateWhenIdle: false, // Update tiles during panning
        updateWhenZooming: true, // Update tiles while zooming
        keepBuffer: 2, // Keep more tiles in buffer for smoother panning
        crossOrigin: true,
        fadeAnimation: true
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
      isMountedRef.current = false;

      // Clear any pending fly animations
      if (flyTimeoutRef.current) {
        clearTimeout(flyTimeoutRef.current);
        flyTimeoutRef.current = null;
      }

      // Stop any ongoing map animations
      if (mapRef.current) {
        mapRef.current.stop();
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Clear all markers
      markersRef.current = {};
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
      <style jsx global>{`
        .leaflet-tile-container {
          transition: opacity 200ms ease-in-out;
        }
        .leaflet-tile {
          transition: opacity 200ms ease-in-out;
          will-change: opacity;
        }
        .leaflet-zoom-animated {
          transition: transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .leaflet-fade-anim .leaflet-tile {
          will-change: opacity;
        }
        .leaflet-fade-anim .leaflet-popup {
          opacity: 1;
          transition: opacity 0.2s linear;
        }
        .leaflet-map-pane {
          will-change: transform;
        }
        .city-list-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .city-list-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 3px;
        }
        .city-list-scroll::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 3px;
        }
        .city-list-scroll::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
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
            backgroundColor: '#1a1a2e', // Dark background while tiles load
          }}
        />

        {/* Recenter Button */}
        <button
          onClick={() => {
            if (mapRef.current) {
              // Clear any pending animations before recentering
              if (flyTimeoutRef.current) {
                clearTimeout(flyTimeoutRef.current);
                flyTimeoutRef.current = null;
              }

              mapRef.current.flyTo(originalCenter, originalZoom, {
                duration: 1.5,
                easeLinearity: 0.25,
                animate: true
              });
            }
          }}
          className="absolute bottom-24 right-5 px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 z-30 transition-all duration-200"
        >
          Recenter
        </button>

        {/* Horizontal Scrollable City List Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div
            ref={cityListScrollRef}
            className="city-list-scroll overflow-x-auto overflow-y-hidden px-4 py-3"
            style={{
              height: '100px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#3b82f6 rgba(0,0,0,0.1)'
            }}
          >
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 transition-colors z-10"
              aria-label="Close"
            >
              ×
            </button>

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:bg-opacity-75 transition-all z-10"
              aria-label="Previous image"
            >
              ←
            </button>

            {/* Image */}
            <div
              className="relative max-w-6xl max-h-[90vh] flex flex-col items-center lightbox-image-container"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: 'pan-y pinch-zoom' }}
            >
              <img
                src={typeof lightboxImages[lightboxIndex] === 'string' ? lightboxImages[lightboxIndex] : lightboxImages[lightboxIndex]?.url}
                alt={`${lightboxCityName} ${lightboxIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
                draggable="false"
                style={{
                  transform: `translateX(${lightboxDragOffset}%) scale(${lightboxIsDragging ? 0.95 : 1})`,
                  transition: lightboxIsDragging ? 'transform 0.1s ease-out' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
                  opacity: lightboxIsDragging ? 0.9 : 1
                }}
              />
              <div className="mt-4 text-white text-center">
                <p className="text-lg font-semibold">{lightboxCityName}</p>
                <p className="text-sm opacity-75">
                  {lightboxIndex + 1} / {lightboxImages.length}
                </p>
                {typeof lightboxImages[lightboxIndex] === 'object' && lightboxImages[lightboxIndex]?.photographer && lightboxImages[lightboxIndex]?.instagram && (
                  <p className="text-sm opacity-90 mt-2">
                    📸 Photo by <a href={`https://instagram.com/${lightboxImages[lightboxIndex].instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@{lightboxImages[lightboxIndex].instagram}</a>
                  </p>
                )}
                <p className="text-xs opacity-50 mt-2">
                  Swipe or use arrow keys to navigate • Press ESC to close
                </p>
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:bg-opacity-75 transition-all z-10"
              aria-label="Next image"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {uploadModalOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setUploadModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Photo</h2>
                <p className="text-sm text-gray-600 mt-1">Share your photos from {uploadCityName}</p>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close upload modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <PhotoUpload
                cityId={uploadCityId}
                onUploadSuccess={(photo) => {
                  console.log('Photo uploaded successfully:', photo);
                  // Close modal after successful upload
                  setTimeout(() => {
                    setUploadModalOpen(false);
                  }, 2000);
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveWorldMap;