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
  loading = false 
}) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

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
    fuelgas: "⛽",
  };


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

  // Calculate container width
  const emojiButtonWidth = 48;
  const visibleEmojisCount = 8;
  const scrollContainerWidth = emojiButtonWidth * visibleEmojisCount;


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
        scrollContainer.removeEventListener("scroll", checkScrollArrows);
        window.removeEventListener("resize", checkScrollArrows);
      };
    }
  }, [availableCategories, checkScrollArrows]);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  }, []);

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
      paddypower: "Paddy Power Betfair",
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

  return (
    <div style={{ position: "relative", margin: "20px auto", width: scrollContainerWidth + 60 }}>
      {/* Category Icons Bar */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "10px",
          padding: "8px 20px",
          overflowX: "auto",
          borderRadius: "8px",
          marginBottom: "12px",
          alignItems: "center",
          flexWrap: "nowrap",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          userSelect: "none",
          justifyContent: "flex-start",
          width: "100%",
        }}
        className="category-scroll-container"
      >

        {/* Scroll arrows */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            style={{
              position: "absolute",
              left: "80px",
              top:"50px",
              zIndex: 20,
              borderRadius: "50%",
              padding: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={8} />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={scrollRight}
            style={{
              position: "absolute",
              right: "80px",
              top:"50px",
              zIndex: 20,
              borderRadius: "50%",
              padding: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            aria-label="Scroll right"
          >
            <ChevronRight size={8} />
          </button>
        )}

        {/* Category buttons */}
        {mainCategories.map((key) => {
          return (
            <button
              key={key}
              onClick={() => onCategoryToggle(key)}
              title={getCategoryTitle(key)}
              style={{
                fontSize: "1.4rem",
                padding: "6px 10px",
                cursor: "pointer",
                borderRadius: "8px",
                background: activeCategories.includes(key) ? "#dbeafe" : "transparent",
                backdropFilter: activeCategories.includes(key) ? "blur(5px)" : "none",
                transition: "transform 0.2s, border-color 0.3s, background-color 0.3s, backdrop-filter 0.3s",
                border: "none",
                flexShrink: 0,
                position: "relative"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              aria-label={`Filter by ${key}`}
            >
              {categoryEmojis[key]}
              {/* Count badge */}
              {categoryCounts[key] > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}>
                  {categoryCounts[key]}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Button Container */}
<div
  style={{
    display: "flex",
    justifyContent: "center", // center both buttons horizontally
    alignItems: "center", // align vertically if needed
    gap: "20px", // space between buttons
    marginTop: "20px", // optional top spacing
    marginBottom:"20px"
  }}
>
  {/* Show/Hide Markers Button */}
  <button
    onClick={onToggleMarkersVisibility}
    style={{
      fontSize: "1rem",
      padding: "6px 12px",
      cursor: "pointer",
      borderRadius: "8px",
      background: "rgba(255,255,255,0.3)",
      color: "black",
      border: "none",
      userSelect: "none",
      transition: "transform 0.2s, border-color 0.3s, background-color 0.3s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
    }}
    aria-label="Toggle markers visibility"
  >
    {markersVisible ? "Hide Markers" : "Show Markers"}
  </button>

  {/* Clear All Button */}
  <button
    onClick={onClearCategories}
    style={{
      fontSize: "1rem",
      padding: "6px 12px",
      cursor: "pointer",
      borderRadius: "8px",
      background: "rgba(255,255,255,0.3)",
      color: "black",
      border: "none",
      userSelect: "none",
      transition:
        "transform 0.2s, border-color 0.3s, background-color 0.3s, backdrop-filter 0.3s",
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
    }}
    aria-label="Clear all filters"
  >
    Clear Items
  </button>
</div>
    
      {/* Active categories indicator */}
      {activeCategories.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.4rem",
          color: "#1e40af",
          background: "rgba(219, 234, 254, 0.8)",
          padding: "4px 12px",
          borderRadius: "12px",
          backdropFilter: "blur(5px)"
        }}>
          🔍 {activeCategories.length} filter{activeCategories.length !== 1 ? "s" : ""} active
        </div>
      )}
    </div>
  );
};

export default CityMapCategoryBar;
