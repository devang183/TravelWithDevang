import clientPromise from "@/lib/mongodb2";
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

export async function GET(request) {
  try {
    // Check in-memory cache first
    const cacheKey = 'pins:newyork';
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log('Cache HIT for New York');
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
          'X-Cache-Status': 'HIT'
        }
      });
    }

    console.log('Cache MISS for New York - fetching from DB');

    const client = await clientPromise;
    const db = client.db('hello2');
    const collection = db.collection('newyork');

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
    console.error('Database error for New York:', error);
    return NextResponse.json(
      { error: 'Failed to fetch New York pins', details: error.message },
      { status: 500 }
    );
  }
}
