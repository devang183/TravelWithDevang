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

export default function TripPreferencesWizard({ cityId, cityName, markers: propMarkers = [], onGenerateTrip }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Preferences, 2: Duration, 3: Generated
  const [selectedPreference, setSelectedPreference] = useState(null);
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
    enabled: isOpen && cityId !== undefined,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Use API markers if available, otherwise use prop markers
  const markers = apiMarkers.length > 0 ? apiMarkers : propMarkers;

  const handlePreferenceSelect = (preferenceKey) => {
    setSelectedPreference(preferenceKey);
  };

  const handleDurationSelect = (days) => {
    setSelectedDuration(days);
  };

  const generateTrip = () => {
    if (!selectedPreference || !selectedDuration) return;

    const preference = TRIP_PREFERENCES[selectedPreference];

    // Filter markers based on preference keywords
    const matchingPlaces = markers.filter(marker => {
      const markerText = `${marker.name} ${marker.description || ''} ${marker.categories || marker.category || ''}`.toLowerCase();
      return preference.keywords.some(keyword => markerText.includes(keyword));
    });

    // Sort by relevance (simple scoring based on keyword matches)
    const scoredPlaces = matchingPlaces.map(place => {
      const placeText = `${place.name} ${place.description || ''} ${place.categories || place.category || ''}`.toLowerCase();
      const score = preference.keywords.reduce((acc, keyword) => {
        return acc + (placeText.includes(keyword) ? 1 : 0);
      }, 0);
      return { ...place, score };
    }).sort((a, b) => b.score - a.score);

    // Generate day-wise itinerary
    const placesPerDay = Math.ceil(scoredPlaces.length / selectedDuration);
    const minPlacesPerDay = 3;
    const maxPlacesPerDay = 6;
    const targetPlacesPerDay = Math.max(minPlacesPerDay, Math.min(maxPlacesPerDay, placesPerDay));

    const itinerary = [];
    let placeIndex = 0;

    for (let day = 1; day <= selectedDuration; day++) {
      const dayPlaces = [];
      const numPlacesThisDay = Math.min(
        targetPlacesPerDay,
        scoredPlaces.length - placeIndex
      );

      for (let i = 0; i < numPlacesThisDay && placeIndex < scoredPlaces.length; i++) {
        dayPlaces.push(scoredPlaces[placeIndex]);
        placeIndex++;
      }

      if (dayPlaces.length > 0) {
        itinerary.push({
          day,
          places: dayPlaces,
          theme: day === 1 ? 'Introduction' : day === selectedDuration ? 'Finale' : 'Exploration'
        });
      }
    }

    const trip = {
      id: Date.now(),
      cityId,
      cityName,
      preference: selectedPreference,
      duration: selectedDuration,
      itinerary,
      totalPlaces: scoredPlaces.length,
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
      doc.text(`${generatedTrip.duration}-Day ${TRIP_PREFERENCES[generatedTrip.preference].label} Trip`, pageWidth / 2, yPos, { align: 'center' });
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
      const filename = `${cityName}_${generatedTrip.duration}day_${TRIP_PREFERENCES[generatedTrip.preference].label}_trip.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedPreference) {
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
    setSelectedPreference(null);
    setSelectedDuration(null);
    setGeneratedTrip(null);
    setActiveTab('overview');
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold hidden sm:inline">Plan Your Trip</span>
        <span className="font-semibold sm:hidden">Plan</span>
      </motion.button>

      {/* Wizard Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mt-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        s <= step ? 'bg-white text-purple-600' : 'bg-purple-400 text-purple-200'
                      }`}>
                        {s}
                      </div>
                      {s < 3 && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">What's your trip about?</h3>
                    <p className="text-gray-600 mb-4">Choose a theme for your perfect itinerary</p>

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
                        const isSelected = selectedPreference === key;

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
                    <div className="flex gap-2 mb-6 border-b">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 font-semibold transition-all ${
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
                        className={`px-4 py-2 font-semibold transition-all ${
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
                            Your {TRIP_PREFERENCES[generatedTrip.preference].label} Adventure
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
                            {TRIP_PREFERENCES[generatedTrip.preference].description}
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
                      <div className="space-y-6">
                        {generatedTrip.itinerary.map((dayInfo) => (
                          <div key={dayInfo.day} className="border-l-4 border-purple-600 pl-4">
                            <h4 className="text-xl font-bold text-gray-800 mb-4">
                              Day {dayInfo.day} - {dayInfo.theme}
                            </h4>

                            <div className="space-y-4">
                              {dayInfo.places.map((place, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <MapPin className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-bold text-gray-800 mb-1">{place.name}</h5>
                                      {place.description && (
                                        <div
                                          className="text-sm text-gray-600 mb-2 prose prose-sm max-w-none"
                                          dangerouslySetInnerHTML={{
                                            __html: place.description
                                              .replace(/<br\s*\/?>/gi, '<br/>')
                                              .replace(/House No:/g, '<strong>House No:</strong>')
                                              .replace(/Street:/g, '<strong>Street:</strong>')
                                              .replace(/City:/g, '<strong>City:</strong>')
                                              .replace(/Postcode:/g, '<strong>Postcode:</strong>')
                                              .replace(/Managed by:/g, '<strong>Managed by:</strong>')
                                          }}
                                        />
                                      )}
                                      {place.categories && (
                                        <div className="flex flex-wrap gap-1">
                                          {(Array.isArray(place.categories) ? place.categories : [place.categories]).map((cat, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                              {cat}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
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
                        (step === 1 && !selectedPreference) ||
                        (step === 2 && !selectedDuration)
                      }
                      className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                        ((step === 1 && selectedPreference) || (step === 2 && selectedDuration))
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
