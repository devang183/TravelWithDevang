const axios = require("axios");
const { MongoClient } = require("mongodb");

// --- CONFIG ---
const overpassUrl = "https://overpass-api.de/api/interpreter";
const mongoUri = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/"; // 🔒 Replace with your actual
const dbName = "hello";
const collectionName = "londonStations"; // target collection

// 1️⃣ City name for query
const cityName = "London";

// 2️⃣ Overpass query → fetch London Underground + Overground stations
function buildQuery(cityName) {
  return `
[out:json][timeout:25];
area["name"="${cityName}"]->.searchArea;
(
  node["railway"="station"]["public_transport"="station"](area.searchArea);
);
out center;
`;
}

// 3️⃣ Build description from tags
function buildDescription(tags) {
  const parts = [];
  if (tags.name) parts.push(`<b>${tags.name}</b>`);
  if (tags["railway"]) parts.push(`🚉 Railway: ${tags["railway"]}`);
  if (tags["station"]) parts.push(`Station type: ${tags["station"]}`);
  if (tags["public_transport"]) parts.push(`Public Transport: ${tags["public_transport"]}`);
  if (tags["line"]) parts.push(`📍 Line: ${tags["line"]}`);
  if (tags["network"]) parts.push(`Network: ${tags["network"]}`);
  if (tags["operator"]) parts.push(`Managed by: ${tags["operator"]}`);
  if (tags["fare_zone"]) parts.push(`Fare Zone(s): ${tags["fare_zone"]}`);
  if (tags["platforms"]) parts.push(`Platforms: ${tags["platforms"]}`);
  if (tags["ref:crs"]) parts.push(`CRS Code: ${tags["ref:crs"]}`);
  if (tags["naptan:AtcoCode"]) parts.push(`NaPTAN Code: ${tags["naptan:AtcoCode"]}`);
  if (tags["wheelchair"]) parts.push(`♿ Wheelchair Access: ${tags["wheelchair"]}`);
  if (tags["wheelchair:description"]) parts.push(`Access Info: ${tags["wheelchair:description"]}`);
  if (tags["website"]) parts.push(`🌐 <a href="${tags["website"]}" target="_blank">${tags["website"]}</a>`);
  if (tags["network:website"]) parts.push(`🌐 <a href="${tags["network:website"]}" target="_blank">Network Website</a>`);
  if (tags["wikidata"]) parts.push(`Wikidata: <a href="https://www.wikidata.org/wiki/${tags["wikidata"]}" target="_blank">${tags["wikidata"]}</a>`);
  if (tags["wikipedia"]) parts.push(`Wikipedia: <a href="https://en.wikipedia.org/wiki/${tags["wikipedia"].replace("en:", "")}" target="_blank">${tags["wikipedia"]}</a>`);
  if (tags["source"]) parts.push(`Source: ${tags["source"]}`);
  if (tags["source_ref"]) parts.push(`Source Ref: ${tags["source_ref"]}`);
  return parts.join("<br>") || "No additional info available";
}

// Helper
function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 4️⃣ Fetch stations from Overpass
async function fetchLondonStations() {
  try {
    const response = await axios.post(overpassUrl, buildQuery(cityName), {
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.data || !response.data.elements) return [];

    return response.data.elements
      .map((e) => {
        const tags = e.tags || {};
        const fname = tags.name ? capitalizeFirst(tags.name) : `Station#${String(e.id).slice(-5)}`;
        return {
          coords: e.lat && e.lon ? [e.lat, e.lon] : e.center ? [e.center.lat, e.center.lon] : null,
          name: fname,
          description: buildDescription(tags),
          category: tags["line"]
          ? tags["line"].split(";").map(l => l.trim())
          : [],
          keywords: Object.values(tags).slice(0, 10),
          osmId: e.id,
        };
      })
      .filter((s) => s.coords !== null);
  } catch (err) {
    console.error(`❌ Error fetching stations for ${cityName}:`, err.message);
    return [];
  }
}

// 5️⃣ Insert into MongoDB
async function fetchAndInsertAll() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  console.log(`🏙️ Processing London Metro data...`);

  const items = await fetchLondonStations();

  for (const item of items) {
    await collection.updateOne(
      { osmId: item.osmId },
      { $set: item },
      { upsert: true }
    );
  }

  console.log(`✅ Inserted/Updated ${items.length} London Underground stations`);
  await client.close();
  console.log("🎉 Done!");
}

// Run
fetchAndInsertAll();