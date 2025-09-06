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
    fs.readFileSync(path.join(__dirname, 'pint.geojson'))
  );  
  const cityMapData = {};
  const pints = ['pub', 'bar'];

  geojson.features.forEach(feature => {
    if (
        feature.geometry.type === 'Point' &&
        pints.includes(feature.properties.amenity)
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Pints'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
      const url=feature.properties.website || '';

      //const description = feature.properties.religion ? feature.properties.religion.toUpperCase():"";
      const street = feature.properties["addr:street"];
      const postcode=feature.properties['addr:postcode'];
      const housenumber=feature.properties['addr:housenumber'];

      const description = [street, housenumber, postcode]
      .filter(Boolean) // remove undefined or empty values
      .join(", "); // each on a new line

      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'pint',
        keywords: pints
      });
    }
  });

    // Write output to LondonCityPintData.js
    const outputPath = path.join(__dirname, 'LondonCityPintData.js');
    const outputCode = `export const LondonCityPintData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Pints data generated successfully.');