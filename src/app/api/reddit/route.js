// app/api/reddit/route.js
import { NextResponse } from 'next/server';

// In-memory cache to reduce Reddit API calls (industry standard pattern)
// Structure: { cacheKey: { data, timestamp } }
const cache = new Map();
const CACHE_DURATION = {
  posts: 10 * 60 * 1000,    // 10 minutes for subreddit posts
  comments: 5 * 60 * 1000,  // 5 minutes for comments
};

// Simple rate limiter (industry standard: token bucket algorithm)
const rateLimiter = new Map();
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(identifier) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window

  // Clean old entries
  const requests = (rateLimiter.get(identifier) || []).filter(time => time > windowStart);

  if (requests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false; // Rate limit exceeded
  }

  requests.push(now);
  rateLimiter.set(identifier, requests);
  return true;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get('subreddit') || 'Dublin';
    const timeframe = searchParams.get('t') || 'week';
    const limit = searchParams.get('limit') || '100';
    const permalink = searchParams.get('permalink'); // For fetching specific post comments

    // Generate cache key based on request parameters
    const cacheKey = permalink
      ? `comment:${permalink}`
      : `posts:${subreddit}:${timeframe}:${limit}`;

    // Check in-memory cache first (fastest)
    const cached = cache.get(cacheKey);
    const now = Date.now();
    const cacheType = permalink ? 'comments' : 'posts';

    if (cached && (now - cached.timestamp) < CACHE_DURATION[cacheType]) {
      console.log(`[Reddit API] Cache HIT for ${cacheKey}`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, s-maxage=${CACHE_DURATION[cacheType] / 1000}, stale-while-revalidate=${CACHE_DURATION[cacheType] / 1000 * 2}`,
        },
      });
    }

    console.log(`[Reddit API] Cache MISS for ${cacheKey}`);

    // Rate limiting check (prevent abuse)
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          }
        }
      );
    }

    let url;
    let cacheTime = 600; // 10 minutes default

    // If permalink is provided, fetch that specific post/comments
    if (permalink) {
      url = `https://old.reddit.com${permalink}.json`;
      cacheTime = 300; // 5 minutes for comments (they update more frequently)
    } else {
      // Fetch subreddit top posts - Use old.reddit.com (more reliable for JSON API)
      url = `https://old.reddit.com/r/${subreddit}/top/.json?t=${timeframe}&limit=${limit}`;
    }

    console.log(`[Reddit API] Fetching from: ${url}`);

    // Fetch from Reddit API server-side (no CORS issues)
    // Try multiple times with different strategies
    let data = null;
    let lastError = null;

    // Strategy 1: Try old.reddit.com with extended timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TravelWithDevang/1.0; +https://travelwithdevang.com)',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
        // Next.js built-in cache (separate from our in-memory cache)
        next: { revalidate: cacheTime }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle Reddit API rate limiting
        if (response.status === 429) {
          throw new Error('Reddit rate limited');
        }
        throw new Error(`Reddit API returned ${response.status}`);
      }

      data = await response.json();
      console.log(`[Reddit API] Successfully fetched from old.reddit.com`);
    } catch (error) {
      lastError = error;
      console.log(`[Reddit API] old.reddit.com failed: ${error.message}`);

      // Strategy 2: Try www.reddit.com as fallback
      try {
        const wwwUrl = url.replace('old.reddit.com', 'www.reddit.com');
        console.log(`[Reddit API] Trying fallback: ${wwwUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(wwwUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TravelWithDevang/1.0; +https://travelwithdevang.com)',
            'Accept': 'application/json',
          },
          signal: controller.signal,
          next: { revalidate: cacheTime }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          data = await response.json();
          console.log(`[Reddit API] Successfully fetched from www.reddit.com`);
        } else {
          throw new Error(`www.reddit.com returned ${response.status}`);
        }
      } catch (wwwError) {
        console.log(`[Reddit API] www.reddit.com also failed: ${wwwError.message}`);
        // Both strategies failed - will return mock data below
      }
    }

    // If all strategies failed, return informative error with suggestion to use cached/mock data
    if (!data) {
      console.error('[Reddit API] All fetch strategies failed. Returning error.');
      return NextResponse.json(
        {
          error: 'Reddit API unavailable',
          message: 'Could not fetch data from Reddit. This may be due to rate limiting or network issues.',
          suggestion: 'Consider implementing static fallback data or using Reddit OAuth API',
          lastError: lastError?.message
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: now
    });

    // Clean cache periodically (prevent memory leak)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`,
      },
    });
  } catch (error) {
    console.error('Reddit API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch Reddit data',
        message: error.message
      },
      { status: 500 }
    );
  }
}
