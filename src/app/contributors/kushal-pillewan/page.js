'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Linkedin, Globe, Heart, Sparkles, Award, Languages, Briefcase, GraduationCap, Palette, Building2, Users, Lightbulb, FileText, Download, ExternalLink, QrCode, Share2, TreePine } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { photos } from '../../test-cities/CityPhotos';
import { useMemo, useState, useEffect } from 'react';

export default function KushalPillewanProfile() {
  // Header carousel images
  const headerImages = [
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/KushalPillewan/KushalPillewan.jpeg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/KushalPillewan/KushalPillewan2.jpeg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/KushalPillewan/KushalPillewan3.jpeg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/KushalPillewan/KushalPillewan4.jpeg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/KushalPillewan/KushalPillewan5.jpeg',
    'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/contributors/KushalPillewan/KushalPillewan6.jpeg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
    }, 4000);

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
    'cardiff': 'Wales',
    'zagreb': 'Croatia',
    'sarajevo': 'Bosnia and Herzegovina',
    'penzance': 'United Kingdom'
  };

  // Calculate contributions from CityPhotos data
  const { contributions, totalPhotos } = useMemo(() => {
    const contributorName = 'Kushal Pillewan';
    const cityContributions = {};
    let total = 0;

    Object.entries(photos).forEach(([cityKey, cityData]) => {
      if (cityData.images && Array.isArray(cityData.images)) {
        const cityPhotoCount = cityData.images.filter(img => {
          if (typeof img === 'object' && img.photographer === contributorName) {
            return true;
          }
          return false;
        }).length;

        if (cityPhotoCount > 0) {
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
  }, []);

  const skills = [
    { name: 'Project Management', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { name: 'Programme Delivery', icon: Award, color: 'from-purple-500 to-indigo-500' },
    { name: 'Customer Service', icon: Users, color: 'from-green-500 to-emerald-500' },
    { name: 'Data Management', icon: Palette, color: 'from-amber-500 to-orange-500' },
    { name: 'Cross-functional Coordination', icon: Building2, color: 'from-rose-500 to-pink-500' },
    { name: 'Administrative Workflows', icon: Lightbulb, color: 'from-teal-500 to-cyan-500' }
  ];

  const achievements = [
    { title: 'Travel Enthusiast', description: 'Explored multiple countries across Europe', icon: '✈️' },
    { title: 'Community Volunteer', description: 'Environmental initiatives in Coventry & Warwick', icon: '🌱' },
    { title: 'Photography Contributor', description: 'Captured diverse cityscapes and moments', icon: '📸' }
  ];

  const education = {
    degree: 'Master of Science - Programme and Project Management',
    university: 'University of Warwick',
    period: 'Oct 2022 - Oct 2023',
    grade: 'Merit (2.1)',
    societies: ['Warwick Language Society', 'Warwick Manufacturing Group', 'Warwick Salsa']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
          className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
          className="absolute -bottom-8 left-1/3 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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

      <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20">
        {/* Back Button */}
        <Link href="/contributors">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="mb-8 flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold"
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
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden mb-12"
        >
          {/* Header with Photo Carousel */}
          <div className="relative overflow-hidden">
            {/* Background Image Carousel */}
            <div className="relative h-[400px] sm:h-[500px] bg-gray-900">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={headerImages[currentImageIndex]}
                    alt={`Kushal Pillewan ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={currentImageIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1]"></div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-[2]">
                {headerImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mb-4"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-300 animate-pulse" />
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl">
                    Mr. Kushal Pillewan
                  </h1>
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-300 animate-pulse" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 mb-6"
              >
                <div className="flex items-center space-x-2 text-white/95 text-base sm:text-lg lg:text-xl">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="drop-shadow-lg">Benefits Officer & Project Support Professional</span>
                </div>
                <div className="flex items-center space-x-2 text-white/95 text-base sm:text-lg lg:text-xl">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="drop-shadow-lg">MSc Programme and Project Management</span>
                </div>
                <div className="flex items-center space-x-2 text-white/95 text-base sm:text-lg lg:text-xl">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="drop-shadow-lg">University of Warwick</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-3"
              >
                <a
                  href="https://www.linkedin.com/in/kushal-pillewan-b42781250/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">LinkedIn</span>
                </a>
                <a
                  href="https://www.journiapp.com/api/web/ul/preview/450955e3f77bfb11OTBlMzYwO2U="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-semibold">Portfolio</span>
                </a>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  <span className="text-sm sm:text-base">Thank You!</span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="p-8 sm:p-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span>About</span>
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              I am an organized, proactive, and people-focused <span className="font-semibold text-blue-600">Benefits Officer</span> and{' '}
              <span className="font-semibold text-blue-600">Project Support professional</span> with 2 years of experience supporting programme delivery,
              project coordination, customer service, and data management across local government, start-up, and charity sectors. My work involves
              coordinating complex administrative workflows, handling sensitive customer cases, and managing communication across cross-functional
              teams including academic staff, finance teams, project leads, and external partners. Beyond my professional life, I'm passionate about
              traveling and exploring diverse cultures, having visited beautiful places like{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Zagreb, Netherlands, Sarajevo, Newquay, and Penzance
              </span>.
            </p>
          </motion.div>
        </motion.div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span>Education</span>
          </h2>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-4 rounded-xl">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{education.degree}</h3>
                <p className="text-xl text-blue-600 font-semibold mb-2">{education.university}</p>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  <span>{education.period}</span>
                  <span>•</span>
                  <span className="font-semibold text-gray-900">Grade: {education.grade}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Activities and Societies:</p>
                  <div className="flex flex-wrap gap-2">
                    {education.societies.map((society, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {society}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <Award className="h-8 w-8 text-amber-500" />
            <span>Achievements & Volunteering</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-100"
              >
                <div className="text-5xl mb-4">{achievement.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span>Skills & Expertise</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.9 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${skill.color} p-6 rounded-2xl shadow-lg text-white`}
              >
                <skill.icon className="h-8 w-8 mb-3" />
                <h3 className="text-xl font-bold">{skill.name}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Photo Contributions Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <Camera className="h-8 w-8 text-cyan-600" />
            <span>Photo Contributions</span>
          </h2>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.3, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  {totalPhotos}
                </div>
                <p className="text-xl text-gray-600 mt-2">Total Photos Contributed</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contributions.map((contribution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 + index * 0.1 }}
                  className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{contribution.city}</h3>
                    <span className="text-2xl font-bold text-blue-600">{contribution.count}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{contribution.country}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.7, duration: 0.8 }}
          className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl"
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
          <h2 className="text-4xl font-bold mb-4">Thank You, Kushal!</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your incredible photography captures the essence of each destination beautifully.
            Thank you for sharing your travel experiences and perspectives with us!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
