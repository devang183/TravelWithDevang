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
    fs.readFileSync(path.join(__dirname, 'hospital.geojson'))
  );  
  const cityMapData = {};
  
  geojson.features.forEach(feature => {
    if (
        feature.geometry.type === 'Point' &&
        feature.properties.amenity === 'hospital'
      )  {
      const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Hospital'} ${hashString(feature.properties['@id'] || '')}`; 
      if (!cityMapData['london-2024']) {
        cityMapData['london-2024'] = [];
      }
      const curl=feature.properties["contact:website"] || '';
      const url=feature.properties.website;
      const speciality=feature.properties["healthcare:speciality"];
      const street = feature.properties["addr:street"];
      const ccity=feature.properties["addr:city"];
      const postcode=feature.properties["addr:postcode"];
      const housename=feature.properties["addr:housename"];
      const county=feature.properties["addr:county"];
      const ohours=feature.properties.opening_hours;
      const cphone=feature.properties["contact:phone"];
      const phone=feature.properties.phone;
      const public=feature.properties.public;
      const wheelchair=feature.properties.wheelchair;
      const operator=feature.properties.operator;
      const wheelchairdesc=feature.properties["wheelchair:description"];

    // const description = street && postcode && ohours && phone && desc && wheelchair && buildinglevels
    // ? `${street}, ${postcode}, ${ohours}, ${phone}, ${wheelchair}, ${buildinglevels}`
    // : street || aname || atype || material || sdata || inscription || "";

    let details = [];

// Name / House name
if (housename) details.push(`<strong>Name:</strong> ${housename}`);

// Address
if (street) details.push(`<strong>Street:</strong> ${street}`);
if (ccity) details.push(`<strong>City:</strong> ${ccity}`);
if (county) details.push(`<strong>County:</strong> ${county}`);
if (postcode) details.push(`<strong>Postcode:</strong> ${postcode}`);

// Contact
if (phone) details.push(`<strong>Phone:</strong> ${phone}`);
else if (cphone) details.push(`<strong>Phone:</strong> ${cphone}`);

if (curl || url) {
    const link = curl || url;
    details.push(`<strong>Website:</strong> <a href="${link}" target="_blank">${link}</a>`);
}

// Opening hours
if (ohours) details.push(`<strong>Opening Hours:</strong> ${ohours}`);

// Specialty / Type
if (speciality) details.push(`<strong>Speciality:</strong> ${speciality}`);

// Accessibility
if (wheelchair) details.push(`<strong>Wheelchair Access:</strong> ${wheelchair}`);
if (wheelchairdesc) details.push(`<strong>Wheelchair Notes:</strong> ${wheelchairdesc}`);

// Other attributes
if (operator) details.push(`<strong>Operator:</strong> ${operator}`);
if (public) details.push(`<strong>Public Access:</strong> ${public}`);

// Join into HTML
const description = details.length > 0
    ? details.join('<br>')
    : "No additional information available";

      cityMapData['london-2024'].push({
        coords,
        name,
        description,
        url,
        category:'hospital',
        keywords: [street, ccity, county, postcode, phone, curl, url, speciality, wheelchairdesc, operator]
        .filter(Boolean) // removes null/undefined/empty
        .map(k => k.toString().trim().toLowerCase()) // normalize to lowercase and trim spaces
      });
    }
  });

    // Write output to LondonCityHospitalData.js
    const outputPath = path.join(__dirname, 'LondonCityHospitalData.js');
    const outputCode = `export const LondonCityHospitalData = ${JSON.stringify(cityMapData, null, 2)};`;

    fs.writeFileSync(outputPath, outputCode);
    console.log('✅ London Hospital data generated successfully.');