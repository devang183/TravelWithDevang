import { MongoClient } from "mongodb";
import fetch from "node-fetch";

const MONGO_URI = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";
const DB_NAME = "hello";
const COLLECTION_NAME = "dublin";
const GEOAPIFY_API_KEY = "59a8c6ca8ade47f2abe3fc77830c3711";

// Step 1: Search for nearby place to get place_id
async function fetchPlaceId(lat, lon, category = "service.bookmaker") {
  const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},50&limit=1&apiKey=${GEOAPIFY_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geoapify Places API error: ${res.statusText}`);
  }

  const data = await res.json();
  const feature = data.features?.[0];

  if (!feature) {
    console.warn(`No place found near [${lat}, ${lon}]`);
    return null;
  }

  return {
    place_id: feature.properties.place_id,
    name: feature.properties.name,
    address: feature.properties.address_line1,
  };
}

// Step 2: Fetch detailed place info
async function fetchPlaceDetails(placeId) {
  const url = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${GEOAPIFY_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geoapify Place Details API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.features?.[0]?.properties || null;
}

// Step 3: Update MongoDB
async function enrichFuelStations() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    // Fetch only documents that haven't been updated yet
    const pins = await collection.find({ 
      category: "paddypower",
      $or: [
        { updated: { $exists: false } },  // Either 'updated' field doesn't exist
        { updated: false }                // Or 'updated' is explicitly false
      ]
    }).toArray();
    console.log(`Found ${pins.length} pins to update.`);

    for (const pin of pins) {
      const [lat, lon] = pin.coords;

      console.log(`\nProcessing: ${pin.name} at [${lat}, ${lon}]`);

      // 1. Get place_id
      const placeData = await fetchPlaceId(lat, lon, "service.bookmaker");
      if (!placeData) continue;

      console.log(`Found place_id: ${placeData.place_id} (${placeData.name})`);

      // 2. Get detailed info
      const details = await fetchPlaceDetails(placeData.place_id);
      if (!details) {
        console.warn(`No details found for place_id: ${placeData.place_id}`);
        continue;
      }

      // 3. Prepare fields for update
      const updateFields = {
        place_id: placeData.place_id,
        name: details.name || placeData.name,
        address: details.address_line1 || placeData.address,
        phone: details.contact?.phone || null,
        website: details.contact?.website || details.operator_details?.website || null,
        opening_hours: details.opening_hours || null,
        categories: details.categories || [],
        description: details.formatted || pin.description,
        updated: true,  // Flag to indicate this pin has been updated
        updated_at: new Date()  // Optional: add timestamp of update
      };

      // 4. Update MongoDB
      await collection.updateOne(
        { _id: pin._id },
        { $set: updateFields }
      );

      console.log(`Updated: ${updateFields.name}`);
    }

    console.log("\nAll fuel stations processed!");
  } catch (error) {
    console.error("Error updating fuel gas pins:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

enrichFuelStations();