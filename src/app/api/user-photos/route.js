/**
 * User Photos API Endpoint
 * Fetches photos uploaded by users from MongoDB hello2 database
 *
 * Features:
 * - Retrieves photos from user-specific collections
 * - Filters by cityId if provided
 * - Returns photo metadata with base64 image data
 * - OWASP compliant with authentication checks
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateCityId } from '@/lib/security';
import { MongoClient } from 'mongodb';

// MongoDB connection for hello2 database
const MONGODB_URI2 = process.env.ENCRYPTED_MONGODB_URI2
  ? process.env.ENCRYPTED_MONGODB_URI2
  : process.env.MONGODB_URI2;

export async function GET(request) {
  let client;

  try {
    // SECURITY: Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to view photos' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const username = searchParams.get('username');

    // Determine which user's photos to fetch
    let targetUsername;
    if (username) {
      // Fetch specific user's photos (for public viewing)
      targetUsername = username;
    } else {
      // Fetch current user's photos
      targetUsername = session.user.name || session.user.email.split('@')[0];
    }

    // Sanitize username for MongoDB collection naming
    const collectionName = `photos_${targetUsername.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Connect to MongoDB (hello2 database)
    client = await MongoClient.connect(MONGODB_URI2);
    const db = client.db('hello2');

    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      // Collection doesn't exist, return empty array
      return NextResponse.json({
        photos: [],
        count: 0,
        username: targetUsername
      });
    }

    const collection = db.collection(collectionName);

    // Build query
    let query = {};
    if (cityId) {
      // SECURITY: Validate cityId
      try {
        const validatedCityId = validateCityId(cityId);
        query.cityId = validatedCityId;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid city identifier' },
          { status: 400 }
        );
      }
    }

    // Fetch photos (limit to 100 for performance)
    const photos = await collection
      .find(query)
      .sort({ uploadedAt: -1 })
      .limit(100)
      .toArray();

    // Transform photos for response
    const transformedPhotos = photos.map(photo => ({
      id: photo._id.toString(),
      cityId: photo.cityId,
      filename: photo.filename,
      contentType: photo.contentType,
      size: photo.size,
      imageData: photo.imageData, // Base64 encoded
      dataUrl: `data:${photo.contentType};base64,${photo.imageData}`,
      uploadedBy: photo.uploadedBy,
      uploadedAt: photo.uploadedAt,
      metadata: photo.metadata
    }));

    return NextResponse.json({
      photos: transformedPhotos,
      count: transformedPhotos.length,
      username: targetUsername
    });

  } catch (error) {
    console.error('[User Photos] Error fetching photos:', error);

    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Failed to fetch photos',
        message: isDevelopment
          ? `Fetch failed: ${error.message}`
          : 'An error occurred while fetching photos'
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
