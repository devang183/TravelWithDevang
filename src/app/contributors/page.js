'use client';

import { motion } from 'framer-motion';
import { Camera, Heart, Users, Sparkles, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
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
            className="inline-block mb-6"
          >
            <div className="flex items-center justify-center space-x-4">
              <Sparkles className="h-12 w-12 text-purple-600" />
              <Heart className="h-16 w-16 text-pink-600 fill-current" />
              <Sparkles className="h-12 w-12 text-purple-600" />
            </div>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 mb-6">
            Our Amazing Contributors
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            These wonderful photographers have shared their unique perspectives and captured the beauty of cities around the world.
            Their contributions bring this website to life!
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-8"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl min-w-[200px]">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-purple-600">{contributors.length}</div>
              <div className="text-gray-600 font-semibold">Contributors</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl min-w-[200px]">
              <Camera className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-pink-600">
                {contributors.reduce((sum, c) => sum + c.photoCount, 0)}
              </div>
              <div className="text-gray-600 font-semibold">Total Photos</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl min-w-[200px]">
              <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-amber-600">
                {contributors.reduce((sum, c) => sum + c.cities, 0)}
              </div>
              <div className="text-gray-600 font-semibold">Cities Covered</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Contributors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden cursor-pointer group"
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${contributor.gradient} p-8 relative overflow-hidden`}>
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
                      <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                        <Award className="h-5 w-5 text-yellow-300" />
                        <span className="text-white font-semibold">{contributor.badge}</span>
                      </div>

                      <h2 className="text-3xl font-bold text-white mb-2">{contributor.name}</h2>
                      <p className="text-white/90 text-lg mb-1">{contributor.title}</p>
                      <p className="text-white/80">{contributor.location}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                      {contributor.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4">
                        <div className="text-3xl font-bold text-purple-600">{contributor.photoCount}</div>
                        <div className="text-gray-600 text-sm font-semibold">Photos</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4">
                        <div className="text-3xl font-bold text-blue-600">{contributor.cities}</div>
                        <div className="text-gray-600 text-sm font-semibold">Cities</div>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <motion.div
                      whileHover={{ x: 10 }}
                      className={`flex items-center justify-between bg-gradient-to-r ${contributor.gradient} text-white px-6 py-4 rounded-xl font-semibold`}
                    >
                      <span>View Full Profile</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
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
          className="mt-16 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-12 text-center text-white shadow-2xl"
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
            <Camera className="h-16 w-16 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4">Want to Contribute?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Share your travel photography and join our community of amazing contributors!
            Your unique perspective could inspire thousands of travelers.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Get In Touch
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
