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
    fs.readFileSync(path.join(__dirname, 'icecream.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      feature.properties.shop === 'bakery'
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Icecream'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['dublin']) {
        cityMapData['dublin'] = [];
      }
      const url=feature.properties.website || '';
      const description = feature.properties["addr:street"] || '';

      cityMapData['dublin'].push({
        coords,
        name,
        description,
        url,
        category:'icecream',
        keywords:['ice','icecream','ice-cream']
      });
    }
  });

    // Write output to DublinCityIcecreamData.js
    const outputPath = path.join(__dirname, 'DublinCityIcecreamData.js');
    const outputCode = `export const DublinCityIcecreamData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ Dublin Icecream data generated successfully.');