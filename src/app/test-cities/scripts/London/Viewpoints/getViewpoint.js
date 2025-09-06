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
    fs.readFileSync(path.join(__dirname, 'viewpoint.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      feature.properties.tourism === 'viewpoint'
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Viewpoint'} ${hashString(feature.properties['@id'] || '')}`; ;  
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
      
      const housenumber=feature.properties["addr:housenumber"];
      const street = feature.properties["addr:street"];
      const ccity=feature.properties["addr:city"];
      const postcode=feature.properties.postcode;
      const url=feature.properties.website || '';
      const wheelchair=feature.properties.wheelchair;
      const desc=feature.properties.description;
      const wheelchairdesc=feature.properties["wheelchair:description"];
      const direction=feature.properties.direction;
      
      

      let details = [];

    // Add details only if they exist

    if (housenumber) details.push(`<strong>House Number:</strong> ${housenumber}`);
    if (street) details.push(`<strong>Street:</strong> ${street}`);
    if (ccity) details.push(`<strong>City:</strong> ${ccity}`);
    if (postcode) details.push(`<strong>Postcode:</strong> ${postcode}`);
    if (url) details.push(`<strong>URL:</strong> ${url}`);
    if (wheelchair) details.push(`<strong>Wheelchair:</strong> ${wheelchair}`);
    if (desc) details.push(`<strong>Description:</strong> ${desc}`);
    if (wheelchairdesc) details.push(`<strong>Wheelchair Description:</strong> ${wheelchairdesc}`);
    if (direction) details.push(`<strong>Direction:</strong> ${direction}`);
    

    const description = details.length > 0 ? details.join('<br>') : "No additional information available";

      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'viewpoint',
        keywords:[street, ccity, desc, url, direction]
        .filter(Boolean) // removes null/undefined/empty
        .map(k => k.toString().trim().toLowerCase()) // normalize to lowercase and trim spaces
      });
    }
  });

    // Write output to LondonCityviewpointData.js
    const outputPath = path.join(__dirname, 'LondonCityViewpointData.js');
    const outputCode = `export const LondonCityViewpointData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Viewpoint data generated successfully.');