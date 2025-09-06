const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash % 100000); // Limit to 5 digits
}

// --- CONFIG ---
const inputFile = path.join(__dirname, 'retail.json'); // your GeoJSON file
const outputFile = path.join(__dirname, 'dublin-properties-Retail-Shops.json');

// --- DEFINE PROJECTIONS ---
// ITM / EPSG:2157 → WGS84 (EPSG:4326)
proj4.defs("EPSG:2157","+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=0.999820 +x_0=600000 +y_0=750000 +ellps=GRS80 +units=m +no_defs");
const itm = proj4("EPSG:2157");
const wgs84 = proj4("WGS84");

// --- LOAD GEOJSON ---
const geojsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// --- TRANSFORM AND REMOVE DUPLICATES ---
const uniqueNames = new Set();
const formatted = geojsonData.features
  .filter(f => f.properties?.category === 'RETAIL (SHOPS)')
  .map(f => {
    const props = f.properties || {};
    const valuationReport = props.ValuationReport?.[0] || {};

    const rawCoords = f.geometry?.coordinates || [];
    let coords = [];
    if (rawCoords.length === 2) {
        // Convert ITM (x, y) → [lat, lng]
        const [lng, lat] = proj4(itm, wgs84, rawCoords);
        coords = [lat, lng];
    }

    const name = `${props.name || 'Retail Shops'} ${hashString(props.propertynumber || '')}`;

    // Skip duplicates
    if (uniqueNames.has(name)) return null;
    uniqueNames.add(name);

    // Build description
    const descriptionParts = [];
    if (props.address) descriptionParts.push(`Address: ${props.address}`);
    if (props.county) descriptionParts.push(`County: ${props.county}`);
    if (props.valuation) descriptionParts.push(`Valuation: €${props.valuation}`);
    if (valuationReport.Area) descriptionParts.push(`Area: ${valuationReport.Area} m²`);
    if (valuationReport.FloorUse) descriptionParts.push(`Floor Use: ${valuationReport.FloorUse}`);
    if (props.eircode) descriptionParts.push(`Eircode: ${props.eircode}`);
    if (props.localauthority) descriptionParts.push(`Local Authority: ${props.localauthority}`);
    if (props.public !== undefined) descriptionParts.push(`Public: ${props.public}`);
    const description = descriptionParts.length > 0 ? descriptionParts.join('<br>') : "No additional information available";

    const keywords = [
      props.name,
      props.address,
      props.county,
      props.category,
      props.eircode,
      valuationReport.FloorUse
    ].filter(Boolean);

    // Add unique hashId for easy referencing
    const hashId = hashString(props.propertynumber || props.name || Math.random().toString());

    return {
      coords,
      name,
      description,
      category: props.category || '',
      keywords
    };
  })
  .filter(Boolean); // remove nulls from duplicates

// --- SAVE TO JSON ---
fs.writeFileSync(outputFile, JSON.stringify(formatted, null, 2), 'utf8');
console.log(`✅ Retail Shops JSON with lat/lng and hashId saved to ${outputFile}`);

// const fs = require('fs');
// const path = require('path');
// const proj4 = require('proj4');

// function hashString(str) {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//       hash = (hash << 5) - hash + str.charCodeAt(i);
//       hash |= 0; // Convert to 32bit integer
//     }
//     return Math.abs(hash % 100000); // Limit to 5 digits
//   }

// // --- CONFIG ---
// const inputFile = path.join(__dirname, 'retail.json'); // your GeoJSON file
// const outputFile = path.join(__dirname, 'dublin-properties-Retail-Shops.json');

// // --- DEFINE PROJECTIONS ---
// // ITM / EPSG:2157 → WGS84 (EPSG:4326)
// proj4.defs("EPSG:2157","+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=0.999820 +x_0=600000 +y_0=750000 +ellps=GRS80 +units=m +no_defs");
// const itm = proj4("EPSG:2157");
// const wgs84 = proj4("WGS84");

// // --- LOAD GEOJSON ---
// const geojsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// // --- TRANSFORM ---
// const formatted = geojsonData.features
//   .filter(f => f.properties?.category === 'RETAIL (SHOPS)') // only RETAIL (SHOPS)
//   .map(f => {
//     const props = f.properties || {};
//     const valuationReport = props.ValuationReport?.[0] || {};

//     const rawCoords = f.geometry?.coordinates || [];
//     let coords = [];
//     if (rawCoords.length === 2) {
//         // Convert ITM (x, y) → [lat, lng]
//         const [lng, lat] = proj4(itm, wgs84, rawCoords);
//         coords = [lat, lng];
//     }

//     const name = `${props.name || 'Retail Shops'} ${hashString(props.propertynumber || '')}`;
    
//     // Build a description with useful info
//     const descriptionParts = [];
//     if (props.address) descriptionParts.push(`Address: ${props.address}`);
//     if (props.county) descriptionParts.push(`County: ${props.county}`);
//     if (props.valuation) descriptionParts.push(`Valuation: €${props.valuation}`);
//     if (valuationReport.Area) descriptionParts.push(`Area: ${valuationReport.Area} m²`);
//     if (valuationReport.FloorUse) descriptionParts.push(`Floor Use: ${valuationReport.FloorUse}`);
//     if (props.eircode) descriptionParts.push(`Eircode: ${props.eircode}`);
//     if (props.localauthority) descriptionParts.push(`Local Authority: ${props.localauthority}`);
//     if (props.public !== undefined) descriptionParts.push(`Public: ${props.public}`);
    
//     // const description = descriptionParts.join(', ');
//     const description = descriptionParts.length > 0
//     ? descriptionParts.join('<br>')
//     : "No additional information available";

//     // Build keywords
//     const keywords = [
//       props.name,
//       props.address,
//       props.county,
//       props.category,
//       props.eircode,
//       valuationReport.FloorUse
//     ].filter(Boolean);

//     return {
//       coords,          // converted to [lat, lng]
//       name,
//       description,
//       category: props.category || '',
//       keywords
//     };
//   });

// // --- SAVE TO JSON ---
// fs.writeFileSync(outputFile, JSON.stringify(formatted, null, 2), 'utf8');
// console.log(`✅ Retail Shops JSON with lat/lng saved to ${outputFile}`);