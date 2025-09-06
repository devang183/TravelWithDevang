'use client';
import { useState } from 'react';

export default function MusicSearch() {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      const spotifyURL = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
      window.open(spotifyURL, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4 bg-white p-4 border rounded-lg shadow-md max-w-md">
      <label className="text-green-800 font-semibold">Search Spotify:</label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Try: Dublin indie music"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Search
        </button>
      </div>
    </div>
  );
}