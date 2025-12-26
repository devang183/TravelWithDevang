"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryEmojiBar = ({ 
  markers = [], 
  activeCategories = [], 
  onCategoryToggle, 
  onClearCategories,
  loading = false 
}) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Comprehensive emoji mapping
  const categoryEmojis = {
    fishandchips: "🐟",
    racecourse: "🏇",
    park: "🌳",
    pint: "🍺",
    bakerloo: "🚇",
    atm: "🏧",
    historic: "🏰",
    museum: "🖼️",
    beach: "🏖️",
    cafe: "☕",
    restaurant: "🍽️",
    viewpoint: "🔭",
    college: "🎓",
    church: "⛪",
    art: "🎨",
    cricket: "🏏",
    bookstore: "📚",
    grocery: "🛒",
    hospital: "🩺",
    paddypower: "🟩",
    pharmacy: "💊",
    Red: "🔴",
    Green: "🟢",
    icecream: "🍦",
    womenbeauty: "💇‍♀️",
    leisure: "🎭",
    retailshops: "🛍️",
    hospitality: "🏨",
    health: "🏥",
    police: "👮",
    dentist: "🦷",
    cafe_wifi: "☕📶",
    cafe_power: "☕🔌",
    restaurant_wifi: "🍽️📶",
    restaurant_power: "🍽️🔌",
    library_wifi: "📚📶",
    coworking: "💼",
  };


  // Helper function to normalize categories
  const normalizeCategories = (categories) => {
    if (!categories) return [];
    if (typeof categories === 'string') return [categories];
    if (Array.isArray(categories)) return categories;
    return [];
  };

  // Calculate available categories from current markers
  const availableCategories = useMemo(() => {
    if (!markers || markers.length === 0) return [];
    
    const categorySet = new Set();
    
    markers.forEach(marker => {
      const markerCategories = normalizeCategories(marker.categories || marker.category);
      markerCategories.forEach(cat => categorySet.add(cat));
    });
    
    return Array.from(categorySet).sort();
  }, [markers]);

  // Get category counts for each available category
  const categoryCounts = useMemo(() => {
    const counts = {};
    
    availableCategories.forEach(category => {
      counts[category] = markers.filter(marker => {
        const markerCategories = normalizeCategories(marker.categories || marker.category);
        return markerCategories.includes(category);
      }).length;
    });
    
    return counts;
  }, [markers, availableCategories]);

  // Sort categories: text-based emojis first, symbol-only emojis last
  const sortedCategories = useMemo(() => {
    const textBasedEmojis = {
      fishandchips: true,
      racecourse: true,
      park: true,
      pint: true,
      atm: true,
      historic: true,
      museum: true,
      beach: true,
      cafe: true,
      restaurant: true,
      viewpoint: true,
      college: true,
      church: true,
      art: true,
      cricket: true,
      bookstore: true,
      grocery: true,
      hospital: true,
      paddypower: true,
      pharmacy: true,
      icecream: true,
      womenbeauty: true,
      leisure: true,
      retailshops: true,
      hospitality: true,
      health: true,
      police: true,
      dentist: true,
      underground: true
    };
    
    const textBased = availableCategories.filter(cat => textBasedEmojis[cat]);
    const symbolOnly = availableCategories.filter(cat => !textBasedEmojis[cat]);
    
    return [...textBased, ...symbolOnly];
  }, [availableCategories]);
  
  const mainCategories = sortedCategories;

  // Calculate container width for exactly 6 visible emojis + clear button
  const containerWidth = useMemo(() => {
    const emojiWidth = 68; // 56px (4rem padding) + 12px gap
    const clearButtonWidth = 100; // Approximate clear button width
    return clearButtonWidth + (emojiWidth * 6) + 64; // 64px for padding
  }, []);

  // Enhanced scroll arrows visibility with better detection
  const checkScrollArrows = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      
      setShowLeftArrow(scrollLeft > 5); // Small threshold for better UX
      setShowRightArrow(scrollLeft < maxScrollLeft - 5);
    }
  }, []);

  useEffect(() => {
    checkScrollArrows();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollArrows, { passive: true });
      window.addEventListener('resize', checkScrollArrows, { passive: true });
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollArrows);
        window.removeEventListener('resize', checkScrollArrows);
      };
    }
  }, [availableCategories, checkScrollArrows]);

  // Calculate scroll amount for exactly one emoji width
  const getEmojiWidth = useCallback(() => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      const firstEmoji = scrollRef.current.children[0]; // First emoji button
      return firstEmoji.offsetWidth + 12; // Include gap
    }
    return 80; // Fallback width
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      const scrollAmount = getEmojiWidth();
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  }, [getEmojiWidth]);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      const scrollAmount = getEmojiWidth();
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, [getEmojiWidth]);

  const handleCategoryClick = (category) => {
    onCategoryToggle(category);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (availableCategories.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No categories available for this city
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center mb-4 mt-4" style={{ maxWidth: `${containerWidth}px`, margin: '0 auto' }}>
      {/* Clear all button - positioned before left arrow */}
      <button
        onClick={onClearCategories}
        className="absolute left-0 z-30 px-3 py-2 text-sm font-medium text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md border border-gray-300"
        title="Clear all filters"
      >
        ✕
      </button>
      
      {/* Enhanced Left scroll arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-20 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 shadow-xl rounded-full p-2 transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>
      )}

      {/* Enhanced Category scroll container - Fixed width for 6 emojis */}
      <div
        ref={scrollRef}
        className="flex justify-center items-center gap-3 overflow-x-auto scrollbar-hide py-3 max-w-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          width: `${containerWidth - 120}px`, // Account for clear button and arrow space
          marginLeft: "100px", // Space for clear button
          marginRight: "20px", // Space for right arrow
        }}
        onScroll={checkScrollArrows}
      >


        {/* Main categories with enhanced styling */}
        {mainCategories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex-shrink-0 relative group transform transition-all duration-300 ease-out ${
              activeCategories.includes(category)
                ? "bg-transparent border-2 border-blue-300 shadow-lg scale-105"
                : "bg-transparent hover:bg-gray-50/30 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
            } rounded-xl hover:scale-110 active:scale-95`}
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`${category} (${categoryCounts[category]} items)`}
          >
            <span className="text-xl">
              {categoryEmojis[category] || "📍"}
            </span>
            {categoryCounts[category] > 1 && (
              <span className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md bg-gradient-to-r from-green-500 to-green-600">
                {categoryCounts[category]}
              </span>
            )}
            
            {/* Subtle glow effect for active categories */}
            {activeCategories.includes(category) && (
              <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-20 blur-sm -z-10"></div>
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Right scroll arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 z-20 bg-gradient-to-l from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 shadow-xl rounded-full p-2 transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      )}

      {/* Enhanced Active categories indicator */}
      {activeCategories.length > 0 && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 animate-pulse">
          <span className="text-xs font-medium text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 rounded-full shadow-md border border-blue-200">
            🔍 {activeCategories.length} filter{activeCategories.length !== 1 ? 's' : ''} active
          </span>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryEmojiBar;
