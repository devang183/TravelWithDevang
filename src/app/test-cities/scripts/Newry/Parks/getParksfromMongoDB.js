const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// --- CONFIG ---
const mongoUri = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/"; // update if needed
const dbName = "hello";
const collectionName = "Newry";
const outputFile = path.join(__dirname, "newry-park-pins.json"); // output file

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 100000); // Limit to 5 digits
  }

async function generateCityMapPins() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const parks = await collection.find({}).toArray();

    const formattedPins = parks.map((s) => {
      const name = `${s.name} Park ${hashString(s.name)}`;
      const coords = s.coords; // [lat, lon]
      const descriptionParts = [];
      if (s.street) descriptionParts.push(`Street: ${s.street}`);
      if (s.city) descriptionParts.push(`City: ${s.city}`);
      if (s.country) descriptionParts.push(`Country: ${s.country}`);

      const description =
        descriptionParts.length > 0
          ? descriptionParts.join("<br>")
          : "No additional information available";

      const keywords = [s.name, s.street, s.city, "health"].filter(Boolean);

      return {
        coords,
        name,
        description,
        category: "park", // set category for parks
        keywords,
      };
    });

    fs.writeFileSync(outputFile, JSON.stringify(formattedPins, null, 2), "utf8");
    console.log(`✅ CityMapPins JSON saved to ${outputFile}`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

generateCityMapPins();