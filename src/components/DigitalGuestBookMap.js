import React, { useState, useRef, useEffect } from 'react';
import { Camera, Heart, MessageCircle, Star, X, Plus, Send, User, Clock, Trash2, AlertTriangle, PawPrint } from 'lucide-react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
const DigitalGuestbookMap = ({ cityName = "Dublin", cityCoords = { lat: 53.3498, lng: -6.2603 } }) => {
  // Get current user session for ownership checks
  const { data: session } = useSession();

  // Create storage key based on city
  const getStorageKey = (key) => `guestbook_${cityName.toLowerCase()}_${key}`;
  const [searchQuery, setSearchQuery] = useState('');
  const [MsearchQuery, MsetSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
const scrollContainerRef = useRef(null);
  // Load pins from localStorage or use default data for the city
  const getDefaultPins = () => {
    const defaultData = {
      dublin: [
        {
          id: 1,
          lat: 53.3498,
          lng: -6.2603,
          title: "Temple Bar Magic",
          note: "The street musicians here created the most magical evening. Don't miss the violin duo around 7pm!",
          author: "Sarah M.",
          timestamp: "2 hours ago",
          likes: 12,
          category: "music",
          image: null,
          isDefault: true
        },
        {
          id: 2,
          lat: 53.3441,
          lng: -6.2675,
          title: "Hidden Coffee Gem",
          note: "Best flat white in Dublin, tucked away from the tourist crowds. The barista knows every regular's name!",
          author: "Mike K.",
          timestamp: "1 day ago",
          likes: 8,
          category: "food",
          image: null,
          isDefault: true
        },
        {
          id: 3,
          lat: 53.3606,
          lng: -6.2534,
          title: "Sunset Views",
          note: "Incredible sunset spot that locals showed us. Pack a picnic and watch the city light up!",
          author: "Emma L.",
          timestamp: "3 days ago",
          likes: 23,
          category: "view",
          image: null,
          isDefault: true
        },
        {
          id: 4,
          lat: 53.3520,
          lng: -6.2620,
          title: "Vintage Shopping Paradise",
          note: "Amazing vintage finds and unique Irish crafts. The owner has incredible stories about each piece!",
          author: "Jake R.",
          timestamp: "5 hours ago",
          likes: 15,
          category: "shopping",
          image: null,
          isDefault: true
        },
        {
          id: 5,
          lat: 53.3470,
          lng: -6.2550,
          title: "Gallery District Gem",
          note: "Contemporary art gallery with rotating local artists. Free wine on Friday evenings!",
          author: "Maya P.",
          timestamp: "1 day ago",
          likes: 9,
          category: "culture",
          image: null,
          isDefault: true
        },
        {
          id: 6,
          lat: 53.3550,
          lng: -6.2580,
          title: "Secret Garden Park",
          note: "Hidden green space perfect for meditation and reading. Locals bring their dogs here in the morning.",
          author: "Tom K.",
          timestamp: "3 hours ago",
          likes: 18,
          category: "nature",
          image: null,
          isDefault: true
        }
      ]
    };
    
    return defaultData[cityName.toLowerCase()] || [];
  };

  function formatTimeAgo(timestamp) {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
  
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
  
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
    // Show weekday for things within the last 7 days
    if (diffDays < 14) {
      return created.toLocaleDateString(undefined, { weekday: "long" }); // e.g. "Monday"
    }
  
    // Show full date for older items
    return created.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  const loadPinsFromStorage = () => {
    try {
      const defaultPins = getDefaultPins();
      const storedPins = JSON.parse(localStorage.getItem(getStorageKey('pins')) || '[]');
      // Combine default pins with stored user pins
      return [...defaultPins, ...storedPins];
    } catch (error) {
      console.error('Error loading pins from storage:', error);
      return getDefaultPins();
    }
  };

  const savePinsToStorage = (newPins) => {
    try {
      // Only save legacy local pins (not default ones, not DB pins)
      // DB pins are already saved in MongoDB, no need to duplicate in localStorage
      const localPins = newPins.filter(pin => !pin.isDefault && !pin.fromDB);
      localStorage.setItem(getStorageKey('pins'), JSON.stringify(localPins));
    } catch (error) {
      console.error('Error saving pins to storage:', error);
    }
  };

  // Fetch pins from MongoDB
  const fetchPinsFromDB = async () => {
    try {
      const cityId = cityName.toLowerCase();
      const response = await fetch(`/api/guestbook/${cityId}`);

      if (response.ok) {
        const dbPins = await response.json();

        // Transform MongoDB pins to match the component's format
        const transformedPins = dbPins.map(pin => ({
          id: pin.id,
          lat: pin.lat,
          lng: pin.lng,
          title: pin.title,
          note: pin.note,
          author: pin.author,
          createdAt: new Date(pin.timestamp).toISOString(),
          likes: pin.likes || 0,
          category: pin.category || 'general',
          image: pin.image || null,
          isDefault: false,
          fromDB: true
        }));

        return transformedPins;
      } else {
        console.error('Failed to fetch pins from database');
        return [];
      }
    } catch (error) {
      console.error('Error fetching pins from database:', error);
      return [];
    }
  };

  // Save pin to MongoDB
  const savePinToDB = async (pin) => {
    try {
      const cityId = cityName.toLowerCase();
      const response = await fetch(`/api/guestbook/${cityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: pin.lat,
          lng: pin.lng,
          title: pin.title,
          note: pin.note,
          author: pin.author,
          timestamp: Date.now(),
          likes: pin.likes || 0,
          category: pin.category || 'general',
          image: pin.image || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.pin;
      } else {
        console.error('Failed to save pin to database');
        return null;
      }
    } catch (error) {
      console.error('Error saving pin to database:', error);
      return null;
    }
  };

  // Delete pin from MongoDB
  const deletePinFromDB = async (pinId) => {
    try {
      const cityId = cityName.toLowerCase();
      const response = await fetch(`/api/guestbook/${cityId}?pinId=${pinId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        // Return error details from API
        return {
          success: false,
          error: data.error,
          message: data.message,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Error deleting pin from database:', error);
      return {
        success: false,
        error: 'Network error',
        message: error.message
      };
    }
  };

  const [pins, setPins] = useState(loadPinsFromStorage);
  const [isLoadingPins, setIsLoadingPins] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [activeCategories, setActiveCategories] = useState(new Set(['food', 'music', 'view', 'shopping', 'culture', 'nature', 'general']));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [newPin, setNewPin] = useState({
    title: '',
    note: '',
    author: '',
    category: 'general',
    image: null
  });
  const [map, setMap] = useState(null);
  const [L, setL] = useState(null);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        try {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
          
          await new Promise(resolve => {
            link.onload = resolve;
            link.onerror = resolve;
          });
          
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          
          await new Promise((resolve, reject) => {
            script.onload = () => {
              console.log('Leaflet loaded successfully');
              setL(window.L);
              resolve();
            };
            script.onerror = (error) => {
              console.error('Failed to load Leaflet:', error);
              reject(error);
            };
          });
          document.head.appendChild(script);
        } catch (error) {
          console.error('Error loading Leaflet:', error);
        }
      } else if (window.L) {
        setL(window.L);
      }
    };
    loadLeaflet();
  }, []);

  // Load pins from MongoDB on component mount
  useEffect(() => {
    const loadPins = async () => {
      setIsLoadingPins(true);
      const dbPins = await fetchPinsFromDB();
      const defaultPins = getDefaultPins();

      // Combine default pins with database pins
      const allPins = [...defaultPins, ...dbPins];
      setPins(allPins);
      setIsLoadingPins(false);
    };

    loadPins();
  }, [cityName]);

  // Initialize map
  useEffect(() => {
    if (L && mapRef.current && !mapInstance.current) {
      try {
        console.log('Initializing map with coordinates:', cityCoords);
        
        const mapObj = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: false,
          center: [cityCoords.lat, cityCoords.lng],
          zoom: 13
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(mapObj);

        const handleMapClick = (e) => {
          console.log('Map clicked at:', e.latlng);
          setClickPosition({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
          // Auto-fill author name if user is logged in
          if (session?.user?.name) {
            setNewPin(prev => ({ ...prev, author: session.user.name }));
          }
          setShowAddForm(true);
        };

        mapObj.on('click', handleMapClick);
        mapInstance.current = mapObj;
        setMap(mapObj);
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, [L, cityCoords.lat, cityCoords.lng]);

  // Handle map click blocking when form is open
  useEffect(() => {
    if (map && mapInstance.current) {
      const mapObj = mapInstance.current;
      
      if (showAddForm || showDeleteConfirm) {
        mapObj.dragging.disable();
        mapObj.touchZoom.disable();
        mapObj.doubleClickZoom.disable();
        mapObj.scrollWheelZoom.disable();
        mapObj.boxZoom.disable();
        mapObj.keyboard.disable();
      } else {
        mapObj.dragging.enable();
        mapObj.touchZoom.enable();
        mapObj.doubleClickZoom.enable();
        mapObj.scrollWheelZoom.enable();
        mapObj.boxZoom.enable();
        mapObj.keyboard.enable();
      }
    }
  }, [map, showAddForm, showDeleteConfirm]);

  // Update markers based on filtered pins and active categories
  useEffect(() => {
    if (map && L) {
      // Clear existing markers
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];

      // Only add markers for filtered pins (based on active categories)
      const visiblePins = pins.filter(pin => activeCategories.has(pin.category));
      
      visiblePins.forEach(pin => {
        const categoryColor = getCategoryColor(pin.category);
        const categoryIcon = getCategoryIcon(pin.category);
        
        const customIcon = L.divIcon({
          html: `
            <div class="relative">
              <div class="w-8 h-8 ${categoryColor} rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transform hover:scale-110 transition-transform duration-200">
                <span class="text-xs">${categoryIcon}</span>
              </div>
              <div class="w-1 h-6 bg-gray-700 mx-auto"></div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [32, 50],
          iconAnchor: [16, 50]
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedPin(pin);
          });

        markersRef.current.push(marker);
      });
    }
  }, [map, pins, L, activeCategories]); // Added activeCategories as dependency

  // Note: We removed the automatic localStorage save effect because:
  // - DB pins are saved via API to MongoDB (no need for localStorage)
  // - Only legacy local pins need localStorage, and they're saved when modified
  // - This prevents QuotaExceededError when many pins are loaded from DB

  const handleAddPin = async () => {
    if (!newPin.title || !newPin.note || !newPin.author || !clickPosition) return;

    const pin = {
      id: Date.now(),
      lat: clickPosition.lat,
      lng: clickPosition.lng,
      title: newPin.title,
      note: newPin.note,
      author: newPin.author,
      createdAt: new Date().toISOString(),
      likes: 0,
      category: newPin.category,
      image: newPin.image,
      isDefault: false,
      fromDB: true
    };

    // Save to MongoDB
    const savedPin = await savePinToDB(pin);

    if (savedPin) {
      // Use the pin returned from database with proper ID
      const dbPin = {
        id: savedPin.id,
        lat: savedPin.lat,
        lng: savedPin.lng,
        title: savedPin.title,
        note: savedPin.note,
        author: savedPin.author,
        createdAt: new Date(savedPin.timestamp).toISOString(),
        likes: savedPin.likes || 0,
        category: savedPin.category || 'general',
        image: savedPin.image || null,
        isDefault: false,
        fromDB: true
      };
      setPins([...pins, dbPin]);
    } else {
      // Fallback to local storage if DB save fails
      setPins([...pins, pin]);
    }

    setShowAddForm(false);
    setClickPosition(null);
    setNewPin({ title: '', note: '', author: '', category: 'general', image: null });
  };

  const handleDeletePin = (pinId) => {
    const pin = pins.find(p => p.id === pinId);
    if (pin && !pin.isDefault) {
      setShowDeleteConfirm(pinId);
    }
  };

  // Check if the current user can delete a pin
  const canDeletePin = (pin) => {
    // Default pins cannot be deleted
    if (pin.isDefault) return false;

    // Non-database pins can be deleted (legacy local storage pins)
    if (!pin.fromDB) return true;

    // For database pins, check if the current user is the owner
    if (session?.user?.id && pin.userId) {
      return session.user.id === pin.userId;
    }

    // If no session or no userId on pin, allow deletion (for backward compatibility)
    return true;
  };

  const confirmDeletePin = async () => {
    if (deleteConfirmText.toLowerCase() === 'delete' && showDeleteConfirm) {
      const pinToDelete = pins.find(p => p.id === showDeleteConfirm);

      // If pin is from database, delete from MongoDB
      if (pinToDelete && pinToDelete.fromDB) {
        const result = await deletePinFromDB(showDeleteConfirm);

        if (!result.success) {
          // Check if it's a forbidden error (trying to delete someone else's pin)
          if (result.status === 403) {
            alert("Stop messing with other people's pins! You can only delete your own pins.");
          } else if (result.status === 401) {
            alert("You must be signed in to delete pins.");
          } else {
            alert(`Failed to delete pin: ${result.message || 'Unknown error'}`);
          }

          // Close the delete dialog but don't remove from UI
          setShowDeleteConfirm(null);
          setDeleteConfirmText('');
          return;
        }
      }

      // Only remove from local state if deletion succeeded or it's a non-DB pin
      setPins(pins.filter(pin => pin.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      setDeleteConfirmText('');
      setSelectedPin(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
    setDeleteConfirmText('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPin({ ...newPin, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Fly to pin location on map with smooth animation
  const handleFlyToPin = (pin) => {
    if (map && pin.lat && pin.lng) {
      // Smooth fly animation to pin location with higher zoom
      map.flyTo([pin.lat, pin.lng], 16, {
        duration: 1.5, // Animation duration in seconds
        easeLinearity: 0.25 // Smoothness of animation (0-1, lower is smoother)
      });

      // Set selected pin to show details after a short delay
      setTimeout(() => {
        setSelectedPin(pin);
      }, 800); // Show details halfway through animation
    }
  };

  const likePin = (pinId) => {
    setPins(pins.map(pin => 
      pin.id === pinId ? { ...pin, likes: pin.likes + 1 } : pin
    ));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      music: '🎵',
      view: '🌅',
      shopping: '🛍️',
      culture: '🎭',
      nature: '🌳',
      general: '📍'
    };
    return icons[category] || '📍';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      food: 'Food & Drink',
      music: 'Music & Entertainment',
      view: 'Views & Scenery',
      shopping: 'Shopping',
      culture: 'Culture & Arts',
      nature: 'Nature & Parks',
      general: 'General'
    };
    return labels[category] || 'General';
  };

  const getAllCategories = () => {
    return [
      { key: 'food', icon: '🍽️', label: 'Food & Drink', color: 'bg-orange-500' },
      { key: 'music', icon: '🎵', label: 'Music & Entertainment', color: 'bg-purple-500' },
      { key: 'view', icon: '🌅', label: 'Views & Scenery', color: 'bg-blue-500' },
      { key: 'shopping', icon: '🛍️', label: 'Shopping', color: 'bg-pink-500' },
      { key: 'culture', icon: '🎭', label: 'Culture & Arts', color: 'bg-yellow-500' },
      { key: 'nature', icon: '🌳', label: 'Nature & Parks', color: 'bg-green-500' },
      { key: 'general', icon: '📍', label: 'General', color: 'bg-gray-500' }
    ];
  };

  const toggleCategory = (category) => {
    const newActiveCategories = new Set(activeCategories);
    if (newActiveCategories.has(category)) {
      newActiveCategories.delete(category);
    } else {
      newActiveCategories.add(category);
    }
    setActiveCategories(newActiveCategories);
  };

  const selectAllCategories = () => {
    setActiveCategories(new Set(['food', 'music', 'view', 'shopping', 'culture', 'nature', 'general']));
  };

  const clearAllCategories = () => {
    setActiveCategories(new Set());
  };

  // Get filtered pins based on active categories
  const filteredPins = pins.filter(pin => activeCategories.has(pin.category));

  // Get category counts for current city only
  const getCategoryCounts = () => {
    const counts = {};
    getAllCategories().forEach(cat => {
      counts[cat.key] = pins.filter(pin => pin.category === cat.key).length;
    });
    return counts;
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-orange-500',
      music: 'bg-purple-500',
      view: 'bg-blue-500',
      shopping: 'bg-pink-500',
      culture: 'bg-yellow-500',
      nature: 'bg-green-500',
      general: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  

// re-render every 60 sec to keep "time ago" updated
useEffect(() => {
  const interval = setInterval(() => setCurrentTime(new Date()), 60000);
  return () => clearInterval(interval);
}, []);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden">
      {/* Category Filter Slider */}
      <div className="bg-white border-b p-3 sm:p-4">
        <div className="flex items-center justify-end mb-3 sm:mb-4">
          <div className="flex gap-2">
            <button
              onClick={selectAllCategories}
              className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              All
            </button>
            <button
              onClick={clearAllCategories}
              className="px-2 sm:px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              None
            </button>
          </div>
        </div>

        {/* Category Pills - Horizontal scroll on mobile */}
        <div className="flex sm:flex-wrap gap-2 mb-2 overflow-x-auto sm:overflow-x-visible pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
          {getAllCategories().map((category) => {
            const isActive = activeCategories.has(category.key);
            const count = getCategoryCounts()[category.key];
            
            return (
              <button
                key={category.key}
                onClick={() => toggleCategory(category.key)}
                className={`
                  flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border-2 transition-all duration-200 transform hover:scale-105 flex-shrink-0
                  ${isActive
                    ? `${category.color} text-white border-transparent shadow-lg`
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-base sm:text-lg">{category.icon}</span>
                <span className="font-medium text-xs sm:text-sm whitespace-nowrap">{category.label}</span>
                <span className={`
                  text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Active Filter Summary */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <span className="line-clamp-2">
            Showing {filteredPins.length} of {pins.length} discoveries in {cityName}
            {activeCategories.size === 0 && " (select categories to view discoveries)"}
          </span>
          {activeCategories.size > 0 && activeCategories.size < 7 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Filtered view active
            </span>
          )}
        </div>
      </div>

      {/* Map Container - Square on mobile, taller on desktop */}
      <div className="relative aspect-square sm:aspect-auto sm:h-96 bg-gray-100">
        <div
          ref={mapRef}
          className="w-full h-full z-0"
          style={{ minHeight: '300px' }}
        />

        {/* Map Search - Responsive */}
<div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 shadow-lg flex items-center gap-1.5 sm:gap-2 max-w-[calc(100%-1rem)] sm:max-w-none">
  <input
    type="text"
    placeholder="Search for a place..."
    className="p-1.5 sm:p-2 border rounded-lg w-32 sm:w-64 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={MsearchQuery}
    onChange={(e) => MsetSearchQuery(e.target.value)}
    onKeyDown={async (e) => {
      if (e.key === 'Enter' && MsearchQuery.trim()) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(MsearchQuery)}`
          );
          const results = await response.json();
          if (results.length > 0) {
            const place = results[0];
            const lat = parseFloat(place.lat);
            const lng = parseFloat(place.lon);
            map.setView([lat, lng], 16); // Center map on the result
            setClickPosition({ lat, lng });
            // Auto-fill author name if user is logged in
            if (session?.user?.name) {
              setNewPin(prev => ({ ...prev, author: session.user.name }));
            }
            setShowAddForm(true); // Open pin form
          } else {
            alert("Place not found!");
          }
        } catch (err) {
          console.error("Error searching place:", err);
        }
      }
    }}
  />
</div>

        {/* Recenter Button - Responsive */}
        <button
          onClick={() => {
            if (map) {
              map.setView([cityCoords.lat, cityCoords.lng], 13);
            }
          }}
          className="absolute top-[60px] sm:top-[90px] right-2 sm:right-[10px] z-[1000] bg-white/30 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg cursor-pointer text-green-300 transition-transform hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Recenter map"
        >
          <PawPrint size={16} className="sm:w-5 sm:h-5" />
        </button>

        {/* Loading/Error state */}
        {!L ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : !map ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Initializing map...</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Add Pin Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Share Your Discovery</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setClickPosition(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Place Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Hidden Garden Cafe"
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPin.title}
                  onChange={(e) => setNewPin({ ...newPin, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Your Discovery *</label>
                <textarea
                  placeholder="Tell others why this place is special..."
                  rows={3}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPin.note}
                  onChange={(e) => setNewPin({ ...newPin, note: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Alex T."
                  className={`w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    session?.user?.name ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  value={newPin.author}
                  onChange={(e) => setNewPin({ ...newPin, author: e.target.value })}
                  readOnly={!!session?.user?.name}
                  title={session?.user?.name ? 'Name is auto-filled from your account' : ''}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPin.category}
                  onChange={(e) => setNewPin({ ...newPin, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="food">Food & Drink</option>
                  <option value="music">Music & Entertainment</option>
                  <option value="view">Views & Scenery</option>
                  <option value="shopping">Shopping</option>
                  <option value="culture">Culture & Arts</option>
                  <option value="nature">Nature & Parks</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Add Photo (Optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2.5 sm:p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 flex items-center justify-center gap-2 text-gray-600 text-sm sm:text-base"
                >
                  <Camera size={18} className="sm:w-5 sm:h-5" />
                  {newPin.image ? 'Photo Added ✓' : 'Upload Photo'}
                </button>
              </div>
              {clickPosition && (
                <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-2.5 sm:p-3 rounded-lg">
                  📍 Location: {clickPosition.lat.toFixed(4)}, {clickPosition.lng.toFixed(4)}
                </div>
              )}
              <button
                onClick={handleAddPin}
                disabled={!newPin.title || !newPin.note || !newPin.author}
                className="w-full bg-blue-500 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                Share Discovery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Details Modal */}
      {selectedPin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getCategoryColor(selectedPin.category)} rounded-full flex items-center justify-center text-white`}>
                  <span>{getCategoryIcon(selectedPin.category)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedPin.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    {selectedPin.author}
                    {/* <Clock size={14} />
                    {selectedPin.timestamp} */}
                    <Clock size={14} />
                    {formatTimeAgo(selectedPin.createdAt || selectedPin.timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canDeletePin(selectedPin) && (
                  <button
                    onClick={() => handleDeletePin(selectedPin.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Delete this discovery"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {selectedPin.image && (
              <img
                src={selectedPin.image}
                alt={selectedPin.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <p className="text-gray-700 mb-4 leading-relaxed">{selectedPin.note}</p>
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={() => likePin(selectedPin.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Heart size={18} className={selectedPin.likes > 0 ? 'fill-current' : ''} />
                {selectedPin.likes}
              </button>
              <div className="text-sm text-gray-500">
                📍 {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)}
              </div>
            </div>
            {!selectedPin.isDefault && (
              <div className="mt-4 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 This is your discovery - you can delete it using the trash icon above
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10010] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Discovery</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this discovery? This will permanently remove it from the map.
              </p>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="font-bold text-red-600">delete</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="Type 'delete' here"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePin}
                disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Discoveries Sidebar */}
      <div className="p-3 sm:p-6 border-t bg-gray-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-bold">Recent Discoveries in {cityName}</h3>
          <span className="text-xs sm:text-sm text-gray-500">
            {activeCategories.size === 7 ? 'All categories' : `${activeCategories.size} categories selected`}
          </span>
        </div>
        {/* Search Bar */}
        <div className="flex items-center mb-3 sm:mb-4 p-2 border rounded-lg bg-white shadow-sm">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" />
            <input
            type="text"
            placeholder="Search discoveries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none bg-transparent text-sm sm:text-base"
            />
        </div>
        {filteredPins.length > 0 ? (
    <div className="relative">
      {/* Left Scroll Button - Hidden on mobile */}
      <button
        onClick={() =>
          scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
        }
        className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Scrollable Row */}
      <div
  ref={scrollContainerRef}
  className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-3 sm:pb-4 px-1 sm:px-10"
>
  {filteredPins
    .filter((pin) => {
      const query = searchQuery.toLowerCase();
      return (
        pin.title?.toLowerCase().includes(query) ||
        pin.note?.toLowerCase().includes(query) ||
        pin.author?.toLowerCase().includes(query) ||
        pin.category?.toLowerCase().includes(query)
      );
    })
    .map((pin) => {
      const query = searchQuery.toLowerCase();

      // Helper function to highlight matched text
      const highlight = (text) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, idx) =>
          part.toLowerCase() === query ? (
            <mark key={idx} className="bg-yellow-200">{part}</mark>
          ) : (
            part
          )
        );
      };

      return (
        <div
          key={pin.id}
          className="min-w-[220px] sm:min-w-[250px] bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 relative group flex-shrink-0"
          style={{
            borderLeftColor:
              getCategoryColor(pin.category).includes("orange")
                ? "#f97316"
                : getCategoryColor(pin.category).includes("purple")
                ? "#a855f7"
                : getCategoryColor(pin.category).includes("blue")
                ? "#3b82f6"
                : getCategoryColor(pin.category).includes("pink")
                ? "#ec4899"
                : getCategoryColor(pin.category).includes("yellow")
                ? "#eab308"
                : getCategoryColor(pin.category).includes("green")
                ? "#22c55e"
                : "#6b7280",
          }}
          onClick={() => handleFlyToPin(pin)}
        >
          {canDeletePin(pin) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePin(pin.id);
              }}
              className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 transition-all"
              title="Delete this discovery"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getCategoryIcon(pin.category)}</span>
            <h4 className="font-semibold truncate">{highlight(pin.title)}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2 group-hover:line-clamp-none transition-all relative">
            {highlight(pin.note)}
            {/* <span className="absolute left-0 top-full mt-1 w-[300px] bg-white border border-gray-300 p-2 rounded shadow-lg text-gray-700 text-sm opacity-0 group-hover:opacity-100 z-50 transition-all pointer-events-none">
      {pin.note}
    </span> */}
            </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>by {highlight(pin.author)}</span>
            <div className="flex items-center gap-1">
              <Heart size={12} />
              {pin.likes}
            </div>
          </div>
        </div>
      );
    })}
</div>

      {/* Right Scroll Button - Hidden on mobile */}
      <button
        onClick={() =>
          scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
        }
        className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  ) : (
    <div className="text-center py-6 sm:py-8">
      <div className="text-3xl sm:text-4xl mb-2">🔍</div>
      <p className="text-gray-600 mb-2 text-sm sm:text-base px-4">
        No discoveries match your selected categories in {cityName}
      </p>
      <button
        onClick={selectAllCategories}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Show all categories
      </button>
    </div>
  )}
        {/* STATIC DISPLAY OF CARDS */}
        {/* {filteredPins.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPins.slice(0, 6).map((pin) => (
              <div
                key={pin.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 relative group"
                style={{ borderLeftColor: getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' : 
                                          getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'purple' ? '#a855f7' :
                                          getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
                                          getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'pink' ? '#ec4899' :
                                          getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' :
                                          getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' : '#6b7280' }}
                onClick={() => handleFlyToPin(pin)}
              >
                {canDeletePin(pin) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePin(pin.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 transition-all"
                    title="Delete this discovery"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(pin.category)}</span>
                  <h4 className="font-semibold truncate">{pin.title}</h4>
                  {canDeletePin(pin) && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">
                      Your Pin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{pin.note}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>by {pin.author}</span>
                  <div className="flex items-center gap-1">
                    <Heart size={12} />
                    {pin.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600 mb-2">No discoveries match your selected categories in {cityName}</p>
            <button 
              onClick={selectAllCategories}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Show all categories
            </button>
          </div>
        )} */}
        
      </div>
    </div>
  );
};

export default DigitalGuestbookMap;

// import React, { useState, useRef, useEffect } from 'react';
// import { MapPin, Camera, Heart, MessageCircle, Star, X, Plus, Send, User, Clock, Trash2, AlertTriangle, Edit3, Save } from 'lucide-react';

// const DigitalGuestbookMap = ({ cityName = "Dublin", cityCoords = { lat: 53.3498, lng: -6.2603 } }) => {
//   // Real MongoDB API functions
//   const mongoAPI = {
//     async createPin(pinData) {
//       try {
//         const response = await fetch('/api/pinsDGB', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(pinData),
//         });
        
//         if (!response.ok) {
//           const errorText = await response.text();
//           let errorMessage = 'Failed to create pin';
//           try {
//             const errorData = JSON.parse(errorText);
//             errorMessage = errorData.error || errorMessage;
//           } catch (e) {
//             errorMessage = errorText || errorMessage;
//           }
//           throw new Error(errorMessage);
//         }
        
//         return await response.json();
//       } catch (error) {
//         console.error('Create pin error:', error);
//         throw error;
//       }
//     },

//     async updatePin(pinId, updateData) {
//       try {
//         const response = await fetch(`/api/pinsDGB/${pinId}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(updateData),
//         });
        
//         if (!response.ok) {
//           const errorText = await response.text();
//           let errorMessage = 'Failed to update pin';
//           try {
//             const errorData = JSON.parse(errorText);
//             errorMessage = errorData.error || errorMessage;
//           } catch (e) {
//             errorMessage = errorText || errorMessage;
//           }
//           throw new Error(errorMessage);
//         }
        
//         return await response.json();
//       } catch (error) {
//         console.error('Update pin error:', error);
//         throw error;
//       }
//     },

//     async deletePin(pinId) {
//       try {
//         const response = await fetch(`/api/pinsDGB/${pinId}`, {
//           method: 'DELETE',
//         });
        
//         if (!response.ok) {
//           const errorText = await response.text();
//           let errorMessage = 'Failed to delete pin';
//           try {
//             const errorData = JSON.parse(errorText);
//             errorMessage = errorData.error || errorMessage;
//           } catch (e) {
//             errorMessage = errorText || errorMessage;
//           }
//           throw new Error(errorMessage);
//         }
        
//         return await response.json();
//       } catch (error) {
//         console.error('Delete pin error:', error);
//         throw error;
//       }
//     },

//     async getPins(cityName) {
//       try {
//         const response = await fetch(`/api/pinsDGB?city=${encodeURIComponent(cityName)}`);
        
//         if (!response.ok) {
//           const errorText = await response.text();
//           let errorMessage = 'Failed to fetch pins';
//           try {
//             const errorData = JSON.parse(errorText);
//             errorMessage = errorData.error || errorMessage;
//           } catch (e) {
//             errorMessage = errorText || errorMessage;
//           }
//           throw new Error(errorMessage);
//         }
        
//         return await response.json();
//       } catch (error) {
//         console.error('Get pins error:', error);
//         throw error;
//       }
//     },

//     async likePin(pinId) {
//       try {
//         const response = await fetch(`/api/pinsDGB/${pinId}/like`, {
//           method: 'PUT',
//         });
        
//         if (!response.ok) {
//           const errorText = await response.text();
//           let errorMessage = 'Failed to like pin';
//           try {
//             const errorData = JSON.parse(errorText);
//             errorMessage = errorData.error || errorMessage;
//           } catch (e) {
//             errorMessage = errorText || errorMessage;
//           }
//           throw new Error(errorMessage);
//         }
        
//         return await response.json();
//       } catch (error) {
//         console.error('Like pin error:', error);
//         throw error;
//       }
//     }
//   };

//   // Helper function to calculate time ago
//   const getTimeAgo = (date) => {
//     const now = new Date();
//     const createdAt = new Date(date);
//     const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
    
//     if (diffInMinutes < 1) return "Just now";
//     if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
//     const diffInHours = Math.floor(diffInMinutes / 60);
//     if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
//     const diffInDays = Math.floor(diffInHours / 24);
//     return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
//   };

//   // Helper function to check if pin can be edited (within 15 minutes)
//   const canEditPin = (pin) => {
//     if (pin.isDefault) return false;
//     const now = new Date();
//     const createdAt = new Date(pin.createdAt || pin.timestamp);
//     const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
//     return diffInMinutes <= 15;
//   };

//   // Get default pins for the city
//   const getDefaultPins = () => {
//     const defaultData = {
//       dublin: [
//         {
//           id: 1,
//           lat: 53.3498,
//           lng: -6.2603,
//           title: "Temple Bar Magic",
//           note: "The street musicians here created the most magical evening. Don't miss the violin duo around 7pm!",
//           author: "Sarah M.",
//           timestamp: "2 hours ago",
//           createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
//           likes: 12,
//           category: "music",
//           image: null,
//           isDefault: true
//         },
//         {
//           id: 2,
//           lat: 53.3441,
//           lng: -6.2675,
//           title: "Hidden Coffee Gem",
//           note: "Best flat white in Dublin, tucked away from the tourist crowds. The barista knows every regular's name!",
//           author: "Mike K.",
//           timestamp: "1 day ago",
//           createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
//           likes: 8,
//           category: "food",
//           image: null,
//           isDefault: true
//         },
//         {
//           id: 3,
//           lat: 53.3606,
//           lng: -6.2534,
//           title: "Sunset Views",
//           note: "Incredible sunset spot that locals showed us. Pack a picnic and watch the city light up!",
//           author: "Emma L.",
//           timestamp: "3 days ago",
//           createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
//           likes: 23,
//           category: "view",
//           image: null,
//           isDefault: true
//         },
//         {
//           id: 4,
//           lat: 53.3520,
//           lng: -6.2620,
//           title: "Vintage Shopping Paradise",
//           note: "Amazing vintage finds and unique Irish crafts. The owner has incredible stories about each piece!",
//           author: "Jake R.",
//           timestamp: "5 hours ago",
//           createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
//           likes: 15,
//           category: "shopping",
//           image: null,
//           isDefault: true
//         },
//         {
//           id: 5,
//           lat: 53.3470,
//           lng: -6.2550,
//           title: "Gallery District Gem",
//           note: "Contemporary art gallery with rotating local artists. Free wine on Friday evenings!",
//           author: "Maya P.",
//           timestamp: "1 day ago",
//           createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
//           likes: 9,
//           category: "culture",
//           image: null,
//           isDefault: true
//         },
//         {
//           id: 6,
//           lat: 53.3550,
//           lng: -6.2580,
//           title: "Secret Garden Park",
//           note: "Hidden green space perfect for meditation and reading. Locals bring their dogs here in the morning.",
//           author: "Tom K.",
//           timestamp: "3 hours ago",
//           createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
//           likes: 18,
//           category: "nature",
//           image: null,
//           isDefault: true
//         }
//       ]
//     };
    
//     return defaultData[cityName.toLowerCase()] || [];
//   };

//   const [pins, setPins] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedPin, setSelectedPin] = useState(null);
//   const [editingPin, setEditingPin] = useState(null);
//   const [editForm, setEditForm] = useState({ title: '', note: '', category: '' });
//   const [clickPosition, setClickPosition] = useState(null);
//   const [activeCategories, setActiveCategories] = useState(new Set(['food', 'music', 'view', 'shopping', 'culture', 'nature', 'general']));
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
//   const [deleteConfirmText, setDeleteConfirmText] = useState('');
//   const [newPin, setNewPin] = useState({
//     title: '',
//     note: '',
//     author: '',
//     category: 'general',
//     image: null
//   });
//   const [map, setMap] = useState(null);
//   const [L, setL] = useState(null);
//   const mapRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const mapInstance = useRef(null);
//   const markersRef = useRef([]);
//   const scrollRef = useRef(null);

//   // Load pins from MongoDB on component mount
//   useEffect(() => {
//     const loadPins = async () => {
//       try {
//         setLoading(true);
//         const defaultPins = getDefaultPins();
//         const userPins = await mongoAPI.getPins(cityName);
//         setPins([...defaultPins, ...userPins]);
//       } catch (error) {
//         console.error('Error loading pins from MongoDB:', error);
//         // Show error message to user
//         alert(`Failed to load discoveries: ${error.message}`);
//         setPins(getDefaultPins());
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadPins();
//   }, [cityName]);

//   // Load Leaflet dynamically
//   useEffect(() => {
//     const loadLeaflet = async () => {
//       if (typeof window !== 'undefined' && !window.L) {
//         try {
//           const link = document.createElement('link');
//           link.rel = 'stylesheet';
//           link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//           link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
//           link.crossOrigin = '';
//           document.head.appendChild(link);
          
//           await new Promise(resolve => {
//             link.onload = resolve;
//             link.onerror = resolve;
//           });
          
//           const script = document.createElement('script');
//           script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//           script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
//           script.crossOrigin = '';
          
//           await new Promise((resolve, reject) => {
//             script.onload = () => {
//               console.log('Leaflet loaded successfully');
//               setL(window.L);
//               resolve();
//             };
//             script.onerror = (error) => {
//               console.error('Failed to load Leaflet:', error);
//               reject(error);
//             };
//           });
//           document.head.appendChild(script);
//         } catch (error) {
//           console.error('Error loading Leaflet:', error);
//         }
//       } else if (window.L) {
//         setL(window.L);
//       }
//     };
//     loadLeaflet();
//   }, []);

//   // Initialize map
//   useEffect(() => {
//     if (L && mapRef.current && !mapInstance.current) {
//       try {
//         console.log('Initializing map with coordinates:', cityCoords);
        
//         const mapObj = L.map(mapRef.current, {
//           zoomControl: true,
//           scrollWheelZoom: true,
//           doubleClickZoom: false,
//           center: [cityCoords.lat, cityCoords.lng],
//           zoom: 13
//         });

//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//           maxZoom: 19
//         }).addTo(mapObj);

//         const handleMapClick = (e) => {
//           console.log('Map clicked at:', e.latlng);
//           setClickPosition({
//             lat: e.latlng.lat,
//             lng: e.latlng.lng
//           });
//           setShowAddForm(true);
//         };

//         mapObj.on('click', handleMapClick);
//         mapInstance.current = mapObj;
//         setMap(mapObj);
//         console.log('Map initialized successfully');
//       } catch (error) {
//         console.error('Error initializing map:', error);
//       }
//     }
//   }, [L, cityCoords.lat, cityCoords.lng]);

//   // Handle map interactions when modals are open
//   useEffect(() => {
//     if (map && mapInstance.current) {
//       const mapObj = mapInstance.current;
      
//       if (showAddForm || showDeleteConfirm || editingPin) {
//         mapObj.dragging.disable();
//         mapObj.touchZoom.disable();
//         mapObj.doubleClickZoom.disable();
//         mapObj.scrollWheelZoom.disable();
//         mapObj.boxZoom.disable();
//         mapObj.keyboard.disable();
//       } else {
//         mapObj.dragging.enable();
//         mapObj.touchZoom.enable();
//         mapObj.doubleClickZoom.enable();
//         mapObj.scrollWheelZoom.enable();
//         mapObj.boxZoom.enable();
//         mapObj.keyboard.enable();
//       }
//     }
//   }, [map, showAddForm, showDeleteConfirm, editingPin]);

//   // Update markers based on filtered pins and active categories
//   useEffect(() => {
//     if (map && L && !loading) {
//       markersRef.current.forEach(marker => map.removeLayer(marker));
//       markersRef.current = [];

//       const visiblePins = pins.filter(pin => activeCategories.has(pin.category));
      
//       visiblePins.forEach(pin => {
//         const categoryColor = getCategoryColor(pin.category);
//         const categoryIcon = getCategoryIcon(pin.category);
        
//         const customIcon = L.divIcon({
//           html: `
//             <div class="relative">
//               <div class="w-8 h-8 ${categoryColor} rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transform hover:scale-110 transition-transform duration-200">
//                 <span class="text-xs">${categoryIcon}</span>
//               </div>
//               <div class="w-1 h-6 bg-gray-700 mx-auto"></div>
//             </div>
//           `,
//           className: 'custom-div-icon',
//           iconSize: [32, 50],
//           iconAnchor: [16, 50]
//         });

//         const marker = L.marker([pin.lat, pin.lng], { icon: customIcon })
//           .addTo(map)
//           .on('click', () => {
//             setSelectedPin(pin);
//           });

//         markersRef.current.push(marker);
//       });
//     }
//   }, [map, pins, L, activeCategories, loading]);

//   // Auto-update timestamps every minute
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setPins(currentPins => [...currentPins]);
//     }, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   const handleAddPin = async () => {
//     if (!newPin.title || !newPin.note || !newPin.author || !clickPosition) return;

//     try {
//       setLoading(true);
      
//       const pinData = {
//         lat: clickPosition.lat,
//         lng: clickPosition.lng,
//         title: newPin.title,
//         note: newPin.note,
//         author: newPin.author,
//         category: newPin.category,
//         image: newPin.image,
//         cityName: cityName
//       };

//       const savedPin = await mongoAPI.createPin(pinData);
      
//       setPins(currentPins => [...currentPins, savedPin]);
//       setShowAddForm(false);
//       setClickPosition(null);
//       setNewPin({ title: '', note: '', author: '', category: 'general', image: null });
//     } catch (error) {
//       console.error('Error adding pin to MongoDB:', error);
//       alert(`Failed to save discovery: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditPin = (pin) => {
//     if (!canEditPin(pin)) return;
    
//     setEditingPin(pin);
//     setEditForm({
//       title: pin.title,
//       note: pin.note,
//       category: pin.category
//     });
//   };

//   const handleUpdatePin = async () => {
//     if (!editingPin || !editForm.title || !editForm.note) return;

//     try {
//       setLoading(true);
      
//       const updateData = {
//         title: editForm.title,
//         note: editForm.note,
//         category: editForm.category
//       };

//       const updatedPin = await mongoAPI.updatePin(editingPin._id, updateData);
      
//       setPins(currentPins => 
//         currentPins.map(pin => 
//           pin._id === editingPin._id 
//             ? { ...pin, ...updatedPin }
//             : pin
//         )
//       );

//       setEditingPin(null);
//       setSelectedPin(prev => prev && prev._id === editingPin._id ? { ...prev, ...updatedPin } : prev);
//     } catch (error) {
//       console.error('Error updating pin in MongoDB:', error);
//       alert(`Failed to update discovery: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeletePin = (pinId) => {
//     const pin = pins.find(p => p._id === pinId);
//     if (pin && !pin.isDefault) {
//       setShowDeleteConfirm(pinId);
//     }
//   };

//   const confirmDeletePin = async () => {
//     if (deleteConfirmText.toLowerCase() === 'delete' && showDeleteConfirm) {
//       try {
//         setLoading(true);
        
//         await mongoAPI.deletePin(showDeleteConfirm);
        
//         setPins(pins.filter(pin => pin._id !== showDeleteConfirm));
//         setShowDeleteConfirm(null);
//         setDeleteConfirmText('');
//         setSelectedPin(null);
//       } catch (error) {
//         console.error('Error deleting pin from MongoDB:', error);
//         alert(`Failed to delete discovery: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const cancelDelete = () => {
//     setShowDeleteConfirm(null);
//     setDeleteConfirmText('');
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setNewPin({ ...newPin, image: e.target.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const likePin = async (pinId) => {
//     try {
//       const updatedPin = await mongoAPI.likePin(pinId);
//       setPins(pins.map(pin => 
//         pin._id === pinId ? updatedPin : pin
//       ));
//       if (selectedPin && selectedPin._id === pinId) {
//         setSelectedPin(updatedPin);
//       }
//     } catch (error) {
//       console.error('Error liking pin in MongoDB:', error);
//       // Fallback to local update for better UX
//       setPins(pins.map(pin => 
//         pin._id === pinId ? { ...pin, likes: pin.likes + 1 } : pin
//       ));
//     }
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       food: '🍽️',
//       music: '🎵',
//       view: '🌅',
//       shopping: '🛍️',
//       culture: '🎭',
//       nature: '🌳',
//       general: '📍'
//     };
//     return icons[category] || '📍';
//   };

//   const getCategoryLabel = (category) => {
//     const labels = {
//       food: 'Food & Drink',
//       music: 'Music & Entertainment',
//       view: 'Views & Scenery',
//       shopping: 'Shopping',
//       culture: 'Culture & Arts',
//       nature: 'Nature & Parks',
//       general: 'General'
//     };
//     return labels[category] || 'General';
//   };

//   const getAllCategories = () => {
//     return [
//       { key: 'food', icon: '🍽️', label: 'Food & Drink', color: 'bg-orange-500' },
//       { key: 'music', icon: '🎵', label: 'Music & Entertainment', color: 'bg-purple-500' },
//       { key: 'view', icon: '🌅', label: 'Views & Scenery', color: 'bg-blue-500' },
//       { key: 'shopping', icon: '🛍️', label: 'Shopping', color: 'bg-pink-500' },
//       { key: 'culture', icon: '🎭', label: 'Culture & Arts', color: 'bg-yellow-500' },
//       { key: 'nature', icon: '🌳', label: 'Nature & Parks', color: 'bg-green-500' },
//       { key: 'general', icon: '📍', label: 'General', color: 'bg-gray-500' }
//     ];
//   };

//   const toggleCategory = (category) => {
//     const newActiveCategories = new Set(activeCategories);
//     if (newActiveCategories.has(category)) {
//       newActiveCategories.delete(category);
//     } else {
//       newActiveCategories.add(category);
//     }
//     setActiveCategories(newActiveCategories);
//   };

//   const selectAllCategories = () => {
//     setActiveCategories(new Set(['food', 'music', 'view', 'shopping', 'culture', 'nature', 'general']));
//   };

//   const clearAllCategories = () => {
//     setActiveCategories(new Set());
//   };

//   const filteredPins = pins.filter(pin => activeCategories.has(pin.category));

//   const getCategoryCounts = () => {
//     const counts = {};
//     getAllCategories().forEach(cat => {
//       counts[cat.key] = pins.filter(pin => pin.category === cat.key).length;
//     });
//     return counts;
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       food: 'bg-orange-500',
//       music: 'bg-purple-500',
//       view: 'bg-blue-500',
//       shopping: 'bg-pink-500',
//       culture: 'bg-yellow-500',
//       nature: 'bg-green-500',
//       general: 'bg-gray-500'
//     };
//     return colors[category] || 'bg-gray-500';
//   };

//   if (loading && pins.length === 0) {
//     return (
//       <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
//         <div className="flex items-center justify-center h-96">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading discoveries...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
//         <h2 className="text-3xl font-bold mb-2">Digital Guestbook</h2>
//         <p className="text-blue-100">Share your favorite discoveries in {cityName}</p>
//         {loading && (
//           <div className="flex items-center gap-2 mt-2">
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//             <span className="text-sm">Syncing...</span>
//           </div>
//         )}
//       </div>

//       {/* Category Filter Slider */}
//       <div className="bg-white border-b p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Filter by Category</h3>
//           <div className="flex gap-2">
//             <button
//               onClick={selectAllCategories}
//               className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
//             >
//               All
//             </button>
//             <button
//               onClick={clearAllCategories}
//               className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
//             >
//               None
//             </button>
//           </div>
//         </div>
        
//         {/* Category Pills */}
//         <div className="flex flex-wrap gap-2 mb-2">
//           {getAllCategories().map((category) => {
//             const isActive = activeCategories.has(category.key);
//             const count = getCategoryCounts()[category.key];
            
//             return (
//               <button
//                 key={category.key}
//                 onClick={() => toggleCategory(category.key)}
//                 className={`
//                   flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 transform hover:scale-105
//                   ${isActive 
//                     ? `${category.color} text-white border-transparent shadow-lg` 
//                     : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
//                   }
//                 `}
//               >
//                 <span className="text-lg">{category.icon}</span>
//                 <span className="font-medium text-sm">{category.label}</span>
//                 <span className={`
//                   text-xs px-2 py-0.5 rounded-full font-bold
//                   ${isActive 
//                     ? 'bg-white/20 text-white' 
//                     : 'bg-gray-200 text-gray-600'
//                   }
//                 `}>
//                   {count}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
        
//         {/* Active Filter Summary */}
//         <div className="flex items-center justify-between text-sm text-gray-600">
//           <span>
//             Showing {filteredPins.length} of {pins.length} discoveries in {cityName}
//             {activeCategories.size === 0 && " (select categories to view discoveries)"}
//           </span>
//           {activeCategories.size > 0 && activeCategories.size < 7 && (
//             <span className="flex items-center gap-1">
//               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//               Filtered view active
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Map Container */}
//       <div className="relative h-96 bg-gray-100">
//         <div 
//           ref={mapRef}
//           className="w-full h-full z-0"
//           style={{ minHeight: '400px' }}
//         />
        
//         {/* Instructions overlay */}
//         <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
//           <p className="text-sm text-gray-700 flex items-center gap-2">
//             <MapPin size={16} className="text-blue-500" />
//             Click anywhere on the map to add your discovery!
//           </p>
//           {activeCategories.size === 0 && (
//             <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
//               ⚠️ Select categories above to see discoveries
//             </p>
//           )}
//         </div>

//         {/* Loading/Error state */}
//         {!L ? (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
//               <p className="text-gray-600">Loading map...</p>
//             </div>
//           </div>
//         ) : !map ? (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
//               <p className="text-gray-600">Initializing map...</p>
//             </div>
//           </div>
//         ) : null}
//       </div>

//       {/* Add Pin Form */}
//       {showAddForm && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold">Share Your Discovery</h3>
//               <button
//                 onClick={() => {
//                   setShowAddForm(false);
//                   setClickPosition(null);
//                 }}
//                 className="p-1 hover:bg-gray-100 rounded"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Place Name *</label>
//                 <input
//                   type="text"
//                   placeholder="e.g., Hidden Garden Cafe"
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={newPin.title}
//                   onChange={(e) => setNewPin({ ...newPin, title: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Your Discovery *</label>
//                 <textarea
//                   placeholder="Tell others why this place is special..."
//                   rows={3}
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={newPin.note}
//                   onChange={(e) => setNewPin({ ...newPin, note: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Your Name *</label>
//                 <input
//                   type="text"
//                   placeholder="e.g., Alex T."
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={newPin.author}
//                   onChange={(e) => setNewPin({ ...newPin, author: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Category</label>
//                 <select
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={newPin.category}
//                   onChange={(e) => setNewPin({ ...newPin, category: e.target.value })}
//                 >
//                   <option value="general">General</option>
//                   <option value="food">Food & Drink</option>
//                   <option value="music">Music & Entertainment</option>
//                   <option value="view">Views & Scenery</option>
//                   <option value="shopping">Shopping</option>
//                   <option value="culture">Culture & Arts</option>
//                   <option value="nature">Nature & Parks</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Add Photo (Optional)</label>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 flex items-center justify-center gap-2 text-gray-600"
//                 >
//                   <Camera size={20} />
//                   {newPin.image ? 'Photo Added ✓' : 'Upload Photo'}
//                 </button>
//               </div>
//               {clickPosition && (
//                 <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
//                   📍 Location: {clickPosition.lat.toFixed(4)}, {clickPosition.lng.toFixed(4)}
//                 </div>
//               )}
//               <button
//                 onClick={handleAddPin}
//                 disabled={!newPin.title || !newPin.note || !newPin.author || loading}
//                 className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Send size={18} />
//                     Share Discovery
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Pin Form */}
//       {editingPin && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001] p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold">Edit Discovery</h3>
//               <button
//                 onClick={() => setEditingPin(null)}
//                 className="p-1 hover:bg-gray-100 rounded"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Place Name *</label>
//                 <input
//                   type="text"
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={editForm.title}
//                   onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Your Discovery *</label>
//                 <textarea
//                   rows={3}
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={editForm.note}
//                   onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Category</label>
//                 <select
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={editForm.category}
//                   onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
//                 >
//                   <option value="general">General</option>
//                   <option value="food">Food & Drink</option>
//                   <option value="music">Music & Entertainment</option>
//                   <option value="view">Views & Scenery</option>
//                   <option value="shopping">Shopping</option>
//                   <option value="culture">Culture & Arts</option>
//                   <option value="nature">Nature & Parks</option>
//                 </select>
//               </div>
//               <div className="bg-yellow-50 p-3 rounded-lg text-sm">
//                 <div className="flex items-center gap-2 text-yellow-800 mb-1">
//                   <Clock size={16} />
//                   <span className="font-medium">Edit Window</span>
//                 </div>
//                 <p className="text-yellow-700">
//                   You can edit this discovery for {15 - Math.floor((new Date() - new Date(editingPin.createdAt)) / (1000 * 60))} more minutes after creation.
//                 </p>
//               </div>
//               <button
//                 onClick={handleUpdatePin}
//                 disabled={!editForm.title || !editForm.note || loading}
//                 className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Updating...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={18} />
//                     Save Changes
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Pin Details Modal */}
//       {selectedPin && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-start mb-4">
//               <div className="flex items-center gap-3 flex-1">
//                 <div className={`w-10 h-10 ${getCategoryColor(selectedPin.category)} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
//                   <span>{getCategoryIcon(selectedPin.category)}</span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="text-xl font-bold truncate">{selectedPin.title}</h3>
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <User size={14} />
//                     <span className="truncate">{selectedPin.author}</span>
//                     <Clock size={14} />
//                     <span className="whitespace-nowrap">
//                       {selectedPin.createdAt ? getTimeAgo(selectedPin.createdAt) : selectedPin.timestamp}
//                     </span>
//                   </div>
//                   {selectedPin.updatedAt && selectedPin.updatedAt !== selectedPin.createdAt && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       Edited {getTimeAgo(selectedPin.updatedAt)}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div className="flex gap-1 ml-2 flex-shrink-0">
//                 {!selectedPin.isDefault && canEditPin(selectedPin) && (
//                   <button
//                     onClick={() => handleEditPin(selectedPin)}
//                     className="p-2 hover:bg-blue-100 rounded text-blue-600"
//                     title="Edit this discovery"
//                   >
//                     <Edit3 size={16} />
//                   </button>
//                 )}
//                 {!selectedPin.isDefault && (
//                   <button
//                     onClick={() => handleDeletePin(selectedPin._id)}
//                     className="p-2 hover:bg-red-100 rounded text-red-600"
//                     title="Delete this discovery"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setSelectedPin(null)}
//                   className="p-2 hover:bg-gray-100 rounded"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>
//             {selectedPin.image && (
//               <img
//                 src={selectedPin.image}
//                 alt={selectedPin.title}
//                 className="w-full h-48 object-cover rounded-lg mb-4"
//               />
//             )}
//             <p className="text-gray-700 mb-4 leading-relaxed">{selectedPin.note}</p>
//             <div className="flex items-center justify-between pt-4 border-t">
//               <button
//                 onClick={() => likePin(selectedPin._id)}
//                 className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
//               >
//                 <Heart size={18} className={selectedPin.likes > 0 ? 'fill-current' : ''} />
//                 {selectedPin.likes}
//               </button>
//               <div className="text-sm text-gray-500">
//                 📍 {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)}
//               </div>
//             </div>
//             {!selectedPin.isDefault && (
//               <div className="mt-4 text-xs text-blue-600 bg-blue-50 p-2 rounded">
//                 💡 This is your discovery
//                 {canEditPin(selectedPin) && " - you can edit it for the next few minutes"}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10002] p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
//                 <AlertTriangle size={24} className="text-red-600" />
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-gray-900">Delete Discovery</h3>
//                 <p className="text-sm text-gray-600">This action cannot be undone</p>
//               </div>
//             </div>
            
//             <div className="mb-6">
//               <p className="text-gray-700 mb-4">
//                 Are you sure you want to delete this discovery? This will permanently remove it from the map and database.
//               </p>
              
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Type <span className="font-bold text-red-600">delete</span> to confirm:
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Type 'delete' here"
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                   value={deleteConfirmText}
//                   onChange={(e) => setDeleteConfirmText(e.target.value)}
//                 />
//               </div>
//             </div>
            
//             <div className="flex gap-3">
//               <button
//                 onClick={cancelDelete}
//                 disabled={loading}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDeletePin}
//                 disabled={deleteConfirmText.toLowerCase() !== 'delete' || loading}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Deleting...
//                   </>
//                 ) : (
//                   'Delete Forever'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Recent Discoveries Sidebar - Now Horizontally Scrollable */}
//       <div className="p-6 border-t bg-gray-50">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold">Recent Discoveries in {cityName}</h3>
//           <span className="text-sm text-gray-500">
//             {activeCategories.size === 7 ? 'All categories' : `${activeCategories.size} categories selected`}
//           </span>
//         </div>
        
//         {filteredPins.length > 0 ? (
//           <div 
//             ref={scrollRef}
//             className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
//             style={{ scrollbarWidth: 'thin' }}
//           >
//             {filteredPins.map((pin) => (
//               <div
//                 key={pin._id || pin.id}
//                 className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 relative group flex-shrink-0 w-80"
//                 style={{ borderLeftColor: getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' : 
//                                           getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'purple' ? '#a855f7' :
//                                           getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
//                                           getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'pink' ? '#ec4899' :
//                                           getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' :
//                                           getCategoryColor(pin.category).replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' : '#6b7280' }}
//                 onClick={() => setSelectedPin(pin)}
//               >
//                 <div className="flex items-center gap-2 mb-2 pr-12">
//                   <span className="text-lg">{getCategoryIcon(pin.category)}</span>
//                   <h4 className="font-semibold truncate flex-1">{pin.title}</h4>
//                   {!pin.isDefault && (
//                     <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
//                       Your Pin
//                     </span>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">{pin.note}</p>                <div className="flex items-center justify-between text-xs text-gray-500">
//                   <div className="flex items-center gap-2">
//                     <span>by {pin.author}</span>
//                     {pin.updatedAt && pin.updatedAt !== pin.createdAt && (
//                       <span className="text-blue-600">• edited</span>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="whitespace-nowrap">
//                       {pin.createdAt ? getTimeAgo(pin.createdAt) : pin.timestamp}
//                     </span>
//                     <div className="flex items-center gap-1">
//                       <Heart size={12} />
//                       {pin.likes}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <div className="text-4xl mb-2">🔍</div>
//             <p className="text-gray-600 mb-2">No discoveries match your selected categories in {cityName}</p>
//             <button 
//               onClick={selectAllCategories}
//               className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//             >
//               Show all categories
//             </button>
//           </div>
//         )}
        
//         {/* Storage Info */}
//         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//           <div className="flex items-center gap-2 mb-2">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//             <span className="text-sm font-medium text-blue-900">MongoDB Integration Active</span>
//           </div>
//           <p className="text-xs text-blue-700">
//             Your discoveries are saved to MongoDB and synchronized in real-time. 
//             You can edit pins within 15 minutes of creation.
//           </p>
//           {filteredPins.filter(p => !p.isDefault).length > 0 && (
//             <p className="text-xs text-blue-600 mt-1">
//               You have {filteredPins.filter(p => !p.isDefault).length} personal discovery/discoveries in {cityName}
//             </p>
//           )}
//         </div>
//       </div>

//       <style jsx>{`
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//         .line-clamp-3 {
//           display: -webkit-box;
//           -webkit-line-clamp: 3;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//         .scrollbar-thin {
//           scrollbar-width: thin;
//         }
//         .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
//           background-color: #d1d5db;
//           border-radius: 6px;
//         }
//         .scrollbar-track-gray-100::-webkit-scrollbar-track {
//           background-color: #f3f4f6;
//         }
//         .scrollbar-thin::-webkit-scrollbar {
//           height: 6px;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default DigitalGuestbookMap;