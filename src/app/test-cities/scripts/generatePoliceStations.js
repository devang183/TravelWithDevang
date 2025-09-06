const fs = require('fs');
const path = require('path');

// Read the GeoJSON file (assumed to be in the same folder)
const geojson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'export.geojson'))
);

// Output object to hold data per city
const cityMapData = {};

// Loop through features and extract required info
geojson.features.forEach((feature) => {
  if (
    feature.geometry.type === 'Point' &&
    feature.properties.amenity === 'police'
  ) {
    const city = feature.properties['addr:city']?.toLowerCase();
    const name = feature.properties.name;
    const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

    if (city && name && coords) {
      if (!cityMapData[city]) {
        cityMapData[city] = [];
      }

      cityMapData[city].push({
        coords,
        name,
        description: 'Police Station',
        url: '', // Optional: add links later
      });
    }
  }
});

// Write output to cityPoliceMapData.js
const outputPath = path.join(__dirname, 'cityPoliceMapData.js');
const outputCode = `export const cityPoliceMapData = ${JSON.stringify(cityMapData, null, 2)};`;

fs.writeFileSync(outputPath, outputCode);
console.log('✅ Police station data generated successfully.');