'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function DublinArcGISMap() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load ArcGIS embeddable components script once
    const existingScript = document.querySelector(
      'script[src="https://js.arcgis.com/embeddable-components/4.33/arcgis-embeddable-components.esm.js"]'
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src =
        'https://js.arcgis.com/embeddable-components/4.33/arcgis-embeddable-components.esm.js';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="mt-6 w-full rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/10">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md transition"
      >
        <span className="font-medium text-white text-center">
          {isOpen ? 'Comprehensive ArcGIS Map of Dublin' : 'Show ArcGIS Map of Dublin'}
        </span>
        {isOpen ? <ChevronDown className="h-4 w-4 text-white" /> : <ChevronRight className="h-4 w-4 text-white" />}
      </div>

      {isOpen && (
        <div className="p-4">
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: '12px',
            }}
          >
            <arcgis-embedded-map
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              item-id="0ec43522108c4a72a869594261fb8cc7"
              theme="light"
              heading-enabled="true"
              legend-enabled="true"
              share-enabled="true"
              center="-6.260113,53.349751293223385"
              scale="150000"
              portal-url="https://www.arcgis.com"
            ></arcgis-embedded-map>
          </div>
        </div>
      )}
    </div>
  );
}


// 'use client';

// import { useState } from 'react';

// export default function ArcGISMap() {
//   const [isVisible, setIsVisible] = useState(true);

//   return (
//     <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
//       <button onClick={() => setIsVisible((prev) => !prev)}>
//         {isVisible ? 'Hide Map' : 'Show Map'}
//       </button>

//       {isVisible && (
//         <div style={{ marginTop: '20px' }}>
//           <script
//             type="module"
//             src="https://js.arcgis.com/embeddable-components/4.33/arcgis-embeddable-components.esm.js"
//           ></script>

//           <arcgis-embedded-map
//             style={{ height: '600px', width: '700px' }}
//             item-id="0ec43522108c4a72a869594261fb8cc7"
//             theme="light"
//             heading-enabled="true"
//             legend-enabled="true"
//             share-enabled="true"
//             center="-6.260113,53.349751293223385"
//             scale="9027.977411"
//             portal-url="https://www.arcgis.com"
//           ></arcgis-embedded-map>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect } from 'react';

// export default function ArcGISMap() {
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.type = 'module';
//     script.src = 'https://js.arcgis.com/embeddable-components/4.33/arcgis-embeddable-components.esm.js';
//     document.head.appendChild(script);
//   }, []);

//   return (
//     <arcgis-embedded-map
//       style={{ height: '600px', width: '100%' }}
//       item-id="0ec43522108c4a72a869594261fb8cc7"
//       theme="light"
//       heading-enabled
//       legend-enabled
//       share-enabled
//       center="-6.260113,53.349751293223385"
//       scale="50000"
//       portal-url="https://www.arcgis.com">
//     </arcgis-embedded-map>
//   );
// }