'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Phone, Globe, Star, Users, ChevronRight, ExternalLink, Calendar, Euro, Tag, Search, X } from 'lucide-react';

const CityAttractionsDublin = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState(new Set());
  const cityName = 'Dublin'; // Hardcoded for Dublin

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/attractions?city=Dublin&limit=200`);
        const data = await response.json();
        
        if (data.success) {
          setAttractions(data.attractions);
        } else {
          setError(data.error || 'Failed to fetch attractions');
        }
      } catch (err) {
        console.error('Error fetching attractions:', err);
        setError('Failed to load attractions');
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions(); // Always fetch for Dublin
  }, []); // Empty dependency array since we're not using any props

  // Get all unique tags from attractions
  const allTags = useMemo(() => {
    const tagSet = new Set();
    attractions.forEach(attraction => {
      if (attraction.tags && Array.isArray(attraction.tags)) {
        attraction.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [attractions]);

  // Get tag counts
  const getTagCounts = () => {
    const counts = {};
    allTags.forEach(tag => {
      counts[tag] = attractions.filter(attraction => 
        attraction.tags && attraction.tags.includes(tag)
      ).length;
    });
    return counts;
  };

  // Filter attractions based on search term and selected tags
  const filteredAttractions = useMemo(() => {
    let filtered = attractions;

    // Filter by selected tags
    if (selectedTags.size > 0) {
      filtered = filtered.filter(attraction => 
        attraction.tags && attraction.tags.some(tag => selectedTags.has(tag))
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(attraction => 
        attraction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.address?.full?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (attraction.tags && attraction.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    return filtered;
  }, [attractions, searchTerm, selectedTags]);

  // Tag filter functions
  const toggleTag = (tag) => {
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);
  };

  const selectAllTags = () => {
    setSelectedTags(new Set(allTags));
  };

  const clearAllTags = () => {
    setSelectedTags(new Set());
  };

  // Helper function to highlight search terms
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Helper function to get event type color
  const getEventTypeColor = (category) => {
    const colors = {
      'Event': 'bg-blue-100 text-blue-800',
      'Festival': 'bg-purple-100 text-purple-800',
      'Exhibition': 'bg-green-100 text-green-800',
      'Tour': 'bg-orange-100 text-orange-800',
      'Workshop': 'bg-pink-100 text-pink-800',
      'Performance': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const AttractionCard = ({ attraction }) => (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      onClick={() => setSelectedAttraction(attraction)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        {attraction.image ? (
          <img
            src={attraction.image}
            alt={attraction.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <Calendar className="w-12 h-12 text-blue-500 opacity-50" />
        </div>
        
        {/* Event Type Badge */}
        {attraction.category && (
          <div className={`absolute top-3 left-3 ${getEventTypeColor(attraction.category)} rounded-full px-2 py-1`}>
            <span className="text-xs font-medium">{attraction.category}</span>
          </div>
        )}

        {/* Rating Badge */}
        {attraction.rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{attraction.rating}</span>
          </div>
        )}

        {/* Free Event Badge */}
        {attraction.isAccessibleForFree && (
          <div className="absolute bottom-3 right-3 bg-green-500 text-white rounded-full px-2 py-1">
            <span className="text-xs font-medium">FREE</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {highlightText(attraction.name, searchTerm)}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {highlightText(attraction.description || 'Discover this amazing event in ' + cityName, searchTerm)}
        </p>

        {/* Address */}
        {(attraction.address.street || attraction.address.city) && (
          <div className="flex items-start space-x-2 mb-2">
            <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              searchTerm && Object.values(attraction.address).some(part => 
                part && part.toString().toLowerCase().includes(searchTerm.toLowerCase())
              ) ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <span className={`text-sm line-clamp-2 ${
              searchTerm && Object.values(attraction.address).some(part => 
                part && part.toString().toLowerCase().includes(searchTerm.toLowerCase())
              ) ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {[
                attraction.address.street,
                attraction.address.city,
                attraction.address.region,
                attraction.address.postalCode
              ].filter(Boolean).map((part, i, arr) => {
                if (!searchTerm) return <span key={i}>{part}{i < arr.length - 1 ? ', ' : ''}</span>;
                
                const lowerSearch = searchTerm.toLowerCase();
                const lowerPart = part.toLowerCase();
                const index = lowerPart.indexOf(lowerSearch);
                
                if (index === -1) return <span key={i}>{part}{i < arr.length - 1 ? ', ' : ''}</span>;
                
                return (
                  <span key={i}>
                    {part.substring(0, index)}
                    <span className="bg-yellow-200 text-gray-900 px-0.5 rounded">
                      {part.substring(index, index + searchTerm.length)}
                    </span>
                    {part.substring(index + searchTerm.length)}
                    {i < arr.length - 1 ? ', ' : ''}
                  </span>
                );
              })}
            </span>
          </div>
        )}

        {/* Event Dates */}
        {(attraction.startDate || attraction.endDate) && (
          <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {attraction.startDate && attraction.endDate && attraction.startDate !== attraction.endDate
                ? `${formatDate(attraction.startDate)} - ${formatDate(attraction.endDate)}`
                : formatDate(attraction.startDate || attraction.endDate)
              }
            </span>
          </div>
        )}

        {/* Price Range */}
        {attraction.priceRange && (
          <div className="flex items-center space-x-2 mb-2">
            <Euro className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-green-600 font-medium">
              {attraction.priceRange}
            </span>
          </div>
        )}

        {/* View More Button */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-blue-600 text-sm font-medium">View Details</span>
          <ChevronRight className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const AttractionModal = ({ attraction, onClose }) => {
    if (!attraction) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl max-h-[90vh] w-full overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            {attraction.image ? (
              <img
                src={attraction.image}
                alt={attraction.name}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <MapPin className="w-16 h-16 text-blue-500 opacity-50" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {attraction.name}
                  </h2>
                  {attraction.category && (
                    <div className={`${getEventTypeColor(attraction.category)} rounded-full px-3 py-1 flex items-center space-x-1`}>
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">{attraction.category}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {attraction.description || 'Discover this amazing event in ' + cityName}
                </p>
              </div>

              {/* Description */}
              {attraction.description && (
                <div className="flex items-start space-x-3">
                  <div>
                    <p className="text-gray-600 whitespace-pre-line">{attraction.description}</p>
                  </div>
                </div>
              )}

              {/* Address */}
              {(attraction.address.street || attraction.address.city) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                    Address
                  </h3>
                  <div className="space-y-1 text-gray-600">
                    {attraction.address.street && <div className="flex items-start">
                      <span className="w-20 text-gray-500">Street:</span>
                      <span>{attraction.address.street}</span>
                    </div>}
                    <div className="flex">
                      <span className="w-20 text-gray-500">City:</span>
                      <span>
                        {attraction.address.city}
                        {attraction.address.postalCode && `, ${attraction.address.postalCode}`}
                      </span>
                    </div>
                    {attraction.address.region && <div className="flex">
                      <span className="w-20 text-gray-500">Region:</span>
                      <span>{attraction.address.region}</span>
                    </div>}
                    {attraction.address.country && <div className="flex">
                      <span className="w-20 text-gray-500">Country:</span>
                      <span>{attraction.address.country}</span>
                    </div>}
                  </div>
                </div>
              )}

              {/* Event Dates */}
              {(attraction.startDate || attraction.endDate) && (
                <div className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Event Dates</h3>
                    <p className="text-gray-700">
                      {attraction.startDate && attraction.endDate && attraction.startDate !== attraction.endDate
                        ? `${formatDate(attraction.startDate)} - ${formatDate(attraction.endDate)}`
                        : formatDate(attraction.startDate || attraction.endDate)
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Event Schedule */}
              {attraction.eventSchedule && attraction.eventSchedule.length > 0 && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Ireland Attractions</h1>
                      <p className="text-gray-600">Discover the best places to visit in Ireland</p>
                    </div>
                    <div className="space-y-2">
                      {attraction.eventSchedule.slice(0, 3).map((schedule, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          <div className="font-medium text-gray-800">
                            {schedule.startDate && formatDate(schedule.startDate)}
                            {schedule.startTime && ` at ${schedule.startTime}`}
                          </div>
                          {schedule.description && (
                            <div className="text-gray-600 mt-1">{schedule.description}</div>
                          )}
                        </div>
                      ))}
                      {attraction.eventSchedule.length > 3 && (
                        <div className="text-sm text-blue-600">
                          +{attraction.eventSchedule.length - 3} more sessions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              {attraction.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-lg">{attraction.rating}</span>
                  </div>
                  {attraction.reviewCount && (
                    <span className="text-gray-500">({attraction.reviewCount} reviews)</span>
                  )}
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attraction.telephone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Phone</h3>
                      <a 
                        href={`tel:${attraction.telephone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {attraction.telephone}
                      </a>
                    </div>
                  </div>
                )}

                {attraction.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Website</h3>
                      <a 
                        href={attraction.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Opening Hours */}
              {attraction.openingHours && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Opening Hours</h3>
                    <p className="text-gray-600">{attraction.openingHours}</p>
                  </div>
                </div>
              )}

              {/* Price Information */}
              <div className="flex items-start space-x-3">
                <Euro className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Pricing</h3>
                  {attraction.isAccessibleForFree ? (
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        FREE EVENT
                      </span>
                    </div>
                  ) : attraction.priceRange ? (
                    <p className="text-green-600 font-medium">{attraction.priceRange}</p>
                  ) : (
                    <p className="text-gray-500">Contact organizer for pricing</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {attraction.website && (
                <a
                  href={attraction.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              
              {attraction.coordinates.latitude && attraction.coordinates.longitude && (
                <a
                  href={`https://maps.google.com/?q=${attraction.coordinates.latitude},${attraction.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading attractions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Unable to load attractions</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No attractions found</h3>
          <p className="text-gray-600">We couldn't find any attractions for {cityName} at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[white/30] backdrop-blur-md rounded-2xl p-6 shadow-lg" style={{
      fontFamily: '"Playfair Display", serif'
    }}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-center items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <MapPin className="w-6 h-6 text-blue-500 mr-2" />
                Tourist Attractions in Ireland
              </h2>
              <p className="text-gray-600 mt-1">
                Discover {filteredAttractions.length} of {attractions.length} amazing places to visit
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search attractions, events, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 focus:outline-none rounded-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tag Filter Section */}
        {allTags.length > 0 && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter by Tags</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllTags}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  All
                </button>
                <button
                  onClick={clearAllTags}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  None
                </button>
              </div>
            </div>
            
            {/* Tag Pills - Horizontal Scrollable */}
            <div className="relative mb-2">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                {allTags.map((tag) => {
                  const isActive = selectedTags.has(tag);
                  const count = getTagCounts()[tag];
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 transform hover:scale-105 flex-shrink-0 shadow-sm hover:shadow-md
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-medium text-sm whitespace-nowrap">{tag}</span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-semibold min-w-[20px] text-center
                        ${isActive 
                          ? 'bg-white/25 text-white backdrop-blur-sm' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Scroll Indicators */}
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Active Filter Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAttractions.length} of {attractions.length} attractions
                {selectedTags.size === 0 && searchTerm === '' && " (all attractions)"}
                {selectedTags.size > 0 && ` (filtered by ${selectedTags.size} tag${selectedTags.size > 1 ? 's' : ''})`}
              </span>
              {selectedTags.size > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Filter active
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Attractions Container */}
        {filteredAttractions.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
            <p className="text-gray-500">
              No attractions match your search for {searchTerm}. Try different keywords.
            </p>
          </div>
        ) : (
          <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAttractions.map((attraction, index) => (
                <AttractionCard key={attraction.id || index} attraction={attraction} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AttractionModal 
        attraction={selectedAttraction} 
        onClose={() => setSelectedAttraction(null)} 
      />
    </>
  );
};

export default CityAttractionsDublin;
