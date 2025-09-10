import { MongoClient, ObjectId } from "mongodb";
import fetch from "node-fetch";

const MONGO_URI = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";
const DB_NAME = "hello";
const COLLECTION_NAME = "dublin";
const GEOAPIFY_API_KEY = "59a8c6ca8ade47f2abe3fc77830c3711";

// Dublin coordinates
const DUBLIN_COORDS = {
  lat: 53.3498,
  lon: -6.2603
};

// Search radius in meters (10km)
const RADIUS = 10000;

async function fetchCasinos() {
  const url = `https://api.geoapify.com/v2/places?categories=adult.casino&filter=circle:${DUBLIN_COORDS.lon},${DUBLIN_COORDS.lat},${RADIUS}&limit=100&apiKey=${GEOAPIFY_API_KEY}`;
  
  try {
    console.log("Fetching casinos from Geoapify...");
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geoapify API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.features?.length || 0} casinos`);
    return data.features || [];
  } catch (error) {
    console.error("Error fetching casinos:", error);
    return [];
  }
}

async function saveToMongoDB(places) {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Prepare documents to match the desired format
    const documents = places.map(place => {
      const categories = [
        'adult',
        'adult.casino',
        ...(place.properties.wheelchair ? [`wheelchair.${place.properties.wheelchair}`] : [])
      ];
      
      return {
        _id: new ObjectId(),
        osmId: place.properties.osm_id || null,
        category: 'casino',
        coords: [
          place.geometry.coordinates[1],
          place.geometry.coordinates[0]
        ],
        description: [
          place.properties.name,
          place.properties.address_line1,
          place.properties.address_line2,
          'Dublin',
          'Ireland'
        ].filter(Boolean).join(', '),
        keywords: [
          'casino',
          new Date().toISOString().split('T')[0],
          place.properties.name,
          place.properties.wheelchair || 'no',
          place.properties.smoking || 'no',
          place.properties.outdoor_seating || 'no',
          place.properties.delivery || 'no',
          place.properties.takeaway || 'no'
        ],
        name: place.properties.name,
        address: place.properties.formatted || place.properties.address_line1 || place.properties.address_line2 || '',
        categories: categories,
        opening_hours: place.properties.opening_hours || null,
        phone: place.properties.phone || null,
        place_id: place.properties.place_id,
        updated: true,
        updated_at: new Date(),
        website: place.properties.website || null
      };
    });
    
    if (documents.length > 0) {
      const result = await collection.insertMany(documents);
      console.log(`Successfully inserted ${result.insertedCount} casinos`);
      return result.insertedCount;
    } else {
      console.log("No casinos found to insert");
      return 0;
    }
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function main() {
  const startTime = new Date();
  console.log("Starting casino data fetch...");
  
  try {
    const casinos = await fetchCasinos();
    
    if (casinos.length > 0) {
      const savedCount = await saveToMongoDB(casinos);
      console.log(`✅ Successfully processed ${savedCount} casinos`);
    } else {
      console.log("ℹ️ No casinos found in the specified area.");
    }
    
    const duration = (new Date() - startTime) / 1000;
    console.log(`🏁 Completed in ${duration.toFixed(2)} seconds`);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
