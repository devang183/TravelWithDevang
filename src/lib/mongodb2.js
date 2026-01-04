// lib/mongodb2.js - MongoDB connection utility for hello2 database
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI2 || 'mongodb+srv://kankariadevang1_db_user:tfe5ezDbtdhgpcoN@devangdb2.kj1tmbj.mongodb.net/';
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Add MONGODB_URI2 to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise2) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise2 = client.connect();
  }
  clientPromise = global._mongoClientPromise2;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
