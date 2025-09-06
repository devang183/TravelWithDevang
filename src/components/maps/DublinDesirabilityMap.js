'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
export default function DublinLivingMap() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6 w-full rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/10">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md transition"
      >
        <span className="font-medium text-white text-center">
          {isOpen ? 'Living Desirability Map of Dublin' : 'Show Living Desirability Map of Dublin'}
        </span>
        {isOpen ? <ChevronDown className="h-4 w-4 text-white" /> : <ChevronRight className="h-4 w-4 text-white" />}
      </div>

      {isOpen && (
        <div className="p-4">
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: '12px',
            }}
          >
            <iframe
              src="https://www.google.com/maps/d/embed?mid=12P4oVY7A4w538meuFJUEEuMIJ1paCuE8&ehbc=2E312F"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              loading="lazy"
              title="Dublin Living Desirability Map"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// // components/DublinLivingMap.js
// export default function DublinLivingMap() {
//     return (
//       <div
//         style={{
//           position: 'relative',
//           paddingBottom: '56.25%', // 16:9 aspect ratio
//           height: 0,
//           overflow: 'hidden',
//           borderRadius: '12px',
//           marginBottom: '1.5rem',
//         }}
//       >
//         <iframe
//           src="https://www.google.com/maps/d/embed?mid=12P4oVY7A4w538meuFJUEEuMIJ1paCuE8&ehbc=2E312F"
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             border: 0,
//           }}
//           loading="lazy"
//           title="Dublin Living Desirability Map"
//         />
//       </div>
//     );
//   }