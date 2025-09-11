'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with no SSR to avoid window is not defined errors
const CityPinboard = dynamic(() => import('./CityPinboard'), { ssr: false });

const CityList = ({ cities, onCitySelect, selectedCity }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full h-[400px]"></div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <CityPinboard cities={cities} onCitySelect={onCitySelect} selectedCity={selectedCity} />
    </div>
  );
};

export default CityList;