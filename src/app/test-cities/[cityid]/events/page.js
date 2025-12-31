'use client';

import React from 'react';
import Link from 'next/link';
import IndigoFiasco2025Dashboard from '@/components/IndigoFiasco2025Dashboard';
import Breadcrumb from '@/components/Breadcrumb';
import { cities } from '@/components/citycoord';
import { photos } from '../../CityPhotos';

export default function EventsPage({ params }) {
  const { cityid } = React.use(params);
  const city = cities[cityid.toLowerCase()];

  if (!city) {
    return <p className="p-6 text-center text-red-600">City not found</p>;
  }

  // Check if this is an Indian city
  const indianCities = ['bengaluru', 'delhi', 'nagpur', 'raipur'];
  const isIndianCity = indianCities.includes(cityid.toLowerCase());

  // Get city background image
  const { backgroundImage } = photos[cityid] || {};

  if (!isIndianCity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb cityid={cityid} city={city} subpage="events" />
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Events Coming Soon</h1>
            <p className="text-gray-600 mb-6">
              Event tracking is currently only available for Indian cities.
            </p>
            <Link
              href={`/test-cities/${cityid}`}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ← Back to {city.name}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen w-full mx-auto px-4 pt-20 pb-6 sm:p-8 sm:pt-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage
          ? `url('${backgroundImage}')`
          : "url('https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/bengaluru/bengaluruBG2.jpg')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <Breadcrumb cityid={cityid} city={city} subpage="events" />

        <div className="mt-4 mb-6">
          <Link
            href={`/test-cities/${cityid}`}
            className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-medium transition-all rounded-lg border border-white/30 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {city.name}
          </Link>
        </div>

        <IndigoFiasco2025Dashboard />
      </div>
    </main>
  );
}
