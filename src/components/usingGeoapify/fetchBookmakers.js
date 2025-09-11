import { MongoClient } from "mongodb";
import fetch from "node-fetch";

const MONGO_URI = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";
const DB_NAME = "hello";
const TARGET_COLLECTION = "dublin"; 
const GEOAPIFY_API_KEY = "59a8c6ca8ade47f2abe3fc77830c3711";

// Dublin coordinates
const DUBLIN_COORDS = {
  lat: 53.3498,
  lon: -6.2603
};

// Search radius in meters (10km)
const RADIUS = 10000;

// Category to fetch
const CATEGORY = 'service.bookmaker';

async function fetchBookmakers() {
  const client = new MongoClient(MONGO_URI);
  let placesProcessed = 0;
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db(DB_NAME);
    const collection = database.collection(TARGET_COLLECTION);
    
    // Check if we have existing bookmakers to avoid duplicates
    const existingCount = await collection.countDocuments({ category: 'bookmaker' });
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing bookmakers in the database.`);
      const update = confirm('Do you want to update existing bookmakers? (y/n)');
      if (!update) {
        console.log('Operation cancelled by user.');
        return;
      }
    }
    
    console.log(`Fetching ${CATEGORY} in Dublin...`);
    
    // Fetch places from Geoapify
    const url = `https://api.geoapify.com/v2/places?categories=${CATEGORY}&filter=circle:${DUBLIN_COORDS.lon},${DUBLIN_COORDS.lat},${RADIUS}&limit=100&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log('No bookmakers found in the specified area.');
      return;
    }
    
    console.log(`Found ${data.features.length} bookmakers. Processing...`);
    
    // Process each place
    for (const feature of data.features) {
      const { properties, geometry } = feature;
      
      // Extract address components
      const addressParts = [
        properties.address_line1,
        properties.address_line2,
        properties.city,
        properties.country
      ].filter(Boolean);
      
      const description = addressParts.filter(Boolean).join(', ');
      
      // Extract content between first two commas in description
      const descriptionParts = description.split(',');
      let nameSuffix = '';
      if (descriptionParts.length > 2) {
        // Get content after first comma and before second comma, then clean it up
        nameSuffix = descriptionParts[1].trim();
        // Remove any common address terms that might be redundant
        nameSuffix = nameSuffix
          .replace(/^\d+\s*/, '')  // Remove leading numbers
          .replace(/\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Square|Sq|Boulevard|Blvd|Drive|Dr|Place|Pl|Court|Ct|Terrace|Tce|Hill|Hill|Park|Pk|Upper|Lower|North|South|East|West|N|S|E|W)\b/gi, '')  // Remove common address terms
          .trim();
      }

      // Create the name by combining the original name and the extracted suffix (if any)
      const originalName = properties.name || 'Unnamed Bookmaker';
      const displayName = nameSuffix && !originalName.includes(nameSuffix) 
        ? `${originalName} ${nameSuffix}`.trim() 
        : originalName;
      
      const keywords = [
        properties.city,
        properties.address_line1?.split(' ').pop(), // Get street number if exists
        properties.address_line1?.split(' ').slice(0, -1).join(' '), // Get street name without number
        displayName,
        'bookmaker',
        ...(nameSuffix ? [nameSuffix] : []) // Add the suffix as a separate keyword if it exists
      ].filter(Boolean);
      
      const bookmakerData = {
        osmId: properties.osm_id || null,
        category: 'bookmaker',
        coords: [
          geometry.coordinates[1], // lat
          geometry.coordinates[0]  // lng
        ],
        description: description,
        keywords: [...new Set(keywords)], // Remove any duplicate keywords
        name: displayName,
        address: displayName,
        categories: [
          'commercial',
          'service',
          CATEGORY
        ],
        opening_hours: properties.opening_hours || null,
        phone: properties.phone || null,
        place_id: properties.place_id || null,
        updated: true,
        updated_at: new Date(),
        website: properties.website || null
      };
      
      // Check if this place already exists in the database
      const existing = await collection.findOne({
        'coords': bookmakerData.coords,
        category: 'bookmaker'
      });
      
      if (existing) {
        // Update existing record but preserve the _id
        const { _id, ...updateData } = bookmakerData;
        await collection.updateOne(
          { _id: existing._id },
          { $set: updateData }
        );
        console.log(`Updated: ${bookmakerData.name}`);
      } else {
        // Insert new record
        await collection.insertOne(bookmakerData);
        console.log(`Added: ${bookmakerData.name}`);
      }
      
      placesProcessed++;
    }
    
    console.log(`\nProcessing complete! Processed ${placesProcessed} bookmakers.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
fetchBookmakers().catch(console.error);
