'use client';
// app/test-cities/[cityid]/page.js
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { cities } from '@/components/citycoord';
import CityMap from "@/components/CityMap";
import WeatherInfo from "@/components/WeatherInfo";
import CityParallaxHero from '@/components/CityParallaxHero';
import MusicSection from '@/components/MusicSection';
import cityMapRegistry from '@/components/maps/MapRegistry';
import React from "react";
import DublinTipsCarousel from '@/components/DublinTipsCarousel';
import BengaluruTipsCarousel from '@/components/BengaluruTipsCarousel';
// import CityQuestionBox from '@/components/CityQuestionBox';
import TripPreferencesWizard from '@/components/TripPreferencesWizard';
import CircularTabMenu from '@/components/CircularTabMenu';


export default function CityPage({ params }) {
  // const cityid = params.cityid.toLowerCase();
  const {cityid}=React.use(params);
  const city = cities[cityid.toLowerCase()];
  const CityMapComponents = cityMapRegistry[cityid] || [];
  const [showWizard, setShowWizard] = React.useState(false);

  if (!city) {
    return <p className="p-6 text-center text-red-600">City not found</p>;
  }

  return (
    <main className="min-h-screen w-full mx-auto">
      <CityParallaxHero cityName={city.name} cityid={cityid} city={city} />

      {/* Circular Expanding Tab Menu */}
      <CircularTabMenu
        cityid={cityid}
        showEvents={['bengaluru', 'delhi', 'nagpur', 'raipur'].includes(cityid.toLowerCase())}
      />

      <div className="relative px-4 pt-8 pb-6 sm:px-8 sm:pt-8">
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

      {/* Base city map */}
      {city.coords && (
        <>
          <CityMap
            cityId={cityid}
            coords={city.coords}
            zoom={13}
            name={city.name}
            onOpenWizard={() => setShowWizard(true)}
          />

          {/* AI-Powered Q&A Box */}
          {/* {['dublin', 'bengaluru'].includes(cityid.toLowerCase()) && (
            <CityQuestionBox cityId={cityid} cityName={city.name} />
          )} */}

          {/* Dublin Tips Carousel - Only for Dublin */}
          {cityid.toLowerCase() === 'dublin' && (
            <DublinTipsCarousel />
          )}

          {/* Bengaluru Tips Carousel - Only for Bengaluru */}
          {cityid.toLowerCase() === 'bengaluru' && (
            <BengaluruTipsCarousel />
          )}

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

      {/* Trip Preferences Wizard - External Control */}
      {city.coords && (
        <TripPreferencesWizard
          cityId={cityid}
          cityName={city.name}
          hideButton={true}
          externalIsOpen={showWizard}
          onExternalClose={() => setShowWizard(false)}
        />
      )}

        <Link
          href={`/test-cities`}
          className="mt-6 inline-block p-4 rounded-2xl text-white shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/30"
        >
          ← Back to all cities
        </Link>
      </div>
    </main>
  );
}