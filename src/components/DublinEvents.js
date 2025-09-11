'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, MapPin, Euro, ExternalLink, Search, Filter, X, Clock, Phone, Map, Globe } from 'lucide-react';

// Helper function to highlight search terms in text
const highlightText = (text = '', searchTerm = '') => {
  if (!searchTerm.trim() || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const EventsComponent = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Define closeModal first as it's used by other handlers
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Wait for the animation to complete before removing the event
    setTimeout(() => {
      setSelectedEvent(null);
      document.body.style.overflow = 'auto';
    }, 200);
  }, []);

  // Define handleEscapeKey after closeModal
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  // Define handleClickOutside after closeModal
  const handleClickOutside = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  }, [closeModal]);

  // Define handleEventClick after all its dependencies
  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, priceFilter, sortBy]);

  // Clean up event listeners for modal
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen, handleClickOutside, handleEscapeKey]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('https://failteireland.azure-api.net/opendata-api/v2/events');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data.value || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.address?.addressRegion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(event => event.isAccessibleForFree === true);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(event => event.isAccessibleForFree === false);
    }

    // Sort events
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'price') {
        const priceA = parseFloat(a.offers?.price || 0);
        const priceB = parseFloat(b.offers?.price || 0);
        return priceA - priceB;
      }
      return 0;
    });

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (event) => {
    if (event.isAccessibleForFree) {
      return 'Free';
    }
    if (event.offers?.price) {
      return `€${event.offers.price}`;
    }
    return 'Price TBA';
  };

  const truncateDescription = (description, maxLength = 200) => {
    if (!description) return 'No description available';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const getNextScheduleDate = (event) => {
    if (!event.eventSchedule || event.eventSchedule.length === 0) {
      return event.startDate;
    }
    
    const now = new Date();
    const futureSchedules = event.eventSchedule
      .filter(schedule => new Date(schedule.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return futureSchedules.length > 0 ? futureSchedules[0].startDate : event.startDate;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-semibold mb-2">Unable to Load Events</h3>
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button 
          onClick={fetchEvents}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }




  // Format schedule dates
  const formatSchedule = (schedules) => {
    if (!schedules || !Array.isArray(schedules)) return [];
    return schedules.map(schedule => ({
      startDate: schedule.startDate ? new Date(schedule.startDate) : null,
      endDate: schedule.endDate ? new Date(schedule.endDate) : null
    }));
  };

  // Format date for display
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeModal}
        >
          <div 
            ref={modalRef}
            className={`bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEvent.name || 'Event Details'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {selectedEvent.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    Event Schedule
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {formatSchedule(selectedEvent.eventSchedule).length > 0 ? (
                      formatSchedule(selectedEvent.eventSchedule).map((schedule, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium">
                            {schedule.startDate ? schedule.startDate.toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {schedule.startDate && schedule.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {schedule.endDate && ` - ${new Date(schedule.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No schedule available</p>
                    )}
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  {/* Price */}
                  {selectedEvent.offers?.price && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <Euro className="h-5 w-5 mr-2 text-green-600" />
                        Price
                      </h4>
                      <p>
                        {selectedEvent.offers.priceCurrency && (
                          <span>{selectedEvent.offers.priceCurrency} </span>
                        )}
                        {selectedEvent.offers.price}
                        {selectedEvent.isAccessibleForFree && ' (Free)'}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {selectedEvent.location && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-green-600" />
                        Location
                      </h4>
                      <div className="space-y-1">
                        <p className="font-medium">{selectedEvent.location.name}</p>
                        {selectedEvent.location.address && (
                          <p className="text-gray-600">
                            {selectedEvent.location.address.streetAddress && (
                              <span>{selectedEvent.location.address.streetAddress}<br /></span>
                            )}
                            {selectedEvent.location.address.addressLocality && (
                              <span>{selectedEvent.location.address.addressLocality}, </span>
                            )}
                            {selectedEvent.location.address.addressRegion && (
                              <span>{selectedEvent.location.address.addressRegion} </span>
                            )}
                            {selectedEvent.location.address.postalCode && (
                              <span>{selectedEvent.location.address.postalCode}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {(selectedEvent.organizer?.telephone || selectedEvent.url) && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Contact Information</h4>
                      <div className="space-y-1">
                        {selectedEvent.organizer?.telephone && (
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-green-600" />
                            <a 
                              href={`tel:${selectedEvent.organizer.telephone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {selectedEvent.organizer.telephone}
                            </a>
                          </p>
                        )}
                        {selectedEvent.url && (
                          <p className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-green-600" />
                            <a 
                              href={selectedEvent.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all"
                            >
                              {selectedEvent.url}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedEvent.url && (
                <a
                  href={selectedEvent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Ireland Events</h1>
        <p className="text-gray-600">Find exciting events happening across Ireland</p>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="free">Free Events</option>
            <option value="paid">Paid Events</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Events grid with vertical scroll */}
      <div className="overflow-y-auto max-h-[350px] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <div 
            key={event.id} 
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow h-full cursor-pointer"
            onClick={() => handleEventClick(event)}
          >
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {searchTerm ? highlightText(event.name, searchTerm) : (event.name || 'Untitled Event')}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {searchTerm ? highlightText(truncateDescription(event.description), searchTerm) : truncateDescription(event.description)}
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  {formatDate(getNextScheduleDate(event))}
                </div>
                
                {event.location?.name && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    <span className="truncate">
                      {event.location.name}
                      {event.location.address?.addressRegion && 
                        `, ${event.location.address.addressRegion}`
                      }
                    </span>
                  </div>
                )}

                <div className="flex items-center text-gray-600 text-sm">
                  <Euro className="h-4 w-4 mr-2 text-green-600" />
                  {formatPrice(event)}
                </div>
              </div>

              {event.url && (
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Learn More
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>

      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default EventsComponent;