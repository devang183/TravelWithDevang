'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  MapPin,
  Building2,
  Trees,
  UtensilsCrossed,
  Landmark,
  ShoppingBag,
  Calendar,
  ChevronRight,
  X,
  Eye,
  Route,
  Download
} from 'lucide-react';
import { cities } from './citycoord';

const TRIP_PREFERENCES = {
  popular: {
    label: 'Popular',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    description: 'Must-see attractions and famous spots',
    keywords: ['popular', 'famous', 'attraction', 'tourist', 'landmark', 'iconic']
  },
  museum: {
    label: 'Museum',
    icon: Building2,
    color: 'from-purple-500 to-indigo-500',
    description: 'Art galleries, museums, and cultural sites',
    keywords: ['museum', 'gallery', 'art', 'culture', 'exhibition', 'historic']
  },
  nature: {
    label: 'Nature',
    icon: Trees,
    color: 'from-green-500 to-emerald-500',
    description: 'Parks, gardens, and outdoor experiences',
    keywords: ['park', 'garden', 'nature', 'outdoor', 'green', 'scenic', 'viewpoint']
  },
  foodie: {
    label: 'Foodie',
    icon: UtensilsCrossed,
    color: 'from-red-500 to-pink-500',
    description: 'Best restaurants, cafes, and food experiences',
    keywords: ['restaurant', 'cafe', 'food', 'pint', 'pub', 'bar', 'dining', 'eat']
  },
  history: {
    label: 'History',
    icon: Landmark,
    color: 'from-amber-600 to-yellow-600',
    description: 'Historical landmarks and heritage sites',
    keywords: ['historic', 'heritage', 'monument', 'castle', 'church', 'college', 'ancient']
  },
  shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    color: 'from-blue-500 to-cyan-500',
    description: 'Shopping districts and retail experiences',
    keywords: ['shopping', 'retail', 'market', 'store', 'mall', 'boutique']
  }
};

const DURATION_OPTIONS = [
  { days: 1, label: '1 Day', description: 'Quick highlights tour' },
  { days: 2, label: '2 Days', description: 'Weekend getaway' },
  { days: 3, label: '3 Days', description: 'Extended exploration' },
  { days: 5, label: '5 Days', description: 'In-depth experience' },
  { days: 7, label: '1 Week', description: 'Complete immersion' }
];

export default function TripPreferencesWizard({ cityId, cityName, markers: propMarkers = [], onGenerateTrip, externalIsOpen, onExternalClose, hideButton = false }) {
  const [isOpen, setIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const wizardIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setWizardOpen = (value) => {
    if (externalIsOpen !== undefined && onExternalClose) {
      if (!value) onExternalClose();
    } else {
      setIsOpen(value);
    }
  };
  const [step, setStep] = useState(1); // 1: Preferences, 2: Duration, 3: Generated
  const [selectedPreferences, setSelectedPreferences] = useState([]); // Changed to array for multiple selection
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'itinerary'

  // Fetch markers from API
  const { data: apiMarkers = [], isLoading: markersLoading } = useQuery({
    queryKey: ['pins', cityId],
    queryFn: async () => {
      const response = await fetch(`/api/pins/${cityId}`);
      if (!response.ok) throw new Error('Failed to fetch markers');
      return response.json();
    },
    enabled: wizardIsOpen && cityId !== undefined,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Use API markers if available, otherwise use prop markers
  const markers = apiMarkers.length > 0 ? apiMarkers : propMarkers;

  const handlePreferenceSelect = (preferenceKey) => {
    // Toggle preference in array (allow multiple selections)
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceKey)) {
        return prev.filter(key => key !== preferenceKey);
      } else {
        return [...prev, preferenceKey];
      }
    });
  };

  const handleDurationSelect = (days) => {
    setSelectedDuration(days);
  };

  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateTrip = () => {
    if (selectedPreferences.length === 0 || !selectedDuration) return;

    // Helper: Get city center from city coordinates database
    const getCityCenter = () => {
      // Try to get city center from cities database first
      if (cityId && cities[cityId] && cities[cityId].coords) {
        return cities[cityId].coords;
      }

      // Fallback: calculate average of all marker coordinates
      const placesWithCoords = markers.filter(m => m.coords);
      if (placesWithCoords.length === 0) return null;

      const avgLat = placesWithCoords.reduce((sum, p) => sum + p.coords[0], 0) / placesWithCoords.length;
      const avgLon = placesWithCoords.reduce((sum, p) => sum + p.coords[1], 0) / placesWithCoords.length;

      return [avgLat, avgLon];
    };

    // Get city center first (needed for filtering breakfast cafes)
    const cityCenter = getCityCenter();

    // Separate food/drink places from other attractions
    const foodKeywords = ['restaurant', 'cafe', 'food', 'pint', 'pub', 'bar', 'dining', 'eat', 'breakfast', 'lunch', 'dinner', 'coffee', 'tea'];

    const foodPlaces = markers.filter(marker => {
      const markerText = `${marker.name} ${marker.description || ''} ${marker.categories || marker.category || ''}`.toLowerCase();
      return foodKeywords.some(keyword => markerText.includes(keyword));
    });

    // Separate cafes - filter for those within 1km of city center for breakfast variety
    const allCafes = foodPlaces.filter(place => {
      const placeText = `${place.name} ${place.description || ''} ${place.categories || place.category || ''}`.toLowerCase();
      return placeText.includes('cafe') || placeText.includes('coffee') || placeText.includes('tea');
    });

    // Filter cafes within 1km of city center for breakfast options
    const breakfastCafes = cityCenter
      ? allCafes.filter(cafe => {
          if (!cafe.coords) return true; // Include cafes without coords as fallback
          const distance = calculateDistance(cityCenter, cafe.coords);
          return distance <= 1; // Within 1km
        })
      : allCafes;

    // Shuffle cafes - prioritize breakfast cafes within 1km, then all cafes
    const cafes = shuffleArray([...breakfastCafes, ...allCafes.filter(c => !breakfastCafes.includes(c))]);

    const restaurants = shuffleArray(foodPlaces.filter(place => {
      const placeText = `${place.name} ${place.description || ''} ${place.categories || place.category || ''}`.toLowerCase();
      return placeText.includes('restaurant') || placeText.includes('dining');
    }));

    // Collect all keywords from selected preferences
    const allKeywords = selectedPreferences.flatMap(prefKey => {
      if (prefKey === 'popular') {
        return ['art', 'bookstore', 'church', 'historic', 'museum', 'park', 'pint', 'viewpoint'];
      }
      return TRIP_PREFERENCES[prefKey].keywords;
    });

    const attractionPlaces = markers.filter(marker => {
      const markerText = `${marker.name} ${marker.description || ''} ${marker.categories || marker.category || ''}`.toLowerCase();
      const isFood = foodKeywords.some(keyword => markerText.includes(keyword));

      // Match against any keyword from selected preferences
      const matchesAnyPreference = allKeywords.some(keyword => markerText.includes(keyword));
      return !isFood && matchesAnyPreference;
    });

    // Score and sort attractions by relevance (shuffle before scoring for variety)
    const shuffledAttractions = shuffleArray(attractionPlaces);
    const scoredAttractions = shuffledAttractions.map(place => {
      const placeText = `${place.name} ${place.description || ''} ${place.categories || place.category || ''}`.toLowerCase();
      const score = allKeywords.reduce((acc, keyword) => {
        return acc + (placeText.includes(keyword) ? 1 : 0);
      }, 0);
      return { ...place, score };
    }).sort((a, b) => b.score - a.score);

    // Helper: Find nearest place to given coordinates
    const findNearestPlace = (coords, availablePlaces, maxDistanceKm = 10) => {
      if (availablePlaces.length === 0) return null;
      if (!coords) return availablePlaces[0]; // Fallback to first available if no coords

      let nearest = null;
      let minDistance = Infinity;

      // First try to find within max distance
      availablePlaces.forEach(place => {
        if (place.coords) {
          const distance = calculateDistance(coords, place.coords);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = place;
          }
        }
      });

      // If found within distance or no coords available, return it
      if (nearest && (minDistance <= maxDistanceKm || !nearest.coords)) {
        return nearest;
      }

      // Fallback: return nearest even if beyond max distance, or first place with no coords
      return nearest || availablePlaces.find(p => !p.coords) || availablePlaces[0];
    };

    // Generate day-wise itinerary with meal structure
    const itinerary = [];
    let usedAttractions = new Set();
    let usedFoodPlaces = new Set();

    // Check if foodie preference is selected
    const isFoodieTrip = selectedPreferences.includes('foodie');

    for (let day = 1; day <= selectedDuration; day++) {
      const daySchedule = [];
      let currentLocation = cityCenter;

      // BREAKFAST (8-9 AM) - Pick from shuffled breakfast cafes (within 1km of city center)
      // Use first available from shuffled list instead of nearest for variety
      const availableBreakfastCafes = cafes.filter(p => !usedFoodPlaces.has(p.name));
      const breakfastPlace = availableBreakfastCafes.length > 0 ? availableBreakfastCafes[0] : null;
      if (breakfastPlace) {
        daySchedule.push({ ...breakfastPlace, mealType: 'Breakfast', time: '8:00 AM' });
        usedFoodPlaces.add(breakfastPlace.name);
        currentLocation = breakfastPlace.coords || currentLocation;
      }

      // MORNING ACTIVITIES (9 AM - 12 PM) - 2 attractions (or 1 if foodie)
      const morningSlots = isFoodieTrip ? 1 : 2;
      for (let i = 0; i < morningSlots; i++) {
        const availableAttractions = scoredAttractions.filter(p => !usedAttractions.has(p.name));
        const nextAttraction = findNearestPlace(currentLocation, availableAttractions);

        if (nextAttraction) {
          daySchedule.push({ ...nextAttraction, time: i === 0 ? '9:30 AM' : '11:00 AM' });
          usedAttractions.add(nextAttraction.name);
          currentLocation = nextAttraction.coords || currentLocation;
        }
      }

      // MID-MORNING SNACK (10:30 AM) - Only for foodie trips
      if (isFoodieTrip) {
        const snackPlace = findNearestPlace(currentLocation, [...cafes, ...restaurants].filter(p => !usedFoodPlaces.has(p.name)));
        if (snackPlace) {
          daySchedule.push({ ...snackPlace, mealType: 'Mid-Morning Snack', time: '10:30 AM' });
          usedFoodPlaces.add(snackPlace.name);
          currentLocation = snackPlace.coords || currentLocation;
        }
      }

      // LUNCH (12:30 - 1:30 PM) - Near last visited place (restaurants only)
      const lunchPlace = findNearestPlace(currentLocation, restaurants.filter(p => !usedFoodPlaces.has(p.name)));
      if (lunchPlace) {
        daySchedule.push({ ...lunchPlace, mealType: 'Lunch', time: '12:30 PM' });
        usedFoodPlaces.add(lunchPlace.name);
        currentLocation = lunchPlace.coords || currentLocation;
      }

      // AFTERNOON ACTIVITIES (2 PM - 5 PM) - 2 attractions (or 1 if foodie)
      const afternoonSlots = isFoodieTrip ? 1 : 2;
      for (let i = 0; i < afternoonSlots; i++) {
        const availableAttractions = scoredAttractions.filter(p => !usedAttractions.has(p.name));
        const nextAttraction = findNearestPlace(currentLocation, availableAttractions);

        if (nextAttraction) {
          daySchedule.push({ ...nextAttraction, time: i === 0 ? '2:00 PM' : '3:30 PM' });
          usedAttractions.add(nextAttraction.name);
          currentLocation = nextAttraction.coords || currentLocation;
        }
      }

      // AFTERNOON SNACK (4:00 PM) - Only for foodie trips
      if (isFoodieTrip) {
        const afternoonSnack = findNearestPlace(currentLocation, cafes.filter(p => !usedFoodPlaces.has(p.name)));
        if (afternoonSnack) {
          daySchedule.push({ ...afternoonSnack, mealType: 'Afternoon Snack', time: '4:00 PM' });
          usedFoodPlaces.add(afternoonSnack.name);
          currentLocation = afternoonSnack.coords || currentLocation;
        }
      }

      // EVENING BEVERAGE (5:30 PM) - Near last visited place (cafes only)
      const beveragePlace = findNearestPlace(currentLocation, cafes.filter(p => !usedFoodPlaces.has(p.name)));
      if (beveragePlace) {
        daySchedule.push({ ...beveragePlace, mealType: 'Evening Beverage', time: '5:30 PM' });
        usedFoodPlaces.add(beveragePlace.name);
        currentLocation = beveragePlace.coords || currentLocation;
      }

      // EVENING ACTIVITY (6:30 PM) - 1 final attraction
      const availableAttractions = scoredAttractions.filter(p => !usedAttractions.has(p.name));
      const eveningAttraction = findNearestPlace(currentLocation, availableAttractions);
      if (eveningAttraction) {
        daySchedule.push({ ...eveningAttraction, time: '6:30 PM' });
        usedAttractions.add(eveningAttraction.name);
        currentLocation = eveningAttraction.coords || currentLocation;
      }

      // PRE-DINNER APPETIZER (7:30 PM) - Only for foodie trips
      if (isFoodieTrip) {
        const predinnerPlace = findNearestPlace(currentLocation, [...restaurants, ...cafes].filter(p => !usedFoodPlaces.has(p.name)));
        if (predinnerPlace) {
          daySchedule.push({ ...predinnerPlace, mealType: 'Pre-Dinner Appetizer', time: '7:30 PM' });
          usedFoodPlaces.add(predinnerPlace.name);
          currentLocation = predinnerPlace.coords || currentLocation;
        }
      }

      // DINNER (8:00 PM) - Near last visited place (restaurants only)
      const dinnerPlace = findNearestPlace(currentLocation, restaurants.filter(p => !usedFoodPlaces.has(p.name)));
      if (dinnerPlace) {
        daySchedule.push({ ...dinnerPlace, mealType: 'Dinner', time: isFoodieTrip ? '8:30 PM' : '8:00 PM' });
        usedFoodPlaces.add(dinnerPlace.name);
        currentLocation = dinnerPlace.coords || currentLocation;
      }

      // DESSERT (9:30 PM) - Only for foodie trips
      if (isFoodieTrip) {
        const dessertPlace = findNearestPlace(currentLocation, cafes.filter(p => !usedFoodPlaces.has(p.name)));
        if (dessertPlace) {
          daySchedule.push({ ...dessertPlace, mealType: 'Dessert', time: '9:30 PM' });
          usedFoodPlaces.add(dessertPlace.name);
        }
      }

      if (daySchedule.length > 0) {
        itinerary.push({
          day,
          places: daySchedule,
          theme: day === 1 ? 'Introduction' : day === selectedDuration ? 'Finale' : 'Exploration'
        });
      }
    }

    const totalPlaces = itinerary.reduce((sum, day) => sum + day.places.length, 0);

    const trip = {
      id: Date.now(),
      cityId,
      cityName,
      preferences: selectedPreferences, // Changed to array
      duration: selectedDuration,
      itinerary,
      totalPlaces,
      createdAt: new Date().toISOString()
    };

    setGeneratedTrip(trip);
    setStep(3);
    setActiveTab('overview');

    // Notify parent component
    if (onGenerateTrip) {
      onGenerateTrip(trip);
    }
  };

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) return 0;

    const R = 6371; // Earth's radius in kilometers
    const lat1 = coords1[0] * Math.PI / 180;
    const lat2 = coords2[0] * Math.PI / 180;
    const deltaLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const deltaLon = (coords2[1] - coords1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Returns distance in kilometers
  };

  // Helper function to format distance
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(2)}km`;
  };

  // Helper function to clean HTML and decode entities from description
  const cleanDescription = (description) => {
    if (!description) return '';

    try {
      let cleanText = String(description);

      // First, convert <br> tags to newlines before processing
      cleanText = cleanText.replace(/<br\s*\/?>/gi, '\n');

      // Strip HTML tags
      cleanText = cleanText.replace(/<[^>]*>/g, '');

      // Decode HTML entities
      const textarea = document.createElement('textarea');
      textarea.innerHTML = cleanText;
      cleanText = textarea.value;

      // Replace multiple newlines with single newline
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n');

      // Trim whitespace
      cleanText = cleanText.trim();

      return cleanText;
    } catch (error) {
      console.warn('Error cleaning description:', error);
      return String(description).replace(/<[^>]*>/g, '').trim();
    }
  };

  // Export trip itinerary as PDF
  const exportTripToPDF = async () => {
    if (!generatedTrip) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      let yPos = margin;

      // Title
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      const preferencesLabel = generatedTrip.preferences.map(p => TRIP_PREFERENCES[p].label).join(' & ');
      doc.text(`${generatedTrip.duration}-Day ${preferencesLabel} Trip`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.setFontSize(18);
      doc.text(cityName, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Date and metadata
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date(generatedTrip.createdAt).toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text(`Total Places: ${generatedTrip.totalPlaces}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Iterate through each day's itinerary
      generatedTrip.itinerary.forEach((dayItem) => {
        // Check if we need a new page for the day header
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }

        // Day header
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(147, 51, 234); // Purple color
        doc.text(`Day ${dayItem.day}: ${dayItem.theme}`, margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;

        // Places for this day
        doc.setFontSize(11);
        dayItem.places.forEach((place, placeIndex) => {
          // Check if we need a new page
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
          }

          // Place number and name
          doc.setFont(undefined, 'bold');
          doc.text(`${placeIndex + 1}. ${place.name}`, margin + 5, yPos);
          yPos += 7;

          // Categories/metadata
          if (place.categories || place.category) {
            const categories = Array.isArray(place.categories)
              ? place.categories.join(', ')
              : (place.category || '');
            if (categories) {
              doc.setFont(undefined, 'italic');
              doc.setFontSize(9);
              doc.setTextColor(128, 128, 128);
              doc.text(`Categories: ${categories}`, margin + 10, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;
            }
          }

          // Description
          if (place.description) {
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            const cleanedDesc = cleanDescription(place.description);
            if (cleanedDesc) {
              const splitDesc = doc.splitTextToSize(cleanedDesc, pageWidth - margin * 2 - 10);
              doc.text(splitDesc, margin + 10, yPos);
              yPos += splitDesc.length * 5 + 5;
            } else {
              yPos += 5;
            }
          } else {
            yPos += 5;
          }

          // Distance to next place (if not last place of the day)
          if (placeIndex < dayItem.places.length - 1) {
            const nextPlace = dayItem.places[placeIndex + 1];
            if (place.coords && nextPlace.coords) {
              const distance = calculateDistance(place.coords, nextPlace.coords);
              doc.setFont(undefined, 'italic');
              doc.setFontSize(9);
              doc.setTextColor(100, 100, 100);
              doc.text(`    ↓ ${formatDistance(distance)} to next stop`, margin + 5, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;
            }
          }

          yPos += 3; // Extra spacing between places
        });

        yPos += 10; // Extra spacing between days
      });

      // Footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'Generated by TravelWithDevang',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Save PDF
      const preferencesFilename = generatedTrip.preferences.map(p => TRIP_PREFERENCES[p].label).join('_');
      const filename = `${cityName}_${generatedTrip.duration}day_${preferencesFilename}_trip.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedPreferences.length > 0) {
      setStep(2);
    } else if (step === 2 && selectedDuration) {
      generateTrip();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedPreferences([]);
    setSelectedDuration(null);
    setGeneratedTrip(null);
    setActiveTab('overview');
  };

  return (
    <>
      {/* Trigger Button - Only show if not hidden */}
      {!hideButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWizardOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold hidden sm:inline">Plan Your Trip</span>
          <span className="font-semibold sm:hidden">Plan</span>
        </motion.button>
      )}

      {/* Wizard Modal */}
      <AnimatePresence>
        {wizardIsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setWizardOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Plan Your Perfect Trip</h2>
                      <p className="text-purple-100 text-sm">{cityName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWizardOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center w-full mt-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                        s <= step ? 'bg-white text-purple-600' : 'bg-purple-400 text-purple-200'
                      }`}>
                        {s}
                      </div>
                      {s < 3 && (
                        <div className={`flex-1 h-1 mx-3 rounded ${
                          s < step ? 'bg-white' : 'bg-purple-400'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Step 1: Select Preference */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">What&apos;s your trip about?</h3>
                    <p className="text-gray-600 mb-4">Choose one or more themes for your perfect itinerary</p>

                    {markersLoading && (
                      <div className="flex items-center gap-2 mb-4 text-purple-600">
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading places...</span>
                      </div>
                    )}

                    {markers.length === 0 && !markersLoading && (
                      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                        No places found for this city. The trip planner may have limited options.
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(TRIP_PREFERENCES).map(([key, pref]) => {
                        const Icon = pref.icon;
                        const isSelected = selectedPreferences.includes(key);

                        return (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePreferenceSelect(key)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${pref.color} flex items-center justify-center mb-3`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{pref.label}</h4>
                            <p className="text-sm text-gray-600">{pref.description}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Duration */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">How many days?</h3>
                    <p className="text-gray-600 mb-6">Choose your trip duration</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {DURATION_OPTIONS.map(({ days, label, description }) => {
                        const isSelected = selectedDuration === days;

                        return (
                          <motion.button
                            key={days}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDurationSelect(days)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <Calendar className={`w-8 h-8 mx-auto mb-2 ${
                              isSelected ? 'text-purple-600' : 'text-gray-400'
                            }`} />
                            <h4 className="font-bold text-gray-800 mb-1">{label}</h4>
                            <p className="text-xs text-gray-600">{description}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Generated Trip */}
                {step === 3 && generatedTrip && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {/* Tab Navigation */}
                    <div className="flex justify-center gap-2 mb-6 border-b">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 font-semibold transition-all ${
                          activeTab === 'overview'
                            ? 'text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Overview
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('itinerary')}
                        className={`px-6 py-2 font-semibold transition-all ${
                          activeTab === 'itinerary'
                            ? 'text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Route className="w-4 h-4" />
                          Itinerary
                        </div>
                      </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                          <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Your {generatedTrip.preferences.map(p => TRIP_PREFERENCES[p].label).join(' & ')} Adventure
                          </h3>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-sm text-gray-600">Duration</p>
                              <p className="text-2xl font-bold text-purple-600">{generatedTrip.duration} Days</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-sm text-gray-600">Total Places</p>
                              <p className="text-2xl font-bold text-purple-600">{generatedTrip.totalPlaces}</p>
                            </div>
                          </div>

                          <p className="text-gray-700">
                            {generatedTrip.preferences.map(p => TRIP_PREFERENCES[p].description).join(' • ')}
                          </p>
                        </div>

                        {/* Day Summary */}
                        <div>
                          <h4 className="font-bold text-gray-800 mb-4">Trip Highlights</h4>
                          <div className="space-y-3">
                            {generatedTrip.itinerary.map((dayInfo) => (
                              <div key={dayInfo.day} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-bold text-gray-800">Day {dayInfo.day}</h5>
                                  <span className="text-sm text-purple-600 font-semibold">{dayInfo.theme}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {dayInfo.places.length} places • {dayInfo.places.map(p => p.name).join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Itinerary Tab */}
                    {activeTab === 'itinerary' && (
                      <div className="space-y-8">
                        {generatedTrip.itinerary.map((dayInfo) => (
                          <div key={dayInfo.day}>
                            <h4 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-purple-600">
                              Day {dayInfo.day} - {dayInfo.theme}
                            </h4>

                            <div className="space-y-0">
                              {dayInfo.places.map((place, idx) => {
                                const nextPlace = dayInfo.places[idx + 1];
                                const distance = nextPlace && place.coords && nextPlace.coords
                                  ? calculateDistance(place.coords, nextPlace.coords)
                                  : null;

                                return (
                                  <div key={idx}>
                                    {/* Place Card - Compact */}
                                    <motion.div
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-purple-400 transition-all"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-purple-600" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <h5 className="font-bold text-gray-800 text-sm">{place.name}</h5>
                                              {place.time && (
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                                  {place.time}
                                                </span>
                                              )}
                                              {place.mealType && (
                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                  place.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' :
                                                  place.mealType === 'Mid-Morning Snack' ? 'bg-yellow-100 text-yellow-700' :
                                                  place.mealType === 'Lunch' ? 'bg-green-100 text-green-700' :
                                                  place.mealType === 'Afternoon Snack' ? 'bg-orange-100 text-orange-700' :
                                                  place.mealType === 'Evening Beverage' ? 'bg-pink-100 text-pink-700' :
                                                  place.mealType === 'Pre-Dinner Appetizer' ? 'bg-red-100 text-red-700' :
                                                  place.mealType === 'Dinner' ? 'bg-purple-100 text-purple-700' :
                                                  place.mealType === 'Dessert' ? 'bg-rose-100 text-rose-700' :
                                                  'bg-blue-100 text-blue-700'
                                                }`}>
                                                  {place.mealType === 'Breakfast' && '☕'}
                                                  {place.mealType === 'Mid-Morning Snack' && '🥐'}
                                                  {place.mealType === 'Lunch' && '🍽️'}
                                                  {place.mealType === 'Afternoon Snack' && '🍰'}
                                                  {place.mealType === 'Evening Beverage' && '🍹'}
                                                  {place.mealType === 'Pre-Dinner Appetizer' && '🍤'}
                                                  {place.mealType === 'Dinner' && '🍷'}
                                                  {place.mealType === 'Dessert' && '🍨'}
                                                  {place.mealType}
                                                </span>
                                              )}
                                            </div>
                                            {place.categories && (
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {(Array.isArray(place.categories) ? place.categories : [place.categories]).slice(0, 3).map((cat, i) => (
                                                  <span key={i} className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">
                                                    {cat}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>

                                    {/* Arrow with Distance */}
                                    {nextPlace && (
                                      <div className="flex flex-col items-center py-2">
                                        <div className="text-center">
                                          {distance && (
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                              {formatDistance(distance)}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-purple-500 text-2xl font-bold">↓</div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t p-6 bg-gray-50 flex items-center justify-between flex-shrink-0">
                <div>
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {step === 3 && (
                    <>
                      <button
                        onClick={exportTripToPDF}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Start Over
                      </button>
                    </>
                  )}
                  {step < 3 && (
                    <button
                      onClick={handleNext}
                      disabled={
                        (step === 1 && selectedPreferences.length === 0) ||
                        (step === 2 && !selectedDuration)
                      }
                      className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                        ((step === 1 && selectedPreferences.length > 0) || (step === 2 && selectedDuration))
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {step === 2 ? 'Generate Trip' : 'Next'}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
