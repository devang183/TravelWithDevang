const fs = require('fs');
const path = require('path');

// Load your stops GeoJSON (replace with your actual path)
const geojson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'luas-stops.geojson'))
);
// Prepare array for stops with line category
const stopsWithCategory = geojson.features.map(feature => {
  const coords = feature.geometry.coordinates; // [lon, lat]
  const props = feature.properties;
  
  return {
    name: props.Name || "Unknown",
    coords: [coords[1], coords[0]], // [lat, lon]
    description: props.Description || "",
    url: props.URL || "",            // if URL property exists; else empty string
    category: props.Line || "Unknown" // e.g. "Red" or "Green"
  };
});

// Output file content as JS export
const output = `export const luasStops = [
${stopsWithCategory.map(stop => 
  `  {
    name: ${JSON.stringify(stop.name)},
    coords: [${stop.coords[0]}, ${stop.coords[1]}],
    description: ${JSON.stringify(stop.description)},
    url: ${JSON.stringify(stop.url)},
    category: ${JSON.stringify(stop.category)}
  }`
).join(',\n')}
];
`;

// Write to a new JS file
fs.writeFileSync(path.join(__dirname, 'luasStops.js'), output);

console.log('luasStops.js generated successfully!');