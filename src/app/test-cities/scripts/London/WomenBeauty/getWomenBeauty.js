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
    fs.readFileSync(path.join(__dirname, 'women.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
        feature.geometry.type === 'Point' &&
        feature.properties.shop === 'beauty'
      )  {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Beauty'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }

      const curl=feature.properties["contact:website"]; //
      const url=feature.properties.website; //
      const suburb=feature.properties["addr:suburb"]; //
      const housenumber=feature.properties.housenumber; //
      const street = feature.properties["addr:street"]; //
      const ccity=feature.properties["addr:city"];
      const postcode=feature.properties["addr:postcode"]; //
      const ohours=feature.properties.opening_hours; //
      const email=feature.properties["contact:email"]; //

      const phone=feature.properties.phone; //
      const cphone=feature.properties["contact:phone"];
      const instagram=feature.properties["contact:instagram"];

      const wheelchair=feature.properties.wheelchair; //
      const wheelchairdesc=feature.properties["wheelchair:description"];
      const buildinglevels=feature.properties["building:levels"];
      const brand=feature.properties.brand;

    let details = [];

// Name / House name
if (housenumber) details.push(`<strong>House Number:</strong> ${housenumber}`);

// Address
if (buildinglevels) details.push(`<strong>Building Levels:</strong ${buildinglevels}`);
if (street) details.push(`<strong>Street:</strong> ${street}`);
if (suburb) details.push(`<strong>Suburb:</strong> ${suburb}`);
if (ccity) details.push(`<strong>City:</strong> ${ccity}`);
if (postcode) details.push(`<strong>Postcode:</strong> ${postcode}`);
if (email) details.push(`<strong>Email:</strong> ${email}`);
if (instagram) details.push(`<strong>Instagram:</strong> ${instagram}`);
if (curl || url) {
    const link = curl || url;
    details.push(`<strong>Website:</strong> <a href="${link}" target="_blank">${link}</a>`);
  }
if (phone || cphone) {
    const contact = phone || cphone;
    details.push(`<strong>Contact:</strong> ${contact}`);
  }
// Opening hours
if (ohours) details.push(`<strong>Opening Hours:</strong> ${ohours}`);
if (brand) details.push(`<strong>Brand:</strong> ${brand}`);


// Accessibility
if (wheelchair) details.push(`<strong>Wheelchair Access:</strong> ${wheelchair}`);
if (wheelchairdesc) details.push(`<strong>Wheelchair Description:</strong> ${wheelchairdesc}`);
// Join into HTML
const description = details.length > 0
    ? details.join('<br>')
    : "No additional information available";

      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'womenbeauty',
        keywords: [street, suburb, ccity, postcode, phone, cphone, brand, url, curl, email]
        .filter(Boolean) // removes null/undefined/empty
        .map(k => k.toString().trim().toLowerCase()) // normalize to lowercase and trim spaces
      });
    }
  });

    // Write output to LondonCityWomenBeautyData.js
    const outputPath = path.join(__dirname, 'LondonCityWomenBeautyData.js');
    const outputCode = `export const LondonCityWomenBeautyData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London WomenBeauty data generated successfully.');