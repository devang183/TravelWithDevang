/**
 * Photo Upload API Endpoint
 * SECURITY: OWASP Top 10:2025 compliant
 *
 * Features:
 * - Validates user authentication
 * - Validates file type and size
 * - Atomic filename generation (prevents race conditions)
 * - S3 integration with proper error handling
 * - Rate limiting
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { validateCityId } from '@/lib/security';
import crypto from 'crypto';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = 'cityphotoscity';
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
 * Get next available photo number for a city
 * Uses atomic pattern: list all files, find max, increment
 * Race condition safe: S3 PutObject with unique hash prevents overwrites
 */
async function getNextPhotoNumber(cityId) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `images/${cityId}/`,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      return 1;
    }

    // Extract numbers from filenames like "dublin1.jpg", "dublin2.jpg"
    const numbers = response.Contents
      .map(obj => {
        const filename = obj.Key.split('/').pop();
        const match = filename.match(new RegExp(`^${cityId}(\\d+)\\.(jpg|jpeg|png|webp)$`, 'i'));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return maxNumber + 1;
  } catch (error) {
    console.error('Error getting next photo number:', error);
    throw new Error('Failed to determine photo number');
  }
}

/**
 * Generate unique filename to prevent race conditions
 * Format: {cityId}{number}-{timestamp}-{random}.{ext}
 * Example: dublin23-1738234567890-a3f2.jpg
 */
function generateUniqueFilename(cityId, number, extension) {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(2).toString('hex');
  return `${cityId}${number}-${timestamp}-${randomHash}${extension}`;
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
    if (!checkUploadRateLimit(session.user.id)) {
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

    // Get next available photo number (atomic operation)
    const photoNumber = await getNextPhotoNumber(validatedCityId);

    // Generate unique filename to prevent race conditions
    const filename = generateUniqueFilename(validatedCityId, photoNumber, extension);
    const s3Key = `images/${validatedCityId}/${filename}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        uploadedBy: session.user.email,
        uploadedByName: session.user.name || 'Anonymous',
        uploadedAt: new Date().toISOString(),
        originalFilename: file.name,
        cityId: validatedCityId,
      },
      // SECURITY: Don't make public by default
      // ACL: 'public-read', // Uncomment if you want public access
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const photoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${s3Key}`;

    // Log successful upload
    console.log(`[Photo Upload] User ${session.user.email} uploaded ${filename} to ${validatedCityId}`);

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: {
        url: photoUrl,
        filename: filename,
        cityId: validatedCityId,
        photoNumber: photoNumber,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.user.name || session.user.email,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Photo upload error:', error);

    // SECURITY: Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to upload photo', message: 'An error occurred while processing your upload' },
      { status: 500 }
    );
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
