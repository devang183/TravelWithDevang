'use client';
// app/test-cities/[cityid]/page.js
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { cities } from '@/components/citycoord';
import CityMap from "@/components/CityMap";
import WeatherInfo from "@/components/WeatherInfo";
// import ShowPhotos from '@/components/ShowMorePhotos';
// import FourPhotosGrid from '@/components/ShowInitialPhotos';
import CityTextSlideshow from '@/components/CityNameSlideShowText';
import MusicSection from '@/components/MusicSection';
import NewsCard from '@/components/CityNews';
import cityMapRegistry from '@/components/maps/MapRegistry';
import { photos } from '../CityPhotos';
import TaylorSwiftDashboard from '../scripts/taylorSwift';
import React from "react";
import { Compass, Plane, Home, Newspaper, Calendar } from 'lucide-react';


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
      className="min-h-screen w-full mx-auto px-4 pt-20 pb-6 sm:p-8 sm:pt-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url('${backgroundImage}')` : "url('https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg')",
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
      <div className="flex justify-center gap-4 sm:gap-6 mb-8 max-w-6xl mx-auto">
  {/* Existing Explore Card */}
  <Link
    href={`/test-cities/${cityid}/explore`}
    className="group transition-transform duration-200 hover:scale-110"
    aria-label="Explore"
  >
    <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 drop-shadow-lg hover:drop-shadow-2xl transition-all" />
  </Link>

  {/* Existing Travel Card */}
  <Link
    href={`/test-cities/${cityid}/travel`}
    className="group transition-transform duration-200 hover:scale-110"
    aria-label="Travel"
  >
    <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 drop-shadow-lg hover:drop-shadow-2xl transition-all" />
  </Link>

  {/* Existing Stays Card */}
  <Link
    href={`/test-cities/${cityid}/airbnb`}
    className="group transition-transform duration-200 hover:scale-110"
    aria-label="Stays"
  >
    <Home className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 drop-shadow-lg hover:drop-shadow-2xl transition-all" />
  </Link>

  {/* New Reddit Card */}
  <Link
    href={`/test-cities/${cityid}/reddit`}
    className="group transition-transform duration-200 hover:scale-110"
    aria-label="What's happening"
  >
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 drop-shadow-lg hover:drop-shadow-2xl transition-all" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.93.69 1.88V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10c0-5.52-4.48-10-10-10z"/>
    </svg>
  </Link>

  {/* New Attractions Card */}
  <Link
    href={`/test-cities/${cityid}/attractions`}
    className="group transition-transform duration-200 hover:scale-110"
    aria-label="Places"
  >
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600 drop-shadow-lg hover:drop-shadow-2xl transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </Link>

  {/* New News Card */}
  <Link
    href={`/test-cities/${cityid}/news`}
    className="group transition-transform duration-200 hover:scale-110"
    aria-label="News"
  >
    <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 drop-shadow-lg hover:drop-shadow-2xl transition-all" />
  </Link>

  {/* Indian cities - Recent Events Card */}
  {['bengaluru', 'delhi', 'nagpur', 'raipur'].includes(cityid.toLowerCase()) && (
    <Link
      href={`/test-cities/${cityid}/events`}
      className="group transition-transform duration-200 hover:scale-110"
      aria-label="Recent Events"
    >
      <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 drop-shadow-lg hover:drop-shadow-2xl transition-all" />
    </Link>
  )}
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

      {/* <NewsCard cityName={city.name} /> */}

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

      {/* <br />
      <FourPhotosGrid /> */}
      {/* Photo gallery */}
      {/* {images.length > 0 ? (
        <ShowPhotos images={images} />
      ) : (
        <p className="text-gray-500 italic">No photos available for this city.</p>
      )} */}

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

      {/* News moved to dedicated /news tab */}

      {/* <TaylorSwiftDashboard cityred={cityid} /> */}
      {/* <AccommodationDisplay /> */}
      <Link
        href={`/test-cities`}
        className="mt-6 inline-block p-4 rounded-2xl text-white shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/30"
      >
        ← Back to all cities
      </Link>
    </main>
  );
}