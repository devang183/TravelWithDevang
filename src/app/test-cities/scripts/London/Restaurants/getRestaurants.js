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
    fs.readFileSync(path.join(__dirname, 'restaurant.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
      feature.geometry.type === 'Point' &&
      feature.properties.amenity === 'restaurant'
    ) {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Restaurant'} ${hashString(feature.properties['@id'] || '')}`; ;  
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
      const url=feature.properties.website || '';
      const street = feature.properties["addr:street"];
      const cuisine = feature.properties.cuisine;
      const bar=feature.properties.bar
      const email=feature.properties.email
      const phone=feature.properties.phone
      const wheelchair=feature.properties.wheelchair
      const addrcity=feature.properties["addr:city"]
      const takeaway=feature.properties.takeaway
      const housenumber=feature.properties["addr:housenumber"]
      const ohours=feature.properties.opening_hours;
      const desc=feature.properties.description;

      let details = [];

    // Add details only if they exist

    if (street) details.push(`<strong>Street:</strong> ${street}`);
    if (addrcity) details.push(`<strong>City:</strong> ${addrcity}`);
    if (url) details.push(`<strong>Website:</strong> ${url}`);
    if (takeaway) details.push(`<strong>Takeaway:</strong> ${takeaway}`);
    if (ohours) details.push(`<strong>Opening Hours:</strong> ${ohours}`);
    if (housenumber) details.push(`<strong>House Number:</strong> ${housenumber}`);
    if (cuisine) details.push(`<strong>Cuisine:</strong> ${cuisine}`);
    if (bar) details.push(`<strong>Bar:</strong> ${bar}`);
    if (email) details.push(`<strong>Email:</strong> ${email}`);
    if (phone) details.push(`<strong>Phone:</strong> ${phone}`);
    if (wheelchair) details.push(`<strong>Wheelchair:</strong> ${wheelchair}`);
    if (desc) details.push(`<strong>Description:</strong> ${desc}`);

    const description = details.length > 0 ? details.join('<br>') : "No additional information available";

      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'restaurant',
        keywords:[street, addrcity, cuisine, email, phone, desc, url]
        .filter(Boolean) // removes null/undefined/empty
        .map(k => k.toString().trim().toLowerCase()) // normalize to lowercase and trim spaces
      });
    }
  });

    // Write output to LondonCityRestaurantData.js
    const outputPath = path.join(__dirname, 'LondonCityRestaurantData.js');
    const outputCode = `export const LondonCityRestaurantData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Restaurant data generated successfully.');