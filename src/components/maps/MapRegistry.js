// components/maps/CityMapRegistry.js

import NagpurPoliceStationsMap from "./NagpurPoliceStations";
import DublinArcGISMap from "./DublinarcGISMap";
import DublinLivingMap from "./DublinDesirabilityMap";
import LondonPlacesMap from "./LondonPlacesMap";
import LiverpoolPlacesMap from "./LiverpoolPlacesMap";
import BirminghamPlacesMap from "./BirminghamPlacesMap";
import BelfastPlacesMap from "./BelfastPlacesMap";
import ManchesterPlacesMap from "./ManchesterPlacesMap";
import LeedsPlacesMap from "./LeedsPlacesMap";
import MalahidePlacesMap from "./MalahidePlacesMap";
import LuasLiveData from "@/app/test-cities/[cityid]/LuasLiveData";
import DublinBikesMap from "./DublinBikesMap";
// import more as needed

const cityMapRegistry = {
  nagpur: [NagpurPoliceStationsMap],
  dublin: [DublinLivingMap, DublinArcGISMap, LuasLiveData],
  newry: [NagpurPoliceStationsMap],
  liverpool:[LiverpoolPlacesMap],
  'london':[LondonPlacesMap],
  birmingham:[BirminghamPlacesMap],
  belfast:[BelfastPlacesMap],
  manchester:[ManchesterPlacesMap],
  leeds:[LeedsPlacesMap],
  malahide:[MalahidePlacesMap],
  'london-2025':[LondonPlacesMap],
  'dublin-2025-march':[DublinLivingMap],
  'dublin-2025-april':[DublinArcGISMap],
  rabat:[NagpurPoliceStationsMap],
  raipur:[NagpurPoliceStationsMap],
  delhi:[NagpurPoliceStationsMap],
  newyork:[DublinArcGISMap],
  newquay:[DublinArcGISMap],
  chicago:[DublinArcGISMap],
  // more cities...
};

export default cityMapRegistry;