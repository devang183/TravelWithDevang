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
    fs.readFileSync(path.join(__dirname, 'pharmacy.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
        feature.geometry.type === 'Point' &&
        feature.properties.amenity === 'pharmacy'
      )  {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Pharmacy'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }

      const curl=feature.properties["contact:website"];
      const url=feature.properties.website;
      const suburb=feature.properties["addr:suburb"];
      const housenumber=feature.properties.housenumber;
      const street = feature.properties["addr:street"];
      const ccity=feature.properties["addr:city"];
      const postcode=feature.properties["addr:postcode"];
      const ohours=feature.properties.opening_hours;
      const desc=feature.properties.description;
      const wheelchairdesc=feature.properties["wheelchair:description"];
      const email=feature.properties.email;

      const phone=feature.properties.phone;

      const wheelchair=feature.properties.wheelchair;

    let details = [];

// Name / House name
if (housenumber) details.push(`<strong>House Number:</strong> ${housenumber}`);

// Address
if (street) details.push(`<strong>Street:</strong> ${street}`);
if (suburb) details.push(`<strong>Suburb:</strong> ${suburb}`);
if (ccity) details.push(`<strong>City:</strong> ${ccity}`);
if (postcode) details.push(`<strong>Postcode:</strong> ${postcode}`);
if (desc) details.push(`<strong>Description:</strong> ${desc}`);
if (email) details.push(`<strong>Email:</strong> ${email}`);
// Contact
if (phone) details.push(`<strong>Phone:</strong> ${phone}`);
if (curl || url) {
    const link = curl || url;
    details.push(`<strong>Website:</strong> <a href="${link}" target="_blank">${link}</a>`);
  }
// Opening hours
if (ohours) details.push(`<strong>Opening Hours:</strong> ${ohours}`);


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
        category:'pharmacy',
        keywords: [street, suburb, ccity, postcode, phone, url, curl, desc, email]
        .filter(Boolean) // removes null/undefined/empty
        .map(k => k.toString().trim().toLowerCase()) // normalize to lowercase and trim spaces
      });
    }
  });

    // Write output to LondonCityPharmaciesData.js
    const outputPath = path.join(__dirname, 'LondonCityPharmaciesData.js');
    const outputCode = `export const LondonCityPharmaciesData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Pharmacies data generated successfully.');