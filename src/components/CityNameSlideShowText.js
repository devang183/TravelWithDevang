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
      <style jsx>{`
        .city-name-container {
          position: relative;
          display: inline-block;
        }

        .city-name-stroke {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          -webkit-text-stroke: 4px rgba(255, 255, 255, 0.9);
          text-stroke: 4px rgba(255, 255, 255, 0.9);
          z-index: 1;
        }

        .city-name-shadow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.9))
                  drop-shadow(0 10px 20px rgba(0, 0, 0, 0.7))
                  drop-shadow(0 15px 30px rgba(0, 0, 0, 0.5));
          z-index: 2;
        }

        .city-name-fill {
          position: relative;
          z-index: 3;
        }

        .letter-hover {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .letter-hover:hover {
          transform: scale(1.15);
        }
      `}</style>
      <div className="relative text-center w-full">
        <div className="city-name-container">
          {/* White stroke layer */}
          <div
            className={`city-name-stroke ${
              collapsed ? 'text-[24vw]' : 'text-[18vw]'
            } font-extrabold lowercase leading-none w-full max-w-none transition-all duration-700`}
            style={{
              fontFamily: '"Playfair Display", serif',
              wordSpacing: collapsed ? '2rem' : 'normal',
              color: 'transparent',
            }}
          >
            {cityName}
          </div>

          {/* Shadow layer */}
          <div
            className={`city-name-shadow ${
              collapsed ? 'text-[24vw]' : 'text-[18vw]'
            } font-extrabold lowercase leading-none w-full max-w-none transition-all duration-700`}
            style={{
              fontFamily: '"Playfair Display", serif',
              wordSpacing: collapsed ? '2rem' : 'normal',
              color: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {cityName}
          </div>

          {/* Image fill layer with interactive letters */}
          <div
            className={`city-name-fill ${
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
            {cityName.split('').map((char, idx) => (
              <span key={idx} className="letter-hover">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
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