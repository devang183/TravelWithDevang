'use client';

import React, { useState } from 'react';
import { RefreshCw, Database, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const NammaMetroSyncDashboard = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncResult(null);

      const response = await fetch('/api/namma-metro/sync');
      const data = await response.json();

      if (data.success) {
        setSyncResult(data);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Data Sync Dashboard
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Sync ridership data from GitHub to MongoDB
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            syncing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">{syncResult.message}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Database className="h-4 w-4" />
                    Total Records
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {syncResult.stats.totalRecords?.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    Latest Date
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {syncResult.stats.latestDate}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Synced At
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(syncResult.stats.syncedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600">
                <strong>Source:</strong>{' '}
                <a
                  href="https://github.com/thecont1/namma-metro-ridership-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  thecont1/namma-metro-ridership-tracker
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Sync Failed</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How It Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Source:</strong> GitHub repository updates 3x daily (07:33, 12:07, 17:22 UTC)</li>
          <li>• <strong>Automated Sync:</strong> Runs 3x daily at 08:30, 13:30, 18:30 UTC via GitHub Actions</li>
          <li>• <strong>Manual Sync:</strong> Click &quot;Sync Now&quot; to fetch latest data immediately</li>
          <li>• <strong>Database:</strong> Stores in MongoDB collection <code className="bg-blue-100 px-1 rounded">dailyNammaMetro</code></li>
        </ul>
      </div>
    </div>
  );
};

export default NammaMetroSyncDashboard;
