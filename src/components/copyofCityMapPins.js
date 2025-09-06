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
// import { createPrerenderSearchParamsForClientPage } from "next/dist/server/request/search-params";

export const cityMapData = 
{
    dublin:
    [
      ...dublincitypins,
      ...luasStops
    ],
    belfast:
    [
      ...belfastcitypins,
    ],
    "london-2024":
    [
      ...londoncitypins,
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