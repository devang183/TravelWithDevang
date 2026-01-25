/**
 * Photo Upload API Endpoint
 * SECURITY: OWASP Top 10:2025 compliant
 *
 * Features:
 * - Validates user authentication
 * - Validates file type and size
 * - Stores photos in MongoDB (hello2 database)
 * - Organizes by user account with metadata
 * - Rate limiting
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Rate limiter for uploads (prevent abuse)
const uploadAttempts = new Map();
const MAX_UPLOADS_PER_HOUR = 10;

function checkUploadRateLimit(userId) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const attempts = (uploadAttempts.get(userId) || []).filter(time => time > oneHourAgo);

  if (attempts.length >= MAX_UPLOADS_PER_HOUR) {
    return false;
  }

  attempts.push(now);
  uploadAttempts.set(userId, attempts);
  return true;
}

/**
 * Validate file type by checking both MIME type and magic bytes
 * SECURITY: Prevents malicious file uploads disguised as images
 */
function validateFileType(buffer, mimeType) {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return false;
  }

  // Check magic bytes (file signature)
  const magicBytes = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/jpg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]] // RIFF
  };

  const signatures = magicBytes[mimeType];
  if (!signatures) return false;

  return signatures.some(signature => {
    return signature.every((byte, index) => buffer[index] === byte);
  });
}

export async function POST(request) {
  let client;

  try {
    // SECURITY: Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to upload photos' },
        { status: 401 }
      );
    }

    // SECURITY: Rate limiting
    // Use email or id as user identifier (NextAuth may use either)
    const userId = session.user.id || session.user.email;
    if (!checkUploadRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: `Maximum ${MAX_UPLOADS_PER_HOUR} uploads per hour` },
        { status: 429 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const cityId = formData.get('cityId');

    // Validate inputs
    if (!file || !cityId) {
      return NextResponse.json(
        { error: 'Missing required fields', required: ['file', 'cityId'] },
        { status: 400 }
      );
    }

    // SECURITY: Validate cityId against whitelist
    let validatedCityId;
    try {
      validatedCityId = validateCityId(cityId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid city identifier' },
        { status: 400 }
      );
    }

    // SECURITY: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large', message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // SECURITY: Validate file extension
    const originalFilename = file.name.toLowerCase();
    const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: 'Invalid file type', message: 'Only JPG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer for validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // SECURITY: Validate file type by magic bytes
    if (!validateFileType(buffer, file.type)) {
      return NextResponse.json(
        { error: 'Invalid file', message: 'File does not match its declared type' },
        { status: 400 }
      );
    }

    // Connect to MongoDB (hello2 database)
    client = await MongoClient.connect(MONGODB_URI2);
    const db = client.db('hello2');

    // Get username from session (use email if name not available)
    const username = session.user.name || session.user.email.split('@')[0];

    // Create collection name based on username (sanitize for MongoDB collection naming)
    const collectionName = `photos_${username.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const collection = db.collection(collectionName);

    // Convert buffer to base64 for storage in MongoDB
    const base64Image = buffer.toString('base64');

    // Create photo document
    const photoDocument = {
      cityId: validatedCityId,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      imageData: base64Image, // Base64 encoded image
      uploadedBy: {
        name: session.user.name,
        email: session.user.email,
      },
      uploadedAt: new Date(),
      metadata: {
        originalFilename: file.name,
        fileExtension: extension,
        compressed: file.name.endsWith('.jpg'), // Indicate if it was compressed
      }
    };

    // Insert into MongoDB
    const result = await collection.insertOne(photoDocument);

    // Log successful upload
    console.log(`[Photo Upload] User ${session.user.email} uploaded ${file.name} to ${validatedCityId} in collection ${collectionName}`);

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: {
        id: result.insertedId.toString(),
        collectionName: collectionName,
        filename: file.name,
        cityId: validatedCityId,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.user.name || session.user.email,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Photo upload error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // SECURITY: Don't expose internal error details in production
    // But show helpful errors in development
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Failed to upload photo',
        message: isDevelopment
          ? `Upload failed: ${error.message}`
          : 'An error occurred while processing your upload',
        ...(isDevelopment && { details: error.stack })
      },
      { status: 500 }
    );
  } finally {
    // Close MongoDB connection
    if (client) {
      await client.close();
    }
  }
}

// Cleanup rate limiter periodically (prevent memory leaks)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [userId, attempts] of uploadAttempts.entries()) {
      const recentAttempts = attempts.filter(time => time > oneHourAgo);
      if (recentAttempts.length === 0) {
        uploadAttempts.delete(userId);
      } else {
        uploadAttempts.set(userId, recentAttempts);
      }
    }
  }, 60 * 60 * 1000); // Every hour
}
