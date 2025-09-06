// // app/components/CityModal.js
// "use client";
// import { useState } from 'react';
// import { X } from 'lucide-react';

// const cities = {
//   2024: [
//     { id: 'newry', name: 'Newry', image: '/images/newry.jpg', description: 'The capital of Ireland, famous for its literary heritage.', highlights: ['Trinity College', 'Temple Bar', 'Guinness Storehouse'] },
//     { id: 'london', name: 'London', image: '/images/london.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
//   ],
//   2025: [
//     { id: 'belfast', name: 'Belfast', image: '/images/belfast.jpg', description: 'A nice little town in Northern Ireland with rich history and beautiful surroundings.', highlights: ['Historic castle', 'Beautiful countryside', 'Friendly locals'] },
//     { id: 'delhi', name: 'Delhi', image: '/images/delhi-header.jpg', description: 'The capital of England, a vibrant metropolis with iconic landmarks.', highlights: ['Big Ben', 'Tower Bridge', 'British Museum'] },
//     { id: 'rabat', name: 'Rabat', image: '/images/rabat-header.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
//   ]
// };

// export default function CityExplorer() {
//   const [selectedYear, setSelectedYear] = useState(2024);
//   const [selectedCity, setSelectedCity] = useState(null);
  
//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-8 text-center">City Explorer</h1>
      
//       {/* Year Tabs */}
//       <div className="flex justify-center mb-8">
//         {Object.keys(cities).map(year => (
//           <button
//             key={year}
//             onClick={() => setSelectedYear(parseInt(year))}
//             className={`px-6 py-2 mx-2 rounded-lg font-semibold transition-colors ${
//               selectedYear === parseInt(year)
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//             }`}
//           >
//             {year}
//           </button>
//         ))}
//       </div>
      
//       {/* Cities List */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {cities[selectedYear].map((city) => (
//           <div 
//             key={city.id}
//             onClick={() => setSelectedCity(city)}
//             className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
//           >
//             <div className="h-48 bg-gray-200">
//               <img 
//                 src={city.image} 
//                 alt={city.name}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.target.src = `https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=${city.name}`;
//                 }}
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
//               <p className="text-gray-600 text-sm">{city.description.substring(0, 100)}...</p>
//             </div>
//           </div>
//         ))}
//       </div>
      
//       {/* Modal */}
//       {selectedCity && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//             <div className="relative h-64">
//               <img 
//                 src={selectedCity.image} 
//                 alt={selectedCity.name}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.target.src = `https://via.placeholder.com/800x300/4A90E2/FFFFFF?text=${selectedCity.name}`;
//                 }}
//               />
//               <button 
//                 onClick={() => setSelectedCity(null)}
//                 className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
//               >
//                 <X size={20} />
//               </button>
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
//                 <h2 className="text-3xl font-bold text-white">{selectedCity.name}</h2>
//               </div>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-700 mb-4">{selectedCity.description}</p>
//               <h3 className="text-lg font-semibold mb-2">Highlights:</h3>
//               <ul className="list-disc list-inside text-gray-600">
//                 {selectedCity.highlights.map((highlight, index) => (
//                   <li key={index}>{highlight}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// app/components/CityModal.js
"use client";
import { useState } from 'react';
import { X } from 'lucide-react';

const cities = {
  2024: [
    { id: 'newry', name: 'Newry', image: '/images/newry.jpg', description: 'The capital of Ireland, famous for its literary heritage.', highlights: ['Trinity College', 'Temple Bar', 'Guinness Storehouse'] },
    { id: 'london', name: 'London', image: '/images/london.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
  ],
  2025: [
    { id: 'belfast', name: 'Belfast', image: '/images/belfast.jpg', description: 'A nice little town in Northern Ireland with rich history and beautiful surroundings.', highlights: ['Historic castle', 'Beautiful countryside', 'Friendly locals'] },
    { id: 'delhi', name: 'Delhi', image: '/images/delhi-header.jpg', description: 'The capital of England, a vibrant metropolis with iconic landmarks.', highlights: ['Big Ben', 'Tower Bridge', 'British Museum'] },
    { id: 'rabat', name: 'Rabat', image: '/images/rabat-header.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
  ]
};

export default function CityExplorer() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hoveredYear, setHoveredYear] = useState(null);
  
  // Function to handle city navigation
  const handleCityClick = (city) => {
    // For now, we'll show the modal. In a real app, you'd use Next.js router
    // Example: router.push(`/cities/${city.id}`);
    setSelectedCity(city);
    
    // If you want to navigate to a new page instead, uncomment below:
    // window.location.href = `/cities/${city.id}`;
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">City Explorer</h1>
      
      {/* Year Tabs with Enhanced Hover and Selection Effects */}
      <div className="flex justify-center mb-8">
        {Object.keys(cities).map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(parseInt(year))}
            onMouseEnter={() => setHoveredYear(parseInt(year))}
            onMouseLeave={() => setHoveredYear(null)}
            className={`px-6 py-3 mx-2 rounded-lg font-bold transition-all duration-300 transform relative ${
              selectedYear === parseInt(year)
                ? 'bg-gray-200 text-gray-900 scale-125 shadow-lg ring-2 ring-gray-400'
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
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 hover:ring-2 hover:ring-blue-300"
          >
            <div className="h-48 bg-gray-200">
              <img 
                src={city.image} 
                alt={city.name}
                className="w-full h-full object-cover"
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
      
      {/* Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="relative h-64">
              <img 
                src={selectedCity.image} 
                alt={selectedCity.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x300/4A90E2/FFFFFF?text=${selectedCity.name}`;
                }}
              />
              <button 
                onClick={() => setSelectedCity(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <h2 className="text-3xl font-bold text-white">{selectedCity.name}</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">{selectedCity.description}</p>
              <h3 className="text-lg font-semibold mb-2">Highlights:</h3>
              <ul className="list-disc list-inside text-gray-600">
                {selectedCity.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}