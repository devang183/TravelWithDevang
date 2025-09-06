'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function MusicSection({ embedUrl }) {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      const spotifyURL = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
      window.open(spotifyURL, '_blank');
    }
  };

  return (
    <div className="mt-6 w-full rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md bg-white/10">
  <div
    onClick={() => setShow(!show)}
    className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm transition"
  >
    <span className="font-medium text-white">
      {show ? 'Local Music' : 'Now Playing – Local Vibes'}
    </span>
    {show ? <ChevronDown className="h-4 w-4 text-white" /> : <ChevronRight className="h-4 w-4 text-white" />}
  </div>

  {show && (
    <div className="p-4 space-y-4 text-white">
      {/* Spotify Player */}
      <iframe
        src={embedUrl}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: '8px' }}
      ></iframe>

      {/* Search Bar */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Search Spotify:</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Try: Dublin indie music"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/30 backdrop-blur-sm placeholder-white text-white focus:outline-none focus:ring-2"
          />
          <button
            onClick={handleSearch}
            className="bg-white/30 text-white px-4 py-2 rounded hover:bg-white/40 backdrop-blur-sm transition"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
}

// 'use client';
// import { useState } from 'react';
// import { ChevronDown, ChevronRight } from 'lucide-react';

// export default function MusicSection({ embedUrl }) {
//   const [show, setShow] = useState(false);

//   return (
//     <div className="mt-6 w-full bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
//       <div
//         onClick={() => setShow(!show)}
//         className="flex items-center justify-between px-4 py-3 cursor-pointer bg-green-100 hover:bg-green-200 transition"
//       >
//         <span className="font-medium text-green-800">
//           {show ? 'Local Tunes' : 'Now Playing – Local Vibes'}
//         </span>
//         {show ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//       </div>

//       {show && (
//         <div className="p-3 bg-white">
//           <iframe
//             src={embedUrl}
//             width="100%"
//             height="352"
//             frameBorder="0"
//             allowFullScreen=""
//             allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
//             loading="lazy"
//             style={{ borderRadius: '8px' }}
//           ></iframe>
//         </div>
//       )}
//     </div>
//   );
// }

// // "use client";

// // import { useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";

// // export default function MusicSection({ embedUrl }) {
// //   const [expanded, setExpanded] = useState(false);

// //   return (
// //     <AnimatePresence>
// //       {expanded ? (
// //         <motion.div
// //           key="spotify"
// //           initial={{ opacity: 0, scale: 0.8, y: -30 }}
// //           animate={{ opacity: 1, scale: 1, y: 0 }}
// //           exit={{ opacity: 0, scale: 0.8, y: -30 }}
// //           transition={{ duration: 0.5 }}
// //         //   className="bottom-4 right-4 bg-black rounded-lg shadow-2xl p-4 z-50"
// //         className="top-3 left-3 bg-black rounded-lg shadow-2xl p-4 z-50"
// //         >
// //           <div className="flex justify-between items-center mb-2">
// //             <h3 className="text-white font-semibold text-base">Local Music</h3>
// //             <button
// //               onClick={() => setExpanded(false)}
// //               className="text-white bg-gray-700 hover:bg-gray-600 rounded-full p-1"
// //               aria-label="Close"
// //             >
// //               ✕
// //             </button>
// //           </div>
// //           <iframe
// //             src={embedUrl}
// //             width="100%"
// //             height="80"
// //             allow="encrypted-media"
// //             loading="lazy"
// //             className="rounded"
// //           ></iframe>
// //         </motion.div>
// //       ) : (
// //         <motion.button
// //           key="toggle"
// //           initial={{ opacity: 0, scale: 0.5 }}
// //           animate={{ opacity: 1, scale: 1 }}
// //           exit={{ opacity: 0, scale: 0.5 }}
// //           transition={{ duration: 0.3 }}
// //           onClick={() => setExpanded(true)}
// //           className="top-4 right-4 z-50 w-8 h-8 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition"
// //           aria-label="Open Spotify Player"
// //         >
// //           🎵
// //         </motion.button>
// //       )}
// //     </AnimatePresence>
// //   );
// // }