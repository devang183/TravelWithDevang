'use client';

import { motion } from 'framer-motion';
import { Camera, Heart, Users, Sparkles, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';
import { photos } from '../test-cities/CityPhotos';
import { useMemo } from 'react';

export default function ContributorsPage() {
  // Calculate photo contributions dynamically
  const contributorsData = useMemo(() => {
    const calculateContributions = (contributorName) => {
      let totalPhotos = 0;
      const citiesSet = new Set();

      Object.entries(photos).forEach(([cityKey, cityData]) => {
        if (cityData.images && Array.isArray(cityData.images)) {
          const cityPhotoCount = cityData.images.filter(img => {
            if (typeof img === 'object' && img.photographer === contributorName) {
              return true;
            }
            return false;
          }).length;

          if (cityPhotoCount > 0) {
            totalPhotos += cityPhotoCount;
            citiesSet.add(cityKey);
          }
        }
      });

      return {
        photoCount: totalPhotos,
        cities: citiesSet.size
      };
    };

    const meghanaStats = calculateContributions('Meghana Kankaria');
    const kushalStats = calculateContributions('Kushal Pillewan');

    return [
      {
        id: 'meghana-kankaria',
        name: 'Ms. Meghana Kankaria',
        title: 'Architecture Student & Photographer',
        location: 'Houston, Texas',
        photoCount: meghanaStats.photoCount,
        cities: meghanaStats.cities,
        badge: 'Star Contributor',
        gradient: 'from-purple-600 via-pink-600 to-rose-500',
        description: 'Bringing architectural vision and creative energy to every photograph'
      },
      {
        id: 'kushal-pillewan',
        name: 'Kushal Pillewan',
        title: 'Benefits Officer & Project Support Professional',
        location: 'United Kingdom',
        photoCount: kushalStats.photoCount,
        cities: kushalStats.cities,
        badge: 'Global Explorer',
        gradient: 'from-blue-600 via-cyan-600 to-indigo-600',
        description: 'Capturing moments from travels across Europe and beyond with a keen eye for detail'
      }
      // Add more contributors here as they join
    ];
  }, []);

  const contributors = contributorsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="inline-block mb-4 sm:mb-6"
          >
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600" />
              <Heart className="h-10 w-10 sm:h-16 sm:w-16 text-pink-600 fill-current" />
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600" />
            </div>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 mb-4 sm:mb-6 px-2">
            Our Amazing Contributors
          </h1>

          <p className="text-base sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
            These wonderful photographers have shared their unique perspectives and captured the beauty of cities around the world.
            Their contributions bring this website to life!
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 sm:mt-8 lg:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-8 px-2"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl min-w-[140px] sm:min-w-[180px] lg:min-w-[200px] flex-1 max-w-[160px] sm:max-w-none">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">{contributors.length}</div>
              <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Contributors</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl min-w-[140px] sm:min-w-[180px] lg:min-w-[200px] flex-1 max-w-[160px] sm:max-w-none">
              <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-600">
                {contributors.reduce((sum, c) => sum + c.photoCount, 0)}
              </div>
              <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Total Photos</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl min-w-[140px] sm:min-w-[180px] lg:min-w-[200px] flex-1 max-w-[160px] sm:max-w-none">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-600">
                {contributors.reduce((sum, c) => sum + c.cities, 0)}
              </div>
              <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Cities Covered</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Contributors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {contributors.map((contributor, index) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
            >
              <Link href={`/contributors/${contributor.id}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden cursor-pointer group"
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${contributor.gradient} p-4 sm:p-6 lg:p-8 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <motion.div
                      className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full filter blur-3xl"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity
                      }}
                    />

                    <div className="relative z-10">
                      {/* Badge */}
                      <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                        <span className="text-white font-semibold text-xs sm:text-sm">{contributor.badge}</span>
                      </div>

                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">{contributor.name}</h2>
                      <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-0.5 sm:mb-1">{contributor.title}</p>
                      <p className="text-white/80 text-xs sm:text-sm lg:text-base">{contributor.location}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 lg:p-8">
                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                      {contributor.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="text-2xl sm:text-3xl font-bold text-purple-600">{contributor.photoCount}</div>
                        <div className="text-gray-600 text-xs sm:text-sm font-semibold">Photos</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">{contributor.cities}</div>
                        <div className="text-gray-600 text-xs sm:text-sm font-semibold">Cities</div>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <motion.div
                      whileHover={{ x: 10 }}
                      className={`flex items-center justify-between bg-gradient-to-r ${contributor.gradient} text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base`}
                    >
                      <span>View Full Profile</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Call to Action for Future Contributors */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white shadow-2xl"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Camera className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto mb-4 sm:mb-6" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">Want to Contribute?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Share your travel photography and join our community of amazing contributors!
            Your unique perspective could inspire thousands of travelers.
          </p>
          <motion.a
            href="mailto:kankariadevang@gmail.com?subject=I'd like to contribute to TravelWithDevang&body=Hi Devang,%0D%0A%0D%0AI would like to contribute my travel photography to your website.%0D%0A%0D%0A"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-white text-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Get In Touch
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
