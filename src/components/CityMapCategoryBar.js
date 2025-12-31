"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CityMapCategoryBar = ({
  markers = [],
  activeCategories = [],
  onCategoryToggle,
  onClearCategories,
  markersVisible,
  onToggleMarkersVisibility,
  showLabels = true,
  onToggleLabels,
  loading = false
}) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Category emojis mapping
  const categoryEmojis = {
    fishandchips: "🐟",
    racecourse: "🏇",
    park: "🌳",
    pint: "🍺",
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
    bookmaker: "🟩",
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
    fuelgas: "⛽",
    casino: "🎰",
    cafe_wifi: "☕📶",
    cafe_power: "☕🔌",
    restaurant_wifi: "🍽️📶",
    restaurant_power: "🍽️🔌",
    library_wifi: "📚📶",
    coworking: "💼",
  };

  // Check if mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Helper function to normalize categories
  const normalizeCategories = (categories) => {
    if (!categories) return [];
    if (typeof categories === "string") return [categories];
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

  // Use all available categories
  const mainCategories = useMemo(() => {
    return availableCategories;
  }, [availableCategories]);

  // Responsive calculations
  const emojiButtonWidth = isMobile ? 52 : 56; // Slightly larger touch targets on mobile
  const visibleEmojisCount = 6; // Fixed at 6 as requested
  const gap = isMobile ? 8 : 10;
  const totalGaps = (visibleEmojisCount - 1) * gap;
  const scrollContainerWidth = (emojiButtonWidth * visibleEmojisCount) + totalGaps;
  const arrowSize = isMobile ? 20 : 16;

  // Enhanced scroll arrows visibility
  const checkScrollArrows = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < maxScrollLeft - 5);
    }
  }, []);

  useEffect(() => {
    checkScrollArrows();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollArrows, { passive: true });
      window.addEventListener("resize", checkScrollArrows, { passive: true });
      
      return () => {
        if (scrollContainer) {
          scrollContainer.removeEventListener("scroll", checkScrollArrows);
        }
        window.removeEventListener("resize", checkScrollArrows);
      };
    }
  }, [availableCategories, checkScrollArrows]);

  const scrollDistance = isMobile ? emojiButtonWidth * 2 : emojiButtonWidth * 1.5;

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollDistance, behavior: "smooth" });
    }
  }, [scrollDistance]);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
    }
  }, [scrollDistance]);

  const getCategoryTitle = (key) => {
    const titles = {
      fishandchips: "Fish & Chips",
      racecourse: "Racecourse",
      park: "Park",
      pint: "Beer",
      atm: "ATM",
      historic: "Historic Site",
      museum: "Museum",
      beach: "Beach",
      cafe: "Cafe",
      restaurant: "Restaurant",
      viewpoint: "Viewpoint",
      college: "College",
      church: "Church",
      art: "Art Gallery",
      cricket: "Cricket Stadium",
      bookstore: "Bookstore",
      grocery: "Groceries",
      hospital: "Hospital",
      bookmaker: "Bookies",
      pharmacy: "Pharmacy",
      Red: "Red Luas",
      Green: "Green Luas",
      icecream: "Ice-cream",
      womenbeauty: "Women Aesthetics",
      leisure: "Leisure",
      retailshops: "Retail Shops",
      hospitality: "Hospitality",
      health: "Healthcare",
      police: "Police",
      dentist: "Dentist",
    };
    return titles[key] || key;
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

  const containerStyles = {
    position: "relative",
    margin: isMobile ? "16px auto" : "20px auto",
    width: "100%",
    maxWidth: `${scrollContainerWidth + (isMobile ? 80 : 60)}px`,
    padding: isMobile ? "0 10px" : "0"
  };

  const scrollContainerStyles = {
    display: "flex",
    gap: `${gap}px`,
    padding: isMobile ? "12px 40px" : "8px 30px",
    overflowX: "auto",
    borderRadius: "12px",
    marginBottom: "16px",
    alignItems: "center",
    flexWrap: "nowrap",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    userSelect: "none",
    justifyContent: "flex-start",
    width: "100%",
    position: "relative"
  };

  const arrowButtonStyles = {
    position: "absolute",
    zIndex: 20,
    borderRadius: "50%",
    padding: isMobile ? "12px" : "10px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    backgroundColor: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(0,0,0,0.1)",
    top: "50%",
    transform: "translateY(-50%)",
    transition: "all 0.2s ease"
  };

  const categoryButtonStyles = (isActive) => ({
    fontSize: isMobile ? "1.6rem" : "1.4rem",
    padding: isMobile ? "10px 12px" : "8px 10px",
    cursor: "pointer",
    borderRadius: "12px",
    background: isActive ? "bg-white/30 backdrop-blur-md" : "bg-transparent backdrop-blur-0", // when not selected,
    backdropFilter: isActive ? "blur(16px)" : "blur(0px)",
    transition: "all 0.3s ease",
    // border: isActive ? "2px solid rgba(59, 130, 246, 0.3)" : "2px solid transparent",
    flexShrink: 0,
    position: "relative",
    minWidth: `${emojiButtonWidth}px`,
    height: `${emojiButtonWidth}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // boxShadow: isActive ? "0 4px 12px rgba(59, 130, 246, 0.2)" : ""
  });

  const actionButtonStyles = {
    fontSize: isMobile ? "0.9rem" : "1rem",
    padding: isMobile ? "10px 16px" : "8px 12px",
    cursor: "pointer",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.9)",
    color: "#374151",
    border: "1px solid rgba(0,0,0,0.1)",
    userSelect: "none",
    transition: "all 0.2s ease",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  };

  return (
    <div style={containerStyles}>
      {/* Category Icons Bar */}
      <div
        ref={scrollRef}
        style={scrollContainerStyles}
        className="category-scroll-container"
      >
        

        {/* Category buttons */}
        {mainCategories.map((key) => {
          const isActive = activeCategories.includes(key);
          return (
            <button
              key={key}
              onClick={() => onCategoryToggle(key)}
              title={getCategoryTitle(key)}
              style={categoryButtonStyles(isActive)}
              onMouseEnter={(e) => { 
                if (!isMobile) {
                  e.currentTarget.style.transform = "scale(1.1)"; 
                }
              }}
              onMouseLeave={(e) => { 
                if (!isMobile) {
                  e.currentTarget.style.transform = "scale(1)"; 
                }
              }}
              aria-label={`Filter by ${getCategoryTitle(key)}`}
            >
              {categoryEmojis[key]}
              {/* Count badge */}
              {categoryCounts[key] > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: isActive 
                    ? "linear-gradient(135deg, #ef4444, #dc2626)" 
                    : "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  borderRadius: "50%",
                  width: isMobile ? "22px" : "20px",
                  height: isMobile ? "22px" : "20px",
                  fontSize: isMobile ? "0.6rem" : "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease"
                }}>
                  {categoryCounts[key]}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Button Container */}
      <div style={{
        display: "flex",
        // flexDirection: isMobile ? "row" : "row",
        justifyContent: "center",
        alignItems: "center",
        gap: isMobile ? "12px" : "20px",
        marginTop: "16px",
        marginBottom: "20px",
        padding: isMobile ? "0 20px" : "0"
      }}>
        {/* Show/Hide Markers Button */}
        <button
          onClick={onToggleMarkersVisibility}
          style={actionButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          }}
          aria-label="Toggle markers visibility"
        >
          {markersVisible ? "Hide Markers" : "Show Markers"}
        </button>

        {/* Clear All Button */}
        <button
          onClick={onClearCategories}
          style={actionButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          }}
          aria-label="Clear all filters"
        >
          Clear Items
        </button>

        {/* Toggle Labels Button */}
        {onToggleLabels && (
          <button
            onClick={onToggleLabels}
            style={{
              ...actionButtonStyles,
              background: showLabels
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            aria-label="Toggle place name labels"
          >
            {showLabels ? "🏷️ Hide Labels" : "🏷️ Show Labels"}
          </button>
        )}
      </div>
      
      {/* Active categories indicator */}
      {activeCategories.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: isMobile ? "-30px" : "-25px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: isMobile ? "0.75rem" : "0.7rem",
          color: "#1e40af",
          background: "rgba(219, 234, 254, 0.9)",
          padding: isMobile ? "6px 14px" : "4px 12px",
          borderRadius: "16px",
          backdropFilter: "blur(8px)",
          fontWeight: "500",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          🔍 {activeCategories.length} filter{activeCategories.length !== 1 ? "s" : ""} active
        </div>
      )}
    </div>
  );
};

export default CityMapCategoryBar;