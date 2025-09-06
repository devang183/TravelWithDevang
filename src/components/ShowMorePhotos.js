'use client';

import { useState, useEffect } from 'react';
import { photos } from '@/app/test-cities/CityPhotos';

export default function ShowPhotos({ images = []}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Get current index of selected image
  const currentIndex = selectedImage ? images.indexOf(selectedImage) : -1;

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % images.length;
        setSelectedImage(images[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setSelectedImage(images[prevIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex, images]);

  return (
    <div className="my-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 mb-4 rounded-2xl text-white shadow-2xl overflow-hidden backdrop-blur-md bg-white/10 hover:bg-white/30"
      >
        {isOpen ? 'Hide Photos' : 'Show More Photos'}
      </button>

      {isOpen && (
        <>
          <div className="flex flex-wrap justify-between gap-4">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Photo ${index + 1}`}
                className="w-[23%] rounded shadow transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer"
                onClick={() => setSelectedImage(src)}
              />
            ))}
          </div>
        </>
      )}
      {/* {isOpen && (
        <div className="flex flex-wrap justify-between gap-4">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Photo ${index + 1}`}
              className="w-[23%] rounded shadow transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(src)}
            />
          ))}
        </div>
      )} */}

      {/* Lightbox popup */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-3xl max-h-[90vh] p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="rounded-lg shadow-lg max-h-[80vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { photos } from '@/app/test-cities/CityPhotos';

// export default function ShowPhotos({ images = [] }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);

//   return (
//     <div className="my-6">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="px-4 py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//       >
//         {isOpen ? 'Hide Photos' : 'Show More Photos'}
//       </button>

//       {isOpen && (
//         <div className="flex flex-wrap justify-between gap-4">
//           {images.map((src, index) => (
//             <img
//               key={index}
//               src={src}
//               alt={`Photo ${index + 1}`}
//               className="w-[23%] rounded shadow transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer"
//               onClick={() => setSelectedImage(src)}
//             />
//           ))}
//         </div>
//       )}

//       {/* Lightbox popup */}
//       {selectedImage && (
//         <div
//           className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
//           onClick={() => setSelectedImage(null)}
//         >
//           <div
//             className="max-w-3xl max-h-[90vh] p-2 relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <img
//               src={selectedImage}
//               alt="Enlarged view"
//               className="rounded-lg shadow-lg max-h-[80vh] object-contain"
//             />
//             <button
//               className="absolute top-4 right-4 text-white text-3xl font-bold"
//               onClick={() => setSelectedImage(null)}
//             >
//               &times;
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// 'use client';

// import { useState } from 'react';
// import { photos } from '@/app/test-cities/CityPhotos';
// export default function ShowPhotos({images=[]}) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedImage, setSelectedImage]=useState(null);
//   return (
//     <div className="my-6">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="px-4 py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//       >
//         {isOpen ? 'Hide Photos' : 'Show More Photos'}
//       </button>

//       {isOpen && (
//         <div className="flex flex-wrap justify-between gap-4">
//           {images.map((src, index) => (
//             <img
//               key={index}
//               src={src}
//               alt={`Photo ${index + 1}`}
//               className="w-[23%] rounded shadow transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
//               onClick={() => setSelectedImage(src)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// import { photos } from "@/app/test-cities/CityPhotos";
// export default function FourPhotosGrid() {
//     // const photos=[
//     //     '/images/dublin.jpg',
//     //     '/images/dublin.jpg',
//     //     '/images/dublin.jpg',
//     //     '/images/dublin.jpg',
//     // ];
//     return (
//       <div className="grid grid-cols-4 gap-4 rounded-lg mb-4 w-full">
//         {photos.map((src, i) => (
//           <img key={i} src={src} alt={`Photo ${i + 1}`} className="rounded" />
//         ))}
//       </div>
//     );
//   }

// "use client";
// import Masonry from 'react-masonry-css';

// export default function MasonryGallery({ photos }) {
//   // photos is an array of { src, alt } objects

//   // Breakpoint cols for responsive design
//   const breakpointColumnsObj = {
//     default: 4, // 4 columns on wide screens
//     1100: 3,
//     700: 2,
//     500: 1,
//   };

//   return (
//     <Masonry
//       breakpointCols={breakpointColumnsObj}
//       className="my-masonry-grid"
//       columnClassName="my-masonry-grid_column"
//     >
//       {photos.map((photo, i) => (
//         <img
//           key={i}
//           src={photo.src}
//           alt={photo.alt || 'City photo'}
//           loading="lazy"
//           className="rounded-lg mb-4 w-full"
//           style={{ width: '100%', display: 'block' }}
//         />
//       ))}
//       <style jsx>{`
//         .my-masonry-grid {
//           display: flex;
//           margin-left: -16px; /* gutter size offset */
//           width: auto;
//         }
//         .my-masonry-grid_column {
//           padding-left: 16px; /* gutter size */
//           background-clip: padding-box;
//         }
//         /* Style your images */
//         img {
//           border-radius: 12px;
//           margin-bottom: 6px;
//           width: 100%;
//           display: block;
//         //   object-fit: cover;
//         }
//       `}</style>
      
//     </Masonry>
//   );
// }