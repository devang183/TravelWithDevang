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
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
  
      cityMapData['london-2024'].push({
        coords,
        name,
        description: 'ATM',
        url: '', // optional
        category:'atm'
      });
    }
  });

    // Write output to LondonCityATMData.js
    const outputPath = path.join(__dirname, 'LondonCityATMData.js');
    const outputCode = `export const LondonCityATMData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London ATM data generated successfully.');