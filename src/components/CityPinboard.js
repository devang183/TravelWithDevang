'use client';
import { motion } from 'framer-motion';

const CityPinboard = ({ cities, onCitySelect, selectedCity }) => {
  // Group cities by first letter
  const groupedCities = cities.reduce((acc, city) => {
    const firstLetter = city.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(city);
    return acc;
  }, {});

  // Sort letters alphabetically
  const sortedLetters = Object.keys(groupedCities).sort();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedLetters.map((letter) => (
          <div key={letter} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-500 mb-4 pb-2 border-b border-blue-100">
              {letter}
            </h2>
            <div className="space-y-2">
              {groupedCities[letter].map((city, index) => (
                <motion.button
                  key={city.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCitySelect(city)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedCity?.name === city.name
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{city.name}</span>
                    {city.country && (
                      <span className="text-sm opacity-70">
                        {city.country}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityPinboard;
