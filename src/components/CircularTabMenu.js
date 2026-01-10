'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Plane, Home, Newspaper, Calendar, Users, Menu, X } from 'lucide-react';

/**
 * Circular Expanding Tab Menu
 * Elegant radial menu that expands from a central button
 */
export default function CircularTabMenu({ cityid, showEvents = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);

  // Track window size for responsive radius
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Tab configuration with icons and colors
  const tabs = [
    {
      icon: Compass,
      label: 'Explore',
      href: `/test-cities/${cityid}/explore`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500'
    },
    {
      icon: Plane,
      label: 'Travel',
      href: `/test-cities/${cityid}/travel`,
      color: 'text-green-600',
      bgColor: 'bg-green-500'
    },
    {
      icon: Home,
      label: 'Stays',
      href: `/test-cities/${cityid}/airbnb`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500'
    },
    {
      icon: () => (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.93.69 1.88V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10c0-5.52-4.48-10-10-10z"/>
        </svg>
      ),
      label: 'Reddit',
      href: `/test-cities/${cityid}/reddit`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500'
    },
    {
      icon: () => (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Places',
      href: `/test-cities/${cityid}/attractions`,
      color: 'text-pink-600',
      bgColor: 'bg-pink-500'
    },
    {
      icon: Newspaper,
      label: 'News',
      href: `/test-cities/${cityid}/news`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500'
    },
    {
      icon: Users,
      label: 'Stories',
      href: `/test-cities/${cityid}/stories`,
      color: 'text-teal-600',
      bgColor: 'bg-teal-500'
    },
  ];

  // Add Events tab conditionally
  if (showEvents) {
    tabs.push({
      icon: Calendar,
      label: 'Events',
      href: `/test-cities/${cityid}/events`,
      color: 'text-red-600',
      bgColor: 'bg-red-500'
    });
  }

  // Calculate semicircular positions for tabs (upward semicircle)
  const getCircularPosition = (index, total) => {
    // Responsive radius: smaller on mobile, larger on desktop
    const radius = isMobile ? 85 : 110; // Smaller radius on mobile for better fit

    // Distribute tabs in an upward semicircle from left to right (180 degrees)
    // Start angle: -Math.PI (left), End angle: 0 (right)
    const angleStep = Math.PI / (total - 1); // Divide 180 degrees by number of gaps
    const angle = -Math.PI + (angleStep * index); // Start from left, go to right

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius // Negative y goes upward (sin of negative angles)
    };
  };

  return (
    <>
      {/* Central Toggle Button - Bottom Center */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isExpanded ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }`}
        style={{ zIndex: 10100 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-8 h-8 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Circular Menu Items */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              style={{ zIndex: 10050 }}
              onClick={() => setIsExpanded(false)}
            />

            {/* Tab Buttons in Circle */}
            {tabs.map((tab, index) => {
              const { x, y } = getCircularPosition(index, tabs.length);
              const Icon = tab.icon;
              const buttonSize = isMobile ? 48 : 56; // w-12/h-12 = 48px, w-14/h-14 = 56px

              return (
                <motion.div
                  key={tab.label}
                  className="fixed"
                  style={{
                    left: '50%',
                    bottom: '24px', // Same as center button (6*4px)
                    zIndex: 10100,
                  }}
                  initial={{
                    x: -(buttonSize / 2),
                    y: 0,
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{
                    x: x - (buttonSize / 2), // Offset from center minus half button width
                    y: y, // Negative y values go upward
                    scale: 1,
                    opacity: 1
                  }}
                  exit={{
                    x: -(buttonSize / 2),
                    y: 0,
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.04,
                    mass: 0.5
                  }}
                >
                  <Link
                    href={tab.href}
                    className="group block"
                    aria-label={tab.label}
                    onMouseEnter={() => setHoveredTab(index)}
                    onMouseLeave={() => setHoveredTab(null)}
                  >
                    <motion.div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${tab.bgColor} shadow-lg flex items-center justify-center relative cursor-pointer`}
                      whileHover={{
                        scale: 1.3,
                        y: -8,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 15
                        }
                      }}
                      whileTap={{
                        scale: 0.95,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <div className="text-white">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>

                      {/* Label tooltip - appears on hover */}
                      <AnimatePresence>
                        {hoveredTab === index && (
                          <motion.div
                            className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none shadow-xl"
                            style={{ zIndex: 10200 }}
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            {tab.label}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
