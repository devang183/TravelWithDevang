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
    fs.readFileSync(path.join(__dirname, 'park.geojson'))
  );  
  const cityMapData = {};
  
  const allowedParks=['park','garden','playground','nature_reserve']

  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      allowedParks.includes(feature.properties.leisure)
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Park'} ${hashString(feature.properties['@id'] || '')}`; ;  
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
      const url=feature.properties.website || '';
      const operator = feature.properties.operator;
      const street = feature.properties["addr:street"];
      const postcode = feature.properties["addr:postcode"];

    const description = street && postcode && operator
    ? `${street}, ${postcode}, ${operator}`
    : street || postcode || operator || "";
      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'park'
      });
    }
  });

    // Write output to LondonCityParkData.js
    const outputPath = path.join(__dirname, 'LondonCityParkData.js');
    const outputCode = `export const LondonCityParkData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Park data generated successfully.');