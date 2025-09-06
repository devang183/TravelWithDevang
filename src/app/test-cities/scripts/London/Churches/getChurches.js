function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 100000); // Limit to 5 digits
  }

  const fs = require('fs');
const { default: build } = require('next/dist/build');
  const path = require('path');
  
  // Read the GeoJSON file (assumed to be in the same folder)
  const geojson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'church.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
        feature.geometry.type === 'Point' &&
        feature.properties.amenity === 'place_of_worship' &&
        feature.properties.religion === 'christian'
      )  {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Church'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
      const url=feature.properties.website || '';

      const street = feature.properties["addr:street"];
      const ccity=feature.properties["addr:city"];
      const suburb=feature.properties["addr:suburb"];
      const postcode=feature.properties["addr:postcode"];
      const ohours=feature.properties.opening_hours;
      const phone=feature.properties.phone;
      const wheelchair=feature.properties.wheelchair;

    // const description = street && postcode && ohours && phone && desc && wheelchair && buildinglevels
    // ? `${street}, ${postcode}, ${ohours}, ${phone}, ${wheelchair}, ${buildinglevels}`
    // : street || aname || atype || material || sdata || inscription || "";

    let details = [];

    // Add details only if they exist
    if (street) details.push(`<strong>Street:</strong> ${street}`);
    if (suburb) details.push(`<strong>Suburb:</strong> ${suburb}`);
    if (postcode) details.push(`<strong>Postcode:</strong> ${postcode}`);
    if (ohours) details.push(`<strong>Opening Hours:</strong> ${ohours}`);
    if (phone) details.push(`<strong>Phone:</strong> ${phone}`);
    if (wheelchair) details.push(`<strong>Wheelchair Access:</strong> ${wheelchair}`);

    // Join into HTML
    const description = details.length > 0 ? details.join('<br>') : "No additional information available";

      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'church',
        keywords: [street, suburb, postcode, phone]
        .filter(Boolean) // removes null/undefined/empty
        .map(k => k.toString().trim().toLowerCase()) // normalize to lowercase and trim spaces
      });
    }
  });

    // Write output to LondonCityChurchData.js
    const outputPath = path.join(__dirname, 'LondonCityChurchData.js');
    const outputCode = `export const LondonCityChurchData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Church data generated successfully.');