// app/test-cities/[cityid]/[subpage]/page.js
"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import FourPhotosGrid from "@/components/ShowInitialPhotos";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { cities } from "@/components/citycoord";

// 🔹 Create a stable wrapper component that passes city data to DigitalGuestbookMap
const DigitalGuestbookMapWrapper = React.memo(({ cityid, city }) => {
  const DigitalGuestbookMap = dynamic(() => import("@/components/DigitalGuestBookMap"), { ssr: false });
  
  // Convert array coords [lat, lng] to object format { lat, lng }
  const cityCoords = useMemo(() => {
    return city?.coords ? {
      lat: city.coords[0],
      lng: city.coords[1]
    } : { lat: 53.3498, lng: -6.2603 }; // fallback to Dublin coords
  }, [city?.coords]);

  return (
    <DigitalGuestbookMap
      cityName={city?.name || cityid}
      cityCoords={cityCoords}
    />
  );
});

DigitalGuestbookMapWrapper.displayName = 'DigitalGuestbookMapWrapper';

const TaylorSwiftDashboardWrapper = React.memo(({ cityid }) => {
  const TaylorSwiftDashboard = dynamic(() => import("@/app/test-cities/scripts/taylorSwift"), { 
    ssr: false,
    loading: () => <div>Loading Reddit data for {cityid}...</div>
  });

  // Add error boundary and loading state
  return (
    <div className="p-4">
      <TaylorSwiftDashboard 
        cityred={cityid} 
        key={cityid} // Force re-render when city changes
      />
    </div>
  );
});

const IrelandAccommodationWrapper = React.memo(({ cityid }) => {
  const IrelandAccommodation = dynamic(() => import("@/components/IrelandAccommodation"), { 
    ssr: false,
    loading: () => <div>Loading Accomodation data for {cityid}...</div>
  });

  // Add error boundary and loading state
  return (
    <div className="p-4">
      <IrelandAccommodation 
        city={cityid} 
        key={cityid} // Force re-render when city changes
      />
    </div>
  );
});

// 🔹 Create component type constants to avoid recreating functions
const COMPONENT_TYPES = {
  TAYLOR_SWIFT_DASHBOARD: 'TAYLOR_SWIFT_DASHBOARD',
  GUESTBOOK_MAP: 'GUESTBOOK_MAP',
  DYNAMIC_IMPORT: 'DYNAMIC_IMPORT',
  IRELAND_ACCOMMODATION: 'IRELAND_ACCOMMODATION'
};

TaylorSwiftDashboardWrapper.displayName = 'TaylorSwiftDashboardWrapper';
IrelandAccommodationWrapper.displayName = 'IrelandAccommodationWrapper';

// 🔹 Register subpage components here with stable references
const subpageComponents = {
  dublin: {
    explore: [
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/maps/DublinDesirabilityMap"), { ssr: false })
      },
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ],
    travel: [
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("../LuasLiveData"), { ssr: false })
      },
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/maps/DublinBikesMap"), { ssr: false })
      },
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/maps/LazyDublinLiveBikesMap"), { ssr: false })
      }
    ],
    airbnb: [
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/maps/DublinarcGISMap"), { ssr: false })
      },
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/airbnb/Dublin/DublinMap"), { ssr: false })
      },
      {
        type: COMPONENT_TYPES.DUBLIN_ACCOMMODATION,
        component: (props) => <IrelandAccommodationWrapper {...props} cityid={cities.dublin.name} />
      }
    ],
    attractions:[
      {
        //CityAttractionsDublin is used in dynamic routing contexts
        //it's conditionally rendered via dynamic import to disable SSR (server-side rendering), 
        //which is required because it uses browser-only APIs like fetch and useState.
        //This ensures the component only loads on the client side, avoiding hydration mismatches.
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(()=>import("@/components/CityAttractionsDublin"),{ssr:false})
      }
    ],
    reddit:[
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/DublinEvents"), { ssr: false })
      },
      {
        type: COMPONENT_TYPES.TAYLOR_SWIFT_DASHBOARD,
        component: (props) => <TaylorSwiftDashboardWrapper {...props} cityid={cities.dublin.name} />
      }
    ]
  },
  newry: {
    explore:[
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ],
    reddit:[
      {
        type: COMPONENT_TYPES.TAYLOR_SWIFT_DASHBOARD,
        component: (props) => <TaylorSwiftDashboardWrapper {...props} cityid={cities.newry.name} />
      }
    ]
  },
  galway:{
    attractions:[
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(()=>import("@/components/CityAttractionsGalway"),{ssr:false})
      }
    ],
    explore:[
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      },
    ],
    reddit:[
      {
        type: COMPONENT_TYPES.TAYLOR_SWIFT_DASHBOARD,
        component: (props) => <TaylorSwiftDashboardWrapper {...props} cityid={cities.galway.name} />
      }
    ],
    airbnb:[
      {
        type: COMPONENT_TYPES.DUBLIN_ACCOMMODATION,
        component: (props) => <IrelandAccommodationWrapper {...props} cityid={cities.galway.name} />
      }
    ]
  },
  london: {
    explore: [
      // {
      //   type: COMPONENT_TYPES.DYNAMIC_IMPORT,
      //   component: dynamic(() => import("@/components/maps/DublinDesirabilityMap"), { ssr: false })
      // },
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ],
    travel: [
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      },
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/maps/LazyDublinLiveBikesMap"), { ssr: false })
      }
    ],
    airbnb: [
      // {
      //   type: COMPONENT_TYPES.DYNAMIC_IMPORT,
      //   component: dynamic(() => import("@/components/maps/DublinarcGISMap"), { ssr: false })
      // },
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(() => import("@/components/airbnb/London/LondonMap"), { ssr: false })
      }
    ],
    reddit:[
      {
        type: COMPONENT_TYPES.TAYLOR_SWIFT_DASHBOARD,
        component: (props) => <TaylorSwiftDashboardWrapper {...props} cityid={cities.london.name} />
      }
    ]
  },
  manchester:{
    explore:[
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ],
    airbnb:[
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(()=>import("@/components/airbnb/Manchester/ManchesterMap"),{ssr:false})
      }
    ],
    reddit:[
      {
        type: COMPONENT_TYPES.TAYLOR_SWIFT_DASHBOARD,
        component: (props) => <TaylorSwiftDashboardWrapper {...props} cityid={cities.manchester.name} />
      }
    ]
  },
  newyork:{
    explore:[
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ],
    airbnb:[
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(()=>import("@/components/airbnb/NewYork/NewyorkMap"),{ssr:false})
      }
    ],
    reddit:[
      {
        type: COMPONENT_TYPES.TAYLOR_SWIFT_DASHBOARD,
        component: (props) => <TaylorSwiftDashboardWrapper {...props} cityid={cities.newyork.name} />
      }
    ]
  },
  chicago:{
    explore:[
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ],
    travel:[
      {
        type: COMPONENT_TYPES.DYNAMIC_IMPORT,
        component: dynamic(()=>import("@/components/airbnb/Manchester/ManchesterMap"),{ssr:false})
      },
      {
        type:COMPONENT_TYPES.DYNAMIC_IMPORT,
        component:dynamic(()=>import("@/components/airbnb/Dublin/DublinMap"),{ssr:false})
      }
    ],
    reddit:[
      {
        type: COMPONENT_TYPES.TAYLOR_SWIFT_DASHBOARD,
        component: (props) => <TaylorSwiftDashboardWrapper {...props} cityid={cities.chicago.name} />
      }
    ]
  },
  nagpur: {
    explore: [
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ]
  },
  bengaluru: {
    explore: [
      {
        type: COMPONENT_TYPES.GUESTBOOK_MAP,
        component: DigitalGuestbookMapWrapper
      }
    ]
  },
};

export default function CitySubPage({ params }) {
  // ✅ unwrap params promise
  const { cityid, subpage } = React.use(params);
  const city = cities[cityid.toLowerCase()];
  
  // ✅ look up component
  const CityComponents = subpageComponents[cityid]?.[subpage];

  return (
    <div className="p-4">
      <Breadcrumb cityid={cityid} city={city} subpage={subpage} />
      <h1 className="text-xl text-center font-extrabold capitalize">
        {cityid} – {subpage}
      </h1>
      
      {/* Render components */}
      <div className="mt-4 space-y-12">
        {CityComponents ? (
          CityComponents.map((compConfig, i) => {
            const Comp = compConfig.component;
            return (
              <div key={`${cityid}-${subpage}-${i}`} className="bg-white/10 p-4 rounded-2xl shadow-lg">
                {compConfig.type === COMPONENT_TYPES.GUESTBOOK_MAP ? (
                  <Comp cityid={cityid} city={city} />
                ) : (
                  <Comp />
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-600">Content not found</p>
        )}
      </div>
      
      <br/>
      <FourPhotosGrid />
      <Link href={`/test-cities/${cityid}`} className="text-blue-600 hover:underline mb-4 block">
        ← Back to {cityid}
      </Link>
    </div>
  );
}

// // app/test-cities/[cityid]/[subpage]/page.js
// "use client";

// import React from "react";
// import dynamic from "next/dynamic";
// import FourPhotosGrid from "@/components/ShowInitialPhotos";
// import Link from "next/link";
// import Breadcrumb from "@/components/Breadcrumb";
// import { cities } from "@/components/citycoord";
// import DigitalGuestbookMap from "@/components/DigitalGuestBookMap";
// // 🔹 Register subpage components here
// const subpageComponents = {
//   dublin: {
//     explore: [dynamic(() => import("@/components/maps/DublinDesirabilityMap"), { ssr: false })],
//     travel: [
//       dynamic(() => import("../LuasLiveData"), { ssr: false }),
//       dynamic(() => import("@/components/maps/DublinBikesMap"), { ssr: false }),
//       dynamic(() => import("@/components/maps/DublinLiveBikesMap"), { ssr: false })
//     ],
//     airbnb: [
//       dynamic(() => import("@/components/maps/DublinarcGISMap"), { ssr: false }),
//       dynamic(() => import("@/components/airbnb/Dublin/DublinMap"), { ssr: false })
//     ],
//   },
//   'london-2024':{
//     explore: [dynamic(() => import("@/components/maps/DublinDesirabilityMap"), { ssr: false })],
//     travel: [
//       dynamic(() => import("@/components/DigitalGuestBookMap"), { ssr: false })
//       // dynamic(() => import("../LuasLiveData"), { ssr: false }),
//       // dynamic(() => import("@/components/maps/DublinBikesMap"), { ssr: false }),
//       // dynamic(() => import("@/components/maps/DublinLiveBikesMap"), { ssr: false })
//     ],
//     airbnb: [
//       dynamic(() => import("@/components/maps/DublinarcGISMap"), { ssr: false }),
//       dynamic(() => import("@/components/airbnb/London/LondonMap"), { ssr: false })
//     ],
//   },
//   'london-2025':{
//     explore: [dynamic(() => import("@/components/maps/DublinDesirabilityMap"), { ssr: false })],
//     travel: [
//       dynamic(() => import("../LuasLiveData"), { ssr: false }),
//       dynamic(() => import("@/components/maps/DublinBikesMap"), { ssr: false }),
//       dynamic(() => import("@/components/maps/DublinLiveBikesMap"), { ssr: false })
//     ],
//     airbnb: [
//       dynamic(() => import("@/components/maps/DublinarcGISMap"), { ssr: false }),
//       dynamic(() => import("@/components/airbnb/London/LondonMap"), { ssr: false })
//     ],
//   }
// };

// export default function CitySubPage({ params }) {
//   // ✅ unwrap params promise
//   const { cityid, subpage } = React.use(params);
//   const city = cities[cityid.toLowerCase()];

//   // ✅ look up component
//   const CityComponents = subpageComponents[cityid]?.[subpage];

//   return (
    
//     <div className="p-4">
//       <Breadcrumb cityid={cityid} city={city} subpage={subpage} />
//       <h1 className="text-xl text-center font-extrabold capitalize">
//         {cityid} – {subpage}
//       </h1>
//       {/* IF THERE ARE MORE THAN 2 ITEMS IN travel (see above) */}
//       <div className="mt-4 space-y-12">
//         {CityComponents ? (
//           CityComponents.map((Comp, i) => (
//             <div key={i} className="bg-white/10 p-4 rounded-2xl shadow-lg">
//               {/* <h3 className="text-xl font-semibold mb-4">
//                 {i === 0 ? "Dublin Bikes" : "Dublin Travel"}
//               </h3> */}
//               <Comp />
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-600">Content not found</p>
//         )}
//       </div>
//       {/* <div className="mt-4">
//         {CityComponent ? (
//           <CityComponent />
//         ) : (
//           <p className="text-gray-600">Content not found</p>
//         )}
//       </div> */}
//       <br/>
//       <FourPhotosGrid />

//       <Link href={`/test-cities/${cityid}`} className="text-blue-600 hover:underline mb-4 block">
//          ← Back to {cityid}
//       </Link>
//     </div>
//   );
// }