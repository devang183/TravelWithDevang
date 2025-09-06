'use client';

import { useState, useEffect } from 'react';

const AUTO_REFRESH_INTERVAL = 10000; // 5 seconds

const LUAS_STOPS = {
  red: [
    { id: 73, name: 'Hinch Heuston' },
    { id: 74, name: 'HCT Heuston' },
    { id: 57, name: 'The Point' },
    { id: 56, name: 'Spencer Dock' },
    { id: 55, name: 'Mayor Square - NCI' },
    { id: 54, name: "George's Dock" },
    { id: 23, name: 'Connolly' },
    { id: 22, name: 'Busáras' },
    { id: 21, name: 'Abbey Street' },
    { id: 20, name: 'Jervis' },
    { id: 19, name: 'Four Courts' },
    { id: 18, name: 'Smithfield' },
    { id: 17, name: 'Museum' },
    { id: 16, name: 'Heuston' },
    { id: 15, name: "St. James's Street" },
    { id: 14, name: 'Fatima' },
    { id: 13, name: 'Rialto' },
    { id: 12, name: 'Suir Road' },
    { id: 11, name: 'Goldenbridge' },
    { id: 10, name: 'Drimnagh' },
    { id: 9, name: 'Blackhorse' },
    { id: 8, name: 'Bluebell' },
    { id: 7, name: 'Kylemore' },
    { id: 6, name: 'Red Cow' },
    { id: 5, name: 'Kingswood' },
    { id: 4, name: 'Belgard' },
    { id: 3, name: 'Cookstown' },
    { id: 2, name: 'Hospital' },
    { id: 1, name: 'Tallaght' },
    { id: 49, name: 'Fettercairn' },
    { id: 50, name: 'Cheeverstown' },
    { id: 51, name: 'Citywest Campus' },
    { id: 52, name: 'Fortunestown' },
    { id: 53, name: 'Saggart' },
  ],
  green: [
    { id: 72, name: "St. Stephen's Green" },
    { id: 71, name: 'Broombridge' },
    { id: 70, name: 'Cabra' },
    { id: 69, name: 'Phibsborough' },
    { id: 68, name: 'Grangegorman' },
    { id: 67, name: 'Broadstone - University' },
    { id: 66, name: 'Dominick' },
    { id: 65, name: 'Parnell' },
    { id: 64, name: "O'Connell - Upper" },
    { id: 63, name: "O'Connell GPO" },
    { id: 62, name: 'Marlborough' },
    { id: 61, name: 'Westmoreland' },
    { id: 60, name: 'Trinity' },
    { id: 59, name: 'Dawson' },
    { id: 24, name: "St. Stephen's Green" },
    { id: 25, name: 'Harcourt' },
    { id: 26, name: 'Charlemont' },
    { id: 27, name: 'Ranelagh' },
    { id: 28, name: 'Beechwood' },
    { id: 29, name: 'Cowper' },
    { id: 30, name: 'Milltown' },
    { id: 31, name: 'Windy Arbour' },
    { id: 32, name: 'Dundrum' },
    { id: 33, name: 'Balally' },
    { id: 34, name: 'Kilmacud' },
    { id: 35, name: 'Stillorgan' },
    { id: 36, name: 'Sandyford' },
    { id: 37, name: 'Central Park' },
    { id: 38, name: 'Glencairn' },
    { id: 39, name: 'The Gallops' },
    { id: 40, name: 'Leopardstown Valley' },
    { id: 42, name: 'Ballyogan Wood' },
    { id: 43, name: 'Racecourse' },
    { id: 44, name: 'Carrickmines' },
    { id: 45, name: 'Brennanstown' },
    { id: 46, name: 'Laughabstown' },
  ]
};

async function fetchLuasData(stopId) {
  const res = await fetch(`/api/luas?stopId=${stopId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch LUAS data');
  return res.json();
}

export default function LuasLiveData() {
  const [stopId, setStopId] = useState(15);
  const [luasData, setLuasData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function refreshLuasData() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLuasData(stopId);
      setLuasData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch LUAS data');
    }
    setLoading(false);
  }

  useEffect(() => {
    refreshLuasData(); // first load

    const interval = setInterval(() => {
      refreshLuasData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval); // cleanup on unmount
  }, [stopId]);

  return (
    <section className="p-2 mt-6 w-full rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md bg-white/10">
  <h2 className="text-xl font-semibold mb-2 text-center">Live LUAS Stop Data</h2>

  <div className="flex justify-center gap-6 mb-4">
    {/* Red Line dropdown */}
    <select
      className="p-2 rounded bg-white/30 focus:outline-none text-white hover:scale-105 transform transition-all duration-300 hover:bg-gray-600 disabled:opacity-50"
      value={stopId}
      onChange={(e) => {
        const selectedId = parseInt(e.target.value, 10);
        // Only update if the selected stop is on the Red Line
        if (LUAS_STOPS.red.some((stop) => stop.id === selectedId)) {
          setStopId(selectedId);
        }
      }}
    >
      <option value="">Select Red Line Stop</option>
      {LUAS_STOPS.red.map((stop) => (
        <option key={stop.id} value={stop.id}>
          {stop.name}
        </option>
      ))}
    </select>

    {/* Green Line dropdown */}
    <select
      className="p-2 rounded bg-white/30 text-white focus:outline-none hover:scale-105 transform transition-all duration-300 hover:bg-green-700 disabled:opacity-50"
      value={stopId}
      onChange={(e) => {
        const selectedId = parseInt(e.target.value, 10);
        // Only update if the selected stop is on the Green Line
        if (LUAS_STOPS.green.some((stop) => stop.id === selectedId)) {
          setStopId(selectedId);
        }
      }}
    >
      <option value="">Select Green Line Stop</option>
      {LUAS_STOPS.green.map((stop) => (
        <option key={stop.id} value={stop.id}>
          {stop.name}
        </option>
      ))}
    </select>

    <button
      onClick={refreshLuasData}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:scale-105 transform transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Refreshing...' : 'Refresh LUAS Data'}
    </button>
  </div>

  {error && <p className="text-red-600 mb-2">{error}</p>}

  {luasData ? (
    <ul className="text-sm max-h-80 overflow-auto bg-white/30 rounded-lg p-4 font-mono" style={{ color: '#FFBF00' }}>
      {luasData.tableData.slice(0, 5).map((row, idx) => (
        <li key={idx} className="border-b border-black text-white py-1 flex justify-between">
          <span>{row[0] || '—'}</span>
          <span>{row[1] || '—'}</span>
          <span>{row[2] || 'Due'}</span>
        </li>
      ))}
    </ul>
  ) : (
    !loading && <p>No LUAS data available.</p>
  )}
</section>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';

// const LUAS_STOPS = {
//   red: [
//     { id: 73, name: 'Hinch Heuston' },
//     { id: 74, name: 'HCT Heuston' },
//     { id: 57, name: 'The Point' },
//     { id: 56, name: 'Spencer Dock' },
//     { id: 55, name: 'Mayor Square - NCI' },
//     { id: 54, name: "George's Dock" },
//     { id: 23, name: 'Connolly' },
//     { id: 22, name: 'Busáras' },
//     { id: 21, name: 'Abbey Street' },
//     { id: 20, name: 'Jervis' },
//     { id: 19, name: 'Four Courts' },
//     { id: 18, name: 'Smithfield' },
//     { id: 17, name: 'Museum' },
//     { id: 16, name: 'Heuston' },
//     { id: 15, name: "James's" },
//     { id: 14, name: 'Fatima' },
//     { id: 13, name: 'Rialto' },
//     { id: 12, name: 'Suir Road' },
//     { id: 11, name: 'Goldenbridge' },
//     { id: 10, name: 'Drimnagh' },
//     { id: 9, name: 'Blackhorse' },
//     { id: 8, name: 'Bluebell' },
//     { id: 7, name: 'Kylemore' },
//     { id: 6, name: 'Red Cow' },
//     { id: 5, name: 'Kingswood' },
//     { id: 4, name: 'Belgard' },
//     { id: 3, name: 'Cookstown' },
//     { id: 2, name: 'Hospital' },
//     { id: 1, name: 'Tallaght' },
//     { id: 49, name: 'Fettercairn' },
//     { id: 50, name: 'Cheeverstown' },
//     { id: 51, name: 'Citywest Campus' },
//     { id: 52, name: 'Fortunestown' },
//     { id: 53, name: 'Saggart' },
//   ],
//   green: [
//     { id: 72, name: "St. Stephen's Green" },
//     { id: 71, name: 'Broombridge' },
//     { id: 70, name: 'Cabra' },
//     { id: 69, name: 'Phibsborough' },
//     { id: 68, name: 'Grangegorman' },
//     { id: 67, name: 'Broadstone - University' },
//     { id: 66, name: 'Dominick' },
//     { id: 65, name: 'Parnell' },
//     { id: 64, name: "O'Connell - Upper" },
//     { id: 63, name: "O'Connell GPO" },
//     { id: 62, name: 'Marlborough' },
//     { id: 61, name: 'Westmoreland' },
//     { id: 60, name: 'Trinity' },
//     { id: 59, name: 'Dawson' },
//     { id: 24, name: "St. Stephen's Green" },
//     { id: 25, name: 'Harcourt' },
//     { id: 26, name: 'Charlemont' },
//     { id: 27, name: 'Ranelagh' },
//     { id: 28, name: 'Beechwood' },
//     { id: 29, name: 'Cowper' },
//     { id: 30, name: 'Milltown' },
//     { id: 31, name: 'Windy Arbour' },
//     { id: 32, name: 'Dundrum' },
//     { id: 33, name: 'Balally' },
//     { id: 34, name: 'Kilmacud' },
//     { id: 35, name: 'Stillorgan' },
//     { id: 36, name: 'Sandyford' },
//     { id: 37, name: 'Central Park' },
//     { id: 38, name: 'Glencairn' },
//     { id: 39, name: 'The Gallops' },
//     { id: 40, name: 'Leopardstown Valley' },
//     { id: 42, name: 'Ballyogan Wood' },
//     { id: 43, name: 'Racecourse' },
//     { id: 44, name: 'Carrickmines' },
//     { id: 45, name: 'Brennanstown' },
//     { id: 46, name: 'Laughabstown' },
//   ]
// };

// async function fetchLuasData(stopId) {
//   const res = await fetch(`/api/luas?stopId=${stopId}`, { cache: 'no-store' });
//   if (!res.ok) throw new Error('Failed to fetch LUAS data');
//   return res.json();
// }

// export default function LuasLiveData() {
//   const [stopId, setStopId] = useState(15);
//   const [luasData, setLuasData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   async function refreshLuasData() {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchLuasData(stopId);
//       setLuasData(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch LUAS data');
//     }
//     setLoading(false);
//   }

//   useEffect(() => {
//     refreshLuasData();
//   }, [stopId]);

//   return (
//     <section className="p-4 bg-white/80 backdrop-blur-lg rounded-xl mt-6 text-white max-w-3xl mx-auto text-center transition-all duration-500">
//       <h2 className="text-xl font-semibold mb-2 text-center">
//         Live LUAS Stop Data
//       </h2>

//       <select
//         className="mb-4 p-2 rounded bg-gray-800 text-white"
//         value={stopId}
//         onChange={(e) => setStopId(e.target.value)}
//       >
//         <optgroup label="🚋 Red Line">
//           {LUAS_STOPS.red.map((stop) => (
//             <option key={stop.id} value={stop.id}>
//               {stop.name}
//             </option>
//           ))}
//         </optgroup>
//         <optgroup label="🍀 Green Line">
//           {LUAS_STOPS.green.map((stop) => (
//             <option key={stop.id} value={stop.id}>
//               {stop.name}
//             </option>
//           ))}
//         </optgroup>
//       </select>

//       <button
//         onClick={refreshLuasData}
//         disabled={loading}
//         className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:scale-105 transform transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? 'Refreshing...' : 'Refresh LUAS Data'}
//       </button>

//       {error && <p className="text-red-600 mb-2">{error}</p>}

//       {luasData ? (
//         <ul className="text-sm max-h-80 overflow-auto">
//           {luasData.tableData.map((row, idx) => (
//             <li key={idx} className="border-b border-gray-300 py-1">
//               {row.join(' | ')}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         !loading && <p>No LUAS data available.</p>
//       )}
//     </section>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';

// const LUAS_STOPS = [
//   { id: 73, name: 'Hinch Heuston' },
//   { id: 74, name: 'HCT Heuston' },
//   { id: 57, name: 'The Point' },
//   { id: 56, name: 'Spencer Dock' },
//   { id: 55, name: 'Mayor Square - NCI' },
//   { id: 54, name: "George's Dock" },
//   { id: 23, name: 'Connolly' },
//   { id: 22, name: 'Busáras' },
//   { id: 21, name: 'Abbey Street' },
//   { id: 20, name: 'Jervis' },
//   { id: 19, name: 'Four Courts' },
//   { id: 18, name: 'Smithfield' },
//   { id: 17, name: 'Museum' },
//   { id: 16, name: 'Heuston' },
//   { id: 15, name: "James's" },
//   { id: 14, name: 'Fatima' },
//   { id: 13, name: 'Rialto' },
//   { id: 12, name: 'Suir Road' },
//   { id: 11, name: 'Goldenbridge' },
//   { id: 10, name: 'Drimnagh' },
//   { id: 9, name: 'Blackhorse' },
//   { id: 8, name: 'Bluebell' },
//   { id: 7, name: 'Kylemore' },
//   { id: 6, name: 'Red Cow' },
//   { id: 5, name: 'Kingswood' },
//   { id: 4, name: 'Belgard' },
//   { id: 3, name: 'Cookstown' },
//   { id: 2, name: 'Hospital' },
//   { id: 1, name: 'Tallaght' },
//   { id: 49, name: 'Fettercairn' },
//   { id: 50, name: 'Cheeverstown' },
//   { id: 51, name: 'Citywest Campus' },
//   { id: 52, name: 'Fortunestown' },
//   { id: 53, name: 'Saggart' },
//   { id: 72, name: "St. Stephen's Green" },
//   { id: 71, name: 'Broombridge' },
//   { id: 70, name: 'Cabra' },
//   { id: 69, name: 'Phibsborough' },
//   { id: 68, name: 'Grangegorman' },
//   { id: 67, name: 'Broadstone - University' },
//   { id: 66, name: 'Dominick' },
//   { id: 65, name: 'Parnell' },
//   { id: 64, name: "O'Connell - Upper" },
//   { id: 63, name: "O'Connell GPO" },
//   { id: 62, name: 'Marlborough' },
//   { id: 61, name: 'Westmoreland' },
//   { id: 60, name: 'Trinity' },
//   { id: 59, name: 'Dawson' },
//   { id: 24, name: "St. Stephen's Green" },
//   { id: 25, name: 'Harcourt' },
//   { id: 26, name: 'Charlemont' },
//   { id: 27, name: 'Ranelagh' },
//   { id: 28, name: 'Beechwood' },
//   { id: 29, name: 'Cowper' },
//   { id: 30, name: 'Milltown' },
//   { id: 31, name: 'Windy Arbour' },
//   { id: 32, name: 'Dundrum' },
//   { id: 33, name: 'Balally' },
//   { id: 34, name: 'Kilmacud' },
//   { id: 35, name: 'Stillorgan' },
//   { id: 36, name: 'Sandyford' },
//   { id: 37, name: 'Central Park' },
//   { id: 38, name: 'Glencairn' },
//   { id: 39, name: 'The Gallops' },
//   { id: 40, name: 'Leopardstown Valley' },
//   { id: 42, name: 'Ballyogan Wood' },
//   { id: 43, name: 'Racecourse' },
//   { id: 44, name: 'Carrickmines' },
//   { id: 45, name: 'Brennanstown' },
//   { id: 46, name: 'Laughabstown' },
// ];

// async function fetchLuasData(stopId) {
//   const res = await fetch(`/api/luas?stopId=${stopId}`, { cache: 'no-store' });
//   if (!res.ok) throw new Error('Failed to fetch LUAS data');
//   return res.json();
// }

// export default function LuasLiveData() {
//   const [stopId, setStopId] = useState(15);
//   const [luasData, setLuasData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   async function refreshLuasData() {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchLuasData(stopId);
//       setLuasData(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch LUAS data');
//     }
//     setLoading(false);
//   }

//   useEffect(() => {
//     refreshLuasData();
//   }, [stopId]);

//   return (
//     <section className="p-4 bg-white/80 backdrop-blur-lg rounded-xl mt-6 text-white max-w-3xl mx-auto text-center transition-all duration-500">
//       <h2 className="text-xl font-semibold mb-2 text-center">
//         Live LUAS Stop Data
//       </h2>

//       <select
//         className="mb-4 p-2 rounded bg-gray-800 text-white"
//         value={stopId}
//         onChange={(e) => setStopId(e.target.value)}
//       >
//         {LUAS_STOPS.map((stop) => (
//           <option key={stop.id} value={stop.id}>
//             {stop.name}
//           </option>
//         ))}
//       </select>

//       <button
//         onClick={refreshLuasData}
//         disabled={loading}
//         className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:scale-105 transform transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? 'Refreshing...' : 'Refresh LUAS Data'}
//       </button>

//       {error && <p className="text-red-600 mb-2">{error}</p>}

//       {luasData ? (
//         <ul className="text-sm max-h-80 overflow-auto">
//           {luasData.tableData.map((row, idx) => (
//             <li key={idx} className="border-b border-gray-300 py-1">
//               {row.join(' | ')}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         !loading && <p>No LUAS data available.</p>
//       )}
//     </section>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';

// const stops = [
//   { id: 15, name: "James's" },
//   { id: 16, name: 'Heuston' },
//   { id: 17, name: 'Museum' },
//   { id: 18, name: 'Smithfield' },
//   { id: 19, name: 'Four Courts' },
//   { id: 20, name: 'Jervis' },
//   { id: 21, name: 'Abbey Street' },
//   // ... Add all the other stops here
// ];

// async function fetchLuasData(stopId) {
//   const res = await fetch(`/api/luas?stopId=${stopId}`, { cache: 'no-store' });
//   if (!res.ok) throw new Error('Failed to fetch LUAS data');
//   return res.json();
// }

// export default function LuasLiveData() {
//   const [stopId, setStopId] = useState(15);
//   const [luasData, setLuasData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   async function refreshLuasData() {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchLuasData(stopId);
//       setLuasData(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch LUAS data');
//     }
//     setLoading(false);
//   }

//   useEffect(() => {
//     refreshLuasData();
//   }, [stopId]);

//   return (
//     <section className="p-4 bg-white/30 backdrop-blur-md rounded-xl mt-6 text-white max-w-3xl mx-auto text-center">
//       <h2 className="text-xl font-semibold mb-2">Live LUAS Stop Data</h2>

//       {/* Stop Selector */}
//       <select
//         value={stopId}
//         onChange={(e) => setStopId(Number(e.target.value))}
//         className="mb-4 px-3 py-2 rounded text-black"
//       >
//         {stops.map((stop) => (
//           <option key={stop.id} value={stop.id}>
//             {stop.name}
//           </option>
//         ))}
//       </select>

//       {/* Refresh Button */}
//       <button
//         onClick={refreshLuasData}
//         disabled={loading}
//         className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:scale-105 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
//       >
//         {loading ? 'Refreshing...' : 'Refresh LUAS Data'}
//       </button>

//       {error && <p className="text-red-600 mb-2">{error}</p>}

//       {luasData ? (
//         <ul className="text-sm max-h-80 overflow-auto">
//           {luasData.tableData.map((row, idx) => (
//             <li key={idx} className="border-b border-gray-300 py-1">
//               {row.join(' | ')}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         !loading && <p>No LUAS data available.</p>
//       )}
//     </section>
//   );
// }

// // 'use client';

// // import { useState, useRef, useEffect } from 'react';

// // async function fetchLuasData() {
// //   const res = await fetch('/api/luas', { cache: 'no-store' });
// //   if (!res.ok) throw new Error('Failed to fetch LUAS data');
// //   return res.json();
// // }

// // export default function LuasLiveData() {
// //   const [luasData, setLuasData] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [isOpen, setIsOpen] = useState(false); // toggle state
// //   const contentRef = useRef(null);

// //   async function refreshLuasData() {
// //     setLoading(true);
// //     setError(null);
// //     try {
// //       const data = await fetchLuasData();
// //       setLuasData(data);
// //     } catch (err) {
// //       setError(err.message || 'Failed to fetch LUAS data');
// //     }
// //     setLoading(false);
// //   }

// //   useEffect(() => {
// //     if (isOpen) {
// //       refreshLuasData();
// //     }
// //   }, [isOpen]);

// //   return (
// //     <section className="p-4 bg-white/40 backdrop-blur-md rounded-2xl mt-6 text-white max-w-3xl mx-auto text-center">
// //       <h2 className="text-xl font-semibold mb-2">Live LUAS Stop Data from St. James's Luas Stop</h2>

// //       <button
// //         onClick={() => setIsOpen(!isOpen)}
// //         className="mb-4 px-4 py-2 bg-gray-700 text-white rounded transform transition-transform duration-300 hover:scale-105 focus:outline-none"
// //         aria-expanded={isOpen}
// //         aria-controls="luas-data-content"
// //       >
// //         {isOpen ? 'Hide LUAS Data' : 'Show LUAS Data'}
// //       </button>

// //       <div
// //         id="luas-data-content"
// //         ref={contentRef}
// //         style={{
// //           maxHeight: isOpen ? (contentRef.current?.scrollHeight ?? 0) + 'px' : '0px',
// //           overflow: 'hidden',
// //           transition: 'max-height 0.5s ease',
// //         }}
// //       >
// //         {isOpen && (
// //           <>
// //             <button
// //               onClick={refreshLuasData}
// //               disabled={loading}
// //               className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transform transition-transform duration-300 hover:scale-105"
// //             >
// //               {loading ? 'Refreshing...' : 'Refresh LUAS Data'}
// //             </button>

// //             {error && <p className="text-red-600 mb-2">{error}</p>}

// //             {luasData ? (
// //               <ul className="text-sm max-h-80 overflow-auto border border-gray-300 rounded p-2">
// //                 {luasData.tableData.map((row, idx) => (
// //                   <li key={idx} className="border-b border-gray-300 py-1 last:border-b-0">
// //                     {row.join(' | ')}
// //                   </li>
// //                 ))}
// //               </ul>
// //             ) : (
// //               !loading && <p>No LUAS data available.</p>
// //             )}
// //           </>
// //         )}
// //       </div>
// //     </section>
// //   );
// // }