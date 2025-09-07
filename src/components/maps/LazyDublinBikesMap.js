'use client';
import { Suspense, lazy } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

// Lazy load the main component
const DublinBikesMapComponent = lazy(() => import('./DublinBikesMap'));

// Loading fallback component
function MapLoadingFallback() {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <MapPin className="w-12 h-12 text-blue-500" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Dublin Bikes Map</h3>
        <p className="text-gray-500 text-sm">Fetching real-time bike station data...</p>
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error boundary fallback
function MapErrorFallback() {
  return (
    <div className="w-full h-96 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Map</h3>
        <p className="text-red-600 text-sm">Please try refreshing the page</p>
      </div>
    </div>
  );
}

// Main lazy-loaded wrapper component
export default function LazyDublinBikesMap(props) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <DublinBikesMapComponent {...props} />
    </Suspense>
  );
}

// Export the loading component for reuse
export { MapLoadingFallback, MapErrorFallback };
