import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';

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

    // Check in-memory cache first
    const cacheKey = `pins:${cityId}`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log(`Cache HIT for ${cityId}`);
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
          'X-Cache-Status': 'HIT'
        }
      });
    }

    console.log(`Cache MISS for ${cityId} - fetching from DB`);

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(cityId);

    const pins = await collection.find({}).toArray();

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
    return NextResponse.json(
      { error: 'Failed to fetch pins', details: error.message },
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