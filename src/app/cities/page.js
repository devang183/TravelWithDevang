"use client";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const cities = {
  2024: [
    
    { id: 'dublin', name: 'Dublin', image: '/images/dublin3.jpg', description: 'The capital of Ireland, famous for its literary heritage.', highlights: ['Trinity College', 'Temple Bar', 'Guinness Storehouse'] },
    { id: 'newry', name: 'Newry', image: '/images/newry.jpg', description: 'The capital of Ireland, famous for its literary heritage.', highlights: ['Trinity College', 'Temple Bar', 'Guinness Storehouse'] },
    { id: 'london', name: 'London', image: '/images/london.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
    { id: 'belfast', name: 'Belfast', image: '/images/belfast.jpg', description: 'A nice little town in Northern Ireland with rich history and beautiful surroundings.', highlights: ['Historic castle', 'Beautiful countryside', 'Friendly locals'] },
    { id: 'liverpool', name: 'Liverpool', image: '/images/liverpool-header.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
  ],
  2025: [
    { id: 'birmingham', name: 'Birmingham', image: '/images/birmingham.jpg', description: 'A nice little town in Northern Ireland with rich history and beautiful surroundings.', highlights: ['Historic castle', 'Beautiful countryside', 'Friendly locals'] },
    { id: 'manchester', name: 'Manchester', image: '/images/manchester.jpg', description: 'The capital of England, a vibrant metropolis with iconic landmarks.', highlights: ['Big Ben', 'Tower Bridge', 'British Museum'] },
    { id: 'leeds', name: 'Leeds', image: '/images/leeds.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'malahide', name: 'Malahide', image: '/images/malahide.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'dublin', name: 'Dublin', image: '/images/dublin.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'london', name: 'London', image: '/images/london2.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'dublin2', name: 'Dublin', image: '/images/dublin2.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'naas', name: 'Naas', image: '/images/naas.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'maynooth', name: 'Maynooth', image: '/images/maynooth.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'rabat', name: 'Rabat', image: '/images/rabat-header.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'galway', name: 'Galway', image: '/images/galway.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'delhi', name: 'Delhi', image: '/images/delhi-header.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'raipur', name: 'Raipur', image: '/images/raipur.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'nagpur', name: 'Nagpur', image: '/images/nagpur.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    
  ]
};

export default function CityExplorer() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hoveredYear, setHoveredYear] = useState(null);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [clickedCityId, setClickedCityId] = useState(null);
  //const [fadeIn, setFadeIn] = useState(true);

  
  // Function to handle city navigation
  const handleCityClick = (city) => {
    setClickedCityId(city.id);
    setSelectedCity(city);
    setIsModalAnimating(false); // Start with animation false
  };
  
  const handleCloseModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setSelectedCity(null);
      setClickedCityId(null);
    }, 300); // Wait for animation to complete
  };

  // Auto-trigger animation when modal opens
  useEffect(() => {
    if (selectedCity) {
      setTimeout(() => {
        setIsModalAnimating(true);
      }, 50); // Small delay to ensure DOM is ready
    }
  }, [selectedCity]);
  
  return (
    // <div className="max-w-6xl mx-auto p-6">
    <div className="min-h-screen max-w-6xl mx-auto p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-blue-100">
      <h1 className={`text-3xl font-bold mb-8 text-center transition-all duration-500 ${selectedCity ? 'blur-sm' : ''}`}>City Explorer</h1>
      
      {/* Year Tabs with Enhanced Hover and Selection Effects */}
      <div className={`flex justify-center mb-8 transition-all duration-500 ${selectedCity ? 'blur-sm' : ''}`}>
        {Object.keys(cities).map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(parseInt(year))}
            onMouseEnter={() => setHoveredYear(parseInt(year))}
            onMouseLeave={() => setHoveredYear(null)}
            className={`px-6 py-3 mx-2 rounded-lg font-bold transition-all duration-1000 transform relative ${
              selectedYear === parseInt(year)
                ? 'bg-gray-200 text-gray-900 scale-125 shadow-lg ring-0 ring-gray-400'
                : 'bg-gray-100 text-gray-600'
            } ${
              hoveredYear === parseInt(year) && selectedYear !== parseInt(year)
                ? 'scale-110 shadow-md'
                : ''
            }`}
            style={{
              transform: selectedYear === parseInt(year) 
                ? 'scale(1.25)' 
                : hoveredYear === parseInt(year) 
                ? 'scale(1.1)' 
                : 'scale(1)'
            }}
          >
            {year}
          </button>
        ))}
      </div>
      
      {/* Cities List - Now Clickable for Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities[selectedYear].map((city) => (
          <div 
            key={city.id}
            onClick={() => handleCityClick(city)}
            className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-110 hover:ring-0 hover:ring-red-300 hover:-translate-y-2 ${
              selectedCity && clickedCityId !== city.id ? 'blur-sm scale-95' : ''
            }`}
          >
            <div className="h-48 bg-gray-200 overflow-hidden">
              <img 
                src={city.image} 
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=${city.name}`;
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800 transition-colors">{city.name}</h3>
              <p className="text-gray-600 text-sm">{city.description.substring(0, 100)}...</p>
              <div className="mt-2 text-xs text-gray-500 italic">
                Click to explore {city.name}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal with Zoom-in Animation */}
      {selectedCity && (
        <div className={`fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center p-4 z-50 transition-all duration-500 ${
          isModalAnimating ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className={`bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-500 transform ${
            isModalAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8'
          }`}>
            <div className="relative h-80">
              <img 
                src={selectedCity.image} 
                alt={selectedCity.name}
                className="w-full h-full object-cover rounded-t-xl"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=${selectedCity.name}`;
                }}
              />
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-all shadow-lg z-10 group"
              >
                <X size={24} className="text-gray-700 group-hover:text-gray-900 transition-colors" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 rounded-b-none">
                <h2 className="text-4xl font-bold text-white mb-2">{selectedCity.name}</h2>
                <p className="text-white/90 text-lg">Discover the beauty and culture</p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">{selectedCity.description}</p>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Must-See Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCity.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">✨ Ready to explore {selectedCity.name}? Start planning your adventure!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}