'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LayoutGrid, List } from 'lucide-react';

// Dynamically import components with no SSR to avoid window is not defined errors
const CityWordCloud = dynamic(() => import('./CityWordCloud'), { ssr: false });
const CityPinboard = dynamic(() => import('./CityPinboard'), { ssr: false });

const CityList = ({ cities, onCitySelect, selectedCity }) => {
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState('wordcloud'); // 'wordcloud' or 'pinboard'

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full h-[400px]"></div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('wordcloud')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'wordcloud' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Word Cloud View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('pinboard')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'pinboard' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Pinboard View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'wordcloud' ? (
        <CityWordCloud 
          cities={cities} 
          onCitySelect={onCitySelect} 
          selectedCity={selectedCity} 
        />
      ) : (
        <CityPinboard
          cities={cities}
          onCitySelect={onCitySelect}
          selectedCity={selectedCity}
        />
      )}
    </div>
  );
};

export default CityList;