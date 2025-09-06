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
    fs.readFileSync(path.join(__dirname, 'pharmacy.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      feature.properties.amenity === 'pharmacy'
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Pharmacy'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['dublin']) {
        cityMapData['dublin'] = [];
      }
      const url=feature.properties.website || '';
      const street = feature.properties["addr:street"];

      const desc = feature.properties.healthcare;

    const description = street && desc
    ? `${street}, ${desc}`
    : street || desc || "";

      cityMapData['dublin'].push({
        coords,
        name,
        description,
        url,
        category:'pharmacy'
      });
    }
  });

    // Write output to DublinCityPharmacyData.js
    const outputPath = path.join(__dirname, 'DublinCityPharmacyData.js');
    const outputCode = `export const DublinCityPharmacyData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ Dublin Pharmacy data generated successfully.');