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
import { Compass, Plane, Home } from 'lucide-react';

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
      className="min-h-screen w-full mx-auto px-4 py-6 sm:p-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <Breadcrumb cityid={cityid} city={city} />

      <CityTextSlideshow cityName={name} imageUrls={images} />

      {/* Animated city description */}
      <div className="max-w-4xl mx-auto mb-8 px-2 sm:px-0">
        <p className="text-sm sm:text-base md:text-lg text-center text-gray-100 leading-relaxed bg-black/30 backdrop-blur-sm p-4 rounded-lg">
          {city.description}
        </p>
      </div>

      {/* Explore links */}
      {/* <h2 className="text-2xl font-semibold mb-4">Explore more:</h2> */}
      <div className="flex justify-center gap-2 sm:gap-3 mb-8 max-w-6xl mx-auto">
  {/* Existing Explore Card */}
  <Link 
    href={`/test-cities/${cityid}/explore`} 
    className="group bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
  >
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      </div>
      <p className="text-[10px] mt-1 text-center text-gray-800 font-medium">Explore</p>
    </div>
  </Link>

  {/* Existing Travel Card */}
  <Link 
    href={`/test-cities/${cityid}/travel`}
    className="group bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
  >
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
        <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      </div>
      <p className="text-[10px] mt-1 text-center text-gray-800 font-medium">Travel</p>
    </div>
  </Link>

  {/* Existing Stays Card */}
  <Link 
    href={`/test-cities/${cityid}/airbnb`}
    className="group bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
  >
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
      </div>
      <p className="text-[10px] mt-1 text-center text-gray-800 font-medium">Stays</p>
    </div>
  </Link>

  {/* New Reddit Card */}
  <Link 
    href={`/test-cities/${cityid}/reddit`}
    className="group bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
  >
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.93.69 1.88V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10c0-5.52-4.48-10-10-10z"/>
        </svg>
      </div>
      <p className="text-[10px] mt-1 text-center text-gray-800 font-medium">What&apos;s happening?</p>
    </div>
  </Link>

  {/* New Attractions Card */}
  <Link 
    href={`/test-cities/${cityid}/attractions`}
    className="group bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
  >
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-[10px] mt-1 text-center text-gray-800 font-medium">Places</p>
    </div>
  </Link>
</div>
      {/* <ul className="list-disc list-inside space-y-2">
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
      </ul> */}

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
      {/* Photo gallery */}
      {images.length > 0 ? (
        <ShowPhotos images={images} />
      ) : (
        <p className="text-gray-500 italic">No photos available for this city.</p>
      )}

      {/* Extra map components from registry */}
      {CityMapComponents.length > 0 ? (
        CityMapComponents.map((MapComponent, index) => (
          <MapComponent key={index} />
        ))
      ) : (
        <div className="p-4 sm:p-6 text-center text-gray-100 bg-black/30 backdrop-blur-sm rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Maps Coming Soon</h2>
          <p className="text-sm sm:text-base">We are working on adding more maps for this city!</p>
        </div>
      )}

      <br />

      {/* <TaylorSwiftDashboard cityred={cityid} /> */}

      <Link
        href={`/test-cities`}
        className="mt-6 inline-block p-4 rounded-2xl text-white shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/30"
      >
        ← Back to all cities
      </Link>
    </main>
  );
}