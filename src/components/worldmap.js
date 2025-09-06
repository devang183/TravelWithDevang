'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen/Control.FullScreen.css';
// import { photos } from '@/app/test-cities/CityPhotos';
import { photos } from '@/app/test-cities/CityPhotos';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function WorldMap() {
  const mapRef = useRef(null);
  const recenterBtnRef = useRef(null);
  const originalCenter = [30, 0];
  const originalZoom = 2.2;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet.fullscreen/Control.FullScreen.js';
    script.async = true;

    script.onload = () => {
      if (L.DomUtil.get('map') && !mapRef.current) {
        mapRef.current = L.map('map', {
          fullscreenControl: true,
          fullscreenControlOptions: { position: 'topright' },
        }).setView(originalCenter, originalZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapRef.current);

        // Your cities data with images for slideshow
        const cities = 
        [
          { 
            name: 'Dublin', 
            coords: [53.3498, -6.2603], 
            country: 'Ireland', 
            date: '2024-11-08', 
            food: 'Irish Stew, Fish & Chips, Spice Bag(Xian Street Food), and Hot Chocolate(Butlers Hot Chocolate)',
            images:photos.dublin.images
          },
          { 
            name: 'Newry', 
            coords: [54.175, -6.349], 
            country: 'Northern Ireland', 
            date: '2024-11-08', 
            food: 'Himalayan Spicy Shawarma, Cheese Chips, and  Hot Chocolate',
            images:photos.newry.images
          },
          { 
            name: 'London', 
            coords: [51.8787, -0.4200], 
            country: 'United Kingdom', 
            date: '2024-11-01', 
            food: 'Cream Tea, Dumplings, Doner Kebab, and Hot Chocolate',
            images:photos.london.images
          },
          { 
            name: 'Belfast', 
            coords: [54.5973, -5.9301], 
            country: 'Northern Ireland', 
            date: '2024-11-13', 
            food: 'Doner Kebab, Chips, and  Hot Chocolate',
            images:photos.belfast.images
          },
          { 
            name: 'Liverpool', 
            coords: [53.4084, -2.9916], 
            country: 'United Kingdom', 
            date: '2024-12-21', 
            food: ', Cheese Chips, Doner Kebab, Hot Chocolate(The Chocolate), and Christmas Cheesecake(Starbucks)',
            images:photos.liverpool.images
          },
          { 
            name: 'Newyork', 
            coords: [40.7128, -74.0060], 
            country: 'United States of America', 
            date: '2025-05-07', 
            food: 'Chana Samosa(Priti Corner), Sandwich Samosa(Haldirams), and Adrak ki Chai(Amrutulya, Sadar)',
            images: photos.newyork.images
          },
          { 
            name: 'Chicago', 
            coords: [41.8781, -87.6298], 
            country: 'United States of America', 
            date: '2024-12-26', 
            food: 'Himalayan Spicy Shawarma, Cheese Chips, and  Hot Chocolate',
            images:photos.chicago.images
          },
          { name: 'Birmingham', 
            coords: [52.4862, -1.8904], 
            country: 'United Kingdom', 
            date: '2025-01-05', 
            food: ' Chole Parantha(Bangladeshi Food Stall), Aloo Samosa(Pakistani Food Stall), Hot Chocolate(some family business cafe),  more Hot Chocolate(The Soho), Breakfast(Rooted in Mumbai), more Hot Chocolate(200 degrees)',
            images:photos.birmingham.images
          },
          { 
            name: 'Manchester', 
            coords: [53.4808, -2.2426], 
            country: 'United Kingdom', 
            date: '2025-01-25', 
            food: 'Masala Dosa+Chai(Chennai Dosa), Rajma+Chole+Aloo Rice(This and That), Samosa Chutney(), Chole Kulchey(Sanam Sweet Centre), and  Hot Chocolate(ManCoCo - Coffee Bar & Roastery), more Hot Chocolate(Waterside Coffee House)',
            images:photos.manchester.images
          },
          { 
            name: 'Leeds', 
            coords: [53.8008, -1.5491], 
            country: 'United Kingdom', 
            date: '2023-02-08', 
            food: 'Shawarma+Chips(Mersin Shawarma), Masala Dosa+Filter Coffee(Arusuvai Restaurant), Shawarma+Chips(Chickos Carribean), Hot Chocolate(Icestone Gelato), Prasad(BAPS Shri Swaminarayan Mandir)',
            images:photos.leeds.images
          },
          { 
            name: 'Malahide', 
            coords: [53.4508, -6.1544], 
            country: 'Ireland', 
            date: '2025-03-08', 
            food: 'The capital of Northern Ireland, known for its maritime history.',
            images:photos.malahide.images
          },
          { name: 'Naas', 
            coords: [53.2158, -6.6669], 
            country: 'Ireland', 
            date: '2025-05-12', 
            food: 'Salad, Roll, and Hot Chocolate',
            images:photos.naas.images
          },
          { name: 'Maynooth', 
            coords: [53.2158, -6.6669], 
            country: 'Ireland', 
            date: '2025-05-12', 
            food: 'Salad, Roll, and Hot Chocolate',
            images:photos.naas.images
          },
          { 
            name: 'Galway', 
            coords: [53.2707, -9.0568], 
            country: 'Ireland', 
            date: '2025-06-17', 
            food: 'Irish Stew, Fish & Chips, Spice Bag(Xian Street Food), and Hot Chocolate(Butlers Hot Chocolate)',
            images:photos.galway.images
          },
          { name: 'Rabat', 
            coords: [34.020882, -6.84165], 
            country: 'Morocco', 
            date: '2025-05-15', 
            food: 'Nutella Crepe(Rabat Old Market), Breakfast(Loqma Hania), Moroccan Tea(Chabab)',
            images:photos.rabat.images
          },
          { 
            name: 'Delhi', 
            coords: [28.6139, 77.209], 
            country: 'India', 
            date: '2025-05-12', 
            food: 'Khurchan Parantha(Paranthe wali gali), Chole Kulchey, Pav Bhaji, Steam Momos, Roll, and Coconut Water',
            images:photos.delhi.images
          },    
          { 
            name: 'Raipur', 
            coords: [21.2514, 81.6296], 
            country: 'India', 
            date: '2025-06-28', 
            food: 'Pani Puri(Alka Chaat Bhandar), Kathi Roll(Food Court), Masala Chai+Butter Bun(Chai Sutta Bar)',
            images:photos.nagpur.images
          },
          { 
            name: 'Muharraq', 
            coords: [26.2572, 50.6119],
            country: 'Bahrain', 
            date: '2025-06-26', 
            food: 'Fligh layover',
            images:photos.raipur.images
          },
          { 
            name: 'Nagpur', 
            coords: [21.1458, 79.0882], 
            country: 'India', 
            date: '2025-05-07', 
            food: 'Chana Samosa(Priti Corner), Sandwich Samosa(Haldirams), and Adrak ki Chai(Amrutulya, Sadar)',
            images: photos.dublin.images

          },
          { 
            name: 'Newquay', 
            coords: [50.4155, -5.0737], 
            country: 'United Kingdom', 
            date: '2025-09-02', 
            food: 'Chana Samosa(Priti Corner), Sandwich Samosa(Haldirams), and Adrak ki Chai(Amrutulya, Sadar)',
            images: photos.dublin.images

          },
        ];

        cities.forEach((city, index) => {
          const imageSlider = city.images && city.images.length
            ? `
              <div class="popup-slider" id="slider-${index}">
                ${city.images.map((img, i) => `
                  <img src="${img}" class="popup-slide" style="display:${i === 0 ? 'block' : 'none'}; width:100%; border-radius:6px; margin-bottom:6px; transition: opacity 0.5s ease;" />
                `).join('')}
                <div style="display:flex; justify-content:center; gap:8px; margin:6px 0;">
                  ${city.images.map((_, i) => `
                    <div id="bar-${index}-${i}" style="flex:1; height:4px; background:${i === 0 ? '#007bff' : '#ccc'}; transition: background 0.3s ease;"></div>
                  `).join('')}
                </div>
                <div style="text-align:center; margin-bottom: 8px;">
                  <button onclick="showPrev(${index})" style="cursor:pointer; font-size:18px; background:none; border:none; padding:4px 8px;">‹</button>
                  <button onclick="showNext(${index})" style="cursor:pointer; font-size:18px; background:none; border:none; padding:4px 8px;">›</button>
                </div>
              </div>
            `
            : '';
          //FOR SLIDER TO BE BELOW
          // const imageSlider = city.images && city.images.length
          //   ? `
          //   <div class="popup-slider" id="slider-${index}">
          //     ${city.images.map((img, i) => `
          //       <img src="${img}" class="popup-slide" style="display:${i === 0 ? 'block' : 'none'}; width:100%; border-radius:6px; margin-bottom:6px; transition: opacity 0.5s ease;" />
          //     `).join('')}
          //     <div style="display:flex; justify-content:center; gap:8px; margin:6px 0;">
          //       ${city.images.map((_, i) => `
          //         <div id="bar-${index}-${i}" style="flex:1; height:4px; background:#ccc; transition: background 0.3s ease;"></div>
          //       `).join('')}
          //     </div>
          //     <div style="text-align:center; margin-bottom: 8px;">
          //       <button onclick="showPrev(${index})" style="cursor:pointer; font-size:18px; background:none; border:none; padding:4px 8px;">‹</button>
          //       <button onclick="showNext(${index})" style="cursor:pointer; font-size:18px; background:none; border:none; padding:4px 8px;">›</button>
          //     </div>
          //   </div>
          //   `
          //   : '';

          const popupContent = `
            ${imageSlider}
            <b><a href="/test-cities/${city.name.toLowerCase()}" style="text-decoration:none; color:#007bff;">${city.name}</a></b><br/>
            <b>Country:</b> ${city.country}<br/>
            <b>Date Visited:</b> ${city.date}<br/>
            <b>Best Food:</b> ${city.food}
          `;

          L.marker(city.coords).addTo(mapRef.current).bindPopup(popupContent, { maxWidth: 250 });
        });

        if (recenterBtnRef.current) {
          recenterBtnRef.current.addEventListener('click', () => {
            mapRef.current.setView(originalCenter, originalZoom);
          });
        }
      }

      window.showNext = (index) => {
        const slides = document.querySelectorAll(`#slider-${index} .popup-slide`);
        const bars = document.querySelectorAll(`#slider-${index} [id^='bar-${index}-']`);
        if (!slides.length) return;
        let current = [...slides].findIndex(slide => slide.style.display === 'block');
        slides[current].style.display = 'none';
        bars[current].style.background = '#ccc';
        const next = (current + 1) % slides.length;
        slides[next].style.display = 'block';
        bars[next].style.background = '#007bff';
      };

      window.showPrev = (index) => {
        const slides = document.querySelectorAll(`#slider-${index} .popup-slide`);
        const bars = document.querySelectorAll(`#slider-${index} [id^='bar-${index}-']`);
        if (!slides.length) return;
        let current = [...slides].findIndex(slide => slide.style.display === 'block');
        slides[current].style.display = 'none';
        bars[current].style.background = '#ccc';
        const prev = (current - 1 + slides.length) % slides.length;
        slides[prev].style.display = 'block';
        bars[prev].style.background = '#007bff';
      };
    };

    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div
        className="relative"
        style={{
          width: '78vw',
          height: '600px',
          borderRadius: '50px',
          marginTop: '2rem',
        }}
      >
        <div
          id="map"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '20px',
          }}
        />
        <button
          ref={recenterBtnRef}
          className="absolute bottom-5 right-5 px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 z-[1000]"
        >
          Recenter
        </button>
      </div>
    </div>
  );
}