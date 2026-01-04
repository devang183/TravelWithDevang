"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js'; // import Fuse here
import { X } from 'lucide-react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const cities = {
  2024: [
    
    { id: 'dublin', name: 'Dublin', image: 'https://cityphotoscity.s3.amazonaws.com/images/dublin/dublin3.jpg', description: 'The capital of Ireland, famous for its literary heritage.', highlights: ['Trinity College', 'Temple Bar', 'Guinness Storehouse'] },
    { id: 'newry', name: 'Newry', image: 'https://cityphotoscity.s3.amazonaws.com/images/newry/newry.jpg', description: 'The capital of Ireland, famous for its literary heritage.', highlights: ['Trinity College', 'Temple Bar', 'Guinness Storehouse'] },
    { id: 'london', name: 'London', image: 'https://cityphotoscity.s3.amazonaws.com/images/london/london.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
    { id: 'belfast', name: 'Belfast', image: 'https://cityphotoscity.s3.amazonaws.com/images/belfast/belfast.jpg', description: 'A nice little town in Northern Ireland with rich history and beautiful surroundings.', highlights: ['Historic castle', 'Beautiful countryside', 'Friendly locals'] },
    { id: 'liverpool', name: 'Liverpool', image: 'https://cityphotoscity.s3.amazonaws.com/images/liverpool/liverpool-header.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
    { id: 'newyork', name: 'New York', image: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/newyork/nyc7.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
    { id: 'chicago', name: 'Chicago', image: 'https://cityphotoscity.s3.amazonaws.com/images/liverpool/liverpool-header.jpg', description: 'A vibrant city on Ireland\'s west coast.', highlights: ['Cliffs of Moher', 'Traditional music', 'Colorful houses'] },
  ],
  2025: [
    { id: 'birmingham', name: 'Birmingham', image: 'https://cityphotoscity.s3.amazonaws.com/images/birmingham/birmingham.jpg', description: 'A nice little town in Northern Ireland with rich history and beautiful surroundings.', highlights: ['Historic castle', 'Beautiful countryside', 'Friendly locals'] },
    { id: 'manchester', name: 'Manchester', image: 'https://cityphotoscity.s3.amazonaws.com/images/manchester/manchester.jpg', description: 'The capital of England, a vibrant metropolis with iconic landmarks.', highlights: ['Big Ben', 'Tower Bridge', 'British Museum'] },
    { id: 'leeds', name: 'Leeds', image: 'https://cityphotoscity.s3.amazonaws.com/images/leeds/leeds.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'malahide', name: 'Malahide', image: 'https://cityphotoscity.s3.amazonaws.com/images/malahide/malahide.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'naas', name: 'Naas', image: 'https://cityphotoscity.s3.amazonaws.com/images/naas/naas.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'maynooth', name: 'Maynooth', image: 'https://cityphotoscity.s3.amazonaws.com/images/maynooth/maynooth.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'muharraq', name: 'Muharraq', image: 'https://cityphotoscity.s3.amazonaws.com/images/rabat-header.jpg', description: 'Historic Bahraini city known for its traditional architecture and pearl diving heritage.', highlights: ['Muharraq Souq', 'Sheikh Isa Bin Ali House', 'Pearling Path'] },
    { id: 'rabat', name: 'Rabat', image: 'https://cityphotoscity.s3.amazonaws.com/images/rabat/rabat-header.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'galway', name: 'Galway', image: 'https://cityphotoscity.s3.amazonaws.com/images/galway/galway.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'delhi', name: 'Delhi', image: 'https://cityphotoscity.s3.amazonaws.com/images/delhi/delhi.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'raipur', name: 'Raipur', image: 'https://cityphotoscity.s3.amazonaws.com/images/raipur/raipur.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'nagpur', name: 'Nagpur', image: 'https://cityphotoscity.s3.amazonaws.com/images/raipur/raipur2.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
    { id: 'bengaluru', name: 'Bengaluru', image: 'https://cityphotoscity.s3.amazonaws.com/images/bengaluru/bengaluru.jpeg', description: 'The Silicon Valley of India, known for its thriving tech industry, pleasant climate, and vibrant culture.', highlights: ['Lalbagh Botanical Garden', 'Bengaluru Palace', 'Vidhana Soudha'] },
    { id: 'newquay', name: 'Newquay', image: 'https://cityphotoscity.s3.amazonaws.com/images/newquay/newquay11.jpg', description: 'The capital of Northern Ireland, known for its maritime history.', highlights: ['Titanic Museum', 'Peace walls', 'Crown Liquor Saloon'] },
  ],
  2026: [
    // Add your 2026 cities here
  ]
};

export default function CityExplorer() {
  const router = useRouter();

  const [selectedYear, setSelectedYear] = useState(2024);
  const [hoveredYear, setHoveredYear] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);


  useEffect(() => {
    const savedYear = localStorage.getItem("selectedYear");
    if (savedYear) {
      setSelectedYear(parseInt(savedYear));
    }
  }, []);
  
  const handleYearClick = (year) => {
    setSelectedYear(year);
    localStorage.setItem("selectedYear", year); // save it
    setQuery("");
    setSearchResults([]);
  };

  const [fadeIn, setFadeIn] = useState(true);

  // Search states
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Flatten all cities with year info for searching
  const allCities = Object.entries(cities).flatMap(([year, cityArr]) =>
    cityArr.map((city) => ({ ...city, year }))
  );

  // Initialize Fuse with city names
  // const fuse = new Fuse(allCities, {
  //   keys: ['name'],
  //   threshold: 0.4, // tweak threshold to your liking (lower = stricter)
  // });

  useEffect(() => {
    const handleYearArrow = (e) => {
      const years = Object.keys(cities).map(Number).sort();
      const currentIndex = years.indexOf(selectedYear);
  
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedYear(years[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && currentIndex < years.length - 1) {
        setSelectedYear(years[currentIndex + 1]);
      }
    };
  
    window.addEventListener('keydown', handleYearArrow);
    return () => window.removeEventListener('keydown', handleYearArrow);
  }, [selectedYear]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
  
    setQuery(val);
  
    if (val.length === 0) {
      setSearchResults([]);
      setSelectedIndex(-1);
      return;
    }
  
    // Fuse setup
    const fuse = new Fuse(allCities, {
      keys: ["name"],
      threshold: 0.4, // tweak for sensitivity
      ignoreLocation: true,
    });
  
    const results = fuse.search(val);
  
    if (results.length > 0) {
      const bestMatch = results[0].item.name;
      const bestScore = results[0].score;
  
      // Check if best match is close and different from user input
      if (bestScore < 0.3 && bestMatch.toLowerCase() !== val.toLowerCase()) {
        setQuery(bestMatch);           // <-- autocorrect here
        setSearchResults(results.map(r => r.item));
        setSelectedIndex(0);
        return;
      }
    }
  
    // If no good fuzzy match, fallback to normal filter
    const filtered = allCities.filter(city =>
      city.name.toLowerCase().includes(val.toLowerCase())
    );
  
    setSearchResults(filtered);
    setSelectedIndex(0);
  };
  const handleCitySelect = (city) => {
    setQuery("");
    setSearchResults([]);
    router.push(`/test-cities/${city.id}`);
  };

  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;
  
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === searchResults.length - 1 ? 0 : prev + 1
        );
        break;
  
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? searchResults.length - 1 : prev - 1
        );
        break;
  
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleCitySelect(searchResults[selectedIndex]);
        }
        break;
  
      case 'Escape':
        setSearchResults([]);
        setSelectedIndex(-1);
        break;
  
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen max-w-20xl mx-auto overflow-y-auto pt-16" style={{
      fontFamily: '"Playfair Display", serif',
      backgroundImage: "url('https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg')",
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    }}>
      <h1 className="text-5xl mt-0 font-bold mb-8 text-center text-[8vw] uppercase tracking-widest text-[#3e4a4c]">
        {"City Explorer".split("").map((char, idx) => (
          <span
            key={idx}
            className="inline-block transition-transform duration-200 hover:scale-150 hover:text-white"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      {/* Year Tabs */}
      <div className="flex justify-center mb-8 transition-all duration-500">
        {Object.keys(cities).map((year) => (
          <button
            key={year}
            onClick={() => handleYearClick(parseInt(year))}
            onMouseEnter={() => setHoveredYear(parseInt(year))}
            onMouseLeave={() => setHoveredYear(null)}
            className={`px-6 py-3 mx-2 rounded-full font-bold transition-all duration-300 ${
              selectedYear === parseInt(year)
                ? "text-black scale-130 text-white shadow-lg bg-[#4d5c5f]"
                : "text-black bg-[#6c8185]"
            } ${
              hoveredYear === parseInt(year) && selectedYear !== parseInt(year)
                ? "scale-105 shadow-md"
                : ""
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 rounded-md focus:outline-none"
        />
        {searchResults.length > 0 && (
          <ul className="absolute z-50 w-full bg-[#9BB9BF] rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
            {searchResults.slice(0, 10).map((city, index) => {
              const startIndex = city.name.toLowerCase().indexOf(query.toLowerCase());
              const endIndex = startIndex + query.length;
              const beforeMatch = city.name.slice(0, startIndex);
              const match = city.name.slice(startIndex, endIndex);
              const afterMatch = city.name.slice(endIndex);

              return (
                <li
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className={`cursor-pointer px-4 py-2 ${
                    index === selectedIndex
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-100"
                  }`}
                >
                  <span>
                    {beforeMatch}
                    <span className="font-bold text-blue-600">
                      {match}
                    </span>
                    {afterMatch}
                  </span>{' '}
                  <span className="text-xs text-gray-500">({city.year})</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Cities Grid with fadeIn animation */}
      <div
        className={`transition-opacity duration-700 ease-in-out ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities[selectedYear].map((city) => (
            <div
              key={city.id}
              onClick={() => router.push(`/test-cities/${city.id}`)}
              className="bg-[#c3d5d8] rounded-2xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer transition duration-300"
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
              <div className="p-4 text-center">
                <h3 className="text-xl font-semibold mb-2 text-black hover:text-white transition-colors">
                  {city.name}
                </h3>
                <p className="text-gray-600 text-sm">{city.description}</p>
                <div className="mt-2 text-xs text-gray-500 italic">
                  Click to explore {city.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}