const axios = require("axios");
const { MongoClient } = require("mongodb");

// --- CONFIG ---
const overpassUrl = "https://overpass-api.de/api/interpreter";
const mongoUri = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";
const dbName = "hello";

// 1️⃣ Define cities
// const cities = ["Newry", "Dublin"]; // Add more cities as needed
const cities=["Rabat"]

// 2️⃣ Categories → OSM Tags mapping
const categories = {
  racecourse: { emoji: "🏇", query: 'leisure="racecourse"' },
  park: { emoji: "🌳", query: 'leisure="park"' },
  pint: { emoji: "🍺", query: 'amenity="pub"' },
  atm: { emoji: "🏧", query: 'amenity="atm"' },
  historic: { emoji: "🏰", query: 'historic' },
  museum: { emoji: "🖼️", query: 'tourism="museum"' },
  beach: { emoji: "🏖️", query: 'natural="beach"' },
  cafe: { emoji: "☕", query: 'amenity="cafe"' },
  restaurant: { emoji: "🍽️", query: 'amenity="restaurant"' },
  viewpoint: { emoji: "🔭", query: 'tourism="viewpoint"' },
  college: { emoji: "🎓", query: 'amenity="college"' },
  church: { emoji: "⛪", query: 'amenity="place_of_worship"' },
  art: { emoji: "🎨", query: 'tourism="gallery"' },
  cricket: { emoji: "🏏", query: 'sport="cricket"' },
  bookstore: { emoji: "📚", query: 'shop="books"' },
  grocery: { emoji: "🛒", query: 'shop="supermarket"' },
  hospital: { emoji: "🩺", query: 'amenity="hospital"' },
  pharmacy: { emoji: "💊", query: 'amenity="pharmacy"' },
  icecream: { emoji: "🍦", query: 'amenity="ice_cream"' },
  womenbeauty: { emoji: "💇‍♀️", query: 'shop="beauty"' },
//   leisure: { emoji: "🎭", query: 'leisure' },
//   retailshops: { emoji: "🛍️", query: 'shop' },
  hospitality: { emoji: "🏨", query: 'tourism="hotel"' },
  health: { emoji: "🏥", query: 'amenity="clinic"' },
  police: { emoji: "👮", query: 'amenity="police"' },
};

// 3️⃣ Build Overpass query
function buildQuery(query, cityName) {
  return `
[out:json][timeout:25];
area["wikidata"="Q3551"]->.searchArea;
nwr[${query}](area.searchArea);
out center;
`;
}

// 4️⃣ Build description
function buildDescription(tags) {
  const parts = [];
  if (tags["addr:housenumber"]) parts.push(`House No: ${tags["addr:housenumber"]}`);
  if (tags["addr:street"]) parts.push(`Street: ${tags["addr:street"]}`);
  if (tags["addr:city"]) parts.push(`City: ${tags["addr:city"]}`);
  if (tags["addr:postcode"]) parts.push(`Postcode: ${tags["addr:postcode"]}`);
  if (tags["phone"]) parts.push(`📞 ${tags["phone"]}`);
  if (tags["website"]) parts.push(`🌐 <a href="${tags["website"]}" target="_blank">${tags["website"]}</a>`);
  if (tags["opening_hours"]) parts.push(`🕒 Hours: ${tags["opening_hours"]}`);
  if (tags["cuisine"]) parts.push(`🍴 Cuisine: ${tags["cuisine"]}`);
  if (tags["operator"]) parts.push(`Managed by: ${tags["operator"]}`);
  if (tags["tourism"]) parts.push(`Tourism: ${tags["tourism"]}`);
  if (tags["historic"]) parts.push(`Historic: ${tags["historic"]}`);
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
        if(!tags.name)
            return;
        // const fname = tags.name ? capitalizeFirst(tags.name) : `${catName}#${String(e.id).slice(-5)}`;
        const fname=capitalizeFirst(tags.name);
        return {
          coords: e.lat && e.lon ? [e.lat, e.lon] : e.center ? [e.center.lat, e.center.lon] : null,
          name: fname,
          description: buildDescription(tags),
          category: catName,
          keywords: Object.values(tags).slice(0, 10),
          osmId: e.id,
        };
      })
      .filter((s) => s.coords !== null);
  } catch (err) {
    console.error(`❌ Error fetching ${catName} for ${cityName}:`, err.message);
    return [];
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
      const items = await fetchCategory(catName, cfg, cityName);

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