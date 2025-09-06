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
    fs.readFileSync(path.join(__dirname, 'art.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      feature.properties.tourism === 'artwork'
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Art'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['dublin']) {
        cityMapData['dublin'] = [];
      }
      const url=feature.properties.website || '';

      //const description = feature.properties.religion ? feature.properties.religion.toUpperCase():"";
      const street = feature.properties["addr:street"];
      const aname = feature.properties.artist_name;
      const atype = feature.properties.artwork_type;
      const material = feature.properties.material;
      const sdata = feature.properties.start_date;
      const inscription=feature.properties.inscription;

    const description = street && aname && atype && material && sdata && inscription
    ? `${street}, ${aname}, ${atype}, ${material}, ${sdata}, ${inscription}`
    : street || aname || atype || material || sdata || inscription || "";

      cityMapData['dublin'].push({
        coords,
        name,
        description,
        url,
        category:'art',
        keywords: aname ? [aname] : []
      });
    }
  });

    // Write output to DublinCityArtData.js
    const outputPath = path.join(__dirname, 'DublinCityArtData.js');
    const outputCode = `export const DublinCityArtData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ Dublin Art data generated successfully.');