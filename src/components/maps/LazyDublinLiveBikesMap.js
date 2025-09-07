'use client';
import { Suspense, lazy } from 'react';
import { MapPin, Loader2, Zap } from 'lucide-react';

// Lazy load the main component
const DublinLiveBikesMapComponent = lazy(() => import('./DublinLiveBikesMap'));

// Loading fallback component
function LiveBikesLoadingFallback() {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <MapPin className="w-12 h-12 text-green-500" />
            <Zap className="w-6 h-6 text-yellow-500 animate-pulse absolute -top-1 -right-1" />
            <Loader2 className="w-4 h-4 text-green-600 animate-spin absolute bottom-0 left-0" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Live Bikes Map</h3>
        <p className="text-gray-500 text-sm">Fetching real-time bike locations...</p>
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          🚲 Regular bikes • 🔋 E-bikes
        </div>
      </div>
    </div>
  );
}

// Error boundary fallback
function LiveBikesErrorFallback() {
  return (
    <div className="w-full h-96 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="w-12 h-12 text-red-500" />
          <Zap className="w-6 h-6 text-red-400 ml-2" />
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Live Bikes Map</h3>
        <p className="text-red-600 text-sm">Unable to fetch real-time bike data</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// Main lazy-loaded wrapper component
export default function LazyDublinLiveBikesMap(props) {
  return (
    <Suspense fallback={<LiveBikesLoadingFallback />}>
      <DublinLiveBikesMapComponent {...props} />
    </Suspense>
  );
}

// Export the loading components for reuse
export { LiveBikesLoadingFallback, LiveBikesErrorFallback };
