'use client';

import React, { useEffect, useState } from 'react';

export default function CityTextSlideshow({ cityName, imageUrls, collapsed = false }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [imageUrls]);

  // return (
  //   <div
  //     className={`w-full flex items-center justify-center overflow-hidden ${
  //       collapsed ? 'sidebar-collapsed' : ''
  //     }`}
  //   >
  //     <div className="relative text-center w-full">
  //       <div
  //         className={`${
  //           collapsed ? 'text-[24vw]' : 'text-[18vw]'
  //         } font-extrabold lowercase leading-none w-full max-w-none transition-all duration-700`}
  //         style={{
  //           backgroundImage: `url(${imageUrls[index]})`,
  //           WebkitTextFillColor: 'transparent',
  //           WebkitBackgroundClip: 'text',
  //           backgroundClip: 'text',
  //           color: 'transparent',
  //           backgroundSize: 'cover',
  //           backgroundPosition: 'center',
  //           wordSpacing: collapsed ? '2rem' : 'normal',
  //         }}
  //       >
  //         {cityName.split('').map((char, index) => (
  //           <span
  //             key={index}
  //             className="inline-block transition-transform duration-200 hover:scale-125"
  //           >
  //             {char}
  //           </span>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div
      className={`w-full flex items-center justify-center overflow-hidden ${
        collapsed ? 'sidebar-collapsed' : ''
      }`}
    >
      <div className="relative text-center w-full">
        <div
          className={`${
            collapsed ? 'text-[24vw]' : 'text-[18vw]'
          } font-extrabold lowercase leading-none w-full max-w-none transition-all duration-700`}
          style={{
            fontFamily: '"Playfair Display", serif',
            backgroundImage: `url(${imageUrls[index]})`,
            WebkitTextFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            wordSpacing: collapsed ? '2rem' : 'normal',
          }}
        >
          {cityName}
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { cities } from './citycoord';
// const imageUrls = [
//   '/images/dublin.jpg',
//   '/images/dublin2.jpg',
//   '/images/dublin3.jpg',
//   '/images/dublin5.jpg',
// ];

// export default function ImageTextSlideshow({ collapsed = false }) {
//   const [index, setIndex] = useState(0);

//   // Cycle through images every 3 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIndex((prev) => (prev + 1) % imageUrls.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div
//       className={`w-full flex items-center justify-center overflow-hidden ${
//         collapsed ? 'sidebar-collapsed' : ''
//       }`}
//     >
//       <div className="relative text-center w-full">
//         <div
//           className={`${
//             collapsed ? 'text-[14vw]' : 'text-[10vw]'
//           } font-extrabold uppercase leading-none bg-white w-full max-w-none transition-all duration-700`}
//           style={{
//             backgroundImage: `url(${imageUrls[index]})`,
//             WebkitTextFillColor: 'transparent',
//             WebkitBackgroundClip: 'text',
//             backgroundClip: 'text',
//             color: 'transparent',
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             wordSpacing: collapsed ? '2rem' : 'normal',
//           }}
//         >
//           {cities}
//         </div>
//       </div>
//     </div>
//   );
// }