'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, Search, Tag } from 'lucide-react';

export default function BengaluruEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [searchQuery]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/events/bengaluru', window.location.origin);
      // No limit - fetch all events
      if (searchQuery) {
        url.searchParams.set('search', searchQuery);
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      console.log(`Fetched ${data.events.length} events`); // Debug log
      setEvents(data.events);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (startDate, endDate) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const startTime = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (endDate) {
      const end = new Date(endDate);
      const endTime = end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bengaluru events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading events: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bengaluru Events
        </h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Event Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {events.length} upcoming events
      </div>

      {/* Events Grid - Scrollable Container */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No events found</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[800px] pr-4">
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-track {
              background: #e5e7eb;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb {
              background: #3b82f6;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #2563eb;
            }
          `}</style>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div
                key={`${event.url}-${index}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                style={{
                  transform: 'scale(1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
              {/* Event Image */}
              {event.image && (
                <div className="h-48 bg-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Event Content */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Event Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {event.name}
                </h3>

                {/* Event Date */}
                <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
                  <Calendar size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{formatDate(event.startDate)}</p>
                    {event.startDate && event.endDate && (
                      <p className="text-xs text-gray-500">
                        {formatTime(event.startDate, event.endDate)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-1">
                      {event.location.name || event.location.address?.addressLocality || 'Bengaluru'}
                    </p>
                  </div>
                )}

                {/* Performer/Organizer */}
                {event.performer && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <Tag size={16} />
                    <p className="line-clamp-1">
                      {event.performer.name}
                    </p>
                  </div>
                )}

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* Event Link */}
                <div className="mt-auto">
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Details
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
