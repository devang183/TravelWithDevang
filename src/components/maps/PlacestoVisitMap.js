// 'use client';

// import { useState } from 'react';
// import { ChevronDown, ChevronRight } from 'lucide-react';

// export default function CityPlacesMap({ cityName, mapEmbedUrl }) {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="mt-6 w-full bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
//       <div
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex justify-center items-center gap-2 px-4 py-3 cursor-pointer bg-blue-100 hover:bg-blue-200 transition"
//       >
//         <span className="font-bold text-blue-800 text-center">
//           {isOpen ? `${cityName} Places to Visit` : `Show Places to Visit in ${cityName}`}
//         </span>
//         {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//       </div>

//       {isOpen && (
//         <div className="p-4 bg-white">
//           <div
//             style={{
//               position: 'relative',
//               paddingBottom: '56.25%',
//               height: 0,
//               overflow: 'hidden',
//               borderRadius: '12px',
//             }}
//           >
//             <iframe
//               src={mapEmbedUrl}
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 border: 0,
//               }}
//               loading="lazy"
//               title={`${cityName} Places to Visit Map`}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }