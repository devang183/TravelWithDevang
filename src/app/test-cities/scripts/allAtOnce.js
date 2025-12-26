const axios = require("axios");
const { MongoClient } = require("mongodb");

// --- CONFIG ---
const overpassUrl = "https://overpass-api.de/api/interpreter";
const mongoUri = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";
const dbName = "hello";

// 1️⃣ Define cities
// const cities = ["Newry", "Dublin"]; // Add more cities as needed
// const cities=["Bengaluru"]
const cities=["Dublin","London","Belfast","Liverpool","Birmingham", "Manchester","Leeds","Rabat","Raipur","Delhi","Malahide","Naas","Maynooth","Newquay","Bengaluru"]

// 2️⃣ Categories → OSM Tags mapping
const categories = {
  // Work-Friendly Venues (WiFi + Power Outlets)
  cafe_wifi: { emoji: "☕📶", query: 'amenity="cafe"]["internet_access"~"wlan|yes"' },
  cafe_power: { emoji: "☕🔌", query: 'amenity="cafe"]["socket"' },
  restaurant_wifi: { emoji: "🍽️📶", query: 'amenity="restaurant"]["internet_access"~"wlan|yes"' },
  restaurant_power: { emoji: "🍽️🔌", query: 'amenity="restaurant"]["socket"' },
  library_wifi: { emoji: "📚📶", query: 'amenity="library"]["internet_access"~"wlan|yes"' },
  coworking: { emoji: "💼", query: 'amenity="coworking_space"' },

  // Other categories (commented out for now, uncomment as needed)
  // police: { emoji: "👮", query: 'amenity="police"' },
  // dentist: {emoji: "🦷", query:'amenity="dentist"'},
  // sports:{emoji:"🏆",query:'sport~"football|rugby|tennis|badminton"'}
};

// 3️⃣ Build Overpass query
function buildQuery(query, cityName) {
  return `
//   [out:json][timeout:25];
// // fetch area County Dublin” to search in
// area["name"="County ${cityName}"]->.searchArea;
// // gather results
// nwr[${query}](area.searchArea);
// // print results
// out geom;

  [out:json][timeout:30];
  // Search area for ${cityName}
  area["name"="${cityName}"]->.searchArea;
  (
    node[${query}](area.searchArea);
    way[${query}](area.searchArea);
    relation[${query}](area.searchArea);
  );

  // Output
  out body;
  >;
  out skel qt;
  `;
}

// [out:json][timeout:25];
// // fetch area County Dublin” to search in
// area["name"="${cityName}"]->.searchArea;
// // gather results
// nwr[${query}]["name"~"Paddy"](area.searchArea);
// // print results
// out geom;
// `;
// }
// function buildQuery(query, cityName) {
//   return `
// [out:json][timeout:25];
// area["wikidata"="Q466046"]->.searchArea;
// nwr[${query}](area.searchArea);
// out center;
// `;
// }


// 4️⃣ Build description
function buildDescription(tags) {
  const parts = [];

  // Work-friendly amenities (priority display)
  if (tags["internet_access"] === "wlan" || tags["internet_access"] === "yes") {
    const feeInfo = tags["internet_access:fee"] === "no" ? " (Free)" : "";
    parts.push(`📶 WiFi Available${feeInfo}`);
  }
  if (tags["socket"] || tags["socket:usb"] || tags["socket:eu"] || tags["socket:us"]) {
    parts.push(`🔌 Power Outlets Available`);
  }

  // Address info
  if (tags["addr:housenumber"]) parts.push(`House No: ${tags["addr:housenumber"]}`);
  if (tags["addr:street"]) parts.push(`Street: ${tags["addr:street"]}`);
  if (tags["addr:city"]) parts.push(`City: ${tags["addr:city"]}`);
  if (tags["addr:postcode"]) parts.push(`Postcode: ${tags["addr:postcode"]}`);

  // Contact & hours
  if (tags["phone"]) parts.push(`📞 ${tags["phone"]}`);
  if (tags["website"]) parts.push(`🌐 <a href="${tags["website"]}" target="_blank">${tags["website"]}</a>`);
  if (tags["opening_hours"]) parts.push(`🕒 Hours: ${tags["opening_hours"]}`);

  // Additional details
  if (tags["cuisine"]) parts.push(`🍴 Cuisine: ${tags["cuisine"]}`);
  if (tags["operator"]) parts.push(`Managed by: ${tags["operator"]}`);
  if (tags["tourism"]) parts.push(`Tourism: ${tags["tourism"]}`);
  if (tags["historic"]) parts.push(`Historic: ${tags["historic"]}`);
  if (tags["surface"]) parts.push(`Surface: ${tags["surface"]}`);

  return parts.join("<br>") || "No additional info available";
}

// Helper to capitalize first letter
function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 5️⃣ Fetch category data for a city
async function fetchCategory(catName, cfg, cityName) {
  try {
    const response = await axios.post(overpassUrl, buildQuery(cfg.query, cityName), {
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.data || !response.data.elements) return [];

    return response.data.elements
      .map((e) => {
        const tags = e.tags || {};
        const fname = tags.name ? capitalizeFirst(tags.name) : `${catName}#${String(e.id).slice(-5)}`;
        return {
          coords: e.lat && e.lon ? [e.lat, e.lon] : e.center ? [e.center.lat, e.center.lon] : null,
          name: fname,
          description: buildDescription(tags),
          category: catName,
          keywords: Object.values(tags).slice(0, 10),
          osmId: e.id,
          // Store work-friendly metadata
          tags: {
            internet_access: tags.internet_access,
            'internet_access:fee': tags['internet_access:fee'],
            socket: tags.socket,
            'socket:usb': tags['socket:usb'],
            'socket:eu': tags['socket:eu'],
            'socket:us': tags['socket:us'],
            opening_hours: tags.opening_hours,
            website: tags.website,
            phone: tags.phone,
            cuisine: tags.cuisine,
            amenity: tags.amenity,
          },
          website: tags.website,
          phone: tags.phone,
        };
      })
      .filter((s) => s.coords !== null);
  } catch (err) {
    console.error(`❌ Error fetching ${catName} for ${cityName}:`, err.message);
    return [];
  }
}

async function fetchWithRetry(catName, cfg, cityName, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fetchCategory(catName, cfg, cityName);

      if (result.length > 0) {
        // Success: non-empty result
        return result;
      } else {
        throw new Error("Empty result"); // trigger retry if zero items
      }
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed or returned empty for ${catName} in ${cityName}: ${err.message}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delayMs / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delayMs));
      } else {
        console.error(`❌ All ${retries} attempts failed or empty for ${catName} in ${cityName}. Skipping.`);
        return [];
      }
    }
  }
}

// 6️⃣ Loop through cities & insert into MongoDB
async function fetchAndInsertAll() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);

  for (const cityName of cities) {
    const collectionName = cityName.toLowerCase();
    const collection = db.collection(collectionName);
    console.log(`🏙️ Processing city: ${cityName}`);

    for (const [catName, cfg] of Object.entries(categories)) {
      console.log(`🔎 Fetching ${catName} for ${cityName}...`);
      const items = await fetchWithRetry(catName, cfg, cityName);

      for (const item of items) {
        await collection.updateOne(
          { osmId: item.osmId },
          { $set: item },
          { upsert: true }
        );
      }

      console.log(`✅ Inserted/Updated ${items.length} items for ${catName} in ${cityName}`);
    }
  }

  await client.close();
  console.log("🎉 Done inserting all cities!");
}

// Run the script
fetchAndInsertAll();