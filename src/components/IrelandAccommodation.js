import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, Phone, Mail } from 'lucide-react';

const AccommodationDisplay = ({ city = '' }) => {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchAccommodations();
  }, []);

  useEffect(() => {
    filterAccommodations();
  }, [accommodations, searchTerm, selectedType, city]);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://failteireland.azure-api.net/opendata-api/v2/accommodation');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAccommodations(data.value || []);
    } catch (err) {
      setError(`Failed to fetch accommodation data: ${err.message}`);
      console.error('Error fetching accommodations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAccommodations = () => {
    let filtered = accommodations;

    // Filter by city if specified
    if (city) {
      filtered = filtered.filter(acc => 
        acc.address?.addressLocality?.toLowerCase().includes(city.toLowerCase()) ||
        acc.address?.addressRegion?.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(acc =>
        acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.address?.addressLocality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.address?.addressRegion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by accommodation type
    if (selectedType !== 'all') {
      filtered = filtered.filter(acc =>
        acc.additionalType?.toLowerCase().includes(selectedType.toLowerCase()) ||
        acc['@type']?.some(type => type.toLowerCase().includes(selectedType.toLowerCase()))
      );
    }

    setFilteredAccommodations(filtered);
  };

  const getAccommodationTypes = () => {
    const types = new Set();
    accommodations.forEach(acc => {
      if (acc.additionalType) {
        types.add(acc.additionalType);
      }
      if (acc['@type']) {
        acc['@type'].forEach(type => types.add(type));
      }
    });
    return Array.from(types).filter(type => type !== 'LodgingBusiness');
  };

  const getTotalUnits = (amenityFeature) => {
    const totalUnits = amenityFeature?.find(feature => feature.name === 'totalUnits');
    return totalUnits?.value;
  };

  const getRatingValue = (starRating) => {
    return starRating?.[0]?.ratingValue || 'Not rated';
  };

  const getContactName = (contactPoint) => {
    const contact = contactPoint?.[0];
    return contact?.name || `${contact?.givenName || ''} ${contact?.familyName || ''}`.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading accommodations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchAccommodations}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {city ? `Accommodations in ${city}` : 'Accommodations'}
        </h2>
        <p className="text-gray-600">
          Discover quality assured accommodations registered with Fáilte Ireland
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search accommodations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 rounded-lg outline-none bg-white"
        >
          <option value="all">All Types</option>
          {getAccommodationTypes().map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredAccommodations.length} accommodations
        </p>
      </div>

      {/* Accommodation Grid */}
      {filteredAccommodations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No accommodations found matching your criteria.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-6 scroll-snap-x scroll-smooth snap-center">
          {filteredAccommodations.map((accommodation) => (
            <div key={accommodation.id} className="w-96 flex-shrink-0 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 snap-center">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {accommodation.name}
                  </h3>
                  {getTotalUnits(accommodation.amenityFeature) && (
                    <div className="flex items-center text-sm text-gray-500 ml-2">
                      <Users className="h-4 w-4 mr-1" />
                      {getTotalUnits(accommodation.amenityFeature)}
                    </div>
                  )}
                </div>

                {/* Address */}
                {accommodation.address && (
                  <div className="flex items-start text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      {accommodation.address.streetAddress && (
                        <div>{accommodation.address.streetAddress}</div>
                      )}
                      <div>
                        {accommodation.address.addressLocality}
                        {accommodation.address.addressRegion && 
                          `, ${accommodation.address.addressRegion}`
                        }
                      </div>
                      {accommodation.address.postalCode && (
                        <div className="text-gray-500">{accommodation.address.postalCode}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rating */}
                {accommodation.starRating && (
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="text-sm text-gray-700">
                      {getRatingValue(accommodation.starRating)}
                    </span>
                  </div>
                )}

                {/* Type */}
                {accommodation.additionalType && (
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {accommodation.additionalType}
                    </span>
                  </div>
                )}

                {/* Contact Info */}
                {accommodation.contactPoint && accommodation.contactPoint[0] && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">Contact:</div>
                      <div>{getContactName(accommodation.contactPoint)}</div>
                      {accommodation.contactPoint[0].jobTitle && (
                        <div className="text-gray-500">
                          {accommodation.contactPoint[0].jobTitle}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Registration Number */}
                {accommodation.identifier && (
                  <div className="mt-2 text-xs text-gray-500">
                    Registration: {accommodation.identifier[0]?.value}
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Load More Button (if needed for pagination) */}
      {filteredAccommodations.length > 0 && (
        <div className="mt-8 text-center">
          <button 
            onClick={fetchAccommodations}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default AccommodationDisplay;