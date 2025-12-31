// components/maps/CityMapConfig.js
// import { DublinCityWomenBeautyMDBData } from "@/app/test-cities/scripts/Dublin/WomenBeauty/DublinCityWomenBeautyMDBData";
import nagpurpolicepins from '@/app/test-cities/scripts/Nagpur/Police/nagpur-police-pins.json'
import belfastcitypins from '@/app/test-cities/scripts/Belfast/sample.json'
//import londonpins, { LondonCityData } from '@/app/test-cities/scripts/London/sample.js'
import dublincitypins from '@/app/test-cities/scripts/Dublin/sample.json'
import londoncitypins from '@/app/test-cities/scripts/London/data_half_restaurants.json'
// import { NagpurCityATMMDBData } from "@/app/test-cities/scripts/Nagpur/ATMs/NagpurCityATMMDBData";
// import { NagpurCitypoliceMDBData } from "@/app/test-cities/scripts/Nagpur/Police/NagpurCitypoliceMDBData";
import { m } from "framer-motion";
import malahidecitypins from "@/app/test-cities/scripts/Malahide/sample";
import { luasStops } from '@/app/test-cities/scripts/luasdetails/luasStops';
import { DublinCityATMData } from '@/app/test-cities/scripts/Dublin/DublinATMs/DublinCityATMData';
import { DublinCityBookstoreData } from '@/app/test-cities/scripts/Dublin/Bookstores/DublinCityBookstoreData';
import { DublinCityCafeData } from '@/app/test-cities/scripts/Dublin/Cafes/DublinCityCafeData';
import { DublinCityRestaurantData } from '@/app/test-cities/scripts/Dublin/Restaurants/DublinCityRestaurantData';
import { DublinCityArtData } from '@/app/test-cities/scripts/Dublin/Artworks/DublinCityArtData';
import { DublinCityPintData } from '@/app/test-cities/scripts/Dublin/Pints/DublinCityPintData';
import { DublinCityIcecreamData } from '@/app/test-cities/scripts/Dublin/Icecreams/DublinCityIcecreamData';
import { DublinCityMuseumData } from '@/app/test-cities/scripts/Dublin/Museums/DublinCityMuseumData';
import { DublinCityPharmacyData } from '@/app/test-cities/scripts/Dublin/Pharmacies/DublinCityPharmacyData';
import { DublinCityPlaceofWorshipData } from '@/app/test-cities/scripts/Dublin/PlaceOfWorship/DublinCityPlaceOfWorshipData';
import dublinhealth from '@/app/test-cities/scripts/Dublin/Valuations/Health/dublin-properties-Health.json'
import dublinhospitality from '@/app/test-cities/scripts/Dublin/Valuations/Hospitality/dublin-properties-Hospitality.json'
import dublinleisure from '@/app/test-cities/scripts/Dublin/Valuations/Leisure/dublin-properties-leisure.json'
import dublinretail from '@/app/test-cities/scripts/Dublin/Valuations/Retail/dublin-properties-Retail-Shops.json'
import { DublinCityWomenBeautyMDBData } from '@/app/test-cities/scripts/Dublin/WomenBeauty/DublinCityWomenBeautyMDBData';
import { NewryCityATMData } from '@/app/test-cities/scripts/Newry/ATMs/NewryCityATMData';
import { NewryCityCafeData } from '@/app/test-cities/scripts/Newry/Cafes/NewryCityCafeData';
import newrycitypins from '@/app/test-cities/scripts/Newry/sample.json'
import newrypolicepins from '@/app/test-cities/scripts/Newry/Polices/newry-police-pins.json'
import newryparkpins from '@/app/test-cities/scripts/Newry/Parks/newry-park-pins.json'
import { LondonCityATMData } from '@/app/test-cities/scripts/London/ATMs/LondonCityATMData';
import { LondonCityArtData } from '@/app/test-cities/scripts/London/Art/LondonCityArtData';
import { LondonCityBookstoreData } from '@/app/test-cities/scripts/London/Bookstores.js/LondonCityBookstoreData';
import { LondonCityCafeData } from '@/app/test-cities/scripts/London/Cafes/LondonCityCafeData';
import { LondonCityChurchData } from '@/app/test-cities/scripts/London/Churches/LondonCityChurchData';
import { LondonCityHospitalData } from '@/app/test-cities/scripts/London/Hospitals/LondonCityHospitalData';
import { LondonCityPaddyPowerData } from '@/app/test-cities/scripts/London/PaddyPowers/LondonCityPaddyPowerData';
import { LondonCityParkData } from '@/app/test-cities/scripts/London/Parks/LondonCityParkData';
import { LondonCityPharmaciesData } from '@/app/test-cities/scripts/London/Pharmacies/LondonCityPharmaciesData';
import { LondonCityPintData } from '@/app/test-cities/scripts/London/Pints/LondonCityPintData';
import { LondonCityRestaurantData } from '@/app/test-cities/scripts/London/Restaurants/LondonCityRestaurantData';
// import { createPrerenderSearchParamsForClientPage } from "next/dist/server/request/search-params";

export const cityMapData = 
{
    dublin:
    [
      ...dublincitypins,
      ...luasStops,
      ...DublinCityATMData.dublin,
      ...DublinCityBookstoreData.dublin,
      ...DublinCityCafeData.dublin,
      ...DublinCityRestaurantData.dublin,
      ...DublinCityArtData.dublin,
      ...DublinCityPintData.dublin,
      ...DublinCityIcecreamData.dublin,
      ...DublinCityMuseumData.dublin,
      ...DublinCityPharmacyData.dublin,
      ...DublinCityPlaceofWorshipData.dublin,
      ...dublinhealth,
      ...dublinhospitality,
      ...dublinleisure,
      //...dublinretail,
      ...DublinCityWomenBeautyMDBData.dublin,
    ],
    newry:
    [
      ...newrycitypins,
      ...NewryCityATMData.newry,
      ...NewryCityCafeData.newry,
      ...newrypolicepins,
      ...newryparkpins,

    ],
    belfast:
    [
      ...belfastcitypins,
    ],
    "london-2024":
    [
      // ...londoncitypins,
      // ...LondonCityATMData['london-2024'],
      // ...LondonCityArtData['london-2024'],
      // ...LondonCityBookstoreData['london-2024'],
      // ...LondonCityCafeData['london-2024'],
      // ...LondonCityChurchData['london-2024'],
      // ...LondonCityHospitalData['london-2024'],
      // ...LondonCityPaddyPowerData['london-2024'],
      // ...LondonCityParkData['london-2024'],
      // ...LondonCityPharmaciesData['london-2024'],
      // ...LondonCityPintData['london-2024'],
      // ...LondonCityRestaurantData['london-2024'],

    ],
    nagpur:
    [
      ...nagpurpolicepins,
    ],
    malahide:
    [
      ...malahidecitypins,
    ]
  }