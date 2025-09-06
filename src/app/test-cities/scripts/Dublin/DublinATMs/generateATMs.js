function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 100000); // Limit to 5 digits
  }

  const fs = require('fs');
  const path = require('path');
  
  // Read the GeoJSON file (assumed to be in the same folder)
  const geojson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'atm.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      feature.properties.amenity === 'atm'
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
  
      // Use name if available, otherwise create stable ID from @id
      const name = `${feature.properties.name || 'ATM'} ${hashString(feature.properties['@id'] || '')}`;  
      if (!cityMapData['dublin']) {
        cityMapData['dublin'] = [];
      }
  
      cityMapData['dublin'].push({
        coords,
        name,
        description: 'ATM',
        url: '', // optional
        category:'atm'
      });
    }
  });

    // Write output to DublinCityATMData.js
    const outputPath = path.join(__dirname, 'DublinCityATMData.js');
    const outputCode = `export const DublinCityATMData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ Dublin ATM data generated successfully.');

// // {
// //     "type": "FeatureCollection",
// //     "generator": "overpass-turbo",
// //     "copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.",
// //     "timestamp": "2025-08-11T13:43:41Z",
// //     "features": [
// //       {
// //         "type": "Feature",
// //         "properties": {
// //           "@id": "node/255016301",
// //           "amenity": "atm",
// //           "brand": "Ulster Bank",
// //           "brand:wikidata": "Q2613366",
// //           "brand:wikipedia": "en:Ulster Bank",
// //           "check_date": "2025-02-07",
// //           "name": "Ulster Bank",
// //           "operator": "Ulster Bank",
// //           "operator:wikidata": "Q2613366",
// //           "operator:wikipedia": "en:Ulster Bank"
// //         },
// //         "geometry": {
// //           "type": "Point",
// //           "coordinates": [
// //             -6.2457022,
// //             53.3339606
// //           ]
// //         },
// //         "id": "node/255016301"
// //       },

// const fs = require('fs');
// const path = require('path');

// // Read the GeoJSON file (assumed to be in the same folder)
// const geojson = JSON.parse(
//   fs.readFileSync(path.join(__dirname, 'atm.geojson'))
// );

// const cityMapData = {};

// geojson.features.forEach((feature) => {
//   if (
//     feature.geometry.type === "Point" &&
//     feature.properties.amenity === "atm"
//   ) {
//     const city = feature.properties["addr:city"]?.toLowerCase() || "dublin"; // fallback
//     const name = feature.properties.name || "ATM ${Math.floor(Math.random() * 100000)}";
//     const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
//     const url = "";

//     if (!cityMapData[city]) cityMapData[city] = [];

//     cityMapData[city].push({
//       coords,
//       name,
//       description: "ATM",
//       url,
//       category:"atm"
//     });
//   }
// });

// // Write output to DublinCityATMData.js
// const outputPath = path.join(__dirname, 'DublinCityATMData.js');
// const outputCode = `export const DublinCityATMData = ${JSON.stringify(cityMapData, null, 2)};`;

// fs.writeFileSync(outputPath, outputCode);
// console.log('✅ Dublin ATM data generated successfully.');