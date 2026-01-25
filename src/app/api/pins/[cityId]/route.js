import clientPromise from "@/lib/mongodb";
import clientPromise2 from "@/lib/mongodb2";
import { NextResponse } from 'next/server';
import { validateCityId } from "@/lib/security";

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export async function GET(request, context) {
  try {
    const { params } = context;
    const { cityId } = await params;

    // SECURITY: Validate cityId to prevent NoSQL injection
    const validatedCityId = validateCityId(cityId);

    // Check in-memory cache first
    const cacheKey = `pins:${validatedCityId}`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log(`Cache HIT for ${validatedCityId}`);
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
          'X-Cache-Status': 'HIT'
        }
      });
    }

    console.log(`Cache MISS for ${validatedCityId} - fetching from DB`);

    // Determine which database to use based on cityId
    let client, db, collection;

    if (validatedCityId.toLowerCase() === 'newyork') {
      // Use hello2 database for New York
      client = await clientPromise2;
      db = client.db('hello2');
      collection = db.collection('newyork');
    } else {
      // Use hello database for all other cities
      client = await clientPromise;
      db = client.db('hello');
      collection = db.collection(validatedCityId);
    }

    // SECURITY: Limit query results to prevent DoS
    const pins = await collection.find({}).limit(5000).toArray();

    const transformedPins = pins.map(pin => ({
      coords: pin.coords,
      name: pin.name,
      description: pin.description,
      category: pin.category,
      keywords: pin.keywords || [],
      url: pin.url || '#',
      videoId: pin.videoId || null,
      phone: pin.phone || null,
      website: pin.website || null
    }));

    // Store in cache
    setCachedData(cacheKey, transformedPins);

    return NextResponse.json(transformedPins, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        'X-Cache-Status': 'MISS'
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    // SECURITY: Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
  }
}

// import clientPromise from "@/lib/mongodb";

// export async function GET(request, { params }) {
//   try {
//     const client = await clientPromise;
//     const db = client.db('hello');
    
//     // You can use cityId to determine collection or add filtering
//     const { cityId } = params;
//     const collection = db.collection(cityId); // Or make this dynamic: db.collection(cityId)
    
//     const pins = await collection.find({}).toArray();
    
//     const transformedPins = pins.map(pin => ({
//       coords: pin.coords,
//       name: pin.name,
//       description: pin.description,
//       category: pin.category,
//       keywords: pin.keywords || [],
//       url: pin.url || '#',
//       videoId: pin.videoId || null
//     }));

//     return Response.json(transformedPins);
//   } catch (error) {
//     console.error('Database error:', error);
//     return Response.json({ error: 'Failed to fetch pins', details: error.message }, { status: 500 });
//   }
// }