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
    fs.readFileSync(path.join(__dirname, 'bookstore.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      feature.properties.shop === 'books'
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Bookstore'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
      const url=feature.properties.website || '';
      const street = feature.properties["addr:street"];

      const contactFB = feature.properties["contact:facebook"];
      const contactIG = feature.properties["contact:instagram"];
      const contactTW = feature.properties["contact:twitter"];
      const contactEmail = feature.properties["contact:email"];

    const description = street && contactFB
    ? `${street}, ${contactFB}, ${contactIG}, ${contactTW}, ${contactEmail}}`
    : street || contactEmail || contactIG || contactTW || contactEmail || "";

      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'bookstore'
      });
    }
  });

    // Write output to LondonCityBookstoreData.js
    const outputPath = path.join(__dirname, 'LondonCityBookstoreData.js');
    const outputCode = `export const LondonCityBookstoreData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Bookstore data generated successfully.');