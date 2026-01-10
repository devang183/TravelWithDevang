'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Linkedin, Globe, Heart, Sparkles, Award, Languages, Briefcase, GraduationCap, Palette, Building2, Users, Lightbulb, FileText, Download, ExternalLink, QrCode, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { photos } from '../../test-cities/CityPhotos';
import { useMemo, useState, useEffect } from 'react';

export default function MeghanaKankariaProfile() {
  // Header carousel images
  const headerImages = [
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/MeghanaKankaria.jpg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/MeghanaKankaria2.jpg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/MeghanaKankaria3.jpg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/MeghanaKankaria4.jpg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/MeghanaKankaria5.jpg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/MeghanaKankaria6.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [headerImages.length]);

  // City to country mapping
  const cityToCountry = {
    'dublin': 'Ireland',
    'cork': 'Ireland',
    'galway': 'Ireland',
    'limerick': 'Ireland',
    'newry': 'Northern Ireland',
    'belfast': 'Northern Ireland',
    'london': 'United Kingdom',
    'edinburgh': 'United Kingdom',
    'manchester': 'United Kingdom',
    'paris': 'France',
    'delhi': 'India',
    'mumbai': 'India',
    'bangalore': 'India',
    'bengaluru': 'India',
    'chennai': 'India',
    'hyderabad': 'India',
    'pune': 'India',
    'kolkata': 'India',
    'new york': 'United States',
    'san francisco': 'United States',
    'los angeles': 'United States',
    'chicago': 'United States',
    'boston': 'United States',
    'seattle': 'United States',
    'austin': 'United States',
    'houston': 'United States',
    'tokyo': 'Japan',
    'singapore': 'Singapore',
    'sydney': 'Australia',
    'melbourne': 'Australia',
    'toronto': 'Canada',
    'vancouver': 'Canada',
    'dubai': 'United Arab Emirates',
    'amsterdam': 'Netherlands',
    'berlin': 'Germany',
    'munich': 'Germany',
    'barcelona': 'Spain',
    'madrid': 'Spain',
    'rome': 'Italy',
    'milan': 'Italy',
    'zurich': 'Switzerland',
    'geneva': 'Switzerland',
    'brussels': 'Belgium',
    'vienna': 'Austria',
    'prague': 'Czech Republic',
    'copenhagen': 'Denmark',
    'stockholm': 'Sweden',
    'oslo': 'Norway',
    'helsinki': 'Finland',
    'bangkok': 'Thailand',
    'kuala lumpur': 'Malaysia',
    'hong kong': 'Hong Kong',
    'seoul': 'South Korea',
    'shanghai': 'China',
    'beijing': 'China',
    'newquay': 'United Kingdom',
    'bristol': 'United Kingdom',
    'brighton': 'United Kingdom',
    'liverpool': 'United Kingdom',
    'glasgow': 'United Kingdom',
    'cardiff': 'Wales'
  };

  // Calculate contributions from CityPhotos data
  const { contributions, totalPhotos } = useMemo(() => {
    const contributorName = 'Meghana Kankaria';
    const cityContributions = {};
    let total = 0;

    // Iterate through all cities in the photos object
    Object.entries(photos).forEach(([cityKey, cityData]) => {
      if (cityData.images && Array.isArray(cityData.images)) {
        const cityPhotoCount = cityData.images.filter(img => {
          // Handle both object and string image formats
          if (typeof img === 'object' && img.photographer === contributorName) {
            return true;
          }
          return false;
        }).length;

        if (cityPhotoCount > 0) {
          // Get city name and country
          const cityName = cityData.name || cityKey;
          const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
          const country = cityToCountry[cityKey.toLowerCase()] || cityToCountry[cityName.toLowerCase()] || 'Unknown';

          cityContributions[formattedCityName] = {
            city: formattedCityName,
            count: cityPhotoCount,
            country: country
          };
          total += cityPhotoCount;
        }
      }
    });

    return {
      contributions: Object.values(cityContributions),
      totalPhotos: total
    };
  }, [cityToCountry]);

  const skills = [
    { name: 'Architectural Design', icon: Building2, color: 'from-purple-500 to-pink-500' },
    { name: 'Model Making', icon: Palette, color: 'from-blue-500 to-cyan-500' },
    { name: 'Leadership', icon: Award, color: 'from-amber-500 to-orange-500' },
    { name: 'Event Management', icon: Users, color: 'from-green-500 to-emerald-500' },
    { name: 'Creative Design', icon: Lightbulb, color: 'from-rose-500 to-pink-500' },
    { name: 'Team Management', icon: Briefcase, color: 'from-indigo-500 to-purple-500' }
  ];

  const languages = [
    { name: 'English', level: 'Native', flag: '🇺🇸' },
    { name: 'Hindi', level: 'Native', flag: '🇮🇳' },
    { name: 'Gujarati', level: 'Intermediate', flag: '🇮🇳' },
    { name: 'Marathi', level: 'Intermediate', flag: '🇮🇳' },
    { name: 'French', level: 'Intermediate', flag: '🇫🇷' }
  ];

  const achievements = [
    { title: 'Star Contributor', description: 'First contributor to the website', icon: '⭐' },
    { title: 'Architecture Visionary', description: 'Unique architectural perspective in photos', icon: '🏛️' },
    { title: 'Multi-City Explorer', description: `Contributed photos from ${contributions.length}+ cities`, icon: '🌍' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 lg:py-20">
        {/* Back Button */}
        <Link href="/contributors">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4 sm:mb-6 lg:mb-8 flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-semibold text-sm sm:text-base"
          >
            <span>←</span>
            <span>Back to Contributors</span>
          </motion.button>
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden mb-6 sm:mb-8 lg:mb-12"
        >
          {/* Header with Photo Carousel */}
          <div className="relative overflow-hidden">
            {/* Background Image Carousel */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-900 overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{
                    opacity: 1,
                    scale: 1.05,
                    transition: {
                      opacity: { duration: 0.8, ease: "easeOut" },
                      scale: { duration: 8, ease: "linear" }
                    }
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.15,
                    transition: {
                      opacity: { duration: 0.6, ease: "easeIn" },
                      scale: { duration: 0.6, ease: "easeIn" }
                    }
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={headerImages[currentImageIndex]}
                    alt={`Meghana Kankaria ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    priority={currentImageIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1]"></div>
            </div>

            {/* Name Overlay - Top Center */}
            <div className="absolute top-4 sm:top-6 lg:top-8 left-0 right-0 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-300 animate-pulse" />
                  <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white drop-shadow-2xl">
                    Ms. Meghana Kankaria
                  </h1>
                  <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-300 animate-pulse" />
                </div>
              </motion.div>
            </div>

            {/* Content Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-12 z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 lg:mb-6"
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-white/95 text-xs sm:text-sm md:text-base lg:text-xl">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="drop-shadow-lg">Bachelor of Architecture Student</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-white/95 text-xs sm:text-sm md:text-base lg:text-xl">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="drop-shadow-lg">University of Houston</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-white/95 text-xs sm:text-sm md:text-base lg:text-xl">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="drop-shadow-lg">Houston, Texas, United States</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-2 sm:gap-3"
              >
                <a
                  href="https://www.linkedin.com/in/meghanakankaria/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-full flex items-center space-x-1.5 sm:space-x-2 transition-all duration-300 hover:scale-105 shadow-lg text-xs sm:text-sm lg:text-base"
                >
                  <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/PortfolioMeghanaKankaria.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-full flex items-center space-x-1.5 sm:space-x-2 transition-all duration-300 hover:scale-105 shadow-lg text-xs sm:text-sm lg:text-base font-semibold"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span>View Portfolio</span>
                </a>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-full flex items-center space-x-1.5 sm:space-x-2 transition-all duration-300 hover:scale-105 shadow-lg text-xs sm:text-sm lg:text-base">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 fill-current" />
                  <span>Thank You!</span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="p-4 sm:p-6 lg:p-12"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <span>About</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              Architect in training, here to lay the groundwork for creativity and connection—without cutting corners!
              As a Bachelor of Architecture student at the University of Houston, I&apos;m designing my path while inspiring
              future builders as a <span className="font-semibold text-purple-600">Student Ambassador</span>, troubleshooting tech like it&apos;s my blueprint as an
              <span className="font-semibold text-purple-600"> Audio Visual Technician</span>, and helping new students find their footing (and maybe a good drafting table)
              as a <span className="font-semibold text-purple-600">Peer Advisor</span>. When I&apos;m not drafting designs, I&apos;m volunteering at beach cleanups, campus food
              pantries, earthquake relief, and beyond—because making an impact goes beyond the walls we build.
              In short, I&apos;m all about bringing ideas to life with <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">energy and heart!</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
            <span>Achievements</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-purple-100"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl mb-4">{achievement.icon}</div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills & Languages Section - Combined in Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8 lg:mb-12">
          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span>Skills & Expertise</span>
            </h2>
            {/* Mobile: Horizontal scroll, Desktop: Grid */}
            <div className="overflow-x-auto pb-4 -mx-3 px-3 sm:mx-0 sm:px-0 lg:overflow-visible">
              <div className="flex lg:grid lg:grid-cols-2 gap-3 sm:gap-4 min-w-max lg:min-w-0">
                {skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.7 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-br ${skill.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg text-white min-w-[160px] lg:min-w-0`}
                  >
                    <skill.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mb-2 sm:mb-3" />
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold whitespace-nowrap lg:whitespace-normal">{skill.name}</h3>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Languages Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.7, duration: 0.8 }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
              <Languages className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <span>Languages</span>
            </h2>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
              {/* Mobile: Horizontal scroll, Desktop: Grid */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 lg:overflow-visible">
                <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 min-w-max sm:min-w-0">
                  {languages.map((language, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.9 + index * 0.1, type: "spring" }}
                      className="text-center min-w-[100px] sm:min-w-0"
                    >
                      <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">{language.flag}</div>
                      <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900">{language.name}</h3>
                      <p className="text-xs text-gray-600">{language.level}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Photo Contributions Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.8 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
            <span>Photo Contributions</span>
          </h2>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {totalPhotos}
                </div>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-2">Total Photos Contributed</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contributions.map((contribution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.7 + index * 0.1 }}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{contribution.city}</h3>
                    <span className="text-xl sm:text-2xl font-bold text-purple-600">{contribution.count}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{contribution.country}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Professional Portfolio Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7, duration: 0.8 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            <span>Professional Portfolio</span>
          </h2>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Architecture Portfolio</h3>
                  <p className="text-white/90 text-lg">
                    Explore Meghana&apos;s professional architectural work and creative projects
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/PortfolioMeghanaKankaria.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-purple-600 px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>View Portfolio</span>
                  </a>
                  <a
                    href="https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/PortfolioMeghanaKankaria.pdf"
                    download
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-white/30 transition-all duration-300 hover:scale-105 shadow-lg font-semibold border border-white/30"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Connect Section with QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.9, duration: 0.8 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <Share2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span>Connect</span>
          </h2>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left side - QR Code */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.1 }}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8"
              >
                <div className="mb-6 text-center">
                  <QrCode className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Scan to Connect</h3>
                  <p className="text-gray-600">
                    Scan this QR code to learn more about Meghana and connect with her
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-64 h-64 bg-white rounded-xl shadow-lg p-4"
                >
                  <Image
                    src="https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/ProfileQR.jpeg"
                    alt="Meghana Kankaria Profile QR Code"
                    fill
                    className="object-contain p-2"
                  />
                </motion.div>

                <p className="text-sm text-gray-500 mt-4 text-center italic">
                  Point your camera at the QR code to access Meghana&apos;s profile
                </p>
              </motion.div>

              {/* Right side - Connect Options */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.2 }}
                className="flex flex-col justify-center space-y-6"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Get in Touch</h3>
                  <p className="text-gray-700 mb-6">
                    Connect with Meghana to collaborate on architectural projects, photography,
                    or to learn more about her creative journey.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/meghanakankaria/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
                  >
                    <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Linkedin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">LinkedIn</p>
                      <p className="text-sm text-gray-600">Professional network</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </a>

                  {/* Portfolio */}
                  <a
                    href="https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/PortfolioMeghanaKankaria.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl hover:from-purple-100 hover:to-pink-200 transition-all duration-300 group"
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Architecture Portfolio</p>
                      <p className="text-sm text-gray-600">View creative work</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </a>

                  {/* QR Code Download */}
                  <a
                    href="https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/MeghanaKankaria/ProfileQR.jpeg"
                    download
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl hover:from-green-100 hover:to-emerald-200 transition-all duration-300 group"
                  >
                    <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Download QR Code</p>
                      <p className="text-sm text-gray-600">Share with others</p>
                    </div>
                    <Download className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3.3, duration: 0.8 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-12 text-center text-white shadow-2xl"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="inline-block text-6xl mb-4"
          >
            ❤️
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Thank You, Meghana!</h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
            Your contributions have brought life, color, and architectural beauty to this website.
            Your eye for design shines through every photograph. We&apos;re grateful to have you as our first contributor!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
