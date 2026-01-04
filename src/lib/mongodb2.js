// lib/mongodb2.js - MongoDB connection utility for hello2 database with KMS encryption
import { MongoClient } from 'mongodb';
import { getDecryptedMongoURI } from './kms';

const options = {};

let clientPromise;

// Check if encrypted URI is available, otherwise fall back to plain URI
const useEncryption = !!process.env.ENCRYPTED_MONGODB_URI2;

if (!process.env.ENCRYPTED_MONGODB_URI2 && !process.env.MONGODB_URI2) {
  throw new Error('Add ENCRYPTED_MONGODB_URI2 (recommended) or MONGODB_URI2 to .env.local');
}

async function getMongoClient() {
  let uri;

  if (useEncryption) {
    // Decrypt URI using KMS
    uri = await getDecryptedMongoURI('ENCRYPTED_MONGODB_URI2');
  } else {
    // Use plain URI (backward compatibility - not recommended)
    console.warn('⚠️  Using unencrypted MONGODB_URI2. Please migrate to ENCRYPTED_MONGODB_URI2 for better security.');
    uri = process.env.MONGODB_URI2;
  }

  const mongoClient = new MongoClient(uri, options);
  return mongoClient.connect();
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise2) {
    global._mongoClientPromise2 = getMongoClient();
  }
  clientPromise = global._mongoClientPromise2;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = getMongoClient();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
