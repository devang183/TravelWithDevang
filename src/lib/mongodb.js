// lib/mongodb.js - MongoDB connection utility with KMS encryption
import { MongoClient } from 'mongodb';
import { getDecryptedMongoURI } from './kms';

const options = {};

let clientPromise;

// Check if encrypted URI is available, otherwise fall back to plain URI
const useEncryption = !!process.env.ENCRYPTED_MONGODB_URI;

if (!process.env.ENCRYPTED_MONGODB_URI && !process.env.MONGODB_URI) {
  throw new Error('Add ENCRYPTED_MONGODB_URI (recommended) or MONGODB_URI to .env.local');
}

async function getMongoClient() {
  let uri;

  if (useEncryption) {
    // Decrypt URI using KMS
    uri = await getDecryptedMongoURI('ENCRYPTED_MONGODB_URI');
  } else {
    // Use plain URI (backward compatibility - not recommended)
    console.warn('⚠️  Using unencrypted MONGODB_URI. Please migrate to ENCRYPTED_MONGODB_URI for better security.');
    uri = process.env.MONGODB_URI;
  }

  const mongoClient = new MongoClient(uri, options);
  return mongoClient.connect();
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = getMongoClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = getMongoClient();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;