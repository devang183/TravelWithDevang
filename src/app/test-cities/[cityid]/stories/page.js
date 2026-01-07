'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PeopleAndStories from '@/components/PeopleAndStories';
import { cities } from '@/components/citycoord';
import { photos } from '../../CityPhotos';

export default function StoriesPage({ params }) {
  const { cityid } = React.use(params);
  const city = cities[cityid.toLowerCase()];
  const { backgroundImage } = photos[cityid] || {};

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">City not found</p>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8">
          <Link
            href={`/test-cities/${cityid}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to {city.name}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            People & Stories
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto italic">
            &ldquo;The hearts that made {city.name} home, and the flavors that made it unforgettable&rdquo;
          </p>
        </div>

        {/* Stories Component */}
        <PeopleAndStories cityId={cityid.toLowerCase()} cityName={city.name} />
      </div>
    </main>
  );
}
