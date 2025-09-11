import { MongoClient, ObjectId } from "mongodb";
import fetch from "node-fetch";

const MONGO_URI = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";
const DB_NAME = "hello";
const TARGET_COLLECTION = "dublin1"; 
const GEOAPIFY_API_KEY = "59a8c6ca8ade47f2abe3fc77830c3711";

// Dublin coordinates
const DUBLIN_COORDS = {
  lat: 53.3498,
  lon: -6.2603
};

// Search radius in meters (10km)
const RADIUS = 10000;

// Categories to fetch
const CATEGORIES = [
  'tourism.sights.place_of_worship.church',
  'tourism.sights.place_of_worship.cathedral',
  'tourism.sights.place_of_worship.chapel'
];

async function fetchPlacesOfWorship() {
  const client = new MongoClient(MONGO_URI);
  let placesProcessed = 0;
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(TARGET_COLLECTION);
    
    // Clear existing data in the collection
    await collection.deleteMany({});
    console.log(`Cleared existing data from ${TARGET_COLLECTION} collection`);
    
    // Array to store all places
    const allPlaces = [];
    
    // Fetch data for each category
    for (const category of CATEGORIES) {
      const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${DUBLIN_COORDS.lon},${DUBLIN_COORDS.lat},${RADIUS}&limit=100&apiKey=${GEOAPIFY_API_KEY}`;
      
      console.log(`Fetching ${category} from Geoapify...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching ${category}:`, errorText);
        continue; // Skip to next category if there's an error
      }
      
      const data = await response.json();
      const places = data.features || [];
      console.log(`Found ${places.length} places for ${category}`);
      
      if (places.length > 0) {
        // Transform places to match desired format
        const transformedPlaces = places.map(place => {
          const props = place.properties;
          const addressParts = [
            props.address_line1 && `Street: ${props.address_line1}`,
            props.city && `City: ${props.city}`,
            props.website && `🌐 <a href="${props.website}" target="_blank">${props.website}</a>`
          ].filter(Boolean);
          
          return {
            _id: new ObjectId(),
            osmId: props.osm_id || null,
            category: 'church',
            coords: [
              place.geometry.coordinates[1], // lat
              place.geometry.coordinates[0]  // lon
            ],
            description: addressParts.join('<br>'),
            keywords: [
              props.city || 'Dublin',
              props.address_line1 || '',
              'place_of_worship',
              'church',
              props.name || '',
              'christian',
              props.website || ''
            ].filter(Boolean),
            name: props.name || 'Unnamed Place of Worship'
          };
        });
        
        allPlaces.push(...transformedPlaces);
      }
    }
    
    // Insert all places into MongoDB
    if (allPlaces.length > 0) {
      const result = await collection.insertMany(allPlaces);
      placesProcessed = result.insertedCount;
      console.log(`Successfully inserted ${placesProcessed} places of worship`);
    } else {
      console.log("No places of worship found to insert");
    }
    
    // Create a geospatial index for better querying
    await collection.createIndex({ "coords": "2dsphere" });
    console.log("Created 2dsphere index on coords field");
    
    return placesProcessed;
    
  } catch (error) {
    console.error("Error in fetchPlacesOfWorship:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Export the main function
export default fetchPlacesOfWorship;

async function main() {
  const startTime = new Date();
  console.log("Starting places of worship data fetch...");
  
  try {
    const savedCount = await fetchPlacesOfWorship();
    
    if (savedCount > 0) {
      console.log(`✅ Successfully saved ${savedCount} places of worship to MongoDB`);
    } else {
      console.log("ℹ️ No places of worship found in the specified area.");
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
