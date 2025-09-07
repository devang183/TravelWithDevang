// app/test-cities/[cityid]/page.js
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { cities } from '@/components/citycoord';
import CityMap from "@/components/CityMap";
import WeatherInfo from "@/components/WeatherInfo";
import ShowPhotos from '@/components/ShowMorePhotos';
import FourPhotosGrid from '@/components/ShowInitialPhotos';
import CityTextSlideshow from '@/components/CityNameSlideShowText';
import MusicSection from '@/components/MusicSection';
import NewsCard from '@/components/CityNews';
import cityMapRegistry from '@/components/maps/MapRegistry';
import { photos } from '../CityPhotos';
import TaylorSwiftDashboard from '../scripts/taylorSwift';
import React from "react";

export default function CityPage({ params }) {
  // const cityid = params.cityid.toLowerCase();
  const {cityid}=React.use(params);
  const city = cities[cityid.toLowerCase()];
  const CityMapComponents = cityMapRegistry[cityid] || [];

  if (!city) {
    return <p className="p-6 text-center text-red-600">City not found</p>;
  }

  const { name, images = [], backgroundImage } = photos[cityid] || {};

  return (
    <main
      className="min-h-screen max-w-20xl mx-auto p-8 bg-cover bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        borderRadius: '16px',
      }}
    >
      <Breadcrumb cityid={cityid} city={city} />

      <CityTextSlideshow cityName={name} imageUrls={images} />

      {/* Animated city description */}
      <h1 className="text-md mt-0 mb-8 text-center text-[1vw] tracking-widest text-[#3e4a4c]">
        {city.description.split("").map((char, idx) => (
          <span
            key={idx}
            className="inline-block transition-transform duration-200 hover:scale-150 hover:text-white"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      {/* Explore links */}
      <h2 className="text-2xl font-semibold mb-4">Explore more:</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <Link href={`/test-cities/${cityid}/explore`} className="text-[#1f2526] hover:underline">
            Explore
          </Link>
        </li>
        <li>
          <Link href={`/test-cities/${cityid}/travel`} className="text-[#1f2526] hover:underline">
            Travel
          </Link>
        </li>
        <li>
          <Link href={`/test-cities/${cityid}/airbnb`} className="text-[#1f2526] hover:underline">
            AirBnB
          </Link>
        </li>
      </ul>

      <NewsCard cityName={city.name} />

      {/* Weather + base city map */}
      {city.coords && (
        <>
          <WeatherInfo coords={city.coords} />
          <CityMap
            cityId={cityid}
            coords={city.coords}
            zoom={13}
            name={city.name}
          />
          
          {/* Tourist Attractions */}
          {/* <div className="mt-8">
            <CityAttractions cityName={city.name} />
          </div> */}
        </>
      )}

      {/* Spotify embed if exists */}
      {city.spotifyEmbedURL && (
        <MusicSection embedUrl={city.spotifyEmbedURL} />
      )}

      <br />
      <FourPhotosGrid />

      {/* Extra map components from registry */}
      {CityMapComponents.length > 0 ? (
        CityMapComponents.map((MapComponent, index) => (
          <MapComponent key={index} />
        ))
      ) : (
        <div className="p-6 text-center text-gray-600">
          <h2 className="text-xl font-semibold mb-2">Maps Coming Soon</h2>
          <p>We are working on adding maps for this city. Please check back later!</p>
        </div>
      )}

      <br />

      {/* Photo gallery */}
      {images.length > 0 ? (
        <ShowPhotos images={images} />
      ) : (
        <p className="text-gray-500 italic">No photos available for this city.</p>
      )}

      <TaylorSwiftDashboard cityred={cityid} />

      <Link
        href={`/test-cities`}
        className="mt-6 inline-block p-4 rounded-2xl text-white shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/30"
      >
        ← Back to all cities
      </Link>
    </main>
  );
}

// // 'use client';
// // app/test-cities/[cityid]/page.js
// import { notFound } from 'next/navigation';
// import Link from 'next/link';
// import Breadcrumb from '@/components/Breadcrumb';
// // import { cities } from '../citynames';
// import { cities } from '@/components/citycoord';
// import CityMap from "@/components/CityMap";
// import WeatherInfo from "@/components/WeatherInfo";
// import WebcamView from '@/components/WebcamView';
// import masongallerystyle from '@/components/ShowMorePhotos';
// import { cityPhotos } from '../CityPhotos';
// import ShowPhotos from '@/components/ShowMorePhotos';
// import MusicSection from '@/components/MusicSection';
// import MusicSearch from '@/components/MusicSearch';
// import DublinLivingMap from '@/components/maps/DublinDesirabilityMap';
// import cityMapRegistry from '@/components/maps/MapRegistry';
// import CanvaEmbed from '@/components/CanvaEmbed';
// import FourPhotosGrid from '@/components/ShowInitialPhotos';
// import CityTextSlideshow from '@/components/CityNameSlideShowText';
// import VideoTextPage from '@/components/VideoText/page';
// import { photos } from '../CityPhotos';
// import { ArrowLeft } from 'lucide-react';
// import LuasLiveData from './LuasLiveData';
// import NewsCard from '@/components/CityNews';

// // async function getLuasData() {
// //   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/luas`, { cache: 'no-store' });
// //   if (!res.ok) throw new Error('Failed to fetch LUAS data');
// //   return res.json();
// // }

// // import { useEffect, useState } from "react";
// export default async function CityPage({ params }) {
//   const p = await params
//   const cityid=p.cityid.toLowerCase();
//   const city = cities[cityid];
//   const CityMapComponent=cityMapRegistry[cityid];

//   const {name,images, backgroundImage}=photos[cityid];
//   if (!city) {
//     return <p>city not found</p>
//   }

//   if (!CityMapComponent || CityMapComponent.length==0){
//     return (
//       <div className="p-6 text-center text-gray-600">
//         <h2 className="text-xl font-semibold mb-2">Maps Coming Soon</h2>
//         <p>We're working on adding maps for this city. Please check back later!</p>
//       </div>
//     );
//   }

//   return (
//     <main
//       className="min-h-screen max-w-20xl mx-auto p-8 bg-cover bg-no-repeat bg-fixed"
//       style={{
//         //backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1950&q=80')",
//         backgroundImage: "url('/images/dublin2/dublin29.jpg')",
//         // backgroundImage: `url('${city.bgd}')`,
//         backgroundAttachment: 'fixed', // enables parallax
//         backgroundPosition: 'center',
//         backgroundRepeat: 'no-repeat',
//         backgroundSize: 'cover',
//         borderRadius: '16px'
//       }}
//     >
//         {/* max-w-4xl mx-auto p-6  */}
//         <Breadcrumb cityid={cityid} city={city} />
        
//         <CityTextSlideshow cityName={name} imageUrls={images} />

//         <h1 className="text-md mt-0 mb-8 text-center text-[1vw] tracking-widest text-[#3e4a4c]">
//         {city.description.split("").map((char, idx) => (
//           <span
//             key={idx}
//             className="inline-block transition-transform duration-200 hover:scale-150 hover:text-white"
//           >
//             {char === " " ? "\u00A0" : char}
//           </span>
//         ))}
//       </h1>
  
//         <h2 className="text-2xl font-semibold mb-4">Explore more:</h2>
//         <ul className="list-disc list-inside space-y-2">
//           <li>
//             <Link href={`/test-cities/${cityid}/attractions`} className="text-[#1f2526] hover:underline">
//               Attractions
//             </Link>
//           </li>
//           <li>
//             <Link href={`/test-cities/${cityid}/history`} className="text-[#1f2526] hover:underline">
//               History
//             </Link>
//           </li>
//           </ul>
//           <li>
//             <Link href={`/test-cities/${cityid}/sports`} className="text-[#1f2526] hover:underline">
//               Sports
//             </Link>
//           </li>
//           <NewsCard cityName={city.name}/>
//           {city.coords && (
//             <>
//               <WeatherInfo coords={city.coords} />
//               <CityMap
//                 cityId={cityid}
//                 coords={city.coords}
//                 zoom={13}
//                 name={city.name}
//               />
//               {/* <WebcamView city={city.name} /> */}
//             </>
//           )}
        
//         {city.spotifyEmbedURL && (
//           <MusicSection embedUrl={city.spotifyEmbedURL} />
//         )}
//         <br />
//       <FourPhotosGrid />
//       {CityMapComponent.map((MapComponent,index)=>(
//         <MapComponent key={index} />
//       ))}
//       <br/>
//       {images.length > 0 ? (
//         <ShowPhotos images={images} />
//       ) : (
//         <p className="text-gray-500 italic">No photos available for this city.</p>
//       )}
//       <Link href={`/test-cities`} className="mt-6 p-4 rounded-2xl text-white shadow-2xl overflow-hidden backdrop-blur-md bg-white/10 hover:bg-white/30">
//       ← Back to all cities
//         </Link>

//       </main>
//     );
// }
