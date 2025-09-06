
const axios = require("axios");
const { MongoClient } = require("mongodb");

// --- CONFIG ---
const overpassUrl = "https://overpass-api.de/api/interpreter";
const query = `
[out:json][timeout:25];
area["name"="Newry"]->.searchArea;
nwr["amenity"="police"](area.searchArea);
out center;
`;
const mongoUri = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/"; // update if needed
const dbName = "hello";
const collectionName = "Newry";

async function fetchAndInsert() {
  try {
    // 1️⃣ Fetch from Overpass API
    const response = await axios.post(overpassUrl, query, {
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.data || !response.data.elements) {
      throw new Error("No elements found in Overpass API response");
    }

    // 2️⃣ Map the data to a cleaner structure
    const stations = response.data.elements
      .filter((e) => e.tags && e.tags.amenity === "police")
      .map((e) => ({
        name: e.tags.name || "Unnamed Police Station",
        street: e.tags["addr:street"] || "",
        city: e.tags["addr:city"] || "",
        country: e.tags["addr:country"] || "",
        coords: e.lat && e.lon ? [e.lat, e.lon] : e.center ? [e.center.lat, e.center.lon] : null,
        osmId: e.id,
      }))
      .filter((s) => s.coords !== null); // remove ones without coordinates

    console.log(`✅ Fetched ${stations.length} police stations`);

    // 3️⃣ Insert into MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Optional: clear existing data first
    await collection.deleteMany({});

    const result = await collection.insertMany(stations);
    console.log(`✅ Inserted ${result.insertedCount} police stations into MongoDB`);

    await client.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

fetchAndInsert();