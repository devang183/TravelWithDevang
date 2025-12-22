
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { cities as cityData } from '@/components/citycoord';

const VideoTextPage = dynamic(() => import('@/components/VideoText/page'), { 
  ssr: false 
});

const InteractiveWorldMap = dynamic(
  () => import('@/components/InteractiveWorldMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    )
  }
);

const CityList = dynamic(() => import('@/components/CityList'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
      <p>Loading cities...</p>
    </div>
  )
});

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState(null);
  const isSidebarCollapsed = true;

  // Convert cities object to array and add any missing properties
  const cities = Object.entries(cityData).map(([id, city]) => ({
    id: id,
    name: city.name,
    coords: city.coords || [0, 0],
    country: city.country || '',
    date: city.date || '',
    food: city.food || '',
    description: city.description || ''
  }));

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  return (
    <main
      className="min-h-screen pt-16"
      style={{
        backgroundImage: "url('https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <VideoTextPage collapsed={isSidebarCollapsed} /> */}
        
        {/* World Map Section */}
        <div className="relative w-full h-[700px] bg-gray-50 rounded-xl overflow-hidden shadow-lg mb-6">
          <InteractiveWorldMap
            cities={cities}
            selectedCity={selectedCity}
            onCitySelect={handleCitySelect}
          />
        </div>
      </div>
    </main>
  );
}
